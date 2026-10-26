# Financeiro V12 — Evidência bancária, 21/10/2026
Status: AUDITORIA BANCÁRIA INTERNA PARCIALMENTE VALIDADA. Não equivale à homologação global.
Fonte: consulta SQL read-only no Supabase yspuaamokjbrosytqjpg, schema cora_cache.
- 7.665 movimentos, 7.665 source IDs distintos.
- Primeiro movimento 2023-01-02 11:39:53 UTC; último 2026-10-21 18:55:42 UTC.
- 46 competências na fila; 46 status complete.
- Último sucesso live_sync_state 2026-10-21 19:20:19 UTC; last_error NULL.
- Confronto SQL de sum(credit/debit) dos movimentos com monthly_summary: zero divergências em 46 competências; zero resumos mensais ausentes.
Limites: essa consistência é INTERNA ao cache e resumo. Ainda é necessária prova externa de completude perante extrato oficial, validação de classificações e conciliação Trello/acertos.
A PR #142 continua draft. Produção V11 não alterada. Próxima etapa: auditoria histórica Trello; classificar cada retirada e evidência, verificar títulos divergentes do capital de giro e assegurar E2E isolado antes de promover.
