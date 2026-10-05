# CONSTRU-REI — ESTADO MESTRE DA CENTRAL

> Fonte de verdade para retomada entre conversas. Não depender do histórico do chat para identificar a versão atual.

## Estado atual — 2026-10-04

- Projeto: Central CONSTRU-REI
- Repositório: `rogeriocibin-alt/construrei-oauth-pages`
- Versão oficial atual: **Executivo R9 — medidores modernos + correção responsiva**
- Branch homologada: `central-homologada-exec-r9-20261004`
- Branch de origem validada: `cr-central-exec-r9-mobilefix-20261004`
- Commit funcional R9: `b42c491dba5a60fa375c2f2609e26c660ebf892e`
- Commit de produção congelada: `0e13035fb93813834a7c98021eeafa8ab4cec81a`
- Checkpoint funcional: `CHECKPOINT_CENTRAL_EXEC_R9_MOBILEFIX_20261004`
- Checkpoint homologado: `CHECKPOINT_CENTRAL_EXEC_R9_HOMOLOGADA_20261004`
- Pasta de produção congelada: `production/central-homologada-exec-r9-20261004/`
- Fonte viva de pendências: `cr-pendencias-executive-v2-candidate-20261004` v1
- Central oficial `centro-operacoes`: **HOMOLOGADA E PROMOVIDA — v279**
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

2026-10-05 — Hotfix cirúrgico da Agenda aplicado no Edge de leitura: identificação de Rogério/Fabrício corrigida, comparação sem dependência de acentos e fallback específico para Reunião Diária. Produção R9 e layout permaneceram congelados e intocados.

## Hotfix Agenda — identificação de equipe — 2026-10-05

- Sintoma observado na Central: cartões de agenda exibiam **"Equipe não identificada"** mesmo quando o Google Agenda continha o responsável no título/descrição (ex.: Rogério e Fabrício).
- Diagnóstico: **não era erro de escrita no GestãoClick**. A Agenda Operacional usa como fonte primária o Google Agenda; o Edge `cr-agenda-executive-v12-1-candidate-20261003` fazia a extração da equipe por uma lista limitada e comparação sensível a acentos.
- Causa objetiva:
  - `Rogério` não existia na lista de nomes reconhecidos.
  - `Fabricio` sem acento não casava com `Fabrício`.
  - participantes do evento não eram incorporados ao texto usado para detecção.
  - a reunião recorrente `Reunião Diária` não tinha equipe explícita e caía no fallback genérico.
- Correção aplicada somente na camada de Agenda/API, sem alterar a pasta de produção R9, layout, GestãoClick ou dados:
  - Edge atualizado de **v1 para v2** mantendo o mesmo slug.
  - BUILD: `CR-AGENDA-EXECUTIVE-V12.2-TEAM-PARSER-HOTFIX-20261005`.
  - detecção de nomes agora é insensível a acentos;
  - `Rogério` incluído no cadastro de responsáveis reconhecidos;
  - participantes do Google Agenda entram como fonte adicional de identificação;
  - `Reunião Diária` sem nome explícito passa a ser apresentada como `Equipe CONSTRU-REI`.
- Hash da fonte anterior do Edge: `23c0ab5649c517f111574efca73eaaf85b2c9d16d80bf4beaa6c473c2e6fd5b7`.
- Hash da fonte corrigida do Edge: `4d16619bd0badcf99a69fb8dd180cd1385096e3b7db1c36e834fa9914b20015d`.
- Regra antirregressão: nenhum arquivo em `production/central-homologada-exec-r9-20261004/` foi modificado neste hotfix.
