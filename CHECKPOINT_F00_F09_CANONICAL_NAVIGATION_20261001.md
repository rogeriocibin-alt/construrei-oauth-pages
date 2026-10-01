# CHECKPOINT — F00–F09 CANONICAL NAVIGATION — 2026-10-01

Status: CANDIDATE INTERLIGADO — AGUARDANDO HOMOLOGAÇÃO GLOBAL

## Problema resolvido
A navegação anterior usava o cr-shell.js oficial, que gerava links para o roteador de produção e podia levar o usuário a versões visuais antigas/diferentes dos fluxos.

## Solução
- Criado shell candidate dedicado: central-runtime/ui/cr-shell-candidate-20261001.js
- Criado/publicado equivalente em preview/_shared/cr-shell-candidate-20261001.js
- F00–F09 candidate ligados ao mesmo shell.
- F00–F09 previews ligados ao mesmo shell.
- Links F00–F09 no preview permanecem dentro de /preview/fXX-canonical-ui-20261001/
- Links visuais antigos "F0X atual" são ocultados/neutralizados no candidate.
- Adicionada navegação visual Anterior / Central / Próximo.
- Navegação visual não dispara conclusão funcional de etapa.
- Parâmetros da URL são preservados na navegação quando presentes, exceto cache-buster v.
- Etapa atual permanece destacada e é centralizada na esteira mobile.
- Uma única identidade/shell/folha canônica compartilhada.

## Central candidate
/construrei-oauth-pages/preview/visual-hierarchy-target-refinement-20261001/

## Previews interligados
- F00: /preview/f00-canonical-ui-20261001/
- F01: /preview/f01-canonical-ui-20261001/
- F02: /preview/f02-canonical-ui-20261001/
- F03: /preview/f03-canonical-ui-20261001/
- F04: /preview/f04-canonical-ui-20261001/
- F05: /preview/f05-canonical-ui-20261001/
- F06: /preview/f06-canonical-ui-20261001/
- F07: /preview/f07-canonical-ui-20261001/
- F08: /preview/f08-canonical-ui-20261001/
- F09: /preview/f09-canonical-ui-20261001/

## Validação pública
Teste HTTP executado em F00–F09:
- status=200 em todos
- cr-shell-candidate-20261001.js presente em todos
- cr-flow-canonical-20261001.css presente

## Preservação funcional
- Nenhuma API/Supabase/schema alterado.
- Nenhum endpoint de negócio alterado.
- Nenhum ID funcional removido.
- Nenhum script de negócio reescrito.
- Alteração intencional apenas da referência do shell/navegação candidate.
- Produção oficial não promovida.

## Próximo gate
Homologar navegação e identidade em notebook e mobile.
Após aprovação, preparar promoção controlada para produção sem misturar rotas candidate e production.
