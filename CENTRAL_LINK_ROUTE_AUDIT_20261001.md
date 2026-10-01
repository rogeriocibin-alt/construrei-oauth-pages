# CENTRAL LINK ROUTE AUDIT — 2026-10-01

## Resultado
Auditoria global executada sobre HOME/Central, APP, Dashboard V4, F00–F09, Checklist, Meet, Apresentação, Academy, documentação e acessos técnico/diretoria.

### Endpoints testados em rede
- Central: HTTP 200
- APP canônico: HTTP 200, com divergência de versão final documentada
- F00–F09: HTTP 200 nos 10 fluxos
- Checklist: HTTP 200
- Google Meet: HTTP 200
- Apresentação viva: HTTP 200
- Dashboard V4: HTTP 200
- Documentação: HTTP 200
- Admin: HTTP 200
- Technical: HTTP 200

### Correções realizadas no candidate
1. Remoção de recursos Pagey temporários do shell da Central.
2. Internalização do runtime `cr-v2.js` para preservar Documentações/Base Técnica sem dependência Pagey.
3. Uso do CSS local recuperado da Central.
4. Deduplicação de analytics Umami para uma única inclusão.
5. Hash-route bridge adicionado; links como `#academy` agora abrem o módulo real.
6. Links externos gerados pelo runtime local usam `rel="noopener noreferrer"`.
7. F00–F09 continuam usando o router canônico Supabase e foram testados.
8. APP recebeu hierarquia final de botões: primeira prioridade = primário azul; fechamento = secundário branco.

### Verificações estáticas
- Central: 16 scripts inline compilam sem erro.
- `central/assets/cr-v2-local.js`: compila sem erro.
- `central-runtime/ui/cr-shell.js`: compila sem erro.
- Dois padrões `onclick` do Acervo aparecem como inválidos em regex estático porque são strings-template geradas dinamicamente; são pré-existentes e não foram alterados nesta auditoria.
- Nenhuma ocorrência Pagey permanece em `central/index.html`.

### Itens não promovidos
- Produção permanece intacta.
- O APP canônico em Supabase ainda aponta à versão v7.6.6 publicada; a candidata histórica nova não foi promovida por regra de gate.
- Nenhuma rota foi apontada para preview como atalho.

## Gate
A auditoria de rotas está pronta para homologação, mas a promoção do APP e da Central deve ocorrer somente com autorização explícita de Rogério.
