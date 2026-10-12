# CONSTRU-REI · Cofre Zero — Runbook de recuperação e governança

**Revisado em 12/10/2026.** Fonte de evidência: [checkpoint mestre #53](https://github.com/rogeriocibin-alt/construrei-oauth-pages/issues/53). Este é um procedimento de recuperação **sem alteração automática da produção**; só declarar uma etapa PASS com prova de download, integridade e restauração isolada. Nunca registrar tokens, dados financeiros ou SQL privado no GitHub.

## Política de ambientes e custos

- **PRODUÇÃO**: ambiente único online; manter Central, Gestor, APP, dashboards, finanças, agenda e integrações homologadas sem alteração.
- **HOMOLOGAÇÃO**: branch/CI efêmero com dados sintéticos ou restauração privada em runner isolado; não provisionar banco Supabase, Edge Functions, outro host ou serviço faturável.
- **HISTÓRICO**: Git refs/tags + Drive privado, snapshots imutáveis e content-addressed storage (CAS). Não excluir, mover, sincronizar destrutivamente ou reescrever backups.
- Guardas de Drive existentes: teto conservador CAS/FULL de 15 GiB, reserva livre de 1 GiB; ledger de migrações com teto separado e limites de tamanho. Não equivalem a garantia absoluta de custo zero. Não aumentar franquia, assinatura, add-on, PITR ou quota sem nova aprovação.

## Fluxo automático existente (horas UTC, não horários de Brasília)

| Componente | Executor | Frequência/horário | Evidência atual e limite |
|---|---|---|---|
| Backup principal SQL + Storage | Google Cloud Run/Scheduler (job `construrei-backup`, projeto `app-construrei`) | Todos os dias, **06:00 UTC** | Escreve `CONSTRUREI-BACKUP-AUTO/CURRENT`. SQL 3/3 e Storage. Verificar `BACKUP_STATUS.txt` e manifesto antes de usar. |
| Histórico imutável CAS e migrações | GitHub `.github/workflows/cofre-zero-history-full.yml` | Todos os dias, **06:47 UTC** | `main` run [#38280953997](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38280953997) `event=push` PASS: CAS readback, 4.536 referências, SQL 3/3 e **193** registros de migração, readback privado. A primeira prova `event=schedule` após PR#87 ainda é futura em 13/10. |
| Inventário Netlify | GitHub `cofre-netlify-inventory-offsite.yml` | Todos os dias, **07:15 UTC** | [#38279674080](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38279674080) `event=schedule` PASS. PR#88 [#38283910552](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38283910552) PASS no `push`, com ZIP privado das três fontes Git relacionadas. |
| Git offsite público/privado | GitHub `cofre-zero-git-offsite.yml` | Domingo, **06:37 UTC** | Bundle Git público e readback já comprovados. Repo privado somente se acesso read-only estiver disponível: workflow pode registrar bloqueio explícito, não supor cópia integral. |
| Trello backup completo | `cofre-trello-weekly-dispatch.yml` → `cofre-zero-trello-offsite.yml` | Domingo, **07:45 UTC** | [#38246754723](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38246754723) manual/main PASS: 13 quadros, 1.721 cards, 4.055 anexos e 9.873 arquivos recuperados offline; aguarda primeiro `event=schedule` domingo 18/10. |
| Health gate | `cofre-zero-health-gate.yml` + automação ChatGPT existente | Diário | Gates monitoram integridade, workflows ativos e regressão, **sem substituir teste de restauração**. |

**Regra de prova:** `state=active` não é `event=schedule`. Uma execução `push`/manual não homologa recorrência. Para cada primeiro agendamento, guardar URL, branch, event, data UTC, status final, job, relatórios e leitura privada reversa; falhar fechado em erros reais.

## Ordem segura para recuperar após desastre

1. **Identificar snapshot íntegro:** preservar integralmente `CURRENT` e `HISTORY_FULL`/seed e `HISTORY_CAS`; conferir projeto de origem, RUN_ID UTC, inventário, SHA-256 dos 3 SQL e checksum dos objetos, cota livre e manifesto CAS. Não restaurar sobre base de produção nem mover objetos do Drive.
2. **Recuperar banco em laboratório:** usar runner descartável com Supabase/Postgres **17** compatível e bootstrap oficial Auth/Storage. Examinar `.github/scripts/cr_pg17_real_restore_candidate.sh` e prova [PR#84](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/84). Preparar imagens e dependências **antes** de consultar o backup privado; parar serviços auxiliares e desconectar DB de **todas as redes Docker** antes de introduzir SQL. Executar `roles.sql`, `schema.sql`, `data.sql` com `ON_ERROR_STOP=1`, transação e dados/logs privados. Nunca improvisar schemas Auth/Storage ausentes nem pular COPY para fabricar PASS.
3. **Reconstruir permissões, não apenas tabelas:** comparar RLS, políticas, metadados Storage e ACLs com inventário de origem, incluindo permissões de `anon`, `authenticated`, `service_role`. A prova 12/10 restaurou 193 tabelas operacionais, 192 RLS e 20 políticas; o bootstrap inicialmente concedia SELECT indevido a 160 tabelas. O runbook testado revogou somente no laboratório até restar 1 tabela publicamente legível (`app_public_assets`) e 0 escrita anônima. **Não executar revogação na produção atual.**
4. **Histórico de migrações:** reconstituir `supabase_migrations.schema_migrations` da pasta privada `MIGRATIONS_HISTORY_FULL` ou do CAS/manifesto diário `MIGRATIONS_CAS`, verificar SHA-256, contagem e idempotência. Prova [PR#85](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/85) = **193/193** registros restaurados em Postgres 17 offline, **sem executar o SQL armazenado nas migrations**.
5. **Storage binário:** recuperar todos os arquivos referenciados no snapshot imutável por manifesto/caminho, verificar checksum original e SHA-256 por binário e cruzar metadados `storage.objects` com arquivos. Prova [PR#86](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/86) = **4.531/4.531**, readback e catálogo SHA-256 privado. Resultado válido para snapshot 12/10 06:00 UTC, não inventário atualizado minuto a minuto.
6. **Código e serviços externos:** restituir o Git bundle, código de Edge (370 slugs ACTIVE inventariados em 12/10; baseline e deltas preservados), Trello ZIP/SQLite e Netlify recuperável. Não há prova de reimplantação E2E de 370 funções, de Trello workspace/automações nem de credenciais/links externos. Não publicar páginas candidatas ou reabrir financeiro sem gates funcionais.
7. **Segredos e OAuth:** segredos de Netlify, GitHub Actions, Supabase, Trello, Cora, Click, Google, OAuth e tokens de fornecedores **não são incluídos em arquivos de backup em claro**. Usar inventário de nomes/integrações e rotacionar ou reautorizar no destino legítimo em caso de desastre, por responsáveis habilitados, sem colocar valores em PR, chat, log ou relatório. Se uma credencial crítica não puder ser recuperada/rotacionada, marcar **BLOQUEADO_POR_CREDENCIAL**, não PASS.
8. **Liberação de produção:** antes de cutover, validação de links oficiais (Central inteira, Gestor, APP F00–F09, dashboards, checklist, WIZY, agenda, apresentações, equipe), OAuth/RLS, dados e permissão por perfil; UX real notebook + celular, PWA/cache, rollback exercitado e aprovação humana. Enquanto faltar qualquer parte, `backup_restore_ok=false`. Publicações e snapshots anteriores ficam intactos.

## Netlify: classificação factual, sem deploy artificial

- `construrei-dashboard`: **1 deploy published** com backup ZIP de arquivos estáticos efetivamente baixados e recuperação privada conferida.
- `construrei-f01`, `construrei-home-reference-preview-20260930` e `construrei-f00-canonical-preview-20261001`: **sem deploy published**; três arquivos Git **relacionados**, não idênticos à publicação antiga, preservados no ZIP privado `HISTORICAL_GIT_SOURCE_CANDIDATES.zip` com hashes e recuperação 3/3 no [run #38283910552](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38283910552).
- `construrei-knowledge-v3`, `construrei-central-failover-v1`, `construrei-agenda-v52`: **sem deploy published e sem fonte Git idêntica identificada**. Metadados dos sites e status foram preservados. Não declarar conteúdo inexistente como restaurado; não criar site/página de teste para aumentar contagem artificialmente.
- Nenhum desses inventários contém DNS, variáveis de ambiente, segredos, Netlify Functions ou deploys históricos que não estavam disponíveis.

## Critério objetivo para encerrar Cofre Zero integralmente

- Backup Cloud/CAS/ledger e semanais comprovaram `event=schedule` e recuperação reversa sem violar cotas.
- Banco + migrações + binários + ACL/RLS/Edge e integrações relevantes recuperados conjuntamente em ambiente isolado, sem dependência do notebook e sem novos contratos.
- Trello dados e anexos restauráveis; limitações de workspace/automações explicitadas; fontes Netlify efetivamente existentes preservadas, indisponíveis classificadas corretamente.
- Credenciais externas/OAuth reconstituíveis em procedimento seguro e testado; Central/APP validado visual e funcionalmente em ambos aparelhos, rollback praticável.
- Audit log e Gestor `cc_items.id=EXEC-COFRE-COVERAGE-20261010` sincronizados. **Nunca** alterar `backup_restore_ok` para true por ausência de erros ou por uma prova isolada.

Última auditoria: `cc_changes.id=536` e `537`, checkpoint #53; PRs #84, #85, #87 e #88 integrados. Sem deletar históricos, sem custos contratados adicionais comprovados; franquias existentes seguem aplicáveis.
