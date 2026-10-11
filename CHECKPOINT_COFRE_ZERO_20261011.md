# CONSTRU-REI | Checkpoint Cofre Zero — 11/10/2026

## Fontes verificadas
- Executor canônico do backup diário: Google Cloud Run + Cloud Scheduler (`construrei-backup`, 03:00 America/Sao_Paulo), conforme inventário oficial do Gestor do Projeto V1.2.5.2. Não depende do notebook.
- `CONSTRUREI-BACKUP-AUTO/CURRENT/BACKUP_STATUS.txt`: RUN_ID `20261011-060021`, 3 arquivos SQL, 4.526 objetos Storage; `data.sql` ~210 MB. Arquivos presentes no Google Drive em 11/10.
- `HISTORY/20261011-060021` guardava arquivos *anteriores* alterados pelo `rclone sync --backup-dir` (inclusive status 10/10), não um snapshot integral datado 11/10.
- Baseline de restauração previamente documentada em 05/10 no Gestor. **Não significa que os dados de 11/10 já foram restaurados num banco isolado.**

## Correção isolada
- Novo workflow `.github/workflows/cofre-zero-history-full.yml`: coleta `CURRENT`, valida RUN_ID e fonte, cria `HISTORY_FULL/<RUN_ID>` com `rclone copy --immutable`, confere integralidade, rebaixa arquivos SQL e 3 amostras Storage com verificação byte/sha.
- Execução candidata: https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38169973796
- PR de homologação: https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/48
- Agendamento proposto para 06:32 UTC diariamente, após executor oficial das 06:00 UTC; só entra em vigor após merge no `main`.
- Nenhuma edição/deleção do `CURRENT`, `HISTORY` legado ou projeto Supabase pela rotina de arquivo. Sem política destrutiva de expurgo automático.

## Outras fontes — cobertura
- GitHub público: bundle offsite testado com readback em 11/10; Git privado **bloqueado** por ausência de `COFRE_GITHUB_READ_TOKEN`.
- Edge Functions: auditoria SHA do baseline (339 arquivos) passou; não comprova cobertura completa das 366 Edge Functions vivas.
- Trello: tentativa do workflow `cofre-zero-trello-offsite` falhou por `TRELLO_API_KEY` e `TRELLO_API_TOKEN` ausentes.
- Netlify: tentativa de exportação offsite falhou por `NETLIFY_AUTH_TOKEN` ausente; não inclui Functions, env secrets, DNS, histórico de deploy.
- Sem retestar recuperação funcional completa do banco e sem credenciais destas fontes, o Cofre Zero **não deve ser rotulado 100% de recuperação total**.

## Gate de fechamento
1. CI da candidata conclui com `success`, Drive contém snapshot full com os SQL e 4.526 arquivos Storage.
2. Converter PR para pronto e promover somente após confirmação de readback e diff isolado.
3. Manter matrizes Trello/Netlify/Git privado como pendências explícitas até credenciais legítimas/configuradas e novo teste de exportação.
4. Não reabrir bases financeiras nem alterar versões homologadas dos aplicativos.

## Rollback
- Mudança adiciona um caminho de backup somente leitura da produção, e o antigo Cloud Run segue intocado.
- Para desativar agendamento futuro, reverter o merge do workflow novo; nunca apagar `HISTORY_FULL` existente.
