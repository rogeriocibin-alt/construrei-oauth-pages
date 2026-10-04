# CHECKPOINT — CENTRAL REFINEMENT CANDIDATE — 2026-10-04

## Base protegida
- Central oficial congelada: `ccc8e8a4cc97df5f7646813178287106657df9b1`
- Endpoint oficial `centro-operacoes`: não alterado nesta rodada
- Branch candidata: `cr-central-refinement-batch-20261004`

## Candidata
- UI: `https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-refinement-candidate-20261004/`
- Edge UI: `cr-central-refinement-candidate-20261004` v2
- Workspace de rascunhos: `cr-docs-workspace-candidate-20261004` v1

## Alterações isoladas
1. Saúde + Status consolidados em **Saúde e Desenvolvimento**, com leitura real de fontes e latência desta abertura.
2. **Sala da Equipe** usa Central Call/WebRTC como experiência primária da candidata; Google Meet fica como contingência.
3. **Documentação Viva** reorganizada por áreas, busca e filtro; sessão administrativa é reutilizada.
4. Edição de documentos em modo **DRAFT_CANDIDATE**; o conteúdo canônico não é alterado.
5. **Apresentação Viva** refinada para notebook/celular, preservando atualização, PDF e PowerPoint.
6. **IA & Context Gateway** usa nomes operacionais amigáveis, mantendo o identificador técnico como referência.
7. Deep-links de Status convergem para Saúde e Desenvolvimento; atalhos de Sala e Apresentação permanecem dentro da candidata.

## Gate
- Nenhuma promoção para a Central oficial sem validação humana em notebook + celular.
- Próximo passo: smoke test visual e funcional da URL candidata.
