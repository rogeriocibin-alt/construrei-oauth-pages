# CHECKPOINT PM-26 — Gestão Click — Saneamento Financeiro + Marco Zero

**Data:** 07/10/2026  
**Pendência mestre:** PM-26  
**Área:** FINANCEIRO  
**Prioridade:** P1  
**Escopo:** saneamento financeiro do Gestão Click, estabelecimento de marco zero e preparação para futura sincronização controlada.

## Regra canônica

- O Trello permanece como fonte financeira canônica do histórico operacional.
- O extrato bancário real da Cora é a fonte de verdade para movimentação de caixa bancário.
- O Gestão Click não deve tratar títulos comerciais/financeiros de venda como se fossem, por si só, movimentos bancários.
- Nenhuma limpeza destrutiva deve ocorrer antes da classificação e conciliação Trello × Cora × Gestão Click.
- Obras já fechadas não devem ser reabertas por este saneamento.

## Snapshot inicial — 07/10/2026

### Cora — extrato bancário real
- Saldo exibido no extrato integrado, na data de 07/10/2026: **R$ 0,00**.
- Há créditos e débitos bancários reais recentes no extrato.
- O extrato real registra saídas; portanto não é compatível com a visão interna do ERP que mostrava saídas mensais zeradas.

### Gestão Click — contas internas
Foram identificadas 5 contas bancárias internas com saldos acumulados que não representam o caixa bancário real:

- Conta Banco CORA: **R$ 184.962,34**
- Conta Banco ITAÚ: **R$ 2.277,06**
- Conta Banco PAGSEGURO: **R$ 20.018,48**
- Conta Capital de Giro 14%: **-R$ 3.024,75**
- Conta Integrada: **R$ 182.185,33**

**Total contábil exibido nessas cinco contas: R$ 386.418,46.**

Na Conta Banco CORA interna:
- Entradas no mês: **R$ 7.407,69**
- Saídas no mês: **R$ 0,00**
- Sem integração Open Finance ativa.
- Nenhuma importação OFX registrada.
- Existem títulos não conciliados, inclusive com vencimentos futuros, compondo o saldo interno.

## Diagnóstico técnico

O Gestão Click está misturando duas naturezas diferentes:

1. **Títulos comerciais/financeiros** gerados por vendas, recebimentos, parcelas, taxas e cobranças;
2. **Movimentação bancária real**, que ocorre no extrato da Cora.

Um título de venda pode ser legítimo sem equivaler ao valor líquido creditado no banco.

### Match 775-26
- Título bruto no Click: **R$ 5.329,56**
- Trello: valor recebido **R$ 5.329,56**
- Taxa de link registrada no Trello: **R$ 469,00**
- Crédito líquido identificado no extrato Cora: **R$ 4.860,56**
- Relação: **R$ 5.329,56 - R$ 469,00 = R$ 4.860,56**
- Classificação: **MANTER título comercial + REMAPEAR da lógica de saldo bancário**.

### Match 547-26
- Trello: recebido **R$ 1.813,70**
- Cora real: crédito **R$ 1.813,70**
- Classificação: **MATCH FORTE / MANTER e conciliar**.

## Conciliação ampliada — 07/10/2026

### 693-26
- Trello atual: valor fechado/recebido **R$ 1.755,00**, recebido em 05/10.
- Cora real: crédito **R$ 1.755,00** em 05/10.
- Gestão Click: recebimento **R$ 1.755,00**, situação **Confirmado**, competência/compensação 05/10.
- Conta interna usada no Click: **Conta Integrada**.
- Bridge canônico legado ainda guarda bruto **R$ 2.595,00**, pendente **R$ 2.595,00** e status **AGUARDANDO_PAGAMENTO**.
- Classificação: **MANTER recebimento + REMAPEAR conta + AJUSTAR bridge canônico antigo**.

### 715-26
- Trello: obra marcada como **Recebido 30/09**, valor **R$ 3.748,00**.
- Cora real: crédito de **R$ 3.748,00** em 30/09.
- Bridge canônico legado: bruto **R$ 3.748,00**, pendente **R$ 3.748,00**, status **ABERTO**.
- Classificação: **RECEBIMENTO CONFIRMADO / AJUSTAR status e pendência do bridge**.

### 716-26
- Trello: valor recebido **R$ 2.721,00**.
- Cora real: crédito **R$ 2.721,00** em 29/09.
- Gestão Click: título interno de **R$ 2.721,00**, ainda exibido como não conciliado na Conta Integrada.
- Bridge canônico legado: bruto **R$ 2.721,00**, pendente **R$ 2.721,00**, status **ABERTO**.
- Classificação: **MANTER título + REMAPEAR/CONCILIAR + AJUSTAR bridge**.

### 670-26
- Trello: bruto **R$ 4.825,30**; pagamentos 1 e 2 de **R$ 1.608,33** já recebidos; terceira parcela prevista para **30/10**, **R$ 1.608,33**.
- Cora real: segundo crédito identificado de **R$ 1.608,33**.
- Gestão Click: existe parcela futura **R$ 1.608,44**, vencimento **16/11/2026**, em aberto.
- Bridge canônico legado: pendente **R$ 3.216,97**, status **PARCIAL**.
- Classificação: **AJUSTAR parcela futura + AJUSTAR saldo pendente do bridge**. Não apagar a venda.

## Estado da camada canônica

Leitura das tabelas V5:
- **cr_cases_v1:** 28 casos.
- **cr_quotes_v1:** 0 registros.
- **cr_quote_approvals_v1:** 0 registros.
- **cr_financial_entries_v1:** 0 registros.

Entre as obras auditadas:
- **670-26, 693-26, 715-26 e 716-26** já existem como casos TRELLO_GC_RECONCILED.
- **547-26 e 775-26** ainda não existem nesse bridge.
- Portanto a camada V5 ainda é uma estrutura preparatória/legada de metadados, não um livro financeiro canônico completo.

## Estratégia de saneamento

Cada lançamento será classificado antes de alteração:

- **MANTER** — título legítimo e corretamente associado à obra.
- **AJUSTAR** — título legítimo com data, conta, valor, situação ou vínculo incorreto.
- **REMOVER DO SALDO BANCÁRIO / REMAPEAR** — título comercial válido, mas lançado de forma que contamina o saldo de conta bancária.
- **DUPLICADO** — registro redundante.
- **SEM CORRESPONDÊNCIA** — exige conferência antes de qualquer ação.

## Separação obrigatória de frentes dentro da PM-26

1. **Saneamento do Gestão Click**
   - contas internas;
   - títulos;
   - baixas;
   - parcelas;
   - conciliação com extrato real.

2. **Backfill canônico controlado**
   - corrigir apenas depois da conciliação;
   - preencher bridge/camada V5 sem inventar histórico;
   - não promover automação de escrita enquanto a matriz não estiver validada.

## Próxima etapa

- Identificar e classificar os demais créditos recentes da Cora.
- Localizar títulos do Gestão Click que ainda aparecem em conta incorreta.
- Fechar matriz **MANTER / AJUSTAR / REMAPEAR / DUPLICADO / SEM CORRESPONDÊNCIA**.
- Executar limpeza somente após checkpoint pré-saneamento e plano de rollback.
- Depois estabelecer o **Marco Zero definitivo** e habilitar a construção da sincronização futura.
