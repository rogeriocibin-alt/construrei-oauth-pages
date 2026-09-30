# PHASE 5 — HOME LINK / ACTION AUDIT — 2026-09-30

| Element | Expected | Previous | Canonical / final | Status |
|---|---|---|---|---|
| Sidebar Dashboard Executivo | HOME SPA | dashboard | dashboard | OK |
| Sidebar Status Desenvolvimento | internal SPA | status | status | OK |
| Sidebar APP | official APP | Supabase central-atendimento mode=app | same canonical endpoint | OK |
| Sidebar Esteira | internal SPA | flows | flows | OK |
| Sidebar Checklist | internal module | checklist | checklist, then canonical checklist URL | OK |
| Sidebar Homologação | internal SPA | homolog | homolog | OK |
| Sidebar APP Pendências | internal SPA | pendapp | pendapp | OK |
| Sidebar Wizy | internal SPA | wizy | wizy | OK |
| Sidebar Éder Agora | internal SPA | eder | eder | OK |
| Sidebar IA Context | internal SPA | context | context | OK |
| Sidebar Documentação | canonical docs | centro-operacoes?open=docs | same | OK |
| Sidebar Google Meet | internal module | meeting | meeting -> canonical Meet | OK |
| Sidebar Apresentação | internal module | presentation | presentation -> live 38p URL | CORRIGIDO |
| Sidebar Academy | internal SPA | academy | academy | OK |
| Sidebar Saúde | internal SPA | health | health | OK |
| Sidebar Éder Admin | canonical technical | centro-operacoes?open=technical | same | OK |
| Sidebar Rogério Diretor | canonical admin | centro-operacoes?open=admin | same | OK |
| Topbar Voltar | internal history | browser history | canonical SPA stack | CORRIGIDO |
| Topbar Pesquisa | no real engine | looked active | disabled / honest unavailable state | CORRIGIDO |
| Topbar Notificações | no real subsystem | looked active | disabled / honest unavailable state | CORRIGIDO |
| Hero Dashboard V4 | canonical Director Dashboard | obsolete Pagey URL | GitHub canonical dashboard v14 | CORRIGIDO |
| Hero APP | official APP | mode=app | same | OK |
| Hero F00→F09 | internal Esteira | flows | flows | OK |
| Hero Apresentação | internal module | presentation | presentation -> live 38p URL | OK |
| Hero Academy | internal module | academy | academy | OK |
| Hero Base Técnica | canonical docs | docs | docs | OK |
| Ver detalhes operação | operational view | status development | flows | CORRIGIDO |
| Quick Dashboard V4 | canonical Director Dashboard | obsolete Pagey injected handler | GitHub canonical dashboard v14 | CORRIGIDO |
| Quick APP | canonical APP | APP URL | APP URL | OK |
| Quick F00→F01 | actual capture/qualification start | flows overview | canonical F00 route | CORRIGIDO |
| Quick Checklist | actual checklist | internal intermediate page | checklistobrasconstrurei.vercel.app | CORRIGIDO |
| Quick Google Meet | actual room | internal intermediate page | meet.google.com/xtw-rihq-jwi | CORRIGIDO |
| Quick Apresentação | live canonical presentation | internal intermediate page | presentation 38p live URL | CORRIGIDO |
| Quick Academy | internal Academy | academy | academy | OK |
| F00–F09 HOME cards | actual flow | generic iframe workspace | direct canonical mode=f00...f09 routes | CORRIGIDO |
| F00–F09 secondary action | copy link | copy link | copy link | OK |
| Pendências APP | internal pending board | pendapp | pendapp | OK |
| Pendências Wizy | internal Wizy board | wizy | wizy | OK |
| Pendências Éder | internal Éder board | eder | eder | OK |
| Saúde Ver detalhes | internal health | health | health | OK |

## Endpoint validation
- Dashboard V4: HTTP 200
- APP: HTTP 200
- F00–F09: HTTP 200 for all 10 canonical routes
- Checklist: HTTP 200
- Google Meet: HTTP 200
- Presentation live: HTTP 200
- Documentation: HTTP 200

## Canonical sources used
- `centro-operacoes?api=public-summary` live response on 2026-09-30.
- `links`, `buttons`, `flows`, `meeting`, `presentation`, and `access` canonical fields from that response.
- No route invented.
