#!/usr/bin/env bash
# SQL snapshot for existing Cofre Zero CAS fallback. No production writes.
set -euo pipefail
test -n "$SUPABASE_DB_URL" || { echo "::error::Existing DB credential unavailable"; exit 2; }
test "$#" -eq 1 || { echo "::error::Expected one output directory"; exit 2; }
WORK="$1"
mkdir -p "$WORK/03_DATABASE"
chmod 700 "$WORK"
PG_DUMP="/usr/lib/postgresql/17/bin/pg_dump"
test -x "$PG_DUMP"
rclone copyto "construrei-drive:CONSTRUREI-COFRE-ZERO/03_DATABASE/roles.sql" "$WORK/03_DATABASE/roles.sql"

"$PG_DUMP" "$SUPABASE_DB_URL" --schema-only --quote-all-identifiers \
  --exclude-schema "information_schema|pg_*|_analytics|_realtime|_supavisor|auth|etl|extensions|pgbouncer|realtime|storage|supabase_functions|supabase_migrations|cron|dbdev|graphql|graphql_public|net|pgmq|pgsodium|pgsodium_masks|pgtle|repack|tiger|tiger_data|timescaledb_*|_timescaledb_*|topology|vault" |
  sed -E 's/^\\(un)?restrict .*$/-- &/;s/^SET transaction_timeout = 0;/-- &/' \
  > "$WORK/03_DATABASE/schema.sql"

{
  echo "SET session_replication_role = replica;"
  "$PG_DUMP" "$SUPABASE_DB_URL" --data-only --quote-all-identifiers \
    --exclude-schema "information_schema|pg_*|graphql|graphql_public|pgsodium|pgsodium_masks|pgtle|repack|tiger|tiger_data|timescaledb_*|_timescaledb_*|topology|vault|etl|extensions|pgbouncer|realtime|supabase_migrations|_analytics|_realtime|_supavisor" \
    --exclude-table "auth.schema_migrations" \
    --exclude-table "storage.migrations" \
    --exclude-table "supabase_functions.migrations" \
    --schema "*" \
    --exclude-table '"storage"."buckets_vectors"' \
    --exclude-table '"storage"."vector_indexes"' |
    sed -E 's/^\\(un)?restrict .*$/-- &/'
  echo "RESET ALL;"
} > "$WORK/03_DATABASE/data.sql"
for name in roles.sql schema.sql data.sql; do
  test -s "$WORK/03_DATABASE/$name" || { echo "::error::SQL snapshot incomplete"; exit 2; }
done
echo "SQL_EXPORT_CREATED=3 (local ephemeral only; no data printed)"
