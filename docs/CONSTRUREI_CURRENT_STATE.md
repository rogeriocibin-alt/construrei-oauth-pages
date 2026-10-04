# CONSTRU-REI — ESTADO MESTRE DA CENTRAL

> Fonte de verdade para retomada entre conversas. Não depender do histórico do chat para identificar a candidata atual.

## Estado atual — 2026-10-04

- Projeto: Central CONSTRU-REI
- Repositório: `rogeriocibin-alt/construrei-oauth-pages`
- Candidata ativa: **Agenda Inteligente / Textos Operacionais R4**
- Branch fonte: `cr-central-agenda-smarttext-candidate-20261004`
- Commit funcional da branch candidata: `4f11b69b72c1605464a038b3644bf94214ef6339`
- Publicação GitHub Pages funcional: `430dab410b51a869f660d105a6d1ed88bf5f6e43`
- Checkpoint da candidata: `CHECKPOINT_CENTRAL_AGENDA_SMARTTEXT_20261004_R4`
- Edge da Central candidata: `cr-central-agenda-smarttext-candidate-20261004` v2
- API de geração de texto: `cr-agenda-smart-text-candidate-20261004` v4
- Modelo canônico: `docs/AGENDA_TEXT_TEMPLATES_CONSTRUREI_20261004.md`
- Central oficial: **NÃO ALTERADA**
- Base oficial protegida: `ccc8e8a4cc97df5f7646813178287106657df9b1`

## Link da última candidata

https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-agenda-smarttext-candidate-20261004/

## Rodada ativa — Agenda Inteligente R4

1. Mantém **Expandir → gerar texto → copiar texto** em cada compromisso.
2. Mantém os modelos canônicos de **VISITA/VISTORIA, EXECUÇÃO e RETORNO**.
3. Remove do gerador a escolha explícita entre **Rogério/Diretoria** e **Éder/Técnico**.
4. A Agenda reutiliza silenciosamente a sessão interna disponível; não apresenta seleção de perfil no fluxo de geração.
5. Filtro obrigatório remove **valores monetários, preços, totais e parcelas** antes de entregar qualquer texto de visita, execução ou retorno.
6. A forma de pagamento pode permanecer quando disponível, desde que sem valor monetário.
7. O bloco **Orçamentos do GestãoClick** passa a ordenar os status em **ordem decrescente por quantidade de orçamentos**, com desempate alfabético.
8. A candidata usa seu próprio `clean-native.js`; não depende mais do arquivo de renderização da versão congelada para esta melhoria.
9. Navegação R2 (**Voltar • Início • Menu**) permanece preservada.
10. A versão congelada anterior continua intocada.

## Congelamento preservado — versão anterior mais completa

- Status: **CONGELADA / PRESERVADA**
- Commit exato: `2bb528851c343f6464418fadf36b115285aae916`
- Branch congelada: `cr-central-most-complete-frozen-20261004-r2`
- Checkpoint redundante: `CHECKPOINT_CENTRAL_MOST_COMPLETE_20261004_R2`
- Regra: essas referências não devem ser alteradas.

## Regra de continuidade obrigatória

Sempre que houver nova candidata, homologação, promoção, rollback ou checkpoint relevante:

1. Atualizar este arquivo no mesmo ciclo.
2. Registrar link público funcional, branch, commits funcionais/publicados, checkpoint e estado da oficial.
3. Nunca usar somente o histórico do chat como fonte de verdade.
4. Ao retomar o projeto, consultar este arquivo primeiro.
5. Não promover para a Central oficial sem gate de validação humana em notebook + celular.
6. Manter a versão oficial protegida enquanto a candidata estiver em validação.

## Última atualização

2026-10-04 — R4: sem escolha Rogério/Éder no gerador; sessão transitória reutilizada sem persistência extra; valores monetários removidos dos textos; GestãoClick em ordem decrescente por volume.
