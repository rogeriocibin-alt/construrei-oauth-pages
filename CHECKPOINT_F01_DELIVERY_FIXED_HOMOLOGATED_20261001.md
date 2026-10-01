# CHECKPOINT — F01 DELIVERY FIXED / HOMOLOGATED — 2026-10-01

Status: F01 público corrigido e protegido contra entrega stale do link oficial.

Checkpoint PRE:
- CHECKPOINT_PRE_F01_DELIVERY_FIX_20261001
- base: d858e5397f1155ca7d2e32e82cc60b376d3164d8

Causa raiz:
- O arquivo oficial no Git já estava correto.
- A entrega pública do GitHub Pages/Fastly utiliza Cache-Control: max-age=600.
- O vídeo de Rogério evidenciou conteúdo F01 antigo sendo entregue no caminho oficial apesar do blob correto já estar promovido.
- A correção não redesenha nem altera o F01; ela fixa o destino oficial do router em uma URL de release versionada.

Correção aplicada:
- central-atendimento atualizado de v147 para v148.
- ÚNICA intervenção lógica: os dois destinos F01 (PRIMARY e FALLBACK) passaram de:
  https://rogeriocibin-alt.github.io/construrei-oauth-pages/central-runtime/f01/
  para:
  https://rogeriocibin-alt.github.io/construrei-oauth-pages/central-runtime/f01/?cr_release=f01-delivery-fixed-d858e539-20261001
- demais rotas F00/F02-F09 preservadas.
- centro-operacoes não alterado.
- F01 HTML não alterado.
- backend F01 não alterado.
- cr-flow-runtime-v2 não alterado.

Router final:
- central-atendimento version: 148
- hash: 33815dd5efcf3022b360dfcbeae30b186005de9758663f23b4249af1b2824d87

Gates de conteúdo público — PASS:
- central-runtime/f01/ -> HTTP 200
- central-atendimento?mode=f01 -> HTTP 200
- centro-operacoes?open=f01 -> HTTP 200
- todos contêm: F01 — Atendimento & Qualificação
- todos contêm: CR-F01-CANONICAL-HOMOLOGATED-20261001
- todos contêm: cr-f01-canonical-runtime
- nenhum contém: F01 — Qualificar & Definir Rota
- nenhum contém: botão F01 atual
- router oficial sem query já redireciona para cr_release=f01-delivery-fixed-d858e539-20261001
- centro-operacoes?open=f01 herda a rota versionada.

Proteções:
- F00: c5d968b92659b87a3e6276dcef29075e49311cfc
- F01: c88a0cbafd82394449d49c3ff6e54fbb4793ed42
- F02: a25851e1e91a4f09c21cae1c3d45c6f248f5917d
- F09: 0978b6565c9910df88767d0525fcc69e8cc68ea2
- CSS fluxo: b56caeb368316f6b128a8476f6bdbbeb0b319457
- shell canônico: 2288f552ec5c6cd1471051a3bcc0d1e23e217e23
- cr-f01-canonical-runtime: v1 / b21e449bb43a594ce9d7781a3476039c289d1e41938400fc3b5803fd7733b40e
- cr-flow-runtime-v2: v9 / 868a3cb7a27519d17e5849d117385dac40d29b033d11df47cb0831be0499b3a5
- centro-operacoes: v274 / 26fd6d54b3d7880b00d934722d3df06b762e5a45011e39798e4d6d2919f52bac

Dados:
- cr_flow_handoffs: 32
- cr_flow_events: 53
- F01 ativos: 4
- nenhuma alteração de dados nesta correção.

Regra de homologação:
O F01 só é considerado homologado quando o conteúdo público efetivamente servido corresponder à interface aprovada, e não apenas quando o Git contiver o blob correto.

FORWARD ONLY.
NÃO RESTAURAR VERSÕES ANTERIORES.
NÃO INICIAR F02 SEM NOVA AUTORIZAÇÃO DE ROGÉRIO.
