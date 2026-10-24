# CR Assertivo — P0 segurança do runtime APP — 24/10/2026, candidato R3

**Status:** política e testes CI isolados comprovados; `cr-flow-runtime-v2` oficial **não alterado**. Este documento NÃO é homologação operacional.

## Causa-raiz revisada
- A função Edge `cr-flow-runtime-v2` usa credenciais privilegiadas no servidor e aceita chamadas POST sem autenticação forte verificada antes das ações `list`, `get`, `route`, `flow-save`, `flow-advance`, orçamento e proposta.
- Os HTML oficiais F01–F09 não enviam sessão autenticada em diversos endpoints. Há ainda divergência `?mode` vs `?api` nos 24 pontos corrigidos na PR #171, que permanece DRAFT.
- `central-gestao-api?api=me` atualmente verifica apenas `ADMIN_MASTER_ROGERIO` e `ADMIN_TECNICO_EDER`. O cadastro `cr_f00_operators` tem uma função operacional `OPERADOR_F00`, sem equivalência de sessão para todas as quatro pessoas. Não inventar identidade para Fabrício ou Gabrielly.
- FK `cr_flow_handoffs.case_id` aponta para `cr_cases_v1(case_id)`, não para `cr_f00_cases(id)`; 14 handoffs F01–F02/F03–F04 continuam sem vínculo comprovado, além de um retorno F01–F00.
- Funções SQL privilegiadas `cr_flow_case_state`, `cr_flow_stage_save`, `cr_flow_transition` possuem ACL de `postgres`/`service_role` apenas, mas são acessadas por Edge com chave de servidor. Isso NÃO autoriza chamadas sem sessão no handler.

## Entrega efetiva desta candidata
- `security/candidates/cr-flow-runtime-v2-secure-20261024/flow-auth-policy.mjs`: política deny-by-default de ações e papéis. Diretor pode administrar, Éder restrito ao escopo F04–F07 para gravação, operadora F00 pode apenas consultar a fila F01. Operações por token na F01 são negadas até que exista verificação server-side do escopo por atendimento.
- `flow-auth-policy.test.mjs`: **31/31 PASS** no notebook conectado, Node v24.19.0, incluindo usuários anônimos, papéis forjados e ações financeiras não autorizadas.
- `.github/scripts/cr_flow_public_client_perimeter_guard.py`: integra o teste à Central Canonical Guard **existente**, sem criar workflow, agendamento, Edge paralela ou custo de infraestrutura.
- O teste é de contrato; a migração do runtime continua dependente da proteção efetiva das chamadas e da validação positiva por usuário.

## Limite técnico e plano seguro
Houve bloqueio explícito da integração ao tentar versionar uma cópia alterada do runtime privilegiado. Não contornar nem copiar credenciais. Nenhuma alteração no Edge oficial foi realizada. A PR #171 não pode ser promovida enquanto o runtime estiver com leitura/gravação sem identidade verificada.

Para encerrar P0, é necessário implementar a autenticação server-side na função efetivamente consumida; validar sessão por mecanismo existente, papéis e escopo por atendimento; negar requisições anônimas; evitar `body.actor` como identidade; atualizar clientes oficiais; executar testes positivos/negativos por perfil, handoffs e dispositivos; disponibilizar rollback.

## Preservações
Dashboard Financeiro V12, Cora, Trello, Capital de Giro, obras encerradas, rotina semanal Cofre Zero e dados operacionais intactos. Não fechar P0 nem anunciar segurança homologada a partir destes testes sintéticos.
