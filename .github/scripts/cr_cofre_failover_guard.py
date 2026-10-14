#!/usr/bin/env python3
"""Fail-closed preflight for reusing the EXISTING GitHub Actions backup runner.

Read-only by design: this is not a scheduler, backup or cloud administration tool.
"""
import argparse
import datetime as dt
import json
import re

PROJECT = "yspuaamokjbrosytqjpg"
RESERVE_BYTES = 1024 ** 3
STATUS_RUN_RE = re.compile(r"^RUN_ID: (\d{8}-\d{6})$", re.M)
STATUS_PROJECT_RE = re.compile(r"^SOURCE_PROJECT: (\S+)$", re.M)
STATUS_DATABASE_RE = re.compile(r"^DATABASE_FILES: (\d+)$", re.M)
STATUS_STORAGE_RE = re.compile(r"^STORAGE_FILES: (\d+)$", re.M)

def assess(status: str, now: dt.datetime, cloud_state: str,
           drive_free_bytes: int, projected_new_bytes: int, max_new_bytes: int):
    if now.tzinfo is None or now.utcoffset() != dt.timedelta(0):
        raise ValueError("Pass timezone-aware UTC datetime")
    if not status.startswith("CONSTRU-REI CLOUD BACKUP\n"):
        return "BLOCK_UNKNOWN_CURRENT", "Missing canonical backup identity"
    matches = [STATUS_RUN_RE.search(status), STATUS_PROJECT_RE.search(status),
               STATUS_DATABASE_RE.search(status), STATUS_STORAGE_RE.search(status)]
    if not all(matches):
        return "BLOCK_UNKNOWN_CURRENT", "Incomplete canonical source marker"
    run, project, databases, storage = [x.group(1) for x in matches]
    if project != PROJECT or int(databases) != 3 or int(storage) < 3:
        return "BLOCK_UNKNOWN_CURRENT", "Unexpected backup project or inventory"
    try:
        stamp = dt.datetime.strptime(run, "%Y%m%d-%H%M%S").replace(tzinfo=dt.timezone.utc)
    except ValueError:
        return "BLOCK_UNKNOWN_CURRENT", "Malformed source run timestamp"
    if stamp > now:
        return "BLOCK_UNKNOWN_CURRENT", "Backup timestamp is in the future"
    if stamp.date() == now.date():
        return "SKIP_FRESH_SOURCE", "Cloud source already updated today"
    if now.hour < 8:
        return "BLOCK_GRACE", "Cloud origin 06:00 UTC needs at least two hours"
    if cloud_state != "disabled_verified":
        return "BLOCK_CLOUD_STATUS", "Cloud source not independently confirmed quiescent"
    if min(drive_free_bytes, projected_new_bytes, max_new_bytes) < 0:
        return "BLOCK_CAPACITY", "Missing or negative capacity information"
    if projected_new_bytes > max_new_bytes:
        return "BLOCK_CAPACITY", "Estimated unique writes exceed configured cap"
    if drive_free_bytes < projected_new_bytes + RESERVE_BYTES:
        return "BLOCK_CAPACITY", "Drive cannot preserve required free reserve"
    return "READY_FOR_EXISTING_RUNNER", "Preflight passed; actual backup and restore unproven"


# Metadata-only inventory comparison; never reads the bytes of user files.
# Input comes from rclone lsjson --recursive --files-only --hash for each remote.
def compact_inventory(rows):
    if not isinstance(rows, list):
        raise ValueError("Expected JSON inventory list")
    seen = {}
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("Malformed inventory row")
        path, size = row.get("Path"), row.get("Size")
        if (not isinstance(path, str) or not path or path.startswith("/")
                or "/../" in "/" + path + "/" or "\\" in path
                or type(size) is not int or size < 0 or path in seen):
            raise ValueError("Unsafe or duplicate inventory item")
        hashes = row.get("Hashes") or {}
        md5 = next((str(v).lower() for k,v in hashes.items()
                    if k.lower() == "md5" and v), None)
        if md5 is not None and not re.fullmatch(r"[0-9a-f]{32}", md5):
            raise ValueError("Malformed MD5 metadata")
        seen[path] = (size, md5)
    return seen

def estimate_storage_egress(source_rows, dest_rows):
    src = compact_inventory(source_rows)
    dest = compact_inventory(dest_rows)
    changed = []
    indeterminate = 0
    same = 0
    replaced_bytes = 0
    for path, (size, md5) in src.items():
        old = dest.get(path)
        # A missing MD5 MUST BLOCK execution: rclone --checksum may fall back
        # to size-only comparison and silently skip equal-size changes.
        if old and old == (size, md5) and md5 is not None:
            same += 1
            continue
        if not md5 or (old and not old[1]):
            indeterminate += 1
        changed.append(size)
        if old:
            replaced_bytes += old[0]
    removed = [item[0] for path, item in dest.items() if path not in src]
    return {"source_files": len(src), "destination_files": len(dest),
            "unchanged_files": same, "changed_or_unverified_files": len(changed),
            "missing_on_source_files": len(removed),
            "indeterminate_hash_files": indeterminate,
            "projected_storage_egress_bytes": sum(changed),
            "old_drive_bytes_requiring_historical_protection": replaced_bytes + sum(removed),
            "remote_data_downloaded": False, "backup_performed": False}

def strict_transfer_budget(plan, *, database_export_estimate_bytes,
                           max_egress_bytes, drive_free_bytes):
    """Fail closed before writing: include SQL export and Drive safety reserve."""
    if (not isinstance(plan, dict) or
        any(type(v) is not int or v < 0 for v in
            (database_export_estimate_bytes, max_egress_bytes, drive_free_bytes))):
        return "BLOCK_INVALID_BUDGET"
    if not plan.get("source_files") or not plan.get("destination_files"):
        return "BLOCK_INCOMPLETE_INVENTORY"
    if plan["indeterminate_hash_files"]:
        return "BLOCK_HASH_UNKNOWN"
    transfer = plan["projected_storage_egress_bytes"] + database_export_estimate_bytes
    if transfer > max_egress_bytes:
        return "BLOCK_EGRESS_CAP"
    needed = (plan["projected_storage_egress_bytes"]
              + database_export_estimate_bytes
              + plan["old_drive_bytes_requiring_historical_protection"]
              + RESERVE_BYTES)
    if needed > drive_free_bytes:
        return "BLOCK_DRIVE_CAP"
    return "READY_FOR_INDEPENDENT_ORIGIN_CHECK"

def estimate_from_files(src_path, dst_path):
    from pathlib import Path
    for path in (src_path, dst_path):
        if Path(path).stat().st_size > 30 * 1024 * 1024:
            raise ValueError("Inventory file exceeds safe size bound")
    with open(src_path, encoding="utf-8") as r:
        source = json.load(r)
    with open(dst_path, encoding="utf-8") as r:
        dest = json.load(r)
    return estimate_storage_egress(source, dest)

def estimate_selftest():
    a = "a" * 32
    b = "b" * 32
    src = [
        {"Path":"same","Size":10,"Hashes":{"MD5":a}},
        {"Path":"changed","Size":20,"Hashes":{"MD5":b}},
        {"Path":"new","Size":30,"Hashes":{"MD5":b}},
        {"Path":"unknown","Size":40,"Hashes":{}},
    ]
    dst = [
        {"Path":"same","Size":10,"Hashes":{"MD5":a}},
        {"Path":"changed","Size":20,"Hashes":{"MD5":a}},
        {"Path":"unknown","Size":40,"Hashes":{}},
    ]
    p = estimate_storage_egress(src, dst)
    assert p["projected_storage_egress_bytes"] == 90, p
    assert p["changed_or_unverified_files"] == 3
    assert p["indeterminate_hash_files"] == 1
    assert p["unchanged_files"] == 1
    assert p["missing_on_source_files"] == 0
    assert strict_transfer_budget(p, database_export_estimate_bytes=5,
                                 max_egress_bytes=1000, drive_free_bytes=2*RESERVE_BYTES) == "BLOCK_HASH_UNKNOWN"
    assert estimate_storage_egress(src[:1], dst[:1])["projected_storage_egress_bytes"] == 0
    clean = estimate_storage_egress(src[:3], dst[:2])
    assert clean["projected_storage_egress_bytes"] == 50
    assert clean["old_drive_bytes_requiring_historical_protection"] == 20
    assert strict_transfer_budget(clean, database_export_estimate_bytes=100,
                                 max_egress_bytes=140, drive_free_bytes=2*RESERVE_BYTES) == "BLOCK_EGRESS_CAP"
    assert strict_transfer_budget(clean, database_export_estimate_bytes=100,
                                 max_egress_bytes=150, drive_free_bytes=RESERVE_BYTES) == "BLOCK_DRIVE_CAP"
    assert strict_transfer_budget(clean, database_export_estimate_bytes=100,
                                 max_egress_bytes=150, drive_free_bytes=2*RESERVE_BYTES) == "READY_FOR_INDEPENDENT_ORIGIN_CHECK"
    deleted = estimate_storage_egress(src[:1], dst[:2])
    assert deleted["missing_on_source_files"] == 1 and deleted["old_drive_bytes_requiring_historical_protection"] == 20
    try:
        estimate_storage_egress(src+[src[0]], dst)
        raise AssertionError("Duplicate path accepted")
    except ValueError:
        pass
    try:
        estimate_storage_egress([{"Path":"../escape","Size":1}], [])
        raise AssertionError("Traversal accepted")
    except ValueError:
        pass
    print(json.dumps({"test":"CR_COFRE_DELTA_ESTIMATOR","status":"PASS",
                      "cases":11, "external_writes":0}))

def selftest():
    s = "CONSTRU-REI CLOUD BACKUP\nUTC: 2026-10-12T06:00:38Z\nRUN_ID: 20261012-060012\nDATABASE_FILES: 3\nSTORAGE_FILES: 4531\nSOURCE_PROJECT: " + PROJECT + "\n"
    now = dt.datetime(2026, 10, 13, 9, tzinfo=dt.timezone.utc)
    cap = (4 * 1024**3, 1024**2, 1024**3)
    cases = [
        (s, now, "unknown", cap, "BLOCK_CLOUD_STATUS"),
        (s, now, "disabled_verified", cap, "READY_FOR_EXISTING_RUNNER"),
        (s, now.replace(hour=7), "disabled_verified", cap, "BLOCK_GRACE"),
        (s.replace("20261012-060012", "20261013-060012"), now, "disabled_verified", cap, "SKIP_FRESH_SOURCE"),
        (s.replace(PROJECT, "wrong"), now, "disabled_verified", cap, "BLOCK_UNKNOWN_CURRENT"),
        (s, now, "disabled_verified", (1024**3, 1024**2, 1024**3), "BLOCK_CAPACITY"),
        (s, now, "disabled_verified", (4*1024**3, 2*1024**3, 1024**3), "BLOCK_CAPACITY"),
        (s, now, "running", cap, "BLOCK_CLOUD_STATUS"),
    ]
    for ix, (status, clock, origin, nums, expected) in enumerate(cases, 1):
        got = assess(status, clock, origin, *nums)[0]
        assert got == expected, (ix, got, expected)
    print(json.dumps({"test": "CR_COFRE_FAILOVER_PREFLIGHT", "status": "PASS",
                      "cases": len(cases), "external_writes": 0}))
    estimate_selftest()

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--selftest", action="store_true")
    p.add_argument("--estimate-only", action="store_true")
    p.add_argument("--source-inventory-json")
    p.add_argument("--destination-inventory-json")
    p.add_argument("--database-export-estimate-bytes", type=int, default=0)
    p.add_argument("--max-egress-bytes", type=int, default=0)
    p.add_argument("--status-file")
    p.add_argument("--cloud-state", choices=["unknown", "running", "disabled_verified"], default="unknown")
    p.add_argument("--drive-free-bytes", type=int)
    p.add_argument("--projected-new-bytes", type=int)
    p.add_argument("--max-new-bytes", type=int)
    a = p.parse_args()
    if a.selftest:
        selftest()
        return
    if a.estimate_only:
        if not a.source_inventory_json or not a.destination_inventory_json or a.drive_free_bytes is None:
            p.error("Inventories and Drive free bytes required for read-only estimate")
        try:
            plan = estimate_from_files(a.source_inventory_json, a.destination_inventory_json)
            result = strict_transfer_budget(
                plan, database_export_estimate_bytes=a.database_export_estimate_bytes,
                max_egress_bytes=a.max_egress_bytes, drive_free_bytes=a.drive_free_bytes)
            safe = {k: v for k, v in plan.items() if k not in ("remote_data_downloaded",)}
            print(json.dumps({"status": result, "summary": safe,
                "backup_performed": False, "secret_values_exposed": False,
                "origin_quiescence_proven": False}, sort_keys=True))
            if result != "READY_FOR_INDEPENDENT_ORIGIN_CHECK":
                raise SystemExit(2)
        except (OSError, ValueError, json.JSONDecodeError) as error:
            print(json.dumps({"status":"BLOCK_BAD_INVENTORY","error_type":type(error).__name__}))
            raise SystemExit(2)
        return
    if not a.status_file or any(v is None for v in (a.drive_free_bytes, a.projected_new_bytes, a.max_new_bytes)):
        p.error("Status file and all three capacity numbers are required")
    with open(a.status_file, encoding="utf-8") as f:
        source_status = f.read()
    result, reason = assess(source_status, dt.datetime.now(dt.timezone.utc),
                            a.cloud_state, a.drive_free_bytes, a.projected_new_bytes,
                            a.max_new_bytes)
    print(json.dumps({"preflight": result, "reason": reason, "backup_performed": False,
                      "new_infrastructure": False, "cost_authorization": False}, sort_keys=True))
    if result not in ("READY_FOR_EXISTING_RUNNER", "SKIP_FRESH_SOURCE"):
        raise SystemExit(2)

if __name__ == "__main__":
    main()
