# CHECKPOINT_CENTRAL_CANONICAL_APPROVED_20261001

Status: HOMOLOGADA COMO BASE CANONICA DE REFERENCIA
Data: 2026-10-01

## Referencia aprovada
- Repository: rogeriocibin-alt/construrei-oauth-pages
- Canonical branch: cr-central-canonical-approved-20261001
- Approved commit: 92ef8f27d71ac176abc6452df165a048c4405d60
- Approved HOME blob: b90367bed503245a5bea9b4db4f15b46622ab6b2
- Approved preview: https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/central-approved-router-candidate-20261001/?rev=92ef8f27
- Approved file: preview/central-approved-router-candidate-20261001/index.html

## Regra canonica
A branch cr-central-canonical-approved-20261001 aponta para o commit aprovado e nao deve receber commits de desenvolvimento.
Versoes anteriores sao somente historicas. Nenhuma rotina deve procurar ou promover automaticamente uma "versao boa anterior".
Toda evolucao nasce de candidate derivada da base canonica e passa por validacao antes de promocao.

## Fluxo obrigatorio
CANONICA HOMOLOGADA -> candidate isolada -> alteracao minima -> testes -> comparacao com canonica -> homologacao -> promocao.

## Proibicoes
- rollback silencioso;
- restauracao de HTML historico sobre a Central;
- mistura de branches antigas;
- redesign durante correcao pontual;
- promocao automatica de versao anterior;
- alteracao direta da branch canonica.

## Matriz minima de validacao
HOME: carregamento, logo, identidade, tipografia, cards, botoes, hierarquia, Hoje na Operacao.
MENU: abertura/fechamento, coluna lateral, notebook, celular, sem overlay/regressao.
ROUTER: navegacao normal, ?open=, deep-links, retorno a HOME, sem loop e sem redirecionamento historico.
MODULOS: APP, Dashboard, Apresentacao, Academy, Documentacao e Esteira F00-F09.
RESPONSIVIDADE: notebook 1366x768 e celular.
INTEGRIDADE: zero alteracao involuntaria visual/funcional.

## Proxima base de evolucao
cr-central-next-20261001

Primeiro trabalho autorizado apos este checkpoint: melhoria incremental de "Hoje na Operacao", em candidate isolada.
