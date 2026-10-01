# REGRESSAO_HOME_20261001

## Baseline
- Commit homologado: `74dd646210d3194319f0eabd75ca1ed9e6002f6a`
- Candidate P0: `cr-home-sane-p0-20261001`

## Matriz visual executada
Renderizações comparadas:
- 1366×768
- 1440×900
- 1920×1080
- 390×844

Resultado: sem diferença visual material observada após extrair as duas camadas finais de CSS para `central-runtime/ui/cr-home-canonical-20261001.css`. Diferenças esperadas se limitam ao timestamp dinâmico de atualização.

## Navegação interna
Foram encontrados 10 `data-page-target` e todos possuem `id` correspondente no mesmo HTML:
- flows
- health
- admin
- technical
- acervo
- os
- apis
- presentation
- academy
- docs

Missing targets: 0.

## Regra de regressão
Antes de qualquer merge futuro:
1. renderizar a matriz desktop/mobile;
2. comparar contra baseline;
3. testar todos os `data-page-target`;
4. testar os links externos principais;
5. rejeitar alteração com clipping, overflow ou diferença visual não aprovada.

## Observação
O candidate P0 não altera rotas, IDs, eventos, dados ou integrações.
