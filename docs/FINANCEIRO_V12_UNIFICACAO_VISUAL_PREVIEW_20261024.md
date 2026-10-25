# CONSTRU-REI — consolidação visual Financeiro V12 | 24/10/2026

## Regra operacional canônica
- **Central de Operações:** extrato Cora, conciliação, lançamento manual, aprovisionamento, Fechar Obra e **a única instância do componente real Capital de Giro**.
- **Resultados e Acertos:** apuração, filtros, rateios, histórico, PDFs, períodos e prévia/envio financeiro. O painel financeiro não deve ser filho do nó de Capital de Giro.
- **Visão Executiva:** consultas e atalhos, sem função financeira paralela.

## Mudança realizada
No arquivo único de prévia `preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html`, o nó `#v12-capital-workspace` é colocado uma só vez dentro de `#cr-central-capital-slot`, sem retorno a Resultados quando se muda de aba. `window.v12CapitalGo()` navega à Central e ativa modo capital. O painel `#cr-period-send` é colocado uma vez em `#fin` antes de `#v12-live-acertos`; inputs `crp-start/crp-end` e `cg-close-start/cg-close-end` sincronizados bilateralmente; `crpData()` lê as datas visíveis em Resultados. Nenhum novo motor ou conta criado.

## Evidências verificadas
- `node --test audits/financeiro-v12-envio-acertos-periodo.test.cjs` (na PR #174): **12 testes, 12 PASS**.
- `node --test audits/dashboard-v12-unified-preview.test.cjs` nesta PR: **8 testes, 8 PASS**.
- Chrome headless, notebook `Rogerio-2022`: viewport mobile 420x860 **8 verificações DOM PASS**; viewport desktop 1440x900 **8 verificações DOM PASS**. Sem chamadas externas reais (rede bloqueada/substituída no teste), sem operações bancárias ou lançamentos Trello.
- Verificação do Pages e do Central Canonical Guard deve ocorrer após merge deste PR.

## Preservação, exceções e rollback
Prod homologada `production/dashboard-financeiro-v12-operacoes-homologada-20261023/` não é alterada por esta publicação. PR #174 permanece DRAFT: fechamento único financeiro, livro idempotente de capital, meses/ano, retomada de falhas parciais, vínculo Cora/Trello e E2E autenticado **NÃO homologados**. Não mesclar PR #174 ou presumir retiradas bancárias.
Rollback: reverter PR #176 afeta apenas preview e teste/documentação, sem esquema SQL ou operações de valores.
