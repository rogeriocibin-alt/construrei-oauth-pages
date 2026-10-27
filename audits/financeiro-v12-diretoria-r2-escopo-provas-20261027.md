# CONSTRU-REI — V12 R2 candidata da diretoria (27/10/2026)

## Escopo e salvaguardas
Nova página independente em preview/financeiro-v12-diretoria-r2-20261027/index.html. Não alterar arquivo de produção, custos, rateios de obras encerradas, banco Cora, Trello, Supabase nem Cofre Zero. Candidata somente leitura; login reutiliza sessão da Diretoria, única requisição POST é a autenticação habitual.

## Checklist da análise do vídeo
| Solicitação | Implementação nesta candidata |
|---|---|
| KPIs coerentes | Mostra fonte Trello financeira anual distinta do bruto operacional e explica diferença entre universos. Esconde margem quando bruto − custos difere do lucro declarado. |
| 2023 banco; 2024–2026 obras | Filtro ano e mês; 2023 somente Cora, com acesso ao módulo original; 2024–26 Trello Gestão de Obras e resumos financeiros. |
| Ganhos da equipe | Cartões lado a lado de Éder, Rogério, Fabrício, Gabrielly e legados, com rateio, apoio/diária e saque comprovado separados. Não soma períodos diferentes. |
| Apoios de João Victor e terceiros | Linhas por beneficiário do staging de 2026, com identidade e origem pendentes quando ambíguas. João não vira automaticamente João Victor. |
| Custos classificados e não classificados | Cobertura, valor itemizado, valor sem categoria, composição por categoria e linhas consultáveis por cartão. |
| Pendências acionáveis | Fila por obra, categoria de problema, diferença aritmética e ligação Trello, com ordenação por impacto conhecido. |
| Fechamento orientado | Valida datas, orienta conferência, encaminha à V12 homologada com prévia e confirmação. A candidata NÃO envia cartão, não duplica custo nem cria novo fechamento. |
| Navegação celular | Cinco áreas concentradas em menus responsivos, mensagens de escopo, contraste e foco de teclado. |
| Fonte e saúde dos dados | Status autenticado separado de conciliação, last read de cada consulta e alertas conforme presença de evidência. |
| Evolução e metas | Série mensal dentro de um único ano e referência de meta de margem de 30–40% apenas para dados completos; ausências não interpoladas. |

## Fonte oficial e Gestor
Cora: única autoridade para saldo, entradas e saídas 2023 até hoje. Trello Gestão de Obras 2024–2026: obras, custos e rateios nominais. Trello Gestão Financeira: fechamentos e retiradas declaradas 2026. GestãoClick não é fonte financeira. Leituras via Supabase APIs cr-dashboard-gerencial-v4-manual-cora-ui-candidate-20261007 e cr-v12-financial-settlements-trello-20261027, x-cr-session exigido. Banco Mestre item FIN-V12-CORA-TRELLO-AUDITORIA-20261022 permanece P0 na conciliação histórica.

## Evidencias e testes
Notebook Rogerio-2022, fonte candidata commit 867b0292a62b4ef2ed622e795a684721e7d4bce6: Node built-in test runner, 15 PASS / 0 FAIL, incluindo sintaxe JS, não escrita (apenas POST de login), filtros e guardas de ano/mês, fontes históricas, inexistência de zero falso, ganhos separados, composição de custos, fila de divergências, validação do período, tendência mensal, IDs únicos e navegação acessível. Publicação Pages, CI e teste real de sessão seguem gates adicionais a verificar após merge.

## Impacto e regressao
2024 54 obras ainda a conferir. 2025 lucro parcial por obra 213-24. 2026 75 registros incompletos, obra 666-26 diferença R$70, fevereiro R$0,10 e abril excedente histórico de R$5.105,10 em parcelas declaradas. Snapshots Trello de apoio importados até 25/10; não alegar atualização integral até 27/10. A presente mudança melhora uso e diagnóstico, NÃO declara conciliação total. Login/GET autenticados, sem token secreto no HTML.

## Rollback
Reverter PR da candidata ou remover somente o caminho preview/financeiro-v12-diretoria-r2-20261027. Produção, Supabase, obras e contas permanecem intactos.

## Etapas P0 contábeis futuras, não homologadas por esta UI
Sincronizar o ETL de cartões com idempotência, resolver duplicações e divergências com prova; reconciliar retiradas bancárias com beneficiários; completar históricos; validar fechamento mensal, Capital de Giro e ano; E2E autenticado de navegador e testes de operação. Nenhum resultado incompatível deverá ser ajustado por inferência.
