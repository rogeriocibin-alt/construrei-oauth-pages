# CONSTRU-REI | Checkpoint da candidata Diretoria Financeira V12 | 27/10/2026

## Escopo entregue e isolamento
- Branch: `candidate/financeiro-v12-diretoria-consolidada-20261027`.
- Página: `candidates/financeiro-v12-diretoria-consolidada-20261027/index.html`.
- Teste: `candidates/financeiro-v12-diretoria-consolidada-20261027/index.test.cjs`.
- Somente leitura; login pelo backend já existente. A sessão própria `crv12diretoria` aceita como fallback a sessão oficial `crv2`, mas **não grava nem remove** a sessão oficial.
- Ano 2023: Cora apenas, sem rateios operacionais inferidos. Ano 2024: resumo histórico da Gestão de Obras e alerta de divergências/54 obras. Ano 2025: faturamento e 375 obras, sem inventar lucro/retiradas. Ano 2026: consulta anual de Jan–Set diretamente da Edge e apoios/diárias de snapshot importado do Trello.
- Cards individuais para Éder, Fabrício, Rogério, Gabrielly, Ágata histórica e prestadores. Três colunas independentes: (1) rateio declarado Trello, (2) custos operacionais de apoio/diárias, (3) anotações Cora. Datas e origem declaradas; nenhum somatório entre competências ou naturezas incompatíveis.
- Fila de conciliação P0/P1 com origens e divergências; números extraídos de auditorias anteriores permanecem rotulados como pendentes de revalidação, não KPIs vivos.
- Interface responsiva celular/desktop, ações ano/atualizar, gráfico de bruto/custo/lucro quando os três números existem, falha fechada se backend não retornar.
- Nada desta candidata efetua aprovisionamento, cálculo de quitação, fechamento, atualização de cartões ou escrita no banco. Dashboard oficial de produção preservado.

## Fonte e verificação atual
- Supabase Edge `cr-v12-financial-settlements-trello-20261027`, read-only e sessão obrigatória, em produção desde PR #195/#196.
- SQL view `public.cr_finance_v12_support_2026_source` consultada em modo leitura em 27/10: 296 linhas; Éder 82 linhas / R$12.300,00, Fabrício 81 / R$12.150,00, João (identificação pendente) 61 / R$7.770,00. Uma linha sem valor em outro prestador. Estes são **custos de obra** no espelho importado, não saques comprovados; snapshot de 25/10.
- Histórico 2026 Jan–Set do Trello conforme fonte canônica: Éder R$42.462,87; Rogério R$42.462,88; Fabrício R$30.331,23; Gabrielly R$16.789,82; Ágata R$3.451,53; CG R$15.018,75. Excesso das destinações sobre lucro informado R$5.105,10, não corrigido silenciosamente.
- GitHub Pages/produção oficial NÃO alterados por esta branch.
- Notebook Rogerio-2022: Node v24.19.0, `node --test .../index.test.cjs` no commit `2ac9d8661df1612ea2332e75995f95b11fdadd71`: **12 PASS, 0 FAIL** (sintaxe, fontes, bloqueio de escrita, segregação de remunerações, isolamento da sessão, navegação e fila).

## Pendências para homologação
1. Validar visualmente no navegador mobile e desktop **na origem GitHub Pages autorizada**; um arquivo bruto no GitHub não é uma publicação. Confirmar login e leitura real, inclusive falhas de rede, sessão expirada e troca rápida de ano.
2. A visão Cora 2023 permanece um atalho à página operacional, não um conjunto bancário replicado na candidata.
3. Reclassificação Cora: alerta de R$299.426,50 visto no vídeo de gestão requer confirmação por transação/fonte; não atribuir a custos sem evidências.
4. Conciliação da diferença Jan–Set R$5.105,10; 75 extratos incompletos; obra 666-26 R$70; apoios após 25/10; obra 213-24; competência de outubro ainda aberta. **Não abrir ou reescrever obras liquidadas por inferência.**
5. PR #174 (`candidate/financeiro-v12-envio-acertos-periodo-20261024`) continua isolada; testes de envio/recuperação com sessão diretor exigem homologação e ausência de duplicação, antes de qualquer integração.
6. O painel é informativo e **não** certifica quitação ou conciliação total do ecossistema.

## Checklist de publicação e rollback
- PR desta branch deverá permanecer **draft** até ambiente de preview correto, QA visual/auth e CI `Central Canonical Guard` + `Change Trace` sem regressões.
- Para interromper: fechar a PR, sem merge. A candidata é aditiva e não altera tabelas, Edge Functions nem HTML homologado.
- Fonte bancária única: Cora; espelho operacional: Trello; GestãoClick fora como autoridade financeira.

## CI da PR #199 — verificado em 27/10/2026
- GitHub Actions **CONSTRU-REI Change Trace**: `completed / success` (run 40605711852).
- GitHub Actions **Central Canonical Guard**: `completed / success` (run 40605711900).
- Ambos vinculados ao commit `3d46fd2d6cb2d3f9a7041c5f974afa68d28aa22f` da candidata. Aprovação técnica **não equivale** à homologação funcional de login, backend vivo e QA visual.
