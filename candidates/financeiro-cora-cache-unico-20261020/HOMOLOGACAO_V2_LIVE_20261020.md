# CONSTRU-REI — Homologação técnica: Gestão Financeira Cora Pro V2

**Data:** 20/10/2026  
**Escopo:** candidata existente `candidates/financeiro-cora-cache-unico-20261020/`.  
**Aprovação:** identidade e funcionalidades da candidata aprovadas em conversa; automação de saldo e movimentos bancários autorizada expressamente.  
**Status:** homologação técnica da rotina de atualização e ponto de congelamento do código (a produção não foi promovida).

## Pontos congelados

- Comparativos e filtros diários, semanais, mensais, anuais, séries 2023–2026, gráfico circular, fluxo de caixa, demonstrativo bancário, exportação CSV.
- Três fontes com alçadas independentes: Cora = banco, Trello = obras/valores gerenciais, Gestão Click = orçamentos/comercial.
- Autenticação de diretoria existente e integração mTLS oficial preservadas; nenhuma credencial embutida no front-end, nenhum movimento bancário de escrita.
- Saldo Cora oficial atualizado por API; preservar a fonte do saldo manual no dashboard V11, sem alterá-lo.
- `cr-cora-cache-worker-20261020` (versão 8 no checkpoint): consulta **automática** de três datas corridas (hoje UTC e dois dias anteriores), todas as páginas da API, registro idempotente por `source_id`, conciliação dos sumários mensais, consulta do saldo oficial e diagnóstico de falhas.
- `cora_cache.trigger_worker()` executada pelo job de cron **já existente** `construrei-cora-backfill` (ID 3, cron por minuto): a cada múltiplo de cinco minutos convoca o modo `live` assinado; nos demais minutos atende a fila de backfill. Não foi criada outra integração bancária nem outro job.
- `cr-cora-cache-gateway-20261020` (versão 14 no checkpoint) fornece dados do cache e o status de sincronização aos usuários autorizados.
- A candidata consulta o cache automaticamente: indicadores/extrato do mês corrente a cada 60s e gráficos em visualização a cada 120s (somente com a aba visível).
- As regras de Trello, Gestão Click, obras fechadas, rateios e produção não foram alteradas.

## Evidências coletadas no checkpoint

- 46/46 competências de 2023-01 a 2026-10 importadas.
- 46/46 resumos conferidos contra movimentações agrupadas no fuso UTC do extrato oficial.
- 7.656 movimentações armazenadas e **7.656 IDs únicos**.
- Primeiro teste do hot-sync: 17 lançamentos conferidos, +3 novos registros, saldo obtido pela API; resposta HTTP 200.
- Segundo teste **sem execução humana**, via cron em 20/10/2026, 18h10 BRT: 17 conferidos, 0 novos, último sucesso de saldo e extrato sem erro.
- A latência **não é instantânea**: atualização do servidor a cada cinco minutos mais tempo de disponibilização/compensação da transação pela Cora, e atualização da tela em um a dois minutos.
- O extrato Cora não prova automaticamente a quitação de uma obra Trello; conciliações por obra requerem evidências específicas antes de qualquer baixa.

## Critérios obrigatórios contra regressões

1. Não trocar a candidata por clone, não modificar a produção nem os saldos manuais.
2. Não apagar nem reconstruir os 46 meses e não inserir transações fictícias.
3. Para qualquer alteração, criar uma candidata isolada e preservar este checkpoint como rollback.
4. Validar 46/46 resumos reconciliados, IDs bancários únicos, saldo com `source=CORA_OFFICIAL_API`, autenticação mTLS, atualização assinada e mensagem de desatualização se o serviço atrasar.
5. Validar responsividade em notebook e celular antes de nova promoção; não declarar testes de interface que não ocorreram.
6. Nunca duplicar caixa somando Cora + Trello + Gestão Click. Não emitir quitação nem registrar despesa no Trello sem correspondência comprovada.
7. Preservar a proteção de diretoria e o controle de acesso ao gateway; nenhuma chave bancária deve aparecer no GitHub ou no navegador.

## Referências e recuperação

- Repositório: `rogeriocibin-alt/construrei-oauth-pages`.
- Snapshot anterior à sincronização automática: branch `checkpoints/cora-pro-v2-20261020-before-live-48h`, commit `55b1309ff54046062587d58def6f9ace861fc966`.
- Snapshot final: branch `checkpoints/cora-pro-v2-20261020-live-homologada` a ser criada apontando para o commit deste registro.
- Supabase: projeto `yspuaamokjbrosytqjpg`; migrations de 20/10/2026 e `cora_cache.live_sync_state` constituem o estado operacional.
- Homologação técnica de integração não equivale a bloqueio absoluto de escrita no GitHub nem a disponibilidade instantânea garantida pela instituição bancária.
