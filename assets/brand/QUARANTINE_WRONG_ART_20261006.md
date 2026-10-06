# QUARENTENA — ARTES INCORRETAS — 2026-10-06

## Status
**NÃO UTILIZAR / NÃO HOMOLOGAR / NÃO PROMOVER**

As pastas abaixo contêm artes recebidas incorretamente e ficam preservadas apenas por rastreabilidade:

- `assets/brand/construrei-app-v1/`
- `assets/brand/construrei-app-v2/`

## Regra obrigatória
1. Nenhuma superfície ativa deve referenciar V1 ou V2.
2. Nenhum agente deve usar esses arquivos como fonte visual ou exemplo.
3. Não apagar o histórico Git: ele é o mecanismo de auditoria/rollback.
4. Até um novo kit ser fornecido e validado, usar a identidade imediatamente anterior ao Brand Canonical V1.
5. Funcionalidades, dados, integrações, financeiro e links não devem ser revertidos por causa desta retirada visual.

## Proteção
- Snapshot pré-recuperação: `safety/pre-revert-brand-art-20261006`
- Branch de recuperação: `recovery/remove-wrong-brand-20261006`
- Supabase `construrei-logo`: recuperação em versão 31 usando os ativos históricos de `app_public_assets`.
