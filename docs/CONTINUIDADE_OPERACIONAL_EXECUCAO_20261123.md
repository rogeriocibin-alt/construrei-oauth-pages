# CONSTRU-REI — Controle operacional e plano seguro de continuidade

**Data de verificação:** 23/11/2026, horário de Brasília.
**Estado:** baseline preservado e testes somente-leitura; sem homologação E2E global.
**Fonte de tarefas:** [issue #235](https://github.com/rogeriocibin-alt/construrei-oauth-pages/issues/235), [Banco Mestre `public.cc_items`](https://supabase.com/dashboard/project/yspuaamokjbrosytqjpg).
**Fonte de links:** [registro oficial de 39 aliases](./official-links-registry.json). Alias cadastrado NÃO significa HTTP 200 verificado.

## Atalhos essenciais para direção

| Produto | Link | Classificação comprovada |
| --- | --- | --- |
| Central Operacional | [Central](https://rogeriocibin-alt.github.io/construrei-oauth-pages/central/) | Versão V2 homologada historicamente; não retestada na sessão do usuário |
| Dashboard Financeiro V12 | [V12 de produção](https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v12-operacoes-homologada-20261023/) | Versão oficial documental; NÃO confundir com V4 |
| Gestor do Projeto | [Gestor](https://rogeriocibin-alt.github.io/construrei-oauth-pages/gestor-projeto/) | Banco Mestre em serviço; UX móvel e E2E não retestados |
| APP | [APP CONSTRU-REI](https://rogeriocibin-alt.github.io/construrei-oauth-pages/app-construrei/) | Esteira F00–F09 ainda não homologada E2E |
| Trello Financeiro | [Quadro](https://trello.com/b/ybRbjpEL/gest%C3%A3o-financeira) | Valor em aberto V30 homologado, não prova PIX |
| Trello Obras | [Gestão de Obras 2026](https://trello.com/b/qI0r9MT8/gest%C3%A3o-de-obras-2026) | Operacional; base de cálculo do saldo Trello |
| Cofre Zero | [Manifesto semanal](./COFRE_ZERO_CANONICO_SEMANAL_20261024.md) | Rotina CAS semanal, NÃO restore integral |
| Pendências | [APP pendências](https://rogeriocibin-alt.github.io/construrei-oauth-pages/pendencias-app/) | Job de agregação ativo, entrega humana não comprovada |

## O que foi observado de fato

1. **Banco principal:** `ACTIVE_HEALTHY`, PostgreSQL 17, em 23/11. Consulta de integridade: 22 conexões de 60, 1 ativa, 0 transações ociosas e 0 locks aguardando.
2. **PostgREST:** logs de 23/11 registram recorrência de `Warp server error: Thread killed by timeout manager`, aproximadamente a cada 5 minutos. **Indício de instabilidade, causa e impacto HTTP ainda não atribuídos**. Não atribuir automaticamente às últimas travas/restart; correlacionar com URLs, status, timeouts e latência.
3. **Jobs banco:** job 1 Cofre semanal, job 2 Pendências 15m, jobs 3/5/6/10 Cora e job 11 Valores em Aberto 15m ativos; último dia sem execuções `pg_cron` malsucedidas observadas. Isso não prova lógica de negócio E2E de cada integração.
4. **Pendências:** job 2 retorna HTTP 200, `items_created=[]`, `evidence_added=0`; não comprova entrega de notificação. Não disparar notificação de teste para terceiros sem confirmar destinatário.
5. **Financeiro:** job 11, Edge `cr-trello-finance-sync-v1` v30, cálculo `R$ 45.433,54` (7 EM ANDAMENTO + 4 AG. PAGAMENTO, 766-26 a conferir). Cora continua fonte bancária; Trello apenas espelho, nenhuma movimentação financeira autorizada.
6. **Cofre Zero:** workflow principal GitHub [run 45044996835](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/45044996835) SUCCESS; Trello OIDC [run 45045335424](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/45045335424) foi cancelado ao completar 90 min, na etapa de CAS; restore independente do Trello desse ciclo **não rodou**. Manter um único Scheduler Cloud e um único cron GitHub semanal conforme manifesto, SEM reexecutar FULL nem recriar rotinas legadas.
7. **GitHub:** `main` estava `protected:false`, nenhum ruleset ativo listado. [Change Trace](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/45191635555) detectou `MAIN_PUSH_WITHOUT_PR_REFERENCE` em commit direto; não desligar esse guard para esconder o erro. Pages publicou com sucesso, mas a disponibilidade HTTP real dos 39 links não foi homologada.

## Ações essenciais ordenadas (sem regressões)

### P0 — proteger a `main` e a trilha de mudança
- No GitHub > Settings > Rules > Rulesets (ou Branch protection): exigir PR para `main`, proibir force-push/deletion, exigir Change Trace + CI adequados depois de verificar os nomes efetivos dos checks. **A proteção exige permissão administrativa**, não fornecida pelo conector GitHub disponível. Não declarar aplicada até ler de volta `protected:true` ou ruleset `active`.
- Para todas as alterações futuras, usar branch + PR, preencher Motivo, Escopo, Fonte oficial e Gestor, Evidências e testes, Impacto e regressão, Rollback; validar checks antes de merge. Não reescrever a história do push anterior.

### P0 — estabilidade da API e segurança operacional
- Correlacionar os erros PostgREST de 5 min com trace HTTP, status 5xx, latência, saturação de pool e erros de autenticação. Inspecionar logs da janela do incidente original, quando disponível. **Não reiniciar banco saudável só por esse padrão sem confirmação.**
- Revisar autenticação das rotas Trello/V12 e APP que usam assinatura estática/query; migrar somente após testes de consumidores, segurança de webhook (HMAC), replay, RBAC por perfil, rollback e execução em candidata. Não alterar 281 funções `verify_jwt=false` indistintamente.

### P1 — recuperar a evidência de cópia textual Trello
- O job foi **cancelado por limite de 90 minutos** (log GitHub), não `success`. A origem exata da lentidão é desconhecida.
- Este PR instrumenta de forma **não funcional** a `cr_trello_incremental.py`: marcos de tempo, número de quadros, contagem de cards/ações, shards CAS e progresso de readback, sem nomes, IDs ou dados financeiros.
- Testar self-tests do código e guarda de contrato no PR. Após revisão e merge, observar o **próximo ciclo natural**; não disparar backup extra nem aumentar timeout cegamente. Se persistir, diagnosticar OIDC/Trello, paginação, Drive e quantidade de objetos; corrigir pontualmente e validar restore por manifesto.

### P1 — notificações e canais
- BIO Gestor Diário e auditoria semanal Cofre Zero são as duas automações ChatGPT ativas. Ambas tiveram execução concluída, mas `delivery_status` é `unknown`; não prometer entrega por push. Verificar nas configurações do ChatGPT se notificações estão permitidas.
- Não criar duplicatas de tarefas, crons ou canais para compensar falta de notificação. Registrar ocorrência de falha concreta e corrigir o canal autorizado.

### P1 — catálogo e retomar APP
- O catálogo de 39 aliases é cadastro canônico, não monitor de disponibilidade. HTTP real do Github Pages/caminhos privados depende de navegador/rede acessível; não chamar site de ativo sem teste.
- Próxima entrega F02: orçamento ORÇA-REI e parecer 710-26 completos, PDF com logomarca/fotos, anexo vinculado ao caso, exportação e teste por papel; depois F03/F04 e os demais fluxos. Não duplicar Agenda Core nem inventar autorização de envio.

## Regras de preservação
- Não recriar o cron Cofre diário aposentado, não gerar FULL, não alterar CURRENT.
- Não reabrir obras encerradas, não reconfirmar cortes, não lançar Pix, apoios, rateios, Cora ou capital de giro.
- Não alterar a produção V12, Central V2, Gestor ou APP com documento/PR não testado.
- Atestado de recuperação integral só após ensaio isolado Auth/OAuth, PostgreSQL, Storage, Edge, Git, Trello+anexos e interfaces com critérios de passagem.
- Documento de apoio: [Auditoria Mestra 23/11](https://github.com/rogeriocibin-alt/construrei-oauth-pages/issues/235). Informações deste checkpoint são datadas, não substituem leitura viva.
