# Gate de segurança de integração Trello/APP — matriz de liberação (24/10/2026)

**Status: candidata isolada, NÃO HOMOLOGADA em produção.** Complementa a PR #74 existente (não cria outra rota, banco, cron, serviço ou versão). Fonte operacional: Banco Mestre `SEC-FIN-TRELLO-AUTH-20261012` (P0) e `EXEC-APP-E2E-20261006` (P0).

## Evidência confirmada
- Inspeção SOMENTE LEITURA do código real publicado das funções Edge em 24/10: existem integrações históricas Trello de leitura/atualização com `verify_jwt=false` e sem prova de controle uniforme de caller/autorização para todas as ações privilegiadas. Outras rotas usam segredo de callback, distinto de HMAC verificado sobre bytes brutos.
- O runtime de etapas APP depende de cliente privilegiado e ainda precisa de prova de autorização por identidade/role para leitura e transições, além do contrato de handoff. **Esta auditoria não enviou POST nem alterou funções.**
- PR #74: contratos sintéticos `trello-webhook-signature.mjs` e `trello-webhook-envelope.mjs`; testes executados no notebook conectado (Node v24.19.0) em 24/10: **13 PASS / 0 FAIL**, sem banco, segredos reais, rede operacional ou efeitos colaterais.
- O sucesso dos 13 testes **NÃO** prova que endpoints reais estejam protegidos. `verify_jwt=false` é apropriado para webhook externo apenas quando a função faz sua própria verificação, segundo documentação Supabase.

## Contrato exigido por origem da chamada
| Origem | Proteção obrigatória | Comportamento em erro |
| --- | --- | --- |
| Webhook Trello externo | Verificar `X-Trello-Webhook` via HMAC-SHA1 sobre bytes exatos + callbackURL REAL cadastrada; segredo de aplicação somente no servidor; allowlist de ações e modelo; limite de payload | Resposta de rejeição sem efeitos ou atualização financeira |
| Ação manual na interface | Sessão de usuário real validada no servidor; autorização por papel/escopo/obra; CSRF/origin não substituem identidade | 401/403; jamais aceitar token/sig compartilhado público como identidade |
| Job servidor-servidor | Chave secreta/identidade de workload no servidor, escopo mínimo, não exposta em cliente; nenhum endpoint externo derivado de argumentos do usuário | 401/403, logs sanitizados |
| Reprocessamento/replay | Inbox/outbox já existente se adequada; unicidade atômica de ID de evento/operação; idempotência persistente e confirmação downstream | Evento repetido retorna duplicata segura, sem segundo lançamento |
| APP F00–F09 | Autenticação e autorização para todas as ações de mutação, vínculo case/request/actor no servidor, governança de RBAC para Gabi/Fabrício/Éder/Rogério | Sem transição ou leitura de dados de outro escopo |

## Ordem única de migração, sem regressão
1. Inventariar consumidores REAIS (navegador, Central, Dashboard, automação, callback Trello e Cloud), URLs de callback cadastradas e credenciais existentes **sem imprimi-las no relatório**; classificar cada rota como pública, webhook, humana ou interna.
2. Ensaiar em candidata os positivos/negativos HMAC com o segredo existente no servidor e o callbackURL real; validar rotas manuais com sessão expirada, usuário comum e diretor, sem gravações de teste na produção.
3. Validar o mecanismo transacional existente para claim de evento/operation_id e replay; testar concorrência com objetos sintéticos, não por repetição de lançamentos reais.
4. Confirmar que os atuais consumidores passam no teste de regressão isolado, inclusive Dashboard V12 (lançamentos Trello), F00–F09, webhook de atualização e rotina semanal do Cofre. **Não** colocar `verify_jwt=true` cegamente em webhooks sem JWT.
5. Promover uma rota por vez somente após aprovação dos gates, rollback versionado e monitoramento; nenhum serviço, cron ou plano novo. Manter as rotas antigas em proteção compatível até a substituição comprovada.
6. Retestar E2E em notebook + celular, armazenamento de anexo/identidade, 401/403/replay, idempotência, sem reabrir obras fechadas.

## Conexão real das etapas APP: fotografia do Banco Mestre
Consulta apenas agregada ao Supabase em 24/10: 18 casos F00, 41 arquivos F00, 152 eventos F00, 39 handoffs, 106 eventos de fluxo; zero evento órfão por token. Onze passagens F01→F02 e três F03→F04 têm correspondência por número de obra, mas `case_id` não está preenchido nesses 14 registros. **O campo não pode ser completado automaticamente** sem confirmar a qual tabela/sistema o ID se refere. As etapas F00–F09 respondem HTTP 200, mas não houve homologação E2E real.

## Saída autorizada desta candidata
**Somente documentação, testes sintéticos e definição de gates.** Nenhuma alteração em produção Edge, Cora, Trello, Dashboard, APP, Scheduler, Cloud Run, OAuth, PWA, SUPABASE_SERVICE_ROLE_KEY nem rollout do Cofre Zero. A candidata não deve ser mesclada enquanto o mapa dos consumidores, testes com sessões reais e recuperação/rollback não obtiverem prova.
