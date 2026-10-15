#!/usr/bin/env bash
# Offline-only regression for a changing Supabase bucket, with fake rclone.
set -euo pipefail
ROOT="$(mktemp -d)"
trap 'rm -rf "$ROOT"' EXIT
mkdir -p "$ROOT/mock-bin"
cat > "$ROOT/mock-bin/rclone" <<'RCLONE'
#!/usr/bin/env bash
set -euo pipefail
echo "$1" >> "$CR_TEST_OPS"
case "$1" in
  copy) exit 0 ;;
  check)
    value=0
    [[ ! -f "$CR_TEST_CHECK_COUNT" ]] || value="$(cat "$CR_TEST_CHECK_COUNT")"
    value=$((value+1))
    printf '%s' "$value" > "$CR_TEST_CHECK_COUNT"
    if (( value <= CR_TEST_FAIL_CHECKS )); then exit 1; fi
    exit 0 ;;
  *) echo "Unexpected rclone action" >&2; exit 2 ;;
esac
RCLONE
chmod +x "$ROOT/mock-bin/rclone"
export PATH="$ROOT/mock-bin:$PATH"
export CR_STORAGE_RETRY_DELAY_SECONDS=0
export CR_TEST_OPS="$ROOT/ops"
export CR_TEST_CHECK_COUNT="$ROOT/check-count"
run_case() {
  local failures="$1" expected_result="$2" checks="$3"
  export CR_TEST_FAIL_CHECKS="$failures"
  : > "$CR_TEST_OPS"
  rm -f "$CR_TEST_CHECK_COUNT"
  if bash .github/scripts/cr_cofre_copy_storage_verified.sh "fake-s3:" "$ROOT/storage" > "$ROOT/output" 2>&1; then
    [[ "$expected_result" == "pass" ]] || { echo "Unexpected success, failures=$failures"; exit 1; }
    grep -q 'COFRE_STORAGE_VERIFIED=PASS' "$ROOT/output"
  else
    [[ "$expected_result" == "fail" ]] || { echo "Unexpected failure, failures=$failures"; cat "$ROOT/output"; exit 1; }
    grep -q 'no history/CURRENT publication is permitted' "$ROOT/output"
  fi
  [[ "$(grep -c '^check$' "$CR_TEST_OPS")" == "$checks" ]]
  [[ "$(grep -c '^copy$' "$CR_TEST_OPS")" == "$checks" ]]
  ! grep -Eq 'sync|delete|purge|copyto|move' "$CR_TEST_OPS"
}
run_case 0 pass 1
run_case 1 pass 2
run_case 3 fail 3
echo "COFRE_STORAGE_OFFLINE_CONTRACT=PASS (immediate, eventual, fail-closed)"
