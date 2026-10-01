# CHECKPOINT — F01 SINGLE CANONICAL DELIVERY — READY FOR VISUAL HOMOLOGATION — 2026-10-01

## Status
Correção técnica promovida. F01 operacional agora possui um único destino canônico físico e imutável.
Validação visual final por Rogério permanece pendente antes de iniciar F02.

## PRE
- checkpoint: CHECKPOINT_PRE_F01_SINGLE_CANONICAL_DELIVERY_20261001
- base main: 619ae2bd9cee7d92248ce41e8d61376d2b7516bc
- central-atendimento PRE: v148
- hash PRE: 33815dd5efcf3022b360dfcbeae30b186005de9758663f23b4249af1b2824d87

## Branch de execução
- cr-f01-single-canonical-delivery-20261001

## Causa tratada
A versão homologada do F01 já existia no Git, mas o caminho histórico /central-runtime/f01/ podia ser entregue por cache antigo.
Querystring de cache-busting não é suficiente para garantir identidade física única do recurso.

## Correção
1. Criada release física imutável:
   - /central-runtime/f01-canonical-20261001/
   - conteúdo idêntico ao F01 aprovado
   - blob: c88a0cbafd82394449d49c3ff6e54fbb4793ed42
2. Caminho legado /central-runtime/f01/ substituído por redirect explícito para a release canônica.
   - blob redirect: a5046f68a46ac0aafe3e375fd8af6983536979ad
3. central-atendimento alterado somente nos dois destinos F01 (PRIMARY e FALLBACK).
   - destino: https://rogeriocibin-alt.github.io/construrei-oauth-pages/central-runtime/f01-canonical-20261001/
   - versão: 149
   - hash: 0487bc1b9789e1d6f3055eb907b4d470ed191ac3ea173c920810f6d7bccfccaa
4. centro-operacoes e centro-operacoes-runtime não precisaram ser alterados, pois já delegam F01 ao central-atendimento.
5. shell F00-F09 não precisou ser alterado, pois já roteia todos os fluxos pelo central-atendimento.
6. HOME e APP não possuem hardcode direto para o HTML legado do F01.

## Proteções verificadas
- F00 blob preservado: c5d968b92659b87a3e6276dcef29075e49311cfc
- F02 blob preservado: a25851e1e91a4f09c21cae1c3d45c6f248f5917d
- F09 blob preservado: 0978b6565c9910df88767d0525fcc69e8cc68ea2
- shell canônico preservado: 2288f552ec5c6cd1471051a3bcc0d1e23e217e23
- HOME não alterada
- backend F01 não alterado
- dados/tabelas/automações não alterados
- F02-F09 não alterados

## Gates técnicos
PASS:
- release canônica contém “F01 — Atendimento & Qualificação”
- release canônica contém CR-F01-CANONICAL-HOMOLOGATED-20261001
- release canônica NÃO contém “F01 — Qualificar & Definir Rota”
- release canônica NÃO contém “F01 atual”
- rota legada contém redirect para a release canônica
- central-atendimento ACTIVE v149
- PRIMARY F01 aponta para release canônica
- FALLBACK F01 aponta para release canônica
- nenhuma referência à antiga query cr_release=f01-delivery-fixed permanece no router
- F00/F02/F09/shell preservados por blob

## Gate público/visual
A validação independente via navegador automatizado não pôde ser concluída porque o Browser Connector estava desconectado e o fetch público do ambiente de execução não tinha resolução DNS.
Portanto, NÃO iniciar F02 até Rogério abrir a Central e confirmar visualmente que todos os acessos ao F01 entregam a tela “F01 — Atendimento & Qualificação”.

## Regra
FORWARD ONLY.
NÃO RESTAURAR F01 ANTIGO.
NÃO USAR /central-runtime/f01/ COMO FONTE OPERACIONAL.
NÃO INICIAR F02 SEM VALIDAÇÃO VISUAL DE ROGÉRIO.
