# Financeiro V12 — auditoria das fontes e painel de ganhos (27/10/2026)

## Fontes e diferenças de natureza

| Ano | Fonte oficial principal | Dados confiáveis disponíveis | Não inferir |
| --- | --- | --- | --- |
| 2023 | Cora bancário | Entradas, saídas, saldo por competência | Obras, rateios, lucro/ticket operacional |
| 2024 | Trello Gestão de Obras 2024 | Anual [cartão](https://trello.com/c/cGFAsZTN): bruto R$486.353,65, custos R$237.015,65, lucro/saldo histórico informado R$236.356,71, 334 obras, 54 a conferir; Éder R$104.797,75 e Rogério R$104.797,85. Regra 50/50 até julho e transição depois | Reescrever margens, ajustar rateios passados ou declarar saques comprovados |
| 2025 | Trello Gestão de Obras 2025 | Anual [cartão](https://trello.com/c/VmkhcR7e): R$773.950,45 de bruto reconciliado, 375 obras | Lucro final ou somatório de retiradas antes da conclusão de 213-24 |
| 2026 | Trello Gestão Financeira | Anual [cartão](https://trello.com/c/3CddF0rf), JAN–SET: Éder R$42.462,87; Rogério R$42.462,88; Fabrício R$30.331,23; Gabrielly R$16.789,82; Ágata R$3.451,53; CG R$15.018,75. Bruto R$444.914,01, custos R$299.501,93, lucro declarado R$145.411,98 | Considerar rateio declarado prova de saque, incorporar outubro sem fechamento, forçar coincidência entre rateios e lucro |

### Separação obrigatória

1. Rateio por pessoa: participação nominal registrada no Trello para a competência.
2. Apoios e diárias: remuneração por execução prestada, existente como **custo operacional da obra**. Somar ao rateio **somente para visão informativa de ganhos**, preservando natureza, período e fonte e sem deduplicar lançamentos bancários por conta própria.
3. Cora: retiradas efetivamente conciliadas separadas de anotações informativas; nunca misturar sem vínculo individual comprovado.
4. Trabalhos de terceiros: João não equivale automaticamente a João Victor; Bia/Rafa e outros nomes incompletos permanecem identificados como pendências.

### Apoios em estágio 2026

Visão principal de leitura `cr_finance_v12_support_2026_source`, deduplicação por obra/card canônico; 296 linhas importadas até 25/10/2026. Éder R$12.300,00 (apoios/diárias), Fabrício R$12.150,00 (apoios). João em identidade a conferir R$7.770,00. Ao menos uma linha com valor indisponível, outras identidades ambíguas. Linhas não demonstram saques. Visão adicional `cr_finance_support_evidence_v12` guarda auditoria independente de textos sem regravar valor.

### Regressão e segurança

- Supabase Edge `cr-v12-financial-settlements-trello-20261027` v2 ACTIVE, leitura autenticada, nenhuma operação POST / PUT.
- `cr_finance_v12_support_2026_source` e `cr_finance_support_evidence_v12` são `security_invoker`, SELECT não autorizado para `anon` e `authenticated`, autorizado somente para `service_role`.
- Testes em notebook com head `6c0ef34...`: 14/14 PASS. Inclui fonte 2024/2025, rateios, João/identidades, segregação Cora, HTML inline scripts e fonte.
- Fluxo de publicação pela PR #196 deve passar Change Trace e Canonical Guard; pós-merge conferir HTML live.
- Rollback: reverter PR #196; Edge v1 permanece no histórico da PR #195. Views SQL adicionais são puramente de leitura.

### Pendências não saneadas nesta publicação

Saneamento financeiro total **não** homologado: snapshot das obras 2026 é de 25/10 e precisa sincronização autorizada/canônica sem duplicar; 75 incompletos, 666-26 R$70, fevereiro R$0,10, rateio de abril 2026 R$5.105,10, outubro ainda aberto e execução autenticada de fechamento mês/CG/ano seguem independentes. Não corrigir cartões antigos por inferência.

A publicação fornece visibilidade e rastreabilidade, não afirma conciliação integral nem quitação de todos os rateios.
