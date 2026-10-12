# Cofre Zero — sete projetos Netlify: publicação versus fonte histórica

**Verificação direta:** 12/10/2026. **Sem novas publicações, sem exclusões.**

| Projeto Netlify | Estado da publicação recuperável | Fonte relacionada no GitHub, se identificada | Classificação honesta |
|---|---|---|---|
| `construrei-dashboard` | Deploy publicado `6ab31f639b53ce0008e5fef7` pronto; backup 14 arquivos já conferido em execução anterior | Não aplicável | **1/7 — arquivos publicados com backup testado** |
| `construrei-f01` | Sem deploy publicado atual identificado | `central-runtime/f01-canonical-20261001/index.html` | **Fonte Git relacionada; NÃO é backup idêntico do Netlify** |
| `construrei-knowledge-v3` | Sem deploy publicado atual identificado | Nenhuma fonte idêntica localizada pelo nome/árvore `main` | **Inventário do site somente** |
| `construrei-central-failover-v1` | Sem deploy publicado atual identificado | Nenhuma fonte idêntica localizada pelo nome/árvore `main` | **Inventário do site somente** |
| `construrei-agenda-v52` | Sem deploy publicado atual identificado | Nenhuma fonte idêntica localizada pelo nome/árvore `main` | **Inventário do site somente** |
| `construrei-home-reference-preview-20260930` | Sem deploy publicado atual identificado | `preview/home-reference-20260930/index.html` | **Fonte Git relacionada; NÃO é backup idêntico do Netlify** |
| `construrei-f00-canonical-preview-20261001` | Sem deploy publicado atual identificado | `preview/f00-canonical-ui-20261001/index.html` | **Fonte Git relacionada; NÃO é backup idêntico do Netlify** |

## Decisão para não gerar dívida ou cobrança desnecessária

Um projeto Netlify vazio ou sem publicação **não deve receber deploy artificial só para aumentar a métrica de backup**. O arquivamento privado no Drive já guarda metadados dos sete projetos e os arquivos publicados do projeto que de fato publicou artefatos. Fontes versionadas no Git representam outro tipo de acervo, cuja integridade pode ser protegida sem criar sites adicionais.

O guard `.github/scripts/cr_netlify_historical_provenance_guard.py`:
- Verifica que o conjunto dos sete projetos permanece exatamente reconciliado com o backup Netlify já existente;
- Verifica que as três fontes Git relacionadas ainda existem, têm bytes e gera SHA256 reproduzível em cada CI;
- Falha se uma delas desaparecer silenciosamente; **não assume equivalência com o deploy Netlify histórico**;
- Não faz chamadas de rede nem requer credenciais, não recupera deploy histórico, não cria projetos ou backups duplicados.

**Evidência:** leitura direta da conta Netlify conectada (Free, sete projetos); GitHub `main` de referência `0e958c219a259b648fbdc8942ac03ea173dd470b`; inventário de arquivos publicados e cópia Drive através de `cofre-netlify-inventory-offsite.yml`; [checkpoint #53](https://github.com/rogeriocibin-alt/construrei-oauth-pages/issues/53).

**Cobertura restante:** publicar backup 7/7 seria estatística enganosa. Para fechar o patrimônio digital desses seis projetos, basta classificar intenção/consumidores e preservar suas fontes/versionamento existentes quando identificáveis; projetos vazios podem ficar apenas como inventário, mas **não autoriza removê-los da conta sem comprovação de que não há tráfego, ligação ativa ou dependência comercial**.
