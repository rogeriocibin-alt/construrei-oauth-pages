# HOMOLOGAÇÃO — GESTOR DO PROJETO V1.1.2 + LINKS OFICIAIS

Data: 2026-10-05

## Estado

- Status: **OFICIAL / HOMOLOGADA / CONGELADA**
- Produto: Gestor do Projeto CONSTRU-REI
- Versão: **V1.1.2**
- Build: `CR-PM-V1.1.2-LINKS-OFFICIAL-20261005`
- Branch de promoção: `cr-project-manager-v1-1-2-links-official-20261005`
- Checkpoint: `CHECKPOINT_PROJECT_MANAGER_V1_1_2_LINKS_OFFICIAL_20261005`
- Rollback: `CHECKPOINT_PROJECT_MANAGER_V1_1_1_CANONICAL_PROMOTED_20261003`

## Mudança homologada

1. A Home do Gestor passa a exibir **Links Oficiais** junto aos acessos principais do proprietário.
2. O botão usa o alias estável `/links-oficiais/`, sem depender de URL técnica ou commit.
3. Foi criado o alias estável **`/gestor-projeto/`** para o próprio Gestor.
4. A página de Links Oficiais foi evoluída para **v1.3** e passou a registrar o Gestor do Projeto no grupo Núcleo.
5. Os links oficiais já usados pela equipe não foram trocados nem quebrados.
6. A Central R9 + Agenda v5 permanece intocada; esta homologação é exclusiva da camada de governança/links do Gestor.

## Regra antirregressão

- Manter o PWA no mesmo diretório atual para preservar atualização instalada.
- Evoluções futuras do Gestor devem nascer em branch isolada e ganhar checkpoint antes de promoção.
- O alias `/gestor-projeto/` deve permanecer estável mesmo quando a implementação interna mudar.
- O diretório `/links-oficiais/` é a fonte humana de acesso; `docs/official-links-registry.json` é o registro estruturado.

## Autorização

Homologação autorizada explicitamente pelo proprietário em 05/10/2026, com pedido de oficialização no Git e preservação dos links em uso.
