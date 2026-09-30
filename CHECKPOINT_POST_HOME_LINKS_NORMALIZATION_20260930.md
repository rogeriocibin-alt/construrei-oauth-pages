# CHECKPOINT POST — HOME LINKS NORMALIZATION — 2026-09-30

- Repository: rogeriocibin-alt/construrei-oauth-pages
- Branch: cr-home-reference-candidate-20260930
- Production: untouched.
- Preview path: https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/home-reference-20260930/
- Candidate navigation commit chain includes 5ffaa0a9543c94ad11ea20f522d1714f17145f0e and syntax fix 3efa29c175fb012ee1861dc4cd5190e5c433f730.
- Preview main commit: 50c65c5da206d4d4b34961cb75788a552267ff09.

## Corrections applied
- Director Dashboard V4 removed from obsolete Pagey route and pointed to the canonical GitHub dashboard v14 route.
- Quick F00→F01 now starts at the canonical F00 route.
- Quick Checklist opens the canonical checklist URL directly.
- Quick Google Meet opens the canonical team Meet directly in a safe external tab.
- Quick Presentation prefers the live 38-page canonical presentation URL.
- Presentation module also prefers the live presentation object over legacy generic link.
- HOME F00–F09 cards now open the real canonical flow routes directly rather than generic iframe workspace.
- “Ver detalhes da operação” now opens the operational flow view, not development status.
- Search and Notifications are explicitly disabled because no real subsystem is currently exposed; no false controls remain active.
- Top Back uses a candidate-local SPA navigation stack instead of browser-history escape.

## Canonical source
Live `centro-operacoes?api=public-summary` response on 2026-09-30:
- `links`, `buttons`, `flows`, `meeting`, `presentation`, `access`.

## Endpoint probes
- Dashboard V4: HTTP 200
- APP: HTTP 200
- F00–F09: HTTP 200 all ten routes
- Checklist: HTTP 200
- Google Meet: HTTP 200
- Presentation live: HTTP 200
- Documentation: HTTP 200

## Static checks
- 47 inline scripts compile with zero syntax errors.
- New canonical top-back inline handler compiles.
- Two legacy generated Acervo onclick string templates remain detectable by static regex but are pre-existing generated template text and were outside HOME Phase 5 scope.
- Visual Phase 4 CSS was not changed in Phase 5.

## Audit
See `HOME_LINK_ACTION_AUDIT_20260930.md`.

## Gate
STOP. Await Rogério functional homologation. Do not propagate identity or promote production.
