# CHECKPOINT POST — HOME STRUCTURAL REFERENCE — 2026-09-30

- Repository: rogeriocibin-alt/construrei-oauth-pages
- Branch: cr-home-reference-candidate-20260930
- Candidate head before checkpoint: e825471af63e6b745cff76787b99a17420505069
- Production: unchanged.
- Promotion: not performed.

## Implemented
- Structural rebuild of HOME / #dashboard.
- New topbar with back, search, notifications placeholder, avatar/profile area.
- Canonical hero with highlighted CONSTRU-REI, six navigation targets, skyline treatment, slogan, logo and dynamic date.
- 8 operational KPI slots with semantic cards. Unknown operational sources intentionally render as “—” instead of fake data.
- 7 quick-access slots including injected Dashboard Gerencial V4 and F00 → F01.
- F00–F09 compact executive card presentation.
- Pendências Vivas with derived counts from existing board items.
- Desenvolvimento / Saúde Técnica panel with verified vs. unverified states.
- Responsive desktop/mobile behavior.
- Candidate-only KPI structural lock to prevent legacy compatibility script from reverting the HOME KPIs.

## Anti-regression validation
- All 46 inline scripts compile successfully.
- Non-HOME DOM from #status onward is byte-equivalent to the pre-Phase-2 candidate.
- All pre-existing absolute URLs remain present; no existing endpoint URL was lost.
- APP route preserved.
- centro-operacoes API preserved.
- central-gestao-api preserved.
- No Supabase schema/RLS/Edge Function/database/Trello/GestãoClick/finance changes.
- Desktop screenshot validated at 1536x1024.
- Mobile screenshot validated at 390x844.
- Local preview updated on Rogerio-2022 and remains isolated from production.

## Files changed in Phase 2
- central/index.html
- central-runtime/ui/cr-home-reference-20260930.css
- checkpoint documentation only.

## Known data gaps by design
- Serviços em andamento
- Aguardando pagamento
- Aguardando acerto
- Visitas do dia
- F00/F01 operational counts
- Orçamentos
- aggregate API/integration/database/environment metrics

These remain neutral/“—”/“Não verificado” until a real source is mapped. No values were fabricated.

## Gate
STOP. Await Rogério visual homologation before propagation to APP, Dashboard V4, Presentation, Academy or F00–F09 and before any production promotion.

## Diff vs blue canonical
- CHECKPOINT_POST_HOME_REFERENCE_20260930.md: added (37 changes)
- CHECKPOINT_PRE_HOME_REFERENCE_20260930.md: added (22 changes)
- CHECKPOINT_PRE_HOME_STRUCTURAL_REFERENCE_20260930.md: added (19 changes)
- central-runtime/ui/cr-home-reference-20260930.css: added (140 changes)
- central/index.html: modified (160 changes)
