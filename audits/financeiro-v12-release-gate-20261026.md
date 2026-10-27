# CONSTRU-REI — Financeiro V12 | Gate de homologação (26/10/2026)

**Situação: CANDIDATA, PR #174 em DRAFT. Produção preservada.**
Não confundir testes unitários ou snapshots textuais com conciliação bancária Cora.

## Evidência executada
- Banco Supabase: 278 extratos textuais de obras 2026; 202 BALANCED, 75 INCOMPLETE, 1 DIVERGENT (apurado em leitura anterior).
- Consulta real sobre 32 cartões / 16 códigos repetidos, sem alterações: 11 EXACT_ARCHIVED_COPY; 3 PROVISIONAL_ARCHIVED_MIRROR (290-26, 320-26, 675-26); 1 REVIEW_DISTINCT_ADDITIVE (411-26); 1 TEST_ONLY_EXCLUDED (9999-26).
- Cópias arquivadas exatas podem produzir **R$ 13.630,18** de duplicidade artificial se ambas forem somadas. É risco *derivado*, NÃO ajuste bancário comprovado. Conservar todos os cartões originais.
- SQL de auditoria executada contra Supabase e versionada em `audits/financeiro-v12-2026-duplicate-live-readonly.sql`, sem instruções de escrita. Contrato de regressão em `audits/financeiro-v12-duplicate-verified-snapshot.test.cjs` replica somente metadados resumidos do corte auditado, não IDs privados.
- 278 textos 2026 comparados entre parser anterior e candidato: **274 inalterados / 4 correções intencionais**: 627-26 CG +R$32,58; 649-26 CG +R$40,71; 655-26 CG +R$71,57; 727-26 rateio Éder -R$150,00 por apoio em custos. Essa evidência NÃO valida Cora.
- 145/145 testes Node aprovados no notebook conectado. CI observado no commit de teste cb27284: Central Canonical Guard e Change Trace passaram.

## Restrições objetivas para homologar
1. **666-26, setembro (cartão ativo conferido no Trello: https://trello.com/c/Q0mUjp16):** bruto R$4.188,88 - custos declarados R$3.571,59 = lucro aritmético R$617,29, mas cartão declara lucro R$547,29. Diferença R$70,00; rateios do cartão se baseiam no lucro declarado. Conferir documento primário antes de corrigir.
2. Snapshots Jan–Set 2026 marcados `DECLARED_UNRECONCILED`; fevereiro tem diferença de R$0,10 entre lucro declarado e calculado no resumo mensal. Out–Dez ainda `OPEN_UNCONFIRMED`.
3. Tabela de envio de períodos V12: **0 fechamentos reais** até a leitura de 26/10. Anotações somente-informativas Cora: **5**; não são despesas nem prova de envio Trello.
4. **Status de tela intermitente:** a candidata exibiu inicialmente “Falha ao atualizar dados”. Após atualização explícita no Opera, o alerta desapareceu e o contador avançou de 110 para **112 movimentos Cora**, com **12 exibidos**. Recuperação visual observada; estabilidade, período/limite do filtro e saldo bancário ainda exigem validação E2E.
5. Testes autenticados, gravação idempotente e recuperação após falha parcial com o Trello real, validação do saldo Cora oficial, 2024/2025 e homologação de uso notebook + celular ainda sem prova nesta entrega.
6. O código de deduplicação está no ramo candidato em modo *read-only*; a consulta SQL não está ligada aos cálculos da tela de produção.
7. **Anotação multiobra existente não concluída:** 5 anotações Cora persistidas contêm somente 1 obra por registro (incluindo duas saídas de R$450,00 e uma de R$750,00). Backend/testes da candidata aceitam 2–15 obras em *novas* anotações, mas botão de anotação existente está bloqueado e fingerprint rejeita alteração. Implementar correção somente-informativa **versionada e auditável** (sem refazer custos ou movimentos bancários), confirmar rateio de cada diária por obra e preservar o registro original. Não substituir códigos das obras por suposições.

## Critério de saída
Resolver divergências com fonte documental, rodar conciliação cruzada e prova E2E (incluindo falha/retomada sem duplicação), validar Cora e Trello contra documentos primários, depois publicar mediante auditoria com checkpoint/rollback. **Não dar aceite 100% nem fazer merge automático da PR #174** antes disso.

Referências: PR #174; commits 7ab0132, 33cc622, 770a094, cb27284; consulta Supabase apenas leitura de 26/10/2026.


## Continuação técnica de 27/10/2026 — revisão de anotações Cora existentes

**Escopo corrigido:** as cinco anotações em `cr_cora_bank_annotations_v12` permanecem originais e intactas; três são saídas (R$ 450 Éder, R$ 450 Fabrício e R$ 750 João Victor) e duas são entradas. Na consulta read-only de 27/10, as cinco tinham uma única obra declarada por anotação. A distribuição correta entre as obras **NÃO foi inferida, nem alterada**.

**Implementação isolada na PR #174 (DRAFT):**
- SQL `bank-annotation-revisions-CANDIDATE.sql`: nova tabela de revisões append-only, RLS ligado, sem permissão anon/authenticated; uma RPC `SECURITY INVOKER` disponível apenas para service_role usa trava por `operation_id`, comparação de fingerprint anterior (CAS), soma exata do valor bancário e controle de idempotência. **SQL apenas versionado; não aplicado no Supabase.**
- Fonte Edge candidata `cora-aprovisionamento-backend/index.ts`: novas rotas `bank-annotation-revise-preview` e `bank-annotation-revise-commit`, exigem sessão da Diretoria e revalidação da movimentação Cora. Preservam anotação original, não escrevem Trello, Cora, custos, rateios ou Capital de Giro. **Edge não publicada nesta execução.**
- Interface candidata: anotações existentes ficam selecionáveis; pré-preenche o registro atual e exige motivo para revisão; mostra confirmação explícita. Recebimentos informativos também podem ser revisados.
- Regressões: teste novo `financeiro-v12-bank-note-revisions.test.cjs`; teste antigo `financeiro-v12-cora-note-only.test.cjs` adaptado à nova interface.
- Notebook `Rogerio-2022` ONLINE: bateria **156 testes / 156 PASS / 0 FAIL** a partir do HEAD `3f4927ee39116a2246d730c88850d0868b2a2379`, usando fontes candidatas obtidas por SHA; checagem `node --check` do backend passou. Esses são testes locais/contratos, **não E2E real**.

**Gates ainda abertos:** revisão SQL em ambiente de teste/rollback, instalação controlada da tabela/RPC, deploy seguro da Edge candidata sem regredir V12 oficial, teste autenticado de prévia/commit/reenvio/concorrência com notas de teste verificáveis, leitura após recarga, Android e comprovação de que cada diária foi vinculada às obras corretas. Manter sem merge, sem promoção automática e sem alterar os registros contábeis oficiais.


## Atualização de release gate — 27/10/2026 (18h42 BRT)

**Status de aprovação: E2E PENDENTE / PR #174 PERMANECE DRAFT.**

### Entregas reais verificadas
- Supabase `yspuaamokjbrosytqjpg`: migração `cr_v12_bank_annotation_revisions_20261027` executada com sucesso, criando tabela `public.cr_cora_bank_annotation_revisions_v12`, RLS ativado e RPC `cr_cora_bank_annotation_revise_v12` com EXECUTE somente para `service_role`. Testes em SQL transacional incluíram reenvio idempotente e negativas para fingerprint, valores, obra repetida e parcela incompleta. **6 anotações originais intactas e 0 revisões reais.**
- Backup do código Edge v23 preservado como arquivo independente na mesma PR; Edge candidata `cr-cora-aprovisionamento-v12-candidate-20261023` atualizada para **v24 ACTIVE**, código implantado corresponde exatamente ao arquivo da candidata. **Nenhuma transferência bancária foi executada**.
- PR [#192](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/192) alterou APENAS `preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html`, após CI **Central Canonical Guard SUCCESS** e **CONSTRU-REI Change Trace SUCCESS**, mesclada em `main` (squash `2cd3814`).
- Prova publicada no notebook `Rogerio-2022`: URL da prévia respondeu **HTTP 200**, `Content-Length: 337348`; HTML servido contém `bank-annotation-revise-commit` e `CANDIDATA DE TESTES`. O blob do HTML oficial `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html` é idêntico ao anterior à PR #192.
- Nova sincronização exata do HEAD candidato `8250bba6cea21bab3d9ecd91be705eb5e822779a` no notebook e execução `node --test audits/financeiro-v12-*.test.cjs`: **156/156 PASS, 0 FAIL, exit 0**.
- Registro canônico atualizado em `public.cc_items` (`FIN-V12-CORA-TRELLO-AUDITORIA-20261022`) mantendo **P0 Em andamento**.
- Leitura real da obra 666-26 no Trello: recebido e base R$ 4.188,88; cinco despesas somam R$ 3.571,59; lucro aritmético R$ 617,29, mas o texto declara R$ 547,29 (diferença R$ 70). Três anexos de mídia no cartão, nenhum comprovante adicional isolado por esta leitura. Não alterar custo ou lucro por suposição.

### Não declarar como feito
- **NENHUMA revisão material da distribuição das diárias** R$ 450 / R$ 450 / R$ 750: estão com uma única obra e faltam referências documentais seguras às demais obras. A prévia apenas disponibiliza o fluxo protegido.
- **Sem teste E2E de sessão diretoria/Android:** Opera Browser Connector desconectado; chamada HTTP direta ao backend foi bloqueada pelo ambiente. CI, testes de contrato, migração, GET da prévia e leitura de Edge NÃO substituem gravação autenticada com reenvio e leitura posterior.
- **Nenhum fechamento de período** foi registrado; integração do mês, CG, anual, ledger e recuperação real ainda requer aceite. PR #174 DRAFT, não integrar como release oficial.
- 75 registros históricos incompletos, obra 666-26, fevereiro R$ 0,10 e parser live 2024–2026 permanecem gates independentes.
- Manter Cofre Zero semanal, a V12 oficial e obras encerradas inalterados; não escrever correções financeiras sem documentação e controle idempotente.
