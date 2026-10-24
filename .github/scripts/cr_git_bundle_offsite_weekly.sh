#!/usr/bin/env bash
# Cofre Zero: Git history private offsite mirror using existing Drive/rclone credentials.
# Public repo code only; never export production secrets, tokens, .env or workflow secrets.
set -euo pipefail
umask 077

selftest() {
  local root
  root="$(mktemp -d)"
  trap 'rm -rf "$root"' EXIT
  git init -q -b main "$root/source"
  git -C "$root/source" config user.email 'cofre-test@example.invalid'
  git -C "$root/source" config user.name 'Cofre Test'
  printf 'Cofre Zero offline smoke test\n' > "$root/source/sample.txt"
  git -C "$root/source" add sample.txt
  git -C "$root/source" commit -qm 'fixture'
  local rev
  rev="$(git -C "$root/source" rev-parse HEAD)"
  git -C "$root/source" bundle create "$root/snapshot.bundle" --all
  git -C "$root/source" bundle verify "$root/snapshot.bundle" >/dev/null
  git clone -q "$root/snapshot.bundle" "$root/restored"
  git -C "$root/restored" cat-file -e "${rev}^{commit}"
  test "$(git -C "$root/restored" show HEAD:sample.txt)" = 'Cofre Zero offline smoke test'
  echo 'GIT_BUNDLE_OFFLINE_RESTORE_PASS'
}
if [[ "${1:-}" == '--selftest' ]]; then selftest; exit 0; fi
test "$#" -eq 0 || { echo 'Unsupported argument' >&2; exit 2; }
test "${GITHUB_EVENT_NAME:-}" = 'schedule' || { echo 'Scheduled-only offsite policy'; exit 3; }
test "${GITHUB_REF:-}" = 'refs/heads/main' || { echo 'Main branch required'; exit 3; }
test -n "${RCLONE_CONFIG_B64:-}" && test -n "${GITHUB_SHA:-}" || { echo 'Missing required read-only authorization'; exit 4; }
WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; rm -f "$HOME/.config/rclone/rclone.conf"; }
trap cleanup EXIT
mkdir -p "$HOME/.config/rclone"
printf '%s' "$RCLONE_CONFIG_B64" | base64 --decode > "$HOME/.config/rclone/rclone.conf"
chmod 600 "$HOME/.config/rclone/rclone.conf"
rclone lsd construrei-drive: >/dev/null
test "$(git rev-parse HEAD)" = "$GITHUB_SHA"
test "$(git rev-list --count HEAD)" -gt 10
# checkout fetch-depth=0 populates remote branches/tags for a complete bundle.
git bundle create "$WORK/history.bundle" --all
git bundle verify "$WORK/history.bundle" >/dev/null
BYTES="$(stat -c '%s' "$WORK/history.bundle")"
test "$BYTES" -gt 10000 && test "$BYTES" -lt 157286400 || { echo 'Bundle outside safe size limit'; exit 8; }
SHA="$(sha256sum "$WORK/history.bundle" | awk '{print $1}')"
RUN_ID="$(date -u +'%Y%m%d-%H%M%S')"
ROOT='construrei-drive:CONSTRUREI-BACKUP-AUTO/HISTORY_CAS/GIT_OFFSITE'
# Immutable content address avoids reuploading an identical bundle.
rclone copyto "$WORK/history.bundle" "$ROOT/OBJECTS/$SHA.bundle" --immutable --retries 3 >/dev/null
rclone copyto "$ROOT/OBJECTS/$SHA.bundle" "$WORK/restored.bundle" --retries 3 >/dev/null
test "$(sha256sum "$WORK/restored.bundle" | awk '{print $1}')" = "$SHA"
cmp "$WORK/history.bundle" "$WORK/restored.bundle"
git bundle verify "$WORK/restored.bundle" >/dev/null
git clone -q "$WORK/restored.bundle" "$WORK/restored"
git -C "$WORK/restored" cat-file -e "${GITHUB_SHA}^{commit}"
export BUNDLE_SHA="$SHA" BUNDLE_BYTES="$BYTES" BUNDLE_RUN_ID="$RUN_ID"
python3 - "$WORK/manifest.json" <<'PY'
import json,os,sys
m={"format":"CONSTRUREI_GIT_OFFSITE_CAS_V1",
   "source":"rogeriocibin-alt/construrei-oauth-pages",
   "created_utc":os.environ["BUNDLE_RUN_ID"],
   "main_sha":os.environ["GITHUB_SHA"],
   "object":"OBJECTS/"+os.environ["BUNDLE_SHA"]+".bundle",
   "sha256":os.environ["BUNDLE_SHA"],
   "bytes":int(os.environ["BUNDLE_BYTES"]),
   "independent_git_clone_verified":True,
   "history_full":True,"production_modified":False}
with open(sys.argv[1],"w",encoding="utf-8") as f:
    json.dump(m,f,ensure_ascii=False,sort_keys=True)
PY
rclone copyto "$WORK/manifest.json" "$ROOT/MANIFESTS/$RUN_ID.json" --immutable --retries 3 >/dev/null
rclone copyto "$ROOT/MANIFESTS/$RUN_ID.json" "$WORK/manifest-readback.json" --retries 3 >/dev/null
cmp "$WORK/manifest.json" "$WORK/manifest-readback.json"
echo "GIT_BUNDLE_OFFSITE_RESTORE_PASS: full history, remote readback, cloned revision verified"
echo "RUN_ID=$RUN_ID SHA256=$SHA BYTES=$BYTES"
