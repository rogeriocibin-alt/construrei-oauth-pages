# CHECKPOINT — Índice Mestre de Regras Canônicas V1 — 07/10/2026

## Estado atual
Candidata de governança criada para consolidar regras, precedência, revogações, fontes e freios de desenvolvimento no Gestor do Projeto.

## Branch
`candidate/canonical-governance-index-20261007`

## Ações concluídas
- Criado `docs/CANONICAL_RULES_MASTER_INDEX_V1_20261007.md`.
- Consolidada regra de precedência e regra de revogação.
- Registradas 25 regras canônicas estruturadas no `gestor-projeto/project-data.json`.
- Incluída regra de checkpoint de continuidade aproximadamente a cada 10 minutos de conversa ativa e antes de pausas/troca de dispositivo quando possível.
- Incluída regra de independência de dispositivo.
- Incluídas regras de fonte única de pendências, baseline+delta de auditoria, alçadas de agentes, Financeiro REI e identidade/antirregressão.
- Tela `Regras Canônicas` do Gestor ganhou resumo, filtros, precedência, fontes vigentes/revogadas e gate antes de desenvolver.
- Busca global passou a localizar regras e fontes canônicas.
- Conflitos e dubiedades passaram a ser objetos explícitos no Gestor, com fonte, regra, severidade e resolução.
- Foram indexadas 14 fontes canônicas/de domínio.
- Metadados visuais do Gestor foram alinhados à versão oficial V1.2.3 já declarada em `version.json`, removendo a divergência V1.2.2 × V1.2.3 da candidata.
- Navegação `Cadeia Canônica` renomeada para `Regras Canônicas`.

## Commits desta candidata
- `57cac4e383c3594a306629d9c7fe53d0d24fea60` — índice mestre documental.
- `cd29cca2f794438e3c173950a4e2595796d909f8` — dados estruturados de governança.
- `5db8ede7c56099e2320be9ea4c5c735db676b9a1` — filtros/resumo/precedência na interface.
- `bc46ec33ec2ba936507ece4f97ef13918dc7db0f` — nomenclatura da navegação.

## Validação técnica
- Sintaxe de `gestor-projeto/app.js`: PASS.
- Parse JSON de `gestor-projeto/project-data.json`: PASS.
- 25 regras estruturadas carregáveis.
- Diff contra `main`: somente arquivos de governança/interface/documentação do Gestor; Central/APP/F00–F09 permanecem intocados.
- Produtos operacionais Central/APP/F00–F09: não alterados.

## Decisões tomadas
1. Gestor do Projeto é a porta de entrada única para consulta das regras canônicas.
2. Regra mais recente e vigente prevalece; documento explicitamente retirado nunca pode voltar por causa de texto antigo.
3. Não duplicar documentação completa no Gestor: exibir índice + evidência + fonte.
4. Toda execução técnica relevante deve consultar o gate canônico antes de alterar produto.

## Última ação concluída
Validação estática da candidata e conferência do diff.

## Próxima ação
PR #39 criado como **draft** para revisão. Aguardar validação do Owner antes de qualquer merge/promoção.

## Bloqueios
Nenhum bloqueio técnico conhecido nesta etapa. Falta validação visual/funcional do Owner antes de qualquer promoção.


## Delta posterior ao checkpoint inicial
- `912e09640567e77760c368289e2928df211a56c5` — app alinhado à release oficial V1.2.3.
- `9fb76ebd7ba6b9d8eed145d4c4428e9616d59868` — shell alinhado à release oficial V1.2.3.
- `6b5dd6d58b3a7a498c6d56abaa80aa5a4045931b` — manuais canônicos de agentes indexados.
- `e0896f9849ef25d205ad81124fe90fcf257e9757` — regras adicionais de fonte, maturidade, reutilização e arquitetura.
- `d173131c22cb74c5bd00a74832dad5583cdd9ac9` — filtros ampliados.
- `836a105063b565cbf6da2230ff3eb8f1460f22b3` — índice mestre documental ampliado.
- `e4a6d98de17fcebd572feea480efce25f7522aa5` — busca global inclui regras/fontes.
- `4ba01d6d411c885cb33a79c18719caa2df016849` — dica de busca atualizada.
- PR: **#39** — `Gestor: Índice Mestre de Regras Canônicas V1` — draft.


## Continuação — saneamento de conflitos
- `5d39f98f08c841e378c56fcc126bc666a9f8b6c1` — 25 regras + registro de conflitos.
- `62bad07bd457482217175d3c33c9d3dd0a212ed6` — fontes de continuidade/Central/links indexadas.
- `4ba31be4d6cb2310c6bc8079e58da249a0c23d16` — painel de conflitos/dubiedades na tela Regras Canônicas.
- `dd76eff3f399358857e1dfffc09adf8ffd61a14c` — política de conflitos e guardrails documentais ampliados.
