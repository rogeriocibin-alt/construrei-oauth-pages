# COFRE ZERO — ÚNICA VERSÃO OPERACIONAL HOMOLOGADA
**Data da decisão:** 24/10/2026  
**Versão canônica:** `COFRE_ZERO_WEEKLY_CANONICAL_20261024_R1`  
**Fonte de verdade para operação:** este manifesto versionado + estados reais do Google Cloud Scheduler/Run e Actions GitHub. **Backup histórico é somente recuperação/auditoria**, não é configuração atual.  
**Escopo homologado:** periodicidade, orquestração, imutabilidade e provas pontuais de recuperação; **não** declarar recuperação integral OAuth/Edge runtime/Netlify/APP como aprovada.

## Única rotina automática atual

| Ordem | Componente | Configuração | Estado |
|---|---|---|---|
| 1 | Cloud Scheduler `app-construrei/southamerica-east1/construrei-backup-diario` | Domingo `0 3 * * 0`, `America/Sao_Paulo` | único produtor `ENABLED`, gera CURRENT no Drive |
| 2 | Cloud Run Job `construrei-backup` | Acionado exclusivamente pelo Scheduler aprovado | produtor principal, sem vínculo com notebook |
| 3 | GitHub Actions `.github/workflows/cofre-zero-history-full.yml` | Domingo `47 8 * * 0` UTC = 05h47 BRT | único cron do Cofre no GitHub; valida idade < 36h, CAS incremental e verificações |
| 4 | Trello incremental | `cofre-zero-trello-offsite.yml` | SUBORDINADO via `workflow_dispatch` emitido pelo CAS; SEM cron próprio |
| 5 | Git offsite e testes | Jobs `git_offsite_weekly` e `static_site_recovery_weekly` dentro do mesmo workflow semanal | sem novos crons; independentes e fail-reporting |
| Manual excepcional | `construrei-cloud-backup.yml` | `workflow_dispatch` exclusivamente | NÃO é uma segunda rotina automática; uso somente emergencial explícito, sem cópia FULL automática |

**Exclusividade:** só o Scheduler `construrei-backup-diario` pode disparar a produção do CURRENT; só `cofre-zero-history-full.yml` possui cron Cofre GitHub. Nenhum job legado pode reativar backup diário nem alterar CURRENT. A nomenclatura histórica `-diario` é um ID técnico imutável do job *semanal*, nunca indicação de periodicidade. Não renomear para evitar perda de histórico/permissões.

## Legados definitivamente despromovidos

- `construrei-cloud-backup-daily` (Cloud Scheduler `southamerica-east1`): **duplicata desativada**, originalmente `PAUSED`, mesmo agendamento agora normalizado para domingo antes da aposentadoria. Target legado: Cloud Run Job `construrei-cloud-backup`. Nenhuma dependência ativa do job canônico. Remover somente o gatilho Scheduler obsoleto depois de confirmar este documento e guardar seu inventário. Não executar o antigo.
- `construrei-cloud-backup` (Cloud Run): imagem/job histórico **somente para rollback sob mudança explícita**, sem agendamento. Não eliminar binários/imagens enquanto recuperação E2E não estiver assinada.
- Branches, PRs, documentos, programas e snapshots `HISTORY_FULL`, `HISTORY_CAS`, `OBJECTS` e `MANIFESTS` anteriores: **somente referências históricas imutáveis**, jamais fonte para substituir CURRENT ou reabilitar execuções; não apagar conteúdo.
- Rascunhos/checkpoints de versões anteriores e placeholders do Gestor: estado datado; **não podem sobrepor** este manifesto nem os registros vivos do Supabase. Critério de precedência: 1. leitura autenticada do executor ativo 2. GitHub `main` canônico + CI 3. banco mestre `cc_items` com evidência 4. snapshots/referências antigas apenas históricos.

## Estado REAL das evidências em 24/10

- Cloud Run `construrei-backup-mfc8c`: Completed True em 24/10, fonte `CURRENT` do Drive `RUN_ID 20261024-060009`, 3 SQL e 4547 arquivos Storage. Scheduler já alterado para domingo mas **primeiro disparo semanal natural aguarda 25/10**.
- Ensaio real isolado PostgreSQL 17 + recuperação privada do manifesto Trello: GitHub Actions `40094538430`, SUCCESS; cobertura não inclui ambiente Auth/OAuth após desastre.
- Edge Functions: 386 inventariadas, 359 preservadas no acervo anterior e 27 exportadas com conteúdo exato e conferência de volta em Drive privado; **código recuperável, runtime e segredos não testados**.
- Netlify: 7 sites no inventário. Dashboard HTTP 200, seis URLs primárias retornaram HTTP 404 em 24/10; classificar antes de qualquer publicação. Inventário: https://docs.google.com/document/d/1srTTb_TEXIIZobZW7_cruXLP0znzHea58EffvEFzRTI/edit
- Central/Gestor/Home: HTML restaurado em servidor localhost descartável, três HTTP 200; CI permanente no workflow homologado via PR #161, tests SUCCESS.
- Git offsite: PR #160 integrada; teste sintético PASS, **prova real de gravação no Drive na primeira rotina semanal ainda pendente**.
- Auditoria vigente: https://github.com/rogeriocibin-alt/construrei-oauth-pages/issues/53
- Banco Mestre/gestão operacional: `EXEC-COFRE-COVERAGE-20261010` (parcial, recuperação E2E pendente) e `EXEC-COFRE-TRELLO-20261011` (restore textual isolado aprovado) são o mesmo Cofre, **não dois projetos**.

## Política contra regressão e falsos positivos

1. Proibido habilitar cron diário automático para Cofre; proibido duplicar Scheduler ativo e criar workflow de backup em paralelo. Um job auxiliar **sem cron** não é executor concorrente.
2. Antes de qualquer alteração de rotina, mudar em candidata isolada, executar `Central Canonical Guard`, `cr_ecosystem_contract_audit.py` e testes CAS/Trello/restore; só então incorporar `main`.
3. O backup semanal pode perder até ~7 dias de alterações se ocorrer desastre; não ocultar RPO. Só alterar periodicidade por nova decisão autorizada.
4. Nada de reconstruir 2023→hoje copiando FULL antigo por cima de estado atual: CAS tem manifestos e hashes, incremental/deduplicação, sem sobrescrita automática.
5. Segredos e dados financeiros não são exportados nos manifests de configuração. OAuth/provedores só devem ser reautorizados pelo caminho oficial, nunca reconstruídos a partir de valores sensíveis em logs.
6. Recuperação integral `backup_restore_ok=true` só com restauração autenticada ponta a ponta de todos os componentes exigidos, incluindo OAuth/Edge/Netlify/APP. HOMOLOGAÇÃO da **rotina atual** não implica essa prova.

**Regra para o Gestor:** refletir a rotina semanal corrente; exibir versão legada como "Histórico/inativa". Nunca preencher título/estatística atuais usando campo antigo `backup automático diário`. Manter vínculos para rollback isolado, não em módulos operacionais.
