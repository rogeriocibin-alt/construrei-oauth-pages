# CONSTRU-REI — Homologação V12: validação manual e auditoria 2026

**Data da promoção:** 28/10/2026. **Autorização:** usuário solicitou expressamente "Bio pode homologar essa versão do dashboard". **Origem:** PR #202 candidata de auditoria + PR #205 correção manual.

## Alteração e versão
- O único arquivo operacional alterado é `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html`.
- O arquivo promovido é **a cópia da candidata** `preview/dashboard-financeiro-v12-oficial-com-auditoria-20261027/index.html`, substituindo somente a string de build `CR-V12-OPERACAO-HOMOLOGADA-ACERTOS-BRUTO-TAXA-20261023` por `CR-V12-OPERACAO-HOMOLOGADA-MANUAL-AUDITORIA-20261028`.
- **Backup byte a byte** da antiga produção: `archives/financeiro-v12/20261028-pre-homologacao-manual-auditoria/index.html` (Git blob SHA `a210ce859f63110701244d78ad2da359312eea5b`). Preservar no histórico do repositório; não substituir.
- A URL oficial continua no caminho `/production/dashboard-financeiro-v12-operacoes-homologada-20261023/`. A versão candidata não é removida e pode ser consultada para comparação.
- Não foi feita migração de banco nem alteração de Trello, Cora, Capital de Giro, contratos de Edge ou regras financeiras. Nenhum custo, rendimento, pagamento ou cartão foi automaticamente lançado para homologar.

## Itens contemplados
- Visual e funcionalidades originais da versão homologada preservados: extrato Cora, Central, aprovisionamentos, anotação informativa, resultados/acertos, ganhos por pessoa, rateios, apoios, diárias, histórico e fechamento condicionado.
- Corrigida a pré-validação do lançamento manual: obra, data, valor positivo, categoria, ao menos um entre favorecido, descrição e referência. O frontend interpreta `MISSING_FINANCIAL_DETAILS` em português e destaca campos incompletos; a API real `cr-finance-v12-safe-trello-candidate-20261021` versão 3 continua a última fonte de verdade.
- Pós-prévia, alteração de campos bloqueia botão de lançamento até refazer a verificação. Escrita real no Trello continua exigindo ação explícita e confirmação via backend/idempotência.
- Inclui os dados da auditoria do espelho importado do Trello, com origem e data de corte, sem fabricar os pagamentos Cora ou presumir que cartões repetidos sejam obras únicas: 278 registros de cartões, 262 códigos de obras distintos, 202 balanceados, 75 incompletos, 1 divergência R$ 70 na extração com corte 24/10/2026.

## Testes e condição de aceite
1. Testes automatizados unitários da candidata PR #205: 9/9 PASS (Node).
2. Chrome em mobile 390 px com respostas simuladas: sem erros JS, prévia incompleta não envia chamada, formulário válido produz prévia, edição invalida commit, Limpar reseta, zero POST real.
3. Testes desta release: a cópia de produção preserva a candidata byte a byte, exceto a marca da versão; backup histórico íntegro; scripts compiláveis e módulos operacionais preservados.
4. Exigir `Central Canonical Guard` e `CONSTRU-REI Change Trace` bem-sucedidos e verificar HTML efetivamente servido na URL oficial após merge.

## Limites da homologação
- **Homologação da interface/código de operação existente, não liquidação contábil de todos os períodos.**
- Não foi executado E2E bancário com sessão de diretor nem lançamento real de teste Trello. Evitar duplicar custo apenas para prova.
- Conciliação completa Cora/Trello, 75 cartões incompletos e fechamento automatizado com CG/meses/ano da PR #174 continuam P0 no Gestor.
- A Edge de auditoria é leitura (GET) e exige sessão. A indicação `online` do cabeçalho não demonstra conciliação bancária.
- Jamais usar as informações JAN–SET/2026 como movimentação bancária ou acerto total de outubro.

## Rollback / reversão
Recuperar o conteúdo do arquivo `archives/financeiro-v12/20261028-pre-homologacao-manual-auditoria/index.html` para o caminho oficial de produção, numa PR de reversão. Validar SHA do arquivo restaurado igual a `a210ce859f63110701244d78ad2da359312eea5b`; manter intactos os dados financeiros, o backup da versão e os demais componentes. Priorizar reversão da interface antes de qualquer ajuste de produção de dados.
