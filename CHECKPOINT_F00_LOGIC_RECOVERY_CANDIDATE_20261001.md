# CHECKPOINT_F00_LOGIC_RECOVERY_CANDIDATE_20261001

Status: CANDIDATE ISOLADO — APTO PARA VALIDAÇÃO HUMANA, NÃO PROMOVIDO
Data: 2026-10-01

## Referência visual preservada
- Base: `cr-f00-f09-canonical-ui-20261001`
- UI homologada preservada.
- DOM IDs: idênticos ao F00 canônico.
- HTML normalizado: idêntico ao canônico, exceto endpoint candidate e URLs absolutas dos assets para servir fora do GitHub Pages.
- Central e F01–F09: NÃO ALTERADOS.

## Backend oficial preservado
- Function: `cr-f00-intake`
- Version: 18
- Build: `CR-F00-LIFECYCLE-RETURN-FIX-V9-20260928`
- Hash: `8c115007001fc9468d86d5b8203a1d00ba85d18005181ce2333e8e00bcb8ab5e`
- Engine: `F00_INTELLIGENCE_V7`

## Backend candidate
- Function: `cr-f00-intake-logic-recovery-candidate-20261001`
- Version: 6
- Hash: `269ca225abd5a304c49f36bb014e5aa6ca7e87f45a3c3233c5af4294c157c649`
- Build: `CR-F00-LOGIC-RECOVERY-CANDIDATE-V10-20261001`
- Engine: `F00_INTELLIGENCE_V8_CANDIDATE`

## UI candidate
- Function: `cr-f00-logic-recovery-ui-candidate-20261001`
- Version: 1
- Hash: `ba1675bf983c3a10b905de83ad6854d9a303832ab18162476fcee92cc0543970`
- URL: https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-f00-logic-recovery-ui-candidate-20261001

## Isolamento de dados
Tabelas candidate exclusivas:
- `cr_f00_cases_candidate_20261001`
- `cr_f00_events_candidate_20261001`
- `cr_f00_files_candidate_20261001`

Anexos candidate usam prefixo:
- `f00-candidate-20261001/`

O endpoint candidate NÃO grava nas tabelas oficiais do F00.

## F00 → F01
No candidate, o handoff é SIMULADO.
- valida o mesmo gate;
- altera somente o registro candidate;
- retorna `simulated=true`;
- NÃO chama o F01 real;
- NÃO grava dados no F01.

## Causas-raiz corrigidas
1. Praça/Pça/Largo e outros logradouros não reconhecidos.
2. Múltiplos contatos na mesma linha perdidos.
3. Unidades falsas DE/PARA.
4. Múltiplos telefones tratados como conflito genérico.
5. Respostas a pendências não reconciliadas.
6. Prefixos de pendência gravados como valor.
7. Complementos duplicados.
8. Justificativa de ausência de fotos ignorada.
9. Regex AP/apartamento interpretando “artamento” como unidade.
10. Nomes com partículas quebrados.
11. Horários com “:” confundidos com rótulo/valor.
12. “Apartamento de cima” interpretado como complemento de endereço.

## Testes
### Caso real obrigatório
15/15 PASS.

Resultado esperado confirmado:
- Praça Senador Correia, 62, AP 506;
- Ludmila, Yana, Elton e Sr Ormindo;
- AP 506 preservado;
- contexto superior/inferior;
- nenhuma unidade DE/PARA;
- nenhuma pessoa falsa;
- nenhum conflito genérico de telefone;
- ausência de fotos reconhecida;
- respostas manuais limpas;
- merge idempotente.

### Matriz ampliada
18/18 PASS.

Cobertura:
- chamado completo/incompleto;
- Rua/Avenida/Praça/Residencial;
- multiproblemas;
- múltiplos contatos em linhas separadas e mesma linha;
- contato sem telefone;
- telefone sem nome;
- duas unidades numeradas;
- superior/inferior sem unidade falsa;
- justificativa de evidência;
- complemento duplicado;
- correção manual;
- múltiplos telefones;
- evidência a coletar na visita;
- acesso/disponibilidade/pagamento.

### Ciclo completo candidate
PASS:
- create: HTTP 201
- update: HTTP 200
- get: HTTP 200
- ready=true
- missing=[]
- release simulado: HTTP 200
- simulated=true
- cleanup: 0 registros sintéticos restantes

## Gates finais
- UI_REGRESSION = 0 conhecido
- API_BREAKING_CHANGE = 0 conhecido
- DATA_LOSS = 0
- DUPLICATION = 0 nos testes
- FALSE_PERSON = 0
- FALSE_UNIT = 0
- REASK_CONFIRMED_DATA = 0
- CANONICAL_FIXTURES_PASS = 100%
- PRODUCTION_MUTATION_DURING_VALIDATION = 0

## Dependência compartilhada
`triagem-atendimento-browser` permanece inalterado:
- version 63
- hash `2ff8a22ab5be8b0e88bad8881424a2e25fb92a645601437d5f8f9c4a2ccfacaa`

## Produção
NÃO PROMOVIDA.
O F00 oficial continua em V9 / F00_INTELLIGENCE_V7.

## Próximo gate
Validação humana de Rogério no URL candidate.
Somente após aprovação explícita considerar promoção controlada.
