# CONSTRU-REI — checkpoint técnico sem interferência | 13/10/2026

**Estado:** CANDIDATA ISOLADA; NÃO HOMOLOGADA / NÃO PUBLICADA.
**Fonte de governança:** Gestor do Projeto, itens existentes ARCH-SAN-20261012, ARCH-TRUTH-20261012, WZ-01, EXEC-COFRE-COVERAGE-20261010 e EXEC-COFRE-TRELLO-20261011. Este documento é evidência, não uma segunda fila.
**Origem:** main SHA 742616ffe122e40d040ea3e180c7eec5fc2b5001; candidata candidate/guard-zero-interferencia-20261013.

## 1. Limite técnico para esta candidata

Somente três arquivos novos: este checkpoint, .github/scripts/cr_safe_candidate_gate.py e seu teste sintético.

- PROIBIDO alterar production/, central-runtime/, central/, gestor-projeto/, preview/, funções Edge, links oficiais, PWA, Trello, financeiro, Click, Cora, Google Agenda, tabelas, Auth/RLS, rotinas, segredos e integrações operacionais.
- Nenhum merge ou promoção automática. Draft PR apenas; revisão obrigatória antes de promoção.
- Controle de escopo da branch Git NÃO é prova de que sistemas externos estão íntegros e NÃO substitui E2E ou restore.
- Não criar workflow, cron, banco, Edge Function, host, Storage, projeto, conta, nem apagar backups ou ativar retenção. Meta: nenhuma contratação nova; franquias existentes ainda podem ter consumo.
- Respeitar as duas frentes vigentes e não abrir novo cartão de pendência.

## 2. Evidências recuperadas sem alterar produção

| Domínio | Evidência | Limite comprovado |
| --- | --- | --- |
| Central | Registro canônico de 39 aliases e 21 grupos, guardas estáticos existentes | Não substitui testes de navegação em notebook e celular |
| Preview | 121 pastas, 12 protegidas e 109 não classificadas; Gabi v21 depende do v20 | Nenhuma exclusão ou mudança de URL autorizada |
| Supabase | Centro de Controle ACTIVE_HEALTHY em consulta de metadados 13/10; itens de projeto existentes em andamento | Banco íntegro não prova Auth ou segurança de Edge |
| WZ-01 | PR #111: deny by default sintético; PR #112: reutilização RBAC/workspace existentes, sem novas tabelas | NÃO conectado às funções Edge operacionais; P0 aberto |
| SQL + migrações + Storage | PR #90, Actions run 38286576098, 12/10: recuperação real na MESMA instância Supabase/PostgreSQL 17 efêmera e isolada, 193 tabelas, 192 com RLS, 20 políticas, 193 entradas de migrações, 4.531 identidades de objetos Storage e três binários por MD5 | Não restaura OAuth, secrets, APIs Edge, login, telas ou rollback completo; backup_restore_ok=false |
| Netlify | Inventário de 7 sites: 87 deploys históricos, 26 ready todos do dashboard e 61 error; os seis demais sem nenhum ready/old/published recuperável | 1 published recuperado; três fontes Git relacionadas NÃO equivalem a 6 backups de deploy |
| Trello | Snapshot de 13 quadros e anexos com Drive privado, hash e recuperação SQLite offline em ensaio real | Primeira ocorrência recorrente schedule prevista 18/10/2026; revisar quota sem exclusões |
| Git financeiro privado | Rotina autônoma schedule 12/10 run 38253959025, bundle integral e git fsck PASS | Token opcional ausente do backup Git público não impede cópia autônoma privada |
| Cofre CAS | Histórico diário existente, ensaios offline concluídos | Checar evidência de schedule 13/10 e não confundir push com rotina |

Fontes já existentes e prevalentes: docs/COFRE_ZERO_RECOVERY_RUNBOOK_20261012.md, docs/CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012.md, docs/WZ01_F00_F09_AUTHORIZATION_MIGRATION_20261012.md, docs/AMBIENTES_PREVIEW_INVENTARIO_20261011.json, docs/official-links-registry.json, GitHub issue #53. Nenhum master paralelo.

## 3. Testes offline, sem rede e sem credenciais

Executar na candidata:

    python3 .github/scripts/cr_safe_candidate_gate.py --self-test
    python3 -m unittest discover -s .github/scripts -p test_cr_safe_candidate_gate.py
    python3 .github/scripts/cr_safe_candidate_gate.py --base 742616ffe122e40d040ea3e180c7eec5fc2b5001

O último teste exige árvore Git limpa e base SHA disponível localmente. Aceita EXATAMENTE três adições de teste/documento, proibindo alterações operacionais, arquivos mestres, workflow, renomeações, exclusões e qualquer arquivo extra. Nunca autoriza publicação.

## 4. Pendências reais que não devem bloquear o uso atual

1. WZ-01 P0: vincular sessão humana a RBAC, workspace e caso, com teste negativo, compatibilidade de legado e ambiente isolado, antes de ativação em produção.
2. Arquivo histórico: classificar consumidores JS dinâmicos, consumidores externos e dependências das 109 pastas; só mover depois de restore e UX homologados.
3. Recuperação externa: OAuth, segredos, Edge e reinício completo de serviço ainda não ensaiados; seis Netlify não têm deploy de sucesso recuperável no provedor.
4. Primeiro schedule CAS em 13/10 e Trello em 18/10; monitorar sem criar outra rotina nem excluir backups.
5. Financeiro e obras fechadas permanecem intocados; saneamento de código não autoriza recalcular acertos ou mexer no Click.

## 5. Continuidade e rollback

Última ação: proteção executável de diff para a candidata, com testes sintéticos. Próximo gate: verificar readback, testes e CI de draft PR, depois associar evidências ao checkpoint #53 e, quando possível sem concorrência, ao item correspondente já existente no Gestor. Nunca finalizar WZ-01 ou Cofre Zero por inferência.

**Rollback:** fechar o draft PR e abandonar a branch. Como os sistemas operacionais não são editados, não se exige restauração da produção para desfazer esta candidata.

**Homologação:** documentação e teste de escopo isolados não equivalem a publicação, E2E nem declaração de 100%.

## 6. Adendo de auditoria independente — 13/10/2026 (somente leitura)

**INCIDENTE ABERTO: origem diária do Cofre Zero não renovada.** A execução real `event=schedule` do workflow `Cofre Zero | Immutable daily full archive` na `main` [run #38414883600](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38414883600), iniciada às 14:37 UTC de 13/10, terminou `failure` precisamente no passo `Preflight today's Cloud Run snapshot and bounded CAS capacity`. O log reportou `CURRENT stale: history not updated` e encerrou com código 4 ANTES da gravação do CAS. **É uma parada protetiva correta, não prova de corrupção ou de perda de backups históricos.**

Readback **independente** do Drive privado em 13/10 confirmou que `CONSTRUREI-BACKUP-AUTO/CURRENT/BACKUP_STATUS.txt` ainda aponta para `RUN_ID=20261012-060012` e `UTC=2026-10-12T06:00:38Z`, com `DATABASE_FILES=3` e `STORAGE_FILES=4531`. A existência desses arquivos não comprova snapshot de 13/10. **Não** forçar o job de arquivamento, relaxar a condição de data, apagar CURRENT ou chamar snapshot antigo de atualizado.

**Bom resultado distinto:** a rotina programada `Cofre Zero | Netlify inventory and published offsite` na `main`, [run #38419025961](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38419025961), concluiu `success` em 13/10; NÃO equivale a cobertura 7/7 dos conteúdos publicados (o inventário conserva o limite de 1/7 recuperável). O job de saúde da candidata financeira [run #38428062254](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38428062254) falhou porque sua validação explícita exige que a última rotina diária da `main` tenha `conclusion=success`; os testes canônicos da Central nessa candidata passaram [run #38428061888](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38428061888). **A candidata Cora não foi promovida nem considerada homologada.**

**Bloqueio de raiz a verificar fora deste PR:** encontrar o porquê do Cloud Run + Scheduler não produziram `CURRENT` em 13/10 (execução agendada, status do Cloud Run, identidade/OIDC, permissões, timeout, origem Supabase/S3, quota e publicação no Drive). O workflow GitHub `construrei-cloud-backup.yml` é `workflow_dispatch`, não é evidência da rotina Cloud Scheduler. Não criar novo cron, não aumentar frequência/custo e não reexecutar backup integral sem diagnóstico. Após restabelecer a rotina original, conferir **novo RUN_ID e integridade 3 SQL + objetos Storage**, depois reavaliar o gate do CAS na próxima execução legítima.

**P0 WZ-01 permanece aberto.** Consulta read-only do painel agregador de RBAC em 13/10 mostra 4 papéis ativos, 12 permissões, zero usuário vinculado ao Auth, 7 testes humanos pendentes e nenhum homologado. Contratos sintéticos em PR #111 e candidata PR #114 NÃO estão ligados às Edge operacionais e não são prova de proteção real. Não criar identidade, fazer backfill, liberar tenant ou deploy sem verificação de escopo real e homologação.

**Decisão de continuidade:** manter exatamente os dois eixos segurança WZ-01 + recuperação Cofre Zero; atualizar apenas as pendências preexistentes do Gestor e o checkpoint #53. Sem exclusão, migração, cobrança, alteração de produção, Edge, dados financeiros ou publicação. O checkpoint não é pedido de aprovação de merge.


## 7. Adendo de execução rastreável — 13/10/2026

- Candidata #113 recebeu exclusivamente reforço nos testes offline do **mesmo** arquivo permitido, commit `512d107a03ae958186eaf57428069b0368f6833c`. Negativas adicionadas para árvore suja, branch `main`, SHA base inválido, caminhos duplicados, tipos/status de alteração não autorizados e caminhos não seguros.
- Verificação de escopo no GitHub: PR #113 continua com **exatamente três arquivos** (script de gate, seus testes e este checkpoint); nenhum arquivo da produção foi modificado por este PR.
- `Central Canonical Guard` [run #38468161131](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38468161131) **PASS** na candidata #113. Esse PASS verifica os jobs existentes da Central; **não confirma que o Python `test_cr_safe_candidate_gate.py` foi executado pelo CI**, pois a invocação separada indicada na seção 3 ainda precisa de prova de execução. Não inferir homologação desse script.
- Candidata de autorização #114 ganhou **somente** testes negativos sintéticos, commit `df08deb33d9230d8410aa091aa81d5cebdd0a45d`, para UUID ausente/inválido, `serverVerified` não booleano, vínculo humano inválido, permissão para usuário diferente e ação de atribuição divergente. PR #114 continua com somente seus três arquivos originais; nenhum adaptador Edge real foi implementado.
- Releitura direta do Google Drive **CURRENT** (pasta `1C5q2whrJpUFsKZFrgSlSLK0stisKkeg4`) encontrou `BACKUP_STATUS.txt` id `1__hVM6XlB2anY0WJo34ZMubnVfNfFPDh` inalterado desde 12/10: `RUN_ID=20261012-060012`, `DATABASE_FILES=3`, `STORAGE_FILES=4531`. O GitHub Actions diário [#38414883600](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38414883600) falhou no preflight com `CURRENT stale: history not updated`, exit code 4. **Não há evidência de novo CURRENT em 13/10**; isso não demonstra perda do último backup saudável nem revela a causa no Cloud Scheduler/Run.
- Próximo diagnóstico necessário **read-only na origem do agendamento externo**: confirmar se Cloud Scheduler chamou Cloud Run em 13/10 às ~03:00 BRT, consultar retorno de execução, logs Cloud Run, eventual OIDC/IAM, erros de Supabase/Storage, limites de quota e etapa final Drive. Só corrigir o componente causal com checkpoint e rollback, sem criar um segundo agendador ou desabilitar fail-closed.
- Manter as pendências mestre existentes `EXEC-COFRE-COVERAGE-20261010`, `WZ-01`, `ARCH-SAN-20261012` e o issue #53; **sem cartão duplicado**. A execução atual é evidência adicional, não aprovação de produção nem atestado de segurança integral.

## 8. Incidente do snapshot: evidência negativa no histórico e diagnóstico delegado

Verificação independente adicional de 13/10 (somente leitura) no Drive privado: pasta HISTORY_FULL id 1OH66xyC1d30fUL4mcABwLpjWamSHkOM7 retornou apenas o ponto de recuperação integral de 12/10 (`20261012-060012`), sem pasta de 13/10. A pasta CURRENT também mantinha BACKUP_STATUS com RUN_ID 20261012-060012. Assim, **não há snapshot diário completo de 13/10 identificado no destino canônico**, embora a cópia de 12/10 permaneça existente.

Comparação pontual Supabase, 05:00 a 08:00 UTC: 12/10 `storage_logs=6807`, `edge_logs=6978`; 13/10 `storage_logs=0`, `edge_logs=20`. Trata-se de indício de falta de execução/alcance da origem do snapshot, não prova conclusiva sobre causa GCP. Google Cloud Scheduler/Run não está disponível pelas conexões atuais; não declarar que a falha foi reparada.

**Diagnóstico de menor privilégio, SEM execução nesta PR:** responsável pelo projeto GCP `app-construrei` deve liberar apenas leitura de Cloud Scheduler e Cloud Run/Cloud Logging ou fornecer o registro privado de execução do job `construrei-backup` às 06:00 UTC em 13/10, comparando 12/10: status do disparo, região, OIDC/IAM, timeout, permissões, cotas e tentativa de iniciar container. Não compartilhar tokens, SQL, senhas ou keys no GitHub. Corrigir somente o componente causal e validar novo RUN_ID, três SQL, manifestos, armazenamento e CAS antes de considerar o incidente fechado.

Bloqueio separado: os 6 sites Netlify sem deploy recuperável não devem ser replicados artificialmente. Apenas o dashboard possui deploy `ready` identificado no conector; documentação preserva fontes Git históricas relacionadas quando disponíveis. A decisão humana de recriar um serviço só deve surgir depois de inventário de consumidores, sem necessidade de excluir ou despublicar qualquer URL nesta rodada.

**Regra de responsabilidade:** engenharia/inventário/contratos/testes/checkpoint → executores técnicos; concessão de acesso GCP, vínculo de contas humanas Auth e homologação final de mudanças operacionais → Diretoria. Nenhuma aprovação adicional é necessária apenas para manter candidatas isoladas e executar testes de laboratório.
