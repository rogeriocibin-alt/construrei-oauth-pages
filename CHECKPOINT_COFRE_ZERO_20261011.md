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


## Atualização móvel sem dependência do Work — 11/10/2026 (19h30 BRT)

**Entregue e verificado:**
- Gestor do Projeto → Infraestrutura & TI → **Cofre Zero • Controle Móvel**; link próprio: https://rogeriocibin-alt.github.io/construrei-oauth-pages/gestor-projeto/cofre-mobile/
- Nova função Supabase `cr-cofre-mobile-status-v1` (JWT habilitado, GET/OPTIONS, sem mutações) consulta somente status agregado do histórico Supabase e dos GitHub Actions. Nenhum segredo administrativo entregue ao navegador.
- CI `.github/workflows/cofre-mobile-smoke.yml` testa JavaScript, integração real com Supabase/GitHub, bloqueio de POST e link do Gestor. Execução **SUCCESS**: https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38180472942
- Página instalada sob o mesmo escopo do PWA; a alteração na versão canônica limita-se a um link em Infraestrutura & TI. Central, motor de backup Cloud Run e fluxos F00–F09 preservados.
- A consulta de `cr_internal.cofre_zero_executions` confirma último backup semanal em 11/10/2026 06:00–06:02 UTC, status completed: 136 páginas/11.154 itens, com inventário de 13 quadros Trello. **Não inclui garantia de binários Trello.**

**Correção da dependência de credencial de gerenciamento no PR #47:**
- Teste anterior falhava com HTTP 401 em `https://api.supabase.com/v1/projects/.../api-keys?reveal=true`; a variável de PAT existia, mas não tinha autorização.
- Candidata `cofre-trello-oidc-readonly-v1` valida assinatura GitHub OIDC/JWKS, emissor, audiência dedicada, IDs imutáveis do repositório/proprietário, ref exata, workflow_ref, evento e runner. Apenas GET e caminhos Trello permitidos. Verificações negativas sem credencial, audiência diferente, método POST e path fora da lista foram aprovadas no runner 38180825370.
- Sem PAT permanente no GitHub, sem segredo do Trello no executor e sem depender do Work. Os segredos Trello existentes permanecem exclusivamente no Supabase.
- O segundo ensaio 38180825370 comprovou leitura do inventário dos 13 quadros. O bloqueio subsequente era um gate local antigo que exigia token fixo. Esse gate foi corrigido no commit `313da252`; a execução `38180875426` foi iniciada para validar o arquivo integral e o readback do Drive. Não afirmar sucesso integral antes de conferir o resultado definitivo.
- O PR #47 continua DRAFT, sem merge/agenda e sem autorizar alteração de fonte Trello, até validação dos anexos/ZIP/restauração e cópia offsite.

**Controle operacional:**
- A tela móvel oferece atualização, cópia do checkpoint, histórico e retorno ao Gestor; **não promete um botão manual de backup** sem vínculo real do proprietário ao Supabase Auth/RBAC. Em 11/10, a tabela `cr_rbac_expected_human_users` registra `ROGERIO` validado humanamente, mas `auth_user_id` não vinculado; não aceitar PIN fixo público, URL mágica sem autenticação, credenciais em código ou operação privilegiada com JWT `anon`.
- Pela conversa do ChatGPT, usar conectores instalados GitHub/Supabase/Trello/Netlify para auditorias e ações permitidas, sem depender da cota do Work. Serviços subjacentes continuam sujeitos às suas próprias credenciais e disponibilidade.
- Sempre preservar versão homologada, teste isolado, leitura antes de alteração, checkpoint e rollback. A falta dos seis Netlify estáticos continua real; não registrar Netlify 7/7 sem artefatos.

