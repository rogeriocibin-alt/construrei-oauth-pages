# Checkpoint real — Financeiro 2026 — 24/10/2026
## Correções executadas
1. Supabase Edge `cr-cora-aprovisionamento-v12-candidate-20261023` versão **11** ACTIVE: `existingMatchCandidates` lê diretamente board Trello 2026, verifica unicidade da obra, lista elegível e cartão inalterado, sem chamar `manual-cora-preview` legado. Código integral versionado no commit 1d06592330958019e2e2f8564aec102504fa8cd6.
2. Notebook Rogerio-2022 ONLINE. Teste de rede com Node: GET da função 200 (LEDGER_PERSISTENT); POST `existing-preview` sem autenticação 401 DIRECTOR_SESSION_REQUIRED; POST `bank-status` sem autenticação 401 DIRECTOR_SESSION_REQUIRED. Não confundir com teste E2E autorizado.
3. Banco Supabase `yspuaamokjbrosytqjpg`: criada `public.cr_finance_2026_acerto_lines_v1`, PK(source_card_id,line_number) com referência aos cartões fonte, RLS ENABLED e revogação de acesso anon/authenticated. Inserção por `regexp_split_to_table` das descrições importadas, classes RATEIO_OR_ACERTO, COST_NOTE, BALANCE_NOTE e RECEIPT_NOTE; UPSERT idempotente. Auditoria SQL: RATEIO_OR_ACERTO **1.489 linhas em 263 cartões, 1.423 com valor**; COST_NOTE **1.123 linhas em 275 cartões, 830 com valor**; BALANCE_NOTE **661 linhas em 261 cartões, 258 com valor**; RECEIPT_NOTE **182 linhas em 70 cartões, 160 com valor**. Total **3.455 linhas classificadas**.
## Segurança/limites
Cada linha representa texto Trello, não comprovação bancária nem acerto pago; nenhuma soma desses rótulos deve ser promovida a retiradas definitivas. Nenhum cartão Trello, saldo Cora ou produção V12 alterado.
## Pendências obrigatórias antes da homologação
- Teste E2E real autenticação/preview custo já registrado/confirm/ledger e repetição idempotente; notebook disponível, mas credencial de diretor não fornecida ao backend de teste.
- Parser financeiro canônico e conciliação dos códigos duplicados e lacunas, vinculando linhas aos extratos bancários sem inferir pagamentos.
- Leitor protegido do ledger 2026 no Dashboard, filtros diários e textos históricos; confirmação única de fechamento de período (sem ações duplicadas).
- Resumos mensais/anuais Valores Recebidos 2026, novo card Capital de Giro, capas outubro–dezembro, Gestão Click receivables, Central, Gestor, CI e E2E.
- PR #174 não homologada nem mesclada.
