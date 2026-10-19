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

## 13/10 — Encadeamento de adaptadores de segurança (candidata isolada)

Função pura de laboratório: verifyCaseScopeFromTrustedAdapters() no contrato de segurança, com seis callbacks que DEVEM ser fornecidos pelo servidor: verifySession, findMembership, findHandoffByToken, findCaseById, getActionPermission e getCaseAssignment. Uma falha em qualquer etapa impede a autorização.

Esquema REAL confirmado por leitura de metadados, sem SQL de escrita: cr_flow_handoffs.token é texto e apenas LOCALIZA o registro; case_id é UUID nullable. cr_cases_v1.case_id é UUID obrigatório, workspace_id UUID nullable. cr_rbac_expected_human_users.auth_user_id é UUID nullable. Posse do token ou case_number não concede acesso, e não existe campo handoff_id UUID nesse esquema.

Ordem de decisão: bearer validado por sessão revogável; identidade humana validada e ativa; membership por workspace; token usado somente para encontrar handoff com FK válida; case real no mesmo workspace; permissão de ação e atribuição pessoal de caso confirmadas por consultas independentes. list global é negada; erros de adaptador retornam 503 sem dados internos.

Quatro suítes sintéticas novas verificam sequência dos seis callbacks, sucesso restrito, negativas de sessão/token/identidade/tenant/caso/atribuição e ausência de vazamento de exceções. Nenhum dado pessoal, credential, serviço, função Edge ou runtime foi tocado.

LIMITES: o código não comprova origem dos callbacks nem executa SQL/RLS/Auth reais. Nenhum adaptador real foi implementado; não é middleware pronto; approvedForLiveDeployment=false permanece. Ainda requer mapeamento Auth humano, revisão de vínculos legados, RLS/consulta escopada, E2E negativo, rollback e homologação das 10 telas antes de qualquer promoção. WZ-01 permanece P0 aberto.

## 13/10 — Listagem privada com predicado por caso

A interface F01/F02/F03 exige uma lista de chamados, mas a leitura indiscriminada não é aceitável. A função LAB `verifyScopedListFromTrustedAdapters()` produz SOMENTE um plano de predicados com Auth ativo, vínculo humano/workspace, permissão `list` no mesmo workspace e lista explícita de IDs de casos autorizados para esse humano.

- Aceita exclusivamente modo `assigned-cases-only`, nunca wildcard global.
- Exige UUIDs válidos, sem repetição, no máximo 500 IDs por solicitação; lista vazia é autorizada como 0 resultados, não como acesso geral.
- Retorna IDs e workspace verificados por callback de confiança do servidor, nunca registros de clientes, e exige que TODO SELECT real aplique filtros de workspace E caso.
- Falha fechada com sessão revogada, grant de outro workspace, dados incompletos e erro de consulta. `approvedForLiveDeployment=false`.

CI: `Central Canonical Guard` commit `1a360690721c1474c1f556cf08ea1a67d9554544`, run #38473069431, PASS em 13/10/2026. São testes sintéticos; a coleta da lista e seu SQL real **NÃO** estão implementados nem foram acessados. Não publicar o laboratório como endpoint.

Read-only no banco oficial confirmou quatro perfis esperados, dois validados como humanos e nenhum vínculo Auth ou conta em Auth; ainda há 13 handoffs sem `case_id` e três casos sem workspace. A contagem serve exclusivamente ao planejamento de migração. NÃO fazer backfill automático pelo número do chamado, e NÃO criar contas por suposição.

Próxima etapa de execução técnica sem ação humana: especificar adaptadores de Auth/ACL reais sobre dados existentes, preparar queries seguras e contrato de compatibilidade isolado. Única dependência humana para ativação: confirmar identidade e o vínculo das pessoas no onboarding, aprovar as permissões efetivas e testar posteriormente as quatro jornadas em dispositivos homologados. Sem novos servidores, Edge, Secret, DB ou autorização de produção nesta PR.

## Blueprint de integração técnica sem intervenção do usuário

**Estado de verdade em 13/10/2026 (consultas somente leitura):** `auth.users=0`; quatro perfis esperados no cadastro `public.cr_rbac_expected_human_users`; 2 com validação humana, 0 com `auth_user_id`; 13 linhas de `cr_flow_handoffs` sem `case_id`; 3 casos `cr_cases_v1` sem `workspace_id`. Inspeção de todas as tabelas conhecidas nos schemas acessíveis não encontrou relação com colunas que ligue SIMULTANEAMENTE `auth_user_id`, `workspace_id` e `case_id`. Não inferir autorização de `responsible`, `case_number`, `actor`, labels, token ou nomes de humanos.

**Contrato dos adaptadores de servidor (especificação para implementação isolada, não código live):**
1. `verifySession`: usar biblioteca de Auth no servidor contra o bearer real; verificar usuário, sessão ativa/expiração e revogação conforme sensibilidade. Jamais aceitar `actor` do body ou confiar em `user_metadata` para privilégios.
2. `findMembership`: retornar Auth uid, workspace e papel somente se houver um vínculo **independente, ativo e validado** pela Diretoria. A tabela atual de pessoas esperadas NÃO contém `workspace_id`; um texto com nome da empresa não substitui essa prova.
3. `findHandoffByToken`: buscar somente por token, conferir token no readback e exigir `case_id` UUID. Se FK ausente, negar e classificar o legado sem alterar a origem.
4. `findCaseById`: ler `cr_cases_v1.case_id` e `workspace_id`, exigir igualdade com membership e `workspace_id` não nulo; não resolver por `case_code` ambíguo.
5. `getActionPermission`: mapear explicitamente ações F00–F09 para `cr_rbac_permission_matrix` usando código do papel e status ativo. A matriz atual usa `permission_code` + `role_code`, não prova qual usuário recebeu o papel nem identifica workspace. O mapeamento deve ser versionado e revisado em homologação.
6. `getCaseAssignment`: exigir atribuição individual verificável ao caso+workspace+ação (tabela confiável ou ACL equivalente), sem inferir da etiqueta `responsible`. Atualmente não há tal vínculo comprovado; manter DENY até existir.
7. `getAuthorizedCaseIds` para `list`: somente IDs UUID explicitamente atribuídos ao usuário naquele workspace, nunca `select('*')` global. `caseIds=[]` = resultado vazio com `mayQueryDatabase=false`, jamais omitir `.in(case_id)` na consulta. Para resultado positivo, aplicar **ambos** filtros workspace e caso. Limitar/paginar respostas, sem dados cruzados.

**Modelo mínimo de persistência a avaliar, não aplicar diretamente:** reaproveitar os perfis e permissões existentes; caso o time confirme que nenhum repositório confiável supre o relacionamento, propor no LAB uma ACL privada com chave de usuário Auth, workspace UUID, caso UUID, ação, revogação, prova de concessão, timestamp e audit log. Restringir acesso por RLS, revisar GRANTs e service_role; tratar legados pendentes em trilha de correspondência explícita sem atualizar obras fechadas. Zero novas Edge, branches Supabase ou cron. Criar migração real somente com rollback, custos, impacto nos clientes e provas negativas completos.

**Matriz objetiva de aceite técnico:** anônimo e sessão revogada=401; perfil sem aprovação=403; tentativa entre workspaces=403/404; token isolado=403; caso sem FK ou workspace=403; role sem ação=403; lista sem casos=0 registros/nenhuma query; listagem de outro perfil=0 registros; mutações de caso não atribuído=403/404; falha de um adaptador=503 sem erro privado; rollback capaz de restaurar comportamento aprovado antes do corte. Somente massa sintética inicialmente; nunca ativar login real direto em Edge existente sem E2E isolado.

**Alçada reservada à Diretoria:** confirmar os quatro usuários reais e permitir emissão/vinculação de credenciais próprias, não compartilhadas; duas validações humanas antigas não substituem Auth novo. Aprovar a matriz final de acesso após demonstração de segurança e UX. **Todo desenho, prova, consulta, mapeamento, implementação candidata e troubleshooting são responsabilidade técnica.**

**Limite expresso de autorização:** o consentimento geral para prosseguir não cria vínculo fictício nem autoriza divulgar credenciais ou derrubar o APP. Os módulos atuais permanecem homologados enquanto o ambiente candidato não atingir os critérios acima.

## Evidência 13/10 — interpretação segura da matriz RBAC real

Consulta apenas leitura da tabela `public.cr_rbac_permission_matrix`: 12 linhas para quatro papéis humanos. Os campos disponíveis são `role_code`, `permission_code`, `area_code`, `access_level`, `status`, evidências e metadados. Uma regra `status=ACTIVE` com `access_level=NONE` **é negação explícita**, não autorização; isto ocorre em áreas sensíveis para Fabrício e no GRC para operação. A tabela não contém por si só `auth_user_id`, `workspace_id` nem vínculo a caso, logo NÃO é ACL de usuário.

Adicionado contrato puro `verifyLegacyRbacRule` sem rede/banco, restrito a regras F01/F02 comprovadamente existentes para o papel `OPERACAO_ATENDIMENTO_GABI`. Ele exige a correspondência exata `role_code`, `permission_code`, `area_code`, `status=ACTIVE`, `access_level` mínimo de `READ`/`WRITE` por operação. Ações, fluxos, roles e status sem mapeamento são negados. Retorno inclui `evidenceOnly=true` e `approvedForLiveDeployment=false`; mesmo a validação de uma regra **não autoriza** nenhuma pessoa sem Auth e ACL verificáveis.

Testes sintéticos incluem permissões Gabi READ/WRITE para F01/F02 e negativos contra `NONE`, `READ` para escrita, role/área/código trocados, desativação, fluxo F03 e ações desconhecidas. A matriz real pode evoluir: não copiar os dados de laboratório diretamente para Edge. Sem novas funções ou objetos no banco; nenhum endpoint alterado.

Critérios restantes: autoridade do login validada pelo servidor; associação Auth humano e workspace; resolução de 13 handoffs sem FK e três casos sem workspace mediante prova explícita (não backfill automático); ACL de caso real; mapeamento final por ação/fluxo, E2E de negativas e aprovação antes da implantação.


## 13/10 — Fechamento técnico da compatibilidade de rotas v17 (candidata #114)

**Fonte observada diretamente:** `cr-flow-runtime-v2` implantada, versão 17, `verify_jwt=false`, 14 rotas POST privadas. Esta versão continua **inalterada** em produção. Os arquivos desta seção são somente scripts de laboratório com testes sintéticos.

- `security/contracts/wz01-supabase-auth-principal.mjs`: utiliza exclusivamente o **Supabase Auth existente**, injetado pelo servidor; `auth.getUser(accessToken)` valida token/usuário. Não permite identidade em `user_metadata`, corpo, `actor` ou `workspace_id` do cliente. A integração real no runtime não foi instalada.
- `security/contracts/wz01-runtime-v17-perimeter.mjs`: manifesto explícito das **14 rotas**, método HTTP, controle de fase, acesso por caso e escopo de listagem. A consulta `list` somente pode seguir um plano com `workspace_id` **e** `case_id` autorizado, nunca `service_role.select('*')` indiscriminado.
- **Onze** rotas de caso têm um plano que requer principal verificado, membership, caso, permissão de operação e atribuição verificada antes de qualquer acesso.
- As exceções reais da v17 são `budget-audit` (permite execução sem token) e `ai-assist` (não usa token de caso). Ficam **deliberadamente bloqueadas no novo plano**, até haver contrato autenticado específico e teste de UX; não se deve implantar esta candidata cegamente, pois quebraria essas funcionalidades.
- Os testes do arquivo `wz01-flow-authorization.test.mjs` cobrem todas as rotas inventariadas, token ausente/errado, enumeração de ações, `GET/POST/OPTIONS`, workspace divergente, atribuição ausente e exceções.
- O projeto `CONSTRU-REI Centro de Controle` registra 4 perfis esperados, **0 Auth users**, **0 auth_user_id vinculados** e 2 validações humanas registradas na consulta de 13/10; tabelas `cr_flow_handoffs`, `cr_cases_v1` e `cr_rbac_expected_human_users` têm RLS ativado. RLS **não neutraliza** a chave privilegiada da função v17.
- Nenhum vínculo Auth/workspace/caso pode ser deduzido de nomes, números de atendimento ou tokens. **Não** criar ou cadastrar usuários falsos, realizar migração de dados por inferência ou alterar permissões sem validação da pessoa.

**Gate de promoção NÃO atendido**: suporte real para os adaptadores de membership e atribuição, tratamento dos casos legados sem relacionamento, rotas tokenless redesenhadas/compatíveis, verificação de RLS/SQL das leituras e escritas e testes E2E em ambiente isolado. Não confundir o sucesso dos testes de laboratório com conclusão P0.

**Controle de produção:** nenhuma publicação, alteração de Auth, Supabase Edge, Google Cloud, Central, F02, dados financeiros ou backups foi feita por esta candidata. `main` permanece fora da PR #114.
