# Financeiro V12 — auditoria de fontes e desatualização visual (08/11/2026)
**Estado: candidata de interface / sem promoção / sem alteração monetária.**
**Titular: Diretoria e Financeiro REI; atuação técnica: CR Assertivo.**
**Pendência única: FIN-V12-CORA-TRELLO-AUDITORIA-20261022.**

## Constatações com origem
- Gestão Financeira — resumo anual Trello (https://trello.com/c/3CddF0rf): declarado JAN–NOV R$496.125,97 bruto, R$333.630,63 custos, R$162.495,24 lucro. Fevereiro guarda R$0,10 de diferença matemática histórica; não corrigir retroativamente.
- Gestão de Obras — resumo anual (https://trello.com/c/gf25RQPa): carteira operacional 286 obras, bruto R$591.268,24. Mensais 259 cartões, R$516.189,90; outras listas 27 cartões, R$75.078,34. Carteira não é valor bancariamente recebido.
- Novembro Trello mensal (https://trello.com/c/gkZIjUfm): 12 obras, base R$12.902,05, custos R$8.091,02, lucro R$4.811,03; corte confirmado/retirado 07/11. Registro histórico V12 contém snapshot anterior de lucro R$4.681,03. Diferença R$130,00 é de versões do demonstrativo, não lançável em banco.
- Capital do corte (https://trello.com/c/BJbixvOj): crédito único R$481,08, débito já registrado R$450,00, saldo do corte R$31,08. Não duplicar.
- Capital geral, Trello Gestão Financeira: gerado R$22.187,79, saldo do livro R$2.826,54; NÃO é saldo Cora.
- Banco Mestre public.cr_finance_2026_work_card_source_v1: 281 registros, com meses anteriores a outubro com importação de 25/10; outubro/novembro sincronizados em 08/11. Fonte derivada não é o Trello ao vivo.
- Obra 666-26 https://trello.com/c/Q0mUjp16: fechado R$4.188,88, custo R$3.571,59, saldo informado R$547,29. Aritmética aponta R$617,29, diferença R$70,00; bloquear correção financeira até prova de custo extra/desconto.
- Obra 682-26, em aguardando pagamento https://trello.com/c/Df6EOo1l: fechado R$3.000,00 e recebido descrito R$3.900,00 com comissão de R$900,00; exige distinguir repasse bruto de receita reconhecida antes de consolidar.
- Cora: RPC public.cr_cora_live_status() informa saudável em 08/11 10:30 BRT, mas não demonstra correspondência individual de PIX/recebimentos com os cartões.

## Alteração controlada
Arquivo oficial na branch candidata: `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html`.
- Retira valor estático antigo apresentado antes de autenticação.
- Exibe primeiro a fonte financeira mensal declarada quando válida; mantém snapshot histórico V12 abaixo, explicitamente sem dupla contagem.
- Identifica projeções armazenadas no navegador como MANUAIS / NÃO OFICIAIS.
- Corrige texto ultrapassado que tratava outubro e novembro como não consolidados.
- Não cria POST, não escreve no Trello, Cora, Supabase ou Capital; funções, IDs e URLs existentes preservados.

## Gates
- Testes estáticos e sintáticos na CI. Não equivalem a E2E autenticado.
- Testar sessão Diretoria notebook e Android com banco, acertos, histórico, Capital de Giro, custos, auditoria, exportação e estados de erro.
- Conciliar movimentos bancários por IDs; verificação do saldo oficial de produção.
- Atualizar espelho do Banco Mestre exclusivamente por rotina idempotente homologada, com backup e confirmação de atualização.
- Não promover branch até fechamento desses gates e decisão humana.
- Rollback: reverter o commit desta branch / PR, sem revert de dados financeiros.
