# CHECKPOINT PRE — CENTRAL RESPONSIVE FINAL V2 — 2026-10-01

- Candidate: cr-central-responsive-final-20261001
- Base functional/visual: cr-central-canonical-links-only-20261001
- Goal: consolidate notebook 100% + mobile + crisp sidebar drawer.
- Production: untouched.

## Scope
- Consolidate responsive rules in central-runtime/ui/cr-responsive-final-20261001.css.
- Remove temporary inline mobile hardening layers from central/index.html.
- Preserve canonical HOME CSS, links, routes, handlers, data, APP, Dashboard V4 and F00–F09.

## Mobile sidebar requirements
- solid/opaque sidebar
- filter: none
- backdrop-filter: none
- no scale transform
- overlay may darken background only, no blur
- sidebar z-index above overlay
