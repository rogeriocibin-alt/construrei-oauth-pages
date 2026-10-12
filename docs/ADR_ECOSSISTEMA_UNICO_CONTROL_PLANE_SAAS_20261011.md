# ADR — Arquitetura-mestra do ecossistema CONSTRU-REI, governança e evolução SaaS
**Data:** 11/10/2026 — America/Sao_Paulo  
**Estado:** PROPOSTA PARA REVISÃO / SEM PROMOÇÃO / SEM EXECUÇÃO DE MIGRAÇÃO  
**Escopo:** Central, APP/F00–F09, Gestor, financeiro, painéis, pendências, salas, documentação, backups, integrações e futura oferta B2B.  
**Responsável pela decisão:** Diretoria CONSTRU-REI.  
**Relação:** complementa, **não substitui**, o Índice Mestre de Regras (GOV-001 etc.), o cadastro oficial de links, o plano de três ambientes e o checkpoint #53.

## Decisão complementar da Diretoria: UM ambiente hospedado, três estados de governança
**Atualização 11/10/2026 — política de custo incremental zero.** Esta decisão é aplicável ao ecossistema inteiro e especializa o plano existente `docs/ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md`. Não cria segundo plano nem nova instância de Gestor.

- **Produção:** somente runtime oficial permanentemente hospedado; preserva URLs, banco Supabase, APIs, integrações e Cofre Zero já existentes.
- **Homologação:** branch candidata/versionamento e testes em runners temporários com fixtures/mocks, sem servidor/banco/370 Edge Functions duplicados e sem link público permanente de aplicativo de teste. Visuais e fluxos sem backend real podem ser exercitados localmente; E2E de escrita/Auth/RLS exige infraestrutura verdadeiramente isolada, eventualmente efêmera, ou permanece **BLOQUEADO**, nunca utiliza clientes reais como massa de testes. Não chamar mock de homologação E2E.
- **Arquivo:** commits, tags, PRs, checkpoints, manifesto assinado/hash e backups privados já cobertos pelo Cofre Zero/Drive; **não servir conteúdo sensível no Pages** e não deixar sistemas antigos ligados por hábito. Preservar dependências e rollback antes de qualquer retirada.
- **Custo e risco:** nenhuma criação paga (branch Supabase, DB, projeto, Storage, server, horário extra ou deploy de provedor) sem uma nova decisão expressa após cotação; reusar serviços e quotas atuais. Meta R$ 0 incremental **não é garantia de que o plano existente nunca terá consumo variável ou limite de franquia**. Informar consumo e bloqueios reais, sem gerar cobrança silenciosa.
- **Control plane:** Gestor mantém apenas **um catálogo lógico** de ativos com `estado_de_vida` (PRODUÇÃO/HOMOLOGAÇÃO/HISTÓRICO/INDETERMINADO), commit, origem, proprietário, dependências, prova de aprovação, backup, restore e rollback; não cria nova fonte de informações de negócio.
- **Execução:** sem exclusões automáticas, sem ativação de novo Supabase, sem novos agendamentos e sem promoção de candidate não homologada. O padrão de CI/ambiente de teste custa apenas o que já for coberto pelas franquias existentes e passa por gates read-only.

## 1. Resumo executivo e decisão arquitetural proposta
**Um produto, dois planos, três estados do ciclo de vida e uma trilha de implantação comercial.**

1. **Plano operacional (Data Plane / Central):** local de trabalho da empresa cliente; experiência única, APP, atendimentos, financeiro, obras, agenda, indicadores, checklist, pendências operacionais, salas, materiais de operação. Uma navegação, identidade e autorização coerentes.
2. **Plano de controle (Control Plane / Gestor-Developer):** governa catálogo de módulos, ambientes, releases, regra canônica, pendências de projeto, auditorias, disponibilidade, integrações, Cofre Zero, evidências, implantação e rollback. Gestor **permanece**; pode ser aberto da Central como item **restrito por papel**, sem tornar funções privilegiadas públicas. Não manter segundo banco de pendências.
3. **Estados do ciclo de vida por artefato:** PRODUÇÃO (publicado e homologado), HOMOLOGAÇÃO (candidata isolada, acesso e dados de teste próprios), ARQUIVO (evidência/backup recuperável, não servido como aplicação). `development`/branches são espaços de trabalho, não um quarto estado de publicação nem uma cópia da base de produção. Três estados não significam necessariamente três servidores: isolamento deve ser comprovado por deploy, identidade, dados e permissões.
4. **Produto comercial futuro:** núcleo comum versionado e parametrizado por organização; configuração/tema, módulos licenciados, usuários e integração por cliente, com dados e segredos separados. Antes de vender como SaaS multiempresa, demonstrar isolamento de clientes, onboarding, custos, segurança e restauração individual.

**Não confundir:** portal unificado ≠ banco único físico; URL/alias ≠ sistema; versão em arquivo JSON ≠ release homologada; CI estático aprovado ≠ fluxo financeiro, login e OAuth testados de ponta a ponta.

## 2. Constatações baseadas nos artefatos verificados em 11/10
- `docs/official-links-registry.json` é o cadastro canônico existente de **39 aliases oficiais**; muitos aliases compartilham destinos Supabase e outros apontam para GitHub Pages ou Vercel. Não criar segundo cadastro de links.
- PR #58 (`cr-central-full-contract-audit-20261011`): auditoria proposta para os 39 aliases e 21 grupos de funções; **ainda não integrada**. É validação estrutural estática, não aferição financeira nem prova de login.
- PR #56 (`cr-homolog-f00-f09-canonic-v1-20261011`): **DRAFT**, sem homologação visual isolada e sem autorização de promoção. PR #57 (guard da Central) já integrado.
- O checkpoint #53 e `docs/ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md` deixam claro que os ambientes **ainda não estão fisicamente isolados**; 121 subpastas em `preview/`, com dependências que impedem remoção automática.
- O Gestor já possui cockpit, pendências de projeto, decisões, versões, governança, infraestrutura, agentes, histórico e Cofre Zero. `gestor-projeto/app.js` busca snapshot de uma API Supabase e tem fallback versionado; isso não prova que todas as telas dependem de uma única fonte persistente.
- **Desvio objetivo de metadados:** `gestor-projeto/app.js` declara `CURRENT_RELEASE.version=1.2.4`; `gestor-projeto/version.json` declara `1.2.5.2`; `gestor-projeto/project-data.json` contém referência a `V1.2.7`. Necessária reconciliação do significado (interface, pacote, conteúdo, versão publicada) com única release efetiva imutável e campos semânticos diferenciados. Não concluir perda ou corrupção só por esse achado.
- O alias `central/` redireciona normalmente ao caminho GitHub Pages de produção; seu registro de links também referencia um endpoint técnico Supabase. Validar a distinção entre destino de navegação, endpoint de API e origem do runtime; não presumir erro sem teste funcional.
- O inventário de infraestrutura é um **snapshot** com escopo de contas conectadas; não serve, isoladamente, para garantir cobertura de todo domínio/projeto externo.
- Cofre Zero automatizado existe, mas recuperação integral Trello/anexos, SQL e serviços externos ainda tem lacunas documentadas: não declarar proteção total.
- **Nenhum teste de segurança multi-tenant, RLS completo, OAuth empresarial, isolamento real das bases, restauração por cliente ou billing foi comprovado por esta ADR.**

## 3. Mapa de responsabilidades e destino funcional
| Capacidade | Superfície operacional | Governança no Gestor/Developer | Fonte canônica / limite |
| --- | --- | --- | --- |
| Página inicial, menu, atalhos, notificações | Central | Catálogo e saúde de rotas | `official-links-registry.json` registra aliases; não armazena estado de negócio |
| Atendimento, orçamentos, execução, F00–F09, APP Gabi | Central / APP | Versão, testes, contratos, roteamento, gates | Mapear APIs e mestre de cada entidade antes de sincronizar |
| Dashboard financeiro, saldos, rateio, recebimentos | Central / Diretoria | Controle de versões, qualidade, auditoria de integrações | Para operação atual, Trello é fonte histórica acordada; Click espelha onde decidido; saldo Cora manual verificado até integração auditada |
| Agenda, textos padrão, compromissos | Central / APP | Gates e disponibilidade da integração | Google Calendar para compromissos; identificar IDs externos, conflitos e permissão de escrita |
| Pendências APP, WIZY e Éder | Central / APP, vistas filtradas | Regras de projeção e fiscalização | Banco Mestre do Gestor para pendências de PROJETO; projeções operacionais não devem receber itens de projeto ou virar masters paralelos |
| Gestão de projeto, releases, backups, riscos, agentes, documentação de desenvolvimento | Gestor-Developer (acesso restrito) | Fonte primária da governança | Gestor / API persistente, com snapshots de contingência explicitamente identificados |
| Reuniões, apresentação institucional, Academy, documentação operacional, técnicos | Central por papel | Versões, vínculos, revisão, permissões | Serviços externos e documentos originais; catálogo aponta sem copiar conteúdo indiscriminadamente |
| Governança de links, regras canônicas e histórico | Links no portal quando aplicável | **Gestor**, com links para registros oficiais | Cadastro de links, Índice Mestre de Regras e evidências Git — cada um dono do seu domínio |
| Arquivo e recuperação | Não aparece como aplicativo operacional | Cofre Zero / Histórico | Cópias privadas com hashes, retenção, teste de restore e identificação de origem |
| Implantação em cliente e licenças (futuro) | Portal do cliente com branding próprio | Developer/Implantações separado e privilegiado | Núcleo do produto + metadados por cliente + credenciais por implantação |

## 4. Contratos contra duplicidade de dados (obrigatórios)
Para cada entidade de negócio ou técnica, criar **matriz de propriedade**, não uma nova cópia do conteúdo: `dominio`, `entidade`, `sistema_mestre`, `id_canonico`, `id_externo`, `quem_pode_escrever`, `eventos`, `consumidores`, `regra_de_conflito`, `latencia_aceitavel`, `reconciliacao`, `politica_retencao`, `classificacao`, `owner`.
- **Uma entidade, um comando mestre.** Outros sistemas são cache, visualização, projeção ou destino de integração; `sync` bidirecional apenas com regra de conciliação explícita e auditável.
- Integração: padrão **outbox/evento versionado** onde for apropriado; `event_id`, `tenant_id`, `correlation_id`, `source_system`, `entity_id`, `schema_version`, `occurred_at` e chave de idempotência; retries com backoff, dead-letter, rastreamento e reconciliação. Nenhum evento autoriza duplicar card, obra ou lançamento.
- IDs legados de Trello, Click e integrações preservados em tabela de correspondência, nunca substituídos pelo número do orçamento como identificador universal.
- Leituras de dashboard indicam **origem, sincronizado em, confiança e exceções**; números financeiros não devem assumir confirmação por mera existência de JSON estático.
- Gestor registra **propriedade e estado da integração**, não opera financeiramente em paralelo ao Financeiro REI.

## 5. Release único e segregação verdadeira
- Manter CI/Git como cadeia de evidência; gerar **um manifesto de release** por build promovido (produto, módulo, git commit SHA, artefato SHA256, URL canônica, schema API, migração, ambiente, status, aprovação, hora, rollback, evidências).
- O Gestor consulta e mostra o manifesto; Central mostra somente a versão operacional aplicável. `app.js`, `version.json`, `project-data.json` devem consumir metadados de mesma origem **ou ter papéis de versão expressamente distintos**, sem afirmar semânticas contraditórias.
- PUBLICAR: build promovido em deploy de produção a partir de allowlist de artefatos; homologação em deploy + domínio/rotas + credenciais + banco de teste segregados; arquivo em repositório/acervo privado recuperável, **não no site oficial**. Preservar antigos destinos enquanto houver dependências.
- Gates: contratos dos 39 aliases/21 grupos como cobertura **mínima**; testes HTTP externos e auth, RLS/autorização por papel, navegação notebook/celular/PWA, offline e cache/SW, F00–F09/APP Gabi, agenda, Click, Trello, Cora, financeiro, rollback, restore e nenhuma rota oficial apontando para `preview/`.
- Qualquer promoção exige commit testado, resultados reproduzíveis e homologação de negócio; reversão isolada por módulo sem regressão global.

## 6. Segurança e confiabilidade para uso interno e SaaS
1. **Identidade e autorização:** SSO/Auth quando viável; papéis `diretoria`, `financeiro`, `atendimento`, `tecnico`, `operacao`, `developer`, `auditor`; políticas server-side e trilha de acesso. A Central pode oferecer atalho ao Gestor mas não herdar sua autorização.
2. **Acesso a dados:** segregar por cliente com isolamento demonstrado. Opções: (a) instância/projeto/banco dedicado por cliente no estágio inicial — isolamento mais simples com custo de operação maior; (b) multi-tenant compartilhado **somente após** RLS rigorosa em todas as tabelas/Storage, testes cross-tenant, gestão de segredos, backup/restore e limites por tenant. Nunca liberar `tenant_id` confiando apenas na tela.
3. **Segredos:** apenas servidor/secret manager; chaves públicas `anon` por si não são segredo, **mas sua exposição exige auditar permissões efetivas, políticas RLS e endpoints**, sem inferir proteção de um nome de chave.
4. **Auditoria financeira:** segregar escrita e aprovação, manter ledger imutável de alterações críticas, idempotência e reconciliação por fonte. Nunca tratar Click como fonte oficial por conveniência; preservar obras encerradas e origem de custos.
5. **Observabilidade:** healthchecks de integrações com status `verified_live`, `snapshot`, `stale`, `blocked` e última evidência; alertas por falha de sync, backup, version drift e duplicidade; evitar indicadores otimistas derivados de fallback.
6. **Continuidade:** backup criptografado e sob controle de acesso, ensaio de restore funcional completo e por cliente; retenção, RPO/RTO formalizados; Cofre Zero como serviço de controle, sem endpoints administrativos públicos de escrita.
7. **Licenciamento/privacidade:** contratos de tratamento de dados, LGPD, termos, papéis de controlador/operador, onboarding/offboarding com exportação, exclusão auditável onde legalmente cabível, minimização e revisão de dados pessoais antes de replicar.

## 7. Modelo comercial recomendado — evoluir sem clonar a CONSTRU-REI
**Núcleo comum (Core):** módulos de operação, identidade, eventos, configuração, auditoria e catálogo, com versões por release.  
**Configuração por empresa (Tenant):** nome/marca/logo/paleta, módulos/planos/limites, equipe e papéis, terminologia e modelos de serviço, fórmulas comerciais e comissões específicas, integrações, domínio, localidade e políticas de retenção.  
**Instalação/Implementação (Developer):** wizard de provisionamento, checklist de LGPD e segurança, vínculos OAuth por cliente, templates, importação/mapeamento de dados, testes, homologação, suporte e rollback por implantação.  
**Produtos vendáveis (futuros):** licença/assinatura do produto, taxa de implantação, conectores opcionais, suporte e customização controlada por extensão; **não ramificar cópias independentes do código** por cliente. Dados reais da CONSTRU-REI nunca entram no template entregue a terceiros.
**Limitação atual:** a proposta de vertical SaaS existe conceitualmente; o repositório verificado **não demonstra** motor de provisionamento, multi-tenancy, billing ou isolamento suficientes para venda como produto pronto.

## 8. Registro de riscos prioritários
| Risco | Evidência hoje | Ação e critério de encerramento |
| --- | --- | --- |
| R1 — divergência de versões / perda de rastreabilidade | 1.2.4 no JS, 1.2.5.2 no version.json, V1.2.7 no project-data | Distinguir campos e gerar manifesto/validador único; provar versão real servida |
| R2 — dependência de `preview/` exposta na operação | inventário #53; PRs #52/#56 | Migrar com cópia/SHAs e staging; contratos, navegação, rollback antes de cada promoção |
| R3 — cobertura parcial da Central completa | 39 links; auditor PR #58 sem merge; limites estáticos | Completar inventário de links + APIs + dados, CI e E2E por domínio; incluir Gestor |
| R4 — duplicidade e conflitos entre Trello/Click/Cora/Gestor | regras canônicas definem mestres, mas topologia de escrita ponta a ponta não verificada | Matriz por entidade, teste de reconciliação e idempotência; nenhuma migração de master sem aprovação |
| R5 — falsa sensação de segurança do backup | Trello anexos/SQL/serviços externos com restauração parcial | Restore end-to-end isolado e checklist de cobertura por origem |
| R6 — vazamento/acesso cruzado numa versão comercial | não há prova de segregação por empresa | Auth server-side, teste cross-tenant, RLS/Storage, backup por cliente, LGPD e auditoria |
| R7 — catálogo ou UI duplicados | 39 aliases e caminhos históricos, fontes de snapshot e live | Catálogo canônico aponta, não duplica; fallback sinalizado e observabilidade central |
| R8 — governança ficar escondida em operação ou exposta indevidamente | Gestor é aplicação PWA independente | Atalho no portal somente por papel; control plane mantido com acesso privilegiado |

## 9. Execução escalonada — sem terceira frente ativa e sem reabrir o que está homologado
**Gate 0: congelamento e mapa (documental, nesta ADR).**  
Aprovar separação Operação / Gestor-Developer; registrar contrato de dados e release, riscos e responsáveis. Não alterar telas/bancos/links. Guardar esta ADR como candidata vinculada a #53 e ao Índice Mestre. Não criar outra fonte de verdade de regras.

**Gate 1: inventário de verdade (P0):** levantar código real, cada alias e recurso com destino, produto, dono, fluxos de leitura/escrita, fontes persistentes, secrets por ambiente, identidade, restore, custo e nível de prova. Para cada dado crítico, indicar master e consumidor. Inventário automatizado alimenta o Gestor — sem cadastro manual concorrente.

**Gate 2: correção de governança (P0):** manifesto de release e validador contra drift; fechar R1. Incorporar auditoria full scope PR #58 somente com CI apropriado, sem mudar UI. Definir matriz de ownership e reconciliação sem migrar registros financeiros.

**Gate 3: isolamento operacional (P0):** concluir PR #56 com publicação em homologação realmente separada e aceite notebook/celular; inspecionar APP Gabi e ativos fora do APP; só depois promover. Criar produção allowlist e arquivo privado preservando dependências e testando restauração.

**Gate 4: plano de controle no Gestor (P1):** mapa único de módulos, owners, integrações, saúde e release; concentrar status dos gates e evidências; atalho seguro na Central; não criar segunda fonte de pendências nem duplicar dashboards financeiros.

**Gate 5: qualificação SaaS (P1 após produto interno estável):** extrair configuração, autenticação e personalização; criar demonstração com tenant fictício, dados sintéticos e recursos isolados; teste negativo cross-tenant, onboarding/offboarding, billing, custos, contratos, monitoramento e recuperação individual.

**Gate 6: oferta comercial:** piloto controlado com empresa parceira e aceite jurídico/segurança, SLAs, contrato, suporte e métricas. Só declarar `SaaS pronto` quando os gates de segurança, recuperação e provisionamento forem comprovados.

**Política de capacidade:** máximo de 2 frentes de engenharia simultâneas conforme GOV-002. Esta ADR é documentação e **não abre terceira frente**. PRs #56 e #58 devem manter trilhas de validação próprias. Nenhum merge ou mudança de infraestrutura decorre automaticamente da aprovação conceitual.

## 10. Critérios objetivos de conclusão global
- [ ] Todo módulo visível na Central e Gestor tem owner, fonte de dados, nível de prova, release, classificação e rollback.
- [ ] 39 aliases oficiais continuam válidos; as 21 famílias de recursos e dependências adicionais têm testes adequados — não só HTML estático.
- [ ] Zero destinos de produção apontam a candidata; homologação publica em ambiente próprio e com autorização separada.
- [ ] Uma versão homologada única por componente; divergências semânticas documentadas, drift bloqueado em CI.
- [ ] Não há cadastro mestre duplicado: pendências, links, regras, releases e dados operacionais apontam seus masters.
- [ ] Financeiro e indicadores conciliam fontes e expõem origem/latência; obras fechadas não sofrem atualização silenciosa.
- [ ] Backup/restore real incluindo fontes externas críticas; rollback testado em notebook e celular.
- [ ] Developer acessível somente por papéis privilegiados, com audit log, sem segredos no frontend.
- [ ] Preparação comercial validada por tenant fictício sem dados da CONSTRU-REI; teste de isolamento, LGPD, custo e provisionamento.
- [ ] Nenhuma remoção/migração/desativação de histórico foi feita apenas porque uma pasta se chama `preview` ou `candidate`.

## 11. Fontes canônicas e limites
- Cadastro de URLs: [`docs/official-links-registry.json`](./official-links-registry.json).
- Regras: [`docs/CANONICAL_RULES_MASTER_INDEX_V1_20261007.md`](./CANONICAL_RULES_MASTER_INDEX_V1_20261007.md).
- Ciclo de ambientes: [`docs/ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md`](./ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md).
- Checkpoint [issue #53](https://github.com/rogeriocibin-alt/construrei-oauth-pages/issues/53).
- PR [#56](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/56) (F00–F09) e [#58](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/58) (auditoria Central inteira).
- Gestor: `gestor-projeto/app.js`, `gestor-projeto/version.json`, `gestor-projeto/project-data.json`, `gestor-projeto/infra-data.json`.
- Cofre: [`docs/CONSTRUREI_CURRENT_STATE.md`](./CONSTRUREI_CURRENT_STATE.md).

**Esta ADR não altera códigos de operação, API, banco, financeiro, GitHub Pages, Supabase, segredos, backup, custos ou credenciais.** Validação de arquitetura proposta não equivale a validação em produção ou autorização de merge.
