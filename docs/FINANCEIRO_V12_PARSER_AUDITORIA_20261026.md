# CONSTRU-REI | Auditoria de parser V12 — 26/10/2026
**Estado:** candidato isolado PR #174, não homologado nem implantado no resumo de produção.

## Escopo e fontes
- Código original: Edge Function `cr-trello-gestao-vista-v2`, versão 62, exportada somente para a máquina autorizada `Rogerio-2022`. Nenhum segredo foi incluído neste repositório.
- Código candidato: `candidates/financeiro-v12-period-close-20261024/trello-gestao-vista-v2-CANDIDATE.ts`.
- Dados individuais: 278 registros de `public.cr_finance_2026_work_card_source_v1` (staging privado, 262 códigos distintos e duplicidades). Exportação apenas local. Os textos históricos do staging podem estar desatualizados em relação aos cartões vivos, sendo proibido tratar a amostra como prova bancária.
- Conferência complementar: leitura ao vivo dos 22 cartões da lista `10. OUTUBRO 26` e dos textos das obras 727-26 e 649-26; cartões 627-26 e 655-26 verificados pelo staging de origem.

## Resultado reproducível no notebook
`node audits/financeiro-v12-compare-staging-readonly.cjs audits/_v12_live_original_BACKUP_LOCAL.ts audits/_v12_2026_staging278_LOCAL.json`

Resultado: **PASS**, 278 cartões comparados, 274 inalterados e **4 diferenças esperadas**:
| Obra | Campo | Diferença (candidato - antigo) | Razão |
|---|---|---:|---|
| 627-26 | Capital de Giro extraído | +R$ 32,58 | rótulo e 10% em linhas separadas |
| 655-26 | Capital de Giro extraído | +R$ 71,57 | rótulo em linha anterior |
| 649-26 | Capital de Giro extraído | +R$ 40,71 | rótulo e 10% em linhas separadas |
| 727-26 | Rateio Éder extraído | -R$ 150,00 | recapitulação de apoio sob seção APOIO / DIÁRIAS |

**Todos os 278 registros preservaram os valores extraídos de bruto, custos e lucro na comparação.** NENHUMA diferença inesperada de campos examinados; isto não prova integridade bancária ou conformidade de todos os históricos.

### Outubro — conferência dos 22 cartões operacionais vivos
- Bruto textual R$ 55.659,01; custos R$ 38.735,54; lucro R$ 16.923,47. Em cada cartão bruto - custo = lucro.
- Parser LIVE antigo: rateio equipe R$ 15.381,14 e CG extraído R$ 1.651,64 → excede lucro em R$ 109,31.
- Parser CANDIDATO: rateio equipe R$ 15.231,14 e CG extraído R$ 1.692,35 → excede lucro em R$ 0,02, exclusivamente obras **711-26 R$ 0,01** e **649-26 R$ 0,01** (centavos e arredondamento).
- A alteração corrigiria **interpretação de resumo**, não movimentação financeira. Capital de Giro gerado/acumulado real continua exigindo conciliação com ledger canônico; jamais somar novamente os R$ 40,71/R$ 104,15 se já estiverem registrados.

### Staging e saneamento de classificação
- `public.cr_finance_2026_acerto_lines_v1`: 132 linhas explícitas Apoio/Diária em 53 obras reclassificadas de RATEIO_OR_ACERTO para COST_NOTE no checkpoint anterior, **sem alterar montante ou gravar custos**.
- Obra 727-26 linha 36: `Éder: R$ 150,00` sob bloco APOIO / DIÁRIAS, marcada como `SUPPORT_RECAP_UNVERIFIED_NO_NEW_COST`, sem efeito financeiro.
- Consulta pós-gravação: 0 linhas Apoio/Diária ainda na classe RATEIO_OR_ACERTO pelo predicado explícito; classificador contextual e pós-importação agora versionados no candidato, **ainda não conectados à rotina original de ingestão**.
- `cr_finance_2026_work_extract_v1`: 202 BALANCED / 75 INCOMPLETE / 1 DIVERGENT (666-26: R$ 70,00). Os 75 incompletos distribuem-se assim:
  - 33 sem custos e lucro declarados, com bruto;
  - 14 somente lucro declarado ausente;
  - 13 somente bruto ausente;
  - 5 somente custos ausentes;
  - 4 sem os três campos;
  - 4 sem bruto e custos;
  - 2 sem bruto e lucro.
- **Não** promover os 14 sem lucro declarado a fechamentos pagos por mera subtração.

## Testes e limitações
- `node --test audits/financeiro-v12-*.test.cjs`: **126 PASS / 0 FAIL** no notebook, incluindo 627/655/649/727, casos de apoio e recapitulação, arredondamento, proteção de mês, acertos, registro de período, recuperação e anotações Cora. Testes locais de contrato, não E2E autenticado.
- Supabase e Trello: nenhuma gravação de acerto, Capital de Giro, saldo Cora, retirada, card mensal ou valor histórico por esta etapa. A V12 oficial não foi alterada.
- O controle de envio `cr_finance_2026_period_send_registry_v12` mantém 0 fechamentos comprovados.
- **Antes de produção:** homologar o parser com regressão de demais anos/quadros, validar o acionamento do gerador de resumos com rollback e leitura após escrita, testes E2E com sessão de diretor e regras de não duplicação; não confundir teste do parser com validação de saldos bancários, resumos mensais ou integrações CG/anual.

## Próximas prioridades
1. Prova isolada E2E de resumos com controle de autorização, sem regravar histórico fechado ou gerar rateio em dobro.
2. Integrar classificador à fonte de ingestão para futuras importações sem regressão.
3. Conciliar 75 linhas incompletas, 16 códigos duplicados, divergência de 666-26 e 10 centavos de fevereiro.
4. Fechar P0 da PR #174: transação auditável mês/CG/ledger/anual, recuperação parcial, Central/Gestor, validação notebook/Android e decisão de homologação.
