# CHECKPOINT_HOME_VISUAL_REFERENCE_REBUILD_DONE_20260930

## Resultado
Reconstrução visual da HOME concluída em candidate isolado, baseada na imagem aprovada por Rogério.

## Candidate
- Branch: `cr-home-reference-rebuild-20260930`
- Commit de implementação antes deste checkpoint: `24be7c8374db293e170d04602fd8f16c5f1bc32d`
- Base: `cr-blue-canonical-option-b-20260930` @ `dd56a1c70712b814d343a9cbdfd94e1f26a9cfa9`
- `main` preservado em: `91b29928bfcc5619c3f741b3ab96cbbe67cf1b88`

## Arquivos da intervenção
- `central/index.html`
- `central/assets/cr-home-reference-20260930.css`
- checkpoints desta intervenção

## Escopo implementado
- Sidebar azul escura com hierarquia e item ativo semelhante à referência.
- Topbar clara com título, contexto, busca visual, notificação e identificação do Diretor.
- Hero azul moderno, logo oficial e CTAs organizados.
- "Hoje na Operação" com KPIs claros.
- Acessos Rápidos em cards compactos.
- Esteira F00 → F09 em cards uniformes.
- Pendências Vivas.
- Desenvolvimento / Saúde Técnica com os mesmos indicadores já disponíveis na Central.
- Responsividade desktop / tablet / mobile.

## Gates antirregressão
Comparação com a base:
- Arquivos funcionais fora da HOME: não modificados.
- Dashboard V4, APP, Apresentação, Academy e F00–F09: não modificados nesta branch.
- `window.location.assign`: 7 → 7.
- `function go(...)`: 1 → 1.
- helper de API `crJson`: 1 → 1.
- scripts existentes: 45 → 45.
- ações resource existentes: 8 → 8.
- URLs Supabase: +1 exclusivamente pelo uso explícito do endpoint de logo oficial no hero.
- novos `data-page-target`: +2 exclusivamente para "Ver detalhes da operação" e "Ver detalhes" da saúde, apontando para páginas já existentes.
- Nenhuma migration, alteração de banco, RLS, Edge Function, Trello, GestãoClick, autenticação, permissão, cálculo ou dado.

## Publicação
Nenhuma promoção para `main` ou produção foi realizada.

## Gate final
Falta somente validação visual real em URL de preview isolada antes de qualquer promoção.
