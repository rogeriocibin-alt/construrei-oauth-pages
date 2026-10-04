# CONSTRU-REI — Registro Vivo de Pendências e Desenvolvimento

Data de ativação: 2026-10-04

## Política operacional

- **APP:** atualização automática de ações técnicas/publicações.
- **SISTEMA / CENTRAL:** atualização automática de ações técnicas/publicações.
- **WIZY:** lançamentos, alterações de status e conclusão permanecem **manuais**.
- **ÉDER:** pendências que dependem de execução/validação do Éder permanecem **manuais**.
- A automação pode anexar evidência sistêmica, mas não deve concluir WIZY/Éder automaticamente.

## Fonte de verdade

O registro vivo usa as estruturas existentes:

- `cc_items` — pendências e ações;
- `cc_changes` — trilha de alterações;
- `cr_operational_evidence` — evidências append-only;
- `cc_snapshots` — snapshots dos ciclos automáticos.

Não foi criado um segundo banco de pendências.

## Automação

Edge Function:

`cr-pendencias-auto-sync-20261004` — versão 1

Fonte fixa:

`rogeriocibin-alt/construrei-oauth-pages` / branch `main`

Cron:

`cr-pendencias-auto-sync-15m`

Agenda:

`*/15 * * * *`

### Regras

1. Ler commits recentes do branch `main`.
2. Classificar desenvolvimento como APP ou SISTEMA/CENTRAL.
3. Criar/atualizar um registro concluído de desenvolvimento.
4. Anexar evidência por SHA, sem duplicar.
5. Registrar a rodada em `cc_changes` e `cc_snapshots`.
6. Ignorar automação de WIZY.
7. Não concluir itens manuais do Éder.

## Bootstrap validado

Primeiro ciclo automático:

- HTTP: **200**
- commits analisados: **60**
- evidências anexadas: **51**
- novos registros criados automaticamente: **2**
- política retornada pela função: APP/SISTEMA automático; WIZY/ÉDER manual.

Após consolidação e evidências de bootstrap, o banco possuía:

- **8** registros automáticos `AUTO-*`;
- **79** evidências com ator `SYSTEM`;
- **22** itens WIZY abertos marcados como lançamento/confirmação manual;
- **6** itens Éder fora de WIZY marcados como dependência manual.

## APP — auditoria de 04/10/2026

Estado consolidado:

- Aguardando: 5
- Bloqueado: 2
- Em andamento: 3
- Em validação: 4
- Concluído: 3

### Ajustes relevantes

`P0-AGENDA-003`  
Movido de **Em andamento** para **Em validação**. O bloqueio antigo de disponibilidade pública não representa mais o estado atual. Backend e candidata estão ativos; resta gate final em notebook.

`P0-AGENDA-007`  
Mantido em **Em validação**, com registro de validação móvel da Agenda Inteligente R6 e próximo passo atualizado para gate final multiplataforma/homologação.

## Ações de desenvolvimento já registradas

- `AUTO-APP-AGENDA-R6-20261004` — Agenda Inteligente R6.
- `AUTO-CENTRAL-NAV-R2-20261004` — navegação persistente e Saúde fail-safe.
- `AUTO-CENTRAL-GC-ORDER-20261004` — GestãoClick em ordem decrescente e renderer isolado.
- `AUTO-CENTRAL-FREEZE-20261004` — congelamento do ponto seguro.
- `AUTO-CENTRAL-HERO-20261004` — capa executiva homologada.
- `AUTO-CENTRAL-DOCS-20261004` — registro automático documental.
- `AUTO-CENTRAL-RELEASE-20261004` — registro automático de releases.
- `AUTO-CENTRAL-PENDENCIAS-SYNC-20261004` — automação do próprio registro vivo.

## Evidências

As evidências automáticas registram, quando aplicável:

- SHA do commit;
- link direto do commit;
- categoria;
- data do commit;
- repositório;
- versão/build;
- estado do runtime;
- job do cron;
- resultado do ciclo de sincronização.

Os registros são append-only e não substituem homologação humana quando esta for necessária.
