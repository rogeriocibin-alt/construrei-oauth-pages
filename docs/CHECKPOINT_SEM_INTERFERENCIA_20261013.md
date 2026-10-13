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
