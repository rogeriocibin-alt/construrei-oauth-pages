# CHECKPOINT — Central • Documentação Operacional • Stability V15 — 2026-10-06

## Objetivo
Eliminar o travamento da Documentação Operacional sem regressão visual ou funcional da Central.

## Causa técnica confirmada
- A camada de identidade humana V9/V14 mantinha um MutationObserver global no document.
- O mount regravava blocos humanos em resposta às próprias mutações do DOM.
- A Documentação também possuía renderização concorrente: o render técnico geral escrevia em #docsTable e o renderer operacional escrevia no mesmo destino.
- Essa combinação podia provocar ciclo de renderização, perda de responsividade e mistura de documentação técnica com documentação operacional.

## Correção V15
- Removido o MutationObserver global da identidade humana.
- Mantidos observers apenas nos hosts necessários:
  - Agenda -> agenda()
  - Documentação -> docsOwners()
  - Pendências -> pendingCards()
- Blocos de responsável e Academy passam a usar assinatura/idempotência antes de alterar DOM.
- #docsTable passa a ter um único dono: renderer da Documentação Operacional.
- renderDev não escreve mais no #docsTable.
- Após carregar DEV, crDocsInit() é disparado para montar a visão operacional.
- Documentos de arquitetura, releases, APIs, schema, deploy, GitHub, Supabase, infraestrutura, auditoria, ADR, checkpoint, branch, commit, desenvolvimento, código-fonte, Edge Function e banco de dados permanecem excluídos da Central e pertencem ao Gestor do Projeto.
- human-identity-v9.js cache-bust: v15.

## Escopo preservado
- Cinco acessos principais: Cora, Trello, GestãoClick, Wizy Flow e Gmail CONSTRU-REI.
- Wizy Flow: https://app.wizyflow.com.br
- Gmail operacional: contatoconstrurei@gmail.com
- Apresentação Institucional moderna com equipe humana na página 02:
  /production/central-operacional-v2-ux-r1-2-homologada-20261005/presentation/

## Regra antirregressão
Nunca reintroduzir observer global de DOM para a camada humana da Central. Observers devem ser locais, idempotentes e restritos ao componente que precisam acompanhar.
