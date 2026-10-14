#!/usr/bin/env python3
"""Candidate: append a Supabase-origin recovery point to the EXISTING Drive CAS.

Never writes CURRENT, HISTORY_FULL, Cloud Run, Scheduler, or production SQL.
No new schedule. --selftest is offline; --dry-run inventories only.
Commit is fail-closed behind explicit live-source, budget and recovery checks.
"""
import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
from pathlib import Path
import tempfile
import subprocess

from cr_history_cas_append import (
    SEED, DRIVE_ROOT, CAS_ROOT, HISTORY_FULL, MANIFESTS, OBJECTS,
    blob_key, plan, validate_saved_manifest,
    fetch_inventory, cas_inventory, lsjson, quota_guard, remote_bytes
)

S3 = "construrei-s3:"
PROJECT = "yspuaamokjbrosytqjpg"
SAFE_RUN = re.compile(r"^\d{8}-\d{6}$")
SAFE_MD5 = re.compile(r"^[a-f0-9]{32}$")
SAFE_PATH = re.compile(r"^(?!/)(?!.*(?:^|/)\.\.?/)[^\x00-\x1f\\]+$")
SQL_FILES = ("roles.sql", "schema.sql", "data.sql")
RESERVE_BYTES = 1 << 30

def clean_path(path):
    if (not isinstance(path, str) or not path or len(path) > 1024
            or path.startswith("/") or "\\" in path
            or any(x in (".", "..", "") for x in path.split("/"))
            or any(ord(x) < 32 for x in path)):
        raise ValueError("Unsafe or ambiguous remote path")
    return path

def inventory(storage_rows, local_files=None):
    """Create virtual CAS paths without downloading Storage content."""
    found = {}
    for row in storage_rows:
        if not isinstance(row, dict):
            raise ValueError("Malformed S3 inventory")
        path = clean_path(row.get("Path"))
        size = row.get("Size")
        hashes = row.get("Hashes") or {}
        md5 = next((str(v).lower() for k,v in hashes.items()
                    if k.lower() == "md5" and v), None)
        if (type(size) is not int or size < 0 or
                not md5 or not SAFE_MD5.fullmatch(md5)):
            raise ValueError("Unknown S3 MD5: block unsafe incremental backup")
        key = "06_STORAGE/" + path
        if key in found:
            raise ValueError("Duplicate source path")
        found[key] = (size, md5)
    if not found:
        raise ValueError("No Storage objects; refuse incomplete backup")
    if local_files is not None:
        for name, path in local_files.items():
            key = ("03_DATABASE/" + name) if name in SQL_FILES else name
            if key in found or name not in (*SQL_FILES,"BACKUP_STATUS.txt","SHA256SUMS.txt"):
                raise ValueError("Unexpected local manifest file")
            p = Path(path)
            size = p.stat().st_size
            if size <= 0 or size > (1 << 30):
                raise ValueError("Invalid local SQL/manifest file size")
            h = hashlib.md5()
            with p.open("rb") as f:
                for block in iter(lambda:f.read(1 << 20),b""):
                    h.update(block)
            found[key] = (size,h.hexdigest())
        if {k for k in found if not k.startswith("06_STORAGE/")} != {
            "03_DATABASE/roles.sql","03_DATABASE/schema.sql","03_DATABASE/data.sql",
            "BACKUP_STATUS.txt","SHA256SUMS.txt"
        }:
            raise ValueError("Local recovery inventory not complete")
    return found

def assemble_local_metadata(work, run_id, storage_count):
    """Use actual SQL dumps, not a second full Storage copy."""
    if not SAFE_RUN.fullmatch(run_id):
        raise ValueError("Invalid run ID")
    root=Path(work)
    db=root/"03_DATABASE"
    if any(not (db/f).is_file() or (db/f).stat().st_size==0 for f in SQL_FILES):
        raise ValueError("Missing SQL backup files")
    digest=[]
    for f in sorted(SQL_FILES):
        digest.append(hashlib.sha256((db/f).read_bytes()).hexdigest()+"  03_DATABASE/"+f)
    (root/"SHA256SUMS.txt").write_text("\n".join(digest)+"\n",encoding="utf-8")
    iso=dt.datetime.strptime(run_id,"%Y%m%d-%H%M%S").replace(
        tzinfo=dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    (root/"BACKUP_STATUS.txt").write_text(
        "CONSTRU-REI CLOUD BACKUP\nUTC: "+iso+"\nRUN_ID: "+run_id+
        "\nDATABASE_FILES: 3\nSTORAGE_FILES: "+str(storage_count)+
        "\nSOURCE_PROJECT: "+PROJECT+"\n",encoding="utf-8")
    return {name:str((db/name if name in SQL_FILES else root/name))
            for name in (*SQL_FILES,"BACKUP_STATUS.txt","SHA256SUMS.txt")}

def estimate(storage, seed, existing, local_files=None):
    source=inventory(storage,local_files)
    entries,missing=plan(source,seed,existing)
    unique_bytes=sum(size for _path,size,_digest in missing.values())
    unchanged=sum(e["store"]=="seed" for e in entries)
    reused=sum(e["store"]=="cas" for e in entries)-len(missing)
    return source,entries,missing,{
        "source_files":len(source),
        "seed_references":unchanged,
        "reused_cas_references":reused,
        "new_cas_objects":len(missing),
        "projected_new_unique_bytes":unique_bytes,
        "storage_downloaded_bytes":0,
        "writes_performed":False,
    }

def status_is_fresh(text, date):
    if not text.startswith("CONSTRU-REI CLOUD BACKUP\n"):
        raise ValueError("Untrusted CURRENT status")
    run=re.search(r"^RUN_ID: (\d{8}-\d{6})$",text,re.M)
    src=re.search(r"^SOURCE_PROJECT: (\S+)$",text,re.M)
    if not run or not src or src.group(1)!=PROJECT:
        raise ValueError("Untrusted CURRENT source")
    stamp=dt.datetime.strptime(run.group(1),"%Y%m%d-%H%M%S").date()
    return stamp>=date

def selftest():
    a="a"*32;b="b"*32;c="c"*32
    seed={"06_STORAGE/same":(11,a),"06_STORAGE/old":(20,a),
          "06_STORAGE/changed":(30,a)}
    storage=[{"Path":"same","Size":11,"Hashes":{"MD5":a}},
             {"Path":"changed","Size":30,"Hashes":{"MD5":b}},
             {"Path":"new","Size":5,"Hashes":{"MD5":c}}]
    src,ent,missing,report=estimate(storage,seed,{})
    assert len(src)==3 and len(ent)==3 and len(missing)==2
    assert report["seed_references"]==1 and report["new_cas_objects"]==2
    assert report["projected_new_unique_bytes"]==35
    assert "06_STORAGE/old" not in src # Deleted object remains only in historical seed.
    k=blob_key(30,b)
    assert len(estimate(storage,seed,{k:(30,b)})[2])==1
    assert status_is_fresh("CONSTRU-REI CLOUD BACKUP\nRUN_ID: 20261013-060000\nSOURCE_PROJECT: "+
            PROJECT+"\n",dt.date(2026,10,13))
    for malformed in ([{"Path":"../x","Size":1,"Hashes":{"MD5":a}}],
                      [{"Path":"x","Size":1,"Hashes":{}}],
                      [{"Path":"x","Size":1,"Hashes":{"MD5":"short"}}],
                      storage+[storage[0]]):
        try: inventory(malformed)
        except ValueError: pass
        else: raise AssertionError("Unsafe inventory accepted")
    import inspect
    body=inspect.getsource(main)
    assert body.index('Cloud origin grace period') < body.index(
        'copyto(original,OBJECTS'), "No Cloud grace gate before CAS writes"
    assert body.index('Storage recovery sample differs') < body.index(
        'copyto(str(saved),MANIFESTS'), "False success marker before restore proof"
    print(json.dumps({"test":"CR_COFRE_DIRECT_CAS_FALLBACK","status":"PASS",
                      "synthetic_cases":11,"real_backup":False,"writes":0}))

def main():
    ap=argparse.ArgumentParser()
    g=ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--selftest",action="store_true")
    g.add_argument("--dry-run",action="store_true")
    g.add_argument("--commit",action="store_true")
    ap.add_argument("--work-dir")
    ap.add_argument("--run-id")
    ap.add_argument("--max-new-bytes",type=int,default=536870912)
    args=ap.parse_args()
    if args.selftest:
        selftest();return
    from cr_history_delta_feasibility import command
    today=dt.datetime.now(dt.timezone.utc).date()
    # Existing primary complete today -> no fallback; existing CAS archiver owns it.
    current=command("rclone","cat",DRIVE_ROOT+"/CURRENT/BACKUP_STATUS.txt")
    if status_is_fresh(current,today):
        print(json.dumps({"decision":"SKIP_FRESH_PRIMARY","writes":0}));return
    rows=lsjson(S3)
    seed=fetch_inventory(SEED)
    existing,_=cas_inventory()
    local=None
    if args.work_dir:
        if not args.run_id:
            raise ValueError("Run ID required when SQL dumps are provided")
        local=assemble_local_metadata(args.work_dir,args.run_id,len(rows))
    if args.commit and (not local or not args.run_id or
                        args.run_id[:8] != today.strftime("%Y%m%d")):
        raise ValueError("Commit requires a complete same-day SQL snapshot")
    # GCP's original 06:00 UTC producer has two hours to finish.
    # A read-only test may run earlier; a real fallback may not.
    if args.commit and dt.datetime.now(dt.timezone.utc).hour < 8:
        raise ValueError("Cloud origin grace period: no writes before 08:00 UTC")
    source,entries,missing,summary=estimate(rows,seed,existing,local)
    projected=summary["projected_new_unique_bytes"]
    if (projected>args.max_new_bytes or
        summary["source_files"] < 4531 or
        args.max_new_bytes <= 0):
        raise ValueError("Hard quota or source-coverage guard blocked")
    # Exact immutable manifest, compatible with existing CR-CAS-1 archive validator.
    manifest={"format":"CR-CAS-1", "run_id":args.run_id,
              "source_project":PROJECT, "immutable_seed_id":"20261011-060021",
              "entry_count":len(entries),
              "cas_entry_count":sum(e["store"]=="cas" for e in entries),
              "entries":entries} if local else None
    payload=(json.dumps(manifest,sort_keys=True,separators=(",",":"),
                        ensure_ascii=False)+"\n").encode("utf-8") if local else b""
    manifest_allowance=len(payload) if manifest else max(2 << 20,len(entries)*280)
    total_added=projected+manifest_allowance
    quota_guard(total_added,remote_bytes(CAS_ROOT) if existing else 0,
                remote_bytes(HISTORY_FULL))
    if not args.commit:
        print(json.dumps({**summary,"decision":"DRY_RUN_ONLY",
                          "database_snapshot_created":bool(local),
                          "target":"EXISTING_CAS_ONLY",
                          "source_current_unchanged":True},
                         sort_keys=True))
        return
    # Do not overwrite CURRENT or change scheduled cloud backup; CAS is additive.
    # Recheck primary and source before every external write.
    if status_is_fresh(command("rclone","cat",
            DRIVE_ROOT+"/CURRENT/BACKUP_STATUS.txt"),today):
        raise ValueError("Primary recovered while preparing fallback")
    check_rows=lsjson(S3)
    if inventory(check_rows)!=inventory(rows):
        raise ValueError("Storage source changed during preflight")
    present={p for p in command("rclone","lsf",MANIFESTS,"--files-only").splitlines()}
    if args.run_id+".json" in present:
        raise ValueError("Already archived RUN_ID; refuse overwrite")
    from cr_history_cas_append import parse_cas_inventory, copyto
    # CAS keys are content hashes; identical existing seed/CAS objects are reused.
    for key,(src_path,size,md5) in sorted(missing.items()):
        if src_path.startswith("06_STORAGE/"):
            original=S3+src_path.removeprefix("06_STORAGE/")
        else:
            if src_path.startswith("03_DATABASE/"):
                name=src_path.removeprefix("03_DATABASE/")
            else:
                name=src_path
            if name not in local:
                raise ValueError("Unexpected local source path")
            original=local[name]
        copyto(original,OBJECTS+"/"+key)
    checked=parse_cas_inventory(lsjson(OBJECTS))
    for e in entries:
        if e["store"]=="cas" and checked.get(e["key"])!=(e["bytes"],e["md5"]):
            raise ValueError("CAS object absent or corrupt after upload")
    if inventory(lsjson(S3))!=inventory(rows):
        raise ValueError("Storage changed before immutable manifest commit")
    if status_is_fresh(command("rclone","cat",
            DRIVE_ROOT+"/CURRENT/BACKUP_STATUS.txt"),today):
        raise ValueError("Primary recovered before manifest")
    with tempfile.TemporaryDirectory() as tmp:
        by_name={x["path"]:x for x in entries}
        for name in SQL_FILES:
            item=by_name["03_DATABASE/"+name]
            base=(SEED if item["store"]=="seed" else OBJECTS)
            saved_sql=Path(tmp)/name
            command("rclone","copyto",base+"/"+item["key"],str(saved_sql))
            if hashlib.sha256(saved_sql.read_bytes()).digest()!=hashlib.sha256(
                    Path(local[name]).read_bytes()).digest():
                raise ValueError("SQL readback differs")
        sample=sorted((e for e in entries if e["path"].startswith("06_STORAGE/")),
                      key=lambda e:e["bytes"])[:3]
        if len(sample)!=3:
            raise ValueError("Insufficient Storage recovery sample")
        for ix,item in enumerate(sample):
            base=SEED if item["store"]=="seed" else OBJECTS
            sample_file=Path(tmp)/("sample-"+str(ix))
            command("rclone","copyto",base+"/"+item["key"],str(sample_file))
            h=hashlib.md5(sample_file.read_bytes()).hexdigest()
            if h!=item["md5"]:
                raise ValueError("Storage recovery sample differs")
        # LAST step: publish immutable manifest only after every readback passes.
        # An interrupted execution leaves unreferenced content, never a false
        # complete recovery point.
        saved=Path(tmp)/"manifest.json"
        saved.write_bytes(payload)
        copyto(str(saved),MANIFESTS+"/"+args.run_id+".json")
        remote=command("rclone","cat",MANIFESTS+"/"+args.run_id+".json")
        if remote.encode("utf-8")!=payload:
            raise ValueError("Immutable manifest failed readback")
        proof=validate_saved_manifest(manifest,seed,checked)
        if proof["verified_entries"]!=len(entries):
            raise ValueError("Some backup references do not resolve")
    print(json.dumps({"decision":"IMMUTABLE_CAS_FALLBACK_COMMITTED",
                      "run_id":args.run_id,"restored_sql_samples":3,
                      "restored_storage_samples":3,
                      "source_files":len(entries),"new_objects":len(missing),
                      "new_unique_bytes":projected,
                      "current_untouched":True,"full_copy_created":False,
                      "database_replay_proven":False},sort_keys=True))

if __name__=="__main__":
    try:main()
    except Exception as exc:
        print("CAS_FALLBACK_ABORTED: "+type(exc).__name__,file=sys.stderr)
        raise SystemExit(2) from None
