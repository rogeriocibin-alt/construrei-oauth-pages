# CONSTRU-REI — Segurança Trello e testes do APP/Gestor — execução em 24/10/2026

**Natureza:** evidência técnica reproduzível, sem lançamentos nem alterações nas rotas de produção. **Estado: PASS parcial / não homologado globalmente.**
**Escopo:** P0 `SEC-FIN-TRELLO-AUTH-20261012` e `EXEC-APP-E2E-20261006`. Financeiro V12 e Cofre Zero semanal preservados.

## Testes realmente executados

| Prova | Ambiente | Resultado | O que demonstra / limite |
| --- | --- | --- | --- |
| HMAC-SHA1 Trello, envelope assinado, política de caller/replay | Notebook conectado, Node v24.19.0, fixtures sintéticos sem segredos | **22 PASS, 0 FAIL** | Contratos puros fail-closed; **não** protege runtime sozinho |
| Negativas HTTP reais sem credenciais | Supabase Edge ativo, somente requests não autorizadas | **6/6 conforme esperado**: health 200; V12 commit/status 401; legacy repair 403; capital sync 403; capital summary 401 | Rejeição de chamadas anônimas sem segredo; **não** prova resistência a URL com segredo vazado, replay ou RBAC completo |
| GET-only de recursos PWA/APP públicos | GitHub Pages, notebook online, sem mutação | **5/5 PASS**: cinco arquivos HTTP 200, `version.json` 1.2.5.2 oficial, `sw.js` mesmo BUILD, HTML APP, JS CURRENT_RELEASE | Disponibilidade e alinhamento estático; **não** é teste de cache instalado em celular, fluxos E2E autenticados ou autorização entre papéis |
| Visualização Opera do Gestor | Sessão já aberta no notebook | v1.2.5.2 oficial LIVE, Banco Mestre conectado, 1/2 frentes, 99 não finais no snapshot | Comprova visualização no notebook; *nenhum GO global* |

### Código de teste

- `node --test security/contracts/trello-webhook-*.test.mjs`: 22 testes sintéticos. Importados de PR #74 **sem** copiar o workflow diário retirado.
- `node audits/security-trello-live-negative-smoke-20261024.mjs`: 6 verificações de recusa; sem tokens, cookies, segredos ou efeitos financeiros.
- `node audits/gestor-app-public-smoke-20261024.mjs`: 5 verificações GET-only.
- Testes reproduzidos e aprovados no notebook em 24/10/2026. Esses arquivos estão em candidata e **não são automaticamente executados pelo CI da main**: incorporação ao workflow central existente necessita uma alteração separada e permitida, e não deve criar cron paralelo.

## Auditoria objetiva das rotas em produção

Leitura do código Edge publicado em 24/10/2026:

1. `cr-finance-v12-safe-trello-candidate-20261021`: ação `commit` requer `x-cr-session` e papel `ADMIN_MASTER_ROGERIO` verificado por `central-gestao-api?api=me`. Há claim RPC e confirmação após commit. A negativa sem sessão **PASS**, mas autorização positiva por papel, replay concorrente e estorno/rollback não foram homologados nesta rodada.
2. `cr-trello-gestao-vista-v2`: webhook baseado em `sig` estático na URL e operações administrativas por chave de query. Não existe validação HMAC de `X-Trello-Webhook` no handler publicado observado. Proteção real **P0 pendente**.
3. `cr-trello-capital-giro-v1`: ações `sync`, `install-webhook`, `kick`, `bootstrap` e `webhook` usam `sig` na URL; `summary` verifica sessão por rota externa. Proteção real **P0 pendente**.
4. `cr-dashboard-gerencial-v4-manual-cora-candidate-20261007`: comandos sensíveis observados exigem bearer de service role; não efetuar mudança apenas pelo `verify_jwt=false` sem preservar consumidores.
5. A listagem Supabase de funções reporta `verify_jwt=false` para diversas rotas, o que **não é sozinho** prova de exposição: webhooks legítimos e workloads podem autenticar dentro do handler; verificações por tipo de origem são obrigatórias.

## Gates ainda sem PASS (não encerrar os itens mestres)

- **SEC P0:** inventário de consumidores reais e URLs de callback; segredo de aplicativo Trello no servidor; validação HMAC sobre bytes originais+callback oficial; gate de sessão/escopo para humano e workload; reserva transacional de replay; negativos e positivos por papel; rollout rota por rota com rollback e monitoramento. As constantes legadas em query devem ser descontinuadas com migração segura, **sem cortar callbacks ativos precipitadamente**.
- **APP P0:** E2E real F00→F01→F02→F03/F04→F09, mantendo `case_id`/`request_id`, fotos, anexos, histórico, ACL para Gabrielly/Fabrício/Éder/Rogério; testes navegadores notebook e celular com papéis reais, regressão e aprovação. A leitura anterior identificou 14 handoffs com `case_id` vazio; não corrigir IDs por inferência.
- **PWA:** observar ciclo de SW/cache em aparelho instalado e nova aba; validar atualização sem loop, navegação, offline/fallback e ausência de regressão. PR #99 de versão 1.2.5.3 permanece DRAFT.
- **Cofre Zero:** backup semanal canônico inalterado, ciclo natural de 25/10 e recuperação funcional externa não fazem parte destas negativas e não receberam PASS novo.
- **CI:** executar novos scripts de teste via workflow existente após autorização de alteração do workflow. Não introduzir outro agendamento.
  
## Governança, decisão e rollback

- Nenhuma alteração de função Edge publicada, segredos, credenciais, Trello, custos, obras fechadas, saldo Cora, Banco Mestre ou Cofre.
- Nenhuma autorização para mesclar PR #74, que contém workflow antigo; esta candidata é derivada da main atual.
- Conclusão limitada à **implementação de contratos reproduzíveis e execução de smoke/negativas**. Não declarar `SEC-FIN-TRELLO-AUTH-20261012` nem `EXEC-APP-E2E-20261006` concluídos sem evidência externa integral.
- Fonte da verdade do Gestor: `public.cc_items`; este relatório é evidência auxiliar, não uma alteração automática dos registros mestres.
