# CONSTRU-REI — Valores em Aberto: sincronização automática homologada (20/11/2026, horário de Brasília)

## Escopo e fontes
- Quadro operacional único: Gestão de Obras 2026, listas **EM ANDAMENTO** (id `665b0fece8104b14ac706e55`) e **AG. PAGAMENTO** (id `6800f431f2eb1415a46a5559`).
- Destino exclusivo: Gestão Financeira, lista **VALORES EM ABERTO**, cartão `65b2fd1d5fe2db8fdf52f6c2` (`https://trello.com/c/CpfHokTr`).
- Função Edge existente atualizada: `cr-trello-finance-sync-v1`, implementação **V29**, build `CR-TRELLO-FIN-SYNC-V2-OPEN-RECEIVABLES-20261120-R1`.
- A integração por webhook do quadro de obras permanece presente, com evidência de eventos recebidos do Trello em 21/11/2026 UTC. Reconciliador periódico independente: `pg_cron` job **11**, nome `cr-valores-em-aberto-reconcile-15m`, agenda `*/15 * * * *` (UTC), **ativo**.
- A programação é um mecanismo de recuperação mesmo se a notificação do Trello não chegar; ela consulta novamente os cartões operacionais, não utiliza números de requisições como fonte.

## Proteção dos cálculos
- Cada orçamento é identificado pelo seu código; cartões de resumo não integram a apuração.
- Saldo explicitamente informado, parcelas recebidas marcadas OK ou valor contratado ainda sem pagamento são interpretados conforme documentação visível no cartão operacional; o sistema não cria recibos e não altera o extrato Cora.
- Em pagamento parcial sem saldo inequívoco, o cartão fica com **VALOR A CONFERIR**, excluído da soma até conciliação. Ex.: 766-26 e 857-26.
- Desacordos entre valor bruto do título e `Valor Fechado` aparecem como alerta, sem alterar silenciosamente o valor histórico. Ex.: 748-26, título R$ 650,90 versus descrição R$ 650,00; pendente calculado pela descrição R$ 385,00. Conferir a segunda parcela de R$ 385,90 antes de retificar.
- Valor bruto/contratado não é equivalente a receita bancária recebida, tampouco a lucro disponível ou acerto distribuído. Recebidos antecipadamente com saldo zero permanecem visíveis como operação, mas não entram no total a receber.
- Cada execução compara descrição e título atuais com resultado apurado, grava apenas se houver mudança e verifica a gravação por leitura posterior. Sem alterações, retorna `no_op:true`.
- Essa sincronização **não** movimenta cards operacionais, não reabre acertos, não lança custos, não escreve no banco Cora e não gera créditos de Capital de Giro.

## Homologação e conferência inicial
- 7 obras em andamento + 5 aguardando pagamento = 12 obras.
- R$ 45.832,64 **apurados pelo Trello** (não conciliados integralmente com Pix).
- Obras 766-26 e 857-26 excluídas do total até confirmação documental. Para 766-26, há mera projeção de R$ 2.489,70 com 50% declarados como recebidos; a projeção **não** compõe o total.
- Primeira chamada de reconciliação: `net.http_post` id **14031**, HTTP 200, `card_financeiro_atualizado:true`, `verified_write:true`.
- Segunda chamada: id **14032**, HTTP 200, `card_financeiro_atualizado:false`, `no_op:true`, comprovando idempotência em fonte estável.
- Consulta do `cron.job` confirmou a tarefa 11 habilitada.
- A próxima execução programada e os futuros webhooks dependem da disponibilidade da integração Trello/Supabase; uma mudança de cartão deverá produzir atualização ou um erro observável. Não assumir que comprovantes Pix foram conferidos por esta rotina.

## Versões e rollback
- Antes do deploy foi salvo o código v28 em `rogeriocibin-alt/construrei-dashboard-v4-candidate/backups/2026-11-20-valores-em-aberto-v28.ts`.
- Versão candidata v29 em `rogeriocibin-alt/construrei-dashboard-v4-candidate/candidates/2026-11-20-valores-em-aberto-v29.ts`.
- Para reversão segura: desabilitar primeiro o cron via `cron.alter_job(job_id := 11, active := false)`; restaurar Edge v28 caso necessário; revalidar o único cartão destino; não mexer em Cora, Capital de Giro ou acertos já fechados.
- A lista Financeiro **VALORES EM ABERTO** permanece com nome intacto para evitar quebrar outras dependências. Somente o título e a descrição do cartão de resumo são derivados.
