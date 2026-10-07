# CHECKPOINT — Índice Mestre de Regras Canônicas V1 — 07/10/2026

## Estado atual
Candidata de governança criada para consolidar regras, precedência, revogações, fontes e freios de desenvolvimento no Gestor do Projeto.

## Branch
`candidate/canonical-governance-index-20261007`

## Ações concluídas
- Criado `docs/CANONICAL_RULES_MASTER_INDEX_V1_20261007.md`.
- Consolidada regra de precedência e regra de revogação.
- Registradas 14 regras canônicas estruturadas no `gestor-projeto/project-data.json`.
- Incluída regra de checkpoint de continuidade aproximadamente a cada 10 minutos de conversa ativa e antes de pausas/troca de dispositivo quando possível.
- Incluída regra de independência de dispositivo.
- Incluídas regras de fonte única de pendências, baseline+delta de auditoria, alçadas de agentes, Financeiro REI e identidade/antirregressão.
- Tela `Regras Canônicas` do Gestor ganhou resumo, filtros, precedência, fontes vigentes/revogadas e gate antes de desenvolver.
- Navegação `Cadeia Canônica` renomeada para `Regras Canônicas`.

## Commits desta candidata
- `57cac4e383c3594a306629d9c7fe53d0d24fea60` — índice mestre documental.
- `cd29cca2f794438e3c173950a4e2595796d909f8` — dados estruturados de governança.
- `5db8ede7c56099e2320be9ea4c5c735db676b9a1` — filtros/resumo/precedência na interface.
- `bc46ec33ec2ba936507ece4f97ef13918dc7db0f` — nomenclatura da navegação.

## Validação técnica
- Sintaxe de `gestor-projeto/app.js`: PASS.
- Parse JSON de `gestor-projeto/project-data.json`: PASS.
- 14 regras estruturadas carregáveis.
- Diff contra `main`: somente 4 arquivos de governança/interface alterados antes deste checkpoint.
- Produtos operacionais Central/APP/F00–F09: não alterados.

## Decisões tomadas
1. Gestor do Projeto é a porta de entrada única para consulta das regras canônicas.
2. Regra mais recente e vigente prevalece; documento explicitamente retirado nunca pode voltar por causa de texto antigo.
3. Não duplicar documentação completa no Gestor: exibir índice + evidência + fonte.
4. Toda execução técnica relevante deve consultar o gate canônico antes de alterar produto.

## Última ação concluída
Validação estática da candidata e conferência do diff.

## Próxima ação
Criar PR da candidata para revisão e entregar link de teste/revisão sem promover a versão oficial.

## Bloqueios
Nenhum bloqueio técnico conhecido nesta etapa. Falta validação visual/funcional do Owner antes de qualquer promoção.
