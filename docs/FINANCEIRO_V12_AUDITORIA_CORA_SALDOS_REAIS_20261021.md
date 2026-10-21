# FINANCEIRO REI — auditoria de cobertura Cora V12 (21/10/2026)

Estado: **PARCIALMENTE RECONCILIADO**. O cache mensal e IDs são consistentes; o saldo bancário mensal não pode ser considerado integralmente conciliado. Sem qualquer mutação financeira.

## Fontes consultadas
Supabase project yspuaamokjbrosytqjpg, SELECT em cora_cache.movements, cora_cache.monthly_summary, cora_cache.live_sync_state e public.cr_working_capital_state_v1. Conferência estática da V12 publicada e da branch candidata.

### Movimento e competência
- 7.668 movimentos em consulta de 21/10, com 7.668 IDs distintos, nenhum erro no último estado da sincronização (snapshot às 23:05 UTC).
- 46 competências importadas.
- Em auditoria anterior, créditos e débitos dos movimentos coincidiram com os resumos mensais; também foi conferido o trecho 2026 recente. Portanto consistência do fluxo mensal dentro do cache, não prova do saldo oficial.

### Equação bancária separada da consistência do fluxo
| Categoria | Meses |
| --- | ---: |
| Agregações oficiais com saldo inicial + entradas − saídas = saldo final | 6 |
| Resumos derivados do extrato com saldo inicial e final 0 usados como substitutos, não verificáveis como saldo | 37 |
| Competência sem saldos inicial/final | 1 |
| Competências com saldos parciais/não nulos e equação em aberto | 2 |
| **Total** | **46** |

- Agosto/2023: inicial 187843 centavos, créditos 1679237, débitos 1009421, final 887659; diferença calculada **-30000 centavos (R$ 300,00)**.
- Dezembro/2023: inicial 362861, créditos 1392160, débitos 1775021, final 0; diferença calculada **-20000 centavos (R$ 200,00)**. Final zero pode ser placeholder; exige evidência de saldo externo.
- Outubro/2025: saldos inicial e final NULL.
- 37 meses de source CORA_STATEMENT_SUM_RECONCILED possuem saldos 0/0 e não devem ser tratados como prova de conciliação. Os 6 CORA_OFFICIAL_AGGREGATIONS fecham equação.

## Ação executada
- Na branch candidate/financeiro-v12-auditoria-20261021 foi adicionado painel de auditoria com distinção 6/37/1/2 e revisada a expressão de cobertura anual no módulo Saúde.
- **A atualização da rota pública no main foi bloqueada pelo controle de segurança da conexão.** Não tentar workaround. Versão publicada continua a do checkpoint anterior (até o commit 87a52f), sem esse painel de auditoria recém-criado.
- Opera Browser Connector indisponível no momento (browser not connected). Não declarar novo teste no notebook.
- PR #142 permanece draft. Nenhuma alteração nos movimentos bancários ou lançamentos operacionais.

## Próximos gates
Validar saldos reais de 2023-08 e 2023-12 no extrato bancário oficial; levantar os períodos com placeholder para status "saldo não verificável" no painel; conferir conciliação Trello retiradas x Cora e testes operacionais segregados; validar navegador notebook + celular e aprovação de diretoria antes de homologar.
