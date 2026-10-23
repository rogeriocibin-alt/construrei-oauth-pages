# Contrato visual imutável — CONSTRU-REI V12 (23/10/2026)

Fonte de verdade visual: captura fornecida pelo diretor em 23/10/2026 do Dashboard Gerencial **V12 HOMOLOGADA**, na aba **CENTRAL DE OPERAÇÕES**. A candidata PR #148 deve reutilizar os componentes e estilos da V12; é proibido introduzir tema escuro antigo ou redesenho independente.

## Identidade canônica
- Fundo geral azul-claro quase branco; cartões brancos, bordas azul-cinza suaves e cantos arredondados.
- Cabeçalho branco com logo, título azul-marinho, status online verde-claro e linha dourada inferior.
- Hero em gradiente azul-marinho para azul institucional; título branco e etiqueta dourada.
- Navegação em botões brancos com texto azul; selecionado em azul com filete dourado.
- Azul para ação principal; vermelho **somente** pendência/erro; verde **somente** confirmação persistida; dourado para acento institucional.
- Sem tela extra: implementar dentro de Central de Operações / Cora Manual → Trello. Cora Pro V2 permanece analítico.

## Fluxo de poucos toques
- Lista de transações Cora no próprio módulo, com filtros pendentes/concluídos, busca e estado visível.
- Um toque em **Aprovisionar** abre editor inline já preenchido com ID bancário, valor, data e descrição.
- Destinos: obra, capital de giro, despesas gerais, impostos com competência, rateio, transferências e estornos.
- Rateio deve fechar centavo a centavo. Impostos não podem ser atribuídos automaticamente a notas/obras sem prova documental.
- Histórico exibe data, descrição, valor, referência Cora, obra/destino e confirmação Trello quando aplicável.
- **APROVISIONADO** somente após persistência idempotente e confirmação de Trello se exigida; falha parcial continua pendente e reprocessável.
- **Fechar obra** permanece no mesmo fluxo, reaproveitando implementação homologada, sem reabrir obra fechada.

## Antirregressão obrigatória
1. Comparação visual com captura V12 em 390px (celular) e desktop, antes de merge.
2. Proibir substituição de variáveis/cores canônicas da V12 por tokens de outras candidatas.
3. Garantir que mudanças sejam apenas aditivas na candidata, sem afetar produção.
4. Testar duplicidade por ID Cora, conciliação Trello, recuperação de falha e fechamento de obra.
5. Prototipagem com dados fictícios nunca deve ser rotulada como conexão real.

Status: **diretriz visual e UX registrada; integração Cora/Trello e homologação ainda pendentes**.
