# CONSTRU-REI — Checkpoint canônico do Gestor e trilha de mudanças (24/10/2026)

**Natureza:** checkpoint de continuidade e política de prevenção de regressão. **Não é aceite de produção nem nova fonte de verdade.**
**Autoridade operacional:** Banco Mestre `public.cc_items` (Supabase); auditoria `public.cc_changes`. Código e histórico de releases: GitHub `main`, PRs e Actions. Saldo bancário: Cora. Obras e lançamentos: fonte operacional Trello conforme os contratos financeiros homologados.

## Estado confirmado em 24/10/2026

- Banco Mestre: **275** registros = **135 concluídos**, **41 cancelados**, **99 não finais**; destes, **2 P0**. **18** registros não finais sem `last_evidence_at`; ausência de prova não é erro automaticamente nem autoriza preencher data artificial.
- Gestor do Projeto: **1.2.5.2** e auditoria profunda realizada. Homologação final do PWA **pendente** no celular (instalação, cache, versão, atualização, offline). Não declarar o ecossistema 100% pela aprovação de uma inspeção estática.
- P0 **EXEC-APP-E2E-20261006**: `cr-f00-intake` v42 e `cr-flow-runtime-v2` v35 sem validação real de sessão nas rotas auditadas; RBAC e escopo de atendimento não comprovados. PR **#171** continua **DRAFT / NÃO MESCLAR** até autenticação servidor + E2E/rollback. Foram vistos 39 handoffs, 15 sem `case_id`, 39 sem `request_id`, 37 sem `correlation_id`. Não inventar UUID.
- P0 **SEC-FIN-TRELLO-AUTH-20261012**: autenticação/assinatura HMAC, caller e proteção contra replay das rotas de escrita Trello ainda não comprovadas em produção.
- Cofre Zero: **rotina semanal canônica**, preservar calendário e eliminar autoridade de executores diários antigos; execução dominical de 25/10 e restauração integral do ecossistema **aguardando evidência**.
- Financeiro V12 homologado e fluxo de acertos: **preservar**; aceitar descontos previamente confirmados. Não reabrir obras fechadas nem alterar custo, saldo Cora ou capital de giro em tarefas de governança.
- Evidência técnica já registrada: [PR #171 checkpoint](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/171#issuecomment-6390589620). Guard observado no commit da PR #171: [Actions run 40129124143](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/40129124143) SUCCESS (somente escopo dos testes executados).

## Regra de governança contínua: toda mudança rastreável

1. **Registro prévio e vínculo:** todo desenvolvimento/alteração via branch candidata + PR, com motivo, escopo, fontes afetadas, referência ao registro do Gestor, riscos, evidências, testes e rollback. Mudança direta em `main` somente sob política de emergência e posterior rastreabilidade; exigir regra de proteção `main` no GitHub para impedir bypass. **A automação de CI não substitui a proteção de branch.**
2. **Fonte oficial única:** cada dado deve ser atualizado no sistema que o possui; GitHub/PR é o histórico de código, `cc_items` o estado de pendências e `cc_changes` a trilha operacional. Não criar bancos mestres concorrentes nem usar checkpoint estático como estado ao vivo.
3. **Automatização por evento:** um guard leve sobre `pull_request` (toda PR) e `push: main` produz recibo de alterações com SHA, PR, escopo e resultado. A PR pronta para merge **falha** se faltar contrato de mudança. Artefatos do Actions têm retenção limitada; histórico durável fica no próprio Git/PR. Mudanças no Supabase feitas fora da API devem registrar `cc_changes` no mesmo ciclo; confirmar auditoria posteriormente.
4. **Gates reais e fail-closed:** nenhum P0 pode ser promovido por teste sintético isolado. Exigir sessão server-side, permissões por pessoa/recurso, negativa anônima, idempotência, verificação E2E, validação notebook+celular onde aplicável, reversão ensaiada. Guard existente da Central e bloqueios financeiros permanecem intactos.
5. **Versionamento automático:** para release funcional, atualizar identidade de versão, manifesto/registro do Gestor, notas e links; verificar cache PWA e disponibilizar uma URL canônica. A automação deve sinalizar divergência, **não** inventar homologação nem publicar sem validação.
6. **Atualização de pendências:** ao concluir ou modificar um trabalho, atualizar o registro existente no Banco Mestre com evidência e `cc_changes`; nunca alterar status como `Concluído` sem prova. Registrar links da PR, commit, testes, deploy e rollback. Diferenciar mudanças de código de mudanças em dados de cliente.
7. **Sem regressão / sem custo desnecessário:** nenhuma gravação real em obras, Cora, Trello, financeiro ou secrets como efeito de um guard; não gerar novo agendador de Cofre, serviço paralelo nem reconstruir dados históricos. Automatizar com CI mínimo, respeitando limites do plano GitHub Actions.

## Entrega e critérios de aceite

- A trilha de mudanças proposta fica em **candidata isolada**, não altera a `main` ou o ambiente publicado por si só.
- Validar `cr_change_trace_guard.py --self-test`, testes da CI atual, execução do novo workflow, e revisão da proteção `main` antes do merge.
- Para declarar "governança automatizada": (a) PR pronta sem campos mínimos bloqueada; (b) PR completa produz recibo; (c) `push main` gera recibo/alerta; (d) proteções de branch aplicadas; (e) atualização no Gestor e histórico `cc_changes` comprobados; (f) não regressão de Central, V12, Cofre e APP demonstrada.
- **Pendências reais remanescentes:** autenticação APP e Trello P0; PWA celular; evidências do Cofre e pendências de campo. O checkpoint não encerra nenhum desses itens.
