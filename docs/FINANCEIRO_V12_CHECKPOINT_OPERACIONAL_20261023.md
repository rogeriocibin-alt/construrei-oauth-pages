# CONSTRU-REI — Financeiro V12: checkpoint operacional em 23/10/2026

**Origem:** auditoria BIO/Financeiro REI via conectores GitHub, Supabase e Trello em 23/10/2026 (horário BRT, após 21h18).  
**Natureza:** evidência documental e atualização do controle do projeto; **nenhum lançamento financeiro, transferência, reabertura de obra, alteração de saldo ou fechamento foi executado por esta auditoria**.

## 1. Release e funções oficiais
- Dashboard oficial: `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html` no branch `main`; Central aponta para `?v=780343b1`.
- PR #151 **merged**: títulos dos Acertos Completo / Resumo / PDF obedecem às datas `cg-close-start` e `cg-close-end` e recusam datas incompletas, inexistentes ou invertidas. A alteração é visual, não financeira.
- A UI V12 oficial contém fluxo Cora/Trello protegido, operação manual, Fechar Obra, Capital de Giro com prévia e confirmação.
- Foram preservados V11 e V12 de 22/10 como pontos de retorno; PRs #142/#143/#145/#147/#148 não devem ser mescladas globalmente sobre arquivos oficiais por conflito de escopo.

## 2. Prova real do Capital de Giro — período 10/10 a 23/10
- Cartão real criado: https://trello.com/c/lUHP2wNe — `CG_PERIOD_KEY|2026-10-10_2026-10-23` e `CG_CREDIT|1058.06`.
- Origem referenciada pelo cartão: https://trello.com/c/sa0x7eVL — Acertos Vivo, 11 obras, base R$ 36.880,96, custos R$ 26.300,02, lucro R$ 10.580,94, rateio sem diferença, cota Capital de Giro R$ 1.058,06.
- Supabase `cr_working_capital_periods_v1` confirma `period_key=2026-10-10_2026-10-23`, `status=ACTIVE`, crédito e saldo do período R$ 1.058,06. A atividade do cartão comprova criação às 00:18:21Z de 24/10 (21:18 BRT de 23/10).
- Consolidado em Trello e `cr_working_capital_state_v1`: 27 períodos, gerado R$ 21.706,71, consumo R$ 18.168,96, saldo R$ 3.537,75, divergências 0. **Esse saldo é do livro do Capital de Giro, não o saldo da conta Cora.**
- Esta é prova real de **um encerramento/registro de período bem-sucedido**; não comprova por si só teste de botão em notebook e celular, tentativa repetida, edição de período já encerrado ou todos os cenários de uso. Não repetir a operação para testá-la.

## 3. Operações / conciliação
- Ledger `public.cr_finance_v12_operations`: **31 COMMITTED**, sendo 13 identificadores `CORA_` e 18 demais; nenhum registro com outro status nesta leitura.
- Esse número comprova registros persistidos, **não é certificação de cobertura total do extrato Cora (2023–2026)**, saldo bancário atual, nem de matching bilateral de todos os lançamentos Trello × Cora.
- Acertos Vivo de 23/10: 11 obras conferidas e 0 pendências segundo o cartão de origem. Obra 735-26 constava com 12 linhas discriminadas e custo R$ 1.301,45; não reutilizar a antiga hipótese R$ 142,84 sem nova prova.
- Lançamentos posteriores em obras fechadas, conciliação por igualdade de valor e rateios sem origem bancária inequívoca continuam proibidos.

### 3.1 Integração Cora PROD — prova objetiva de 23/10 às 21h35 BRT
- RPC de leitura `public.cr_cora_live_status()`: `healthy=true`, `balance_healthy=true`, `last_error=null`, última execução e leitura de saldo em `2026-10-24T00:35:11Z`. Janela incremental `2026-10-22` a `2026-10-24`; 44 registros vistos, 0 novos nesta rodada. **A integração PROD e a atualização incremental estavam operacionais nessa leitura**, sem realizar lançamento.
- RPC `public.cr_cora_cache_years()`: 46/46 competências mensais (jan/2023 a out/2026) importadas, 0 falhas ou meses na fila. Entretanto, 37 competências têm saldos inicial e final zerados/placeholder, e apenas 6 registros são de agregação bancária oficial. **A importação 46/46 não autoriza chamar todos os saldos históricos de conciliados.**
- Item `FIN-CORA-API-20261007` foi concluído **somente no escopo de credenciais/integração PROD e carga incremental**, enquanto a qualidade dos saldos históricos e conciliação transação a transação permanecem sob `FIN-V12-GLOBAL-20261022` e `FIN-V12-CORA-TRELLO-AUDITORIA-20261022`.
- Supabase Edge `cr-trello-capital-giro-v1` v35 contém verificações `PERIOD_ALREADY_REGISTERED`, bloqueio por obras repetidas, fingerprint da prévia e reserva atômica `on_conflict=period_key`. O banco possui `PRIMARY KEY(period_key)`; isto é **prova da proteção técnica existente**, não um teste autenticado de segunda tentativa no navegador.

## 4. Gates preservados (não declarar 100% funcional sem provas)
1. Teste read-only / operação não duplicada ao tentar reabrir período encerrado; E2E autenticado notebook + Android ainda sem prova nesta auditoria.
2. **Já comprovado:** monitor PROD e atualização incremental saudáveis às 21h35 BRT de 23/10. **Ainda pendente:** certificação dos saldos históricos (especialmente 37 meses placeholder) e conciliação externa com comprovantes/IDs onde faltam vínculos Cora × Trello.
3. Casos não amostrados de lançamento multiobra, Capital de Giro, estorno e Fechar Obra: testar sob confirmação explícita e sem custos/duplicidade; não criar movimentos fictícios na produção.
4. Ajustes visuais, gráficos, filtros e anexos físicos só são homologados onde houver evidência específica, sem promover PR draft indiscriminadamente.

## 5. Banco Mestre e Gestor
- `public.cc_items`: itens `FIN-CAPITAL-V12-FECHAMENTO-20261022`, `FIN-V12-GLOBAL-20261022`, `FIN-V12-CORA-TRELLO-AUDITORIA-20261022` atualizados com a evidência observada sem tocar registros financeiros.
- `gestor-projeto/project-data.json`: visão operacional deve refletir V12 como release oficial, título Acertos PR #151, 31 operações COMMITTED, 11 obras, valores do Capital e o gate histórico aberto; sem trocar a versão de runtime do PWA.
- Rollback do app: somente URLs/branches congeladas anteriores; **nunca** reverter o ledger/Trello como se fossem código estático.

## 6. Resultado rigoroso
**Confirmado:** UI V12 release oficial em GitHub; fix do período dos Acertos; criação de período real e concordância Trello × Supabase; ledger COMMITTED e 0 divergência no consolidado CG.  
**Ainda não certificado:** saldos bancários históricos de todas as competências, vinculação Cora×Trello de cada movimentação, E2E de todos os fluxos e comportamento real após replay. O monitor PROD teve sucesso recente, mas isto não substitui conferência do número exibido em tela.  
**Decisão:** manter oficial estável, atualizar governança, impedir falso status de “pendente de primeiro fechamento”, e não confundir progresso operacional com homologação total.


## 7. Auditoria complementar dos Acertos — P0, sem alteração financeira

Leitura bilateral do `CR-TRELLO-ACERTOS-LIVE-V2` e cartões reais em 23/10. **O resumo automático escolhe o valor recebido, quando informado, como base para lucro e também deduz os custos integrais.** Isso pode descontar duas vezes tarifas/comissões já abatidas do recebimento líquido. Há três casos particularmente fortes, que exigem conciliação bancária antes de qualquer ajuste:

| Obra | Fechado | Recebido | Diferença | Custo de taxa/comissão indicado | Lucro no cartão | Lucro no Acerto Vivo |
|---|---:|---:|---:|---|---:|---:|
| [740-26](https://trello.com/c/ZQxYGEcY) | R$ 8.260,00 | R$ 7.016,05 | R$ 1.243,95 | Taxa 10X R$ 1.243,95 | R$ 2.804,15 | R$ 1.560,20 |
| [768-26](https://trello.com/c/eqRchlZA) | R$ 3.408,60 | R$ 3.200,00 | R$ 208,60 | Taxa/Desconto R$ 208,60 | R$ 1.030,36 | R$ 821,76 |
| [579-26](https://trello.com/c/lsg5ojHi) | R$ 1.850,00 | R$ 1.665,00 | R$ 185,00 | Comissão JBA R$ 185,00 | R$ 532,63 | R$ 347,63 |

**Causa no código lido:** Edge ativa `cr-trello-gestao-vista-v2` v60, função `settlementAnalyze`, define `const base=received!=null?received:closed` e depois `profit=base-totalCosts`, enquanto a descrição dos cartões individuais já contém as respectivas tarifas dentro de `Total de Custos`. A regra não separa receita bruta, recebimento líquido e taxa de intermediador; **o fato de a diferença coincidir com a taxa é forte indício, não prova do extrato Cora para cada um desses movimentos**. Não alterar valores até identificar se a taxa foi efetivamente retida ou cobrada separadamente, se houve pagamento parcial e se o período já está encerrado. O cartão 579-26 também menciona parcela 26/10 como OK embora a inspeção tenha ocorrido 23/10: conferir origem/data da confirmação.

**Controle de repetição de lançamento:** na tabela `cr_finance_v12_operations`, cinco pares partilham cartão+data+valor+direção. Três são correlações esperadas com `EXISTING_TRELLO` entre lançamento manual e transação bancária; outro par de R$150,00 em 818-26 descreve dois apoios distintos (Fabrício/Éder), logo não é duplicidade provada. Resta um par **740-26, 17/10, R$1.239,80**, com dois `COMMITTED` manuais e apenas uma linha visível no card: checar trilha de mutação antes de classificar. **Não excluir ledger nem replicar custo.**

**Impacto de governança:** o Acerto Vivo informa 11 obras, 0 pendências e rateio que soma zero, porém isto verifica a aritmética do algoritmo atual, **não valida a base econômica e tributária**. O crédito Capital de Giro de R$1.058,06 do período 10–23/10 já foi gravado e está protegido contra novo registro; **não estornar, refazer acertos, nem corrigir automaticamente**. Homologação operacional completa de Acertos/Capital deve aguardar esta auditoria de base. O saldo bancário Cora PROD incremental continua saudável, mas não resolve sozinho o vínculo destas obras.
