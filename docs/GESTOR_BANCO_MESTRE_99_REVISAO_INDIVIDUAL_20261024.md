# CONSTRU-REI — Auditoria individual do Banco Mestre: 99 registros não finais
**Data:** 24/10/2026 · **Origem:** consulta READ-ONLY `Supabase public.cc_items` após saneamento de 5 registros, mais provas estáticas GitHub. 
**Natureza:** inventário item a item com situação e gate; **NÃO é prova externa de conclusão, aceite E2E, conferência de extratos ou data de execução do Cofre**.

## Quadro de controle
- Banco Mestre: **275** registros (135 concluídos, 41 cancelados, **99 não finais**). Nenhum dos 99 foi encerrado sem prova.
- Estados: Em validação 15; Em andamento 28; Aguardando 49; Não iniciado 1; Bloqueado 6.
- P0 reais: `EXEC-APP-E2E-20261006` (Em validação) e `SEC-FIN-TRELLO-AUTH-20261012` (Em andamento). Somente APP é frente P0 de engenharia; SEGURANÇA Trello é exceção transversal P0.
- **18 sem data de evidência** e 81 com data no registro. Campo de data **não substitui** inspeção da prova primária.
- Bloqueados: `F01-HOST-004`, `F01-RENDER-004`, `P0-AGENDA-005`, `P0-AGENDA-006`, `P0-AGENDA-012`, `P0-AGENDA-015`. Não converter em “concluído” para limpar indicadores.
- **5 mudanças diretamente realizadas e logadas na tabela `cc_changes` nesta etapa:** ARCH-AGENTS e ROG-04 para P1, F01-HOST para P1/Bloqueado, ARCH-TRUTH agora Em validação após a correção confirmada em código, GOV-REVIEW com gate explícito. Alterações financeiras: **nenhuma**.
- Financeiro V12 e CG operacionalmente aceitos após esclarecimento dos descontos 740/768/579 em 24/10; manter encerramentos históricos e ledger sem mutação.
- Cofre Zero único semanal `COFRE_ZERO_WEEKLY_CANONICAL_20261024_R1`; primeira execução natural **25/10/2026**, recuperação OAuth/Edge/Netlify/APP funcional ainda sem PASS integral.
- Release do Gestor: main `e74a6c786f1aff31ffd9be0efe5de3bd123546f8` corrigiu chip/CURRENT_RELEASE 1.2.5.2; verificação real de cache/PWA notebook+celular ainda necessária. Candidata #99 não autorizada a promover.
- Proteção de rotas financeiras P0 ainda não atestada: PR #74 DRAFT contém contrato HMAC, não integração de runtime. Não dar PASS falso de segurança.
- Evidências de código: PRs #94, #165, #166 e commit e74a6c7; metadados de cadastro: public.cc_items. **Links/notas externas não foram todos autenticados ou verificados funcionalmente**; o estado representa a evidência disponível e seus limites.

## Pendências sem data de evidência
- `CR-02` — Integração WhatsApp / Entrada Wizy (Aguardando); não inventar timestamp.
- `CR-03` — Dossiê Inteligente (Não iniciado); não inventar timestamp.
- `CR-07` — Fabrício Flow — Campo (Em validação); não inventar timestamp.
- `EXEC-WIZY-MANUAL-20261006` — Wizy Flow ↔ APP • pacote manual controlado (Aguardando); não inventar timestamp.
- `F01-HOST-004` — F01 • Migrar renderer sem Pagey (Bloqueado); não inventar timestamp.
- `FIN-AUD-MARGEM-213-763-372-20261008` — Auditoria de margens gerenciais — obras 213-24, 763-25 e 372-25 (Aguardando); não inventar timestamp.
- `FIN-V12-CORA-ATTACH-20261009` — Financeiro V12 — anexo original do comprovante Cora no Trello (Em andamento); não inventar timestamp.
- `P1-AGENDA-009` — Agenda • integração controlada F01/F02 (Aguardando); não inventar timestamp.
- `P1-AGENDA-010` — Agenda • Wizy Flow / WhatsApp oficial (Aguardando); não inventar timestamp.
- `P1-AGENDA-011` — Agenda • deslocamento e fit avançado (Aguardando); não inventar timestamp.
- `P1-AGENDA-013` — Agenda • rascunho offline e reconciliação (Aguardando); não inventar timestamp.
- `P1-AGENDA-014` — Agenda • visão e aceite do prestador (Aguardando); não inventar timestamp.
- `PM-26` — Gestão Click — saneamento financeiro + marco zero (Aguardando); não inventar timestamp.
- `WZ-04` — Pipeline / Deal comercial (Aguardando); não inventar timestamp.
- `WZ-05` — Tarefas / Follow-up / Cadências (Aguardando); não inventar timestamp.
- `WZ-06` — Agendamento comercial consultando disponibilidade do Core (Aguardando); não inventar timestamp.
- `WZ-07` — IA / Agentes / Assistência comercial (Aguardando); não inventar timestamp.
- `WZ-12` — Duas organizações / instâncias Wizy, se aplicável (Aguardando); não inventar timestamp.

## Pendências bloqueadas
- `F01-HOST-004` — Hospedagem/credencial externa indisponível; subetapa do APP E2E, sem autorização para nova infraestrutura.
- `F01-RENDER-004` — Renderer público alternativo sem permissão disponível no conector atual.
- `P0-AGENDA-005` — AUTH_REAL_GABI_PENDENTE
- `P0-AGENDA-006` — AUTH_REAL_FABRICIO_PENDENTE
- `P0-AGENDA-012` — REQUER_SETUP_HUMANO_DE_IDENTIDADE
- `P0-AGENDA-015` — AÇÃO DE CONTA SUPABASE NECESSÁRIA

## Registro individual completo dos 99
A coluna “Evidência” traz **somente a última data gravada**, não certifica realização ou confiabilidade de fonte primária.

| Nº | ID | Registro | Estado / prioridade | Evidência (data) | Próximo gate específico |
|---:|---|---|---|---|---|
| 01 | `EXEC-APP-E2E-20261006` | APP F00→F09 + ORÇA-REI • gate final único | Em validação / P0 | 2026-10-22 | Manter ORÇA-REI R15 aprovado isoladamente; integrar F00→F01→F02→F03/F04 com anexos, fotos e histórico reais; validar sem regressão no notebook e celular. Não reabrir tarefas duplicadas APP-V21/F03. |
| 02 | `SEC-FIN-TRELLO-AUTH-20261012` | P0 • Autorização das rotas de escrita na integração financeira externa | Em andamento / P0 | 2026-10-13 | Candidata técnica PR #74 DRAFT: helper Trello HMAC-SHA1 por raw body + callbackURL e seis testes sintéticos PASS local; guard inserido no workflow GitHub existente sem cron novo. Conferir CI completo do PR; depois mapear consumido |
| 03 | `CR-01` | Caso 360 / identidade e matching canônico | Em andamento / P1 | 2026-09-11 | Fechar gaps restantes de request_id/case_id e validar matching ponta a ponta; não duplicar pessoas/casos. |
| 04 | `CR-02` | Integração WhatsApp / Entrada Wizy | Aguardando / P1 | SEM DATA | NÃO integrar agora. Manter em simulação até CR-01 e provas Wizy dependentes estarem aprovadas. |
| 05 | `CR-03` | Dossiê Inteligente | Não iniciado / P1 | SEM DATA | Executar (Aguardando) |
| 06 | `CR-06` | Programação + Agenda Operacional | Em andamento / P1 | 2026-09-11 | Concluir homologação real F04 T01-T14, identidade agenda→case/request e conflito de recursos. |
| 07 | `CR-07` | Fabrício Flow — Campo | Em validação / P1 | SEM DATA | Executar E2E do Fabrício Flow em ambiente candidato: checklist de campo, prestadores, evidencias, medidas, materiais e retorno; registrar aceite e regressao antes de concluir. |
| 08 | `CR-09` | Éder Flow | Em andamento / P1 | 2026-09-11 | Consolidar visão operacional do Éder/WIZY com escopo e evidências reais. |
| 09 | `CR-10` | Help Desk + Garantias | Em andamento / P1 | 2026-09-11 | Evoluir Help Desk/Garantias somente após F09 operacional e política de garantia aprovada. |
| 10 | `CR-11` | Documentos + Pareceres | Em andamento / P1 | 2026-09-11 | Consolidar documentos/pareceres como referências canônicas sem duplicação. |
| 11 | `FIN-V12-CORA-TRELLO-AUDITORIA-20261022` | Financeiro V12 — conciliação Cora × Trello por evidência | Aguardando / P1 | 2026-10-24 | Sem reabrir 740/768/579 (descontos aceitos em 24/10). Manter somente exceções documentadas independentes: trilha ledger 740 e referências GestãoClick 768/818 quando houver comprovantes; conferir escopo histórico read-only PR #143. |
| 12 | `F0` | Governança e contrato de decisão | Em validação / P1 | 2026-09-11 | Validar gates humanos restantes; preservar governança canônica e responsabilidade por decisão. |
| 13 | `F1` | Prova de viabilidade técnica Wizy | Em andamento / P1 | 2026-10-24 | Validar em conta Wizy real autenticacao server-side, organization_id, leitura, escrita, eventos, limites e exportacao; preservar confirmacao manual ate QA e piloto com evidencia. |
| 14 | `F2` | Contrato de dados e integração | Em andamento / P1 | 2026-09-11 | Usar contratos canônicos existentes e fechar drifts de integração/runtime antes de homologar. |
| 15 | `F3` | Base segura CONSTRU-REI | Em validação / P1 | 2026-09-11 | Manter base segura e fechar privacidade/retenção antes de declarar conclusão. |
| 16 | `F4` | Núcleo operacional MVP | Em andamento / P1 | 2026-09-11 | Concluir F04 e seguir F05-F09 sequencialmente, sem pular gates. |
| 17 | `F5` | Interface única + IA assistiva | Em andamento / P1 | 2026-09-11 | Preparar IA/interface integrada sem criar segunda fonte de verdade; aguardar READ TEST WIZY. |
| 18 | `F6` | Piloto controlado H4 | Aguardando / P1 | 2026-09-11 | Iniciar piloto controlado somente após F04 freeze e READ/WRITE QA aprovados. |
| 19 | `F7` | Expansão por ondas | Aguardando / P1 | 2026-09-11 | Expandir por ondas somente após piloto e freezes progressivos. |
| 20 | `APP-CLOSE-002` | APP • F01 consolidar candidata V11 / CRM action-first | Em validação / P1 | 2026-10-05 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 21 | `APP-CLOSE-003` | APP • F02 Preparar — orçamento / cotação / handoff | Em validação / P1 | 2026-10-05 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 22 | `APP-CLOSE-004` | APP • F03 Aprovar — proposta / OS | Aguardando / P1 | 2026-10-05 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 23 | `APP-CLOSE-005` | APP • F04 Programação / Agenda operacional | Em andamento / P1 | 2026-10-05 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 24 | `APP-CLOSE-006` | APP • F05 Materiais e terceiros | Aguardando / P1 | 2026-10-04 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 25 | `APP-CLOSE-007` | APP • F06 Execução / checklist / evidências | Aguardando / P1 | 2026-10-04 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 26 | `APP-CLOSE-008` | APP • F07 Conferência / não conformidade / retrabalho | Aguardando / P1 | 2026-10-04 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 27 | `APP-CLOSE-009` | APP • F08 Fechamento técnico / financeiro / documentos | Aguardando / P1 | 2026-10-04 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 28 | `APP-CLOSE-010` | APP • F09 Entrega / pós-obra / garantia | Aguardando / P1 | 2026-10-04 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 29 | `APP-CLOSE-011` | APP • Embarcar gestão Trello + GestãoClick | Aguardando / P1 | 2026-10-04 | Após homologação F09, integrar leitura/conciliação primeiro; escrita somente por contratos e idempotência. |
| 30 | `APP-CLOSE-012` | APP • Autenticação única e RBAC dos módulos | Aguardando / P1 | 2026-10-04 | Não abrir esta fase isoladamente. Resolver somente dentro do gate consolidado EXEC-APP-E2E-20261006, preservando a esteira como produto único. |
| 31 | `APP-CLOSE-013` | APP • Serviço de geração automática de orçamento | Em validação / P1 | 2026-10-04 | Retomar em 16/10 a integração F00→F01→F02→F03 com dados e anexos preservados, teste real notebook+celular e rollback. Não reabrir homologação isolada R15. |
| 32 | `APP-CLOSE-014` | APP • Análise automática de vistoria e evidências | Aguardando / P1 | 2026-10-04 | Definir contrato de evidências e saída estruturada; integrar ao fluxo adequado após estabilização do núcleo. |
| 33 | `APP-CLOSE-015` | APP • Nota fiscal como serviço integrado | Aguardando / P1 | 2026-10-04 | Inventariar provedor/API e autenticação existente; definir contrato antes de conectar ao F08/F09. |
| 34 | `APP-CLOSE-016` | APP • Wizy Flow API / Webhook | Aguardando / P1 | 2026-10-04 | Mapear API/webhooks, eventos, idempotência e vínculo case/request; manter conclusão manual até validação do Éder. |
| 35 | `APP-CLOSE-017` | APP • Observabilidade, contingência e saúde das integrações | Aguardando / P1 | 2026-10-04 | Definir health contracts para GestãoClick, Trello, Calendar, Wizy, NF e serviços IA. |
| 36 | `APP-CLOSE-020` | APP • Documentação, runbook e congelamento final | Aguardando / P1 | 2026-10-04 | Atualizar documentação por fase e gerar runbook final após homologação F09 e integrações obrigatórias. |
| 37 | `ARCH-AGENTS-20261012` | Arquitetura • adoção obrigatória por todas as IAs de desenvolvimento | Aguardando / P1 | 2026-10-12 | Decisao da Diretoria sobre GitHub Pro se quiser rulesets no repo financeiro PRIVADO (nao contratar automaticamente e nao converter para publico). Repo publico pode ser protegido no GitHub Free via conta Owner em Settings > Branche |
| 38 | `ARCH-SAN-20261012` | Arquitetura • saneamento seguro de previews, históricos e funções Edge | Em andamento / P1 | 2026-10-13 | ENGENHARIA: PR #116 DRAFT sincroniza inventario 13/10 (123 pastas, 357 arquivos, 12 protegidas, 111 pendentes) com seis scripts de auditoria. Central guard PASS, checks de preview no health PASS; aguarda prova backup upstream e re |
| 39 | `ARCH-TRUTH-20261012` | Arquitetura • fonte de verdade única e release real do Gestor | Em validação / P1 | 2026-10-24 | Código main e74a6c7 alinha CURRENT_RELEASE/chip com version.json 1.2.5.2; confirmar em navegador autenticado + PWA notebook/celular e cache real, incluindo badge LIVE/FALLBACK. Não promover PR #99 (1.2.5.3) por inferência; reconci |
| 40 | `EXEC-COFRE-COVERAGE-20261010` | Cofre Zero • proteção integral do Dashboard Financeiro e dependências | Em andamento / P1 | 2026-10-24 | Única frente de continuidade sob COFRE_ZERO_WEEKLY_CANONICAL_20261024_R1. Confirmar ciclo natural domingo 25/10 (Cloud 03h, GitHub 05h47); recuperação pontual PG17/Trello/HTML aprovada. OAuth, Edge runtime, Netlify e recuperação f |
| 41 | `EXEC-COFRE-TRELLO-20261011` | Cofre Zero • Trello: dados financeiros, cards e histórico vivo | Aguardando / P1 | 2026-10-24 | Trello CAS restaurado em isolamento com evidência. Apenas confirmar despacho OIDC subordinado ao Cofre no domingo 25/10 e validar readback incremental; não criar projeto, cron ou rotina FULL separada. |
| 42 | `EXEC-WIZY-MANUAL-20261006` | Wizy Flow ↔ APP • pacote manual controlado | Aguardando / P1 | SEM DATA | Quando uma das duas frentes P0 fechar, concluir WZ-00 e executar provas reais READ, mapping, WRITE sandbox e receiver, sem uso produtivo antecipado. |
| 43 | `F01-HOST-004` | F01 • Migrar renderer sem Pagey | Bloqueado / P1 | SEM DATA | Subetapa do gate EXEC-APP-E2E-20261006 e do bloqueio F01-RENDER-004: só publicar renderer congelado após prova de hospedagem/autorização, CI e QA notebook+celular; não contratar serviço nem desviar URL homologada. |
| 44 | `F01-RENDER-004` | F01 • Remover definitivamente badge/dependência Pagey | Bloqueado / P1 | 2026-09-08 | Liberar permissão de Production Deployment no Vercel ou conectar outro host estático público controlado; então repontar somente mode=f01. |
| 45 | `FAB-01` | FAB-01 • F04 — Programação e agenda operacional real | Em andamento / P1 | 2026-09-11 | Executar homologação real do F04, incluindo identidade agenda→case/request, conflito de recurso e uso no campo. |
| 46 | `FAB-02` | FAB-02 • F05 — Materiais e terceiros sob visão de campo | Aguardando / P1 | 2026-09-11 | Iniciar após F04 congelado; validar necessidade, cotação/aprovação, recebimento, entrega e uso/sobra/devolução. |
| 47 | `FAB-03` | FAB-03 • F06 — Execução, checklist e evidências de obra | Aguardando / P1 | 2026-09-11 | Iniciar após F05; validar execução por item, evidência, mudança de escopo e SST aplicável. |
| 48 | `FAB-04` | FAB-04 • F07 — Conferência, não conformidade e retrabalho | Aguardando / P1 | 2026-09-11 | Iniciar após F06; conferir execução, registrar não conformidade, retrabalho e nova conferência versionada. |
| 49 | `FIN-AUD-MARGEM-213-763-372-20261008` | Auditoria de margens gerenciais — obras 213-24, 763-25 e 372-25 | Aguardando / P1 | SEM DATA | Auditar cada card e a agregação mensal/anual, propor correção gerencial em candidata isolada, validar e só então promover. |
| 50 | `FIN-V12-CORA-ATTACH-20261009` | Financeiro V12 — anexo original do comprovante Cora no Trello | Em andamento / P1 | SEM DATA | Implementar endpoint autenticado de anexo no cartão resolvido após commit idempotente, conferir na API Trello e validar 1 caso controlado. |
| 51 | `GAB-01` | GAB-01 • Homologar Atendimento / Gabi Flow no uso diário | Em andamento / P1 | 2026-09-11 | Usar a rotina real de atendimento e registrar somente exceções, falhas ou ajustes necessários. |
| 52 | `GAB-03` | GAB-03 • Validar comunicação e retornos do atendimento | Em andamento / P1 | 2026-09-11 | Executar casos reais/controlados de retorno e comunicação; registrar evidência somente quando houver exceção ou aceite. |
| 53 | `GAB-04` | GAB-04 • Validar handoff F01 → F02 no atendimento real | Em validação / P1 | 2026-09-11 | Validar novos handoffs reais/controlados e confirmar que os dados chegam completos no F02 congelado. |
| 54 | `GAB-05` | GAB-05 • Validar Inbox/WhatsApp WIZY como usuária operacional | Aguardando / P1 | 2026-10-24 | Executar após WZ-03 e READ/WRITE QA estarem autorizados; validar conversa, anexo, transferência e vínculo sem criar caso indevido. |
| 55 | `GAB-06` | GAB-06 • Validar Meu Dia / Pendências / Agenda do Atendimento | Em validação / P1 | 2026-09-11 | Revisar Meu Trabalho da Gabrielly após saneamento das pendências e confirmar prioridades/próximas ações. |
| 56 | `GOV-REVIEW-GERAL-20261022` | BIO Gestor — revisão geral GitHub, provedores, frentes e indicadores | Em andamento / P1 | 2026-10-24 | Banco Mestre auditado 275/99; PRs #165/#166 merged e commit e74a6c7. Acompanhar a PR de relatório individual e somente depois conferir Gestor online/PWA em celular e notebook; revalidar telemetria dos provedores antes de declarar  |
| 57 | `P0-AGENDA-004` | Agenda • validação Éder | Em validação / P1 | 2026-10-24 | Éder testar com sua autenticação validada e registrar evidência. |
| 58 | `P0-AGENDA-005` | Agenda • validação Gabrielly / Atendimento | Bloqueado / P1 | 2026-10-24 | Após onboarding real, testar fluxo atendimento → agenda e anexar evidência. |
| 59 | `P0-AGENDA-006` | Agenda • validação Fabrício / Campo | Bloqueado / P1 | 2026-10-24 | Após onboarding real, testar campo e prestadores com visibilidade mínima. |
| 60 | `P0-AGENDA-008` | Agenda • Bio voz/texto + confirmação humana | Em andamento / P1 | 2026-10-24 | Testar frases reais e registrar ambiguidades para evolução sem autoagendamento. |
| 61 | `P0-AGENDA-012` | Agenda • onboarding real Gabrielly e Fabrício | Bloqueado / P1 | 2026-10-24 | Éder e Rogério concluir onboarding seguro dos dois usuários e anexar evidência. |
| 62 | `P0-AGENDA-015` | Agenda • restaurar backend público / quota egress | Bloqueado / P1 | 2026-10-24 | Restaurar serviço público; validar health HTTP 200; testar criação real; confirmar persistência; então gerar V2. |
| 63 | `P1-AGENDA-009` | Agenda • integração controlada F01/F02 | Aguardando / P1 | SEM DATA | Após aprovação, desenhar contrato e candidata isolada F01/F02. |
| 64 | `P1-AGENDA-010` | Agenda • Wizy Flow / WhatsApp oficial | Aguardando / P1 | SEM DATA | Validar documentação/API do Wizy e número oficial antes de implementar. |
| 65 | `P1-AGENDA-011` | Agenda • deslocamento e fit avançado | Aguardando / P1 | SEM DATA | Definir provedor de rota e pesos configuráveis após uso real do MVP. |
| 66 | `P1-AGENDA-013` | Agenda • rascunho offline e reconciliação | Aguardando / P1 | SEM DATA | Após uso do MVP, implementar draft local + reconciliação segura. |
| 67 | `P1-AGENDA-014` | Agenda • visão e aceite do prestador | Aguardando / P1 | SEM DATA | Desenhar RBAC específico de prestador após validação do fluxo interno. |
| 68 | `PM-26` | Gestão Click — saneamento financeiro + marco zero | Aguardando / P1 | SEM DATA | Gerar snapshot/exportação; auditar contas, saldos iniciais e vínculos; sanear base; estabelecer posição de corte correta com Trello; validar antes de automação. |
| 69 | `ROG-01` | ROG-01 • Homologações e Freeze Gates F04–F09 | Em andamento / P1 | 2026-09-11 | Aprovar ou reprovar cada freeze somente após evidência técnica + homologação humana do fluxo correspondente. |
| 70 | `ROG-02` | ROG-02 • Gate WIZY — READ → WRITE QA → PILOTO | Em andamento / P1 | 2026-10-24 | Autorizar READ; após PASS decidir WRITE QA; após PASS e F04 freeze decidir PILOTO. |
| 71 | `ROG-04` | ROG-04 • Políticas executivas — compras, pagamento, garantia e privacidade | Em andamento / P1 | 2026-09-11 | Fechar políticas conforme cada fluxo se aproximar da homologação, com assessoria profissional quando necessária. |
| 72 | `ROG-06` | ROG-06 • Signoffs externos — Jurídico/LGPD, Fiscal/Contábil e SST | Aguardando / P1 | 2026-09-11 | Solicitar signoff no momento de cada gate regulatório; não antecipar parecer fictício. |
| 73 | `ROG-07` | ROG-07 • GO / NO-GO final para operação integrada | Aguardando / P1 | 2026-09-11 | Executar apenas após piloto controlado PASS, freezes previstos, segurança e rollback comprovados. |
| 74 | `SCO-EDR-01` | SCO-CR • Técnico/WIZY — validar consumo de conhecimento e fronteiras | Aguardando / P1 | 2026-09-11 | Validar limites remoto/visita por família técnica e confirmar que WIZY consome contexto por referência sem soberania própria. |
| 75 | `SCO-FAB-01` | SCO-CR • Campo — validar execução, desvios e retrabalho | Aguardando / P1 | 2026-09-11 | Validar preparação mínima, desvios/adicionais, evidência de conclusão e classificação retrabalho x garantia x novo escopo. |
| 76 | `SCO-GAB-01` | SCO-CR • Atendimento — validar regras tácitas e escaladas | Aguardando / P1 | 2026-09-11 | Validar somente: suficiência da triagem, quando resolver/escalar, linguagem por interlocutor e regra prática de follow-up. |
| 77 | `SCO-ROG-01` | SCO-CR • Validar alçadas, prioridades e canonização executiva | Em validação / P1 | 2026-09-11 | Revisar DOC-SCO-BACKLOG-001 e decidir: (1) alçadas; (2) desempate de prioridade; (3) exceções de margem/contingência; (4) principais exceções F02→F09; (5) gatilhos de caso complexo. |
| 78 | `T-001` | Congelar Product Charter e fora de escopo | Em validação / P1 | 2026-09-11 | Validar se o checkpoint mestre/arquitetura de produto satisfaz integralmente o Product Charter; manter fora de escopo explícito. |
| 79 | `T-002` | Definir IDs canônicos e matching | Em andamento / P1 | 2026-09-11 | Resolver gaps de identidade restantes e provar IDs canônicos ponta a ponta. |
| 80 | `T-003` | ROG-03 • Governança, RACI e homologadores | Em validação / P1 | 2026-09-11 | Executar signoffs humanos restantes sobre a matriz de responsabilidades/homologadores. |
| 81 | `T-007` | GAB-02 • Validar identidade, multicontato e duplicidade | Em andamento / P1 | 2026-09-11 | Validar cenários de identidade/duplicidade com evidência real; contrato já existe. |
| 82 | `T-008` | Desenhar dossiê e vínculo de evidências | Em andamento / P1 | 2026-09-11 | Consolidar dossiê e vínculo de evidências usando infraestrutura existente; não criar base paralela. |
| 83 | `WZ-00` | Inventário da conta, plano, organizações e portabilidade | Em andamento / P1 | 2026-10-24 | Concluir o inventário da conta real e, como requisito de implantação, adquirir/ativar número WhatsApp exclusivo da CONSTRU-REI e homologar a conexão Wizy via QR Code / Evolution Go antes de qualquer uso produtivo. |
| 84 | `WZ-01` | Autenticação, tenant, leitura/escrita e segurança de API | Em andamento / P1 | 2026-10-24 | ENGENHARIA: preparar Auth/ACL server-side real em candidata, garantindo interpretação rigorosa dos 12 níveis RBAC (NONE nega), somente F01/F02 mapeados em LAB. Confirmar identidade individual via responsável, vincular Auth uid+wor |
| 85 | `WZ-02` | Lead / contato / distribuição | Aguardando / P1 | 2026-10-24 | Criar registros fictícios e testar lead novo, contato existente, repetido, homônimo, telefone compartilhado e troca de responsável/estágio. |
| 86 | `WZ-03` | Inbox / Conversas / Canais | Aguardando / P1 | 2026-10-24 | Escolher um canal de piloto, conectar em ambiente controlado e testar conversa nova, fechar/reabrir, transferir e anexos. |
| 87 | `WZ-04` | Pipeline / Deal comercial | Aguardando / P1 | SEM DATA | Criar pipeline de TESTE e validar criar/mover/ganhar/perder/reabrir com lead fictício. |
| 88 | `WZ-05` | Tarefas / Follow-up / Cadências | Aguardando / P1 | SEM DATA | Criar tarefa e cadência de teste com contato fictício; não ativar em cliente real. |
| 89 | `WZ-06` | Agendamento comercial consultando disponibilidade do Core | Aguardando / P1 | SEM DATA | Apenas mapear tipos de evento, disponibilidade e Google Calendar; não prometer horário operacional antes do endpoint do Core existir. |
| 90 | `WZ-08` | Eventos Wizy → CONSTRU-REI (receiver) | Aguardando / P1 | 2026-10-24 | Criar webhook de sandbox para endpoint controlado e capturar payloads reais; não apontar para o APP de produção. |
| 91 | `WZ-09` | Escrita server-side CONSTRU-REI → Wizy Flow | Aguardando / P1 | 2026-10-24 | Testar em sandbox uma escrita válida e inválida com registro fictício; documentar endpoint, auth, payload e resposta. |
| 92 | `WZ-10` | Realtime, limites e modo degradado | Aguardando / P1 | 2026-10-24 | Medir chamadas reais e documentar 429/timeout/latência; simular indisponibilidade sem interromper o Core. |
| 93 | `WZ-11` | Plano de saída / portabilidade completa | Aguardando / P1 | 2026-10-24 | Executar exportação pequena permitida e mapear lacunas/formatos; documentar condição de encerramento antes do piloto ampliado. |
| 94 | `WZ-13` | WZ-13 • Mapping, IDs e Ownership — WIZY FLOW ↔ APP CONSTRU-REI | Em andamento / P1 | 2026-10-24 | Documentar e provar external_id, request_id, case_id, ownership, novo problema/complemento, homônimo, telefone compartilhado, duplicidade, retry e idempotência. |
| 95 | `WZ-CONNECTION-V1` | Primeira Conexão — APP CONSTRU-REI × WIZY FLOW | Aguardando / P1 | 2026-10-24 | Éder concluir configuração local mínima e executar READ TEST somente leitura. |
| 96 | `CR-13` | ROG-05 • Validar Dashboard e Visão Executiva | Em validação / P2 | 2026-09-11 | Validar visual atual por owner. Em release controlada futura, expor work_views sem alterar R12.8. |
| 97 | `FAB-05` | FAB-05 • Ativos de campo — veículos, ferramentas e equipamentos | Aguardando / P2 | 2026-09-11 | Ativar somente quando a onda de Ativos entrar em homologação. |
| 98 | `WZ-07` | IA / Agentes / Assistência comercial | Aguardando / P2 | SEM DATA | Mapear agentes/Mia disponíveis e testar somente com dados fictícios e aprovação explícita. |
| 99 | `WZ-12` | Duas organizações / instâncias Wizy, se aplicável | Aguardando / P2 | SEM DATA | Confirmar se há mais de uma organization/tenant real. Se não houver, registrar evidência e encerrar como não aplicável. |

## Critérios que impedem fechamento artificial
1. APP: integração real F00–F09, anexos, identidade, F01→F02, F03/F04, F05–F09, autenticação, desktop+mobile e GO/NO-GO documentados.
2. Proteção Trello: mapear todas as rotas de escrita e validar assinatura, replay, idempotência, identidade, rollback e PR #74 ou sucessora integrada; teste isolado não protege produção.
3. Agenda/Wizy: autorização de usuários reais e READ/WRITE QA, sem simular conta nem realizar escrita em conta real não homologada.
4. Cofre: aguardar ciclo semanal de domingo 25/10 e provar restauração externa isolada dos componentes faltantes. Sem segundo Scheduler, FULL repetido, segredo exposto ou custo extra.
5. Governança: alinhar seleção editorial de 16 cartões com o Banco Mestre de 275; não confundir snapshot V1.2.7 com runtime V1.2.5.2. Inspecionar offline/cache no PWA.
6. Não alterar fechamento financeiro, comprovantes, saldos, operações Cora ou cards Trello com base em anomalias históricas já esclarecidas.

**Resultado objetivo:** rastreabilidade 99/99 de identificação, estágio, prioridade, data registrada e próximo passo. Homologação funcional global: **PENDENTE DE EVIDÊNCIAS EXTERNAS**; nenhum 100% fictício.
