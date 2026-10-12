#!/usr/bin/env python3
"""Read-only, fail-closed feasibility for content-addressed daily Cofre Zero history.

Never reads file contents, logs names, creates snapshots, or modifies Drive.
Runs only against the existing CURRENT and immutable full history seed.
"""
import argparse
import json
import re
import subprocess

SOURCE = "construrei-drive:CONSTRUREI-BACKUP-AUTO/CURRENT"
SEED = "construrei-drive:CONSTRUREI-BACKUP-AUTO/HISTORY_FULL/20261011-060021"
REQUIRED = ("03_DATABASE/data.sql", "03_DATABASE/schema.sql",
            "03_DATABASE/roles.sql", "BACKUP_STATUS.txt", "SHA256SUMS.txt")
HEX_MD5 = re.compile(r"^[0-9a-fA-F]{32}$")
RUN_ID = re.compile(r"^RUN_ID: (\d{8}-\d{6})$", re.M)


def parse_inventory(items):
    if not isinstance(items, list) or not items:
        raise ValueError("Inventory absent or invalid")
    indexed = {}
    for item in items:
        if not isinstance(item, dict) or item.get("IsDir") is True:
            raise ValueError("Invalid file metadata")
        path, size = item.get("Path"), item.get("Size")
        hashes = item.get("Hashes")
        md5 = hashes.get("MD5") if isinstance(hashes, dict) else None
        if (not isinstance(path, str) or not path or path.startswith("/")
                or "\\" in path or "//" in path or any(p in ("", ".", "..") for p in path.split("/"))
                or len(path) > 1024 or path in indexed):
            raise ValueError("Unsafe or duplicated relative path")
        if type(size) is not int or size < 0:
            raise ValueError("Missing or invalid file size metadata")
        if md5 is not None and (not isinstance(md5, str) or not HEX_MD5.fullmatch(md5)):
            raise ValueError("Invalid reported MD5; cannot trust metadata")
        # Drive may omit MD5 for some objects. Treat as CHANGED, never as identical.
        indexed[path] = (size, md5.lower() if md5 else None)
    if not all(path in indexed for path in REQUIRED):
        raise ValueError("Required backup files absent")
    if not any(p.startswith("06_STORAGE/") for p in indexed):
        raise ValueError("Storage objects absent")
    return indexed


def evaluate(source, seed):
    if not source or not seed:
        raise ValueError("Source or seed inventory empty")
    same = [p for p in source if source[p][1] is not None and source[p] == seed.get(p)]
    identical = set(same)
    changed = [p for p in source if p not in identical]
    # Append-only CAS would store changed bytes; no deletion or overwrite of seed.
    total = sum(size for size, _ in source.values())
    diff = sum(source[p][0] for p in changed)
    return {
        "read_only": True, "source_files": len(source), "seed_files": len(seed),
        "identical_files": len(same), "changed_or_new_files": len(changed),
        "removed_from_current_files": len(set(seed)-set(source)),
        "current_size_bytes": total, "estimated_delta_bytes": diff,
        "source_without_md5_files": sum(h is None for _, h in source.values()),
        "source_without_md5_bytes": sum(s for s, h in source.values() if h is None),
        "seed_without_md5_files": sum(h is None for _, h in seed.values()),
        "size_equal_files": sum(source[p][0] == seed[p][0] for p in source if p in seed),
        "size_comparable_files": sum(p in seed for p in source),
        "md5_comparable_files": sum(source[p][1] is not None and seed[p][1] is not None for p in source if p in seed),
        "estimated_storage_saving_fraction": round(1-diff/total, 6) if total else 0,
        "eligible_for_cutover": False, "recovery_verified": False,
    }


def command(*argv):
    return subprocess.run(argv, check=True, text=True, capture_output=True, timeout=240).stdout


def fetch_inventory(remote):
    return parse_inventory(json.loads(command(
        "rclone", "lsjson", remote, "--recursive", "--files-only", "--hash")))


def probe():
    status = command("rclone", "cat", SOURCE + "/BACKUP_STATUS.txt")
    if "CONSTRU-REI CLOUD BACKUP" not in status or "SOURCE_PROJECT: yspuaamokjbrosytqjpg" not in status:
        raise ValueError("Unexpected backup source identity")
    match = RUN_ID.search(status)
    if not match:
        raise ValueError("Missing RUN_ID")
    source = fetch_inventory(SOURCE)
    seed = fetch_inventory(SEED)
    result = evaluate(source, seed)
    result["source_run_id"] = match.group(1)
    result["immutable_seed_run_id"] = "20261011-060021"
    # Never log individual file paths, client names, tokens, or content.
    return result


def fixture(path, size, h):
    return {"Path": path, "Size": size, "Hashes": {"MD5": h}}


def selftest():
    a = "0" * 32
    b = "1" * 32
    base = [fixture(p, 100, a) for p in REQUIRED + ("06_STORAGE/a",)]
    curr = [dict(x) for x in base]
    curr[-1] = fixture("06_STORAGE/a", 120, b)
    source, seed = parse_inventory(curr), parse_inventory(base)
    report = evaluate(source, seed)
    assert report["identical_files"] == 5
    assert report["changed_or_new_files"] == 1
    assert report["estimated_delta_bytes"] == 120
    assert report["current_size_bytes"] == 620
    assert not report["eligible_for_cutover"]
    missing = [dict(base[0], Hashes={})] + base[1:]
    force = evaluate(parse_inventory(missing), parse_inventory(base))
    assert force["source_without_md5_files"] == 1 and force["changed_or_new_files"] == 1
    bad = [
        base[:-1],
        base + [base[0]],
        [dict(base[0], Path="../escape")] + base[1:],
        [dict(base[0], Hashes={"MD5": "invalid-md5"})] + base[1:],
        [dict(base[0], Size=True)] + base[1:],
    ]
    for case in bad:
        try:
            parse_inventory(case)
        except ValueError:
            pass
        else:
            raise AssertionError("Untrusted inventory accepted")
    print("PASS: append-only delta read-only planner synthetic tests")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--selftest", action="store_true")
    args = p.parse_args()
    if args.selftest:
        selftest()
    else:
        print(json.dumps(probe(), sort_keys=True))


if __name__ == "__main__":
    main()
