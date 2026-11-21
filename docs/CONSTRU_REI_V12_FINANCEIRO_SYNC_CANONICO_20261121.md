# CONSTRU-REI — regra financeira V12 homologável (21/11/2026)

## Fonte oficial e competência
- Interface oficial única: production/dashboard-financeiro-v12-operacoes-homologada-20261023/ (V12 branca). Não substituir por V4.
- Trello Gestão de Obras AG. ACERTO: somente obras abertas, selecionadas explicitamente pelo diretor na prévia.
- Registro financeiro Supabase: public.cr_finance_2026_period_send_registry_v12 com status COMMITTED significa que os cartões selecionados foram movidos e o corte foi escrito no cartão mensal canônico de VALORES RECEBIDOS 2026.
- Créditos do Capital de Giro: public.cr_working_capital_periods_v1 e cartão Trello com CG_PERIOD_KEY único. CG não é PIX bancário.
- Rateio: Fabrício 20%; Éder 28%; Rogério 28%; Gabrielly 14%; Capital de Giro ou Osvaldo 10% conforme obra e marcação explícita. Não somar apoios/diárias de novo aos rateios.
- Dados históricos declarados não equivalem a recebimentos e retiradas individualmente comprovados no Banco Cora.

## Operação automática após um novo corte
1. Diretor seleciona datas e obras, verifica prévia autenticada, confirma o envio. Sem confirmação não há escrita.
2. cr-finance-v12-period-close-candidate-20261024 (V20 em 21/11) reserva o período; cria UM crédito do CG validado; grava o registro mensal e move os cartões de obras.
3. Após marcar COMMITTED, chama cr-finance-v12-postcommit-sync com chave de serviço, nunca com credencial do navegador.
4. A sincronização valida registro COMMITTED, mês financeiro canônico, todas as linhas base/custos/lucro, 100% do rateio, referências de obras únicas, CG existente e valor exato do CG.
5. RPC cr_finance_v12_consolidate_committed atualiza uma única vez o registro mensal de novembro/dezembro e o controle geral CG. A tabela cr_finance_v12_consolidation_ledger_v1 tem chave primária por período; bloqueia reprocessamentos divergentes ou crédito duplicado.
6. Atualiza resumo do cartão mensal, cartão anual, nome da lista VALORES RECEBIDOS, master CG e nome da lista CAPITAL DE GIRO, resumo operacional do mês.
7. Marca trello_state=SYNCED no diário. Se houver falha secundária: mantém PERÍODO COMMITTED e diário PENDING. Recuperação somente pelo endpoint de diretor action=sync-consolidation com period_key; não repetir commit original.
8. Não criar PIX; não recriar cartões mensais; não reabrir cortes homologados.

## Corte-base conferido 07/11–19/11, já COMMITTED (não reenviar)
- 8 obras: 128-26, 682-26, 755-26, 824-26, 831-26, 836-26, 844-26, 845-26.
- Base R$ 22.883,17, custos R$ 16.892,30, lucro R$ 5.990,87.
- Fabrício R$ 1.198,18; Éder R$ 1.677,44; Rogério R$ 1.677,44; Gabrielly R$ 838,73; Capital R$ 317,46; Osvaldo R$ 281,62.
- Novembro financeiro: 20 obras (12+8), base R$ 35.785,22; custos R$ 24.983,32; lucro R$ 10.801,90; CG acumulado nos dois cortes R$ 798,54.
- Financeiro Jan–Nov: R$ 519.009,14 bruto; R$ 350.522,93 custos; lucro DECLARADO R$ 168.486,11.
- Diferença histórica de R$ 0,10 em FEVEREIRO mantida, pois não é autorização de retificar acertos encerrados.
- CG geral gerado R$ 22.505,25; saldo R$ 1.466,71; crédito de R$ 317,46 registrado UMA VEZ.
- 20 obras do mês movidas e resumo operacional atualizado; cópia do resumo antigo (15 obras) preservada em comentário.

## Proteções contra regressão
- Frontend V12, botões de prévia, autenticação de diretor, seleção flexível de período e envio não são alterados por esta regra.
- A lógica principal não altera Cora. Todas as retiradas do segundo corte são APURADAS, sem comprovante de PIX individual por esta operação.
- Diário de consolidação impede repetir a soma do corte em mês, anual e Capital de Giro; ambos os cortes antigos de novembro já estão cadastrados como SYNCED.
- Erro financeiro crítico bloqueia envio; falha de sincronização posterior é reportada como pendente e pode ser recuperada sem criar outro crédito.
- Auditorias/registros históricos e exceção antiga de CG R$ 169,14 permanecem intactos.
- Escopo atual do backend: somente 2026; períodos até 45 dias; até 40 obras. Suporte 2027 exige mudança homologada específica.

## Rollback, evidências e monitoramento
- Originais na árvore supabase/functions (GitHub) e no histórico imutável da Supabase Edge; reverter uma versão Edge sem restaurar ou alterar os dados.
- Testes em scripts/v12-finance-postcommit-test.cjs; execução CI em .github/workflows/v12-finance-postcommit-test.yml.
- O próximo fechamento real é o teste de ponta a ponta. Os testes automatizados protegem cálculos e lógica mas não podem simular pagamento nem acesso real à sessão do diretor.
- Chave única de período: YYYY-MM-DD_YYYY-MM-DD; em reenvio já sincronizado, não somar novamente. Em PENDING usar somente sync-consolidation (diretor).
