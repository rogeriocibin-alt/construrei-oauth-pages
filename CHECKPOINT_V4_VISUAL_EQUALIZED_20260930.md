# CHECKPOINT_V4_VISUAL_EQUALIZED_20260930

## Resultado
Equalização visual V4 concluída em candidate isolado. Nenhuma promoção realizada.

## Candidate
- Branch: `cr-v4-visual-equalization-20260930`
- Commit anterior ao checkpoint final: `435a560bc70ee0b78c18ec507b2f5a9b9310f4af`
- Base: `cr-blue-canonical-option-b-20260930` @ `dd56a1c70712b814d343a9cbdfd94e1f26a9cfa9`

## Referência visual mestre
Dashboard Gerencial V4 homologado:
- Repositório: `rogeriocibin-alt/construrei-dashboard-v4-candidate`
- Ref: `main`
- Blob canônico: `75689d83d829439fe83ca2f74e24637098112dae`
- O mesmo blob permanece intacto em `central-runtime/dashboard/index.html`.

## Tokens aplicados
`#061525`, `#10345e`, `#0a2542`, `#0b2746`, `#081d34`, `#0d5f9e`, `#3a83bb`, `#c99d32`, `#e1c365`, `#244968`, `#315979`, `#f5f7fa`, `#a9b8c9`.

## Módulos equalizados
- HOME / Central
- Academy incorporado à HOME
- APP CONSTRU-REI
- Apresentação
- Central Call
- F00–F09

## Arquivo visual canônico novo
- `central-runtime/ui/cr-v4-canonical-20260930.css`

## Alterações de carregamento
- HOME, APP, Apresentação e Central Call carregam a nova camada V4 ao final do HEAD.
- F00–F09 passaram a carregar `../ui/cr-shell.css` de forma relativa no candidate e, em seguida, a camada V4.
- Dashboard V4 não foi modificado.

## Gates antirregressão executados
- BODY de HOME, APP, Apresentação e Central Call: idêntico ao candidate-base.
- BODY de F00–F09: idêntico ao candidate-base.
- F00–F09: referências de shell convertidas apenas de URL absoluta de produção para caminho relativo equivalente.
- Dashboard V4: blob idêntico ao original homologado.
- Compare do branch mostra somente checkpoint, nova CSS e mudanças no HEAD/meta visual das páginas.
- Nenhuma alteração de JavaScript, eventos, ações, formulários, APIs, rotas, banco, Supabase, Trello, GestãoClick, permissões, cálculos ou dados.

## Publicação
Nenhum ambiente de preview isolado existente foi encontrado para esta branch. O site Netlify disponível `construrei-central-failover-v1` não foi usado porque isso alteraria um ambiente existente. Nenhum site novo foi criado sem autorização explícita.

## Gate final
Validar visualmente em URL de preview isolada antes de qualquer promoção para `main`.
