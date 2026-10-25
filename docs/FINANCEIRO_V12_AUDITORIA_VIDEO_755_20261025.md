# FINANCEIRO V12 — auditoria do vídeo e contenção de fechamento | 25/10/2026

## Ocorrência reproduzida com evidência
Em 25/10/2026, 02:59:12 UTC, as funções `cr-dashboard-gerencial-v4-manual-cora-candidate-20261007` (v26) e `cr-dashboard-gerencial-v4-manual-cora-ui-candidate-20261007` (v21) retornaram HTTP 500 à chamada `manual-close-work` (prévia). Log `function_logs`: `RangeError: The status provided (0) is not equal to 101 and outside the range [200,599]`. O frontend tentava acessar `null.error`, causando mensagem não informativa. Em 02:59:32 UTC houve resposta 200 de nova chamada, mas isto não prova lançamento: requer comprovante Trello.

O código da função possuía objeto de erro com propriedades duplicadas `status:409` e `status:st`, substituindo o HTTP numérico pelo status operacional textual quando a obra não era habilitada. A correção separa `status:409` de `work_status:st`, e o serializador protege códigos fora do intervalo válido.

## Conferência financeira — obra 755-26
Cartão Trello de origem: https://trello.com/c/MCTQBIcD
- Na leitura, lista `EM ANDAMENTO`, sem bloco de fechamento gravado no texto examinado; não afirmar fechamento.
- Valor fechado textual R$ 6.980,00 (não confundir com recebido).
- O texto da seção Custos contém três linhas de 23/10 de R$ 150,00 cada, explicitamente com `Obra 799-26` (R$ 450,00 em conjunto). **Não atribuir automaticamente a nenhuma obra**: referencial pode ser histórico/origem. Confirmar comprovantes antes de aprovar fechamento.
- A função v27 impede o fechamento se identificar referências a outro código na seção Custos, retorna `409 CUSTOS_REFERENCIAM_OUTRA_OBRA`, somente leitura e `writes:false`. Não edita Trello.
- A obra 799-26 está em `10. OUTUBRO 26`; seu cartão possui fechamento próprio e custo descrito, cuja integridade precisa ser preservada.

## AG. ACERTO
Na leitura atual Trello, lista `AG. ACERTO` contém zero obras operacionais; somente cartões-resumo com zeros. Lista de setembro possui 33 obras, outubro 22 obras (além dos cartões de resumo). A prévia 10/10–23/10 de envio para acertos não deve considerar listas mensais como `AG. ACERTO`, nem reenviar cartão mensal.
A interface ajustada diferencia:
- fonte ainda não carregada;
- AG. ACERTO realmente vazia;
- nenhuma obra selecionada quando há pendentes.
Não reabre acertos ou altera competência financeira.

## Implementação e testes
Fonte restaurável da Edge v26 em `candidates/financeiro-v12-fechar-obra-guard-20261025/backups/edge-v26-antes-guard.ts`. Fonte v27 em `.../index.ts` e publicada na MESMA função candidata já utilizada pelo Dashboard. `verify_jwt:true`; nenhuma mudança de variáveis secretas, nomes de endpoints ou tabelas.
Testes no notebook:
- `audits/financeiro-v12-fechar-obra-guard.test.cjs`: 6 PASS.
- `audits/financeiro-v12-video-close-regression-20261025.test.cjs`: 8 PASS.
- Sintaxe TS Edge e todos os scripts inline da preview aprovados.
- Fluxos de API simulados testam resposta JSON nula, referência cruzada, recusa de obra em estado inadequado e zero obras em AG. ACERTO.
- **Não houve E2E autenticado de fechamento real nem escrita Trello como parte do teste**, portanto não homologar fechamento real/contábil.

## Impacto e rollback
Preview V12 única: `preview/dashboard-financeiro-v12-envio-acertos-20261024/`. Arquivo produção V12 homologada `production/dashboard-financeiro-v12-operacoes-homologada-20261023/` permanece sem edição. Código Edge v26 salvo para rollback de função se houver regressão; exigir confirmação técnica antes de rollback que remova bloqueio de custo cruzado.
Ainda pendentes: reconciliação de custos de 755-26/799-26 com documentos, fechamento autenticado idempotente, integração de rateios, períodização 2026 e demais pendências da PR #174.
