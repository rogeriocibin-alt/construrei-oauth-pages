# CHECKPOINT_HOME_CANONICAL_20261001

## Baseline homologado
- Commit Git: `74dd646210d3194319f0eabd75ca1ed9e6002f6a`
- Branch congelada: `cr-home-canonical-20261001`
- Artefato principal: `preview/visual-hierarchy-target-refinement-20261001/index.html`
- Blob do HTML no checkpoint: `4b01352fcab11ecb072dc5aee4c3f254b56d1c6d`

## Estado visual protegido
A composição da HOME é considerada canônica: sidebar, topbar, hero, Hoje na Operação, Acessos Rápidos, Esteira F00→F09, Pendências Vivas e Desenvolvimento/Saúde Técnica.

## Resoluções de referência
- 1366×768
- 1440×900
- 1536×864
- 1920×1080
- 390×844
- 430×932

## Dependências visíveis no HTML
- 15 blocos inline `<style>`
- CSS externo: `https://silver-cardinal-blossom.pagey.site/cr-v2.css`
- JS externo principal: `https://silver-cardinal-blossom.pagey.site/cr-v2.js`
- Há múltiplas inclusões de analytics/banner Pagey/Umami no HTML legado; saneamento deve tratá-las em candidate, nunca diretamente nesta branch congelada.

## Regra de governança
Esta branch não recebe refactor, redesign nem integração de dados. Toda alteração futura parte deste commit para candidate isolado, passa por regressão e somente depois pode ser promovida.
