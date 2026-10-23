# CONSTRU-REI — V12 | execução do prompt de correção geral
**22/10/2026 • CR Assertivo + Financeiro REI (revisão técnica) • PR #142 DRAFT**

## Correções de código realizadas
1. Capital de Giro da V11 recuperado no ambiente **RESULTADOS E ACERTOS**: painel `#v11cap` existia, mas estava oculto por CSS `display:none!important`; regra específica `#fin #v11cap` reexibe o controle sem exibir saldo manual local ou comprovantes pendentes.
2. Atalho **CAPITAL DE GIRO · CONSULTAR E LANÇAR** na Visão Executiva leva ao painel V11 em dois cliques/toques; tela lê períodos da função existente `cr-capital-despesas-v11-candidate-20261009` e conserva preview/alocação por saldos.
3. Exceção restrita no `v12-netguard` autoriza apenas POST `action=debit` ao endpoint de Capital V11 autenticado; demais métodos mutáveis legados e fechamento de obras permanecem bloqueados. Nenhum lançamento foi executado nesta implantação.
4. Em falha ambígua, o formulário de Capital mantém o reenvio bloqueado e exige consulta prévia aos cards; evita repetição indevida após potencial atualização parcial.
5. Motor de apuração do painel executivo recalcula **subconjuntos de obras com receita, custo e lucro aritmeticamente equivalentes**, deduplicando por obra e excluindo registros sem identificador, ausentes ou incompatíveis. Isso não transforma totais globais divergentes em lucros falsos: a interface identifica explicitamente a fração de obras e quantas ficaram de fora.
6. O módulo **RESULTADOS E ACERTOS** passou a mostrar painel de subtotal comparável com receitas, custos, lucro e margem calculados sobre as mesmas obras; números históricos originais permanecem preservados.
7. `finance-core.mjs` recebeu função pura `apurarObrasComparaveis()` com cenários de perdas, duplicações e dados incompletos; testes adicionados. Smoke CI cobre navegação para Capital V11, exceção restrita, subtotais e rejeição a reenvio após erro.

## Publicação isolada
- **Página candidata em main** (não é a V11 oficial): https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v12-validacao-20261021/?v=24232b18
- **Commit de publicação:** `24232b188bcb2571c433f5cdd7c96f5eceb91cef`.
- **Blob HTML idêntico ao da branch candidata na publicação:** `0b04e972df15434d83e6faab1888f614c04a8e7d`.
- **GitHub Pages:** run 39800931575, SUCCESS. **Verificação da candidata publicada:** run 39800931568, SUCCESS.
- **Verificação sintática independente:** 9 scripts inline válidos, IDs HTML únicos. Smoke reproduzido em V8: 79 verificações offline. CI da branch precisa ser confirmado no último commit `f2eecfaccd9ae1911c2411edcf5016cdaa23912c` antes de homologação.

## Fontes vivas verificadas — somente leitura
- `public.cr_working_capital_state_v1`: gerado **R$ 20.648,65**, consumido **R$ 17.291,96**, disponível **R$ 3.356,69**, pendente fora do saldo **R$ 287,46**; **26 períodos**, 0 divergências de título; leitura 22/10/2026.
- `cora_cache.balance_snapshot`: **R$ 25.815,55**, origem `CORA_OFFICIAL_API`, snapshot 22/10/2026 às 14:55 UTC; **não representa garantia de saldo atual contínuo**. `live_sync_state.last_error` registrava TimeoutError nessa leitura; manter separação entre snapshot, saldo atual e integridade de extrato.
- `public.cr_finance_v12_operations`: **0 operações**, portanto nenhuma gravação de lançamentos V12 confirmada por teste operacional nesta execução.
- Nenhum custo de infraestrutura, credencial, saldo bancário, obra fechada, rateio ou lançamento Trello foi alterado diretamente por esta execução.

## Pendências/gates não homologados
1. **Conciliação financeira completa** de obras e retiradas Trello × Cora de 2023–2026 com comprovantes; o vídeo expôs bases divergentes e elas não foram artificialmente unificadas.
2. **Teste E2E de escrita isolado**, incluindo confirmação do card destino, concorrência e falha parcial; testes de fixture/smoke não substituem o E2E.
3. **Revisão do gateway de débito V11:** auth por sessão existente, não recriado. Endurecer permissões servidoras se houver revisão de papéis, preservando o funcionamento V11.
4. **Aprovação visual e funcional em notebook e celular**, sem Opera/Remote Desktop conectado durante esta sessão.
5. **Cora histórico:** 46 competências no cache, mas somente 6 com saldo oficial reconciliado, 38 sem comprovação de saldo e duas diferenças históricas de 2023; não confundir movimentos presentes com prova de saldos.
6. Confirmar workflow CI do commit final da branch e manter PR #142 DRAFT até aceite.

## Restrições honradas
Produção V11, alias oficial, Central, credenciais Cora, banco de dados, cartões financeiros e regras de rateio não foram alterados. Publicada somente a rota isolada da candidata, sem merge da PR. Não declarar homologação total até comprovar os gates acima.
