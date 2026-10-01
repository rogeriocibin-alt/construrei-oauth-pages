# CHECKPOINT POST — CENTRAL CANONICAL LINKS ONLY — 2026-10-01

- Base: cr-home-canonical-frozen-20260930
- Candidate: cr-central-canonical-links-only-20261001
- Candidate head: 305b29dba5a4d9a9dd2edf15e55aad5f3efc30aa
- Preview main commit: 538ea6baeac2b67315a3f9416891875a3c9611d8
- Preview: https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/central-canonical-links-only-20261001/
- Production: untouched.

## Visual antiregression
- Canonical HOME CSS byte-equivalent.
- CSS SHA base/candidate: 1dc2b084b06cec04e2b43d07070b6f323d9abb24
- central/index.html becomes byte-equivalent to frozen base when the single hash-route bridge is removed.
- No legacy/local CSS added.
- No shell replacement.
- No Pagey removal or substitution performed in this phase.
- Stable frozen preview and new links-only preview were rendered at 1536×1024 and 390×844 and are visually indistinguishable apart from live timestamps/content refresh.
- Additional renders generated at 1920×1080 and 1366×768.

## Functional checks
- Central inline scripts: zero syntax errors.
- Academy direct hash route: confirmed active; #academy opens CONSTRU-REI Academy.
- APP endpoint: HTTP 200; still points to published v7.6.6 revision.
- F00–F09: 10/10 HTTP 200.
- Checklist: HTTP 200.
- Meet: HTTP 200.
- Presentation: HTTP 200.
- Dashboard V4: HTTP 200.
- Documentation: HTTP 200.

## Files changed from frozen base
- central/index.html — JS-only hash route bridge.
- central-runtime/dashboard/index.html — external-link behavior only.
- central-runtime/f00/index.html — rel hardening only.
- central-runtime/f01/index.html — rel hardening only.
- central-runtime/f02/index.html — rel hardening only.
- central-runtime/f03/index.html — rel hardening only.
- checkpoint/report docs.

## Gate
STOP.
Do not promote Central or APP.
Await Rogério homologation.
