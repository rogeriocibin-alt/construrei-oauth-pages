# CONSTRU-REI — CAMPO INTELIGENTE V1

Status: **PADRÃO TRANSVERSAL APROVADO PARA IMPLEMENTAÇÃO GRADUAL**
Data: 2026-10-05

## Objetivo

Todo módulo operacional da CONSTRU-REI que receba informação humana deve poder oferecer uma **Entrada Inteligente** para colar conteúdo bruto, desorganizado ou produzido por outra IA e transformá-lo em estrutura útil do próprio fluxo.

O Campo Inteligente não cria fluxo paralelo. Ele **enriquece o caso existente**.

## Regra de arquitetura

F00→F09, APP e módulos documentais continuam usando seus contratos e dados canônicos. A Entrada Inteligente é uma camada de interpretação e enriquecimento.

Fluxo conceitual:

```text
contexto_canônico_do_caso
+ entrada_bruta
+ regras_do_agente_da_fase
→ interpretar
→ confrontar
→ estruturar
→ sinalizar divergências
→ aplicar por enriquecimento
→ gate humano quando aplicável
```

## Fontes aceitas

- texto livre;
- mensagens copiadas;
- rascunho de vistoria;
- orçamento de IA terceira;
- laudo/parecer de IA terceira;
- lista de materiais;
- composição de mão de obra;
- anotações técnicas;
- transcrição de áudio;
- conteúdo extraído de foto, vídeo ou documento quando já disponível na plataforma.

## Regras universais

1. Nunca sobrescrever silenciosamente dado confirmado.
2. Dado do caso/F00/F01 de maior hierarquia prevalece sobre entrada auxiliar.
3. Conflitos viram DIVERGENTE / AMBÍGUO / A CONFERIR.
4. Conteúdo de IA terceira é fonte auxiliar, não prova.
5. Toda matemática deve ser recalculada.
6. Hipótese não vira fato.
7. Quantidade aproximada continua aproximada.
8. O resultado deve permanecer editável.
9. A aplicação é por enriquecimento, não substituição destrutiva.
10. Cada módulo usa o agente especializado da fase para interpretar a entrada.

## Especialização por fase

- **F00 — Captura Inteligente:** transformar bagunça inicial em contexto estruturado do atendimento.
- **F01 — Triagem/qualificação:** consolidar contexto, lacunas, envolvidos, evidências e necessidade de visita/complemento.
- **F02 — ORÇA-REI:** serviços, produtos, quantitativos, preços, subtotais, totais, observações e análise interna.
- **F03 — Aprovação/proposta:** organizar condições comerciais, ajustes e retorno do cliente sem alterar o orçamento aprovado sem registro.
- **F04–F09:** interpretar informações próprias de programação, suprimentos, execução, conferência, faturamento e pós-venda.
- **APP:** disponibilizar a mesma lógica de entrada/enriquecimento no módulo operacional correspondente.
- **Laudos/Pareceres/Relatórios:** converter conteúdo bruto em estrutura documental do agente especializado, preservando evidência, hipótese e conclusão separadamente.

## UX mínima

Cada implementação deve oferecer, quando fizer sentido:
- área ampla de colagem;
- ação PROCESSAR / ESTRUTURAR;
- prévia do que foi reconhecido;
- alertas de divergência;
- ação APLICAR / ENRIQUECER;
- resultado final editável;
- origem/rastreabilidade;
- nenhum avanço automático de fase quando houver gate humano.

## Implementação de referência

Primeira implementação: **F02 • ORÇA-REI V1 • Entrada Inteligente R3**.

- UI candidata: `preview/f02-orca-rei-v1-r3-intake-20261005/`
- Edge candidata: `cr-flow-runtime-v2-orca-intake-candidate`
- Versão validada do motor: v3
- O F02 oficial permanece inalterado até homologação humana.

## Regra antirregressão

O Campo Inteligente é uma capacidade compartilhada, mas **não deve forçar um schema único artificial para todos os módulos**. Cada fase mantém seu contrato canônico e seu agente especializado. Compartilha-se o princípio de entrada, rastreabilidade, confrontação e enriquecimento.
