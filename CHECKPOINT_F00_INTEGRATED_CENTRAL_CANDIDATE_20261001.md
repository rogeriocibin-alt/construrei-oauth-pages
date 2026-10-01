# CHECKPOINT_F00_INTEGRATED_CENTRAL_CANDIDATE_20261001

Status: CANDIDATO ISOLADO — INTEGRAÇÃO CENTRAL ↔ F00 MONTADA, NÃO PROMOVIDA
Data: 2026-10-01

## Base canônica preservada

Central homologada:
- commit canônico: `92ef8f27d71ac176abc6452df165a048c4405d60`
- branch: `cr-central-canonical-approved-20261001`
- branch de evolução usada como base: `cr-central-next-20261001`
- HTML aprovado usado como fonte: `preview/central-approved-router-candidate-20261001/index.html`
- blob SHA do HTML: `b90367bed503245a5bea9b4db4f15b46622ab6b2`

A branch canônica e o endpoint oficial `centro-operacoes` NÃO foram alterados.

## Branch candidata

`cr-f00-central-integration-candidate-20261001`

A branch foi criada a partir de `cr-central-next-20261001`.

Arquivos de integração rastreáveis:
- `candidate/f00-central-integration/central-f00-override-20261001.js`
- `candidate/f00-central-integration/f00-central-bridge-20261001.js`

## Backend F00 preservado

Backend candidato existente:
- function: `cr-f00-intake-logic-recovery-candidate-20261001`
- version: 6
- hash: `269ca225abd5a304c49f36bb014e5aa6ca7e87f45a3c3233c5af4294c157c649`
- engine: `F00_INTELLIGENCE_V8_CANDIDATE`
- tabelas exclusivas candidate:
  - `cr_f00_cases_candidate_20261001`
  - `cr_f00_events_candidate_20261001`
  - `cr_f00_files_candidate_20261001`
- handoff F00 → F01 continua SIMULADO e NÃO grava no F01 real.

Backend oficial `cr-f00-intake` version 18 / hash `8c115007001fc9468d86d5b8203a1d00ba85d18005181ce2333e8e00bcb8ab5e` não foi alterado.

## F00 integrado — UI candidata

Function:
`cr-f00-central-integration-ui-candidate-20261001`

Version: 1

Hash:
`629a6603a2ea44e37fe05d8c9c1c1f3d708badd67c0c3a9c0cf74c897fea245d`

URL:
`https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-f00-central-integration-ui-candidate-20261001`

Características:
- preserva o HTML/UI da candidata validada do F00;
- usa exclusivamente o backend candidato `cr-f00-intake-logic-recovery-candidate-20261001`;
- botão/logo de retorno à Central é reescrito para a Central candidata integrada;
- navegação F01 aponta para a UI canônica candidata F01;
- não altera produção.

## Central integrada — candidata

Function:
`cr-central-f00-integration-candidate-20261001`

Version: 1

Hash:
`f34a7add0dcb52b8555b70e33b515a59c4621c63dca39605017938a8afe102cb`

URL:
`https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-f00-integration-candidate-20261001`

Fonte visual:
HTML canônico aprovado blob `b90367bed503245a5bea9b4db4f15b46622ab6b2`.

Alteração funcional isolada:
- `DATA.links.f00` → F00 integrado candidate;
- `DATA.links.novo_chamado` → F00 integrado candidate;
- item `F00` de `DATA.flows` → F00 integrado candidate.

Nenhum redesign da Central foi feito.

## Validações estáticas realizadas

PASS:
- branch candidata criada a partir de `cr-central-next-20261001`;
- HTML fonte da Central corresponde ao blob homologado;
- F00 UI integrada continua apontando para o backend candidato;
- bridge de retorno aponta para a Central candidata integrada;
- F01 candidato definido para navegação;
- ambas as novas Edge Functions estão ACTIVE;
- nenhuma alteração no endpoint oficial `centro-operacoes`;
- nenhuma alteração no backend oficial `cr-f00-intake`;
- nenhuma alteração em F01–F09 de produção;
- production mutation durante esta integração: 0 conhecida.

## Testes herdados do backend candidato

Checkpoint anterior registra:
- caso real obrigatório: 15/15 PASS;
- matriz ampliada: 18/18 PASS;
- ciclo completo candidate: PASS;
- create 201;
- update 200;
- get 200;
- ready=true;
- missing=[];
- release simulado 200;
- simulated=true;
- cleanup 0 registros sintéticos.

## Gate visual/runtime desta integração

Não promovido.

A validação visual/runtime final da NOVA integração candidata ainda precisa de abertura humana/navegador conectado. Durante esta execução:
- Opera Browser Connector estava desconectado;
- dispositivo Remote Desktop `Rogerio-2022` estava offline;
- o navegador de pesquisa não possui acesso direto às Edge Functions privadas do projeto.

Por isso nenhuma alegação de teste visual foi inventada.

## Gate de promoção

NÃO promover enquanto não forem validados no link candidato:
1. Central abre sem regressão;
2. F00 abre pela Central;
3. retorno F00 → Central funciona;
4. responsividade notebook/mobile;
5. handoff candidato permanece simulado;
6. nenhuma rota antiga reaparece.

## Regra de continuidade

Não procurar outra versão.
Não reconstruir o F00.
Não alterar a Central canônica.
Evoluir somente deste checkpoint candidato após validação.
