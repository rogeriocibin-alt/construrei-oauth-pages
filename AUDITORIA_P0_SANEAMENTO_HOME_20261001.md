# AUDITORIA_P0_SANEAMENTO_HOME_20261001

Base auditada: `74dd646210d3194319f0eabd75ca1ed9e6002f6a` / branch `cr-home-canonical-20261001`.

## Sumário
A HOME está visualmente homologada, porém o HTML acumulou muitas camadas de CSS. O principal risco de regressão é a cascata, não a estrutura funcional.

### Métricas observadas
- 15 blocos `<style>` inline.
- 2.039 ocorrências de `!important`.
- 7 ocorrências de `white-space: nowrap`.
- 4 ocorrências de `text-overflow: ellipsis`.
- 22 ocorrências de `overflow: hidden`.
- 3 menções a `line-clamp`.
- 288 regras de altura fixa detectadas no HTML/CSS agregado.
- CSS externo carregado: `https://silver-cardinal-blossom.pagey.site/cr-v2.css`.
- JS externo funcional principal: `https://silver-cardinal-blossom.pagey.site/cr-v2.js`.
- Há múltiplas inclusões de Umami/Pagey/banner no HTML legado.

## P0 — risco real de regressão
1. **Cascata CSS sobreposta na HOME.**
   Seletores redefinidos repetidamente: `.content` (18), `.cr-hero-visual` (16), `.side` (15), `#dashboard>.cr-home-hero` (15), `.top` (13), `#dashboard .cr-panel-action` (12), `.cr-flow-card h3` (11), `.cr-flow-state` (11).
   Risco: uma alteração pequena pode reativar regra antiga e causar clipping, densidade errada ou regressão responsiva.

2. **Regras explícitas de truncamento ainda existem no legado.**
   `.cr-flow-state` e `.cr-health-value` possuem versões antigas com `nowrap/hidden/ellipsis`; mobile também possui ellipsis no breadcrumb.
   Risco: uma futura regra mais específica ou posterior pode reativar truncamento.

3. **Dependência de grande quantidade de `!important`.**
   Risco: novas correções precisam elevar especificidade continuamente, tornando a manutenção frágil.

## P1 — dívida técnica relevante
1. Muitas media queries sobrepostas para os mesmos breakpoints e componentes.
2. HTML único agrega estilos de várias fases históricas.
3. Múltiplas inclusões de analytics/banner Pagey/Umami.
4. CSS/JS externo em domínio Pagey aumenta dependência operacional externa.
5. Muitas alturas fixas reduzem tolerância a conteúdo dinâmico.

## P2 — limpeza futura
1. Consolidar CSS por domínio: shell, HOME, mobile, módulos.
2. Remover código morto após prova por cobertura/uso.
3. Revisar analytics duplicado.
4. Transformar componentes repetidos em stylesheet/JS canônicos compartilhados.

## Ação P0 recomendada
- Não remover legado em massa.
- Criar um stylesheet canônico final da HOME.
- Mover para ele a camada final homologada de zero-clipping + tipografia.
- Carregá-lo por último.
- Remover somente os dois blocos inline finais equivalentes, mantendo renderização idêntica.
- Validar por matriz de screenshots e smoke tests antes de qualquer merge.

## Gate
Qualquer diferença visual material entre baseline e candidate = rollback da mudança responsável.
