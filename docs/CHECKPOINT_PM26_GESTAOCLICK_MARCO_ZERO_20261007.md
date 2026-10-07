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

Um título de venda pode ser legítimo sem equivaler ao valor líquido creditado no banco. Exemplo auditado:

- Obra **775-26**
- Título bruto no Click: **R$ 5.329,56**
- Trello: valor recebido **R$ 5.329,56**
- Taxa de link registrada no Trello: **R$ 469,00**
- Crédito líquido identificado no extrato Cora: **R$ 4.860,56**
- Relação: **R$ 5.329,56 - R$ 469,00 = R$ 4.860,56**

Conclusão: o título bruto é válido como registro financeiro/comercial, mas não pode inflar o saldo bancário interno.

Outro match confirmado:
- Obra **547-26**
- Trello: recebido **R$ 1.813,70**
- Cora real: crédito **R$ 1.813,70**
- Correspondência forte para conciliação.

## Estratégia de saneamento

Cada lançamento será classificado antes de alteração:

- **MANTER** — título legítimo e corretamente associado à obra.
- **AJUSTAR** — título legítimo com data, conta, valor, situação ou vínculo incorreto.
- **REMOVER DO SALDO BANCÁRIO / REMAPEAR** — título comercial válido, mas lançado de forma que contamina o saldo de conta bancária.
- **DUPLICADO** — registro redundante.
- **SEM CORRESPONDÊNCIA** — exige conferência antes de qualquer ação.

## Próxima etapa

Conciliação prioritária dos recebimentos recentes e divergentes, começando por:
- 775-26
- 547-26
- 670-26
- 693-26
- 715-26
- demais créditos recentes da Cora ainda sem obra identificada.

Somente após a matriz de conciliação estar validada será executada a limpeza do saldo interno e estabelecido o Marco Zero definitivo.
