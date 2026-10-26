# CONSTRU-REI — Dashboard Financeiro V12 | fechamento das correções — 22/10/2026

**Estado:** candidata operacional para validação, não homologação bancária/histórica integral. PR #142 segue DRAFT. V11 preservada.

## Aceite funcional registrado pelo diretor
O diretor confirmou no diálogo de 22/10/2026 que a apresentação/organização visual funciona, os testes de operações Trello realizados por ele funcionaram e o saldo Cora foi testado com sucesso. Este é o aceite funcional informado pelo usuário, não deve ser descrito como teste E2E automatizado do endpoint `cr-finance-v12-safe-trello-candidate-20261021`.

## Correções finais implementadas
1. Atualização da interface não sobrescreve mais o rodapé com identificação incorreta `V4 / READ ONLY / PRODUÇÃO`. A página permanece identificada como candidata V12, com V11 preservada.
2. Bases com `null`, `undefined` ou vazio não são convertidas artificialmente em zero em `v12Bases`. A diferença entre fontes e bases segue sinalizada sem fabricação de lucro líquido.
3. Gráficos de inteligência histórica mantêm 12 competências e mostram `N/D` nos meses ausentes. Lucro/margem somente são renderizados como comparáveis para bases equivalentes; caso contrário, eventual subtotal de obras é rotulado **PARCIAL**, com contagem de obras elegíveis. Nenhum fechamento passado é recalculado.
4. Rótulos de comparação entre anos indicam bases incompatíveis, em vez de crescimento artificial de lucro.
5. Auditoria histórica mantém 46 competências; um status separado acompanha os eventos de consulta Cora autenticada, sem duplicar o saldo bancário oficial na aba de auditoria. Falha transitória de leitura não é descrita automaticamente como sessão expirada.
6. Testes offline ampliados para versão, bases ausentes, barras `N/D`, evento autenticado e cobertura histórica; identidade visual e navegação já validadas pelo diretor permanecem.

## Evidências de leitura — 22/10
- `cora_cache.movements`: 7.672 linhas e IDs distintos, últimas movimentações em 22/10.
- `cora_cache.live_sync_state.last_success_at`: 22/10/2026 16:15:25 UTC, `last_error = null` naquele checkpoint.
- `cora_cache.monthly_summary`: 46 competências; 6 com equação de saldos oficial comprovada, 37 placeholders 0/0, 1 sem saldos, 2 registros legados com diferenças. Não promover estes 40 casos como integralmente conciliados.
- `public.cr_finance_v12_operations`: 0 registros no checkpoint. **Importante:** testes Trello confirmados pelo diretor não constituem prova de escrita nesse ledger específico; não reexecutar operações reais automaticamente.
- Capital de Giro: valores existentes e origem Trello preservados; nenhum lançamento financeiro realizado nesta intervenção.

## Critérios de release
- CI unitária/smoke e Central Canonical Guard devem passar na branch.
- Copiar somente o arquivo da URL de validação V12 para `production/dashboard-financeiro-v12-validacao-20261021/index.html` em main, sem alterar o alias V11.
- Confirmar hash HTML entre candidata e URL de validação, GitHub Pages SUCCESS e verificador de URL SUCCESS.
- Não inserir credenciais, não mudar backend bancário, não duplicar lançamentos, não alterar obras fechadas.
- Sem merge da PR #142 enquanto faltar decisão expressa de homologação integral; a aprovação visual/operacional comunicada é registrada separadamente da auditoria bancária histórica.

## Pendências deliberadamente identificadas
1. Reconciliação histórica Trello × Cora e comprovantes por período (não executável por ajuste cosmético).
2. Prova auditável no ledger idempotente de escrituras da **V12 segura**, ainda sem operações registradas. O diretor confirmou testes de Trello na UI, mas não foi reproduzido lançamento real pela engenharia, para evitar impacto financeiro.
3. Revisão final de homologação financeira integral quando as bases históricas estiverem comprovadas.

**Nenhum dado financeiro real foi modificado para resolver essas pendências.**
