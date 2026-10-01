# CENTRAL LINK ROUTE MATRIX — 2026-10-01

Source of truth: live `centro-operacoes?api=public-summary` plus runtime files on `cr-central-global-link-audit-20261001`.

| Origem | Elemento | Destino canônico | Tipo | Status |
|---|---|---|---|---|
| Central | UI principal | https://rogeriocibin-alt.github.io/construrei-oauth-pages/central/ | externo/canônico | OK |
| Central | APP | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=app | redirect canônico | REQUER HOMOLOGAÇÃO |
| Central | F00 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f00 | fluxo | OK |
| Central | F01 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f01 | fluxo | OK |
| Central | F02 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f02 | fluxo | OK |
| Central | F03 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f03 | fluxo | OK |
| Central | F04 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f04 | fluxo | OK |
| Central | F05 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f05 | fluxo | OK |
| Central | F06 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f06 | fluxo | OK |
| Central | F07 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f07 | fluxo | OK |
| Central | F08 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f08 | fluxo | OK |
| Central | F09 | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f09 | fluxo | OK |
| Central | Checklist | https://checklistobrasconstrurei.vercel.app | externo | OK |
| Central | Google Meet | https://meet.google.com/xtw-rihq-jwi | externo | OK |
| Central | Apresentação viva | https://rogeriocibin-alt.github.io/construrei-oauth-pages/central/presentation.html?rev=cr38-live-20260930-ppt1 | externo/canônico | OK |
| Central | Dashboard Gerencial V4 | https://rogeriocibin-alt.github.io/construrei-oauth-pages/central-runtime/dashboard/?rev=dashboard-v14-protected-20260929-2258 | externo/canônico | OK |
| Central | Documentação | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes?open=docs | redirect canônico | OK |
| Central | Academy | https://rogeriocibin-alt.github.io/construrei-oauth-pages/central/#academy | hash interno | CORRIGIDO NO CANDIDATE |
| Central | Rogério — Diretor | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes?open=admin | redirect canônico | OK |
| Central | Éder — Admin Técnico | https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes?open=technical | redirect canônico | OK |

## Observação crítica do APP
O endpoint canônico `?mode=app` responde HTTP 200, porém atualmente termina em:
`central-runtime/app/?rev=cr-app-v766-visual-canonical-20260930-r1`.

Essa não é a nova candidata histórica reconhecida por Rogério (`cr-app-audited-central-alignment-20260930`). Como produção não pode ser promovida nesta fase, o item fica classificado como **REQUER HOMOLOGAÇÃO/PROMOÇÃO** e não foi mascarado com URL de preview.

## Dependências temporárias
- 1 stylesheet Pagey externo removido do candidate.
- 12 scripts de banner Pagey removidos.
- runtime `cr-v2.js` antes hospedado no Pagey foi internalizado em `central/assets/cr-v2-local.js`.
- CSS shell local existente `central/assets/cr-v2-local.css` passou a ser usado.
- 21 inclusões duplicadas do Umami foram reduzidas a 1.
