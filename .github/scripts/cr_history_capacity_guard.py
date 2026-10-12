#!/usr/bin/env python3
"""Fail-closed, read-only storage preflight for Cofre Zero daily immutable history.

Does not call Trello, Supabase or a write/delete operation. The production
CURRENT snapshot remains untouched if archive capacity is insufficient.
Limits are deliberately conservative, not global billing guarantees.
"""
import argparse
import json
import os
import subprocess

GIB = 1024 ** 3
HISTORY_LIMIT_BYTES = 15 * GIB
MIN_DRIVE_REMAINING_BYTES = 1 * GIB
DRIVE = "construrei-drive:"


def integer(value, name, allow_zero=True):
    if type(value) is not int or value < 0 or (not allow_zero and value == 0):
        raise ValueError(name + " missing or invalid: fail closed")
    return value


def evaluate(source_size, archive_size, free_bytes):
    """Validate aggregate Rclone metadata; no object identities are read."""
    if not isinstance(source_size, dict) or not isinstance(archive_size, dict):
        raise ValueError("Invalid size metadata: fail closed")
    source_bytes = integer(source_size.get("bytes"), "source.bytes", False)
    source_files = integer(source_size.get("count"), "source.count", False)
    archive_bytes = integer(archive_size.get("bytes"), "history.bytes")
    archive_files = integer(archive_size.get("count"), "history.count")
    free = integer(free_bytes, "drive.free")
    if free < source_bytes + MIN_DRIVE_REMAINING_BYTES:
        raise ValueError("Insufficient Drive quota for another immutable archive plus margin")
    if archive_bytes + source_bytes > HISTORY_LIMIT_BYTES:
        raise ValueError("Daily history budget exceeded; do not delete old backups")
    return {
        "gate": "PASS",
        "source_files": source_files,
        "source_bytes": source_bytes,
        "archived_files": archive_files,
        "archived_bytes": archive_bytes,
        "next_archive_reserve_bytes": source_bytes,
        "daily_history_ceiling_bytes": HISTORY_LIMIT_BYTES,
        "minimum_drive_remaining_bytes": MIN_DRIVE_REMAINING_BYTES,
        "reported_drive_free_bytes": free,
        "read_only": True,
        "deletion_performed": False,
    }


def read_json(argv):
    result = subprocess.run(argv, check=True, capture_output=True, text=True, timeout=180)
    return json.loads(result.stdout)


def probe():
    source = os.environ.get("SOURCE", "")
    archive = os.environ.get("ARCHIVE_ROOT", "")
    if source != "construrei-drive:CONSTRUREI-BACKUP-AUTO/CURRENT":
        raise ValueError("Unexpected source path: fail closed")
    if archive != "construrei-drive:CONSTRUREI-BACKUP-AUTO/HISTORY_FULL":
        raise ValueError("Unexpected archive path: fail closed")
    quota = read_json(["rclone", "about", DRIVE, "--json"])
    if not isinstance(quota, dict):
        raise ValueError("Drive quota unknown: fail closed")
    integer(quota.get("free"), "drive.free")
    source_data = read_json(["rclone", "size", source, "--json"])
    archive_data = read_json(["rclone", "size", archive, "--json"])
    return evaluate(source_data, archive_data, quota["free"])


def selftest():
    source = {"bytes": 350 * 1024 ** 2, "count": 4500}
    old = {"bytes": 3 * GIB, "count": 36000}
    ok = evaluate(source, old, 4 * GIB)
    assert ok["gate"] == "PASS" and ok["read_only"]
    assert ok["deletion_performed"] is False
    cases = (
        (source, old, None),
        (source, old, 100),
        (source, {"bytes": 15 * GIB, "count": 36000}, 30 * GIB),
        ({"bytes": 0, "count": 0}, old, 30 * GIB),
        (source, {"bytes": -1, "count": 20}, 30 * GIB),
        (source, {"bytes": True, "count": 20}, 30 * GIB),
        (source, old, 15.5 * GIB),
    )
    for inp in cases:
        try:
            evaluate(*inp)
        except ValueError:
            continue
        raise AssertionError("Unsafe capacity scenario accepted")
    print("PASS: Cofre daily immutable-history capacity guard synthetic selftest")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        selftest()
    else:
        print(json.dumps(probe(), sort_keys=True))


if __name__ == "__main__":
    main()
