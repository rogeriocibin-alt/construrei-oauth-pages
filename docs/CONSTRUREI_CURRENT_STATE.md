# CONSTRU-REI — ESTADO MESTRE DA CENTRAL

> Fonte de verdade para retomada entre conversas. Não depender do histórico do chat para identificar a versão atual.

## Estado atual — 2026-10-04

- Projeto: Central CONSTRU-REI
- Repositório: `rogeriocibin-alt/construrei-oauth-pages`
- Versão executiva final desta rodada: **Executivo R8 — medidores modernos + painel compacto de pendências**
- Branch de origem: `cr-central-agenda-smarttext-candidate-20261004`
- Commit funcional R8: `78700b8f91025caa6d44d02ef5a6c99d0fef1d43`
- Produção congelada no `main`: `3fe0ed0c063fb1888dd9178e399fede27c67a967`
- Checkpoint funcional R8: `CHECKPOINT_CENTRAL_EXEC_METERS_R8_20261004`
- Checkpoint de homologação congelada: `CHECKPOINT_CENTRAL_EXEC_R8_HOMOLOGADA_20261004`
- Pasta de produção imutável desta rodada: `production/central-homologada-exec-r8-20261004/`
- Edge candidata validada: `cr-central-agenda-smarttext-candidate-20261004` v7
- Fonte viva de pendências: `cr-pendencias-executive-v2-candidate-20261004` v1
- Central oficial `centro-operacoes`: **ainda aponta para a versão oficial anterior**; o repoint da Edge não foi executado porque a escrita foi bloqueada pelo conector Supabase e o dispositivo autorizado `Rogerio-2022` está offline.
- Regra: não alterar a pasta de produção R8 nem os checkpoints acima. Próxima promoção da Edge deve apontar somente para a pasta congelada de produção.

## Link público final da R8 congelada

https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/central-homologada-exec-r8-20261004/?v=78700b8f91025caa6d44d02ef5a6c99d0fef1d43

## Link da Edge candidata R8

https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-agenda-smarttext-candidate-20261004/

## Conteúdo final da R8

1. Medidor principal circular em SVG com avanço operacional ponderado real.
2. Cinco mini-medidores por estágio: concluído, validação, andamento, aguardando e bloqueado/não iniciado.
3. Três mini-gauges compactos para APP, WIZY e ÉDER.
4. Painel de pendências compacto, evitando a lista extensa na visão executiva.
5. APP/SISTEMA mantidos em atualização automática; WIZY e ÉDER permanecem manuais.
6. CSS físico dedicado `executive-meters-r8.css`, reduzindo risco de cache/regressão visual.
7. Identidade visual da Central preservada, sem redesign dos módulos já validados.
8. A métrica representa **avanço operacional por status**, não percentual financeiro nem percentual físico de obra.

## Registro vivo de pendências

- APP/SISTEMA: **AUTOMÁTICO**
- WIZY: **MANUAL**
- ÉDER: **MANUAL**
- Edge de sincronização: `cr-pendencias-auto-sync-20261004`
- Cron: `cr-pendencias-auto-sync-15m` • `*/15 * * * *`
- Documento de arquitetura: `docs/PENDENCIAS_LIVE_REGISTRY_20261004.md`
- Estruturas: `cc_items`, `cc_changes`, `cr_operational_evidence`, `cc_snapshots`
- Regra de segurança: automação não conclui WIZY nem itens dependentes de ação/validação manual do Éder.

## Histórico imediatamente anterior preservado

- Versão anterior mais completa congelada:
  - Commit: `2bb528851c343f6464418fadf36b115285aae916`
  - Branch: `cr-central-most-complete-frozen-20261004-r2`
  - Checkpoint: `CHECKPOINT_CENTRAL_MOST_COMPLETE_20261004_R2`
- Base oficial anterior protegida: `ccc8e8a4cc97df5f7646813178287106657df9b1`

## Regra de continuidade obrigatória

Sempre que houver nova candidata, homologação, promoção, rollback ou checkpoint relevante:

1. Atualizar este arquivo no mesmo ciclo.
2. Registrar link público funcional, branch, commit funcional, commit publicado, checkpoint e estado da oficial.
3. Não usar somente o histórico do chat como fonte de verdade.
4. Consultar este arquivo primeiro ao retomar o projeto.
5. Não promover a Central oficial sem gate de validação humana em notebook + celular.
6. Preservar a versão oficial anterior até a promoção ser efetivamente concluída.
7. Toda promoção futura deve partir da pasta de produção congelada, nunca de pasta de candidata mutável.



## Executivo R9 — correção responsiva dos medidores

- Data: 2026-10-04
- Status: **CANDIDATA PUBLICADA PARA VALIDAÇÃO NO CELULAR**
- Branch: `cr-central-exec-r9-mobilefix-20261004`
- Commit: `b42c491dba5a60fa375c2f2609e26c660ebf892e`
- Checkpoint: `CHECKPOINT_CENTRAL_EXEC_R9_MOBILEFIX_20261004`
- Preview: `preview/central-exec-r9-mobilefix-20261004/`
- Correção: o arquivo `executive-meters-r8.css` existia, mas não estava referenciado pelo `index.html`; no celular isso fazia o SVG do gauge usar preenchimento preto padrão e removia a composição visual dos cards APP/WIZY/ÉDER.
- A R9 adiciona explicitamente o stylesheet físico dos medidores com cache-buster próprio.
- Nenhuma lógica, dado, API, métrica ou módulo validado foi alterado.
- A R8 congelada em `production/central-homologada-exec-r8-20261004/` permanece intocada.
- Gate: validar visualmente em celular antes de qualquer promoção/homologação.

## Última atualização

2026-10-04 — R9 corretiva publicada como preview para corrigir o carregamento do CSS dos medidores no celular. R8 congelada preservada; nenhuma promoção oficial executada.
