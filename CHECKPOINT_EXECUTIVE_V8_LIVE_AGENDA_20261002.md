# Checkpoint — Central Executiva V8 Agenda Viva — 2026-10-02

## Base preservada
- V6 aprovada continua congelada em `43edad3801f5e38cf2604b82dc45be33aff3bc29`.
- Branch canônica aprovada: `cr-central-executive-v6-canonical-approved-20261002`.
- Checkpoint V6: `CHECKPOINT_CENTRAL_EXECUTIVE_V6_APPROVED_20261002`.
- Central oficial não alterada.

## V8 candidata
- Commit loader: `caeb85fd5eb747911ab071c57ad2801542d25b61`.
- Branch: `cr-central-executive-v8-live-agenda-candidate-20261002`.
- Checkpoint: `CHECKPOINT_CENTRAL_EXECUTIVE_V8_LIVE_AGENDA_20261002`.
- API: `cr-agenda-executive-v8-candidate-20261002`.
- UI: `preview/central-executive-v8-live-agenda-candidate-20261002/`.

## Arquitetura da Agenda Viva
- Fonte de data/agendamento: Trello `GESTÃO DE OBRAS 2026`, campos `start` / `due` dos cards operacionais.
- Enriquecimento/conciliação: GestãoClick `/orcamentos` e `/ordens_servicos`, por número de orçamento.
- Não usa o endpoint web privado da Agenda do GestãoClick e não armazena `x-token-auth`.
- A Agenda oficial do Click pode continuar aberta como módulo auxiliar na V7/V8.

## Validação executada em 02/10/2026
- Trello: leitura OK.
- GestãoClick Orçamentos: leitura OK.
- GestãoClick O.S.: leitura OK.
- Agenda Viva:
  - Hoje: 0 agendamentos reais.
  - Amanhã (03/10): 1 agendamento real.
  - Pendência de ontem: 1.
  - O evento de amanhã e a pendência de ontem possuem conciliação com GestãoClick.
- Cobertura: 182 cards Trello com data operacional; 109 conciliados com orçamento/O.S. no GestãoClick.
- Escritas externas: desativadas.
- Produção: intocada.

## Regra
Zero só é exibido quando Trello respondeu e a contagem foi realmente zero. Fonte indisponível nunca vira zero.
