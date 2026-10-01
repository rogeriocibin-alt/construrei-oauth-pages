#!/usr/bin/env bash
set -euo pipefail

EXPECTED_COMMIT="92ef8f27d71ac176abc6452df165a048c4405d60"
APPROVED_FILE="preview/central-approved-router-candidate-20261001/index.html"
EXPECTED_BLOB="b90367bed503245a5bea9b4db4f15b46622ab6b2"

IMMUTABLE_REFS=(
  "cr-central-canonical-approved-20261001"
  "CHECKPOINT_CENTRAL_CANONICAL_APPROVED_20261001"
  "freeze/central-canonical-92ef8f27"
)

for ref in "${IMMUTABLE_REFS[@]}"; do
  echo "[guard] fetching $ref"
  git fetch --quiet origin "refs/heads/${ref}:refs/remotes/origin/${ref}"
  actual_commit="$(git rev-parse "refs/remotes/origin/${ref}")"
  if [[ "$actual_commit" != "$EXPECTED_COMMIT" ]]; then
    echo "ERROR: protected reference moved: $ref -> $actual_commit"
    exit 1
  fi
done

actual_blob="$(git rev-parse "${EXPECTED_COMMIT}:${APPROVED_FILE}")"
if [[ "$actual_blob" != "$EXPECTED_BLOB" ]]; then
  echo "ERROR: approved HOME blob changed: $actual_blob"
  exit 1
fi

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT
git show "${EXPECTED_COMMIT}:${APPROVED_FILE}" > "$tmp_file"

required_markers=(
  'id="side"'
  'crAppCanonicalNav'
  'data-page="dashboard"'
  'data-page="flows"'
  'data-page="homolog"'
  '?open=docs'
  '?open=admin'
  '?open=technical'
  'central-atendimento?mode=app'
  'APP CONSTRU-REI'
  'Dashboard'
  'Apresentação'
  'Academy'
  'Documentação'
  'F00'
  'F01'
  'F02'
  'F03'
  'F04'
  'F05'
  'F06'
  'F07'
  'F08'
  'F09'
)

for marker in "${required_markers[@]}"; do
  if ! grep -Fq -- "$marker" "$tmp_file"; then
    echo "ERROR: canonical marker missing: $marker"
    exit 1
  fi
done

echo "OK: all immutable references point to ${EXPECTED_COMMIT}"
echo "OK: approved HOME blob is ${EXPECTED_BLOB}"
echo "OK: router/menu/module markers present"
