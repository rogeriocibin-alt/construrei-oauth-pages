# Revisão corretiva da Central Financeira — 23/10/2026

## Decisão
A demonstração que inventou novo formulário e cálculo de Capital de Giro não será incorporada. Reutilizar o Capital de Giro homologado da V12, seus cards Trello, saldo, acertos e fechamento, sem motores paralelos.

## Fluxo único, sem eliminar a antecipação
- Lançamento manual previsto: manter Cora Manual → Trello atual para custo ainda não pago/sem extrato, com obra, data, tipo e margem provisória. Não depende do Cora.
- Movimento Cora realizado: abrir Aprovisionar e permitir vincular ao lançamento manual previsto correspondente, sem somar custo duas vezes. Sem previsão, lançar via mecanismo existente.
- Estados distintos: PREVISTO, CONCILIADO, PENDENTE e DIVERGENTE; IDs operacionais e bancários, histórico de competência, previsão e liquidação.
- Capital de Giro: embutir a operação atual, não reconstruir. Manter geração por fechamento, acertos, despesas, saldo e lista CAPITAL DE GIRO TEMPORÁRIO.
- Fechar Obra: reutilizar botão, cálculos e rateio existentes, sem duplicação nem reabertura de obra fechada.
- Após persistência real no Trello, atualizar indicadores, margem, histórico e CG. Aprovisionar não cria transação bancária no Cora.

## Identidade
- Buscar o ativo específico Logo APP CONSTRU-REI DEV no APP/registro de assets. Não confundir com logo genérica da função construrei-logo.
- Até identificar e validar o ativo exato, conservar logo atual homologada V12.
- Reutilizar cores e componentes V12: fundo claro, branco, azul institucional e dourado; proibir regressão para tema escuro antigo.

## Testes de aceite
1. Antecipar custo manual obra 818-26, mostrar margem provisória sem Cora.
2. Vincular PIX posterior ao mesmo custo, sem desconto duplo da margem.
3. Aprovisionar PIX sem previsão para obra e confirmar card Trello.
4. Operar CG original dentro da Central e conferir acertos e saldo, sem módulo paralelo.
5. Fechar obra com regra e rateio homologados.
6. Conferir logo APP DEV, visual V12 e fluxo no celular/notebook.

Status: especificação corretiva registrada, integração funcional ainda pendente. Produção intocada.
