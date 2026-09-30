# CHECKPOINT_BLUE_CANONICAL_RESTORED_20260930

## Resultado
OPÇÃO B aplicada em candidate isolado, sem promoção.

## Candidate
- Branch: `cr-blue-canonical-option-b-20260930`
- Base funcional preservada: `cr-identity-reference-v2-20260930` @ `86f171cc1a4f6442cf0e4ba27705580e6338c9d5`
- `main` preservado: `91b29928bfcc5619c3f741b3ab96cbbe67cf1b88`
- Fonte visual canônica: `checkpoint-pre-identity-20260930` @ `3b3751ddaca707ab44629b108f7f753d57c0d76d`

## Restauração executada
As páginas que haviam recebido a camada visual experimental foram restauradas exatamente, por blob, para a versão azul canônica da fonte homologada:

- `central-runtime/app/index.html`
- `central-runtime/dashboard/index.html`
- `central-runtime/f00/index.html`
- `central-runtime/f01/index.html`
- `central-runtime/f02/index.html`
- `central-runtime/f03/index.html`
- `central-runtime/f04/index.html`
- `central-runtime/f05/index.html`
- `central-runtime/f06/index.html`
- `central-runtime/f07/index.html`
- `central-runtime/f08/index.html`
- `central-runtime/f09/index.html`
- `central/call.html`
- `central/index.html`
- `central/presentation.html`

## Tratamento do stylesheet experimental
`central-runtime/ui/cr-product-design-20260930.css` foi mantido fisicamente no candidate apenas como artefato inerte de rollback. As páginas restauradas não devem mais carregar essa camada experimental.

## Proteções confirmadas
- Nenhuma alteração em `main`/produção.
- Nenhuma migration.
- Nenhuma alteração de banco, Supabase, RLS ou Edge Functions.
- Nenhuma alteração de Trello, GestãoClick, APIs, autenticação, permissões, rotas, cálculos ou dados.
- Nenhuma reimplementação funcional de F00–F09.
- Nenhuma promoção automática.

## Próximo gate
Validar visualmente o candidate em desktop e mobile. Somente após aprovação expressa poderá existir promoção.
