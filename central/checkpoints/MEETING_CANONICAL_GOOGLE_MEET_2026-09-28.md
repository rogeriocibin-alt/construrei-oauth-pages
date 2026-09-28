# MEETING CANÔNICO — GOOGLE MEET — 2026-09-28

## Estado canônico
- MEETING_CANONICAL_PROVIDER: GOOGLE_MEET
- MEETING_CANONICAL_URL: https://meet.google.com/xtw-rihq-jwi
- CENTRAL_CALL_ROLE: CONTINGENCY_ONLY
- CENTRAL_CALL_FALLBACK: https://rogeriocibin-alt.github.io/construrei-oauth-pages/central/call.html?v=central-call-restored-20260928-r1
- Rota oficial: Central -> Meeting -> Google Meet
- A Central Call não pode assumir automaticamente a rota Meeting.

## Causa da regressão
Em 2026-09-08, o registro ativo de cc_call_rooms passou a usar a Central Call/WebRTC como provider principal e o centro-operacoes passou a sobrescrever meeting.join_url para a Central Call. Isso deslocou o Google Meet para fallback e introduziu dependência de captura própria de mídia.

## Alterações aplicadas
- GitHub central/index.html: Meeting abre externamente, sem iframe, em qualquer dispositivo.
- O botão da Central voltou a ser identificado como Google Meet.
- Supabase centro-operacoes: Google Meet restaurado como provider e URL canônicos.
- Supabase central-public-api-p0: links.meeting, links.meet e meeting.join_url retornam o Google Meet diretamente.
- public.cc_call_rooms/main: provider e join_url atualizados para Google Meet.

## Versões / rastreabilidade
- GitHub commit da restauração da UI: 46e87a0b9198ecb7f9a817f776191c237d9c313b
- Backup GitHub pré-restauração: backup/meeting-pre-google-meet-restore-20260928
- Central Call diagnóstico anterior preservado: commit e86ea82900cad08a114a05a3c1e9ccb134581976
- centro-operacoes: versão anterior 259; versão canônica 260
- central-public-api-p0: versão anterior 15; versão canônica 16

## Estado anterior do banco para rollback
- cc_call_rooms.id: main
- provider anterior: Central Call dedicada • WebRTC + Google Meet fallback
- join_url anterior: https://wheat-otter-jungle.pagey.site/

## Validações automáticas executadas
- centro-operacoes public-summary: meeting.join_url = Google Meet
- centro-operacoes public-summary: links.meeting = Google Meet
- centro-operacoes public-summary: links.meet = Google Meet
- canonical_provider = GOOGLE_MEET
- central_call_role = CONTINGENCY_ONLY
- central-public-api-p0: meeting.join_url, links.meeting e links.meet = Google Meet
- Central publicada: Meeting abre em nova aba e botão usa título Google Meet
- Rota /centro-operacoes?open=meeting: HTTP 302 para https://meet.google.com/xtw-rihq-jwi

## Regra de não regressão
Nenhum renderer, deploy, checkpoint, refatoração ou alteração de Central pode substituir MEETING_CANONICAL_PROVIDER ou MEETING_CANONICAL_URL sem uma mudança explícita de arquitetura. A Central Call é somente contingência.

## Rollback
1. Restaurar central/index.html a partir do branch backup/meeting-pre-google-meet-restore-20260928.
2. Restaurar centro-operacoes versão 259 se necessário.
3. Restaurar central-public-api-p0 versão 15 se necessário.
4. Restaurar cc_call_rooms/main aos valores registrados na seção "Estado anterior do banco para rollback".

## Gate humano
A rota e a arquitetura foram validadas automaticamente. Câmera, microfone e compartilhamento de tela passam a ser responsabilidade nativa do Google Meet e devem ser confirmados em um navegador/app Google Meet real por um participante, não pela Central.
