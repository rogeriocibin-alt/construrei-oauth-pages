# Central — diagnóstico e candidata parcial — 29/09/2026

Status: candidata técnica parcial; NÃO HOMOLOGADA; produção inalterada.

## Preservação
Base do repositório: b7a5790836ea15aa8b1d8c257db8255e6296aab3.
Arquivo central/index.html: blob fbdef78c4fdabcabc098c4db9c1ee02e9b5b91c5; 130482 bytes na base.
Roteador Supabase centro-operacoes: versão 260, renderer GitHub Pages /construrei-oauth-pages/central/.
Último commit do index na consulta: 4fa9b7463c527cfa510eaaa4b874790ce09be300 (clipboard), sem concluir que causou o incidente.
Nenhuma mudança em rotas, permissões, autenticação, backend, fluxos ou dados. Não há redesign nesta candidata.
Rollback desta candidata: reverter somente o commit desta alteração; não restaurar versões antigas sobre alterações posteriores de terceiros.

## Evidências confirmadas
- HTML inclui 21 tags do mesmo script Umami e 12 banners Pagey de publicações históricas.
- Script de documentação observa document.documentElement com childList/subtree e chama init/render, que escrevem no DOM observado sem verificar mudança. Com documentos carregados e elementos presentes, a rotina real reproduz realimentação no teste sintético.
- HTML mantém Acervo 343 e menus técnicos legados. Há dependência de cr-v2.js e cr-v2.css hospedados em silver-cardinal-blossom.pagey.site; a versão moderna não está autocontida no repositório.
- Consultas aos dois assets retornaram 502 neste ambiente; resposta identificada como mitmproxy com Connection refused. Isso NÃO prova indisponibilidade no navegador do usuário nem causa definitiva dos menus regressivos.
- Não foi identificada ainda a última versão humana aprovada com todos os assets correspondentes. Não remover menus por suposição, nem confundir ocultar menus com remover segurança.

## Correção preparada
- Deduplicação Umami: 21 tags para 1, mesmo identificador.
- Retirada dos 12 carregadores de banners históricos; a própria página já removia esses banners via rmBadge.
- Escritas idempotentes de opções, contador e tabela na rotina de documentação, preservando filtros e documentos restritos.
- Nenhuma alteração da frequência de atualização dos dados.

## Verificação
Executar na raiz: node tests/central-docs-observer.cjs.
Harness simula DOM/MutationObserver usando a rotina real extraída do HTML e dois documentos sintéticos, um restrito.
Original: 505 escritas / 100 callbacks; ainda pendente quando o teste corta o ciclo.
Candidata: 5 escritas / 1 callback; estabilizada.
Filtros, alteração de conteúdo, recuperação após renderer antigo e exclusão de documento restrito: PASS.
Sintaxe dos scripts inline: validada. git diff --check: PASS.
Esses números NÃO são benchmark de navegador nem redução percentual de tempo de carregamento.

## Medições exploratórias HTTP
Uma amostra por endpoint, do ambiente de execução e incluindo intermediários:
- health: HTTP 200, 8,510 s, 2411 bytes.
- public-summary: HTTP 200, 10,616 s, 231111 bytes.
Sem mediana, sem separação confiável rede/backend, sem comparação pós-deploy. Não atribuir todo esse tempo ao servidor.

## Pendências antes de produção
1. Recuperar os assets cr-v2.js/css de fonte autêntica e conferir baseline aprovado; não reconstruir autenticação por aproximação.
2. Confirmar carregamento/falha no navegador real e perfil de rede/CPU, incluindo celular e notebook.
3. Homologar candidata isolada com dados sintéticos e verificar navegação/documentação única contra baseline.
4. Medir antes/depois no mesmo ambiente; validar módulos e autenticação com perfis autorizados.
5. Somente após validação concreta por Rogério, promover. Não há URL de homologação publicada nesta etapa.
