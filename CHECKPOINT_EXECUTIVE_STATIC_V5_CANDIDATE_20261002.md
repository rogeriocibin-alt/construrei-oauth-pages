# CHECKPOINT — CENTRAL EXECUTIVA V5 ESTÁTICA — 2026-10-02

## Status
CANDIDATA ISOLADA. NÃO HOMOLOGADA. PRODUÇÃO INALTERADA.

## Motivo da V5
A tentativa V4 de UI foi publicada como HTML por Supabase Edge Function. A plataforma atual entrega HTML em GET no domínio padrão como text/plain, fazendo o navegador exibir código. A V5 separa corretamente:
- UI: GitHub Pages / arquivo estático.
- APIs e dados: Supabase Edge Functions / JSON.

## Baseline visual preservada
- Fonte visual: `production/central-homologada-20261001/index.html`
- Blob da produção no momento da candidata: `d7e3a3d30bb1b0f4927d661deab75f48205ff8ea`
- Produção não alterada durante a construção/validação desta candidata.

## Candidata V5
- Arquivo: `preview/central-executive-v5-static-candidate-20261002/index.html`
- Blob final do arquivo: `3bf1d7acc0d5313f68f9d7c8023520146c8ab3d3`
- Commit de reforço final: `47ee7375700b6dea61e9151ef8331eec2b9b4191`
- URL: https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/central-executive-v5-static-candidate-20261002/?v=47ee737

## API executiva
- Edge Function: `cr-executive-readonly-v5-candidate-20261002`
- Versão: 2
- Modo: GET/OPTIONS + autenticação CONSTRU-REI
- Escritas operacionais: DESABILITADAS
- GestãoClick: leitura real de /orcamentos, status brutos e valores.
- Trello: leitura gerencial através da API V4 existente, sem escrita.
- Agenda: `cr_work_agenda_v1`
- Pendências: `cr_pending_master_candidate_20261002`
- Drill-down por caso: Trello + GestãoClick.

## Implementado na UI
1. HOJE NA OPERAÇÃO com dados V5:
   - Serviços em andamento
   - Aguardando pagamento
   - Visitas do dia
   - Orçamentos em fluxo
   - Agenda de amanhã
   - Pendências de ontem
   - Aguardando acerto
   - Pendências vivas
2. F00/F01 removidos dos KPIs executivos, sem remover os módulos F00/F01.
3. Gestão da Agenda com hoje, amanhã, pendências de ontem, sem confirmação, sem responsável e informações incompletas.
4. Orçamentos/Serviços em Fluxo com status reais do GestãoClick, valores, cliente, responsável quando disponível e drill-down por caso.
5. Gestão Plena de Pendências Vivas reutilizando o Banco Mestre candidato e eventos existentes.
6. Saúde Técnica real na HOME: Banco, Trello, GestãoClick, API V5, latência, última verificação e ambiente.
7. Alertas operacionais antigos deixam de ocupar KPI executivo; saúde técnica recebe a telemetria.

## Limites conscientemente não inventados
- Tempo real por etapa do GestãoClick não foi inferido a partir da data do orçamento; a UI informa que a fonte consultada ainda não expõe esse histórico de etapa.
- Agenda externa além dos registros internos homologáveis não foi declarada como cobertura completa.
- A candidata não foi promovida para produção.

## Validações
- GitHub Pages build/deployment do commit `47ee737...`: SUCCESS (run 274).
- Scripts inline analisados sintaticamente: 17 blocos, 0 falhas.
- Markers funcionais V5 presentes: agenda, orçamentos, pendências vivas, saúde técnica.
- Script antigo de repaint `cr-home-structural-lock` removido somente da candidata para impedir regressão visual F00/F01.
- Produção permaneceu com blob `d7e3a3d...`.

## Gate para promoção
Abrir a URL da candidata em notebook e celular, conferir renderização e dados autenticados. Somente após aprovação explícita promover para produção/canônica.
