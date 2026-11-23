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


## Revisão 23/11/2026 — v30 (substitui regra de extração de parcelas da v29)
- Edge `cr-trello-finance-sync-v1` implantada como **versão 30**, build `CR-TRELLO-FIN-SYNC-V2-OPEN-RECEIVABLES-20261123-R2`, mantendo o mesmo endpoint, lista, cartão e webhook existente.
- **857-26:** a descrição operacional contém recebimento nominal de R$ 1.300,00 e saldo de R$ 800,00 para 30/11; a regra passou a reconhecer esse saldo documentado no cartão. A data do recebimento não coincide entre título e corpo e deve ser conferida. Não constitui conferência de PIX/Cora.
- **748-26:** primeira parcela R$ 265,00 marcada OK; segunda parcela R$ 385,90 expressa na descrição. A soma R$ 650,90 corresponde ao título, mas **difere do `Valor Fechado` de R$ 650,00**. O consolidado usa R$ 385,90 da parcela expressa e mantém o alerta cadastral — sem corrigir contrato silenciosamente.
- **766-26:** referência a 50% recebido sem lançamento nominal inequívoco; segue `VALOR A CONFERIR`, com projeção R$ 2.489,70 **fora** da soma.
- **670-26:** mantém R$ 1.608,64 pelo bruto menos parcelas OK; as três parcelas de R$ 1.608,33 somam R$ 4.824,99 contra bruto de R$ 4.825,30 (diferença R$ 0,31 a conciliar). A regra só toma parcela futura exata como saldo quando reconcilia com o valor contratado ou título.
- **372-26:** saldo R$ 0,00, permanece em andamento e não entra no total.
- **Resultado verificado no Trello:** 7 obras em andamento + 4 aguardando pagamento, total de **R$ 45.433,54 apurados**, 1 saldo a conferir; cartão único de destino `65b2fd1d5fe2db8fdf52f6c2` exibindo esse total.
- **Teste 1:** `pg_net` request ID **15230**, HTTP **200**, `verified_write:true`, `total_geral:45433.54`, `card_financeiro_atualizado:true`.
- **Teste 2:** request ID **15231**, HTTP **200**, `no_op:true`, `card_financeiro_atualizado:false` e total inalterado, confirmando idempotência.
- **Cron de recuperação:** job **11**, `cr-valores-em-aberto-reconcile-15m`, `*/15 * * * *`, confirmado **ativo** após o deploy. Não foi criado outro cron ou outra automação ChatGPT. A resposta HTTP 200 em chamada manual não substitui a observação de futuras execuções agendadas.
- **Versão salva:** `rogeriocibin-alt/construrei-dashboard-v4-candidate/candidates/2026-11-23-valores-em-aberto-v30.ts` (commit `fd81dd04a482b202fe23548693512c65a306f827`). Backup v28 e candidato v29 documentados acima continuam preservados.
- **Escopo inalterado:** espelho operacional apenas; não debita/credita Cora, não lança acerto, não mexe em rateios, capital de giro, obras encerradas ou valores contratuais.


## Homologação definitiva do escopo operacional — 23/11/2026

**Status: HOMOLOGADO — sincronização automática de valores em aberto (somente espelho Trello).**
Aprovação expressa do responsável em 23/11/2026, após confirmação da automação. Homologação circunscrita ao cálculo e publicação do consolidado; não equivale a conciliação financeira integral.

### Evidências finais
- **Origem:** GESTÃO DE OBRAS 2026, listas `EM ANDAMENTO` e `AG. PAGAMENTO`; apenas obras reais, excluídos cartões de resumo.
- **Destino:** único cartão `VALORES EM ABERTO` do GESTÃO FINANCEIRA, `https://trello.com/c/CpfHokTr`. A descrição e o título são gerados pela rotina existente.
- **Versão homologada:** Edge `cr-trello-finance-sync-v1` versão **30**, build `CR-TRELLO-FIN-SYNC-V2-OPEN-RECEIVABLES-20261123-R2`.
- **Agendador:** pg_cron job 11 `cr-valores-em-aberto-reconcile-15m`, frequência `*/15 * * * *`. O webhook já existente permanece como gatilho por evento; não criar automação concorrente.
- **Evidência automática real posterior ao deploy:** pg_cron execuções de **23/11 10h45 e 11h00 BRT**, `succeeded`; respostas `pg_net` 15235 e 15238, HTTP 200; `total_geral: 45433.54`, `verified_write:true`, `no_op:true`, sem regravações desnecessárias.
- **Leitura de volta:** cartão Trello permaneceu em **R$ 45.433,54**, **7 EM ANDAMENTO + 4 AG. PAGAMENTO**, com **1 saldo a conferir** (obra 766-26). Os valores das obras 857-26 e 748-26 são reconhecidos conforme parcelas expressas no cartão.
- **Restrições preservadas:** obra 766-26 excluída da soma até comprovação; divergências da base 748-26 e parcelas 670-26 seguem identificadas; datas da entrada da 857-26 exigem atenção.
- **Validação de regressão e rollback:** prévia v29 e cópia candidata v30 mantidas, com referências acima; não substituir a integração por nova rotina sem análise de impacto e teste de readback.

### Regra operacional daqui em diante
A atualização do consolidado depende de dados registrados nas duas listas operacionais e ocorre via webhook e cron de reconciliação; alterações sem saldo comprovável não podem virar crédito validado. Em ausência de mudança, não regravar. Nunca gerar comprovante/PIX, acerto, rateio, custos, créditos de Capital de Giro, movimentações bancárias, alteração contratual ou reabertura de obra por essa automação.

**Fora do escopo homologado:** conciliação Cora, verificação jurídica dos contratos, recebimentos não documentados no cartão e sincronização do Dashboard Financeiro. Esses itens não receberam certificação por esta homologação.
**Identificador:** `CR-VALORES-EM-ABERTO-HOMOLOGADO-20261123-R2`.
