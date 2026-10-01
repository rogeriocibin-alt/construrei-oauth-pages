# CHECKPOINT_LIVE_KPI5_PRE_PROMOTION_20261001

## Estado
Candidate vivo e isolado. Produção/centro-operacoes NÃO promovidos.

## UI
- Baseline canônico: 74dd646210d3194319f0eabd75ca1ed9e6002f6a
- Candidate: preview/dashboard-executivo-kpi5-candidate-20261001/
- Último ajuste candidate: fit responsivo F00→F09 em 1366, ainda com F09 parcialmente fora do viewport; NÃO promover enquanto esse ponto não for resolvido ou explicitamente aceito.

## API LIVE criada
Slug:
`cr-dashboard-executivo-summary-candidate-20261001`

Características:
- GET only
- CORS público somente para leitura
- sem persistência
- sem escrita Trello/F00/F01
- sem service role
- usa somente endpoints já existentes
- isolada do link oficial

## KPIs LIVE reconciliados em 01/10/2026
- Serviços em andamento: 11 | R$ 35.459,73
- Aguardando pagamento: 8 | R$ 6.754,70
- Aguardando acerto: 12 | R$ 37.418,48
- F00 pendentes: 4
- F01 pendentes: 4

### Correção importante F01
O snapshot anterior mostrava 5 porque usava `cr_f01_cases_v2`.
Auditoria mostrou que esses registros estavam sem atualização recente (03–04/09/2026), portanto essa tabela não representa o runtime atual.
O runtime canônico corrente usa `cr_flow_handoffs`.
Leitura live atual encontrou 4 casos ativos em F01:
- 200-26 — ESCALONADO
- 100-26 — AGUARDANDO_VISITA
- 724-25 — EM_QUALIFICACAO
- 734-26 — EM_QUALIFICACAO

## Fontes LIVE
- Trello financeiro/obras: `cr-dashboard-gerencial-v4-candidate?api=current&gc=0`
- F00: `cr-f00-intake?api=list`
- F01: `cr-flow-runtime-v2-f01-candidate-20260928?api=list`
- Camada única da HOME: `cr-dashboard-executivo-summary-candidate-20261001`

## Indicadores mantidos indisponíveis
- Visitas do dia
- Orçamentos
- Alertas operacionais

Nenhum zero é inventado.

## Regressão executada
- 1366×768
- 1440×900
- 1536×864
- 1920×1080
- 390×844
- 430×932

Desktop/mobile preservam identidade e 5 KPIs LIVE.
Pendência residual: em 1366×768 o extremo direito da esteira F00→F09 ainda não fica integralmente visível sem overflow. Esse é o único bloqueador visual conhecido antes do GO final.

## Gate atual
NO-GO para alterar `centro-operacoes` enquanto:
1. o fit 1366 da esteira não estiver resolvido/aceito;
2. smoke test final das rotas principais não estiver concluído;
3. Rogério não autorizar explicitamente a promoção.

## Próximo passo
Resolver cirurgicamente apenas o fit F00→F09 em 1366 sem redesenhar, repetir regressão, executar smoke test final e apresentar um único GO/NO-GO para promoção do renderer oficial.

## Regra
Não alterar o link oficial antes do GO.
