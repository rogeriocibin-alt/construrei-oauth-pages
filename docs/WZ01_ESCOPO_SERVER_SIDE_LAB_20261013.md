# WZ-01 | Escopo comprovado de caso / workspace — laboratório sem deploy
13/10/2026 • **CANDIDATA** • **P0 ABERTO** • Sem mudança em API, dados, Auth ou frontend.

## Por que esta candidata existe
Leitura **somente de metadados** do banco oficial confirmou o esquema existente:
- cr_flow_handoffs.case_id (FK, nullable) → cr_cases_v1.case_id.
- cr_cases_v1.workspace_id (nullable).
- cr_rbac_expected_human_users.auth_user_id (nullable), juntamente com funções e matriz de permissões já existentes.
- cr_f00_cases não fornece FK explícita para cr_cases_v1 no esquema examinado.
- RLS está habilitado nas tabelas examinadas, porém isso NÃO autoriza rotas Edge que usem service-role. Consultas REST sob cliente privilegiado podem contornar RLS.

Uma contagem agregada privada de consistência de vínculo identificou **vínculos humanos ainda não validados** e **casos/handoffs sem relacionamento completo**. Os números, identificadores de usuário e detalhes dos casos pertencem ao Gestor privado, não ao repositório público.

A presença de tabelas de RBAC NÃO significa que existe identidade/autorização humana implementada. NUNCA fazer correspondência de casos pelo texto do chamado, nome, telefone, case_number/case_code isolados ou atribuição informada no body.

## Entrega sem interferência
- Adicionar somente a função pura de laboratório security/contracts/wz01-server-scope-planner.mjs, sem acesso a DB, rede, segredos, APIs ou navegador.
- Estender exclusivamente os testes offline já executados pelo Central Canonical Guard, com sucesso positivo sintético e negativas: sessão ausente/revogada, vínculo humano inválido, handoff sem FK, case/workspace errado, acesso sem atribuição e lista global.
- O contrato nunca retorna autorização apenas com role, JWT, handoff token ou cadastro humano esperado. Exige principal, membership, permissão de operação, handoff, case real e atribuição todos **servidor-verificados**.
- Retorna explicitamente approvedForLiveDeployment=false. Nenhum middleware real ou backfill foi implementado.
- **Não se cria nova coluna, tabela, perfil, workspace, tenant ou Edge Function. Não se grava nenhuma linha.**
- Release continua em main: nenhuma alteração em Central/APP/Gestão Financeira, Trello, Cora, Click, Google Agenda, PWA, links, cron ou backups.

## Crítica para implantação futura (não executar agora)
1. Implementar adaptador Auth com verificação server-side da sessão e revogação. Nunca confiar em user_metadata do cliente nem em actor de body.
2. Vincular Auth real à identidade do cadastro humano somente depois de validação pela Diretoria (o vínculo ainda não existe para todos os usuários).
3. Resolver membership/workspace e atribuição por caso a partir de dados autoritativos reais. Não há licença para inventar tabela ou fazer backfill só por coincidência textual.
4. Autorizar leitura e escrita sempre filtradas por case_id e workspace_id, levando em conta a matriz de permissões e os vínculos do profissional. Consulta global list requer um contrato separado fail-closed.
5. Simular cenários negativos em ambiente isolado sem dados de cliente e sem credenciais de produção, depois validar UX de F00–F09 e rollback no celular/notebook. Só então considerar promoção autorizada.

## Evidência e limite
Consultar documentos preexistentes docs/WZ01_F00_F09_AUTHORIZATION_MIGRATION_20261012.md e docs/CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012.md; fonte única da pendência: public.cc_items.id=WZ-01 no Gestor.
Referência Supabase: https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z

Esta função é um **validador lógico de entrada supostamente confiável**, NÃO verifica sozinha que os objetos vieram do servidor; deve ser conectada a adaptadores auditados, com proteção de todas as consultas. Nenhuma evidência sintética permite declarar WZ-01 resolvido.

Retorno seguro: fechar o draft PR e não alterar main. Não foi publicada uma API ou versão visual.
