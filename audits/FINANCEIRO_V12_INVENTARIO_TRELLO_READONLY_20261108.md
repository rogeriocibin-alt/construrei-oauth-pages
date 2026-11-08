# CONSTRU-REI | Candidata de correção estrutural conservadora — inventário Trello (08/11/2026)

## Escopo
Pendência existente: `FIN-V12-CORA-TRELLO-AUDITORIA-20261022`. Branch `fix/financeiro-v12-inventario-readonly-20261108`.
A solicitação é auditar sem reescrever lançamentos: novo card Trello deve ser visível como dado preliminar; arquivado deve ser consultável com motivo, sem crédito, débito ou duplicidade.

## Evidência da varredura Trello
Consulta paginada somente leitura do quadro oficial Gestão de Obras 2026 encontrou **404 cartões físicos**, **313 abertos**, **91 fisicamente arquivados**, distribuídos em 18 listas. Há 286 títulos com código de obra e 270 códigos distintos. Números incluem resumos, helpers, cópias e testes; não representam recebimentos. Vários pares são cópias arquivadas; 411-26 tem card original e aditivo de R$450,00, não podendo ser tratado como duplicidade automática.

## Ação proposta
1. Reusar o backend de leitura existente `cr-dashboard-gerencial-v4-manual-cora-candidate-20261007` (fonte viva da função Supabase; o arquivo GitHub candidato anterior diferia na remoção do bloco de apoio da rotina de fechamento), sem mudar os POSTs, limites de autenticação, acertos, rateios, Capital ou funções de Cora.
2. Acrescentar `crFinanceInventoryReadOnly` como inventário opcional em `GET api=year&year=2026&inventory=1`, reusando a leitura já existente `filter=all`. ID imutável do card é a chave; o código da obra é apenas atributo de busca. Inclui listas operacionais, mensais, a lista ARQUIVADOS e cards fisicamente arquivados.
3. Motivo de arquivo classificado somente por indicação explícita; casos sem indicação recebem `MOTIVO_NAO_INFORMADO`. Cards auxiliares são contados à parte, excluídos da lista de obras. Pré-contabilização é **somente informativa** e não reconhece receita/recebimento, não gera lançamento, não envia PIX e não move card.
4. Incorporar painel colapsável e filtros no HTML V12 preservando todas as abas existentes. Não criar cron, Edge, Supabase, webhook ou outro dashboard.

## Testes e limites
- Testes `audits/v12-card-inventory-readonly-20261108.test.cjs`: aditivo 411-26 preservado, arquivado, lista ARQUIVADOS ainda com `closed=false`, nenhuma contabilização e integridade sintática de scripts.
- Checagem anterior ao commit: 23 scripts JS inline sintaticamente válidos e funções críticas de fechamento do runtime vivo preservadas.
- **GATE BLOQUEANTE:** não implantar a candidata sem CI, sessão autenticada em notebook e Android, teste em dados seguros sem escrita financeira, e validação do Financeiro REI. Notebook remoto indisponível e conector do navegador sem resposta nesta execução.
- Estado: **CANDIDATA / NÃO PROMOVIDA**. Não declarar 100% da conciliação financeira. Permanecem 37 extrações INCOMPLETE, uma DIVERGENT (666-26, R$70), fevereiro R$0,10 e movimentos Cora sem vínculo inequívoco.

## Rollback
Nenhuma mudança em produção, Trello, Supabase financeiro ou Cora. Antes da promoção, basta fechar/reverter esta PR; após homologação, reverter apenas os dois arquivos de código. Não alterar dados históricos ou Cofre Zero canônico.
