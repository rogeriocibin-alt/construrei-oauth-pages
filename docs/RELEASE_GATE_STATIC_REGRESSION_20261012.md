# CONSTRU-REI — Gate de regressão de publicação estática (12/10/2026)

**Estado:** PROTEÇÃO CONTRA NOVOS ERROS; **NÃO AUTORIZA PUBLICAÇÃO ENXUTA.**

## Motivo e escopo

A auditoria existente PR #65 e a correção da candidata PR #66 examinam o pacote efêmero sem deploy, e identificaram **342 pares literais de referências locais**, dos quais **316 têm o destino presente no pacote**, **0 apontam para arquivo existente mas omitido** e **26 referenciam destino que não está no repositório**. Trata-se de teste *estático* com limitações conhecidas; não equivale a navegação, scripts dinâmicos, PWA, Auth/OAuth, Trello, financeiro, APIs nem restauração SQL.

O gate roda no job **governance já existente** de `.github/workflows/cofre-zero-health-gate.yml`. **Não adiciona cron, storage, servidor, Supabase ou Edge Function.** Preserva URLs e arquivos de produção.

## Condições objetivas para barrar nova regressão

1. **0** referências de arquivos existentes omitidos do pacote candidato.
2. No máximo **26** referências ausentes de todo o repositório, contando dívida técnica legada, enquanto não forem classificadas/corrigidas.
3. No máximo **3** referências ausentes geradas pela **Central oficial vigente** (`production/central-operacional-v2-ux-r1-2-homologada-20261005/`): duas imagens CSS e um JSON acessado via código. Esses números não provam que a interface atual está quebrada.
4. Referência comprovada **Gabi v21 → Gabi v20** precisa estar no pacote candidato.
5. Alterar os números de base exige *análise explícita* em PR, com evidência de origem, distinção entre referência de fallback e dependência operacional e preservação do rollback.

## Bloqueios que continuam abertos

- O Gabi v20 referencia `preview/_shared/cr-shell-production-20261001.js`, que não está no inventário Git. Não substituir por arquivo com nome semelhante sem teste.
- A busca é estática; rotas JS compostas, service workers/cache, requisições em tempo de execução e links externos ainda não estão exaustivamente comprovados.
- **`eligible_for_production_cutover=false` é obrigatório.** Não apagar nenhuma das 121 pastas `preview/` nem mover a Central para o pacote reduzido por causa de CI verde.
- O Cofre Zero global só atinge 100% com restaurações e recorrência testadas. O Trello teve restauração isolada verificada; SQL real, six Netlify e execução periódica na main continuam em avaliação.

## Evidências

- [PR #65](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/65): scanner estático
- [PR #66](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/66): inclusão de v20 na homologação temporária
- [CI #38196805647](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/38196805647): linha de base
- [Checkpoint #53](https://github.com/rogeriocibin-alt/construrei-oauth-pages/issues/53): estado integral do projeto

**Não contém credenciais, dados de clientes, fotografias nem dumps de banco.**
