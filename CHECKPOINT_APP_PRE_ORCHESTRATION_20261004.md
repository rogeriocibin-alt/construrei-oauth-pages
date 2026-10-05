# CHECKPOINT PRE-ORCHESTRATION 2026-10-04
Branch: cr-app-checklist-native-f00-f09-candidate-20261004
HEAD before orchestration: 3547ff4c651849384cad680ac02be3f93b0a3e5f
Scope: unificar identidade/handoffs, Agenda Core, QA/homologação e operação F00-F09.
Protected: production/*, Central R9, APP canônico.
Audit findings:
- cr_flow_handoffs already has case_id/request_id/correlation_id/idempotency_key/revision.
- cr_flow_events has case_id but legacy event writers do not consistently populate it.
- cr_work_agenda_v1 is the canonical agenda authority and already has case_id/request_id/work_order_id/idempotency/conflict/resource semantics.
- F04-F09 share cr-flow-runtime-v2; isolated mode uses localStorage and must remain QA-only.
- F04 currently persists schedule-shaped data in flow_data; this must become snapshot/context, not a second agenda.
