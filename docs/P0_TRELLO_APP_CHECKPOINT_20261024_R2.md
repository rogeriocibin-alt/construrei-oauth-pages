# CR Assertivo — checkpoint técnico P0 Trello / APP — 24/10/2026 R2

**Autoridade:** auditoria incremental sobre PR #169 integrada na main; candidata PR #170. **Não equivale a homologação global do runtime.**

## Correções realmente implementadas

- `.github/scripts/cr_flow_public_client_perimeter_guard.py`: exigência de execução offline das três suítes de assinatura/caller/envelope Trello no **job existente** da Central Canonical Guard. Falha se arquivo obrigatório sumir, Node não executar ou qualquer teste falhar. Sem novos agendamentos, workflows ou serviços.
- `audits/app-f00-f09-public-smoke-20261024.mjs`: repetidor de GET-only dos 10 módulos oficiais e respectivos destinos Edge. Nenhum dado operacional modificado.
- Metadados do Gestor nesta PR: preservam P0 aberto e os critérios reais para fechamento.

## Provas executadas nesta rodada

| Teste | Resultado | Ambiente | Limite |
|---|---:|---|---|
| Trello HMAC-SHA1, body UTF-8/callback exato, caller, política e replay sintético | **22/22 PASS** | Node v24 no notebook autorizado | Contrato puro; NÃO prova integração no Edge real |
| HTTP não autorizado (V12, Trello lista, capital de giro) | **6/6 PASS** | Supabase Edge ativo, sem credenciais, sem writes | Não prova resistência a segredo URL comprometido |
| F00–F09 URLs oficiais e destinos de API | **10/10 PASS** | GitHub Pages, GET-only | Não é E2E autenticado de handoff/anexos |
| Central Canonical Guard com contrato criptográfico inserido | **SUCCESS** run 40128423489, head 5236cd91 | GitHub Actions, PR #170 | Revisar nova execução se head mudar |
| Auditoria SQL de escopo RPC V12 | **VERIFICADO** | Leitura de catálogo PostgreSQL | `cr_finance_v12_claim` e `cr_finance_v12_finish` com ACL de `postgres` e `service_role`, não público |
| Operações V12 | **35 COMMITTED** observadas | Consulta agregada read-only em `cr_finance_v12_operations` | Não testa replay concorrente nem aprova operações individuais |

## Causa-raiz verificada dos 14 handoffs

Consultas read-only no Supabase mostram 11 handoffs F01→F02 + 3 F03→F04 sem `case_id`. Há ainda um F01→F00 sem `case_id`. FK real `cr_flow_handoffs.case_id` referencia `cr_cases_v1(case_id)`, **não** `cr_f00_cases(id)`. Entre os 14 casos F01→F02/F03→F04, somente o `800-26` tem `case_code` correspondente na tabela `cr_cases_v1`; os 13 outros não. A tabela F00 possui números coincidentes, mas seu UUID não atende a essa FK. Sem cadastro canônico comprovado, atualização automática introduziria associação errada. **Não executar UPDATE nos 14 registros por heurística.**

## Segurança ainda sem PASS real

- Edge `cr-trello-gestao-vista-v2` e `cr-trello-capital-giro-v1` possuem callbacks com `sig` legada na URL; os contratos HMAC ainda não estão aplicados aos handlers reais.
- Antes de mudar endpoints, inventariar os callbacks cadastrados, clientes manuais/automatizados, origem dos segredos de aplicativo no servidor e idempotência persistente de eventos. Confirmar que assinatura é sobre corpo exato + callback literal (Trello official spec). Segurança de operações humanas deve vir de sessão e papel comprovados.
- Uma migração compatível precisa canário no ambiente existente, testes com assinatura positiva/negativa, rejeição de sessão inválida, replay/concorrência e rollback restaurável. **Não remover callbacks ativos ou ativar `verify_jwt=true` indiscriminadamente**.
- APP demanda E2E autenticado com identidade por papéis e dispositivos; checks públicos não o substituem.
- PWA cache em instalação mobile e domingo 25/10 de Cofre Zero são pendências externas distintas.

## Integridade e decisão

Nenhuma chamada de escrita ao Trello, Cora, Financeiro V12, Edge, usuário ou backup foi realizada. Nenhum segredo exposto. Não há novo cron nem duplicação da rotina semanal. Os P0 `SEC-FIN-TRELLO-AUTH-20261012` e `EXEC-APP-E2E-20261006` permanecem **abertos**, mesmo com avanço testado.

**Próximos gates únicos:** (1) rollout de autenticação real de webhook e caller com prova E2E e rollback, (2) saneamento da origem `cr_cases_v1` dos handoffs sem IDs inventados, (3) fluxo completo APP por papel + notebook/celular, (4) prova semanal Cofre/recuperação.
