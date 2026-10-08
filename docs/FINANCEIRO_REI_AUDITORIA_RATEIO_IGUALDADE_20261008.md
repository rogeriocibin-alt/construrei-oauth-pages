# Financeiro REI — Auditoria de igualdade Éder / Rogério — 08/10/2026

## Regra canônica
- Éder e Rogério: cada um recebe 28% do mesmo lucro líquido, com centavos rigorosamente iguais por obra e por totalização.
- Apoio de Éder (R$ 150 quando aplicável): custo operacional da obra antes do lucro, nunca acréscimo de rateio nem rateio em duplicidade.
- Centavos residuais de arredondamento: componente de Capital de Giro, sem beneficiar um dos dois titulares de 28%.
- Não reabrir nem reescrever obras já fechadas; qualquer necessidade de acerto financeiro é tratada como ocorrência separada, com rastreabilidade e aprovação do responsável.

## Fonte e cobertura
- Trello Gestão Financeira > Valores Recebidos 2026, nove cartões mensais janeiro-setembro, consultados em 08/10/2026.
- Conferência automatizada de linhas comparáveis de Éder e Rogério nos textos, **não** validação de todos os custos e pagamentos externos nem cobertura de cartões arquivados.
- Dashboard V4 homologado: `production/dashboard-financeiro-v4-homologado-20261007/index.html`.
- Edge `cr-dashboard-gerencial-v4-candidate` (versão 26) contém `canonicalAcertoRateio(profit)`: calcula ambos em `Math.round(profit * .28)` e destina o resíduo ao Capital de Giro. Logo, o cálculo corrente do Acerto Vivo já é simétrico **no código**; falta teste integrado com dados vivos.

## Divergências históricas demonstradas

| Cartão / referência | Éder | Rogério | Diferença (Rogério − Éder) |
|---|---:|---:|---:|
| Julho, obra 408-26 | R$ 331,21 | R$ 331,22 | +R$ 0,01 |
| Julho, obra 434-26 | R$ 242,87 | R$ 242,88 | +R$ 0,01 |
| Julho, obra com lucro R$ 1.011,63 e apoio Éder R$ 150 | R$ 283,26 | R$ 283,25 | −R$ 0,01 |
| Julho, orçamento 522-26, rateio *previsto* | R$ 115,18 | R$ 115,19 | +R$ 0,01 |
| Julho, total de rateios descrito no cartão | R$ 3.162,49 | R$ 3.162,51 | +R$ 0,02 |
| Setembro, obra 605-26 | R$ 30,27 | R$ 30,26 | −R$ 0,01 |
| Setembro, resumo **aguardando acerto** | R$ 1.559,57 | R$ 1.559,56 | −R$ 0,01 |

- Julho: https://trello.com/c/3QI00cKr/86-julho-2026
- Setembro: https://trello.com/c/2kgwU3T1/98-setembro-2026
- Os resumos podem consolidar as obras da mesma amostra; não somar sete ocorrências como se fossem ajustes monetários independentes.
- De janeiro a junho e agosto não foram identificadas divergências nas linhas equivalentes dos nove cartões examinados; isso não comprova inexistência fora dessa amostra.

## Interpretação e recortes
1. **Histórico documentado:** diferença real dentro do texto dos cartões Trello, com ajustes residuais imputados a uma pessoa. Preservar prova e números antigos.
2. **Acerto Vivo:** motor de rateio atual simétrico por implementação. Somatórios nascem da soma das mesmas parcelas, portanto devem ser iguais quando os itens válidos refletem o código atual.
3. **Dashboard Histórico:** pode exibir valores lidos literalmente de cartões históricos; divergência visual nesse recorte não é automaticamente erro novo de cálculo. Identificar origem na interface antes de sugerir alteração.
4. **Conciliação Trello × Central:** ainda depende de conferência dinâmica com payload atual e casos específicos antes de marcar ausência de erro em produção.

## Correção preventiva em candidata, sem publicação
- Branch: `financeiro-rei-rateio-igualdade-audit-20261008`.
- Commit de trava: `930e0f749f018bd150875e2fb6ca92580a8f03bb`.
- Mudança restrita a `acertoAuditPass` no dashboard: somente declarar "ACERTO CONFERIDO" se Éder = Rogério **em todas as linhas e no consolidado**, além dos controles já existentes.
- **Não promovida** à produção. Preserva arquivos e lógica financeira homologados.
- Próximo gate: teste controlado na candidata com payload real, check de igualdade, diferença = zero, apoio contabilizado nos custos e nenhum efeito sobre textos históricos. Só promover após validação humana.

## Governança
Responsável funcional: Financeiro REI; BIO atua como orquestrador/auditor técnico, sem substituir decisão financeira humana. Pendência de Central/Financeiro vai ao Gestor do Projeto, não às listas APP/WIZY/Éder.
