#!/usr/bin/env bash
# CONSTRU-REI Cofre Zero isolated restore proof.
# No production SQL writes, no database network, no uploaded logs or extracted user data.
set -euo pipefail
umask 077
test -n "$RCLONE_CONFIG_B64" || { echo 'BLOCKED: private Drive authorization absent'; exit 4; }
test "$GITHUB_EVENT_NAME" = 'pull_request'
test "$GITHUB_HEAD_REF" = 'checkpoint/cofre-zero-pg17-real-restore-20261012'
WORK="$(mktemp -d)"
CID=""
cleanup() {
  if test -n "$CID"; then docker rm -fv "$CID" >/dev/null 2>&1 || :; fi
  if test -e "$WORK/local-stack/supabase/config.toml"; then
    (cd "$WORK/local-stack" && npx --yes supabase@2.120.0 stop --no-backup >/dev/null 2>&1) || :
  fi
  rm -rf "$WORK"
}
trap cleanup EXIT
CONFIG="$WORK/rclone.conf"
printf '%s' "$RCLONE_CONFIG_B64" | base64 --decode > "$CONFIG"
chmod 600 "$CONFIG"
REMOTE="construrei-drive:CONSTRUREI-BACKUP-AUTO/HISTORY_FULL/20261012-060012"
mkdir -p "$WORK/03_DATABASE"
for file in BACKUP_STATUS.txt SHA256SUMS.txt; do
  rclone --config "$CONFIG" copyto "$REMOTE/$file" "$WORK/$file" --retries 2 --retries-sleep 2s >/dev/null
done
for file in roles.sql schema.sql data.sql; do
  rclone --config "$CONFIG" copyto "$REMOTE/03_DATABASE/$file" "$WORK/03_DATABASE/$file" --retries 2 --retries-sleep 2s >/dev/null
done
python3 .github/scripts/cr_sql_restore_preflight.py --root "$WORK" > "$WORK/preflight.json"
python3 .github/scripts/cr_sql_copy_inventory.py --root "$WORK" > "$WORK/copy.json"
python3 - "$WORK" <<'PY'
import json, pathlib, sys
folder=pathlib.Path(sys.argv[1])
status=(folder/"BACKUP_STATUS.txt").read_text()
assert "RUN_ID: 20261012-060012" in status, "Historical snapshot mismatch"
pre=json.loads((folder/"preflight.json").read_text())
inv=json.loads((folder/"copy.json").read_text())
assert pre["hashes_verified"]==3 and pre["bootstrap_supabase_required"]
assert inv["copy_headers_total"] > 0
assert not pre["database_replay_passed"] and not inv["sql_restore_attempted"]
print("PASS: private SQL SHA256 3/3 and COPY inventory, without exposing row data")
PY
# Official Supabase CLI stack is required: bare PG17 image has zero managed
# Auth and Storage tables. This project is NEVER linked to production.
# Verify Auth + Storage bootstrap before importing private data.
test -z "$SUPABASE_ACCESS_TOKEN" || { echo 'BLOCKED: unexpected production API token'; exit 8; }
mkdir -p "$WORK/local-stack"
pushd "$WORK/local-stack" >/dev/null
npx --yes supabase@2.120.0 init --yes >/dev/null
python3 - <<'PY'
from pathlib import Path
import tomllib,re
p=Path("supabase/config.toml")
s=p.read_text()
initial=tomllib.loads(s)
if "db" not in initial:
    s=s.rstrip()+"\n[db]\nmajor_version = 17\n"
elif "major_version" not in initial["db"]:
    s=s.replace("[db]","[db]\nmajor_version = 17",1)
else:
    s=re.sub(r"(?m)^(\s*major_version\s*=\s*).*$",r"\g<1>17",s,count=1)
assert tomllib.loads(s).get("db",{}).get("major_version")==17
p.write_text(s)
PY
npx --yes supabase@2.120.0 start --exclude realtime,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor >/dev/null
popd >/dev/null
CID="$(docker ps --format '{{.ID}} {{.Names}}' | awk '$2 ~ /^supabase_db_/ {print $1; exit}')"
test -n "$CID" || { echo 'BLOCKED: official PG17 local database missing'; exit 8; }
# Halt all platform services before importing user data. The source backup
# has NOT been made visible/mounted to any service container.
while IFS= read -r name; do
  test -n "$name" || continue
  docker stop "$name" >/dev/null
done < <(docker ps --format '{{.Names}}' | grep '^supabase_' | grep -v '^supabase_db_' || :)
NETWORKS="$(docker inspect "$CID" --format '{{range $network, $value := .NetworkSettings.Networks}}{{$network}} {{end}}')"
for network in $NETWORKS; do docker network disconnect -f "$network" "$CID"; done
NETWORK_COUNT="$(docker inspect "$CID" --format '{{len .NetworkSettings.Networks}}')"
test "$NETWORK_COUNT" = "0" || { echo 'BLOCKED: isolated database still has networking'; exit 8; }
echo 'PASS: compatible official Supabase stack bootstrapped; platform services stopped; DB network fully disconnected'
READY=0
for count in $(seq 1 36); do
  if docker exec -u postgres "$CID" pg_isready -U postgres -h /var/run/postgresql >/dev/null 2>&1; then READY=1; break; fi
  sleep 3
done
if test "$READY" -ne 1; then echo 'BLOCKED: isolated Supabase PG17 bootstrap not ready'; exit 5; fi

AUTH_COUNT="$(docker exec -u postgres "$CID" psql -U postgres -d postgres -Atqc "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='auth' and c.relkind in ('r','p')")"
STORAGE_COUNT="$(docker exec -u postgres "$CID" psql -U postgres -d postgres -Atqc "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='storage' and c.relkind in ('r','p')")"
echo "PLATFORM_BOOTSTRAP auth_tables=$AUTH_COUNT storage_tables=$STORAGE_COUNT"
test "$AUTH_COUNT" -ge 27 && test "$STORAGE_COUNT" -ge 8 || { echo 'BLOCKED: official Auth/Storage migrations incomplete'; exit 5; }

# Keep private runner files 0700; copy bytes inside this network-isolated
# disposable container and assign read-only SQL files to its local postgres user.
# Never chmod the private Drive artifacts world-readable on the host.
docker exec -u root "$CID" mkdir -p /restore
docker cp "$WORK/03_DATABASE" "$CID:/restore/" >/dev/null
docker exec -u root "$CID" chown -R postgres:postgres /restore
docker exec -u root "$CID" chmod -R go-rwx /restore
docker exec -u postgres "$CID" test -r /restore/03_DATABASE/roles.sql
docker exec -u postgres "$CID" test -r /restore/03_DATABASE/schema.sql
docker exec -u postgres "$CID" test -r /restore/03_DATABASE/data.sql
VER="$(docker exec -u postgres "$CID" psql -U postgres -d postgres -Atqc 'show server_version_num')"
test "$VER" -ge 170000 && test "$VER" -lt 180000 || { echo 'BLOCKED: Postgres 17 mismatch'; exit 6; }
ROLES="$(docker exec -u postgres "$CID" psql -U postgres -d postgres -Atqc "select count(*) from pg_roles where rolname in ('anon','authenticated','authenticator','supabase_realtime_admin')")"
SCHEMAS="$(docker exec -u postgres "$CID" psql -U postgres -d postgres -Atqc "select count(*) from pg_namespace where nspname in ('auth','storage')")"
EXTS="$(docker exec -u postgres "$CID" psql -U postgres -d postgres -Atqc "select count(*) from pg_available_extensions where name in ('pg_cron','pg_net','http','pg_stat_statements','pgcrypto','supabase_vault','uuid-ossp')")"
echo "PG17_BOOTSTRAP roles=$ROLES schemas=$SCHEMAS available_extensions=$EXTS"
# Platform production metadata verified 2026-10-12: supabase_realtime_admin is
# NOLOGIN/NOSUPERUSER/NOCREATEDB/NOCREATEROLE/NOINHERIT/NOREPLICATION.
# Image may omit that role without Realtime migrations. Recreate *only* this exact
# metadata prerequisite in an offline, disposable lab, never production.
# In the official Supabase PG17 image postgres has no SUPERUSER; supabase_admin does.
# This exact role hierarchy was independently verified in production (read-only).
IS_ADMIN_SUPER="$(docker exec -u postgres "$CID" psql -U postgres -d postgres -Atqc "select count(*) from pg_roles where rolname='supabase_admin' and rolsuper and rolcanlogin")"
test "$IS_ADMIN_SUPER" = "1" || { echo 'BLOCKED: native Supabase admin role absent'; exit 7; }
docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc 'select 1' >/dev/null || { echo 'BLOCKED: isolated admin session unavailable'; exit 7; }
if test "$ROLES" -eq 3; then
  MISSING="$(docker exec -u postgres "$CID" psql -U postgres -d postgres -Atqc "select string_agg(name,',') from (values ('anon'),('authenticated'),('authenticator'),('supabase_realtime_admin')) as required(name) where not exists (select 1 from pg_roles r where r.rolname=required.name)")"
  if test "$MISSING" = 'supabase_realtime_admin'; then
    docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -q -v ON_ERROR_STOP=1 -c 'CREATE ROLE supabase_realtime_admin NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION' >/dev/null
    echo 'LAB_BOOTSTRAP: recreated only the omitted Supabase Realtime no-login role'
    ROLES=4
  else
    echo 'BLOCKED: missing unknown Supabase role; no attempted workaround'
    exit 7
  fi
fi
if test "$ROLES" -ne 4 || test "$SCHEMAS" -ne 2 || test "$EXTS" -ne 7; then
  echo 'BLOCKED: official image lacks one or more application Supabase initialization prerequisites'
  exit 7
fi
# The CLI SQL dump excludes Supabase-managed migration table DDL, while one
# CONSTRU-REI view references it. Read-only prod metadata checked 2026-10-12:
# version text PK, statements text[], name text, created_by text,
# idempotency_key text UNIQUE, rollback text[]. 193 source migration records.
# Bootstrap ONLY schema shape in ephemeral PG17; this does not restore history.
docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -q -v ON_ERROR_STOP=1 \
  -c 'CREATE SCHEMA IF NOT EXISTS supabase_migrations;
      CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations(
        version text PRIMARY KEY,
        statements text[],
        name text,
        created_by text,
        idempotency_key text UNIQUE,
        rollback text[]
      )' >/dev/null
python3 - "$WORK/03_DATABASE/data.sql" <<'PY'
import sys
included=False
with open(sys.argv[1], "r", encoding="utf-8", errors="replace") as f:
    for line in f:
        if line.startswith("COPY ") and "supabase_migrations" in line and "schema_migrations" in line:
            included=True
            break
print("MIGRATION_HISTORY_DATA_INCLUDED_IN_MAIN_DUMP",included)
PY
echo 'LAB_BOOTSTRAP: mirrored Supabase migration table structure only, no fabricated history'
# Official image bootstraps Supabase Realtime publications, while our verified
# schema.sql creates these exact two publications itself (lines 13983/13989).
# Clear only these names INSIDE the disposable network-isolated container,
# allowing the immutable backup to recreate authentic publication settings.
# No change whatsoever to actual Supabase production or source SQL files.
PUB_COUNT="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc "select count(*) from pg_publication where pubname in ('supabase_realtime','supabase_realtime_messages_publication')")"
if test "$PUB_COUNT" -gt 0; then
  docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -q -v ON_ERROR_STOP=1 \
    -c 'DROP PUBLICATION IF EXISTS supabase_realtime; DROP PUBLICATION IF EXISTS supabase_realtime_messages_publication' >/dev/null
fi
echo "LAB_BOOTSTRAP: cleared $PUB_COUNT pre-installed Realtime publications; immutable SQL recreates them"
# The managed platform owns a SECURITY DEFINER event-trigger function as postgres,
# while this self-hosted image marks postgres NOSUPERUSER. PG17 rejects CREATE
# EVENT TRIGGER when function ownership lacks superuser permission. Adapt only
# this disposable --network none lab to PostgreSQL native restore privilege model.
# This is not an alteration to the managed production project's postgres role.
docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -q -v ON_ERROR_STOP=1 \
  -c 'ALTER ROLE postgres SUPERUSER' >/dev/null
LAB_PG_SUPER="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc "select count(*) from pg_roles where rolname='postgres' and rolsuper")"
test "$LAB_PG_SUPER" = "1" || { echo 'BLOCKED: disposable lab superuser prerequisite missing'; exit 7; }
echo 'LAB_BOOTSTRAP: privileged postgres role only inside disposable offline PG17 container'
# Supabase image ships a subset of extension/REST API event triggers; the
# immutable SQL creates its OWN corresponding trigger definitions. Remove only
# the exact conflicting names in this network-isolated disposable database.
# Every trigger is recreated by schema.sql; never touch production.
docker exec -i -u postgres "$CID" psql -X -q -U supabase_admin -d postgres -v ON_ERROR_STOP=1 <<'SQL'
DO $lab$
DECLARE trigger_name text;
BEGIN
  FOR trigger_name IN
    SELECT evtname FROM pg_event_trigger
    WHERE evtname IN (
      'cr_auto_enable_rls_public',
      'issue_graphql_placeholder',
      'issue_pg_cron_access',
      'issue_pg_graphql_access',
      'issue_pg_net_access',
      'pgrst_ddl_watch',
      'pgrst_drop_watch'
    )
  LOOP
    EXECUTE format('DROP EVENT TRIGGER %I', trigger_name);
  END LOOP;
END
$lab$;
SQL
echo 'LAB_BOOTSTRAP: removed only preinstalled event-trigger name collisions in offline PG17'
# The immutable schema grants to Supabase platform roles. Validate these
# against the real project's pg_roles metadata, without reading any passwords.
# Only missing built-in Supabase roles are created inside this offline lab.
# Current project verified metadata: functions_admin LOGIN NOINHERIT CREATEROLE,
# dashboard_user NOLOGIN INHERIT CREATEROLE CREATEDB REPLICATION.
NEED_FUNCTIONS="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc "select count(*) from pg_roles where rolname='supabase_functions_admin'")"
if test "$NEED_FUNCTIONS" = "0"; then
  docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -q -v ON_ERROR_STOP=1 \
    -c 'CREATE ROLE supabase_functions_admin LOGIN NOINHERIT CREATEROLE NOSUPERUSER NOCREATEDB NOREPLICATION NOBYPASSRLS' >/dev/null
fi
NEED_DASHBOARD="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc "select count(*) from pg_roles where rolname='dashboard_user'")"
if test "$NEED_DASHBOARD" = "0"; then
  docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -q -v ON_ERROR_STOP=1 \
    -c 'CREATE ROLE dashboard_user NOLOGIN INHERIT CREATEROLE CREATEDB REPLICATION NOSUPERUSER NOBYPASSRLS' >/dev/null
fi
echo 'LAB_BOOTSTRAP: platform function and dashboard roles now match expected names and privileges'
# Real restoration of verified private SQL in a disposable network-isolated instance.
# Suppress all SQL and error payloads to protect customer information in public GitHub logs.
if ! timeout 780s docker exec -u postgres "$CID" \
  bash -c "psql -X -q --single-transaction -v ON_ERROR_STOP=1 -U supabase_admin -d postgres \
    -f /restore/03_DATABASE/roles.sql \
    -f /restore/03_DATABASE/schema.sql \
    -c 'SET session_replication_role = replica' \
    -f /restore/03_DATABASE/data.sql >/tmp/cofre-restore.log 2>&1"; then
  # Transfer error log only into runner ephemeral memory, never print SQL/row contents.
  docker cp "$CID:/tmp/cofre-restore.log" "$WORK/replay-error.log" >/dev/null 2>&1 || :
  python3 - "$WORK/replay-error.log" <<'PY'
from pathlib import Path
import re,sys
p=Path(sys.argv[1])
s=p.read_text(errors="replace") if p.is_file() else ""
errors=[line for line in s.splitlines() if any(token in line.lower() for token in ("error", "fatal", "permission denied", "unsupported", "unrecognized", "aborted", "invalid", "could not", "failed"))]
line=errors[0] if errors else ""
loc=re.search(r"/(roles|schema|data)\.sql:(\d+)",line)
lower=line.lower()
types=[
  ("role_missing",("role ","does not exist")),
  ("schema_missing",("schema ","does not exist")),
  ("relation_missing",("relation ","does not exist")),
  ("extension_missing",("extension ","not available")),
  ("permission_denied",("permission denied",)),
  ("already_exists",("already exists",)),
  ("undefined_function",("function ","does not exist")),
  ("undefined_column",("column ","does not exist")),
  ("undefined_type",("type ","does not exist")),
  ("foreign_key",("foreign key",)),
  ("sql_syntax",("syntax error",)),
  ("reserved_role",("reserved role",)),
]
category="other_sql_error"
for name,needles in types:
    if all(w in lower for w in needles):
        category=name
        break
file=loc.group(1)+".sql" if loc else "unknown"
line_number=int(loc.group(2)) if loc else 0
safe_words={"psql","error","fatal","permission","denied","database","role","schema","relation","function","extension","transaction","timeout","syntax","invalid","unsupported","unrecognized","failed","cannot","could","not","connect","postgres","supabase_admin","missing","reserved","superuser","file","directory","ssl","password","authentication","connection","failed","option","stdin","command","too","many","arguments","attempt","conflict","snapshot","statement","user","alter","create","already","exists","table","view","type","event","trigger","parameter","replication","readonly"}
present=sorted(set(re.findall(r"[a-z_]{3,}",lower)) & safe_words)
print("SAFE_RESTORE_KEYWORDS",",".join(present[:25]))
print("SAFE_EVENT_TRIGGER_FLAGS", {
 "superuser_required": any(s in lower for s in ("must be superuser","must be a superuser","only superusers","superuser privileges")),
 "function_exec_denied": "permission denied for function" in lower,
 "function_not_event_trigger": "return type event_trigger" in lower,
 "function_owner_invalid": "owned by superuser" in lower,
 "already_exists": "already exists" in lower,
 "event_trigger_restricted": "event trigger" in lower,
 "is_create_event_trigger": line_number == 16062,
})
print("SAFE_RESTORE_ERROR_LINES",len(errors))
print(f"SAFE_RESTORE_DIAGNOSTIC category={category} file={file} line={line_number}")
print("No SQL, object names, private row data or credentials printed")
PY
  echo 'BLOCKED: real SQL replay failed in isolated Supabase PG17; private content withheld'
  exit 8
fi
TABLES="$(docker exec -u postgres "$CID" psql -U postgres -d postgres -Atqc "select count(*) from information_schema.tables where table_schema in ('public','cr_internal') and table_type='BASE TABLE'")"
AUTH="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc 'select count(*) from auth.users')"
STORAGE="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc 'select count(*) from storage.objects')"
test "$TABLES" -ge 150
echo "PASS: isolated SQL E2E replay completed with PG17; restored application tables=$TABLES"
echo "PASS: auth and storage metadata queryable (only aggregate row counts were checked)"
echo "NOT COVERED: Storage binaries, Auth OAuth providers, live DNS, edge functions or user logins"
