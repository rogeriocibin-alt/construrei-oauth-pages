# CENTRAL LINKS ONLY TRANSPLANT — 2026-10-01

| Arquivo | Alteração funcional | Visual alterado? | Evidência |
|---|---|---:|---|
| central/index.html | Hash-route bridge mínimo para abrir módulos internos como #academy | NÃO | HTML normalizado sem o bridge = byte-equivalente à base canônica |
| central-runtime/dashboard/index.html | target=_blank endurecido; Trello sem URL deixa de gerar destino falso | NÃO | Script compila; nenhuma regra visual alterada |
| central-runtime/f00/index.html | rel=noopener noreferrer em links externos | NÃO | 2 ocorrências corrigidas |
| central-runtime/f01/index.html | rel=noopener noreferrer em links externos | NÃO | 2 ocorrências corrigidas |
| central-runtime/f02/index.html | rel=noopener noreferrer em links externos | NÃO | 2 ocorrências corrigidas |
| central-runtime/f03/index.html | rel=noopener noreferrer em links externos | NÃO | 2 ocorrências corrigidas |
| central-runtime/f04–f09 | somente validação | NÃO | nenhuma alteração necessária |
| central-runtime/ui/cr-home-reference-20260930.css | nenhuma alteração | NÃO | SHA idêntico: 1dc2b084b06cec04e2b43d07070b6f323d9abb24 |

## Não transplantado
- cr-v2-local.css
- shell legado
- qualquer CSS da branch de auditoria anterior
- remoção de Pagey
- deduplicação de analytics
- qualquer alteração visual do APP
- qualquer rota de preview mascarando produção

## Rotas verificadas
APP, F00–F09, Checklist, Google Meet, Apresentação, Dashboard V4 e Documentação responderam HTTP 200.

## Pendência intencional
O endpoint canônico do APP ainda redireciona à versão v7.6.6 publicada. A nova candidata do APP não foi promovida nesta fase.
