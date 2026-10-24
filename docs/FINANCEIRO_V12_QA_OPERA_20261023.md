# CONSTRU-REI | QA V12 com Opera conectado — 23/10/2026

**Tipo de teste:** sessão real de leitura no navegador Opera (aba V12 já autenticada) + aba nova sem autorização + cruzamento com Supabase/Trello/GitHub. **Sem lançamentos, sem cartão duplicado, sem reprocessamento de Acertos.** A interface do Opera conectada a este agente disponibiliza navegação e leitura, mas não ação de clique/teclado; logo os testes `E2E click→preview→confirm` não foram executados nesta sessão.

## Resultado por área

| Caso | Verificação e evidência | Situação |
|---|---|---|
| Acesso pelo Opera | Aba oficial `/production/dashboard-financeiro-v12-operacoes-homologada-20261023/` renderizou controles/Acertos na sessão já aberta | PASS: leitura real |
| Login em aba nova | Navegar para a mesma URL com cache-busting apresenta `Chave de acesso`, botão `Entrar`, e Cora `Aguardando consulta autenticada` | PASS: sem acesso anônimo aos dados |
| Capital de Giro total | UI: gerado R$21.706,71, consumido R$18.168,96, disponível R$3.537,75, 27 períodos. Valores batem com `public.cr_working_capital_state_v1`; `divergence_count=0` | PASS: leitura + consistência |
| Período fechado uma vez | UI mostra `10/10 a 23/10 | R$1.058,06`, Trello [cartão](https://trello.com/c/lUHP2wNe), Supabase `cr_working_capital_periods_v1` com chave `2026-10-10_2026-10-23`, `ACTIVE` (1 registro) | PASS: existência e unicidade; **não é teste de replay via UI** |
| Ledger V12 | `cr_finance_v12_operations`: 31/31 `COMMITTED`, 0 estado diverso, 13 chaves Cora distintas `CORA_...` | PASS: persistência; sem escrever na sessão |
| Cora vivo | `public.cr_cora_live_status()` healthy e balance_healthy; leitura incremental em janela dos últimos 2 dias, sem erro ativo | PASS |
| Histórico Cora | 7.692 movimentos em 46 meses. Somas de créditos/débitos por mês UTC coincidem 46/46 com monthly_summary. View privada `cora_cache.monthly_balance_derived_v1`: 6/6 âncoras oficiais conciliadas e 40 competências explicitamente DERIVADO | PASS matemático; não certifica saldo mensal não oficial |
| Acerto Vivo | UI mostra 11 obras, margem 28,69%, diferença aritmética zero. Botões `COPIAR ACERTO COMPLETO`, `COPIAR RESUMO`, `GERAR PDF`, `EXPORTAR EXCEL` presentes | PASS render; WARN econômico |
| Acerto Vivo × custos | Obras 740-26, 768-26 e 579-26 têm diferença entre fechado e recebido coincidente com taxa/comissão já contabilizada como custo. Backend `cr-trello-gestao-vista-v2` v60 aplica `base = received ?? closed` e `profit = base - totalCosts`, mas cards individuais calculam sobre fechado. Conferir valores bancários retidos antes de ajustar rateios | **BLOCK financeiro P0** |
| GestãoClick | UI exibe `DIVERGENTE` na coluna GestãoClick para obras 768-26 e 818-26; não significa erro confirmado Cora×Trello. Obra 818-26 discrimina R$299,90 de reembolso tanto em recebido quanto em custo, explicando diferença de recebido acima de fechado | WARN integração a confirmar |
| Registros repetidos candidatos | Obra 740-26: dois registros manuais ledger COMMITTED do mesmo dia e valor R$1.239,80; texto atual do Trello mostra uma linha. Outros pares semelhantes incluem três `EXISTING_TRELLO` que são correlações e dois apoios distintos na 818-26 | WARN: rastreio, não excluir automaticamente |
| Marcador obsoleto de autoteste | Aba antiga ainda apresenta resultado anterior `0 períodos registrados`/sem duplicidade, embora a mesma UI mostre o novo período já criado. **Não executar fechamento com base nesse resultado antigo; requer limpeza automática do painel ou carimbo temporal/invalidação** | WARN UX P2 |
| Identificação no cabeçalho oficial | A versão oficial mostrava `V12 · CANDIDATA (APROVISIONAMENTO)` e texto semelhante no rodapé. PR [#154](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/154) altera **apenas dois rótulos estáticos**; branch passou no Canonical Guard e PR foi incorporada à main commit `e13f6b70e8982f4e30507756908184696399321d` | FIX de apresentação; validar Pages/new tab |
| UX E2E com ações | Navegador via conector não oferece comandos de `click`, `setValue` ou sessão remota Desktop Commander (dispositivo ainda offline); portanto não foram acionados `Executar autoteste sem lançar`, `Pré-visualizar`, `Confirmar`, PDF/Excel, navegação pelos 8 ambientes nem fechamento de obra nesta sessão | **NÃO EXECUTADO** |

## Critério de saída

1. **P0 Contábil:** comprovar origem de bruto, líquido, taxa, comissão e reembolso por obra antes de correção financeira. Conciliar 740/768/579; investigar dois `COMMITTED` de R$1.239,80 na 740 com trilha de mutations. **Não recalcular período de 10–23/10 retroativamente sem aprovar ajuste separado.**
2. **P1 E2E:** com controle interativo autorizado, testar login Diretor, leitura Cora, `close-test` somente leitura para período já existente e validação de bloqueio de reentrada, prévia sem gravação, lançar apenas caso real autorizado, PDF/Excel (títulos 10/10–23/10), Fechar Obra e viewport móvel. Não executar testes criando cartões financeiros artificiais.
3. **P2 UX:** invalidar diagnóstico de autoteste anterior depois do commit real; resolver alerta GestãoClick 768/818; publicar rótulos corretos PR #154; exibir no Cora Pro o saldo mensal DERIVADO vs OFICIAL apenas via API autenticada e nunca promover saldo derivado a oficial.

## Testes não realizados e medidas de proteção

- Não houve replay autenticado de `close-commit` nem `close-test` com sessão Diretoria.
- Não houve upload de comprovante, gravação Trello, estorno, fechamento de obra ou mudança de cálculo.
- A produção financeira V12 e os históricos individuais continuam intactos. Uma PR de rótulos (sem lógica) foi promovida separadamente.
- A fonte de verdade bancária é a API Cora; os saldos de Capital de Giro são operacionais Trello e não o saldo bancário.


## Delta — Desktop Commander online e testes autenticados (23/10/2026)

- **Notebook Rogerio-2022 conectado:** Desktop Commander v0.3.1 respondeu aos comandos remotos.
- **QA público real em navegador Chromium/Puppeteer no notebook:** HTTP 200, proteção de login preservada, versões desktop 1440 px e celular 390 px sem overflow horizontal e sem exceções JavaScript nas páginas testadas. A sessão nova **não recebeu dados financeiros sem autenticação**.
- **PR #155 [MERGED](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/155), commit 8ee3fe59:** invalidação do autoteste antigo ao mudar datas ou confirmar encerramento. Treze scripts inline verificados quanto à sintaxe; eventos e bloqueio da confirmação testados em 1440/390 px. HTML corrigido devolveu HTTP 200 da URL oficial e contém o novo código. Guard de PR [PASS](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/40050732525).
- **E2E autenticado de somente leitura na aba Opera existente:** botão real `Executar autoteste sem lançar` disparado por UI Automation. O serviço reconheceu **1** período registrado, cartão Trello duplicado e bloqueio de reentrada; início necessário **24/10/2026**, 11 obras e Capital em R$ 3.537,75. Botão real `Pré-visualizar encerramento` retornou `PERIOD_ALREADY_REGISTERED`. **Nenhuma confirmação, novo cartão ou movimentação financeira foi feita**; ledger V12 seguiu **31 COMMITTED** e período 10/10–23/10 permaneceu único, `ACTIVE`, R$ 1.058,06.
- **Risco P0 contábil não encerrado:** obra 740-26 possui **um** débito Cora de R$ 1.239,80 (17/10), **dois** lançamentos manuais `COMMITTED` de R$ 1.239,80 no ledger (identificadores distintos) e **uma** despesa correspondente no cartão Trello. Não excluir ledger nem lançar custo novamente sem trilha de correção. Obra 768-26 possui crédito Cora R$ 3.200,00 em 21/10 com referência ao orçamento, mas a retenção R$ 208,60 consta também como custo no Trello. Na 579-26 o cartão registra segunda parcela em 26/10 como `OK` apesar de essa data ser posterior ao corte da auditoria em 23/10; depósitos de R$ 832,50 não foram localizados no cache Cora consultado até 23/10, o que não exclui recebimento por outro canal. **Não reinterpretar pagamento, modificar base ou rateio sem comprovação externa.**
- **Ainda fora da homologação E2E:** `close-commit` de um período novo, lançamentos financeiros reais adicionais, PDF/Excel autenticados e aceite visual interativo em Android físico. Estes testes não podem ser classificados como PASS por inferência dos testes acima.
