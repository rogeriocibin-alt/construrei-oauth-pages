# CENTRAL CONSTRU-REI — BASE CANÔNICA HOMOLOGADA

**Data da homologação:** 01/10/2026  
**Status:** PRONTA • HOMOLOGADA • CONGELADA COMO BASE • EVOLUÇÃO SOMENTE PARA FRENTE

## Identidade da base aprovada

- Commit visual aprovado: `92ef8f27d71ac176abc6452df165a048c4405d60`
- Blob SHA do HTML aprovado: `b90367bed503245a5bea9b4db4f15b46622ab6b2`
- Branch congelada: `central-homologada-20261001`
- Snapshot de produção: `production/central-homologada-20261001/index.html`
- Endpoint oficial: `https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes`
- Router oficial homologado: Supabase Edge Function `centro-operacoes` v274
- Runtime canônico: `centro-operacoes-runtime-canonico-20261001`
- Snapshot de recuperação da base homologada: `centro-operacoes-baseline-homologada-20261001`
- Política runtime: `FORWARD_ONLY_NO_LEGACY_FALLBACK`

## Regra de ouro

Toda evolução da Central deve partir exclusivamente de `central-canonical/current` e da base homologada acima. Não pesquisar, restaurar, promover, copiar ou reconstruir a Central a partir de versões, candidates, checkpoints, recovery branches ou layouts anteriores a esta homologação.

## O que está congelado

A estrutura geral da HOME, identidade visual, navegação principal, menu lateral homologado, organização dos painéis, rotas canônicas e comportamento funcional constituem a base aprovada. Alterações futuras devem ser incrementais e localizadas.

## Melhorias permitidas

São permitidos aperfeiçoamentos pequenos e controlados, inclusive em “Hoje na Operação”, “Desenvolvimento / Saúde Técnica”, dados exibidos, legibilidade, conteúdo, indicadores e pequenos ajustes de UX. Cada mudança deve nascer em candidate isolado, preservar toda a base e ser promovida somente após validação.

## Proibições anti-regressão

1. Não substituir a HOME inteira por arquivo de versão antiga.
2. Não apontar o oficial para `checkpoint-v*`, `central-recovery*` ou candidates antigos.
3. Não usar fallback visual para versões anteriores.
4. Não alterar o snapshot `production/central-homologada-20261001/index.html`.
5. Não promover mudança estrutural sem validação explícita.
6. Não reabrir busca histórica por “última versão boa”; esta é a versão boa oficial.
7. Rollback de incidente, se absolutamente necessário, só pode retornar ao snapshot homologado desta própria base — nunca a uma versão pré-homologação.

## Fluxo obrigatório de evolução

Base canônica atual → branch/candidate isolado → diff mínimo → teste técnico → validação visual/funcional → novo snapshot versionado → promoção do endpoint oficial → atualização de `central-canonical/current`.

**Decreto técnico:** a Central CONSTRU-REI está pronta e homologada como produto-base. Daqui em diante, trabalha-se por evolução incremental, não por reconstrução ou recuperação histórica.
