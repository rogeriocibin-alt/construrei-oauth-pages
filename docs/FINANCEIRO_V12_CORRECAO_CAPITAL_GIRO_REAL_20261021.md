# Auditoria Financeiro REI — Capital de Giro (21/10/2026)

STATUS: valores e regras de leitura reconciliados; dashboard V12 ainda NÃO HOMOLOGADO. Conciliação completa Cora x Trello das retiradas permanece pendente.

FONTES:
- Resumo Trello: https://trello.com/c/QRs2VwFb
- Período 04/06 a 12/06: https://trello.com/c/Q6GM8e09
- Fonte de acertos Junho: https://trello.com/c/u70gp99w
- Três títulos históricos com saldo inicial e saldo real atualizado: https://trello.com/c/WyR77rhP ; https://trello.com/c/COAdqyqK ; https://trello.com/c/t7N2RAfq

ERROS COMPROVADOS:
1. A expressão antiga reconhecia SALDO anterior mas não SALDO REAL; foram produzidos 3 falsos alertas de divergência. Com a expressão corrigida e os mesmos 25 períodos, o total de alertas passou de 3 para 0 SEM mudar nenhum saldo calculado.
2. O padrão ACERTOS De (capital de giro de 04/06 a 12/06 no valor de R$ 385,11) não era reconhecido. Existiam 26 cartões de período e somente 25 no cálculo. Fonte de Junho confirma o valor; saldo final do cartão é R$ 0,00.

RESULTADOS:
- Capital gerado: R$ 20.263,54 -> R$ 20.648,65
- Consumo histórico: R$ 16.906,85 -> R$ 17.291,96
- Capital disponível: R$ 3.356,69 -> R$ 3.356,69 (inalterado)
- Períodos: 25 -> 26
- Alertas de título: 3 -> 0
- Acerto pendente separado do saldo: R$ 287,46 (inalterado)

AÇÃO:
- Função Supabase existente cr-trello-capital-giro-v1 atualizada v30 -> v31 -> v32. Nenhuma função nova ou credencial exposta.
- Card Trello de resumo atualizado somente nos agregados, preservando todos os cartões históricos.
- Registro Supabase public.cr_working_capital_state_v1, GLOBAL, atualizado condicionalmente com metadado de auditoria. Verificação RETURNING registrou 26 períodos, 0 alertas e valores corrigidos.
- Sem lançamentos de despesas, depósitos, movimentações Cora nem alterações nas obras.
- A V12 permanece somente leitura; produção V11 foi mantida.

CÁLCULO EXATO: 2.064.865 centavos gerados - 1.729.196 centavos consumidos = 335.669 centavos disponíveis.

GATES: reconciliação efetiva de pagamentos/retiradas Trello x Cora, testes fim-a-fim isolados e homologação no notebook e celular ainda pendentes. Não fazer merge da PR #142 nem promover V12 como homologada sem esses gates.
