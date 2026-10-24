#!/usr/bin/env python3
"""Read-only disaster recovery proof for the single existing Trello text CAS.

Rebuild the manifest's logical Trello records in an ephemeral directory from
immutable Drive objects. No Trello API, tokens, writes to production or new cron.
Never print recovered financial/card content or credentials.
"""
import argparse
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = "construrei-drive:CONSTRUREI-BACKUP-AUTO/HISTORY_CAS/TRELLO_TEXT"
OBJECTS = ROOT + "/OBJECTS"
MANIFESTS = ROOT + "/MANIFESTS"
ID = re.compile(r"[0-9a-f]{24}")
OBJECT = re.compile(r"[a-f0-9]{64}\.json\.gz")
MNAME = re.compile(r"\d{8}-\d{6}-\d+\.json")
TYPES = {"board", "card", "list", "label", "custom_field", "action"}


def rclone(*args, timeout=240):
    process = subprocess.run(["rclone", *args], stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE, check=True, timeout=timeout)
    return process.stdout


def stage_immutable_objects(manifest, root):
    """Fetch only manifest-listed CAS objects in one bounded, parallel rclone pass.

    The previous verifier ran 986 sequential Drive subprocesses and exceeded
    the 45-minute proof job. Stage to ephemeral disk, then independently hash,
    inflate and count every record with checked_restore (fail closed).
    """
    shards = manifest.get("shards")
    if (manifest.get("format") != "CONSTRUREI_TRELLO_TEXT_CAS_V1"
            or manifest.get("complete") is not True
            or manifest.get("binary_attachments") is not False
            or not isinstance(shards, dict)
            or not 13 <= len(shards) <= 2000):
        raise ValueError("Invalid or incomplete manifest for staging")
    keys = set()
    for ref in shards.values():
        if not isinstance(ref, dict):
            raise ValueError("Invalid object reference")
        key = ref.get("object")
        if (not isinstance(key, str) or not OBJECT.fullmatch(key)
                or ref.get("sha256") != key[:64]
                or not isinstance(ref.get("bytes"), int)
                or not 1 <= ref["bytes"] <= 50_000_000):
            raise ValueError("Unsafe object reference for staging")
        keys.add(key)
    requested = root / "requested-objects.txt"
    requested.write_text("\n".join(sorted(keys)) + "\n", encoding="ascii")
    objects = root / "objects"
    objects.mkdir()
    rclone("copy", OBJECTS, str(objects),
           "--files-from", str(requested),
           "--transfers", "16", "--checkers", "16",
           "--retries", "3", "--low-level-retries", "5",
           "--timeout", "2m", timeout=1800)
    present = {p.name for p in objects.iterdir() if p.is_file()}
    if present != keys:
        raise ValueError("Immutable object inventory incomplete after transfer")
    return objects


def checked_restore(manifest, get_object, dest):
    if not isinstance(manifest, dict) or manifest.get("format") != "CONSTRUREI_TRELLO_TEXT_CAS_V1":
        raise ValueError("Unknown Trello recovery manifest")
    if manifest.get("complete") is not True or manifest.get("binary_attachments") is not False:
        raise ValueError("Snapshot incomplete or unexpected binary payload")
    shards = manifest.get("shards")
    expected = manifest.get("counts")
    if not isinstance(shards, dict) or not isinstance(expected, dict) or not 13 <= len(shards) <= 2000:
        raise ValueError("Invalid or unbounded shard manifest")
    if manifest.get("board_count", 0) < 13:
        raise ValueError("Board inventory incomplete")
    counts = {kind: 0 for kind in TYPES}
    board_ids = set()
    identities = set()
    recovered_bytes = 0
    for name, ref in sorted(shards.items()):
        parts = name.split("/")
        if len(parts) != 3 or not ID.fullmatch(parts[0]) or parts[1] not in TYPES:
            raise ValueError("Unsafe shard identity")
        if parts[1] == "action":
            if not re.fullmatch(r"\d{4}-\d{2}", parts[2]):
                raise ValueError("Invalid action partition")
        elif parts[1] == "card":
            if not re.fullmatch(r"[0-9a-f]{5}", parts[2]):
                raise ValueError("Invalid card partition")
        elif parts[2] != "all":
            raise ValueError("Unexpected partition")
        if not isinstance(ref, dict) or not OBJECT.fullmatch(str(ref.get("object", ""))):
            raise ValueError("Unsafe CAS object reference")
        key = ref["object"]
        if ref.get("sha256") != key[:64] or not isinstance(ref.get("bytes"), int):
            raise ValueError("Object reference hash/length mismatch")
        if ref["bytes"] < 1 or ref["bytes"] > 50_000_000:
            raise ValueError("Object exceeds recovery bounds")
        body = get_object(key)
        if len(body) != ref["bytes"] or hashlib.sha256(body).hexdigest() != key[:64]:
            raise ValueError("CAS readback checksum mismatch")
        with gzip.GzipFile(fileobj=__import__("io").BytesIO(body)) as f:
            plain = f.read(250_000_001)
        if len(plain) > 250_000_000:
            raise ValueError("Inflated shard exceeds recovery bounds")
        rows = json.loads(plain)
        if not isinstance(rows, list):
            raise ValueError("Recovered shard is not a JSON array")
        for row in rows:
            rid = row.get("id") if isinstance(row, dict) else None
            if not isinstance(rid, str) or not ID.fullmatch(rid):
                raise ValueError("Invalid recovered Trello ID")
            identity = (parts[0], parts[1], rid)
            if identity in identities:
                raise ValueError("Duplicated Trello record across shards")
            identities.add(identity)
            if parts[1] == "card" and rid[:5] != parts[2]:
                raise ValueError("Card in wrong partition")
            if parts[1] == "action" and str(row.get("date", ""))[:7] != parts[2]:
                raise ValueError("Action in wrong monthly partition")
            if parts[1] == "board" and rid != parts[0]:
                raise ValueError("Board ID inconsistency")
        if parts[1] == "board":
            board_ids.add(parts[0])
        counts[parts[1]] += len(rows)
        path = dest.joinpath(*parts[:2], parts[2] + ".json")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(plain)
        recovered_bytes += len(plain)
    if len(board_ids) != manifest["board_count"] or counts["card"] < 1500:
        raise ValueError("Insufficient recovered board/card coverage")
    if any(counts[k] != expected.get(k, 0) for k in TYPES):
        raise ValueError("Recovered Trello counts diverge from signed manifest")
    return {"recovery": "PASS", "boards": len(board_ids), "counts": counts,
            "shards": len(shards), "recovered_bytes": recovered_bytes,
            "production_mutated": False, "attachment_binaries_restored": False}


def selftest():
    import io
    shards, objects = {}, {}
    counts = {kind: 0 for kind in TYPES}
    for i in range(13):
        bid = f"{i+1:024x}"
        sections = {
            (bid, "board", "all"): [{"id": bid}],
            (bid, "card", f"{i*2000+100:024x}"[:5]): [
                {"id": f"{i*2000+100+j:024x}", "desc": "synthetic"} for j in range(116)],
            (bid, "action", "2026-10"): [
                {"id": f"{500000+i:024x}", "date": "2026-10-23T12:00:00Z"}],
        }
        for (board, kind, partition), rows in sections.items():
            # Card prefix can cross a boundary; synthetic IDs below stay in
            # their single partition for these test quantities.
            raw = (json.dumps(rows, sort_keys=True, separators=(",", ":")) + "\n").encode()
            buff = io.BytesIO()
            with gzip.GzipFile(fileobj=buff, mode="wb", filename="", mtime=0) as f:
                f.write(raw)
            payload = buff.getvalue()
            digest = hashlib.sha256(payload).hexdigest()
            objects[digest + ".json.gz"] = payload
            shards["/".join((board, kind, partition))] = {
                "object": digest + ".json.gz", "sha256": digest, "bytes": len(payload)}
            counts[kind] += len(rows)
    manifest = {"format": "CONSTRUREI_TRELLO_TEXT_CAS_V1",
                "complete": True, "binary_attachments": False,
                "board_count": 13, "counts": counts, "shards": shards}
    with tempfile.TemporaryDirectory() as tmp:
        result = checked_restore(manifest, objects.__getitem__, Path(tmp))
        assert result["boards"] == 13 and result["counts"]["card"] == 1508
        key = next(iter(objects))
        original = objects[key]
        objects[key] = original + b"X"
        try:
            checked_restore(manifest, objects.__getitem__, Path(tmp))
        except ValueError:
            pass
        else:
            raise AssertionError("Corrupt object incorrectly accepted")
    return {"selftest": "PASS", "corruption_rejected": True, "data": "synthetic only"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--manifest", help="Exact immutable manifest basename")
    args = ap.parse_args()
    if args.selftest:
        print(json.dumps(selftest(), sort_keys=True))
        return
    manifest_name = args.manifest
    if not manifest_name:
        names = rclone("lsf", MANIFESTS, "--files-only").decode().splitlines()
        names = sorted(n for n in names if MNAME.fullmatch(n))
        if not names:
            raise RuntimeError("No signed Trello manifest; no recovery proved")
        manifest_name = names[-1]
    if not MNAME.fullmatch(manifest_name):
        raise ValueError("Unsafe manifest name")
    raw = rclone("cat", MANIFESTS + "/" + manifest_name)
    if len(raw) > 20_000_000:
        raise ValueError("Unbounded manifest")
    manifest = json.loads(raw)
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        objects = stage_immutable_objects(manifest, root)
        outcome = checked_restore(manifest, lambda key: (objects / key).read_bytes(),
                                  root / "recovered")
    print("TRELLO_CAS_RECOVERY_PASS " + json.dumps(outcome, sort_keys=True))


if __name__ == "__main__":
    main()
