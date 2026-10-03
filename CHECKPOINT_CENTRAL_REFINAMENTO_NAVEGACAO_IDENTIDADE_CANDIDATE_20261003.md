# CHECKPOINT — CENTRAL REFINAMENTO NAVEGAÇÃO + IDENTIDADE — 03/10/2026

- Base visual preservada: commit main 09b4dc827cb4132c140d6bbdbf25e7fbb38a222b
- Branch: cr-central-refinamento-navegacao-identidade-20261003
- Canonical/endpoint oficial alterados: NÃO
- Redesign: NÃO
- Whole-file restoration from legacy: NÃO

## Correções
- Removidos location.assign diretos do shell.
- APP passa pelo registro canônico único.
- Destinos externos abrem isolados; a candidata atual permanece como contexto de retorno.
- Botão/estado interno usa history.replaceState, sem empilhar ancestrais da Central.
- crHeroLogo, antes sem src, herda a fonte da logo já embutida no shell.
- Arte institucional já existente (skyline + slogan + azul) reabilitada no mobile.
- Nenhuma versão antiga foi copiada como base.

## Auditoria
- CR_CANONICAL_ROUTE_REGISTRY: 1 definição.
- location.assign restante: 0.
- APIs V12.x mantidas apenas como fontes atuais de dados; não classificadas como shell legado.
- Assets binários separados de logo não existem na árvore auditada; por isso foi preservada a fonte embutida já existente, sem inventar nova marca.

## Gate
CANDIDATA PRONTA PARA VALIDACAO VISUAL DO ROGERIO
NÃO PROMOVER SEM HOMOLOGAÇÃO EXPLÍCITA.
