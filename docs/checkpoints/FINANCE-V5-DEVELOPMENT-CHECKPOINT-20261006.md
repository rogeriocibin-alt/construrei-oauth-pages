# CHECKPOINT — Gestão Financeira V5 — 2026-10-06

## Escopo
Desenvolvimento candidato da Gestão Financeira V5 da CONSTRU-REI, sem promoção oficial e sem gravação financeira real.

## Governança
- Agente/regra de negócio: **Financeiro REI V1**
- Autoridade humana: **Rogério**
- Implementação técnica: camada candidata, aditiva e antirregressão
- Regra: obra fechada não reabre
- Regra: custo posterior segue absorção canônica preservando a origem
- Regra: não inventar valores, impostos, comissões, saldos ou aprovações
- Produção Cora: **INTOCADA**

## Cora
- Stage configurado no Supabase com Client ID, certificado PEM e private key.
- Os três secrets são visíveis no runtime.
- Certificado e private key foram validados e formam o mesmo par criptográfico.
- Client ID corresponde à credencial Stage ativa exibida pela Cora Web.
- Autenticação Stage ainda retorna `invalid_client`.
- Rogério enviou o diagnóstico ao suporte da Cora em 06/10/2026.
- Desenvolvimento financeiro prossegue sem depender da resposta da Cora.
- Fila Cora e botão Provisionar permanecem **DESABILITADOS**.

## Backend candidato
Edge Function:
`cr-finance-v5-candidate-20261006`

Estado atual:
- versão: R2
- modo: `CANDIDATE_READ_ONLY`
- autenticação: sessão canônica `x-cr-session` validada pelo `central-gestao-api`
- rotas:
  - `?api=summary`
  - `?api=cost-centers`
  - `?api=legacy-backfill`
  - `?api=readiness`
  - `?api=health`
- nenhum endpoint de escrita
- requisição sem sessão retorna 401, conforme esperado

Fontes lidas:
- `cr_cases_v1`
- `cr_quotes_v1`
- `cr_quote_approvals_v1`
- `cr_financial_entries_v1`
- `cr_working_capital_state_v1`

## Estado real das fontes canônicas na auditoria
- `cr_cases_v1`: 28 registros
- `cr_quotes_v1`: 0 registros
- `cr_quote_approvals_v1`: 0 registros
- `cr_financial_entries_v1`: 0 registros
- `cr_working_capital_periods_v1`: 0 registros
- `cr_working_capital_state_v1`: 1 registro

Conclusão:
a estrutura canônica já existe, mas o bridge de orçamento/aprovação ainda precisa alimentar `cr_quotes_v1` e `cr_quote_approvals_v1`. Por isso a candidata **não fabrica centros de custo**.

## Bridge legado identificado
A auditoria encontrou casos reais em `cr_cases_v1` provenientes de `TRELLO_GC_RECONCILED`, com referência de orçamento legado, valor histórico e estado financeiro.

Esses registros são exibidos pela V5 apenas como:
**BACKFILL PENDENTE / requer confirmação canônica**.

Eles não são classificados automaticamente como orçamento aprovado e não geram lançamento financeiro.

## Front-end candidato
Arquivo fonte da branch:
`preview/gestao-financeira-v5-cost-center-candidate-20261006/index.html`

Preview isolado publicado no GitHub Pages:
`https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/gestao-financeira-v5-cost-center-candidate-20261006/`

O preview:
- preserva toda a Dashboard V4 atual;
- acrescenta a aba **CENTROS DE CUSTO V5**;
- exibe KPIs canônicos;
- exibe centros de custo apenas quando houver aprovação canônica;
- mostra bridge legado separadamente;
- mostra fila Cora bloqueada;
- mostra plano de contas/classificações;
- mostra arquitetura Captura → Revisão → Centro de Custo → Provisão → Conciliação;
- botão Provisionar permanece desabilitado;
- está rotulado explicitamente como **V5 CANDIDATA**.

Commit de publicação do primeiro preview em main:
`e0eadfaa877e25dd23acf04902682146e7103800`

Commit de sincronização visual/bridge em main:
`36ead121d5fd6121dd2ca126a402ee65367f91e4`

GitHub Pages confirmou build bem-sucedido após a publicação do preview.

## Contrato de banco — NÃO APLICADO
Arquivo:
`docs/finance/FINANCE_V5_CANDIDATE_SCHEMA_20261006.sql`

Commit:
`e701cd82d66acca849825b7100c00e85a7b98dc8`

O arquivo termina deliberadamente em `ROLLBACK` e não é migration de produção.

Desenha:
1. `cr_financial_cost_centers_v1` como VIEW derivada da última aprovação canônica;
2. `cr_cora_review_queue_v1` como fila operacional, nunca como ledger paralelo;
3. provisionamento futuro sempre para `cr_financial_entries_v1`;
4. idempotência por movimento Cora;
5. revisão humana obrigatória antes de Provisionar;
6. conciliação separada do ato de provisionar.

## Próximo elo técnico
1. Validar visual e navegação da aba V5 no preview.
2. Construir o bridge **orçamento real → cr_quotes_v1 → cr_quote_approvals_v1** sem inferir aprovação onde não há evidência.
3. Mapear casos legados reais para backfill com confirmação humana.
4. Manter Cora isolada até resposta do suporte.
5. Só depois desenhar/ativar a escrita transacional de Provisionar em candidata.
