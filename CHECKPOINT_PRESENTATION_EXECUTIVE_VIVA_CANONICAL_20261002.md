# CHECKPOINT — APRESENTAÇÃO EXECUTIVA VIVA CANÔNICA — 02/10/2026

## Estado
- HOMOLOGADA: SIM
- CANÔNICA: SIM
- CONGELADA: SIM
- APROVAÇÃO HUMANA: Diretor Rogério
- Data: 02/10/2026

## Fonte canônica
- Arquivo oficial: `central/presentation.html`
- URL direta: https://rogeriocibin-alt.github.io/construrei-oauth-pages/central/presentation.html?rev=93816fbe
- Entrada pela Central: https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes?open=presentation
- Blob aprovado/promovido: `c92c31ab5c1318a077011e6b9b66fe2ba8802b5c`
- Commit de promoção oficial: `93816fbe52ecba8270a732cb80b3a20b05621888`

## Características obrigatórias preservadas
- 20 páginas executivas.
- Radar Executivo macro.
- Dados vivos e atualização automática a cada 60 segundos.
- Descoberta automática de novos anos pela API viva.
- Exportação PDF.
- Exportação PowerPoint (.pptx).
- Botões de exportação acessíveis também no celular.
- Central, Dashboard e fontes operacionais permanecem como fontes; a apresentação não cria número paralelo.

## Governança Supabase
- Registry code: `HTML-APRESENTACAO-ESTRATEGICA-2026`
- Version label: `Executiva Viva 2026 • 20 páginas • Radar Macro • PDF + PowerPoint • dados vivos`
- Stage: `VALIDADO`
- Release lock: `presentation_executive_viva_canonical_20261002`
- Release version: `CR-PRESENTATION-EXECUTIVE-VIVA-HOMOLOGATED-20261002`
- Locked: `true`
- Runtime: `centro-operacoes-runtime-canonico-20261001` versão 2
- Runtime preserva release, build, AUTH lock, HOME e FLOW_ROUTER da Central canônica.

## Rollback real
- Versão histórica anterior: 38 páginas.
- Blob antigo: `3a0cdb3df59830b1ba59873ce6bc9a17ee490289`
- Arquivo histórico: `archive/presentation-live-38p-20260930/index.html`
- URL rollback: https://rogeriocibin-alt.github.io/construrei-oauth-pages/archive/presentation-live-38p-20260930/
- Checkpoint pré-promoção: `CHECKPOINT_PRE_PRESENTATION_EXECUTIVE_CANONICAL_PROMOTION_20261002`

## Regras anti-regressão
1. A versão de 38 páginas NÃO é corrente; serve apenas como rollback histórico.
2. Não substituir `central/presentation.html` por versão anterior.
3. Toda evolução parte desta versão canônica em branch/candidata isolada.
4. Só promover uma evolução após validação humana explícita.
5. Preservar PDF, PowerPoint, dados vivos, auto-years e Radar Executivo em qualquer evolução.
6. Não alterar Central, auth, APP ou F00–F09 para evoluir a apresentação.
7. O arquivo oficial só muda por promoção consciente de uma candidata aprovada.

## Validação final
- Link canônico HTTP 200.
- Rollback HTTP 200.
- PowerPoint handler presente e conectado ao `pptBtn`.
- PDF via `window.print()` presente.
- `setInterval(refreshData,60000)` presente.
- Radar Executivo presente.
- Resumo público da Central anuncia:
  - `Apresentação Executiva Viva • 20 páginas • Radar Macro`
  - `CR-PRESENTATION-EXECUTIVE-VIVA-HOMOLOGATED-20261002`
  - modo `LIVE_READ_ONLY_SUPABASE_DATA_AUTOYEARS`.

Este checkpoint é a referência de retomada. Não buscar apresentação anterior como base de evolução.
