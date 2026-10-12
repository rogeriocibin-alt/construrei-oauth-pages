#!/usr/bin/env python3
"""Append-only deduplicated daily history for CONSTRU-REI.

Full seed remains immutable. Subsequent manifests reference that seed or immutable
content-addressed Drive objects. Does NOT delete, sync, alter CURRENT, expose
identifiers in logs, deploy any application or access production databases.
Production cutover requires an isolated readback/recovery gate.
"""
import argparse
import hashlib
import filecmp
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path

from cr_history_delta_feasibility import SOURCE, SEED, fetch_inventory, command, evaluate

DRIVE_ROOT = "construrei-drive:CONSTRUREI-BACKUP-AUTO"
CAS_ROOT = DRIVE_ROOT + "/HISTORY_CAS"
OBJECTS = CAS_ROOT + "/OBJECTS"
MANIFESTS = CAS_ROOT + "/MANIFESTS"
HISTORY_FULL = DRIVE_ROOT + "/HISTORY_FULL"
GIB = 1024 ** 3
HISTORY_MAX = 15 * GIB
RESERVE_FREE = 1 * GIB
PATH_RX = re.compile(r"^[0-9a-f]{2}/[0-9a-f]{32}-[0-9]+$")
RUN_RX = re.compile(r"^RUN_ID: (\d{8}-\d{6})$", re.M)
UTC_RX = re.compile(r"^UTC: (\d{4}-\d{2}-\d{2}T)", re.M)


def blob_key(size, md5):
    assert type(size) is int and size >= 0
    assert isinstance(md5, str) and re.fullmatch(r"[0-9a-f]{32}", md5)
    return md5[:2] + "/" + md5 + "-" + str(size)


def lsjson(remote):
    value = json.loads(command("rclone", "lsjson", remote,
                               "--recursive", "--files-only", "--hash"))
    if not isinstance(value, list):
        raise ValueError("Malformed remote JSON inventory")
    return value


def parse_cas_inventory(rows):
    found = {}
    for row in rows:
        path, size = row.get("Path"), row.get("Size")
        hashes = row.get("Hashes") or {}
        md5 = next((v for k, v in hashes.items() if k.lower() == "md5"), None)
        if not isinstance(path, str) or not PATH_RX.fullmatch(path):
            raise ValueError("Unknown CAS object identity")
        if type(size) is not int or size < 0 or not isinstance(md5, str):
            raise ValueError("Malformed CAS object metadata")
        expected = blob_key(size, md5.lower())
        if expected != path or path in found:
            raise ValueError("CAS key mismatch or duplicate")
        found[path] = (size, md5.lower())
    return found


def existing_children(remote):
    return set(command("rclone", "lsf", remote, "--dirs-only").splitlines())


def cas_inventory():
    if "HISTORY_CAS/" not in existing_children(DRIVE_ROOT):
        return {}, False
    if "OBJECTS/" not in existing_children(CAS_ROOT):
        return {}, True
    return parse_cas_inventory(lsjson(OBJECTS)), True


def inventory_manifest_files():
    if "HISTORY_CAS/" not in existing_children(DRIVE_ROOT):
        return set()
    if "MANIFESTS/" not in existing_children(CAS_ROOT):
        return set()
    return set(command("rclone", "lsf", MANIFESTS, "--files-only").splitlines())


def plan(source, seed, existing):
    if not source or not seed:
        raise ValueError("Incomplete snapshot catalogs")
    entries = []
    required_cas = {}
    for path, (size, md5) in sorted(source.items()):
        if md5 is None:
            raise ValueError("Missing source MD5: refuse unsafe dedup")
        if seed.get(path) == (size, md5):
            entries.append({"path": path, "store": "seed", "key": path,
                            "bytes": size, "md5": md5})
        else:
            key = blob_key(size, md5)
            entries.append({"path": path, "store": "cas", "key": key,
                            "bytes": size, "md5": md5})
            if key in existing and existing[key] != (size, md5):
                raise ValueError("Existing CAS object failed immutable integrity")
            if key not in existing:
                required_cas[key] = (path, size, md5)
    return entries, required_cas


def quota_guard(new_bytes, existing_cas, existing_full):
    quota = json.loads(command("rclone", "about", "construrei-drive:", "--json"))
    free = quota.get("free")
    if type(free) is not int or free < new_bytes + RESERVE_FREE:
        raise ValueError("Drive free capacity inadequate or unknown")
    if existing_full + existing_cas + new_bytes > HISTORY_MAX:
        raise ValueError("Combined immutable history limit exceeded")
    return free


def remote_bytes(remote):
    meta = json.loads(command("rclone", "size", remote, "--json"))
    total = meta.get("bytes")
    if type(total) is not int or total < 0:
        raise ValueError("Unknown remote size")
    return total


def read_source_status():
    data = command("rclone", "cat", SOURCE + "/BACKUP_STATUS.txt")
    if "CONSTRU-REI CLOUD BACKUP" not in data or "SOURCE_PROJECT: yspuaamokjbrosytqjpg" not in data:
        raise ValueError("Unrecognized source backup")
    run = RUN_RX.search(data)
    stamp = UTC_RX.search(data)
    if not run or not stamp or run.group(1)[:8] != stamp.group(1).replace("-", "")[:8]:
        raise ValueError("Backup run ID and UTC mismatch")
    files = re.search(r"^DATABASE_FILES: (\d+)$", data, re.M)
    storage = re.search(r"^STORAGE_FILES: (\d+)$", data, re.M)
    if not files or int(files.group(1)) != 3 or not storage or int(storage.group(1)) <= 0:
        raise ValueError("Invalid backup inventory counts")
    return run.group(1), data


def locate(entry):
    remote = SEED if entry["store"] == "seed" else OBJECTS
    return remote + "/" + entry["key"]


def copyto(from_remote, to_remote):
    command("rclone", "copyto", from_remote, to_remote, "--immutable", "--retries", "3")


def materialize_recovery_sample(entries, target):
    by_path = {e["path"]: e for e in entries}
    for path in ("03_DATABASE/data.sql", "03_DATABASE/schema.sql",
                 "03_DATABASE/roles.sql", "BACKUP_STATUS.txt", "SHA256SUMS.txt"):
        if path not in by_path:
            raise ValueError("SQL recovery material missing")
        dest = Path(target) / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        command("rclone", "copyto", locate(by_path[path]), str(dest))
    samples = [x for x in entries if x["path"].startswith("06_STORAGE/")][:3]
    if len(samples) < 3:
        raise ValueError("Storage recovery samples absent")
    for idx, item in enumerate(samples):
        target_path = Path(target) / ("archive-object-" + str(idx))
        current_path = Path(target) / ("current-object-" + str(idx))
        command("rclone", "copyto", locate(item), str(target_path))
        command("rclone", "copyto", SOURCE + "/" + item["path"], str(current_path))
        if not filecmp.cmp(str(target_path), str(current_path), shallow=False):
            raise ValueError("Storage readback sample differs")
    # Preflight scripts separately validate all three SQL SHA256, structure/COPY headers.
    return 3


def execute(mode, restore=None):
    run_id, status = read_source_status()
    src = fetch_inventory(SOURCE)
    seed = fetch_inventory(SEED)
    if src["BACKUP_STATUS.txt"][0] != len(status.encode("utf-8")):
        raise ValueError("Backup status size differs from source inventory")
    cas, _ = cas_inventory()
    entries, missing = plan(src, seed, cas)
    full = remote_bytes(HISTORY_FULL)
    previous_cas = remote_bytes(CAS_ROOT) if "HISTORY_CAS/" in existing_children(DRIVE_ROOT) else 0
    addition = sum(size for _, size, _ in missing.values())
    free = quota_guard(addition, previous_cas, full)
    report = evaluate(src, seed)
    report.update({
        "run_id": run_id, "new_object_count": len(missing),
        "estimated_new_object_bytes": addition,
        "drive_free_bytes": free,
        "historic_full_bytes": full,
        "historic_cas_bytes": previous_cas,
        "mode": mode, "approved_for_cutover": False,
    })
    if mode == "dry-run":
        return report
    # --commit is append-only, and must only be invoked by a controlled workflow.
    if restore is None:
        raise ValueError("Recovery directory mandatory for commit")
    if not re.fullmatch(r"\d{8}-\d{6}", run_id):
        raise ValueError("Unsafe manifest ID")
    from datetime import datetime, timezone
    if run_id[:8] != datetime.now(timezone.utc).strftime("%Y%m%d"):
        raise ValueError("Stale source snapshot; no archive written")

    manifest = {
        "format": "CR-CAS-1", "run_id": run_id, "source_project": "yspuaamokjbrosytqjpg",
        "immutable_seed_id": "20261011-060021",
        "entry_count": len(entries), "cas_entry_count": sum(e["store"] == "cas" for e in entries), "entries": entries,
    }
    manifest_bytes = (json.dumps(manifest, sort_keys=True,
                                 separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")
    present_manifests = inventory_manifest_files()
    if run_id + ".json" in present_manifests:
        for e in entries:
            if e["store"] == "cas" and cas.get(e["key"]) != (e["bytes"], e["md5"]):
                raise ValueError("Existing manifest CAS reference missing or corrupt")
        remote_bytes_data = command("rclone", "cat", MANIFESTS + "/" + run_id + ".json").encode("utf-8")
        if remote_bytes_data != manifest_bytes:
            raise ValueError("Immutable daily manifest exists but has different content")
    else:
        # Copy only unique changed content; verified by Drive MD5/size after transfer.
        for key, (path, _, _) in sorted(missing.items()):
            copyto(SOURCE + "/" + path, OBJECTS + "/" + key)
        actual = parse_cas_inventory(lsjson(OBJECTS)) if missing else cas
        for e in entries:
            if e["store"] == "cas" and actual.get(e["key"]) != (e["bytes"], e["md5"]):
                raise ValueError("CAS object missing or failed MD5 readback")
        if fetch_inventory(SOURCE) != src or read_source_status()[1] != status:
            raise ValueError("CURRENT changed during archive: manifest not saved")
        with tempfile.TemporaryDirectory() as folder:
            temp = Path(folder) / "manifest.json"
            temp.write_bytes(manifest_bytes)
            copyto(str(temp), MANIFESTS + "/" + run_id + ".json")
        compare = command("rclone", "cat", MANIFESTS + "/" + run_id + ".json").encode("utf-8")
        if compare != manifest_bytes:
            raise ValueError("Archive manifest failed readback")
    recovered = materialize_recovery_sample(entries, restore)
    report.update({"manifest_sha256": hashlib.sha256(manifest_bytes).hexdigest(),
                   "readback_sql": recovered, "readback_storage": 3,
                   "append_only": True, "snapshot_complete": True})
    return report


def selftest():
    src = {"BACKUP_STATUS.txt": (20, "0"*32), "SHA256SUMS.txt": (30, "1"*32),
           "03_DATABASE/data.sql": (100, "2"*32),
           "03_DATABASE/schema.sql": (50, "3"*32),
           "03_DATABASE/roles.sql": (50, "4"*32),
           "06_STORAGE/a": (500, "5"*32)}
    seed = dict(src)
    seed["03_DATABASE/data.sql"] = (90, "6"*32)
    seed.pop("06_STORAGE/a")
    entries, needed = plan(src, seed, {})
    assert len(entries) == 6 and len(needed) == 2
    assert sum(x[1] for x in needed.values()) == 600
    k = blob_key(100, "2"*32)
    assert len(plan(src, seed, {k: (100, "2"*32)})[1]) == 1
    try:
        plan(src, seed, {k: (99, "2"*32)})
        raise AssertionError("Tampered CAS accepted")
    except ValueError:
        pass
    try:
        plan({"x": (1, None)}, seed, {})
        raise AssertionError("Missing MD5 accepted")
    except ValueError:
        pass
    assert len([e for e in entries if e["store"] == "cas"]) == 2
    print("PASS: immutable CAS plan, corruption and missing-hash fixtures; no network")


def main():
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--selftest", action="store_true")
    group.add_argument("--dry-run", action="store_true")
    group.add_argument("--commit", action="store_true")
    parser.add_argument("--restore-directory")
    args = parser.parse_args()
    if args.selftest:
        selftest()
        return
    mode = "commit" if args.commit else "dry-run"
    # Never print paths, names of client data, raw manifest, or user content.
    result = execute(mode, restore=args.restore_directory)
    print(json.dumps({k: v for k, v in result.items() if k != "source_project"}, sort_keys=True))


if __name__ == "__main__":
    main()
