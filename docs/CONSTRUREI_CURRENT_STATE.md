# CONSTRU-REI — ESTADO MESTRE DA CENTRAL

> Fonte de verdade para retomada entre conversas. Não depender do histórico do chat para identificar a versão atual.

## Estado atual — 2026-10-05

- Projeto: Central CONSTRU-REI
- Repositório: `rogeriocibin-alt/construrei-oauth-pages`
- Versão oficial atual: **Executivo R9 + Agenda Operacional v5 + Identidade de Links v1.2 — OFICIAL**
- Branch homologada: `central-oficial-r9-agenda-v5-links-v1-2-20261005`
- Branch de origem validada: `cr-central-exec-r9-mobilefix-20261004`
- Commit funcional R9: `b42c491dba5a60fa375c2f2609e26c660ebf892e`
- Commit de produção congelada: `0e13035fb93813834a7c98021eeafa8ab4cec81a`
- Checkpoint funcional: `CHECKPOINT_CENTRAL_EXEC_R9_MOBILEFIX_20261004`
- Checkpoint homologado: `CHECKPOINT_CENTRAL_R9_AGENDA_V5_LINKS_V1_2_20261005`
- Pasta de produção congelada: `production/central-homologada-exec-r9-20261004/`
- Fonte viva de pendências: `cr-pendencias-executive-v2-candidate-20261004` v1
- Central oficial `centro-operacoes`: **HOMOLOGADA / OFICIAL — R9 + Agenda v5**; camada pública de Links v1.2 também **OFICIAL**
- Link oficial preservado: `https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes/`
- Destino HOME oficial: `production/central-homologada-exec-r9-20261004/`
- Regra: não alterar a pasta de produção R9, a branch homologada nem o checkpoint homologado; evoluções futuras devem ocorrer em candidata isolada.

## Link oficial atual

https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes/

## Produção homologada R9

https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/central-homologada-exec-r9-20261004/?v=0e13035fb93813834a7c98021eeafa8ab4cec81a

## Link público final da R8 congelada

https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/central-homologada-exec-r8-20261004/?v=78700b8f91025caa6d44d02ef5a6c99d0fef1d43

## Link da Edge candidata R8

https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-agenda-smarttext-candidate-20261004/

## Conteúdo final da R8

1. Medidor principal circular em SVG com avanço operacional ponderado real.
2. Cinco mini-medidores por estágio: concluído, validação, andamento, aguardando e bloqueado/não iniciado.
3. Três mini-gauges compactos para APP, WIZY e ÉDER.
4. Painel de pendências compacto, evitando a lista extensa na visão executiva.
5. APP/SISTEMA mantidos em atualização automática; WIZY e ÉDER permanecem manuais.
6. CSS físico dedicado `executive-meters-r8.css`, reduzindo risco de cache/regressão visual.
7. Identidade visual da Central preservada, sem redesign dos módulos já validados.
8. A métrica representa **avanço operacional por status**, não percentual financeiro nem percentual físico de obra.

## Registro vivo de pendências

- APP/SISTEMA: **AUTOMÁTICO**
- WIZY: **MANUAL**
- ÉDER: **MANUAL**
- Edge de sincronização: `cr-pendencias-auto-sync-20261004`
- Cron: `cr-pendencias-auto-sync-15m` • `*/15 * * * *`
- Documento de arquitetura: `docs/PENDENCIAS_LIVE_REGISTRY_20261004.md`
- Estruturas: `cc_items`, `cc_changes`, `cr_operational_evidence`, `cc_snapshots`
- Regra de segurança: automação não conclui WIZY nem itens dependentes de ação/validação manual do Éder.

## Histórico imediatamente anterior preservado

- Versão anterior mais completa congelada:
  - Commit: `2bb528851c343f6464418fadf36b115285aae916`
  - Branch: `cr-central-most-complete-frozen-20261004-r2`
  - Checkpoint: `CHECKPOINT_CENTRAL_MOST_COMPLETE_20261004_R2`
- Base oficial anterior protegida: `ccc8e8a4cc97df5f7646813178287106657df9b1`

## Regra de continuidade obrigatória

Sempre que houver nova candidata, homologação, promoção, rollback ou checkpoint relevante:

1. Atualizar este arquivo no mesmo ciclo.
2. Registrar link público funcional, branch, commit funcional, commit publicado, checkpoint e estado da oficial.
3. Não usar somente o histórico do chat como fonte de verdade.
4. Consultar este arquivo primeiro ao retomar o projeto.
5. Não promover a Central oficial sem gate de validação humana em notebook + celular.
6. Preservar a versão oficial anterior até a promoção ser efetivamente concluída.
7. Toda promoção futura deve partir da pasta de produção congelada, nunca de pasta de candidata mutável.



## Executivo R9 — correção responsiva dos medidores

- Data: 2026-10-04
- Status: **HOMOLOGADA / CONGELADA / PROMOVIDA PARA A CENTRAL OFICIAL**
- Branch: `cr-central-exec-r9-mobilefix-20261004`
- Commit: `b42c491dba5a60fa375c2f2609e26c660ebf892e`
- Checkpoint: `CHECKPOINT_CENTRAL_EXEC_R9_MOBILEFIX_20261004`
- Preview validada: `preview/central-exec-r9-mobilefix-20261004/`
- Produção congelada: `production/central-homologada-exec-r9-20261004/`
- Commit de produção: `0e13035fb93813834a7c98021eeafa8ab4cec81a`
- Branch homologada: `central-homologada-exec-r9-20261004`
- Checkpoint homologado: `CHECKPOINT_CENTRAL_EXEC_R9_HOMOLOGADA_20261004`
- Edge oficial: `centro-operacoes` v279
- Correção: o arquivo `executive-meters-r8.css` existia, mas não estava referenciado pelo `index.html`; no celular isso fazia o SVG do gauge usar preenchimento preto padrão e removia a composição visual dos cards APP/WIZY/ÉDER.
- A R9 adiciona explicitamente o stylesheet físico dos medidores com cache-buster próprio.
- Nenhuma lógica, dado, API, métrica ou módulo validado foi alterado.
- A R8 congelada em `production/central-homologada-exec-r8-20261004/` permanece intocada.
- Gate: **CONCLUÍDO** — Rogério validou visualmente a R9 no celular e autorizou homologação, congelamento e substituição da Central oficial.

## Última atualização

2026-10-05 — R9 + Agenda v5 + Identidade de Links v1.2 homologadas como conjunto oficial. `Pendências Wizy FLOW`, `Pendências Éder Agora` e `Google Meet • Central` usam aliases amigáveis; Meeting abre primeiro a página homologada interna da Central R9 (`#meeting`). GitHub Pages da v1.2 publicado com sucesso.

## Hotfix Agenda — identificação de equipe — 2026-10-05

- Sintoma observado na Central: cartões de agenda exibiam **"Equipe não identificada"** mesmo quando o Google Agenda continha o responsável no título/descrição (ex.: Rogério e Fabrício).
- Diagnóstico: **não era erro de escrita no GestãoClick**. A Agenda Operacional usa como fonte primária o Google Agenda; o Edge `cr-agenda-executive-v12-1-candidate-20261003` fazia a extração da equipe por uma lista limitada e comparação sensível a acentos.
- Causa objetiva:
  - `Rogério` não existia na lista de nomes reconhecidos.
  - `Fabricio` sem acento não casava com `Fabrício`.
  - participantes do evento não eram incorporados ao texto usado para detecção.
  - a reunião recorrente `Reunião Diária` não tinha equipe explícita e caía no fallback genérico.
- Correção aplicada somente na camada de Agenda/API, sem alterar a pasta de produção R9, layout, GestãoClick ou dados:
  - Edge atualizado de **v1 para v5** mantendo o mesmo slug.
  - BUILD: `CR-AGENDA-EXECUTIVE-V12.5-DAILY-MEETING-CLASSIFICATION-FIX-20261005`.
  - detecção de nomes agora é insensível a acentos;
  - `Rogério` incluído no cadastro de responsáveis reconhecidos;
  - nomes encontrados no título do evento têm prioridade; descrição/local/participantes são usados apenas como fallback, evitando que um contato citado na observação seja tratado como executor;
  - participantes do Google Agenda entram como fonte adicional de identificação quando o título não define a equipe;
  - `Reunião Diária` sem nome explícito passa a ser apresentada como `Toda a equipe`, deixando claro que o compromisso envolve o time completo.
- Hash da fonte anterior do Edge: `23c0ab5649c517f111574efca73eaaf85b2c9d16d80bf4beaa6c473c2e6fd5b7`.
- Hash da fonte corrigida final do Edge: `d283edaf9415b754ea18814d52941c26e16bcca5f0e5a4178b51049656ea028a`.
- Regra antirregressão: nenhum arquivo em `production/central-homologada-exec-r9-20261004/` foi modificado neste hotfix.


### Correção v5 — causa real da Reunião Diária

- Foram conferidos os dois eventos recorrentes reais no Google Agenda:
  - 2026-10-05 20:00 — `Reunião Diária`
  - 2026-10-06 20:00 — `Reunião Diária`
- A descrição contém a expressão `ações executadas`.
- O classificador antigo testava `EXECU` antes de `REUNI`, portanto a palavra `executadas` fazia a reunião ser classificada incorretamente como `EXECUÇÃO`.
- Por isso o fallback `Toda a equipe`, que dependia do tipo `REUNIÃO`, nunca era acionado.
- Correção v5:
  - reunião/alinhamento agora tem prioridade sobre execução no classificador;
  - título `Reunião Diária` força explicitamente o tipo `REUNIÃO`;
  - quando não há nomes individuais, força `Toda a equipe`;
  - a regra vale igualmente para hoje, amanhã e futuras ocorrências recorrentes.
- Nenhum arquivo visual da R9 foi alterado.


## Oficialização — R9 + Agenda v5 — 2026-10-05

- Status: **OFICIAL / HOMOLOGADA / CONGELADA**
- Interface oficial preservada: `production/central-homologada-exec-r9-20261004/`
- Agenda operacional oficial: Edge `cr-agenda-executive-v12-1-candidate-20261003` **v5**
- BUILD Agenda: `CR-AGENDA-EXECUTIVE-V12.5-DAILY-MEETING-CLASSIFICATION-FIX-20261005`
- Hash Edge Agenda v5: `d283edaf9415b754ea18814d52941c26e16bcca5f0e5a4178b51049656ea028a`
- Snapshot da fonte: `snapshots/edge-functions/cr-agenda-executive-v12-1-candidate-20261003/v5/index.ts`
- Checkpoint lógico: `CHECKPOINT_CENTRAL_R9_AGENDA_V5_20261005`
- Regra: esta combinação de interface R9 + Agenda v5 passa a ser a referência oficial para rollback e continuidade.
- Próxima frente isolada: **Identidade de Links Oficiais v1**, sem alterar a Central oficial até validação humana dos links.


## Identidade de Links Oficiais v1.2 — OFICIAL

- Data: 2026-10-05
- Status: **OFICIAL / HOMOLOGADA / CONGELADA**
- Objetivo: substituir URLs de uso humano por aliases estáveis, claros e autoexplicativos, mantendo endpoints técnicos intactos.
- Painel oficial: `https://rogeriocibin-alt.github.io/construrei-oauth-pages/links-oficiais/`
- Registro estruturado: `docs/official-links-registry.json`
- Quantidade: **38 aliases amigáveis**
- Exemplos:
  - `/central/`
  - `/app-construrei/`
  - `/checklist-operacional/`
  - `/documentacao/`
  - `/gestao-financeira/`
  - `/apresentacao/`
- Regra arquitetural: **não renomear, apagar nem quebrar endpoints técnicos**. Os aliases são uma camada pública de identidade e redirecionam para destinos canônicos.
- O caminho legado `/central/`, que continha uma Central estática antiga, foi convertido em alias da Central oficial atual para eliminar risco de acesso à versão obsoleta.
- Gate humano: **CONCLUÍDO** — Rogério autorizou a homologação em 05/10/2026 às 08:50.
- GitHub Pages: publicação v1.2 confirmada com sucesso no HEAD `8dc210ea07d629f0a9ef09efaf838a17848b8b49`.
- Branch oficial desta combinação: `central-oficial-r9-agenda-v5-links-v1-2-20261005`.
- Checkpoint homologado: `CHECKPOINT_CENTRAL_R9_AGENDA_V5_LINKS_V1_2_20261005`.
- Registro de homologação: `docs/HOMOLOGACAO_LINK_IDENTITY_V1_2_20261005.md`.


### Ajustes v1.1 — Wizy FLOW, Éder Agora e Meeting

- `/pendencias-wizy-flow/` — nome oficial humano: **Pendências Wizy FLOW**.
- `/pendencias-eder-agora/` — nome oficial humano: **Pendências Éder Agora**.
- `/meeting/` — não aponta mais diretamente para `meet.google.com`; agora abre `centro-operacoes#meeting`, preservando a página de Meeting homologada dentro da Central.
- Aliases legados `/wizy-flow/` e `/eder-agora/` foram mantidos como compatibilidade, redirecionando para os novos aliases.
- Registro de links atualizado para `LINK-IDENTITY-V1.1-20261005`.


### Ajustes v1.2 — Meeting homologado e promoção

- `/google-meet-central/` é o alias humano oficial do Meeting.
- `/meeting/` permanece como compatibilidade e aponta ao mesmo destino.
- Ambos abrem `production/central-homologada-exec-r9-20261004/?v=meeting-r9#meeting` antes de qualquer acesso à sala externa.
- O painel de Links Oficiais v1.2 e o registro estruturado passaram de candidata para **OFICIAL / HOMOLOGADA / CONGELADA**.
- A Agenda v5 foi reconferida no Supabase e permanece ativa com hash `d283edaf9415b754ea18814d52941c26e16bcca5f0e5a4178b51049656ea028a`.
- Nenhuma alteração adicional foi feita na interface visual R9 ou na lógica validada da Agenda v5 durante esta promoção.


## Gestor do Projeto V1.1.2 + Links Oficiais v1.3 — 2026-10-05

- Status: **OFICIAL / HOMOLOGADA / CONGELADA**
- Build: `CR-PM-V1.1.2-LINKS-OFFICIAL-20261005`
- Branch: `cr-project-manager-v1-1-2-links-official-20261005`
- Checkpoint: `CHECKPOINT_PROJECT_MANAGER_V1_1_2_LINKS_OFFICIAL_20261005`
- Link estável do Gestor: `https://rogeriocibin-alt.github.io/construrei-oauth-pages/gestor-projeto/`
- Link estável de Links Oficiais: `https://rogeriocibin-alt.github.io/construrei-oauth-pages/links-oficiais/`
- Mudança: botão/card **Links Oficiais** incorporado à Home do Gestor, junto aos acessos principais de governança.
- Identidade de Links atualizada para **v1.3**, incluindo o Gestor no grupo Núcleo.
- Regra: os aliases públicos existentes da Central, APP, Meeting, Wizy FLOW e Éder Agora foram preservados; nenhuma rota operacional da equipe foi trocada.
- Central R9 + Agenda v5 permanecem congeladas na versão oficial anterior; esta promoção altera somente o Gestor/registro de links.


## Hotfix Gestor V1.1.2 H1 — escopo estável / cache — 2026-10-05

- Motivo: no celular, mesmo após desinstalar o PWA, a Home podia continuar exibindo o bundle anterior sem o card **Links Oficiais**.
- Causa confirmada: o alias estável `/gestor-projeto/` redirecionava para `preview/project-manager-v1-candidate-20261003/`; o Service Worker/cache dessa pasta de preview podia continuar controlando a navegação.
- Correção H1: `/gestor-projeto/` agora serve diretamente o bundle completo do Gestor, no próprio escopo estável.
- Build: `CR-PM-V1.1.2-H1-STABLE-SCOPE-20261005`.
- Checkpoint pré-hotfix: `checkpoint-gestor-v1-1-2-pre-stable-scope-hotfix-20261005` em `f9c8e442add5e909f2d73998993a8ac86e300cee`.
- Checkpoint lógico: `CHECKPOINT_PROJECT_MANAGER_V1_1_2_H1_STABLE_SCOPE_20261005`.
- O card **Links Oficiais** permanece na Home e aponta para `/links-oficiais/`.
- Service Worker H1: cache próprio do escopo estável, ativação após instalação completa e estratégia network-first com fallback offline para navegação/arquivos principais.
- Registro `official-links-registry.json` atualizado para apontar o Gestor ao runtime estável direto, não ao preview legado.
- Central R9 + Agenda v5 e os demais aliases operacionais não foram alterados.
- Validação humana no celular: **PENDENTE** após publicação.


## Hotfix Gestor V1.1.2 H2 — Links Oficiais visíveis — 2026-10-05

- Evidência visual: no celular, o Gestor abria em V1.1.2 mas o bloco **Links Oficiais** não aparecia.
- Causa real: `executive-dashboard.css` continha a regra `#view-now>.owner-hub { display:none!important }`, escondendo deliberadamente o bloco que continha os acessos do proprietário.
- Correção: removida somente a ocultação de `owner-hub`; as regras que escondem o dashboard legado duplicado foram preservadas.
- A Home agora mantém o bloco **Seu acesso único ao CONSTRU-REI** visível.
- O Dashboard Executivo também ganhou ação direta **Links Oficiais ↗**.
- Rótulo interno do Dashboard Executivo corrigido de V1.1.1 para **V1.1.2**.
- Build: `CR-PM-V1.1.2-H2-LINKS-VISIBLE-20261005`.
- Checkpoint de rollback anterior: `checkpoint-gestor-v1-1-2-h1-before-owner-links-visibility-fix-20261005`.
- Checkpoint lógico: `CHECKPOINT_PROJECT_MANAGER_V1_1_2_H2_LINKS_VISIBLE_20261005`.
- Central R9, Agenda v5, APP e demais rotas operacionais permanecem intocados.
- Validação humana no celular: **PENDENTE**.


## Hotfix Gestor V1.1.2 H3 — botão único da Central de Links — 2026-10-05

- Solicitação: reduzir a área de acessos do Gestor, evitando uma grade extensa com todos os links.
- Solução: a Home passa a exibir **um único botão compacto “Central de Links”**.
- A lista completa permanece exclusivamente em `/links-oficiais/`, que continua sendo o diretório mestre homologado.
- O botão duplicado de Links Oficiais no cabeçalho do Dashboard Executivo foi removido para manter apenas uma entrada.
- Build: `CR-PM-V1.1.2-H3-SINGLE-LINKS-BUTTON-20261005`.
- Checkpoint de rollback: `checkpoint-gestor-v1-1-2-h2-before-single-links-button-20261005`.
- Checkpoint lógico: `CHECKPOINT_PROJECT_MANAGER_V1_1_2_H3_SINGLE_LINKS_BUTTON_20261005`.
- Central R9, Agenda v5, APP e destinos homologados permanecem inalterados.
- Validação humana no celular: **PENDENTE**.


## Oficialização final — Gestor V1.1.2 H3 — 2026-10-05

- Status: **OFICIAL / HOMOLOGADA / CONGELADA**
- Build: `CR-PM-V1.1.2-H3-SINGLE-LINKS-BUTTON-20261005`
- Branch oficial: `cr-project-manager-v1-1-2-h3-official-20261005`
- Checkpoint homologado: `CHECKPOINT_PROJECT_MANAGER_V1_1_2_H3_OFFICIAL_20261005`
- Commit oficial congelado: `dce58ac5212af0d0564476367d099e3a9730d9de`
- Link estável: `https://rogeriocibin-alt.github.io/construrei-oauth-pages/gestor-projeto/`
- Gate humano: **CONCLUÍDO** — Rogério aprovou a H3 com botão único **Central de Links** e autorizou oficialização antes da reinstalação do PWA no celular.
- Escopo congelado: Home compacta com um único botão para o diretório mestre `/links-oficiais/`; sem grade de acessos e sem botão duplicado no cabeçalho executivo.
- Central R9, Agenda v5, APP e demais destinos permanecem preservados.
- Registro de homologação: `docs/HOMOLOGACAO_GESTOR_V1_1_2_H3_20261005.md`.


## Hotfix Gestor V1.1.2 H4 — instalabilidade PWA no Chrome — 2026-10-05

- Evidência: Chrome Android exibiu **“Não é possível instalar o app”** ao tentar instalar o Gestor.
- A captura também mostrava o navegador em estado **Off-line**; a instalação WebAPK requer conectividade no momento da instalação.
- Diagnóstico adicional: o manifesto H3 declarava somente um ícone SVG com `sizes: "any"`; os critérios do Chrome exigem ícones declarados em **192x192** e **512x512**.
- Correção H4: manifesto passou a declarar ícones 192x192 e 512x512 explicitamente e `prefer_related_applications: false`.
- Service Worker/cache atualizado para incluir os ícones de instalação.
- Build: `CR-PM-V1.1.2-H4-PWA-INSTALLABLE-20261005`.
- Checkpoint anterior: `checkpoint-gestor-v1-1-2-h3-before-pwa-installability-fix-20261005`.
- Checkpoint lógico: `CHECKPOINT_PROJECT_MANAGER_V1_1_2_H4_PWA_INSTALLABLE_20261005`.
- Regra: H3 visual permanece congelada; esta é correção técnica exclusiva de instalabilidade.
- Validação humana: **PENDENTE**, com Chrome online.


## Oficialização final — Gestor V1.1.2 H4 — 2026-10-05

- Status: **OFICIAL / HOMOLOGADA / CONGELADA**
- Build: `CR-PM-V1.1.2-H4-PWA-INSTALLABLE-20261005`
- Branch oficial: `cr-project-manager-v1-1-2-h4-official-20261005`
- Checkpoint homologado: `CHECKPOINT_PROJECT_MANAGER_V1_1_2_H4_OFFICIAL_20261005`
- Commit oficial congelado H4: `59842d9db0360666ea63a814729bdbff6fb3abf0`
- Link estável: `https://rogeriocibin-alt.github.io/construrei-oauth-pages/gestor-projeto/`
- Gate humano: **CONCLUÍDO** — Rogério confirmou que a H4 está correta e autorizou finalizar o processo em 05/10/2026 às 13:25.
- PWA móvel: **PASS / confirmado pelo proprietário**.
- Escopo congelado: H3 visual (botão único **Central de Links**) + correção H4 de instalabilidade (manifesto/ícones/Service Worker).
- Rollback oficial: H3 preservada em `CHECKPOINT_PROJECT_MANAGER_V1_1_2_H3_OFFICIAL_20261005`.
- Central R9, Agenda v5, APP e demais destinos permanecem preservados.
- Registro de homologação: `docs/HOMOLOGACAO_GESTOR_V1_1_2_H4_20261005.md`.


## Candidata isolada — Central Operacional × Gestor — 2026-10-05

- Status: **CANDIDATE / NOT PROMOTED**.
- Build: `CR-CENTRAL-OPERATION-ONLY-CANDIDATE-20261005`.
- Preview: `https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/central-operation-only-candidate-20261005/`.
- Base: R9 oficial congelada; pasta de produção permanece intocada.
- Objetivo: a Central fica com a operação da empresa; governança, desenvolvimento e infraestrutura ficam no Gestor do Projeto.
- Mapa candidato de aliases: `docs/official-links-operation-boundary-candidate-20261005.json`.
- Documento de escopo/auditoria: `docs/CENTRAL_OPERATION_ONLY_CANDIDATE_20261005.md`.
- Checkpoint pré-execução: `checkpoint-before-central-operation-only-20261005`.
- Gate: validar celular + notebook antes de qualquer promoção.
- Oficial vigente permanece inalterada durante esta candidata.

## Regra de roteamento de agentes — obrigatória

- **Bio / inteligência-orquestrador:** interpreta a solicitação, define escopo, prioridade, guardas, validação e direciona ao agente competente; não deve assumir execução técnica especializada quando houver agente técnico responsável.
- **CR Assertivo:** execução técnica de código, infraestrutura, Git/Supabase, correções, deploy, candidata, checkpoint e tarefas de engenharia autorizadas.
- **Bio Gestor:** operação F00–F09, orçamentos, textos operacionais, CRM e gestão de fluxo, sem assumir engenharia de infraestrutura.
- Regra: o comando do proprietário deve ser roteado automaticamente por assunto, preservando alçadas e evitando que um agente execute atividade fora de sua competência.
- Exceção: somente quando não existir agente/ferramenta responsável disponível, o orquestrador deve declarar a limitação em vez de simular que outro agente executou.
