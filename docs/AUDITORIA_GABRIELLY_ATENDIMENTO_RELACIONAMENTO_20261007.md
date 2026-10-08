# CONSTRU-REI — Auditoria de continuidade: Gabrielly, Atendimento e Relacionamento
Data: 2026-10-07
Estado: AUDITORIA PARCIAL VERIFICADA / NÃO HOMOLOGADO
Área: APP CONSTRU-REI > Gabrielly > Atendimento e Relacionamento
Regra: não alterar a Central, APP homologado, F00–F09 nem fluxos publicados.

## Fonte de código conferida
- Branch principal: `main`
- Candidata existente: `preview/app-official-candidate-20261002/index.html`
- Blob da candidata em main: `5dc444a52fd703c32a9b91bc13be293c22f9eea6`.
- Candidata original em `cr-app-official-candidate-fusion-20261002`: blob `05b148385fe3b1606db8e869d2b2ccb2ee2522f4`.
- Preservar branch main e produção até validação humana. A candidata em main evoluiu depois da fusão inicial.
- Metadados no HTML principal indicam `APP-GABI-F01-CRM-UX-V11-20261002`, `APP=casa;GabiFlow=Atendimento;F00=motor`.
- Endpoint explícito no HTML: `/functions/v1/cr-f00-intake-candidate-20261002`; existe referência à `cr-agenda-executive-v8-candidate-20261002`.
- O HTML inspecionado não contém referência direta textual a Trello nem Google Calendar. Isto não comprova ausência de integração indireta; verificar backend.
- Existe passagem F00/F01, fila, próximas ações, encerramento e áreas de atendimento; falta testar todos os cenários reais no celular e notebook.

## Banco de dados — inspeção somente leitura
Projeto: `yspuaamokjbrosytqjpg` (CONSTRU-REI Centro de Controle).
Todas as tabelas relevantes listadas reportaram RLS habilitado:
- `cr_f00_cases`: casos de captura, `awaiting_response`, `released_f01`, `trello_status`, `trello_card_id`, `trello_card_url`.
- `cr_cases_v1`: prioridade, responsável, status, próxima ação, origem, vínculo e rastreabilidade.
- `cr_work_items_v1`: motor compartilhado de pendências e ações, não exclusivo da Gabrielly.
- `cr_work_agenda_v1`: confirmação de executor/cliente, vínculo com caso, conflitos, tipo de evento, classe de privacidade.
- `cr_work_communications_v1`: comunicações vinculadas a casos.
- `cr_flow_handoffs`: passagem entre fluxos, idempotência e status.
- `cr_agenda_private_details_v1`: detalhes pessoais segregados.
- `cr_rbac_permission_matrix`: função `OPERACAO_ATENDIMENTO_GABI` tem WRITE para `F01_TRIAGEM` e `F02_ORCAMENTO`, NONE para `GRC_ADMIN`. Não inferir permissão para preço, margem, finanças ou tarefas master.
Contagens no momento da inspeção são amostrais; não representam produção completa nem qualidade dos dados.

## Missão da Gabrielly — ordem operacional definida pela direção
1. Porta de entrada: imobiliárias, WhatsApp empresarial, e-mail e solicitações novas.
2. Emergência informada por cliente.
3. Emergência informada por colaborador.
4. Receber, triar, completar e encaminhar os chamados e contatos.
5. Estruturar pré-orçamentos no F02 com dados das coletas.
6. Comunicar, registrar, atualizar sistema formal (GestãoClick/APP), retornar e cobrar informações.
Exceção P0: risco real imediato se sobrepõe a qualquer posição administrativa da fila.

## Premissas preservadas
- Nome oficial visível: Gabrielly — Atendimento e Relacionamento, dentro do APP CONSTRU-REI. Não renomear para cockpit.
- Gabi Flow = experiência operacional/pessoal da função; não outro CRM, nem sistema paralelo.
- 1 caso -> 1 número -> 1 histórico -> múltiplos envolvidos; origem e próxima ação rastreadas.
- F00 captura, F01 triagem, F02 orçamento, F03 aprovação; áreas posteriores acessíveis conforme papel.
- Confirmação de prestador, morador/acesso, envolvidos e atualização da agenda/registro antes da visita.
- Pagador e forma de pagamento identificados antes de assumir compromisso financeiro/execução.
- Resposta ao cliente em tom neutro sem promessa técnica ou responsabilidade antes de diagnóstico.
- Agenda operacional e compromissos pessoais com segregação de acesso.
- Escrita transacional depende de integração autenticada, idempotência e trilha de auditoria.
- Identidade visual canônica azul institucional/marinho/branco/amarelo, avatar humano Gabrielly contextual.
- Gestor do Projeto é a fonte mestre das pendências do desenvolvimento; visões APP/WIZY/Éder são projeções apenas no próprio escopo APP.

## Métricas candidatas (NÃO são resultados medidos ou metas aprovadas)
Primeira resposta por canal e por cliente, entradas sem atendimento, urgências sem confirmação, prazo para concluir F01, quantidade de lacunas de coleta, pré-orçamentos preparados, propostas aguardando retorno, confirmação de acesso e executor, retornos vencidos, chamados sem responsável/próxima ação, duplicidades por mesmo problema.
Definir SLA somente após auditoria da distribuição histórica real e aprovação de Rogério.

## Lacunas antes de nova candidata operacional
P0 — Auditar contrato e segurança da Edge `cr-f00-intake-candidate-20261002`, login real, autorização por usuário e error handling.
P0 — Confirmar dados reais dos conectores WhatsApp empresarial, Gmail, GestãoClick, Trello, Calendar e Cora, sem presumir bidirecionalidade.
P0 — Verificar status e autorização do F00-F01-F02-F03, incluindo gates, reconciliação, origem canônica e evita-duplicidade.
P0 — Testes de isolamento de agenda pessoal, visibilidade autorizada de dados, segregação de finanças e falhas de conexão.
P1 — Definir motor de prioridades com regra P0 emergências, prioridades 1–6 e SLA calibrado.
P1 — Tela compacta: agora, entradas, casos, pré-orçamentos, agenda e relacionamentos, sem redesign do APP.
P1 — Agente BIO: consultas e rascunhos primeiro; escritas só por ferramentas/serviços autenticados com aprovação e auditoria.
P2 — Métricas e melhoria contínua baseadas em histórico validado, sem mudar política empresarial automaticamente.
P2 — Testar em celular e notebook, checkpoint, rollback e homologação explícita.

## Próxima ação
Mapear integrações server-side e contrato de leitura/escrita existente; examinar fluxos de escopo/convites; gerar candidata isolada por evolução incremental do HTML mais completo, sem tocar a produção.

### Registro e limites
Este checkpoint registra auditoria parcial fundamentada em GitHub e esquema do Supabase, além dos arquivos históricos APP; não representa auditoria exaustiva de todas as conversas nem comprova integração operacional ponta a ponta. Nenhuma funcionalidade foi homologada, nenhuma automação foi alterada e nenhum dado operacional foi escrito.
