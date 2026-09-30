# CHECKPOINT CANÔNICO — IDENTIDADE VISUAL V2 CONSTRU-REI
Data: 30/09/2026
Status: EM DESENVOLVIMENTO • NÃO PROMOVIDO

## OBJETIVO
Transformar a Central CONSTRU-REI para seguir de verdade a imagem de referência aprovada por Rogério:
- menu lateral navy profissional;
- topo limpo e executivo;
- hero compacto e premium;
- KPIs organizados em faixa;
- acessos rápidos em cards modernos;
- esteira F00→F09 visualmente refinada;
- pendências vivas organizadas;
- botões modernos, personalizados e consistentes;
- mesma linguagem em Central, APP, Dashboard, Apresentação, F00–F09 e demais páginas;
- mobile com aparência de produto pronto;
- sem alterar lógica, APIs, rotas, automações, auth, dados, Trello, GestãoClick ou permissões.

## ESTADO OFICIAL ANTES DA V2
Branch oficial: main
Commit-base: 91b29928bfcc5619c3f741b3ab96cbbe67cf1b88

A V1 da identidade já está no main, porém Rogério validou que ela mudou principalmente cores/fundo e NÃO atingiu a transformação estrutural visual desejada.

Checkpoint de rollback anterior já existente:
checkpoint-pre-identity-20260930

## CANDIDATE V2
Branch:
cr-identity-reference-v2-20260930

Commit atual do candidate:
11c0302c9a542bcb63f6ca87327259e3157f6fb2

Situação comparada ao main:
- ahead_by: 1
- behind_by: 0
- somente 1 arquivo alterado nesta V2 até agora:
  central-runtime/ui/cr-product-design-20260930.css
- alteração atual: +294 linhas de CSS visual
- NÃO houve promoção para main.

## O QUE JÁ FOI FEITO NA V2
Foi adicionada ao Design System uma camada visual chamada:
CR REFERENCE V2

Ela prepara:
- sidebar mais compacta e refinada;
- topo mais próximo da referência;
- hero executivo compacto;
- KPIs com hierarquia visual e cores semânticas;
- cards de acessos rápidos;
- esteira F00→F09 compacta;
- cards de pendências;
- linguagem visual dos botões;
- ícones visuais via CSS;
- refinamento de APP/fluxos;
- controles da apresentação;
- dock mobile;
- responsividade mais próxima de aplicativo.

IMPORTANTE:
essa camada ainda é PARCIAL. Algumas classes estruturais novas (.cr-ref-section, .cr-ref-head etc.) foram preparadas no CSS, mas ainda NÃO foram inseridas no HTML da Central. Portanto a V2 NÃO está concluída.

## REGRA ANTIRREGRESSÃO
A transformação deve ocorrer na apresentação e organização visual.

PROIBIDO:
- reescrever lógica;
- alterar onclick/handlers;
- alterar hrefs funcionais;
- trocar APIs;
- alterar fetches;
- mexer em autenticação;
- mexer em Supabase/Trello/GestãoClick;
- alterar regras financeiras;
- modificar F00–F09 funcionalmente;
- trocar URL oficial;
- fazer rollback global;
- remover recursos existentes.

Ao alterar HTML, preservar exatamente os elementos funcionais existentes e mudar apenas wrappers, classes, containers e composição visual quando necessário.

## PRÓXIMO PASSO EXATO
1. Retomar do branch cr-identity-reference-v2-20260930.
2. NÃO recomeçar o trabalho.
3. NÃO promover ainda.
4. Fazer a transformação estrutural VISUAL da home central/index.html para corresponder à imagem aprovada:
   - cabeçalhos de seção;
   - organização dos blocos;
   - cards e hierarquia;
   - botões;
   - hero;
   - menu/topo.
5. Preservar integralmente todos os handlers, links, ids e containers usados pelo JavaScript atual.
6. Depois aplicar o mesmo Design System em:
   - APP;
   - Dashboard;
   - Apresentação;
   - F00–F09;
   - páginas auxiliares.
7. Validar desktop + mobile.
8. Só promover para main depois de screenshot/validação visual de Rogério.

## GATE DE ACEITE
A V2 só pode ser considerada pronta se:
- parecer realmente com a imagem de referência, não apenas com outra paleta;
- botões estiverem modernos e consistentes;
- organização visual estiver profissional;
- menu, APP, Dashboard, Apresentação e fluxos parecerem parte do mesmo produto;
- lógica e automações permanecerem intactas;
- nenhuma rota/link/auth regressar.

## COMANDO DE RETOMADA
CR ASSERTIVO — retome exatamente do CHECKPOINT_IDENTITY_V2_20260930 no branch cr-identity-reference-v2-20260930. Não recomece, não promova e não altere lógica. Continue somente a transformação visual estrutural baseada na imagem de referência aprovada por Rogério, preserve integralmente IDs, handlers, rotas, APIs, automações, auth e dados. Finalize primeiro a home da Central em candidate, valide anti-regressão e só depois propague a mesma identidade para APP, Dashboard, Apresentação e F00–F09. Aguarde validação visual antes de promover ao main.


## ATUALIZAÇÃO DE RETOMADA — 30/09/2026
Status: CANDIDATE VISUAL V2 PROPAGADO • NÃO PROMOVIDO

Último commit de implementação antes deste checkpoint: ee741f29e5c66763b08575520138531d8d586735

### HOME CENTRAL — CONCLUÍDA ESTRUTURALMENTE NO CANDIDATE
- central/index.html recebeu a composição estrutural V2 da referência aprovada.
- Inseridos cabeçalhos executivos para KPIs, acessos essenciais, esteira F00→F09 e pendências vivas.
- Hero, menu, topo, cards, botões, KPIs, esteira e pendências usam a camada CR REFERENCE V2.
- Preservados IDs, handlers, links, scripts, fetches, botões e âncoras funcionais.
- A HOME passou nos gates estáticos de antirregressão.

### PROPAGAÇÃO VISUAL CONECTADA
As superfícies abaixo apontam para o Design System do próprio branch candidate, sem depender do CSS publicado no main:
- APP: central-runtime/app/index.html
- Dashboard: central-runtime/dashboard/index.html
- Apresentação: central/presentation.html
- F00–F09: central-runtime/f00/index.html até central-runtime/f09/index.html

Arquivo canônico:
- central-runtime/ui/cr-product-design-20260930.css

### GATES PASSADOS
- CSS V2 contém regras específicas para HOME, APP, Dashboard, Apresentação e shell F00–F09.
- DOM esperado encontrado em todas essas superfícies.
- F00–F09 continuam carregando cr-shell.js.
- Em todas as alterações de referência visual foram preservados scripts, IDs, onclicks, fetches, botões e âncoras.
- Comparação com main: branch somente à frente; main não foi promovido nem alterado por esta etapa.

### VALIDAÇÃO VISUAL
A validação automática por navegador remoto ficou indisponível porque o Opera Browser Connector estava desconectado.
Isso NÃO autoriza promoção. O candidate permanece isolado aguardando captura/validação visual humana antes de merge/promote.

### PRÓXIMO PASSO EXATO
1. Abrir/renderizar o branch candidate em navegador conectado.
2. Conferir screenshot desktop e mobile da HOME primeiro.
3. Se a HOME estiver visualmente fiel à referência, conferir APP, Dashboard, Apresentação e F00–F09.
4. Corrigir somente CSS/composição visual se necessário, sem tocar em lógica.
5. NÃO promover ao main até aprovação visual explícita de Rogério.