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