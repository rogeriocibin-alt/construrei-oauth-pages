# MAPEAMENTO_DADOS_DASHBOARD_EXECUTIVO_20261001

## Fontes canônicas / candidatas identificadas

| Indicador | Fonte recomendada agora | Regra | Estado |
|---|---|---|---|
| Serviços em andamento | Trello / GESTÃO DE OBRAS 2026 / EM ANDAMENTO | usar card resumo CR-TRELLO-LIST-SUMMARY-V2, excluindo o próprio card resumo da contagem | PRONTO |
| Valor em andamento | mesmo resumo EM ANDAMENTO | campo “Volume financeiro em execução” | PRONTO |
| Aguardando pagamento | Trello / AG. PAGAMENTO | usar card resumo da lista | PRONTO |
| Valor aguardando pagamento | mesmo resumo AG. PAGAMENTO | campo “Bruto”/volume da lista | PRONTO |
| Aguardando acerto | Trello / AG. ACERTO | usar resumo canônico da lista | PRONTO |
| Valor aguardando acerto | mesmo resumo AG. ACERTO | “Base considerada” | PRONTO |
| Visitas do dia | Supabase `cr_work_agenda_v1` | eventos de hoje, não arquivados/cancelados | PARCIAL — consulta atual retornou 0; validar completude operacional |
| F00 pendentes | Supabase `cr_f00_cases` | estados ainda não liberados ao F01 | PRONTO |
| F01 pendentes | Supabase `cr_f01_cases_v2` | atendimentos ativos não arquivados | PRONTO |
| Orçamentos | `cr_quotes_v1` seria o destino canônico | tabela está sem dados; usar fonte operacional legada somente após regra explícita | NÃO PRONTO |
| Alertas operacionais | `cr_grc_executive_pending_sources` + views summary | agregar apenas severidades operacionais reais | PARCIAL — contrato existe; agregação final ainda não definida |
| Pendências APP/WIZY/ÉDER | painel atual/legado | requer fonte canônica por responsável antes de dinamizar | NÃO PRONTO |
| Saúde técnica | health/edge/API checks | usar verificações reais; nunca inferir “operacional” sem check | PARCIAL |

## Evidência lida em 01/10/2026
### Trello — GESTÃO DE OBRAS 2026
- EM ANDAMENTO: resumo informa **11 obras / R$ 35.459,73**.
- AG. PAGAMENTO: resumo informa **8 obras / R$ 6.754,70**.
- AG. ACERTO: resumo canônico informa **12 obras / R$ 37.418,48**.

### Supabase
`cr_f00_cases`:
- AGUARDANDO_RESPOSTA: 1
- EM_COLETA: 3
- LIBERADO_F01: 10
=> F00 pendente operacional = 4 se a regra for “ainda não liberado ao F01”.

`cr_f01_cases_v2`:
- em_atendimento: 5
=> F01 pendente = 5 pelo estado atual.

`cr_work_agenda_v1`:
- consulta para visitas do dia retornou 0; isso não deve ser publicado como verdade canônica até validar se a agenda operacional está integralmente sincronizada.

`cr_quotes_v1`, `cr_financial_entries_v1`, `cr_invoices_v1`:
- estruturas canônicas existem, porém estão vazias na leitura de catálogo atual; não usar para mostrar números de produção ainda.

## Regra de governança
A HOME deve consumir uma única API consolidada. A UI nunca deve conhecer regras específicas de Trello, Supabase ou qualquer outro provedor.

Ausência de fonte = `not_available`.
Nunca converter ausência em zero.
