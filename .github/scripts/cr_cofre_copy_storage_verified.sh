#!/usr/bin/env bash
# Consistent Supabase Storage read; retry objects created during transfer.
# Never mutate source, CURRENT, HISTORY or any SQL on a failed check.
set -euo pipefail
SOURCE="${1:?Expected source remote}"
DESTINATION="${2:?Expected local destination}"
MAX_ATTEMPTS=3
DELAY_SECONDS="${CR_STORAGE_RETRY_DELAY_SECONDS:-15}"
[[ "$DELAY_SECONDS" =~ ^[0-9]+$ ]] || { echo "Invalid retry delay" >&2; exit 2; }
for (( attempt=1; attempt<=MAX_ATTEMPTS; attempt++ )); do
  if rclone copy "$SOURCE" "$DESTINATION" --create-empty-src-dirs && rclone check "$SOURCE" "$DESTINATION"; then
    echo "COFRE_STORAGE_VERIFIED=PASS attempt=$attempt"
    exit 0
  fi
  if (( attempt == MAX_ATTEMPTS )); then
    echo "::error::Supabase Storage consistency check failed after $MAX_ATTEMPTS attempts; no history/CURRENT publication is permitted."
    exit 1
  fi
  echo "::warning::Supabase Storage changed or copy/check failed; retrying copy+check, attempt $attempt/$MAX_ATTEMPTS"
  sleep "$DELAY_SECONDS"
done
