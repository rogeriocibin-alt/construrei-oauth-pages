# ORÇA-REI V1 — Handoff Técnico de Implementação no F02

Data: 2026-10-05
Status: **APROVADO PARA EXECUÇÃO TÉCNICA**
Responsável técnico: **CR Assertivo**

## Objetivo

Implementar o ORÇA-REI V1 como agente especializado do fluxo **F02 • PREPARAR**, sem criar nova arquitetura paralela e sem alterar a governança vigente.

## Princípios de implementação

1. Reutilizar a esteira F01 → F02 → F03 existente.
2. O F01 entrega o contexto; ORÇA-REI processa o F02; Rogério/Bio Gestor mantém o gate de aprovação; F03 recebe apenas proposta conferida.
3. Não criar segundo cadastro de atendimento, segundo número de orçamento ou histórico paralelo.
4. Não mover engenharia de sistema para Bio/Bio Gestor; alterações de runtime/código pertencem ao CR Assertivo.
5. Não embutir percentuais empresariais fixos no código se puderem ser parâmetros configuráveis.
6. Preservar padrão GestãoClick canônico de escrita.
7. Separar rigorosamente saída externa do cliente e análise interna.

## Fonte canônica do agente

`docs/agents/ORCA_REI_V1.md`

## Entradas mínimas do F02

- case_id / número do orçamento;
- cliente / origem / endereço / referência;
- escopo recebido do F01;
- evidências anexadas;
- itens/quantitativos;
- materiais conhecidos;
- terceiros/propostas quando houver;
- observações da vistoria;
- validade/garantia quando definidas;
- parâmetros financeiros ativos.

## Saídas obrigatórias

### Externa / GestãoClick
- ORÇAMENTO Nº
- Cliente
- Endereço
- Referência
- SERVIÇOS
- PRODUTOS
- TOTAL SERVIÇOS
- TOTAL PRODUTOS
- TOTAL GERAL
- OBSERVAÇÕES TÉCNICAS
- VALIDADE
- GARANTIA

### Interna / Diretoria
- preço de venda;
- custos discriminados;
- encargos discriminados;
- lucro e margem projetados;
- custo direto máximo;
- preço mínimo;
- confiança;
- risco;
- decisão: MANTER / AUMENTAR / REDUZIR / COTAR / VISTORIAR / REESTRUTURAR CUSTO.

## Regras financeiras parametrizadas

Referência inicial:
- encargos comerciais/fiscais: 18,5%;
- margem líquida alvo: 30%.

Esses valores devem ser configuráveis. Fórmula geral:

`preco_minimo = custo_direto / (1 - encargos - margem_alvo)`

Não aplicar 18,5% quando os componentes do encargo não se aplicarem ao caso.

## Gate de qualidade

O F02 não deve ser marcado como pronto para F03 sem validar:
- matemática;
- escopo;
- quantitativos;
- materiais;
- terceiro;
- observações/exclusões;
- validade/garantia;
- custo/margem quando houver dados;
- risco/confiança.

Quando os dados forem insuficientes, classificar o orçamento como PRÉVIA ou PRELIMINAR; não fabricar confiança.

## Caso de teste obrigatório

Usar o Orçamento **76626 — Cleverson/Raquel — portas e esquadrias** como primeiro caso escola de homologação.

Critérios do teste:
- reconhecer R$ 680/un em PRODUTOS como preço de venda, não como custo;
- manter medida de 80 cm como aproximada até conferência;
- separar componentes do kit de porta;
- não incluir dano oculto automaticamente;
- produzir análise interna separada;
- testar cenário de custo direto R$ 1.870 e cenário R$ 2.230;
- aplicar corretamente a fórmula geral quando 18,5% + 30% forem usados;
- saída externa no padrão GestãoClick;
- nenhuma informação interna vazada ao cliente.

## Critério de homologação

1. Resultado correto para o caso 76626.
2. Teste com pelo menos um orçamento simples e um complexo.
3. Validação humana de Rogério.
4. Registro de checkpoint.
5. Atualização de `docs/CONSTRUREI_CURRENT_STATE.md`.

## Anti-regressão

- não alterar F01 aprovado;
- não alterar F03 além do contrato de handoff necessário;
- não alterar links oficiais;
- não criar arquitetura nova de agentes paralela;
- não modificar padrão GestãoClick sem aprovação explícita.

## Resultado esperado

ORÇA-REI V1 operacional dentro do F02, com rastreabilidade, análise interna separada e gate de aprovação humana.

## Entrada Inteligente — requisito incorporado ao F02

Adicionar no topo da tela/composição do orçamento um campo **ENTRADA INTELIGENTE** para receber texto bruto colado pelo usuário.

Casos aceitos:
- texto bagunçado;
- orçamento vindo de IA terceira;
- rascunho de vistoria;
- listas de mão de obra e materiais;
- mensagens copiadas;
- composições com quantidades e preços;
- observações técnicas.

### Contrato de processamento

O parser/agente deve transformar a entrada em estrutura normalizada sem criar nova arquitetura:

```text
entrada_bruta
  + contexto_do_caso_F00_F01
  -> normalização
  -> confrontação
  -> composição_orçamentária
  -> validação_matemática
  -> proposta_GestãoClick
  -> análise_interna_separada
```

Campos estruturados mínimos por item:
- tipo: SERVIÇO | PRODUTO;
- descrição;
- quantidade;
- unidade;
- valor_unitário;
- subtotal_calculado;
- natureza_valor: VENDA | CUSTO | REFERÊNCIA | ESTIMADO | A_CONFERIR;
- origem;
- confiança;
- observação/divergência.

### Regra de precedência

A entrada colada é fonte complementar. Não pode sobrescrever silenciosamente dado confirmado já herdado do F00/F01.

Em conflito:
- manter o dado de maior hierarquia;
- registrar a divergência;
- exigir conferência apenas se o conflito puder alterar materialmente escopo, preço, segurança, responsabilidade, prazo ou garantia.

### UX mínima

No cabeçalho do F02:
- área ampla para colar conteúdo;
- ação **PROCESSAR / ESTRUTURAR**;
- prévia editável do resultado;
- indicadores de itens A CONFERIR / DIVERGENTES;
- nenhuma promoção automática para F03 sem gate humano.

### Critérios adicionais de homologação

1. Colar um texto desorganizado e gerar corretamente serviços, materiais, quantidades, valores e observações.
2. Colar uma composição produzida por IA terceira e recalcular todos os subtotais/totais.
3. Testar conflito entre dado confirmado do F00/F01 e texto colado; o confirmado deve prevalecer e a divergência deve aparecer.
4. Testar valor sem natureza definida; o sistema deve marcar A CONFERIR, sem assumir custo ou venda.
5. Confirmar que a saída externa continua no padrão GestãoClick e que nenhuma análise interna vaza ao cliente.

## Aprendizado automático — requisito incorporado

A implementação do ORÇA-REI deve separar **versão de software** de **memória operacional**.

### Comportamento obrigatório

- capturar automaticamente o orçamento final quando o F02 for liberado para F03 após gate humano;
- registrar automaticamente a proposta quando o F03 for aprovada pelo cliente;
- manter eventos de aprendizagem append-only e padrões agregados;
- consultar padrões aprendidos na Entrada Inteligente e devolver referências históricas como apoio;
- nunca substituir silenciosamente o valor atual pelo valor histórico;
- não exigir publicação de nova versão apenas para incorporar novos casos validados;
- manter configuração de aprendizado ativa/pausada em dado persistente;
- impedir acesso direto anônimo às tabelas de aprendizagem;
- preservar rastreabilidade e idempotência.

### Critérios adicionais de homologação

1. liberar um orçamento revisado do F02 para F03 e confirmar geração automática de evento/padrão;
2. aprovar a proposta no F03 e confirmar incremento do histórico aprovado pelo cliente;
3. reprocessar item equivalente e confirmar que o F02 apresenta referência histórica sem alterar automaticamente o preço;
4. repetir o mesmo evento e confirmar idempotência;
5. confirmar que rascunho, Entrada Inteligente bruta e IA terceira não viram verdade aprendida;
6. confirmar que novas amostras entram sem redeploy;
7. confirmar que regras canônicas continuam imutáveis sem gate humano.
