# CHECKPOINT_PRE_RESTORE_BLUE_CANONICAL_20260930

## Objetivo
Checkpoint anterior à execução da OPÇÃO B: restauração visual global da identidade azul canônica previamente homologada da CONSTRU-REI.

## Base preservada
- Branch de origem: `cr-identity-reference-v2-20260930`
- Commit de origem: `86f171cc1a4f6442cf0e4ba27705580e6338c9d5`
- `main` no início da execução: `91b29928bfcc5619c3f741b3ab96cbbe67cf1b88`
- Fonte visual homologada usada como referência: `checkpoint-pre-identity-20260930`
- Commit da fonte visual: `3b3751ddaca707ab44629b108f7f753d57c0d76d`

## Escopo permitido
Somente camada visual: referências de stylesheet/tokens/componentes de identidade nas páginas afetadas pelas experiências visuais recentes.

## Proteções
- Não alterar produção ou `main`.
- Não alterar Supabase, banco, RLS, Edge Functions, APIs, Trello, GestãoClick, autenticação, permissões, rotas, cálculos ou dados.
- Não reimplementar F00–F09.
- Não promover automaticamente.
- Restaurar apenas arquivos cuja divergência entre a fonte homologada e o candidate foi comprovada como visual.

## Critério
Ao final, as páginas restauradas devem usar exatamente a camada visual existente no checkpoint homologado, mantendo o estado funcional atual e sem mudança de destinos, ações ou regras de negócio.
