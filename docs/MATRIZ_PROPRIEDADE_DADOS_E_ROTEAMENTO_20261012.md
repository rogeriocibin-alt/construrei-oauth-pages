# CONSTRU-REI — Matriz de propriedade de dados e roteamento oficial

**Data:** 12/10/2026 • **Natureza:** evidência de reconciliação arquitetural **somente leitura**, subordinada à ADR `docs/ADR_ECOSSISTEMA_UNICO_CONTROL_PLANE_SAAS_20261011.md`, ao Índice Mestre, ao contrato `CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012` e às pendências **já existentes** `ARCH-TRUTH-20261012`, `ARCH-SAN-20261012`. **NÃO é segunda fonte de verdade nem altera a propriedade de nenhum dado.**

## 1. Separação física, lógica e semântica

- **Operação:** Central, APP/F00–F09, dashboards, integrações e serviços existentes. Publicar somente módulos homologados; uma única produção lógica não significa um único fornecedor de infraestrutura.
- **Governança:** Gestor do Projeto + API persistente existente; o banco canônico de pendências de PROJETO é `public.cc_items`, auditoria `public.cc_changes`. GitHub #53 contém **evidências** e checkpoints, não outra fila de pendências.
- **Histórico:** branches, commits, fontes históricas, backups Drive/Cofre e proveniência Netlify permanecem preservados. Não gerar cópia permanentemente hospedada para simular histórico.
- **Homologação:** branch/candidata e CI descartável; nenhuma API com escrita em produção deve ser acionada com dados de teste.

## 2. Matriz de responsáveis (regra e evidência, não descoberta dinâmica de fluxos)

| Entidade / domínio | Fonte mestra definida | Quem pode autorizar escrita | Consumidores conhecidos / papel | Evidência e lacuna de integração |
|---|---|---|---|---|
| Pendências de **projeto**, decisão e checkpoints | Gestor `public.cc_items` / trilha `cc_changes` | BIO coordena; aprovador humano segundo alçada; API com autenticação ainda requer auditoria | Gestor PWA; GitHub issue #53 é apenas evidência | **Mestre confirmado por decisão e consulta**. Auditar RLS, fluxo PWA/API, concorrência e idempotência antes de sincronizar |
| Regras canônicas | `docs/CANONICAL_RULES_MASTER_INDEX_V1_20261007.md` | Diretoria, PR revisado e aprovação aplicável | Gestor `project-data.json` como snapshot/projeção, agentes e CI | Identificadores de regras reconciliados; verificar aplicação funcional de cada regra |
| Links, aliases e destinos oficiais | `docs/official-links-registry.json` | Diretoria, PR e gates do ecossistema | Central, APP, Gestor, dashboards e navegação | **39 aliases / 21 grupos**; guarda CI; autenticação e uso real em navegador ainda não testados integralmente |
| Releases e builds | `gestor-projeto/version.json` para manifesto; HTML/SW/`app.js` são consumidores de identificação de build | Diretoria após candidata, testes e aceite de release | Gestor PWA/cache e interface de versão | V1.2.5.2 está coerente em HTML/SW/manifesto, mas `app.js` oficial usa V1.2.4; candidata **PR #99 DRAFT**, não publicada. `project-data.json` V1.2.7 é snapshot de governança, não release executável |
| Atendimento/triagem e fluxo APP F00–F09 | **Ainda precisa auditoria de persistência e autor de escrita por entidade** | Alçada BIO Gestor / Gabrielly no atendimento, executor técnico mediante handoff | Aliases F00–F09 → Edge `central-atendimento` | Rota direta foi verificada por cadastro oficial; **não** se conclui que essa única Edge executa todas as escritas ou dependências internas |
| Obras, recebimentos, custos, fechamento, rateios/acertos | **Trello**, mestre financeiro operacional acordado desde 2024 | Financeiro REI com validação humana conforme alçada | Dashboard, Central, relatórios e espelhos | Preservar obras fechadas; auditar IDs externos, autoria de escrita, cronologia, conciliação e igualdade de rateios; **nenhuma escrita financeira feita nesta auditoria** |
| Orçamentos e contagem comercial Gestão Click | Gestão Click enquanto origem da sua **contagem/status comercial**, nunca mestre do lucro ou acertos Trello | Operação comercial em seu fluxo homologado | Central/Orçamentos Click | Não confundir dados próprios do Click (orçamentos) com espelho financeiro; verificar extração, deduplicação e filtros |
| Saldo bancário CORA | CORA para saldo bancário real; valor **manual verificado** só vale como snapshot identificado, não integração automática | Financeiro REI | Dashboard financeiro | APIs/billing e conciliação automática não comprovadas; diferenciar saldo verificado, projetado e fonte/hora |
| Compromissos da agenda | Google Calendar para eventos | Titular autorizado da Agenda e integração própria | Central/agenda, APP quando aplicável | Mapear `eventId`, direções de escrita, conflitos, janela de atualização e eventos duplicados |
| Pendências de **operação** APP, WIZY, Éder | Fonte operacional do módulo a ser identificada para cada tipo; **não** criar novo mestre no Gestor | Responsáveis operacionais por alçada | Telas APP/WIZY/Éder, Central | Uma projeção operacional não vira automaticamente pendência de projeto e vice-versa; fluxo real ainda precisa conciliação |
| Código, versões técnicas e inventário | GitHub repositório público (governança/portal) e privado (financeiro) por escopo | PR+CI+homologação; configuração administrativa de `main` P0 pendente | Cofre Zero, CI, Gestor como índice | GitHub histórico é evidência/versionamento, **não banco operacional** |
| Backup, restauração e histórico de terceiros | Cofre Zero + destino privado Google Drive, origens externas existentes | Automação preexistente; restauração e exclusões requerem gates | Gestor/Cofre como estado e diagnóstico | Recuperação parcial confirmada; exercício integral Edge/OAuth/APP e rollback permanece adiado/monitorado; nunca marcar `backup_restore_ok=true` sem prova E2E |

**Contrato obrigatório para cada nova integração de escrita:** definir `sistema_mestre`, `owner`, `id_canonico`, `id_externo`, `direcao_de_escrita`, `evento_id`, `idempotency_key`, `occurred_at`, `regra_de_conflito`, `latencia_maxima`, `reconciliacao`, `rollback`, nível de prova e data. Enquanto não houver esses campos com evidência, **não habilitar sincronização bidirecional nem migrar fonte mestra**. Nunca usar número do orçamento como chave global sem identidade externa.

## 3. Prioridade real das Edge Functions

Análise cruzada somente leitura do catálogo oficial em 12/10:

- Dos **39 aliases**, **35** têm destino direto na API Edge do Supabase; os demais **4** têm outros destinos HTTPS.
- Os 35 endpoints Edge se concentram em **2 slugs**: `centro-operacoes` (**24 aliases**) e `central-atendimento` (**11 aliases**). Ambos estavam listados como **ACTIVE** no catálogo de 370 funções.
- Essas 2 são **raízes de roteamento oficial direto**, não uma prova de que as demais 368 funções não possuem consumidores, chamadas internas, OAuth, jobs ou integrações.
- **Primeira camada de dependências indiretas identificada por leitura do fonte vivo no Supabase:** a função `centro-operacoes` v291 contém URLs literais para `central-atendimento`, `construrei-logo`, `central-gestao-api`, `central-pendencias-cockpit`, `central-pendencias-write`, `central-evidencia-upload` e `sala-equipe-r12-candidate` (além de autorreferência); `central-atendimento` v160 contém referência de caminho a `central-atendimento-router-audit`. A união são **9 funções ativas** (2 raízes + 7 slugs adicionais), todas confirmadas com `status=ACTIVE` no inventário do projeto em 12/10. **Referência literal não prova chamada executada ou abrangência do fluxo**; estes 9 slugs ficam sob **proteção por cautela / NÃO EXCLUIR**, não rotulados como 9 dependências comprovadas em produção.
- Metadado `verify_jwt=false` nos 9 slugs observados: demanda auditoria de controle de acesso server-side **por endpoint e caso de uso**. Não classificar automaticamente como vulnerabilidade, pois autenticação pode ser aplicada pela função/proxy; tampouco afirmar segurança sem teste de autorização real.
- Matriz histórica `public.cr_edge_dependency_matrix`: **92 linhas**, somente **15** coincidem com 370 funções ativas atuais, **77** correspondem a slugs não ativos, **355** ativos ainda não estão nela; **0** tinham `can_remove=true`.
- **Regra antirregressão CI:** o auditor de ecossistema mantém esses 35 destinos e 2 raízes sob controle. Qualquer novo endpoint, remoção ou desvio exige mudança de contrato e homologação por PR; não fazer `DELETE` ou deploy para resolver discrepâncias.
- Próxima classificação read-only: dependências indiretas partindo das **2 raízes oficiais**, rotas internas, Agenda, Cora, Trello, WIZY/Éder e Financeiro, comparando também Netlify/Vercel/Google Drive. Registrar evidência por slug sem presumir que ausência de link literal significa desuso.

## 4. Ordem de execução sem duplicar desenvolvimento

1. **P0 administrativo:** configurar proteção de branch pública; GitHub retornou HTTP 403 para rulesets do financeiro privado com exigência de GitHub Pro — **não contratar, não abrir acesso público** sem decisão.
2. **P1 fontes e release:** manter PR #99 candidato, sem publicar antes de homologação real PWA/celular/notebook e rollback; reconciliar consumidores da matriz por entidade.
3. **P1 saneamento:** primeiro mapear consumidores das 2 raízes; depois 355 funções sem matriz e 109 pastas `preview/` não classificadas. Excluir/mover apenas após evidência de desuso, snapshot recuperável, custo e autorização explícita.
4. **H-DR:** continuar jobs de backup existentes e verificar seus ciclos por `event=schedule`, separando testes `push`/`workflow_dispatch`. Ensaio integral de recuperação permanece adiado até estabilização/decisão.

**Estados de prova utilizados:** `DECISAO_CANONICA` = regra aprovada; `STATIC_CI_PASS` = contrato do repositório; `CONNECTOR_READ_CONFIRMED` = resposta lida do serviço; `E2E_LIVE_PENDENTE` = falta prova funcional; `BLOCKED_ADMIN` = exige permissão administrativa. Nenhum dos primeiros três equivale a E2E ou autoriza limpeza.

**Critério de encerramento:** cada item mestre do Gestor recebe evidence/URL/checkpoint, bloqueios e próxima ação; não abrir um cartão concorrente e não alterar regras financeiras, interfaces oficiais ou backups neste trabalho.
