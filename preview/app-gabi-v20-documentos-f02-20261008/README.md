# Gabrielly V20 — QA isolado

Base: V19, preservada.

Implementado: duas saídas em F02 para prévia de orçamento e parecer técnico, via impressão/salvar como PDF do navegador; mantém encaminhar ao F03. Caça-vazamentos de origem não identificada: escopo e observações técnicos baseados no orçamento 675-26, preço padrão R$800 apenas para orçamento.

Restrições: simulação fictícia, não integra GestãoClick nem dispara aprovação; documento 710-26 original ainda precisa ser confrontado para homologação visual. Confirmação da correção de pendências em F00/F01 não faz parte deste commit.

Testes exigidos antes de publicação: botão F02, campos gerados, salvar, editar, PDFs separados, saída F03, retorno sem perda de dados, filtros do caso fictício, navegação mobile, abertura de popup.