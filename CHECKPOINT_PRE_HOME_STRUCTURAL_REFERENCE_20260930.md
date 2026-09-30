# CHECKPOINT PRE — HOME STRUCTURAL REFERENCE — 2026-09-30

- Repository: rogeriocibin-alt/construrei-oauth-pages
- Branch: cr-home-reference-candidate-20260930
- Candidate head before Phase 2: 7cb8167e9c996879fa7997bb38f7d8d7635a69d0
- Scope: structural rebuild of HOME / #dashboard and shared visual shell only.
- Reference: approved Central dashboard image supplied by Rogério on 2026-09-30.
- Production: untouched.
- No Supabase schema/RLS/Edge Function/API/database/Trello/GestãoClick/finance changes.
- Preserve current JS navigation, auth, fetch endpoints, resource routes and non-HOME modules.

## Baseline diff vs blue canonical
- CHECKPOINT_POST_HOME_REFERENCE_20260930.md: added (37 changes)
- CHECKPOINT_PRE_HOME_REFERENCE_20260930.md: added (22 changes)
- central-runtime/ui/cr-home-reference-20260930.css: added (72 changes)
- central/index.html: modified (6 changes)

## Phase 2 gate
Rebuild the HOME DOM and scoped CSS, preserve functional identifiers and stop before propagation/promotion.
