# CHECKPOINT PRE — CENTRAL GLOBAL LINK AUDIT — 2026-10-01

- Repository: rogeriocibin-alt/construrei-oauth-pages
- Branch: cr-central-global-link-audit-20261001
- Base: cr-home-canonical-frozen-20260930
- Production: untouched.
- Scope: global navigation/link audit only.

## Canonical route source
Live public-summary from centro-operacoes, captured 2026-10-01.
Canonical APP/F00–F09/Checklist/Meet/Presentation/Dashboard/Docs routes are taken from this source.

## Invariants
- Do not alter business logic, data, Supabase schema/RLS, Trello, GestãoClick or finance.
- Do not promote production.
- Correct only proven route/resource drift.
- Temporary Pagey resources are considered non-canonical and must not remain in the candidate if removable without regression.
