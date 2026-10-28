# CONSTRU-REI — revisão funcional da V12 candidata (27/10/2026)

## Ocorrência observada no Android
Na prévia `preview/dashboard-financeiro-v12-oficial-com-auditoria-20261027/index.html`, o botão **1. VALIDAR / PRÉ-VISUALIZAR** exibia apenas `MISSING_FINANCIAL_DETAILS`, sem orientar quais campos preencher. A captura mostra campos Favorecido, Descrição e Referência vazios; campos acima da imagem não podem ser aferidos.

## Causa identificada no servidor REAL
Edge Function publicada `cr-finance-v12-safe-trello-candidate-20261021`, versão 3, segue o requisito:
- ID válido da operação;
- obra 2024–2026, direção IN/OUT, data ISO;
- valor maior que zero e categoria;
- **pelo menos um de Favorecido, Descrição, Referência**;
- `MISSING_FINANCIAL_DETAILS` é devolvido quando valor/categoria/identificação faltam.

Portanto, o status exibido na captura **pode ser a validação correta do backend**, mas o formulário não explicava o requisito. Não se provou falha de escrita Trello.

## Correções incorporadas SOMENTE na candidata canônica
1. Aviso de preenchimento próximo aos botões da operação manual.
2. Validação local completa dos campos antes da requisição; reporta nominalmente cada pendência e posiciona no campo a corrigir.
3. Tradução de `MISSING_FINANCIAL_DETAILS`, `INVALID_CASE_2024_2026`, `INVALID_DATE`, `INVALID_DIRECTION`, `INVALID_OPERATION_ID`, sem apagar códigos úteis à auditoria.
4. A cada tentativa nova, invalida a prévia anterior; **Lançar** só habilita após resposta positiva.
5. `Consultar registro` sem operação enviada não chama desnecessariamente o backend; operações que podem ter sido enviadas mantêm o payload para consulta idempotente.
6. Corrigido `S.manualLastPayload`: somente recebe os dados depois de conferir igualdade com a prévia, antes do pedido de commit (necessário em resposta incerta).
7. Cabeçalho da prévia mostra **CANDIDATA (BASE HOMOLOGADA)**, diferenciando do ambiente oficial.
8. Nenhum endpoint, banco, Cora, Trello, rateio, CG, fechamento, auditoria nem histórico foi editado. A versão homologada permanece intacta.

## Matriz funcional de revisão
| Função | Análise / prova | Limite |
| --- | --- | --- |
| Campo obra/tipo/data/valor/categoria | Validação estática + navegador móvel | Não valida existência de obra sem consulta autenticada |
| Favorecido/descrição/referência | Erro reproduzido e tratado ANTES de requisição | Banco preserva contrato atual |
| Pré-visualização manual | Mock autenticado deu resposta válida e habilitou Lançar | Não comprova comunicação real Trello |
| Lançar no Trello | Proteção por prévia e fingerprint/idempotência original mantida | **Não efetuado lançamento real** |
| Consultar registro | Sem operação não há request; após tentativa original consulta ledger | Não consultado ledger com credencial real |
| Fechar obra | Módulo original intacto, checagem de custo e prévia | **Não homologado E2E real** |
| Limpar | Teste de navegador: botão Lançar novamente bloqueado | Necessário consultar ledger antes de repetir operação de resultado incerto |
| NF 8,5% | Cálculo e travas da operação original preservados | Não foi testada NF real com Trello |
| Anotação Cora informativa | Elementos originais mantidos, sem lançamentos novos | Deve continuar independente de custos Trello |
| CG, rateios, apoios, histórico e auditoria 2026 | Todos os scripts homologados preservados, exceto rotina do manual | Reconciliar os dados originais ainda é pendência P0 |

## Testes
- Node v24, notebook autorizado Rogerio-2022: **14/14 PASS**.
- Puppeteer Chrome mobile 390px: formulário vazio e parcial bloqueados **0 requisições**; preenchimento válido dispara **apenas POST action=preview** no servidor simulado; botão Lançar liberado após prévia; Limpar bloqueia. **0 JavaScript pageerror**, **0 overflow**. Não clicado botão commit.
- Edge Function fonte lida no Supabase; **versão 3 ACTIVE, sem deploy/modificação**.
- Controle de publicação: CI Change Trace e Central Canonical Guard, depois conferir a URL da candidata por HTTP 200 e marcador da validação.
- Faltam testes reais de lançamento, fechamento, Capital de Giro e conciliação; não declarar homologado 100% com base nos mocks.

## Rollback
Reverter esta PR restaura somente o HTML de prévia da PR #202. A produção fica intocada. Sempre preservar a candidata canônica existente, sem criar novos Dashboards.