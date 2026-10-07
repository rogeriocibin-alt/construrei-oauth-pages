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

### Match 727-26
- Trello: valor fechado/recebido **R$ 1.902,40**.
- Taxa de link: **R$ 133,35**.
- Cora real em 06/10: crédito Boom Negócios **R$ 1.769,05**.
- Relação: **R$ 1.902,40 - R$ 133,35 = R$ 1.769,05**.
- Classificação: **MANTER bruto comercial + conciliar líquido bancário e taxa separadamente**.

### Match 547-26
- Trello: recebido **R$ 1.813,70**.
- Cora real: crédito **R$ 1.813,70**.
- Classificação: **MATCH FORTE / MANTER e conciliar**.

### Match 717-26
- Trello: recebido **R$ 3.827,70**.
- Cora real em 29/09: **R$ 3.827,70**.
- Classificação: **MATCH FORTE / MANTER e conciliar**.

### Match 586-26
- Trello: recebido **R$ 17.000,00**.
- Cora real em 28/09: **R$ 17.000,00**.
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

### Lote Galvão — PIX R$ 2.783,43 em 06/10
- Crédito Cora: **CLASSIC GESTAO ADMINISTRATIVA LTDA — R$ 2.783,43**.
- Caso-escola financeiro já documentado e validado:
  - 645-26: R$ 1.040,00 com desconto específico de 5% = **R$ 988,00**
  - 649-26: **R$ 970,00**
  - parcela 650-26: **R$ 400,00**
  - parcela 647-26: **R$ 265,00**
  - 653-26: **R$ 469,70**
- Base do lote: **R$ 3.092,70**
- Comissão Galvão 10%: **R$ 309,27**
- Líquido: **R$ 2.783,43**
- Diferença para o PIX real: **R$ 0,00**
- Classificação: **RECEBIMENTO AGRUPADO CONFIRMADO**. Regra: um PIX pode liquidar várias obras/parcelas; não forçar relação 1 PIX = 1 card.

### Transferência Éder — R$ 159,86 em 03/10
- Cora: saída **-R$ 159,86** para CASUAL SEMI JOIAS LTDA às 20:01:04.
- Cora: entrada **+R$ 159,86** de EDER CIBIN às 20:02:58.
- Mesma data, mesmo valor e diferença inferior a 2 minutos.
- Classificação: **RESTITUIÇÃO/REEMBOLSO — NÃO É RECEITA DE OBRA**.

### Créditos ainda sem correspondência comprovada
- **29/09 — LUIZ CARLOS CAZARIN DE SOUZA — +R$ 800,00**: existem várias obras de R$ 800,00; 725-26 é candidata operacional, mas não há prova suficiente de pagador/vínculo. **SEM CORRESPONDÊNCIA por enquanto.**
- **01/10 — JBA LOCACAO DE IMOVEIS LTDA — +R$ 87,06**: não há card/título comprovado para esse valor. **SEM CORRESPONDÊNCIA por enquanto.**
- Esses movimentos não serão atribuídos por aproximação.

## Anomalia estrutural adicional — 647-26

Foi identificado no Gestão Click:
- título da venda **64726**, centro de custo **647-26**, valor **R$ 265,00**;
- competência **04/09/2026**;
- conta bancária interna **Conta Banco CORA**;
- situação **Em aberto / Não conciliado**;
- vencimento de uma ocorrência em **08/11/2027**;
- outra ocorrência visível em **08/10/2027**, também R$ 265,00;
- a parcela de R$ 265,00 já integra o lote Galvão recebido em 06/10/2026.

Classificação: **P0 DE SANEAMENTO — PARCELAS FUTURAS/REPETIDAS POTENCIALMENTE INFLANDO O SALDO INTERNO**. Antes de excluir ou baixar, levantar todas as ocorrências vinculadas à venda 64726 e demais vendas com padrão semelhante.

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
- **DUPLICADO / FUTURO INDEVIDO** — registro redundante ou parcela criada fora da operação real.
- **NÃO RECEITA** — reembolso, restituição ou transferência interna sem natureza de recebimento de obra.
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

- Auditar todas as parcelas futuras/repetidas que alimentam as contas internas, começando pela 647-26.
- Fechar os dois créditos sem correspondência (R$ 800,00 e R$ 87,06) somente com evidência.
- Montar lote de correção **SEM EXCLUSÃO DE VENDA**, separando títulos comerciais legítimos de saldo bancário.
- Executar limpeza somente após checkpoint pré-saneamento e plano de rollback.
- Depois estabelecer o **Marco Zero definitivo** e habilitar a construção da sincronização futura.


## Varredura das cinco contas internas — títulos visíveis no topo

### Conta Banco CORA
Títulos visíveis como **Não conciliado**:
- 647-26 — R$ 265,00 — vencimentos visíveis **08/10/2027** e **08/11/2027**.
- 670-26 — R$ 1.608,44 — 16/11/2026 — divergente da parcela canônica.
- 579-26 — R$ 925,00 — 25/10/2026 — requer classificação.
- 775-26 — R$ 5.329,56 — 07/10/2026 — recebimento bruto já comprovado; líquido Cora R$ 4.860,56.
- 653-26 — R$ 469,70 — 06/10/2026 — integra o lote Galvão recebido por R$ 2.783,43.

### Conta Banco ITAÚ
Títulos históricos ainda **Não conciliados**:
- 1044-25 — R$ 250,00 — 23/12/2025.
- 1041-25 — R$ 450,00 — 01/12/2025.
- 1032-25 — R$ 696,80 — 01/12/2025.
- 1049-25 — R$ 1.500,00 — 01/12/2025.

### Conta Banco PAGSEGURO
Títulos históricos ainda **Não conciliados**:
- 298-26 — R$ 3.400,00 — 04/05/2026.
- 225-26 — R$ 792,88 — 30/04/2026.
- 185-26 — R$ 1.500,50 — 25/04/2026.
- 149-26 — R$ 7.174,90 — 03/04/2026.
- 1095-25 — R$ 1.916,20 — 06/01/2026.
- 1077-25 — R$ 3.496,50 — 17/12/2025.
- 1019-25 — R$ 1.737,50 — 30/11/2025.

### Conta Capital de Giro 14%
- Não houve títulos de venda visíveis no recorte atual.
- Saldo da conta no snapshot inicial permanece negativo em R$ 3.024,75 e deve ser auditado separadamente, sem misturar com recebimentos de obras.

### Conta Integrada
Títulos visíveis como **Não conciliado**:
- 645-26 — R$ 988,00 — 06/10/2026 — integra lote Galvão já recebido.
- 649-26 — R$ 970,00 — 06/10/2026 — integra lote Galvão já recebido.
- 693-26 — R$ 1.755,00 — 05/10/2026 — recebido e confirmado no Cora/Trello/Click.
- 716-26 — R$ 2.721,00 — 29/09/2026 — recebido e confirmado no Cora/Trello.
- 547-26 — R$ 1.813,70 — 25/09/2026 — recebido e confirmado no Cora/Trello.
- 694-26 — R$ 2.000,00 — 25/09/2026 — Trello registra acordo em dinheiro de R$ 2.000,00; não confundir com o PIX Galvão de R$ 2.783,43.
- 691-26 — R$ 220,00 — 25/09/2026 — requer classificação.

## Diagnóstico consolidado da causa do saldo artificial

A evidência ao vivo demonstra que as contas internas do Gestão Click não estão funcionando como espelho confiável do caixa bancário. Elas acumulam:

1. **títulos comerciais legítimos ainda marcados como não conciliados mesmo após recebimento real**;
2. **títulos históricos antigos** de 2025/2026;
3. **parcelas futuras indevidas ou divergentes**, inclusive em 2027;
4. **parcelas individuais de recebimentos agrupados**, que não podem ser conciliadas isoladamente 1:1 com um único PIX;
5. **valores brutos de vendas**, enquanto o banco recebe valor líquido após taxas/comissões.

Conclusão operacional: **não corrigir o saldo editando um número global e não excluir vendas em massa**. O saneamento deve atuar na situação, vinculação, conta, baixa e parcelamento dos títulos, preservando a venda/orçamento legítimo.
