# CHECKPOINT — GLOBAL ACCESS UI CANONICAL — 2026-10-01

## Estado
PADRONIZAÇÃO GLOBAL PUBLICADA.

## Branch de trabalho
`cr-global-access-ui-canonical-20261001`

## Base
`e6e085d35b2b0c3c7ede9519a4a652dd9f5ec4cf`

## Produção ativa
- Central: blob `c68792f93338c2e9c7d4f3749e48a2af7c8afc12`
- CSS global: blob `813624bd329e5fa2c89f5f633be637682ee46481`
- Apresentação: blob `3a0cdb3df59830b1ba59873ce6bc9a17ee490289`
- CSS apresentação: blob `2523d5581b8ba053327dd642e17403406102ef20`

## Regra de continuidade
FORWARD ONLY.
Não restaurar visual antigo.
Não substituir a Central homologada por versões históricas.
Não editar lógica dos 11 módulos para resolver estética.
Evoluções visuais devem partir destas camadas:
- `central-runtime/ui/cr-access-canonical-20261001.css`
- `central-runtime/ui/cr-presentation-canonical-20261001.css`

## Proteções
Preservar:
- APP canônico
- F00→F09
- Dashboard físico
- auth/RBAC/chaves
- APIs/banco
- automações
- apresentação viva e exportações PDF/PPT

## Auditoria associada
`GLOBAL_ACCESS_UI_AUDIT_20261001.md`
