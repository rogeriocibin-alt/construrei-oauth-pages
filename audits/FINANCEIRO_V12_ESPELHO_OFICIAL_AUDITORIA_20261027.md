# FINANCEIRO V12 — CANDIDATA ESPELHO DA HOMOLOGADA COM AUDITORIA 2026 — 27/10/2026

## Decisão canônica
Diretoria rejeitou os layouts alternativos R3/R4. Esta candidata **NÃO** redesenha o Dashboard. Copia o HTML oficial `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html` integralmente e acrescenta APENAS:
1. Um painel compacto de conferência dentro de `Resultados e Acertos`, logo após `Ganhos por pessoa: rateio × apoios / diárias`.
2. Um script read-only no fim da página, que consulta a Edge já existente `cr-v12-r3-risk-readonly-20261027`, sem criar endpoint ou tabela.

Arquivos:
- `preview/dashboard-financeiro-v12-oficial-com-auditoria-20261027/index.html`.
- `preview/dashboard-financeiro-v12-oficial-com-auditoria-20261027/index.test.cjs`.

## Garantia técnica de regressão
O arquivo `production/.../index.html` possui blob SHA **a210ce859f63110701244d78ad2da359312eea5b**. Removendo os dois trechos adicionados com seus delimitadores de linhas, a candidata é **byte a byte idêntica** ao original. Nenhum outro seletor, módulo, cálculo, login, fluxo de Cora, fechamento, ganhos, aprovisionamento, Trello ou Capital de Giro foi alterado pela candidata.

**Atenção importante:** a interface operacional que foi copiada possui seus controles originais de escrita autenticada. Apenas o painel novo é estritamente read-only. Como a candidata usa o mesmo backend operacional da V12, **não utilizar os controles de gravação da candidata para testes sem validação de diretor e processo de homologação**. Continuar lançamentos na versão oficial. A criação/publicação desta candidata não fez nenhum lançamento financeiro.

## Fontes e períodos atuais
- Cora: fonte oficial bancária. Anotação não prova pagamento.
- Trello Gestão de Obras: despesas e obras.
- Trello Gestão Financeira: resumos/rateios de acertos; janeiro–setembro/2026 são valores declarados, não retiradas pagas.
- Apoios/diárias: 296 linhas / 95 obras no espelho importado até 25/10; já disponíveis nos módulos originais da produção e mantidos intactos.
- Snapshot de obras 2026: importado com `import_cutoff = 2026-10-24`, importação 25/10/2026 00:39 UTC; 278 cartões, 262 códigos únicos, 16 entradas adicionais repetidas por código; 202 balanceados, 75 incompletos, 1 divergente em R$ 70,00.
- Mensal 2026: 9 registros `DECLARED_UNRECONCILED` (JAN–SET); 3 `OPEN_UNCONFIRMED` (OUT–DEZ). Não marcar os 12 meses como conciliados.
- Diferença já sinalizada no rateio histórico JAN–SET de R$ 5.105,10 não foi apagada, corrigida ficticiamente ou somada ao Cora.

## Funcionalidade do painel
GET autenticado via `x-cr-session` com autorização `ADMIN_MASTER_ROGERIO` na Edge existente. Mostrar contagens de cartões, códigos distintos, balanceados, incompletos, divergentes, valor absoluto de divergência e lista de códigos a conferir. Uma falha ou falta de autorização limpa os números em tela, sem assumir valores zeros. O painel recusa respostas que falhem na aritmética das contagens ou que não confirmem `no_writes: true, bank_proof: false`. Dados 24/10 explicitamente identificados.

## Provas de QA
- Node.js Rogerio-2022: **14/14** testes incluindo comparação exata com HTML oficial, sintaxe de scripts, isolamento dos dois únicos trechos e preservação de funcionalidades.
- Chrome/Puppeteer 390px (mobile) e 1280px (desktop), com **respostas simuladas** das APIs: painel apresentou 278/262, 202/75/1, diferença R$70, obra 666-26 e corte 24/10; 0 erros de JavaScript e sem overflow lateral; GET read-only; falha simulada limpa valores e denuncia consulta inválida. Anônimo: painel pede acesso e não mostra números inventados.
- Estes são testes de código e interface simulada. Não substituem E2E autenticado real de Cora/Trello, validação de dados bancários ou aprovação para lançamentos.

## Gatilhos de homologação
- Confirmar sessão real do diretor e origem dos dados de auditoria no Pages, sem expor credenciais.
- Corrigir 75 registros incompletos e a divergência de R$70 apenas após prova na origem; classificar custos de origem incluindo os apontados no vídeo (R$299.426,50) sem inventar categorias.
- Fechamento automático Trello/CG/mês/ano da PR #174 continua em DRAFT, separado, sem atribuir falsamente sucesso a esta candidata.
- Verificar CI Canonical Guard e Change Trace, fazer merge **somente dos novos arquivos de preview/testes/docs** e comprovar HTTP 200.
- Só trocar URL oficial após aprovação explícita de UI, dados e regressão de escrita.

## Rollback
Reverter esta PR; isso não altera o histórico Cora, Gestão de Obras, Gestão Financeira, PR #174, Cofre Zero ou Dashboard homologado original.
