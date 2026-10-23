# V12 — Auditoria de cobertura dos 25 períodos de capital de giro
**Data:** 21/10/2026. **Escopo:** leitura da lista Trello de capital de giro. **Estado:** Parcial, sem reconciliação individual de todos os saldos, sem escrita.

Lista Trello: ari:cloud:trello::list/workspace/65b2e1cc75bf1e40730edee2/692e0d6c360c13a9cd738f33

- Total 28 cards (1 resumo agregado, 1 fiscal avulso, 26 possíveis cards? Revisão de classificação necessária); 6 cards recentes com metadados `CG_PERIOD_KEY|...`, `CG_CREDIT|...`, `CG_BALANCE|...`.
- 20 demais sem esse trio (incluem 1 resumo, 1 fiscal e 18 períodos legados); antes de afirmar 25 períodos, mapear quais cards o algoritmo canônico inclui e por quê.
- Dos 6 cartões estruturados: créditos e saldos: 570,85/570,85; 174,34/0,00; 581,76/581,76; 1.115,59/1.115,59; 1.114,54/1.114,54; 509,44/90,01.
- Alguns títulos legados mencionam saldo negativo (-R$16,01, -R$0,27, -R$99,78), e alguns títulos guardam saldo anterior e saldo real no mesmo título (5,31 -> 0,00 etc.). **Não inferir saldo real com regex no título.**
- Confirmado que 25 períodos no resumo e 3 títulos divergentes requerem classificação de cartões individuais na lógica atual antes de qualquer saneamento.
- Regras candidatas: fonte estruturada prevalece, estados temporais devem ser considerados, blocos manuais delimitados; legado sem metadados exige parser contextual e exceções, com revisão Financeiro REI; título nunca é fonte prioritária.
- Não modificar Trello ou versão V11; não aplicar rateio atual retroativo.
- Gate: saldo canônico por período + notas sobre transferências entre períodos; conciliação com movimentos Cora; somente então publicar V12.
