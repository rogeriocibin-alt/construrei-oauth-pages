# Candidata — Aprovisionamento Cora na Central (23/10/2026)

## Diretriz aprovada
Não criar nova tela ou sistema. Evoluir o módulo Cora Manual / Trello da Central Operacional; Cora Pro V2 permanece painel analítico. **Preservar integralmente a identidade visual atual** da Central e Dashboard V12: azul-escuro/cinza e cores semânticas já homologadas; proibido recuperar paletas antigas.

## Fluxo funcional
1. Ler movimentos oficiais Cora com identificador bancário imutável e sincronização incremental.
2. Exibir na operação existente fila de movimentos não classificados, com estado vermelho PENDENTE e ação Aprovisionar; permitir filtrar, pesquisar e consultar histórico.
3. Ao acionar, preencher data, valor, descrição e referência bancária sem redigitação; escolher obra, capital de giro, despesas gerais, impostos, transferência interna, estorno ou rateio entre obras.
4. Confirmar gravação com chave idempotente por movimento + destino, persistindo vínculo e trilha de auditoria; Trello somente quando aplicável e sem duplicar lançamento.
5. Mostrar CONCLUÍDO somente após confirmação de persistência e espelhamento exigido; em falha parcial, manter PENDENTE/ERRO REPROCESSÁVEL e nunca duplicar.
6. Manter Consultar Registros e Fechar Obra dentro do fluxo atual. Nunca reabrir obra fechada.
7. Impostos: registrar competência, categoria, referência DARF e associação opcional a notas/obras; não ratear automaticamente por notas do mês anterior sem conciliação documental.
8. Capital de giro: distinguir valor gerado pelo rateio de lucro, despesas atribuídas e saldo real; não alterar retroativamente o rateio 20/28/28/14/10.

## Gates de homologação
- Sem nova tela, sem alteração de paleta, sem regressão do Cora Pro V2 ou do módulo atual.
- Testes de idempotência, rateio com soma exata, reconciliação Cora×Trello, erros de rede, movimentos sem obra, estornos, transferências e impostos.
- Validação em celular e notebook; produção V12 intacta até aprovação; rollback e checkpoint obrigatórios.
- Esta documentação **não representa implementação funcional nem homologação**.
