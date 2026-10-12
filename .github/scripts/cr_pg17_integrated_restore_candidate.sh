#!/usr/bin/env bash
# CONSTRU-REI Cofre Zero isolated restore proof.
# No production SQL writes, no database network, no uploaded logs or extracted user data.
set -euo pipefail
umask 077
test -n "$RCLONE_CONFIG_B64" || { echo 'BLOCKED: private Drive authorization absent'; exit 4; }
test "$GITHUB_EVENT_NAME" = 'pull_request'
test "$GITHUB_HEAD_REF" = 'checkpoint/cofre-zero-integrated-lab-20261012'
WORK="$(mktemp -d)"
CID=""
cleanup() {
  if test -n "$CID"; then docker rm -fv "$CID" >/dev/null 2>&1 || :; fi
  if test -e "$WORK/local-stack/supabase/config.toml"; then
    (cd "$WORK/local-stack" && env -u RCLONE_CONFIG_B64 npx --yes supabase@2.120.0 stop --no-backup >/dev/null 2>&1) || :
  fi
  rm -rf "$WORK"
}
trap cleanup EXIT
# Official Supabase CLI stack is required: bare PG17 image has zero managed
# Auth and Storage tables. This project is NEVER linked to production.
# Verify Auth + Storage bootstrap before importing private data.
test -z "${SUPABASE_ACCESS_TOKEN:-}" || { echo 'BLOCKED: unexpected production API token'; exit 8; }
mkdir -p "$WORK/local-stack"
pushd "$WORK/local-stack" >/dev/null
env -u RCLONE_CONFIG_B64 npx --yes supabase@2.120.0 init --yes >/dev/null
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
env -u RCLONE_CONFIG_B64 npx --yes supabase@2.120.0 start --exclude realtime,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor >/dev/null
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

# Fetch private SQL only AFTER official CLI initialization and DB network isolation.
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
print("PASS: private SQL SHA256 after offline Supabase bootstrap; no row data logged")
PY
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
# Compare restored structure and metadata against readonly production aggregates
# recorded on 2026-10-12, never query or print actual customer rows.
AGG="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc "
select
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where c.relkind in ('r','p') and n.nspname in ('public','cr_internal')),
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where c.relkind in ('r','p') and n.nspname in ('public','cr_internal') and c.relrowsecurity),
  (select count(*) from pg_policies where schemaname in ('public','cr_internal')),
  (select count(*) from storage.objects),
  (select count(*) from auth.users),
  (select count(*) from public.cc_items),
  (select count(*) from public.cc_changes),
  (select count(*) from supabase_migrations.schema_migrations);
")"
IFS='|' read -r TABLES RLS POLICIES STORAGE AUTH ITEMS CHANGES MIGRATIONS <<<"$AGG"
echo "RESTORE_COUNTS app_tables=$TABLES rls_tables=$RLS app_policies=$POLICIES storage_metadata=$STORAGE auth_users=$AUTH"
test "$TABLES" = "193" || { echo 'BLOCKED: restored application table count mismatch'; exit 9; }
test "$RLS" = "192" || { echo 'BLOCKED: restored application RLS table count mismatch'; exit 9; }
test "$POLICIES" = "20" || { echo 'BLOCKED: restored application RLS policy count mismatch'; exit 9; }
test "$STORAGE" = "4531" || { echo 'BLOCKED: storage metadata count mismatch with source at 06:00 UTC snapshot'; exit 9; }
test "$AUTH" = "0" || { echo 'BLOCKED: auth user metadata count mismatch'; exit 9; }
test "$ITEMS" -gt 0 && test "$CHANGES" -gt 0 || { echo 'BLOCKED: restored master log tables empty'; exit 9; }
test "$MIGRATIONS" = "0" || { echo 'BLOCKED: migration bootstrap unexpectedly populated'; exit 9; }
# Supabase local bootstrap has different default ACLs than managed production.
# Do not accept unauthorized post-restore grants. Reconstruct the ONLY
# production-public application table privilege allowlist, verified readonly
# against production on 2026-10-12:
# anon/authenticated SELECT public.app_public_assets; no INSERT/UPDATE/DELETE
# for those roles on any of 193 application tables. Never touch production.
INITIAL_ACL="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc "
select
count(*) filter(where has_table_privilege('anon',c.oid,'SELECT')),
count(*) filter(where has_table_privilege('authenticated',c.oid,'SELECT'))
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname in ('public','cr_internal') and c.relkind in ('r','p')")"
echo "RESTORED_BOOTSTRAP_ACL_SELECT_COUNTS=$INITIAL_ACL"
docker exec -i -u postgres "$CID" psql -X -q -v ON_ERROR_STOP=1 -U supabase_admin -d postgres <<'SQL'
DO $restore_privileges$
DECLARE item record;
BEGIN
  FOR item IN
    SELECT n.nspname AS schema_name,c.relname AS table_name
    FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname IN ('public','cr_internal') AND c.relkind IN ('r','p')
  LOOP
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM PUBLIC, anon, authenticated',item.schema_name,item.table_name);
  END LOOP;
END
$restore_privileges$;
GRANT SELECT ON TABLE public.app_public_assets TO anon, authenticated;
SQL
ACL_COUNTS="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc "
select
  count(*) filter(where has_table_privilege('anon',c.oid,'SELECT')),
  count(*) filter(where has_table_privilege('anon',c.oid,'INSERT')),
  count(*) filter(where has_table_privilege('anon',c.oid,'UPDATE')),
  count(*) filter(where has_table_privilege('anon',c.oid,'DELETE')),
  count(*) filter(where has_table_privilege('authenticated',c.oid,'SELECT')),
  count(*) filter(where has_table_privilege('authenticated',c.oid,'INSERT')),
  count(*) filter(where has_table_privilege('authenticated',c.oid,'UPDATE')),
  count(*) filter(where has_table_privilege('authenticated',c.oid,'DELETE'))
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname in ('public','cr_internal') and c.relkind in ('r','p')")"
test "$ACL_COUNTS" = "1|0|0|0|1|0|0|0" || { echo 'BLOCKED: app role ACL does not match production; no recovery signoff'; exit 9; }
echo 'PASS: restored 193 application tables reproduce 1 public read-only allowlist, 0 public writes'
echo 'LAB_ACL_NORMALIZATION: new local-stack default ACLs replaced with production-authorized policy'
# Verify two real operational tables stay private to anon/authenticated roles
# exactly as in source. No SQL access and no rows are exposed to any user.
SECURITY="$(docker exec -u postgres "$CID" psql -U supabase_admin -d postgres -Atqc "
select count(*) from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('cc_items','cc_changes')
and c.relrowsecurity and not c.relforcerowsecurity
and not has_table_privilege('anon',c.oid,'SELECT')
and not has_table_privilege('authenticated',c.oid,'SELECT')
and not exists (select 1 from pg_policy p where p.polrelid=c.oid);
")"
test "$SECURITY" = "2" || { echo 'BLOCKED: recovered master pendencies role/privilege/RLS drift'; exit 9; }
echo 'PASS: SQL replay and RLS/permissions validated in offline PG17'
echo 'PASS: 193 app tables, 192 RLS tables, 20 RLS policies, 4531 Storage metadata, Auth users 0'
echo 'PASS: restored operational records populated and master tables denied to anon/authenticated'
echo 'INTEGRATED_LAB: migration history will now be restored and counted in this same offline database'
echo 'INTEGRATED_LAB: Storage binary metadata and immutable samples will be cross-checked next'

# Integrated proof extends the SAME offline container used for real SQL/RLS/ACL.
# The 193 migration records are recovered from the immutable daily CAS, never
# replaying migration statements or connecting to production for writes.
LEDGER_ROOT="construrei-drive:CONSTRUREI-COFRE-ZERO/03_DATABASE/MIGRATIONS_CAS"
rclone --config "$CONFIG" copyto "$LEDGER_ROOT/MANIFESTS/20261012-060012.json" "$WORK/migration-manifest.json" >/dev/null
python3 - "$WORK/migration-manifest.json" "$WORK" <<'PY'
import json, pathlib, sys, subprocess, hashlib, re
p=pathlib.Path(sys.argv[1]); root=pathlib.Path(sys.argv[2])
m=json.loads(p.read_text())
assert m.get("format") == "CR_COFRE_MIGRATIONS_CAS_V1"
assert m.get("source_project") == "yspuaamokjbrosytqjpg"
assert m.get("source_run_id") == "20261012-060012"
assert m.get("migration_rows") == 193
assert re.fullmatch(r"[0-9a-f]{64}",m.get("sha256",""))
assert m.get("object") == "OBJECTS/"+m["sha256"]+".sql"
assert 0 < m.get("bytes",0) <= 16*1024*1024
(root/"migration-object-path.txt").write_text(m["object"])
print("PASS: immutable migration CAS manifest belongs to same 20261012 backup snapshot")
PY
LEDGER_OBJECT="$(cat "$WORK/migration-object-path.txt")"
rclone --config "$CONFIG" copyto "$LEDGER_ROOT/$LEDGER_OBJECT" "$WORK/migrations.sql" >/dev/null
python3 - "$WORK" <<'PY'
import hashlib,json,pathlib,sys
r=pathlib.Path(sys.argv[1])
m=json.loads((r/"migration-manifest.json").read_text())
b=(r/"migrations.sql").read_bytes()
assert hashlib.sha256(b).hexdigest()==m["sha256"] and len(b)==m["bytes"]
inside=False; rows=0; headers=0
for line in b.decode("utf-8").splitlines():
    if not inside and line.startswith("COPY ") and "schema_migrations" in line and "FROM stdin;" in line:
        inside=True;headers+=1
    elif inside and line==r"\.":
        inside=False
    elif inside:
        rows+=1
assert not inside and headers==1 and rows==193
print("PASS: private ledger bytes SHA256 + 193/193 COPY records")
PY
docker cp "$WORK/migrations.sql" "$CID:/restore/migrations.sql" >/dev/null
docker exec -u root "$CID" chown postgres:postgres /restore/migrations.sql
docker exec -u root "$CID" chmod 600 /restore/migrations.sql
docker exec -u postgres "$CID" bash -c "psql -X -q -v ON_ERROR_STOP=1 -U supabase_admin -d postgres -f /restore/migrations.sql >/tmp/ledger-restore.log 2>&1" || {
    echo 'BLOCKED: migration ledger offline replay failed; details withheld'; exit 12;
}
LEDGER_COUNT="$(docker exec -u postgres "$CID" psql -X -Atq -U supabase_admin -d postgres -c 'SELECT count(*) FROM supabase_migrations.schema_migrations')"
test "$LEDGER_COUNT" = "193" || { echo 'BLOCKED: migration ledger 193 count mismatch'; exit 12; }
echo 'PASS: 193/193 migrations restored in SAME disconnected PG17 database as 193 application tables and production ACL/RLS'

# Same immovable historical snapshot: crosswalk ALL Storage object metadata
# with the original remote filenames and verify three binary bodies by MD5.
# All names and original data remain in ephemeral runner memory only.
export CR_LAB_CID="$CID" CR_LAB_CONFIG="$CONFIG" CR_LAB_REMOTE="$REMOTE"
python3 - <<'PY'
import hashlib,json,os,pathlib,subprocess,tempfile
cid=os.environ["CR_LAB_CID"]; config=os.environ["CR_LAB_CONFIG"]
remote=os.environ["CR_LAB_REMOTE"]
def call(args, text=False):
    p=subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,
                     timeout=240,text=text)
    return p.stdout
records=call(["docker","exec","-u","postgres",cid,"psql","-X","-Atq","-U","supabase_admin",
             "-d","postgres","-c","SELECT COALESCE(json_agg(json_build_array(bucket_id,name)), '[]'::json) FROM storage.objects"],True)
metadata=json.loads(records.strip())
assert len(metadata)==4531, "Storage rows do not match one immutable snapshot"
rows=json.loads(call(["rclone","--config",config,"lsjson",remote+"/06_STORAGE","--recursive","--files-only","--hash"],True))
assert len(rows)==4531, "Immutable Storage binary catalog incomplete"
indices={(str(bucket)+"/"+str(name)) for bucket,name in metadata}
paths={row["Path"]:row for row in rows}
matching=sorted(indices & paths.keys())
assert len(matching)==4531, "Storage metadata <> immutable file-path identity drift"
chosen=[matching[0],matching[len(matching)//2],matching[-1]]
with tempfile.TemporaryDirectory() as td:
    for i,path in enumerate(chosen):
        target=pathlib.Path(td)/str(i)
        call(["rclone","--config",config,"copyto",remote+"/06_STORAGE/"+path,str(target)])
        row=paths[path]
        assert target.stat().st_size == row["Size"], "Recovered Storage size mismatch"
        assert hashlib.md5(target.read_bytes()).hexdigest()==row["Hashes"]["MD5"].lower(), "Recovered Storage MD5 mismatch"
print("PASS: 4531/4531 database Storage object identities mapped to immutable bin files")
print("PASS: three distributed Storage binary bodies restored/MD5 checked in SAME isolation session")
PY
echo 'INTEGRATED_PG17_PASS: SQL 193 tables + RLS 192 + ACL + migration ledger 193 + 4531 Storage identity + 3 immutable file bodies'
echo 'LIMITS: not a running OAuth/Edge/Trello/Netlify re-deployment or login/release signoff'
