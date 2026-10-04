# CONSTRU-REI — ESTADO MESTRE DA CENTRAL

> Fonte de verdade para retomada entre conversas. Não depender do histórico do chat para identificar a candidata atual.

## Estado atual — 2026-10-04

- Projeto: Central CONSTRU-REI
- Repositório: `rogeriocibin-alt/construrei-oauth-pages`
- Candidata ativa: **Agenda Inteligente / Textos Operacionais R6**
- Branch fonte: `cr-central-agenda-smarttext-candidate-20261004`
- Commit funcional da branch candidata: `dee1298fff02653b38e7bccd67650907ea6b3419`
- Publicação GitHub Pages funcional: `1d710b4c6c9a0781d04b9ae9b96147a146e48f22`
- Checkpoint da candidata: `CHECKPOINT_CENTRAL_AGENDA_SMARTTEXT_20261004_R6`
- Edge da Central candidata: `cr-central-agenda-smarttext-candidate-20261004` v5
- API de geração de texto: `cr-agenda-smart-text-candidate-20261004` v6
- Modelo canônico: `docs/AGENDA_TEXT_TEMPLATES_CONSTRUREI_20261004.md`
- Central oficial: **NÃO ALTERADA**
- Base oficial protegida: `ccc8e8a4cc97df5f7646813178287106657df9b1`

## Link da última candidata

https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-agenda-smarttext-candidate-20261004/

## Rodada ativa — Agenda Inteligente R6

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
11. O gerador não depende mais de sessão Rogério/Éder: ele valida silenciosamente se o compromisso existe na Agenda operacional de hoje/amanhã e só então consulta o GestãoClick.
12. A API não aceita consulta livre por número de orçamento; o escopo fica limitado aos eventos realmente agendados, preservando a segurança dos dados.

13. Correção anti-cache: o gerador usa novo arquivo físico `agenda-smart-text-r6.js`, carregado diretamente pelo HTML antes dos refinamentos; o loader legado foi removido para impedir retorno do código com `sess()/auth()`.
14. O aviso amarelo “Sessão interna indisponível” deixa de fazer parte do fluxo desta candidata.
15. Saneamento final de valores: remove `R# CONSTRU-REI — ESTADO MESTRE DA CENTRAL

> Fonte de verdade para retomada entre conversas. Não depender do histórico do chat para identificar a candidata atual.

## Estado atual — 2026-10-04

- Projeto: Central CONSTRU-REI
- Repositório: `rogeriocibin-alt/construrei-oauth-pages`
- Candidata ativa: **Agenda Inteligente / Textos Operacionais R6**
- Branch fonte: `cr-central-agenda-smarttext-candidate-20261004`
- Commit funcional da branch candidata: `dee1298fff02653b38e7bccd67650907ea6b3419`
- Publicação GitHub Pages funcional: `1d710b4c6c9a0781d04b9ae9b96147a146e48f22`
- Checkpoint da candidata: `CHECKPOINT_CENTRAL_AGENDA_SMARTTEXT_20261004_R6`
- Edge da Central candidata: `cr-central-agenda-smarttext-candidate-20261004` v5
- API de geração de texto: `cr-agenda-smart-text-candidate-20261004` v6
- Modelo canônico: `docs/AGENDA_TEXT_TEMPLATES_CONSTRUREI_20261004.md`
- Central oficial: **NÃO ALTERADA**
- Base oficial protegida: `ccc8e8a4cc97df5f7646813178287106657df9b1`

## Link da última candidata

https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-agenda-smarttext-candidate-20261004/

## Rodada ativa — Agenda Inteligente R6

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
11. O gerador não depende mais de sessão Rogério/Éder: ele valida silenciosamente se o compromisso existe na Agenda operacional de hoje/amanhã e só então consulta o GestãoClick.
12. A API não aceita consulta livre por número de orçamento; o escopo fica limitado aos eventos realmente agendados, preservando a segurança dos dados.

13. Correção anti-cache: o gerador usa novo arquivo físico `agenda-smart-text-r6.js`, carregado diretamente pelo HTML antes dos refinamentos; o loader legado foi removido para impedir retorno do código com `sess()/auth()`.
, preços/totais e também números monetários isolados como `2900.00`/`2.900,00` do texto operacional.
16. Deduplicação semântica de serviços: elimina cabeçalhos como “ESCOPO DOS SERVIÇOS” e mantém somente a descrição mais completa quando orçamento, ordem de serviço e Agenda repetem o mesmo escopo.

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

2026-10-04 — R6 saneada: gerador sem sessão/perfil, API v6 com bloqueio reforçado de valores monetários e deduplicação semântica do escopo; interface R6 permanece a mesma.


## Registro vivo de pendências — 2026-10-04

- APP/SISTEMA: **AUTOMÁTICO**
- WIZY: **MANUAL**
- ÉDER: **MANUAL**
- Edge Function: `cr-pendencias-auto-sync-20261004` v1
- Cron: `cr-pendencias-auto-sync-15m` • `*/15 * * * *`
- Documento de arquitetura: `docs/PENDENCIAS_LIVE_REGISTRY_20261004.md`
- Primeiro ciclo validado: HTTP 200 • 60 commits lidos • 51 evidências anexadas • 2 registros novos.
- Estado consolidado posterior: 8 registros `AUTO-*` e 79 evidências automáticas.
- Estruturas usadas: `cc_items`, `cc_changes`, `cr_operational_evidence`, `cc_snapshots`.
- Regra de segurança: a automação não conclui WIZY nem itens dependentes de ação/validação manual do Éder.


## Executivo R7 — medidor de execução + painel compacto de pendências

- Data: 2026-10-04
- Candidata: `cr-central-agenda-smarttext-candidate-20261004`
- Commit funcional: `0d6e3c3e9b5c3127b7a87001efc0dfdafb498159`
- Checkpoint: `CHECKPOINT_CENTRAL_EXEC_PENDING_R7_20261004`
- Edge da Central candidata: `cr-central-agenda-smarttext-candidate-20261004` v6
- Fonte executiva de pendências: `cr-pendencias-executive-v2-candidate-20261004` v1
- Medidor atual no momento da implementação: **51% de avanço operacional ponderado**
- Base viva no momento da implementação: **93 itens ativos**, sendo 16 concluídos, 15 em validação, 25 em andamento, 31 aguardando, 5 bloqueados e 1 não iniciado.
- Painel compacto: APP **14 abertas**, WIZY **22 abertas**, ÉDER **6 manuais**.
- Regra do medidor: Concluído 100% • Em validação 75% • Em andamento 50% • Aguardando 25% • Bloqueado/Não iniciado 0%.
- O valor é um **índice de execução por status**, não percentual de conclusão financeira nem percentual físico de obra.
- APP/SISTEMA continuam automáticos no registro vivo; WIZY/ÉDER permanecem manuais.
- A versão congelada anterior permanece preservada.
