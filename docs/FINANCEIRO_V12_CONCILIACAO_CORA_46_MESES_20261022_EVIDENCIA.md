# CONSTRU-REI — Conciliação Cora 2023–2026 | Evidência congelada
**Data/hora da consulta:** 2026-10-22T16:50:51.146143+00:00 (UTC)
**Snapshot bancário:** 2026-10-22T16:50:13.654725+00:00 (UTC)
**Origem bancária do snapshot:** CORA_OFFICIAL_API
**Escopo:** Movimentos importados do Cora, agrupamento de competência UTC, validação matemática e reconciliação do saldo final. NÃO é conciliação individual de cartões Trello com cada transação bancária.

## Portas de verificação
- **Movimentos únicos:** 7676 de 7676 registros (IDs iguais à contagem, sem duplicação no cache).
- **Competências de extrato:** 46. **Diferenças entre somas mensais do extrato e movimentos UTC:** 0.
- **Âncoras oficiais de saldo individual:** 6 meses; cada par abertura/fechamento confere com o saldo derivado.
- **Saldos mensais derivados por continuidade do extrato:** 40 meses; não convertidos em saldo individual oficialmente comprovado.
- **Abertura oficial janeiro/2023:** R$ 1.525,69.
- **Fechamento calculado último mês:** R$ 29.325,34.
- **Saldo oficial snapshot na mesma consulta:** R$ 29.325,34.
- **Diferença no fechamento:** R$ 0,00.
- **Registros legados divergentes:** 2 (originais não reescritos).
- **Capital de Giro:** a fonte operacional continua Trello, independente do saldo Cora; regras de rateio e obras fechadas preservadas.
- **Ledger de operações V12 segura:** sem prova de operação gravada durante esta auditoria; diretor confirmou testes práticos de Trello em conversa anterior. Não criar despesa de teste em ambiente real.

## Encadeamento auditável
Saldos derivados = âncora bancária oficial de 01/2023 + soma cumulativa mensal de (créditos − débitos). Meses UTC exatamente conforme a competência do resumo original, não mês no fuso de Brasília. Essa reconstrução foi validada nas seis âncoras mensais oficiais e no saldo bancário de encerramento do snapshot. O período corrente é um retrato na data/hora indicada, não um fechamento definitivo do mês.

| Competência UTC | Abertura | Crédito | Débito | Fechamento | Evidência |
|---|---:|---:|---:|---:|---|
| 2023-01 | R$ 1.525,69 | R$ 17.833,85 | R$ 19.124,30 | R$ 235,24 | OFICIAL |
| 2023-02 | R$ 235,24 | R$ 28.977,69 | R$ 25.653,36 | R$ 3.559,57 | OFICIAL |
| 2023-03 | R$ 3.559,57 | R$ 47.639,43 | R$ 49.215,66 | R$ 1.983,34 | DERIVADO |
| 2023-04 | R$ 1.983,34 | R$ 14.906,09 | R$ 14.423,68 | R$ 2.465,75 | OFICIAL |
| 2023-05 | R$ 2.465,75 | R$ 9.721,80 | R$ 11.342,48 | R$ 845,07 | OFICIAL |
| 2023-06 | R$ 845,07 | R$ 37.276,74 | R$ 32.316,00 | R$ 5.805,81 | OFICIAL |
| 2023-07 | R$ 5.805,81 | R$ 28.111,54 | R$ 32.038,92 | R$ 1.878,43 | DERIVADO |
| 2023-08 | R$ 1.878,43 | R$ 16.792,37 | R$ 10.094,21 | R$ 8.576,59 | DERIVADO ⚠️ |
| 2023-09 | R$ 8.576,59 | R$ 53.878,95 | R$ 52.700,33 | R$ 9.755,21 | DERIVADO |
| 2023-10 | R$ 9.755,21 | R$ 57.921,11 | R$ 62.526,24 | R$ 5.150,08 | DERIVADO |
| 2023-11 | R$ 5.150,08 | R$ 25.879,74 | R$ 27.201,21 | R$ 3.828,61 | DERIVADO |
| 2023-12 | R$ 3.828,61 | R$ 13.921,60 | R$ 17.750,21 | R$ 0,00 | DERIVADO ⚠️ |
| 2024-01 | R$ 0,00 | R$ 19.066,23 | R$ 15.327,12 | R$ 3.739,11 | OFICIAL |
| 2024-02 | R$ 3.739,11 | R$ 39.888,66 | R$ 39.974,42 | R$ 3.653,35 | DERIVADO |
| 2024-03 | R$ 3.653,35 | R$ 61.485,87 | R$ 63.631,85 | R$ 1.507,37 | DERIVADO |
| 2024-04 | R$ 1.507,37 | R$ 60.111,04 | R$ 59.306,61 | R$ 2.311,80 | DERIVADO |
| 2024-05 | R$ 2.311,80 | R$ 39.165,36 | R$ 34.767,74 | R$ 6.709,42 | DERIVADO |
| 2024-06 | R$ 6.709,42 | R$ 33.550,23 | R$ 35.246,32 | R$ 5.013,33 | DERIVADO |
| 2024-07 | R$ 5.013,33 | R$ 39.935,12 | R$ 38.207,20 | R$ 6.741,25 | DERIVADO |
| 2024-08 | R$ 6.741,25 | R$ 29.319,16 | R$ 30.380,18 | R$ 5.680,23 | DERIVADO |
| 2024-09 | R$ 5.680,23 | R$ 43.330,31 | R$ 41.381,27 | R$ 7.629,27 | DERIVADO |
| 2024-10 | R$ 7.629,27 | R$ 89.079,43 | R$ 68.291,77 | R$ 28.416,93 | DERIVADO |
| 2024-11 | R$ 28.416,93 | R$ 78.767,32 | R$ 92.375,38 | R$ 14.808,87 | DERIVADO |
| 2024-12 | R$ 14.808,87 | R$ 81.474,19 | R$ 84.694,09 | R$ 11.588,97 | DERIVADO |
| 2025-01 | R$ 11.588,97 | R$ 47.165,00 | R$ 53.182,47 | R$ 5.571,50 | DERIVADO |
| 2025-02 | R$ 5.571,50 | R$ 101.089,24 | R$ 96.392,65 | R$ 10.268,09 | DERIVADO |
| 2025-03 | R$ 10.268,09 | R$ 72.319,12 | R$ 74.720,47 | R$ 7.866,74 | DERIVADO |
| 2025-04 | R$ 7.866,74 | R$ 57.020,16 | R$ 55.410,66 | R$ 9.476,24 | DERIVADO |
| 2025-05 | R$ 9.476,24 | R$ 62.389,25 | R$ 54.863,22 | R$ 17.002,27 | DERIVADO |
| 2025-06 | R$ 17.002,27 | R$ 46.367,50 | R$ 53.864,53 | R$ 9.505,24 | DERIVADO |
| 2025-07 | R$ 9.505,24 | R$ 43.236,84 | R$ 39.998,16 | R$ 12.743,92 | DERIVADO |
| 2025-08 | R$ 12.743,92 | R$ 86.735,16 | R$ 74.035,19 | R$ 25.443,89 | DERIVADO |
| 2025-09 | R$ 25.443,89 | R$ 65.865,07 | R$ 75.659,82 | R$ 15.649,14 | DERIVADO |
| 2025-10 | R$ 15.649,14 | R$ 50.967,31 | R$ 57.949,95 | R$ 8.666,50 | DERIVADO |
| 2025-11 | R$ 8.666,50 | R$ 72.014,81 | R$ 62.335,56 | R$ 18.345,75 | DERIVADO |
| 2025-12 | R$ 18.345,75 | R$ 56.572,63 | R$ 66.577,74 | R$ 8.340,64 | DERIVADO |
| 2026-01 | R$ 8.340,64 | R$ 31.722,51 | R$ 33.442,04 | R$ 6.621,11 | DERIVADO |
| 2026-02 | R$ 6.621,11 | R$ 19.098,13 | R$ 20.299,75 | R$ 5.419,49 | DERIVADO |
| 2026-03 | R$ 5.419,49 | R$ 59.168,33 | R$ 56.561,85 | R$ 8.025,97 | DERIVADO |
| 2026-04 | R$ 8.025,97 | R$ 47.068,98 | R$ 36.098,68 | R$ 18.996,27 | DERIVADO |
| 2026-05 | R$ 18.996,27 | R$ 69.319,26 | R$ 82.211,98 | R$ 6.103,55 | DERIVADO |
| 2026-06 | R$ 6.103,55 | R$ 43.889,57 | R$ 45.999,56 | R$ 3.993,56 | DERIVADO |
| 2026-07 | R$ 3.993,56 | R$ 77.278,23 | R$ 64.228,52 | R$ 17.043,27 | DERIVADO |
| 2026-08 | R$ 17.043,27 | R$ 37.513,35 | R$ 39.591,39 | R$ 14.965,23 | DERIVADO |
| 2026-09 | R$ 14.965,23 | R$ 85.782,40 | R$ 66.131,98 | R$ 34.615,65 | DERIVADO |
| 2026-10 | R$ 34.615,65 | R$ 45.840,83 | R$ 51.131,14 | R$ 29.325,34 | DERIVADO |

## Registros legados com divergência, originais preservados
- 2023-08: divergência da abertura R$ 0,00, fechamento R$ 300,00. Usar os valores derivados para conferência aritmética, **não** editar ou declarar o saldo legado como oficial.
- 2023-12: divergência da abertura -R$ 200,00, fechamento R$ 0,00. Usar os valores derivados para conferência aritmética, **não** editar ou declarar o saldo legado como oficial.

## Limite da homologação
Esta evidência sustenta **conciliação aritmética bancária 46/46** de movimentos, seis saldos mensais OFICIAIS, quarenta saldos DERIVADOS, e soma de ponta a ponta igual ao snapshot oficial. Ela **não** prova conciliação integral por orçamento/card Trello, não certifica todas as distribuições ou custos de obras nem transforma saldos de abertura/fechamento derivados em declarações oficiais do banco. Guardar os dois tipos explicitamente no dashboard.

**Diretriz de congelamento:** preservar esta evidência e os hashes de publicação; sem reescrever os movimentos originais, os saldos do banco ou os históricos das obras.
