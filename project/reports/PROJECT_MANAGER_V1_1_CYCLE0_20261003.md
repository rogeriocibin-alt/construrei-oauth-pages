# CONSTRU-REI — Project Manager V1.1 — Ciclo 0

**Data:** 03/10/2026  
**Execução:** CR Assertivo  
**Estado:** IMPLEMENTADO EM CANDIDATA / NÃO HOMOLOGADO  
**Branch de trabalho:** `cr-project-manager-v1-1-cycle0-20261003`  
**Baseline protegida:** `ab91e314609f7b53fb5cff0b153373803777fc6f`  
**Checkpoint baseline:** `CHECKPOINT_PROJECT_MANAGER_V1_1_CYCLE0_BASELINE_20261003`  
**Build lógico:** `CR-PM-V1.1.0-C0-20261003`

## 1. Regra de execução

Este ciclo não cria nova arquitetura para corrigir a arquitetura atual. Reutiliza:
- `cr_internal.component_inventory_v1`;
- `cr_internal.canonical_backlog_v1`;
- `cr_internal.release_gate_standard_v1`;
- `cr_internal.backup_runbook_v1`;
- `cr_internal.observability_standard_v1`;
- `cr_internal.security_access_matrix_v1`;
- `cr_internal.test_matrix_v1`;
- motor existente de pendências;
- `public.cr_incremental_checkpoints_v1`;
- `public.cr_operational_evidence`;
- `public.cr_grc_incidents`;
- `public.cr_release_lock`.

Nenhuma Central/APP/F00–F09 canônica foi alterada.

## 2. Baseline e rollback

Antes da implementação foi criado:
- `CHECKPOINT_PROJECT_MANAGER_V1_1_CYCLE0_BASELINE_20261003` → commit `ab91e314609f7b53fb5cff0b153373803777fc6f`.

Rollback do Ciclo 0: restaurar o Project Manager para esse checkpoint e não tocar nas canônicas operacionais.

## 3. AUD-001

A auditoria original foi localizada na Library:
- arquivo: `Auditoria_do_Project_Manager_CONSTRU-REI.pdf`;
- Library ID: `libfile_8027b520cbf8819192ffc862272b40f9`;
- file ID: `file_00000000d560820ea8523bbe452a2657`;
- tamanho: 218369 bytes;
- SHA-256: `c91dca4cbdb48c22ea3543e6e5aa947a54019a3f92eefac4cdb206817c960c26`.

Registro persistente:
- `cr_internal.pm_audits_v1`: AUD-001;
- `cr_internal.pm_audit_findings_v1`: 25 achados estruturados;
- status da auditoria: `implementation_planned`.

O PDF não foi sobrescrito nem convertido em “verdade” sem evidência. O hash registra integridade do original.

## 4. Persistência adicionada — sem duplicar o núcleo existente

Migration aplicada no Supabase:
- `project_manager_cycle0_persistence_v1`;
- correção de índice: `project_manager_cycle0_fk_index_v1`.

Novas entidades internas:
1. `pm_versions_v1`
2. `pm_releases_v1`
3. `pm_audits_v1`
4. `pm_audit_findings_v1`
5. `pm_sources_v1`
6. `pm_reconciliations_v1`
7. `pm_metric_definitions_v1`
8. `pm_business_metrics_v1`
9. `pm_automation_runs_v1`
10. `pm_events_v1`

Não foram duplicadas as entidades já atendidas por checkpoints, backlog/pendências, decisões/ADR, riscos/GRC, backups, segurança, observabilidade e testes.

Segurança:
- RLS habilitado em todas as 10 tabelas;
- zero grant direto para `anon`;
- zero grant direto para `authenticated`;
- escrita/leitura direta concedida apenas a `service_role`;
- nenhum segredo foi incluído no bundle público.

Os avisos `rls_enabled_no_policy` são intencionais neste estágio porque as tabelas ficam fora da superfície pública e sem grants de cliente. A futura API do owner deve autenticar no servidor, sem expor `service_role` ao PWA.

## 5. Matriz de fontes

Foram registrados 13 sistemas/fontes:
GitHub, Supabase, Central, APP, Trello, GestãoClick, Google Calendar, Netlify, Vercel, PWA, Banco Mestre, Backups e Cofre Zero.

Regra implantada: fonte “conhecida” não é marcada automaticamente como “viva”. Trello/GestãoClick/Cofre Zero antigos foram classificados como `stale` quando a evidência persistente era anterior ao ciclo atual.

## 6. Reconciliações abertas

### REC-V9-POINTER-20261003
O ref `CHECKPOINT_V9_GOOGLE_AGENDA_VALIDATED_20261003` aponta para artefato incompatível com a cadeia técnica V9. A divergência foi registrada; o histórico não foi reescrito silenciosamente.

### REC-FIN-ROGERIO-20260929
- Central: R$ 3.171,83
- Trello: R$ 3.741,85
- diferença: R$ 570,02

Regra: não somar, promediar nem “corrigir” fontes por conveniência; conciliar lançamento a lançamento e preservar origem.

## 7. Backup e continuidade

Foi aberto incidente no GRC existente:
- tipo: `RISCO_IDENTIFICADO`;
- motivo: falhas de backup diário registradas em 01/10, 02/10 e 03/10;
- responsável: CR Assertivo;
- estado: `REVISAO_HUMANA_OBRIGATORIA`.

Última execução persistente completa localizada no Cofre Zero: 28/09/2026.  
A promoção de versões dependentes da infraestrutura deve respeitar gate proporcional até nova evidência de backup/restauração.

## 8. PWA V1.1

Implementado na candidata:
- `manifest.webmanifest` com `id="./"`, escopo e `start_url` estáveis;
- `version.json` consultado com `cache: no-store`;
- versão/build/ambiente visíveis;
- banner de atualização;
- ações `Ver mudanças`, `Depois`, `Atualizar agora`;
- Service Worker instala o novo bundle completo antes da ativação;
- não usa `skipWaiting` automaticamente durante `install`;
- ativação ocorre mediante ação de atualização;
- cache é versionado por build;
- mesmo URL/PWA; não requer nova instalação;
- fallback versionado permanece para operação offline.

O PWA ainda usa `project-data.json` como snapshot coerente de fallback. O modelo persistente V1.1 já existe no Supabase, mas a leitura/escrita de dados sensíveis pelo PWA só será conectada através de fronteira autenticada do owner. Não haverá `service_role` no cliente.

## 9. Testes estáticos do pacote

Resultado: **18/18 PASS**.

- T01 App JS syntax — PASS
- T02 Service Worker syntax — PASS
- T03 project-data JSON — PASS
- T04 manifest JSON — PASS
- T05 version JSON — PASS
- T06 navegação/área Auditorias — PASS
- T07 versão/build + update banner — PASS
- T08 AUD-001 + 25 achados — PASS
- T09 matriz de 13 fontes — PASS
- T10 duas reconciliações iniciais — PASS
- T11 `version.json` no-store — PASS
- T12 SW não ativa automaticamente no install — PASS
- T13 ativação controlada por mensagem `SKIP_WAITING` — PASS
- T14 precache do bundle completo — PASS
- T15 identidade estável do manifest — PASS
- T16 build alinhado entre `version.json` e dataset — PASS
- T17 sem declaração de mudança canônica — PASS
- T18 scan simples de secrets no bundle público — PASS

Revisão pós-migração:
- FK `baseline_version_id` inicialmente sem índice → corrigida;
- após correção: 0 FKs novas sem índice;
- índices “unused” recém-criados são esperados antes de tráfego real.

## 10. Prova de isolamento

Na verificação antes deste relatório:
- branch de trabalho estava à frente da main apenas com arquivos do Gestor V1.1 e migration;
- `main` permanecia em `ab91e314609f7b53fb5cff0b153373803777fc6f`;
- checkpoint baseline permanecia no mesmo SHA;
- diff não incluía Central canônica, APP canônico ou F00–F09.

## 11. Definition of Done — estado do Ciclo 0

Concluído:
- objetivo e escopo;
- baseline/rollback;
- persistência aditiva;
- AUD-001 e achados;
- matriz de fontes;
- reconciliações;
- dicionário inicial de métricas;
- incidente de backup;
- PWA preparado para atualização viva;
- versionamento visível;
- testes estáticos;
- verificação de grants/RLS;
- migração registrada no GitHub.

Ainda precisa de validação runtime antes de homologação:
1. publicar a **candidata** no mesmo link sem alterar Central/APP canônicas;
2. testar carregamento real desktop e celular;
3. testar PWA instalado;
4. testar atualização de build no mesmo PWA;
5. testar offline → online;
6. revalidar backup/restauração;
7. somente depois decidir homologação/promoção.

## 12. Gate

**NÃO avançar para o próximo pacote P0 por volume.**  
O próximo avanço só ocorre após evidência runtime da candidata e novo checkpoint.  
