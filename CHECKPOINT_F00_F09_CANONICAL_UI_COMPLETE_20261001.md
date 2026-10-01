# CHECKPOINT — F00–F09 CANONICAL UI COMPLETE — 2026-10-01

Status: CANDIDATE COMPLETO — AGUARDANDO HOMOLOGAÇÃO GLOBAL

## Branch
- cr-f00-f09-canonical-ui-20261001
- HEAD: e685d26a46f7f0926fae97b33fc02d10d2025087

## Matriz aprovada
- F00 homologado por Rogério.
- Checkpoint: CHECKPOINT_F00_CANONICAL_APPROVED_20261001.md
- F00 segue como fonte visual da verdade.

## Camada visual compartilhada
- central-runtime/ui/cr-flow-canonical-20261001.css
- Derivada do F00 aprovado.
- CSS balance = 0
- Logo oficial APP = 1 ocorrência
- Seletores mortos de logo = 0
- Saneamento final: e685d26a46f7f0926fae97b33fc02d10d2025087

## Antirregressão
Antes da publicação dos previews, todos os módulos F00–F09 passaram:
- SCRIPT_IDENTICAL=true
- ID_SET_IDENTICAL=true
- API_SET_IDENTICAL=true
- canonical_css=true

A correção final após essa auditoria alterou somente o CSS compartilhado, sem tocar HTML funcional, scripts, IDs ou endpoints.

## Commits de aplicação no branch
- F00: 794507b0c061a884d5800b12d84ac68b766fa313
- F01: 05fc6ef88202d656c640a5c997d8adf799097a76
- F02: 82fc1716291a8d7848e56d8b67858b888ef1e0b2
- F03: 4ece65b237f9e775ceaba8a877cb731986f39142
- F04: b23656c10d480b2e5ee6763ce011973d7d75591b
- F05: 81e40ca8ea0fa80979d8f7be27d6d368896a86ba
- F06: 43fb98c71470c5f26fc3751547cef2d89c5f68c5
- F07: fb9f09a351aa08c558d146a264a9e8838954683b
- F08: e235dba5adca31be6f02008c50fc7364e36196f1
- F09: 3c0a8caaca4c4edbff080d283938abcb224681b3

## Previews
- F00: /preview/f00-canonical-ui-20261001/
- F01: /preview/f01-canonical-ui-20261001/
- F02: /preview/f02-canonical-ui-20261001/
- F03: /preview/f03-canonical-ui-20261001/
- F04: /preview/f04-canonical-ui-20261001/
- F05: /preview/f05-canonical-ui-20261001/
- F06: /preview/f06-canonical-ui-20261001/
- F07: /preview/f07-canonical-ui-20261001/
- F08: /preview/f08-canonical-ui-20261001/
- F09: /preview/f09-canonical-ui-20261001/

## Regras preservadas
- Produção não promovida.
- main funcional não substituído.
- APIs/Supabase/rotas/IDs/scripts preservados.
- Uma única logo global no shell.
- F01–F09 receberam linguagem visual comum sem copiar conteúdo funcional do F00.

## Próximo gate
Homologação visual global de F00–F09 em notebook e mobile.
NÃO promover para produção até aprovação expressa de Rogério.
