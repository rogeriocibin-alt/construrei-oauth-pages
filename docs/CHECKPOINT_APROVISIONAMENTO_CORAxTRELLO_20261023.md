# CONSTRU-REI — checkpoint técnico, aprovisionamento Cora → Trello (23/10/2026)

## Publicação isolada
- Link: https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/dashboard-v12-aprovisionamento-cora-20261023/?v=f72b5d4b
- Último commit publicado no Pages: `f72b5d4b0ea632236b9b7fe2e24e386fd50edc6c` (GitHub Pages run 39967366235 SUCCESS).
- Apenas `preview/dashboard-v12-aprovisionamento-cora-20261023/index.html` em `main`; diretórios `production/` não alterados.
- PR #148 DRAFT, branch `candidate/central-aprovisionamento-cora-20261023`, sem merge.

## O que está implementado na candidata
1. UI da Central de Operações V12 reutilizada com abas atuais, histórico Cora real (sem fixture ou simulação), busca, filtro de débito/crédito, filtros **Pendentes / Confirmados Trello / Revisão**.
2. Leitura do campo oficial `source_id` do cache Cora e dos centavos `amount_centavos`; dados são obtidos da gateway oficial com autenticação.
3. Geração de `operation_id=CORA_<sha256("CR-CORA-APROVISIONAMENTO-V1:"+source_id)>`: chave idempotente estável em qualquer sessão, reutilizando a PK do ledger `public.cr_finance_v12_operations`.
4. Edge Function **candidata** `cr-cora-aprovisionamento-v12-candidate-20261023`, versão 2 ACTIVE, no Supabase existente. Ela reutiliza o writer/claim/finish V12 e não cria banco, tabela, integração Cora ou job novos. Confere no servidor fonte bancária, ID, data UTC, centavos e direção antes de prévia e commit.
5. A lista chama `action=bank-status`, sob autenticação da Diretoria, para mostrar histórico persistente. `TRELLO_CONFIRMED` somente para status `COMMITTED` com referência do mesmo ID, sem afirmar reconciliação completa de outras despesas.
6. O writer manual V12 original (`cr-finance-v12-safe-trello-candidate-20261021`) **não foi redeployado**. As operações comuns continuam usando-o; apenas transações `CORA_` passam pelo writer candidato.
7. Em caso de erro/ausência da consulta de ledger, botões de aprovisionar são bloqueados. Custos manuais já antecipados no Trello não geram novo débito automático. O fechamento de obra e Capital de Giro V12 originais permanecem disponíveis.
8. A descrição do card conserva o identificador bancário Cora completo, mesmo quando o marcador técnico da operação é removido após COMMITTED.

## Evidência conferida
- Banco Cora: 7.684 movimentações, zero `source_id` nulo ou fora da validação; dados consultados somente leitura.
- Ledger V12 na leitura de 23/10: 11 `COMMITTED` anteriores e **0** operações `CORA_` registradas. Nenhum lançamento real Cora → Trello foi feito nesta intervenção.
- 13 scripts JavaScript da página verificados sintaticamente; 7 verificações do núcleo puro executadas com sucesso; Edge Function publicada ACTIVE v2; GitHub Pages SUCCESS.
- Opera Browser Connector informou **Browser not connected**: aceite visual celular/notebook ainda não executado nesta sessão.
- Não foi feito lançamento no Trello, movimentação bancária, conciliação financeira real ou alteração de saldo.

## Pendências antes de homologação
- E2E com um `source_id` real e obra aberta, com diretor autenticado: prévia → confirmação Trello → reabrir página → status persistido; validar replay bloqueado e card sem marcador técnico.
- Vincular uma previsão manual pré-existente ao débito Cora correspondente **sem** adicionar segundo custo, exigindo evidência do mesmo lançamento no Trello.
- Abranger destinos adicionais (impostos, gerais, transferência, estorno, rateio e Capital de Giro) com persistência controlada; por enquanto a operação ativa é Cora → obra.
- Validar atualização de KPIs e margem depois de escrita, notebook e celular; revisar segurança/rollback antes de qualquer merge ou promoção.

**Estado**: candidata publicada com backend protegido; **não homologada de ponta a ponta**. V12 homologada e recursos financeiros oficiais intocados.

## Evidência de vídeo e correção de bloqueio — 23/10, 12h11 BRT

Vídeo de validação no Android mostrou a fila **Cora real** com movimentos bancários (por exemplo, R$ 150,00), mas todos permaneciam `AGUARDANDO CONSULTA DO REGISTRO` e os botões inativos. A mensagem literal foi: `V12_SOMENTE_LEITURA: gravacao fora do canal protegido`.

**Causa-raiz identificada no código:** script `v12-netguard` intercepta `window.fetch` e permitia chamadas POST apenas para endpoints anteriores da V12. O endpoint novo `cr-cora-aprovisionamento-v12-candidate-20261023?action=bank-status` era bloqueado antes de alcançar o servidor. A mensagem sugeria erroneamente falha na consulta financeira; não era perda de movimentações.

**Correção aplicada** na própria branch candidata (commit `5ad95b7dfcfe82cdf83fe6df1b33fbab9d1d97ce`) e na prévia isolada (commit `73d16acfc327ab666c00e3694957622880917548`): adicionar lista estrita para `bank-status`, `preview`, `commit`, `status` **somente** no slug exato da Edge candidata, exigindo cabeçalho de sessão. Sem wildcard, sem alterar os canais V12 originais e sem permitir outras operações. A Edge candidata continua verificando a role de diretor, o ID Cora e o ledger, independentemente do filtro do navegador.

**Testes nesta sessão:** 13 blocos JavaScript da página compilados; 7 casos simulados de interceptador de rede passaram (consulta autorizada, commit autorizado com sessão, ausência de sessão negada, ação não prevista negada, outro endpoint negado, GET preservado, writer anterior preservado). GitHub Pages run `39977127563` **SUCCESS**. Não foi executado POST financeiro autenticado real, não houve gravação Trello ou alteração Cora. **Reteste visual Android com nova URL e autenticação permanece necessário**.

**Link sem cache antigo:** https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/dashboard-v12-aprovisionamento-cora-20261023/?v=73d16acf

## Segunda gravação Android — 23/10, 12h28 BRT | botão invisível

- Vídeo `1000967166.mp4`: autenticação funciona; consulta retorna 113 movimentações Cora em 09/10–23/10; estado de fila chega a `PENDENTE` e não há nenhum botão visível dentro dos cartões.
- Logs reais do Supabase, 15h27–15h28 UTC: `GET /cr-cora-cache-gateway-20261020?api=dashboard...` respondeu HTTP **200** (~340–365 ms); `POST /cr-cora-aprovisionamento-v12-candidate-20261023?action=bank-status` respondeu HTTP **200** (~515–920 ms). Portanto, autorização e consulta ao ledger passaram; não há evidência de nova falha na rede.
- **Causa-raiz comprovada no CSS:** regra da V12 `#cora button{display:none!important}` escondia inclusive o botão criado dinamicamente em `#cr-ap-results`. A exceção posterior `#cora .manualactions button{display:inline-flex!important}` exibia os botões estáticos, mas não os botões das linhas, que não pertencem a `.manualactions`.
- **Correção:** adicionar regra mais específica exclusivamente para `#cora #cr-ap-results button.manualbtn` com `display:inline-flex!important`, inclusive estado `:disabled` e layout responsivo mobile. A proteção original de ocultação/negação fora da fila permanece inalterada. Commit da branch `95e6d566bda1efd43c993e84e60eafac197106f4`.
- **Prévia isolada publicada:** https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/dashboard-v12-aprovisionamento-cora-20261023/?v=4876715f ; main commit `4876715f7a19acab656a323a991cd9be53a5a6d4`, GitHub Pages build `39979854325` com **SUCCESS**.
- **Testes realizados:** sintaxe dos 13 blocos JavaScript sem erros; regra CSS presente na candidata e na prévia; nenhuma alteração em `production/`, na Edge Function, no saldo Cora ou nas obras fechadas. **Ainda falta aceitação visual do botão e E2E de gravação Trello real**, manter PR #148 DRAFT.

## Terceiro vídeo Android — 23/10/2026 12h55 BRT | obra válida rejeitada

Vídeo `1000967196.mp4` (32,7 s): função de consulta autenticada e botões individuais `Aprovisionar →` agora aparecem. Usuário escolhe o débito bancário real `Combustível`, **R$ 150,00, 23/10/2026**, informa obra **799-26** e seleciona **Não — lançar custo realizado**. Ao pressionar **Preparar lançamento V12**, a UI responde erroneamente `Informe a obra no formato 818-26.`. O vídeo também mostra a seleção `Sim — já foi lançado`, que deve continuar impedindo duplicação.

**Causa-raiz verificada no código da candidata:** formulário tinha regex literal JavaScript `/^\\d{1,5}-\\d{2}$/`; procurava uma barra invertida literal e recusava `799-26`. A validação correta usa `/^\d{1,5}-\d{2}$/`. A pesquisa dos demais regex âncora no arquivo apontou **somente esta** expressão com barras duplicadas.

**Correções verificáveis:**
- Candidate: commit `2795e1caba7daec5dfb4b0171b0cbf85cfb66b87`, alteração de uma expressão única.
- Preview GitHub Pages main: commit `44a0f3bb51c356011e79bf99a6574d96aff5e3a5`, modificando somente `preview/dashboard-v12-aprovisionamento-cora-20261023/index.html`. GitHub Pages run `39982809990` **SUCCESS**.
- Testes da expressão executados: **10 vetores** incluindo `799-26`, `818-26` e inválidos, todos passaram. **13 scripts** HTML passaram na checagem de sintaxe.
- Teste de regressão ancorado na expressão real da UI acrescentado em `candidate/central-aprovisionamento/aprovisionamento-core.test.js`, commit `b5803db6460cbdf5a30ef88276d2b47236e38db0`.
- **Link para o teste:** https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/dashboard-v12-aprovisionamento-cora-20261023/?v=44a0f3bb
- Não houve gravação financeira ou Trello na correção, nem alterações ao `production/`, às obras fechadas ou ao saldo Cora. **Ainda falta validar o próximo passo no Android e executar preview/commit real controlado**; PR #148 deve continuar DRAFT.

## Primeiro E2E bancário real confirmado — vídeo Android 1000967216 (23/10/2026)

**Registro de aceitação com prova cruzada (sem nova escrita executada pelo agente):**

- Vídeo Android de 52,6 segundos, sessão do usuário por volta de **13h04 BRT**, mostra prévia `PRÉ-VISUALIZAÇÃO OK`, ação `LANÇAR NO TRELLO`, confirmação `LANÇADO COM SUCESSO NO TRELLO`, botão `ABRIR CARD NO TRELLO` e inspeção do cartão na interface Trello.
- **Banco Cora cache oficial:** débito de **R$ 150,00**, 23/10/2026, descrição **Combustível**, `source_id=ent_Kn8uoKAfRme4691Uco1rrXA`.
- **Obra alvo:** **799-26** — orçamento **R$ 2.830,22**, cartão `https://trello.com/c/CJ27HA7S`, lista **AG. ACERTO** (não foi fechado ou movido pelo fluxo).
- **Ledger Supabase** `public.cr_finance_v12_operations` consultado diretamente: `operation_id=CORA_da7301bde13c5c750703b147ae336262d22397e26d60df89f5d53680668772b4` com `status=COMMITTED`, `error_code=NULL`; criado em **2026-10-23T16:04:37Z** e finalizado às **16:04:40Z**; `payload.case=799-26`, `payload.reference=ent_Kn8uoKAfRme4691Uco1rrXA`, `payload.category=Combustível`, `trello_url=https://trello.com/c/CJ27HA7S`.
- **Idempotência observada:** query por esse `operation_id` retornou **total=1, committed=1**; consulta do cartão Trello por conector confirmou **uma** linha nova única `23/10 - R$150,00 Combustível ... ID bancário Cora: ent_Kn8uoKAfRme4691Uco1rrXA`.
- **Efeito no acerto** visível no cartão `ACERTOS 2026 — AGUARDANDO ACERTO`: obra 799-26 com **Custos R$ 1.375,53**, **Lucro R$ 1.454,69** e **Margem 51,40%**; cálculo conferido por soma das 10 despesas listadas e `R$ 2.830,22 - R$ 1.375,53 = R$ 1.454,69`.
- **Dados bancários não foram alterados**; o fluxo registrou custo no cartão Trello por autenticação do próprio usuário. O agente realizou **somente leituras** no Supabase e Trello durante a auditoria deste vídeo.

**Resultado:** PRIMEIRO E2E Cora → operação determinística no Supabase → Trello → acerto visível: **APROVADO para esse caso concreto**. **Não equivale à homologação integral** de toda a candidata (entradas, aprovisionamentos com antecipação, rateio multiobra, estornos, capital de giro, replay via formulário manual, mobile re-login e outras classes de movimentos ainda exigem gates apropriados). PR #148 permanece **DRAFT**, candidata isolada e V12 homologada inalterada.

**Observação de acabamento:** Trello mantém o `source_id` completo na descrição após a confirmação; o sufixo visível em `Ref.` fica abreviado pela rotina de marcador temporário do writer. Não há perda da referência completa para auditoria.

## Confirmação persistente e higienização de descrição — 23/10/2026

**Escopo autorizado:** exibir `TRELLO CONFIRMADO` na fila Cora, inclusive após recarga/reentrada; impedir repetição do lançamento; evitar repetição de IDs/CORA_ e outros códigos técnicos na descrição dos cartões Trello. Preservar Ledger Supabase como fonte oficial de rastreabilidade e todas as obras/valores originais.

### Alterações técnicas

1. **Backend Cora candidato** `candidate/central-aprovisionamento/backend-cr-cora-aprovisionamento-v12-candidate.ts`: atualização de `withMarker` (commit `1d36e36dd6e6ccaac42c5b8837521e1cf2a4f2f7`), de forma que lançamentos com `operation_id=CORA_<sha256>` sejam escritos temporariamente com referência visual `Cora CRV12OP_<id>`. A rotina existente remove o marcador temporário apenas **depois** de confirmar escrita Trello e `COMMITTED` no Supabase, resultando em `Ref. Cora`. Texto `ID bancário Cora:<source_id>` é filtrado da descrição visível; campos id/source/fingerprint e idempotência permanecem na `public.cr_finance_v12_operations`. Os lançamentos manuais sem id CORA_ preservam a lógica original. Edge isolada `cr-cora-aprovisionamento-v12-candidate-20261023` implantada **ACTIVE v3**, sem alterações ao writer oficial da V12.
2. **Frontend candidato** `candidates/central-operacoes-unificada-v12-20261023/index.html`: reconsulta ledger ao recarregar página quando já autenticado e ao retornar à aba bancária, atualiza a fila após `cr:ap:confirmed` com checagem `bank-status`, colore de verde `✓ TRELLO CONFIRMADO · Obra <n>`, exibe link validado `Abrir cartão Trello ↗`, bloqueia `Aprovisionar` para operações `COMMITTED` e não exibe ID bancário completo ao lado da transação (fica disponível como título técnico). Descrição na preparação não injeta `source_id` no texto. Commits `617cdb9fb276b491a46471c4661a95b871af1c06` e `76e3c8f65cdfbe203604d6503974d0874b81eb9e`.
3. **Barreira pós-commit**: se formulário manual for reutilizado na mesma sessão sem limpar, e a referência ainda for o mesmo `source_id` Cora previamente confirmado, a prévia é bloqueada. Commit `3006536fb5dfb7ca17685ac69d93e7069c7c9e25`. Não substitui controles no backend nem aplica bloqueio indiscriminado em todos os lançamentos manuais.
4. **Prévia isolada publicada** em `main`, sem tocar `production/*`: URL https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/dashboard-v12-aprovisionamento-cora-20261023/?v=f19494a4 (último commit `f19494a4e7d9c2afcc1ebc292057a68d0548d84a`).

### Trello existente — uma edição real limitada a texto

- Cartão da obra **799-26**, `https://trello.com/c/CJ27HA7S`, permaneceu em **AG. ACERTO**.
- ÚNICA linha alterada de `23/10 - R$150,00 Combustível - Combustível - ID bancário Cora: ent_Kn8uoKAfRme4691Uco1rrXA | Combustível - Ref. ent_Kn8uoKAfRme4691Uc` para **`23/10 - R$150,00 Combustível - Ref. Cora`**. Os demais **22 separadores/linhas** e todas as outras despesas ficaram intactos; mesmo total, nenhuma inclusão/exclusão de valores ou mudança de lista/fechamento.
- Confirmação posterior via conector Trello: linha legível presente, código antigo ausente; **23 linhas no cartão**.
- Confirmação posterior via Supabase SQL: exatamente **1 registro** bancário, `status=COMMITTED`, `reference=ent_Kn8uoKAfRme4691Uco1rrXA`, `amount_cents=15000`, `trello_url=https://trello.com/c/CJ27HA7S`. A limpeza visual **não altera nem invalida** a idempotência.

### Testes e gates

- Novo backend deploy v3 ACTIVE; proteção de autenticação de diretor intacta; ref Cora original completa continua no ledger.
- 13 blocos JS da candidata e da prévia foram sintaticamente validados após mudanças.
- Teste unitário de `withMarker` em execução JavaScript comprovou remoção de código técnico e duplicidade textual para banco e preservação de comportamento para operação manual.
- **Não foi feito um segundo débito real de teste**; replay, troca de dispositivo, entradas bancárias, revisão de antecipações e outras categorias ainda carecem de E2E próprio antes de homologação global. Não promover PR #148 nem atualizar `production/` com base apenas neste teste.

## Falha ao lançar segundo custo — 23/10/2026 13h42 BRT

- Usuário relata erro ao tentar novo custo após primeiro E2E e limpeza de descrições. **Mensagem de erro não fornecida**, então não alegar causa única confirmada.
- Auditoria Supabase: em 23/10 de 16:10–16:47 UTC, chamadas `bank-status` com HTTP 200; **nenhuma** nova chamada `action=preview` ou `action=commit` da função Cora após o primeiro E2E (16:04 UTC), nem registros adicionais `CORA_` em `public.cr_finance_v12_operations`. O primeiro lançamento `799-26/R$150` continua `COMMITTED`. Evidência aponta erro **antes do backend de gravação**, provavelmente formulário/estado; não há prova de lançamento perdido ou duplicado.
- Diagnóstico preventivo de dois pontos na UI: (1) estado da operação anterior permanecia preenchido no formulário ao iniciar nova transação; `S.manualLastPayload` e referência antiga podiam disparar bloqueio de repetição. (2) categoria `NF` usa cálculo automático 8,5% no formulário original, que em movimentações Cora não deve alterar um débito bancário efetivo.
- Correções: antes de vincular nova transação Cora, chamar `manualClear()` e inicializar novo `S.manualOp` com hash estável da **nova** referência; ao abrir modo manual, limpar automaticamente referência antiga de operação Cora já finalizada, sem perder ledger. Para `NF` de origem Cora, preservar `amount_centavos` efetivo e `readOnly`; manter regra NF automática para modo manual original.
- Commit candidato `1ee9c1928f2b50d3d0493ad5770f0b42eced87f2`; teste de regressão `f393f46d1e2ccad8ecb331b38446bd4ea7433d59`. Testados 7 cenários unitários com JS executado e todos os 13 scripts HTML em validação sintática.
- Prévia isolada `main` commit `dcda7a93ecec3c6505e32b5d84471161d43dec74`; **somente** `preview/dashboard-v12-aprovisionamento-cora-20261023/index.html` mudou, nenhum `production/`; GitHub Pages run `39989821824` **SUCCESS**. URL https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/dashboard-v12-aprovisionamento-cora-20261023/?v=dcda7a93
- **Sem novo lançamento real de teste ou modificação Trello/ledger bancário por esta intervenção.** Backend Cora Edge v3 não foi alterado; PR #148 permanece DRAFT. É necessário reteste Android e, se o problema persistir, mensagem exata da tela para identificar outra causa.

## Conciliação de custo já existente no Trello — 23/10/2026

**Pedido:** usuário deseja que movimentações Cora já lançadas manualmente no Trello deixem de constar como pendentes, mas sem duplicar lançamentos e com diferenciação visual da escrita automática do Dashboard. Segundo E2E de novo custo reportado funcionando pelo usuário.

### Implementação e regras de proteção

- **Backend isolado** `cr-cora-aprovisionamento-v12-candidate-20261023` passou a **v5 ACTIVE**. Ações autenticadas exclusivamente à Diretoria: `existing-preview` (somente leitura) e `existing-confirm` (cria vínculo idempotente no ledger, **sem POST/PUT para Trello**).
- Fluxo: usuário seleciona transação real, informa obra, escolhe `Sim — já foi lançado`, aciona Preparar, revisa linha do cartão de obra com **mesma data e valor em centavos**, confirma explicitamente `Confirmar conciliação sem novo lançamento`. Se houver várias linhas com mesma data/valor, usuário seleciona a linha específica. Sem correspondência, nenhuma marcação é feita. Entradas ainda não usam este caminho; requerem revisão.
- Server verifica novamente ID bancário na cache Cora, valor, data, natureza, obra exata (Trello preview), cartão real e texto em seção Custos. Linhas já marcadas `Ref. Cora` são excluídas para não reaproveitar despesa já lançada pelo Dashboard. Se existir linha idêntica duplicada na mesma descrição, é ambígua e não é elegível.
- No `existing-confirm`, servidor recalcula o hash `SHA256(card_id|linha)`, confirma a linha atual no cartão, procura vínculo anterior no ledger e usa as mesmas RPCs `cr_finance_v12_claim`/`cr_finance_v12_finish` de forma idempotente e com bloqueio `PENDING` por cartão. Registra `payload.reconciliation_kind=EXISTING_TRELLO`, `payload.trello_match_key`, `payload.trello_line_text`, `payload.reference=source_id`, `COMMITTED` e `trello_url`. Trello não é modificado por essa conciliação.
- `bank-status` distingue `TRELLO_CONFIRMED` (custo criado pelo Dashboard) de `TRELLO_EXISTING` (já lançado e conciliado); frontend apresenta segundo em **azul-claro** como `✓ JÁ LANÇADO · CONCILIADO` com link Trello. Ambos somem das pendências, com repetição bloqueada; filtros individuais `Lançados no Dashboard` e `Já lançados · conciliados`. Recarregar reconsulta estado persistido no Supabase.
- Frontend `candidates/central-operacoes-unificada-v12-20261023/index.html`; netguard ganhou exclusivamente `existing-preview`/`existing-confirm` com x-cr-session; escritor V12 original e produção não mudaram. Commits GitHub `daafd10820a1ae614726c3b1c23ee5254322e459` (backend), `20317db462cd5eefe77ff255d59d47185b5994ae` (hardening), `ee84988be698ed4222ba6f626a5af07d4e2a76fc` (UI); teste `8cb9a88cdae7c75a5167dbab4ec3d67086525a0c`.
- **Preview isolada publicada:** https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/dashboard-v12-aprovisionamento-cora-20261023/?v=f1c9e794 , commit `f1c9e794b2ccecfe260df9c542c55c07f74369cf`; Actions Pages `39993167987` **SUCCESS**. GitHub comprovou que este commit alterou **somente `preview/`**, sem `production/`.

### Evidências e pendências

- Conector Trello abriu cartão real `799-26/CJ27HA7S`, que tem custo pré-existente `23/10 - R$100,00 Materiais - EXECUTIVE MOVEIS... Ref. PIX` e custo Cora já vinculado `23/10 - R$150,00 Combustível - Ref. Cora`.
- Função matcher testada em JavaScript extraído da função real, com cartão Trello real: **1 candidato** para 23/10 R$100,00; **0** para data e valor divergentes; custo pré-marcado `Ref. Cora` passou a ser excluído após hardening. UI: 13 blocos script validados sintaticamente. A prévia e a versão isolada foram publicadas; **não há teste assinado de existing-confirm no celular** nesta sessão.
- Consulta de ledger no momento da publicação: **4 operações CORA_ já `COMMITTED`** (lançamentos reais existentes do usuário), **0 `EXISTING_TRELLO`**. A rotina de conciliação não alterou/desduplicou nenhuma linha de Trello nem marcou movimentos históricos automaticamente. Primeiro E2E de conciliação manual de custo preexistente ainda **pendente de confirmação no celular**, por segurança.
- PR #148 permanece DRAFT, sem merge, sem publicar em produção; capital giro, obras fechadas e saldo Cora preservados.

### Complemento UX de 23/10 — consulta automática ao selecionar já lançado

- Usuário não precisa acionar `Preparar lançamento V12` para iniciar a busca quando a obra já está preenchida: ao selecionar `Sim — já foi lançado`, a candidata chama somente `existing-preview`. Quando opção foi escolhida antes da obra, busca inicia ao concluir a edição do número da obra. `existingBusy` previne sobreposição e verificação do ID/obra/estado evita aplicar resposta antiga após mudar seleção.
- Commit candidata `c9e0883dcc8da9ae1a072a4e39ff5cd9c81efac5`; main preview `5cc30ce0e24f35f2b55a90b1042e5e1715c0d5c2` exclusivamente `preview/`.
- Testes sobre leitura Trello real da obra 799-26: R$100,00 em 23/10 presente `Ref. PIX` como **1 candidato**; R$150,00 ou R$105,70 com `Ref. Cora` = **zero candidato**; R$99,99 = zero. 13 scripts HTML validados sintaticamente.
- O usuário ainda **não executou uma conciliação `EXISTING_TRELLO` concluída**; no último relatório SQL, cinco operações Cora `COMMITTED` de escrita comum do usuário, zero conciliações preexistentes. A atualização não fez gravações bancárias nem Trello. Antes de homologar, aguardar E2E do vínculo existente.
- **Link final desta revisão:** https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/dashboard-v12-aprovisionamento-cora-20261023/?v=5cc30ce0
