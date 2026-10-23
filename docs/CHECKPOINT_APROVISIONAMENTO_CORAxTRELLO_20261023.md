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
