# Cofre Zero único • Ciclo semanal incremental (candidata, 17/10/2026)

## Decisão vinculante da diretoria
Um único Cofre Zero, **um ciclo programado por semana**, preservando o FULL inicial/históricos já validados, sem novos cofres, credenciais, endpoints, provedores ou exclusões. Copiar apenas objetos novos/alterados por CAS (hash). Preservar 2024–2026 e dados futuros do Dashboard Financeiro inteiro, inclusive lógica, código, fórmulas, conectores, regras de rateio e todas as fontes relevantes. Anexos binários antigos do Trello não são prioridade para novas cópias, mas os originais permanecem.

## Descoberta técnica que impede mudança direta em produção
- O BACKUP PRINCIPAL é **Cloud Scheduler → Cloud Run** `app-construrei / construrei-backup`, configurado diariamente para 03:00 BRT. O repositório só contém o script usado pelo contêiner, não a configuração ativa do agendamento Google Cloud. O conector atual não consegue acessar/editar o Cloud Scheduler.
- O HISTÓRICO CAS existe no workflow `.github/workflows/cofre-zero-history-full.yml`, atualmente diário às 05:47 BRT e usando manifesto imutável/seed. A nova candidata torna este workflow **reutilizável**, sem cron próprio.
- O acesso OIDC à fonte Trello foi autorizado pelo Supabase para o caminho EXATO `.github/workflows/cofre-zero-trello-offsite.yml@refs/heads/main`. Mover a chamada para outro arquivo quebraria a autenticação. Este arquivo foi apagado no PR #124. A candidata recupera o MESMO caminho, agora orquestrando Trello textual CAS + CAS Supabase; não solicita autorização nova.
- O workflow privado Git e eventuais automações externas ainda requerem inventário, reconciliação de agendamentos e incorporação sem segundo cron. Não eliminar proteção funcional antes de substituição e teste.

## Arquitetura da candidata (sem ativação)
- Somente **um evento agendado** no antigo arquivo Trello: domingo 08:47 UTC = 05:47 America/Sao_Paulo, além de comando manual `workflow_dispatch` que não cria novo cron.
- Dois jobs do mesmo ciclo: (a) Trello textual incremental, com bridge OIDC read-only existente e Drive já autorizado; (b) CAS SQL/Storage do Supabase via o workflow existente, convertido para `workflow_call`. A ausência de agendamento duplicado é checada no auditor do ecossistema.
- Trello exporta sem baixar anexos binários: boards, cards com texto e metadados, listas, labels, campos e histórico de ações. Organiza eventos por mês e cards por prefixo imutável de ID, normaliza JSON, comprime deterministicamente, salva novos blocos somente quando o hash ainda não existe. Cria manifesto imutável apontando para blocos novos e reaproveitados, com readback SHA-256 de cada bloco novo. Não sobrescreve nem exclui arquivos.
- Prefixo técnico sob a **mesma árvore CAS já existente**: `CONSTRUREI-BACKUP-AUTO/HISTORY_CAS/TRELLO_TEXT`. Não é outra operação comercial nem nova infraestrutura.
- Limites: no máximo 10 GiB para os objetos Trello textual CAS e pelo menos 1 GiB livre após inserção (ajustável somente com revisão comprovada); valida no mínimo 13 quadros e 1.500 cards, sem tratar queda silenciosa da origem como backup completo. Não imprime dados financeiros nos logs.
- Atualizações do banco são arquivos SQL completos na origem atual; CAS reaproveita os objetos idênticos, mas **não se deve prometer CDC/backup incremental linha a linha sem desenvolver e validar isso**. A primeira execução textual CAS precisa criar seus blocos; depois reaproveita iguais.

## GATES PARA PROMOÇÃO (não concluir artificialmente)
1. Testes offline + CI da candidata e auditoria de contratos, inclusive fonte alterada e ausência de credenciais.
2. Comprovar sessão OIDC do **mesmo workflow/restabelecido em main** sem ampliar permissões; execução pontual somente após gates/rollback preservados.
3. Confirmar e alterar o Cloud Scheduler ORIGINAL de diário para domingo às 03:00 BRT; sem segundo Scheduler/Cloud Run. **Esta etapa ainda não é executável pelos conectores disponíveis**. Preservar cron diário antigo até estar apto à substituição.
4. Confirmar primeiro FULL WEEKLY do produtor + ciclo único TRELL0/CAS domingo 05:47 com readback. Respeitar orçamento, latência, limites de Trello, GitHub e Drive. Verificar o retorno de erros de cada job independentemente, sem mascarar falhas parciais.
5. Conciliar backup privado Git/Netlify/Edge e componentes do dashboard sob o mesmo inventário lógico, sem alterar os seus agendamentos ou autenticações antes da substituição comprovada. Recuperação isolada do sistema financeiro e recálculo de KPIs; manter `backup_restore_ok=false` até evidência.

## Interdição
**PR é DRAFT, NÃO MESCLAR nem criar/disparar cron** antes de comprovar o item 3 e os demais gates de segurança. O GitHub registra a candidata, mas não atualiza o console Cloud por si só. Nenhum backup antigo pode ser removido. Toda proteção atual, inclusive 03:00 e 05:47 diários, permanece em operação durante a transição. Governança em `EXEC-COFRE-COVERAGE-20261010` e `EXEC-COFRE-TRELLO-20261011`, ambos P0, status Em andamento.

Fonte: checkpoint #53, runs Trello #38180968850 e #38246754723, CAS #38825322289/#38908620345.
