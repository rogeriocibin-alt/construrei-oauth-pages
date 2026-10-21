# Dashboard Gerencial V12 — auditoria e arquitetura candidata
Data: 2026-10-21. Estado: EM AUDITORIA / NÃO HOMOLOGADO / SEM DEPLOY.
Domínio: Financeiro. Titular da regra: Financeiro REI. Engenharia: CR Assertivo. Orquestração: BIO. Aprovação: Rogério.
Baseline: production/dashboard-financeiro-v11-cora-pro-v2-20261020/index.html; checkpoint CHECKPOINT_FINANCEIRO_V11_CORAPRO_V2_PRODUCAO_20261020.md.
Branch candidata: candidate/financeiro-v12-auditoria-20261021. Escopo: somente auditoria e organização; sem modificar dados, backend, produção ou aliases.
## Evidências verificadas
- Projeto Supabase yspuaamokjbrosytqjpg ACTIVE_HEALTHY; leitura de catálogo em public. Tabela cr_financial_entries_v1 existe, mas não representa sozinha o banco mestre bancário.
- Cora Pro V2 utiliza cache/API mTLS segundo checkpoint 20/10; checkpoint registra 7.656 movimentos e 46 competências até 20/10 21:30:06Z. Este número é histórico, NÃO validação em tempo real de 21/10.
- Trello: card de resumo de capital de giro (QRs2VwFb) indica crédito gerado R$ 20.263,54, saldo interno disponível R$ 3.356,69, consumo R$ 16.906,85 e três títulos divergentes. São dados registrados no card, ainda não conciliados com banco.
- Trello: AG. ACERTO 2026 (sa0x7eVL) indica 2 obras, lucro R$ 1.844,19, distribuição projetada. Não confundir com retirada paga.
- Histórico de 2025 inclui rateios diferentes da regra vigente e acertos parciais (ex.: 763-25): conservar período/critério original; não reprocessar eventos antigos sem aprovação.
- A V11 mantém tabs agora, fin, cora, hist, conc, cost, qual e Cora Pro V2. Frontend apresenta gráficos de barras com tonalidade azul uniforme na camada legada. Reorganizar interface sem perder funcionalidades.
## Arquitetura candidata
1 Visão Executiva (KPIs unificados, distinção competência/caixa).
2 Cora Pro V2 (extrato bancário, saldo e sincronização preservados).
3 Central de Operações Financeiras (Cora Manual / Trello, previsualização, lançamentos e fechar obra preservados).
4 Resultados e Acertos (custos, prestadores, lucros, rateios, retiradas efetivas, capital de giro).
5 Inteligência Histórica (bancário 2023-2026; operação 2024-2026, sem lucro presumido em 2023).
6 Auditoria e Saúde Financeira (conciliação classificada, duplicidades, cobertura e evidências).
## Regras de qualidade
- Valor bancário só é receita após classificação. Não agregar Trello e Cora como dois recebimentos.
- Acerto: separar previsto, devido, registrado, pago e divergente.
- ID idempotente para transações; matching 1:N e N:1, sem baixa automática sem confiança suficiente.
- Metrificar cobertura por fonte, período e consistência. Não chamar dados completos de reconciliados sem prova.
- Paleta semântica coerente com Cora Pro V2: azul entradas, vermelho saídas, amarelo pendências, verde margem positiva.
## Bloqueios/gates
- Identificar em código e infraestrutura fonte bancária persistente e função atual de atualização; não presumir que tabela cr_financial_entries_v1 esteja populada.
- Auditar divergência de capital de giro e acertos históricos antes de implementar cálculos.
- Testes E2E com escrita não podem atingir produção; se isolamento ausente, gate BLOQUEADO_POR_ISOLAMENTO.
- A aprovação da candidata e eventual publicação exigem CI, revisão Financeiro REI, validação Rogério e rollback.
- Sem criação de Supabase branch, Edge, cron, serviço pago ou link Pages permanente. 
## Próxima ação
Continuar inventário da V11 e do Supabase (somente leitura), localizar rotinas atuais de conciliação e consolidar matrizes de valores por período. Gerar diff de interface somente na branch isolada e executar testes com dados fictícios. Atualizar registro mestre existente no Gestor, sem criar pendência duplicada.
## Rollback
Produção V11 e alias production/dashboard-financeiro-v4/ intactos. V4 homologado de 07/10 preservado. Descartar branch candidata é reversão de todas alterações deste escopo.
