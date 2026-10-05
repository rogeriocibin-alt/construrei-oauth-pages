#!/usr/bin/env bash
set -euo pipefail

ROOT="/tmp/construrei"
RUN_ID="$(date -u +'%Y%m%d-%H%M%S')"
WORK="$ROOT/WORK/DAILY_$RUN_ID"
REMOTE="construrei-drive:CONSTRUREI-BACKUP-AUTO/CURRENT"
HISTORY="construrei-drive:CONSTRUREI-BACKUP-AUTO/HISTORY/$RUN_ID"
DB_URL="$(cat /secrets-db/db-url)"

mkdir -p "$WORK/03_DATABASE" "$HOME/.config/rclone"
cp /secrets-rclone/rclone.conf "$HOME/.config/rclone/rclone.conf"
chmod 600 "$HOME/.config/rclone/rclone.conf"

rclone lsd construrei-drive: >/dev/null
rclone lsd construrei-s3: >/dev/null
rclone copyto "construrei-drive:CONSTRUREI-COFRE-ZERO/03_DATABASE/roles.sql" "$WORK/03_DATABASE/roles.sql"

pg_dump "$DB_URL" --schema-only --quote-all-identifiers \
  --exclude-schema "information_schema|pg_*|_analytics|_realtime|_supavisor|auth|etl|extensions|pgbouncer|realtime|storage|supabase_functions|supabase_migrations|cron|dbdev|graphql|graphql_public|net|pgmq|pgsodium|pgsodium_masks|pgtle|repack|tiger|tiger_data|timescaledb_*|_timescaledb_*|topology|vault" \
| sed -E 's/^\\(un)?restrict .*$/-- &/' \
| sed -E 's/^SET transaction_timeout = 0;/-- &/' \
| sed -E "/^--/d" \
> "$WORK/03_DATABASE/schema.sql"

{
  echo "SET session_replication_role = replica;"
  pg_dump "$DB_URL" --data-only --quote-all-identifiers \
    --exclude-schema "information_schema|pg_*|graphql|graphql_public|pgsodium|pgsodium_masks|pgtle|repack|tiger|tiger_data|timescaledb_*|_timescaledb_*|topology|vault|etl|extensions|pgbouncer|realtime|supabase_migrations|_analytics|_realtime|_supavisor" \
    --exclude-table "auth.schema_migrations" \
    --exclude-table "storage.migrations" \
    --exclude-table "supabase_functions.migrations" \
    --schema "*" \
    --exclude-table '"storage"."buckets_vectors"' \
    --exclude-table '"storage"."vector_indexes"' \
  | sed -E 's/^\\(un)?restrict .*$/-- &/'
  echo "RESET ALL;"
} > "$WORK/03_DATABASE/data.sql"

cd "$WORK"
find 03_DATABASE -type f -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS.txt
STORAGE_COUNT="$(rclone lsf construrei-s3: --files-only --recursive | wc -l | tr -d ' ')"

cat > BACKUP_STATUS.txt <<EOF
CONSTRU-REI CLOUD BACKUP
UTC: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
RUN_ID: $RUN_ID
DATABASE_FILES: 3
STORAGE_FILES: $STORAGE_COUNT
SOURCE_PROJECT: yspuaamokjbrosytqjpg
EOF

rclone sync "$WORK" "$REMOTE" \
  --exclude "/06_STORAGE/**" \
  --backup-dir "$HISTORY" \
  --create-empty-src-dirs

rclone sync construrei-s3: "$REMOTE/06_STORAGE" \
  --backup-dir "$HISTORY/06_STORAGE" \
  --create-empty-src-dirs

rclone check "$WORK" "$REMOTE" --exclude "/06_STORAGE/**"
rclone check construrei-s3: "$REMOTE/06_STORAGE"

RESTORE="$ROOT/RESTORE-DRILL-$RUN_ID"
mkdir -p "$RESTORE/03_DATABASE" "$RESTORE/storage"
rclone copy "$REMOTE/03_DATABASE" "$RESTORE/03_DATABASE" --create-empty-src-dirs

for f in roles.sql schema.sql data.sql; do
  test "$(sha256sum "$WORK/03_DATABASE/$f" | awk '{print $1}')" = "$(sha256sum "$RESTORE/03_DATABASE/$f" | awk '{print $1}')"
done

mapfile -t SAMPLES < <(rclone lsf construrei-s3: --files-only --recursive | sort | head -n 3)
test "${#SAMPLES[@]}" -eq 3
i=0
for rel in "${SAMPLES[@]}"; do
  i=$((i+1))
  src="$RESTORE/storage/source-$i"
  dst="$RESTORE/storage/drive-$i"
  rclone copyto "construrei-s3:$rel" "$src"
  rclone copyto "$REMOTE/06_STORAGE/$rel" "$dst"
  test "$(sha256sum "$src" | awk '{print $1}')" = "$(sha256sum "$dst" | awk '{print $1}')"
done

echo "RESTORE_DRILL=PASS"
echo "RUN_ID=$RUN_ID"
echo "STORAGE_FILES=$STORAGE_COUNT"
