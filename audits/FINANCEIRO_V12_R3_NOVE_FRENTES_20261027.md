# CONSTRU-REI — R3: nove frentes de gestão financeira | checkpoint 27/10/2026

## Escopo e versionamento
- Branch: `candidate/financeiro-v12-r3-nove-frentes-20261027`.
- Frontend: `preview/financeiro-v12-diretoria-r3-20261027/index.html`; camada aditiva sobre a R2, sem substituição do HTML oficial de produção.
- Edge read-only: `candidates/financeiro-v12-r3-risk-readonly-20261027/index.ts`; deploy `cr-v12-r3-risk-readonly-20261027` **v2 ACTIVE**, `GET` exige sessão ADMIN_MASTER_ROGERIO, `POST` recusado; `verify_jwt=false` somente porque a função verifica explicitamente a sessão interna via `central-gestao-api?api=me`, nega origem externa e não aceita gravação.
- Suite: `preview/financeiro-v12-diretoria-r3-20261027/index.test.cjs`. Regressão independente da R2. Produção oficial não alterada; Cofre Zero e acertos liquidados preservados.

## Matriz das nove frentes: entrega concreta e limite verificado

| Frente | Implementação R3 | Pendência para afirmar 100% |
| --- | --- | --- |
| 1. KPIs | Mostra base principal, distinção de receita operacional/acertos, bloqueio de margem inválida e ticket apenas para escopos comparáveis | Reconciliar divergências antigas e fonte bancária real por transação |
| 2. Custos | Custos e categorias da API, pesquisa por obra/texto, filtro de categoria, lista de não classificados, exportação CSV com proteção contra fórmulas | Auditar classificação dos valores citados no vídeo (R$ 299.426,50); nenhum custo foi reclassificado |
| 3. Ganhos | Éder, Rogério, Fabrício, Gabrielly e históricos; rateio declarado, apoio/diária como custo, anotação Cora independente | Conferir identidades de terceiros, competências e saques efetivamente liquidados na Cora |
| 4. Cora × Trello | Comparação sem soma indevida, fontes etiquetadas, nova visão de anotações somente informativas e gaps de origem | Vinculação de transações bancárias a obra/beneficiário e extrato canônico com comprovantes |
| 5. Fechamento | Preflight servidor autenticado `preview`/`preview-diagnostic`, valida datas, códigos de obra, duplicatas e mostra fingerprint/totais, sem commit | PR #174: teste real de CG/ledger/mês, recuperações, idempotência, competência cruzada e consolidação anual; nenhum envio efetuado |
| 6. UX | Cinco painéis responsivos; filtros mobile, texto de escopo, ações próximas dos dados | QA Android real com sessão diretor |
| 7. Alertas | Fila por obra/tipo/diferença, busca, exportação e cópia de prioridades; evidência por cartão | Responsáveis, resolução e baixa efetiva no Gestor/Trello ainda dependem de correção por evidência |
| 8. Saúde | Separação entre sessão, fontes, snapshots e conciliação; Edge read-only agrega estados de obras, anotação e livro de períodos | Sincronização incremental de fonte Trello 2026 além do corte 24–25/10 e teste autenticado ao vivo |
| 9. Inteligência | Série mensal no exercício correto, ticket comparável, custo sobre bruto e margem só em contas matematicamente consistentes, faixa de meta 30–40% | Validar metas junto com recebimento, lucro e custos classificados antes de decisões de caixa |

## Dados auditados diretamente no Supabase — somente leitura
- Tabela operacional de extração em 27/10: **278 linhas de cartões**, **262 códigos de obra distintos**, 16 linhas adicionais para códigos repetidos. Não equivale automaticamente a 16 despesas duplicadas; exige identificar cartões canônicos e estados.
- Distribuição por registro: 202 `BALANCED`, 75 `INCOMPLETE`, 1 `DIVERGENT` com diferença aritmética **R$ 70,00**. A base é importada do Trello com `import_cutoff` 24/10 e não é o fluxo ao vivo.
- A view `cr_finance_v12_support_2026_source` registra 296 linhas sobre 95 códigos de obra: Éder R$ 12.300,00; Fabrício R$ 12.150,00; João (identificação a confirmar) R$ 7.770,00. Apoio é custo da obra e não prova de saque.
- Registro privado de períodos consultado sem linhas confirmadas nesta rodada. O fluxo **não** promove valores financeiros antes do comando e da evidência.
- Jan–Set 2026 do cartão Trello Gestão Financeira: Éder R$ 42.462,87; Rogério R$ 42.462,88; Fabrício R$ 30.331,23; Gabrielly R$ 16.789,82, Ágata histórica R$ 3.451,53; CG R$ 15.018,75; excesso R$ 5.105,10 frente ao lucro declarado. Outubro não está incluído nesse acumulado.
- Risco histórico confirmado fora do escopo de escrita: 666-26 (R$ 70,00), 213-24 em 2025, saldo/trava de CG e diferença de rateio de outubro R$ 109,31; evitar correção retroativa por inferência.

## Evidências técnicas da R3
- Node.js v24.19.0 no notebook Rogerio-2022: 18/18 testes iniciais aprovados (fonte R3 anterior ao acréscimo do 19º teste; revalidar HEAD).
- Puppeteer + Chrome headless no notebook (390 x 844): autenticação simulada em rede controlada, cinco painéis, valores de ganho, filtro de custos, fila de alertas, e prévia do servidor; sem `pageerror`, sem overflow horizontal e **zero** requisições PUT/PATCH/DELETE/commit; exit code 0. Teste de interface com dados simulados, NÃO é E2E de produção bancária.
- Edge read-only v2 deploy ativo; GET sem sessão = HTTP 401, POST = HTTP 405; nenhum segredo exposto na página.
- Verificação adicional de produção: origem canônica permanece `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html`, intocada por esta branch.

## Critérios para homologar e limite real
1. Validar sessão real de diretor, CORS e JSON das fontes, inclusive API risk. Testes simulados não comprovam saldo ou saque.
2. Reconciliação bancária por transação (Cora é fonte oficial) com os custos e rateios Trello, sem duplicar apoios e sem somar bases temporais distintas.
3. Resolver itemização e classificação de custos sem mover valores antigos ou alterar obras liquidadas sem evidência.
4. Teste controlado de fim a fim da PR #174 com preview idempotente, cartão mensal, CG, reconciliação do ledger, anual e recuperação de falha parcial — nunca declarar completo por ter apenas tela.
5. QA mobile real, CI Canonical Guard/Change Trace, publicação de prévia com HTTP 200, mantenha a produção preservada.
6. Só após aprovação funcional promover interface/capacidades da candidata; não mesclar PR #174 automaticamente.

## Rollback
A página R3 é aditiva e a função Edge é de leitura. Reverter exclusivamente PR R3 remove a nova prévia; desativar Edge R3 isoladamente se necessário. Não há migração ou lançamento contábil gerado por esta etapa. A PR #199 permanece histórico e será encerrada como substituída após a R3 estar disponível.
