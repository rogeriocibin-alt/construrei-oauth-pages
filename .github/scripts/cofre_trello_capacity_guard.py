#!/usr/bin/env python3
"""Read-only Trello offsite capacity gate. Never deletes or uploads files.

Prevents automatic weekly snapshots growing unbounded and refuses backup if
Google Drive free capacity cannot be verified. Only aggregate sizes are logged.
This is a guard, not a retention policy or a billing guarantee.
"""
import argparse
import json
import subprocess
from pathlib import Path

ROOT = "construrei-drive:CONSTRUREI-COFRE-ZERO/24_EXTERNAL_SOURCES/TRELLO_FULL_OFFSITE"
DRIVE = "construrei-drive:"
TEN_GIB = 10 * 1024**3
NEXT_RUN_RESERVE = 3 * 1024**3
DRIVE_MIN_FREE = NEXT_RUN_RESERVE + 1 * 1024**3


def assess(entries, free):
    if not isinstance(entries, list):
        raise ValueError("Invalid Drive inventory; fail closed")
    if not entries:
        raise ValueError("No prior Trello recovery snapshot found; manual review required")
    bytes_used = 0
    runs = set()
    for item in entries:
        if not isinstance(item, dict):
            raise ValueError("Invalid Drive object metadata")
        name, size = item.get("Path"), item.get("Size")
        if not isinstance(name, str) or "/" not in name:
            raise ValueError("Unrecognized Drive storage layout; manual review required")
        directory = name.split("/", 1)[0]
        if not directory.startswith("RUN_"):
            raise ValueError("Unknown item outside RUN_ snapshots")
        if not isinstance(size, int) or isinstance(size, bool) or size < 0:
            raise ValueError("Unknown Drive object size; fail closed")
        runs.add(directory)
        bytes_used += size
    if not isinstance(free, int) or isinstance(free, bool) or free < 0:
        raise ValueError("Drive free capacity not reported; fail closed")
    if free < DRIVE_MIN_FREE:
        raise ValueError("Drive free capacity below next-run reserve and safety margin")
    if bytes_used + NEXT_RUN_RESERVE > TEN_GIB:
        raise ValueError("Trello archive budget reached: keep existing snapshots; review retention")
    return {
        "result": "PASS",
        "existing_snapshot_count": len(runs),
        "existing_archive_bytes": bytes_used,
        "next_snapshot_reserve_bytes": NEXT_RUN_RESERVE,
        "archive_ceiling_bytes": TEN_GIB,
        "drive_free_bytes_reported": free,
        "deletion_performed": False,
    }


def read_json(command):
    proc = subprocess.run(command, check=True, capture_output=True, text=True, timeout=120)
    return json.loads(proc.stdout)


def probe():
    inventory = read_json(["rclone", "lsjson", ROOT, "--recursive", "--files-only"])
    quota = read_json(["rclone", "about", DRIVE, "--json"])
    if not isinstance(quota, dict):
        raise ValueError("Google Drive quota response unavailable")
    return assess(inventory, quota.get("free"))


def selftest():
    sample = [
        {"Path": "RUN_20261011-1/TRELLO_READONLY_SNAPSHOT.zip", "Size": 1847057742},
        {"Path": "RUN_20261011-1/TRELLO_RECOVERED.sqlite", "Size": 159440896},
    ]
    good = assess(sample, 20 * 1024**3)
    assert good["existing_snapshot_count"] == 1
    assert good["deletion_performed"] is False
    for entries, free in (
        (sample, None),
        (sample, 1024),
        ([], 20 * 1024**3),
        ([{"Path": "unknown.txt", "Size": 1}], 20 * 1024**3),
        (sample + [{"Path": "RUN_2/package.zip", "Size": 8 * 1024**3}], 20 * 1024**3),
    ):
        try:
            assess(entries, free)
        except ValueError:
            continue
        raise AssertionError("Unsafe capacity scenario was accepted")
    print("PASS: Trello offsite capacity gate, synthetic-only fail-closed tests")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args()
    if args.selftest:
        selftest()
    else:
        result = probe()
        print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
