#!/usr/bin/env python3
"""Cofre Zero: independently verify private SQL bytes and enumerate restore prerequisites.

This is NOT a restore: no database connection or credentials, and no SQL/data
content is printed. Input comes from an already-downloaded private snapshot.
"""
import argparse
import hashlib
import json
import re
import tempfile
from pathlib import Path

NAMES = ("roles.sql", "schema.sql", "data.sql")
PROJECT = "yspuaamokjbrosytqjpg"


def verify(root: Path):
    root = root.resolve()
    checksums = root / "SHA256SUMS.txt"
    statusfile = root / "BACKUP_STATUS.txt"
    if not checksums.is_file() or not statusfile.is_file():
        raise ValueError("Manifest and BACKUP_STATUS must both exist in isolated snapshot.")
    manifest = {}
    for line in checksums.read_text(encoding="utf-8").splitlines():
        if "  " not in line:
            raise ValueError("Invalid SHA256SUMS entry")
        digest, name = line.split("  ", 1)
        if not re.fullmatch(r"[a-f0-9]{64}", digest) or name in manifest:
            raise ValueError("Invalid/duplicate sha256 entry")
        manifest[name] = digest
    status = statusfile.read_text(encoding="utf-8")
    if not status.startswith("CONSTRU-REI CLOUD BACKUP\n"):
        raise ValueError("Wrong backup identity")
    if ("SOURCE_PROJECT: " + PROJECT) not in status.splitlines():
        raise ValueError("Unexpected Supabase source project")
    if "DATABASE_FILES: 3" not in status.splitlines():
        raise ValueError("Expected 3 database files")
    sizes = {}
    for name in NAMES:
        rel = "03_DATABASE/" + name
        file = root / rel
        if rel not in manifest or not file.is_file() or file.is_symlink():
            raise ValueError("Missing independent database artifact: " + rel)
        digest = hashlib.sha256()
        count = 0
        with file.open("rb") as handle:
            for data in iter(lambda: handle.read(1 << 20), b""):
                digest.update(data)
                count += len(data)
        if count == 0 or digest.hexdigest() != manifest[rel]:
            raise ValueError("Artifact SHA/length mismatch: " + rel)
        sizes[name] = count
    schema = (root / "03_DATABASE/schema.sql").read_text(encoding="utf-8", errors="replace")
    roles = (root / "03_DATABASE/roles.sql").read_text(encoding="utf-8", errors="replace")
    with (root / "03_DATABASE/data.sql").open("rb") as handle:
        data_header = handle.read(512).decode("ascii", errors="replace")
    required_roles = sorted(set(re.findall(r'^ALTER ROLE "([\w_]+)"', roles, re.M)))
    created_roles = sorted(set(re.findall(r'^CREATE ROLE "([\w_]+)"', roles, re.M)))
    declared_schemas = sorted(set(re.findall(r'^CREATE SCHEMA (?:IF NOT EXISTS )?"([\w_]+)"', schema, re.M)))
    extensions = sorted(set(re.findall(r'^CREATE EXTENSION IF NOT EXISTS "([\w-]+)"', schema, re.M)))
    tables = re.findall(r'^CREATE TABLE (?:IF NOT EXISTS )?', schema, re.M)
    if not tables or not required_roles or not extensions:
        raise ValueError("Expected schema, roles and extensions not found")
    bootstrap_required = bool(set(required_roles) - set(created_roles)) or not {"auth", "storage"} <= set(declared_schemas)
    return {
        "kind": "COFRE_ZERO_SQL_READ_ONLY_PREFLIGHT",
        "status": "SQL_FILES_HASH_VERIFIED_RESTORE_REPLAY_NOT_RUN",
        "hashes_verified": 3,
        "database_files": len(NAMES),
        "schema_tables_count": len(tables),
        "schema_extensions_count": len(extensions),
        "roles_altered_count": len(required_roles),
        "bootstrap_supabase_required": bootstrap_required,
        "auth_schema_created_in_dump": "auth" in declared_schemas,
        "storage_schema_created_in_dump": "storage" in declared_schemas,
        "data_starts_with_replica_setting": data_header.lstrip().startswith("SET session_replication_role = replica;"),
        "snapshot_sql_bytes": sum(sizes.values()),
        "database_replay_attempted": False,
        "database_replay_passed": False,
        "eligible_for_recovery_signoff": False,
        "next_gate": "Bootstrap a disposable compatible Supabase/Postgres 17 and replay roles+schema+data with ON_ERROR_STOP=1; verify objects/rows/security; no production write.",
        "limitations": [
            "Hash match proves bytes stored, not SQL replay or DB compatibility",
            "Isolated Supabase bootstrap, roles, extensions and auth/storage may be missing",
            "Edge functions, OAuth, DNS, emails and object storage require separate evidence",
            "No secrets, SQL content or user data are printed",
        ],
    }


def selftest():
    with tempfile.TemporaryDirectory(prefix="cr-sql-preflight-") as tmp:
        root = Path(tmp)
        db = root / "03_DATABASE"
        db.mkdir()
        files = {
            "roles.sql": "ALTER ROLE \"anon\" SET \"statement_timeout\" TO '3s';\n",
            "schema.sql": "CREATE TABLE \"public\".\"case_fixture\" (id integer);\nCREATE EXTENSION IF NOT EXISTS \"pgcrypto\" WITH SCHEMA \"extensions\";\n",
            "data.sql": "SET session_replication_role = replica;\nCOPY \"public\".\"case_fixture\" (id) FROM stdin;\n1\n\\.\nRESET ALL;\n",
        }
        manifest = []
        for name, value in files.items():
            raw = value.encode()
            (db / name).write_bytes(raw)
            manifest.append(hashlib.sha256(raw).hexdigest() + "  03_DATABASE/" + name)
        (root / "SHA256SUMS.txt").write_text("\n".join(manifest) + "\n")
        (root / "BACKUP_STATUS.txt").write_text("CONSTRU-REI CLOUD BACKUP\nSOURCE_PROJECT: " + PROJECT + "\nDATABASE_FILES: 3\n")
        passed = verify(root)
        assert passed["hashes_verified"] == 3 and passed["database_replay_passed"] is False
        assert passed["eligible_for_recovery_signoff"] is False
        assert passed["bootstrap_supabase_required"] is True
        with (db / "data.sql").open("ab") as f:
            f.write(b"CORRUPTION")
        try:
            verify(root)
        except ValueError as e:
            assert "SHA/length mismatch" in str(e)
        else:
            raise AssertionError("Corrupt data.sql escaped hash verification")
        (db / "data.sql").unlink()
        try:
            verify(root)
        except ValueError as e:
            assert "Missing independent database artifact" in str(e)
        else:
            raise AssertionError("Missing data.sql escaped verification")
    print("PASS: schema/roles/data manifest integrity and fail-closed selftest (synthetic only)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", type=Path, help="Already-downloaded private snapshot directory")
    ap.add_argument("--selftest", action="store_true")
    args = ap.parse_args()
    if args.selftest:
        selftest()
    else:
        if not args.root:
            ap.error("--root required without --selftest")
        print(json.dumps(verify(args.root), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
