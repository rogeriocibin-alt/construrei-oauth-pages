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

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--selftest", action="store_true")
    p.add_argument("--status-file")
    p.add_argument("--cloud-state", choices=["unknown", "running", "disabled_verified"], default="unknown")
    p.add_argument("--drive-free-bytes", type=int)
    p.add_argument("--projected-new-bytes", type=int)
    p.add_argument("--max-new-bytes", type=int)
    a = p.parse_args()
    if a.selftest:
        selftest()
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
