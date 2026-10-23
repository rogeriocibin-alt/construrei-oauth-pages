# Operação única: Cora → Obra / Capital de Giro → Trello → Indicadores

Requisitos complementares aprovados em 23/10/2026:

1. **Logo**: reutilizar o logotipo oficial já empregado no aplicativo/central, no cabeçalho esquerdo, nunca usar texto substituto ou marca inventada. A Central homologada utiliza endpoint existente `/functions/v1/construrei-logo` no projeto Supabase, mas verificar autorização e fallback local antes de homologar.
2. **Aprovisionamento por obra**: selecionar obra não é gravar; confirmação explícita, chave imutável de movimento Cora, registro persistido no banco operacional, espelhamento idempotente no card Trello correto, leitura de volta, atualização dos KPIs. Não marcar verde antes de confirmação. Não tocar em obra fechada.
3. **Capital de giro operacional**: nova aba **interna** na Central de Operações, não uma nova página: saldo real de referência, capital gerado por fechamento, despesas e acertos; criar despesa, registrar geração por fechamento e acerto; origem/obra/competência, comprovante e histórico; respeitar rateio oficial de 10% sobre lucro líquido e não duplicar o lançamento no card de CG temporário.
4. **Fechar Obra**: manter e reaproveitar botão homologado e o rateio 20/28/28/14/10. O fechamento não pode ser simulado como real nem reabrir obra concluída.
5. **Atualização automática**: após escrita confirmada, invalidar/refazer dados financeiros afetados e atualizar visão executiva, Cora Pro V2, resultados/acertos e saúde dos dados, sem alterar saldo bancário por classificação contábil.
6. **Cora** é fonte de verdade bancária; Trello espelho operacional. Não alegar que aprovisionar grava no banco Cora: o registro de classificação é operacional, vinculado ao ID bancário.
7. **Antirregressão visual**: V12 homologada clara, cartões brancos, azul e dourado; logo oficial. Não introduzir identidade escura de outras versões.

Gates antes de liberação: teste com ID Cora real em ambiente seguro, confirmação de card Trello, idempotência em retry, CG geração/despesa/acerto, reconciliação e recálculo de KPI, fechamento de obra, celular+notebook, rollback. Preview local é demonstração, não publicação conectada. **Sem merge em produção.**
