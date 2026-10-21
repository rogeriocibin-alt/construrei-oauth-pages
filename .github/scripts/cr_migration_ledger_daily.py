#!/usr/bin/env python3
"""Immutable, deduplicated migration ledger in the EXISTING change-driven Cofre cycle.

Read-only PostgreSQL 17 export. Private Drive CAS objects and run manifests,
no new workflow/cron, no migrations applied, no deletes and no PII in logs.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path

PG_DUMP = "/usr/lib/postgresql/17/bin/pg_dump"
PROJECT = "yspuaamokjbrosytqjpg"
PARENT = "construrei-drive:CONSTRUREI-COFRE-ZERO/03_DATABASE"
ROOT = PARENT + "/MIGRATIONS_CAS"
MIN_ROWS = 193
MAX_EXPORT_BYTES = 16 * 1024 * 1024
MAX_LEDGER_BYTES = 1024 ** 3
FREE_RESERVE_BYTES = 1024 ** 3
RUN_PATTERN = re.compile(r"^[0-9]{8}-[0-9]{6}$")


def execute(args, *, env=None, output=None):
    result = subprocess.run(args, env=env, stdout=output or subprocess.PIPE,
                            stderr=subprocess.PIPE, check=False, timeout=180)
    if result.returncode:
        raise RuntimeError("Cofre ledger operation failed closed (details withheld)")
    return result.stdout.decode("utf-8") if output is None else ""


def list_names(remote, *, dirs=False):
    kind = "--dirs-only" if dirs else "--files-only"
    return set(execute(["rclone", "lsf", remote, kind]).splitlines())


def copy_readback(remote, local, expected):
    execute(["rclone", "copyto", remote, str(local)])
    if local.read_bytes() != expected:
        raise RuntimeError("Cofre ledger private Drive readback mismatch")


def copy_immutable(local, remote):
    execute(["rclone", "copyto", str(local), remote, "--immutable",
             "--transfers", "1"])


def count_copy_rows(path):
    count = headers = 0
    inside = False
    with Path(path).open(encoding="utf-8", errors="strict") as stream:
        for line in stream:
            if not inside and line.startswith("COPY ") and "schema_migrations" in line and "FROM stdin;" in line:
                headers += 1
                inside = True
            elif inside and line.rstrip("\r\n") == r"\.":
                inside = False
            elif inside:
                count += 1
    if inside or headers != 1 or count < MIN_ROWS or count > 100000:
        raise ValueError("Migration ledger malformed or unexpectedly truncated")
    return count


def capacity(new_bytes, existing_bytes, free_bytes):
    if any(type(x) is not int or x < 0 for x in
           (new_bytes, existing_bytes, free_bytes)):
        raise ValueError("Missing or invalid private Drive capacity")
    if existing_bytes + new_bytes > MAX_LEDGER_BYTES:
        raise ValueError("Immutable ledger quota reached; no deletion allowed")
    if free_bytes < new_bytes + FREE_RESERVE_BYTES:
        raise ValueError("Drive quota below reserved margin")


def selftest():
    with tempfile.TemporaryDirectory() as td:
        p = Path(td) / "migration.sql"
        p.write_text('COPY "supabase_migrations"."schema_migrations" (version) FROM stdin;\n'
                     + "".join(str(i) + "\n" for i in range(193)) + r"\." + "\n",
                     encoding="utf-8")
        assert count_copy_rows(p) == 193
        p.write_text(p.read_text().replace("192\n", ""), encoding="utf-8")
        try:
            count_copy_rows(p)
            raise AssertionError("Accepted truncated history")
        except ValueError:
            pass
        p.write_text('COPY x FROM stdin;\n1\n', encoding="utf-8")
        try:
            count_copy_rows(p)
            raise AssertionError("Accepted unclosed COPY")
        except ValueError:
            pass
    capacity(2000000, 1000000, 2 * FREE_RESERVE_BYTES)
    for values in ((500, MAX_LEDGER_BYTES, 2 * FREE_RESERVE_BYTES),
                   (500, 0, 40), (500, 0, None)):
        try:
            capacity(*values)
            raise AssertionError("Accepted unsafe capacity")
        except ValueError:
            pass
    print("PASS: migration ledger 193+ records, truncation checks, private quota gates")


def archive(run_id):
    if not RUN_PATTERN.fullmatch(run_id):
        raise ValueError("Invalid daily source run ID")
    url = os.environ.get("SUPABASE_DB_URL")
    if not url or not Path(PG_DUMP).is_file():
        raise RuntimeError("Postgres 17 read-only credentials/client not available")
    if not os.environ.get("RCLONE_CONFIG_B64"):
        raise RuntimeError("Private Drive credentials not configured")
    with tempfile.TemporaryDirectory(prefix="cr-ledger-") as td:
        work = Path(td)
        dump = work / "migration-ledger.sql"
        env = dict(os.environ)
        env["PGOPTIONS"] = "-c default_transaction_read_only=on"
        env["PGCONNECT_TIMEOUT"] = "15"
        with dump.open("wb") as dest:
            execute([PG_DUMP, url, "--data-only", "--quote-all-identifiers",
                     "--no-owner", "--no-privileges",
                     "--table=supabase_migrations.schema_migrations",
                     "--file=" + str(dump)], env=env, output=dest)
        size = dump.stat().st_size
        if size == 0 or size > MAX_EXPORT_BYTES:
            raise RuntimeError("Migration ledger size outside safe bounds")
        rows = count_copy_rows(dump)
        digest = hashlib.sha256(dump.read_bytes()).hexdigest()
        obj_name = digest + ".sql"
        manifest_name = run_id + ".json"
        manifest = {
            "format": "CR_COFRE_MIGRATIONS_CAS_V1",
            "source_project": PROJECT, "source_run_id": run_id,
            "migration_rows": rows, "sha256": digest,
            "bytes": size, "object": "OBJECTS/" + obj_name,
            "read_only_export": True,
            "migration_statements_executed": False,
        }
        payload = (json.dumps(manifest, sort_keys=True, indent=2) + "\n").encode()
        manifest_local = work / "manifest.json"
        manifest_local.write_bytes(payload)

        # The parent is known to exist because the isolated migration restore
        # already wrote MIGRATIONS_HISTORY_FULL there. No destructive operation.
        siblings = list_names(PARENT, dirs=True)
        root_exists = "MIGRATIONS_CAS/" in siblings
        directories = list_names(ROOT, dirs=True) if root_exists else set()
        objects = list_names(ROOT + "/OBJECTS") if "OBJECTS/" in directories else set()
        manifests = list_names(ROOT + "/MANIFESTS") if "MANIFESTS/" in directories else set()
        existing = 0
        if root_exists:
            remote_size = json.loads(execute(["rclone", "size", ROOT, "--json"]))
            existing = remote_size.get("bytes")
        quota = json.loads(execute(["rclone", "about", "construrei-drive:", "--json"]))
        if type(quota) is not dict:
            raise ValueError("Private Drive quota unavailable")
        # Resolve immutable destination before quota accounting and writes.
        # A repeated source run can have a different read-only export.
        if manifest_name in manifests:
            execute(["rclone", "copyto", ROOT + "/MANIFESTS/" + manifest_name,
                     str(work / "existing-manifest.json")])
            if (work / "existing-manifest.json").read_bytes() != payload:
                manifest_name = run_id + "-" + hashlib.sha256(payload).hexdigest() + ".json"
        target = ROOT + "/MANIFESTS/" + manifest_name
        capacity((0 if obj_name in objects else size)
                 + (0 if manifest_name in manifests else len(payload)),
                 existing, quota.get("free"))
        if obj_name in objects:
            copy_readback(ROOT + "/OBJECTS/" + obj_name, work / "verified.sql",
                          dump.read_bytes())
        else:
            copy_immutable(dump, ROOT + "/OBJECTS/" + obj_name)
            copy_readback(ROOT + "/OBJECTS/" + obj_name, work / "verified.sql",
                          dump.read_bytes())
        if manifest_name not in manifests:
            copy_immutable(manifest_local, target)
        copy_readback(target, work / "verified.json", payload)
        print("PASS: daily migration ledger archived privately and read back")
        print("Source migration rows:", rows)
        print("Immutable object:", "reused" if obj_name in objects else "new")
        print("CAS/manifest: append-only; production database read-only")
        with Path(os.environ.get("GITHUB_STEP_SUMMARY", os.devnull)).open("a",
                                                                           encoding="utf-8") as f:
            f.write("- Migration ledger: **PASS**, " + str(rows) +
                    " rows, immutable CAS SHA-256, private readback, zero production writes.\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--selftest", action="store_true")
    parser.add_argument("--run-id")
    args = parser.parse_args()
    if args.selftest:
        selftest()
    else:
        if not args.run_id:
            parser.error("--run-id is required")
        archive(args.run_id)
