# CHECKPOINT_F00_LOGIC_RECOVERY_CANDIDATE_20261001

Status: CANDIDATE ISOLADO — APTO PARA VALIDAÇÃO HUMANA, NÃO PROMOVIDO
Data: 2026-10-01

## Referência visual preservada
- Branch base: `cr-f00-f09-canonical-ui-20261001`
- F00 HTML canônico blob: `a5c4c983c3d837804c21a11e88e7a4e6efffb141`
- UI homologada preservada; candidate altera somente endpoint da API e absolutiza referências de assets para servir fora do GitHub Pages.
- Central e F01–F09: NÃO ALTERADOS.

## Backend oficial preservado
- Function: `cr-f00-intake`
- Version auditada: 18
- Build: `CR-F00-LIFECYCLE-RETURN-FIX-V9-20260928`
- Hash: `8c115007001fc9468d86d5b8203a1d00ba85d18005181ce2333e8e00bcb8ab5e`
- Engine: `F00_INTELLIGENCE_V7`

## Backend candidate
- Function: `cr-f00-intake-logic-recovery-candidate-20261001`
- Version: 4
- Hash: `241531023b4c758935699685276aa393f508738cabdf8e42c51ee92d458dce74`
- Build: `CR-F00-LOGIC-RECOVERY-CANDIDATE-V10-20261001`
- Engine: `F00_INTELLIGENCE_V8_CANDIDATE`

## UI candidate
- Function: `cr-f00-logic-recovery-ui-candidate-20261001`
- Version: 1
- Hash: `ba1675bf983c3a10b905de83ad6854d9a303832ab18162476fcee92cc0543970`
- URL: https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-f00-logic-recovery-ui-candidate-20261001

## Causas-raiz confirmadas
1. Extrator de endereço não reconhecia Praça/Pça/Largo e dependia demais de prefixos específicos.
2. Vários contatos na mesma linha eram perdidos.
3. Preposições de “apartamento de cima/para o outro” podiam virar unidades falsas DE/PARA.
4. Múltiplos telefones eram tratados como conflito mesmo em chamados multiunidade.
5. Respostas coladas no bloco de pendências não eram reconciliadas semanticamente.
6. Prefixos de pendência podiam ser gravados como valor do campo.
7. Reprocessamento podia duplicar complementos.
8. Justificativas de ausência de fotos não encerravam corretamente a pendência.
9. Regex de AP antes de apartamento fazia “Apartamento 1101” ser interpretado incorretamente.
10. Nomes com partículas, como João da Silva, podiam ser quebrados.
11. Horários com “:” podiam ser confundidos com pares rótulo/valor.

## Correções
- parsing de endereço ampliado;
- contatos múltiplos por linha e por bloco;
- telefone sem nome preservado como contato a identificar;
- unidade física deduplicada;
- contexto superior/inferior separado de número de unidade;
- múltiplos telefones permitidos sem conflito genérico;
- parser de respostas a pendências com prioridade de confirmação humana;
- valores confirmados sem prefixos;
- evidência/justificativa de ausência reconhecida;
- merge idempotente do histórico;
- correção de AP/apartamento;
- nomes compostos com partículas;
- ITEM_UNICO prioriza item identificado em vez de resumo genérico upstream.

## Testes
### Caso real obrigatório
- 15/15 PASS
- endereço Praça Senador Correia: PASS
- Ludmila/Yana/Elton/Sr Ormindo: PASS
- AP 506: PASS
- sem unidades DE/PARA: PASS
- sem pessoa falsa: PASS
- múltiplos telefones sem conflito genérico: PASS
- ausência de fotos: PASS
- respostas manuais limpas: PASS
- reprocessamento idempotente: PASS

### Matriz ampliada
- 18/18 PASS
- chamado completo;
- chamado incompleto;
- Avenida;
- Praça;
- Residencial + Apto;
- multiproblema;
- contatos em linhas separadas;
- contatos na mesma linha;
- contato sem telefone;
- telefone sem nome;
- duas unidades numeradas;
- superior/inferior sem unidade falsa;
- justificativa de evidência;
- complemento duplicado;
- override manual;
- múltiplos telefones sem conflito;
- evidência a coletar na visita;
- acesso/disponibilidade/pagamento.

## Gates
- UI_REGRESSION: 0 conhecido
- API_BREAKING_CHANGE: 0 conhecido
- DATA_LOSS: 0
- DUPLICATION: 0 nos fixtures
- FALSE_PERSON: 0 nos fixtures obrigatórios
- FALSE_UNIT: 0 nos fixtures obrigatórios
- REASK_CONFIRMED_DATA: 0 no caso obrigatório
- CANONICAL_FIXTURES_PASS: 100%

## Produção
NÃO PROMOVIDA.
`cr-f00-intake` oficial continua respondendo com V9 / F00_INTELLIGENCE_V7.
F01 semantic compartilhado `triagem-atendimento-browser` NÃO foi alterado.

## Próximo gate
Validação humana de Rogério no URL candidate.
Somente após aprovação explícita considerar promoção controlada.
