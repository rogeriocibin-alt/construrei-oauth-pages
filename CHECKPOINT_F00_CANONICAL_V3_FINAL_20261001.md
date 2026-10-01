# CHECKPOINT — F00 CANONICAL V3 FINAL — 2026-10-01

## Frente
- Branch: `cr-f00-f09-canonical-ui-20261001`
- Base de comparação funcional: `01bbff7af8525132bb138da1a6afcd14469b0088`
- Status: aguardando homologação de Rogério
- Escopo: F00 somente
- F01–F09: não alterados

## Commits principais
- Logo APP no hero: `845e0d1ee2183eece6bd9d5857abcba7fa51ec33`
- Integração visual logo APP: `81d9e76f1a16f622601a83b895ef23ac33f55d63`
- Final polish V3: `0e016da0b6cf5c1aaeb603a3e1cf1d753de939bb`
- Preview V3: `05319399ae30198d7b8a81276f9409e023659dad`

## Alterações V3
- Logo oficial APP aplicada também no shell superior via CSS.
- Hero compactado.
- KPIs mais densos.
- Esteira F00–F09 refinada com conectores visuais.
- Textarea inicial reduzido para melhorar conteúdo above-the-fold.
- Contraste dos textos secundários aumentado.
- Estados hover/active da fila refinados sem alterar JavaScript.
- Ajustes finais notebook/mobile.

## Antirregressão
- SCRIPT_IDENTICAL=true
- ID_SET_IDENTICAL=true
- API_IDENTICAL=true
- Endpoint mantido: cr-f00-intake
- F00 → F01 preservado
- Produção funcional não alterada

## Preview
https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/f00-canonical-ui-20261001/?v=05319399

## Gate
NÃO propagar para F01–F09 até homologação explícita de Rogério.
