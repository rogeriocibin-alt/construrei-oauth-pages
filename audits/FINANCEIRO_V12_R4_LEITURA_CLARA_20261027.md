# Financeiro V12 — R4 Leitura Clara (27/10/2026)

## Por que existe
Usuário avaliou a candidata R3 como **muito estranha e difícil de entender**. R4 corrige a experiência, sem mexer nos números ou nas fontes aprovadas. A R3 manteve uma interface de auditoria como se fosse a página gerencial; a R4 organiza os mesmos módulos em um fluxo simples.

## O que mudou no navegador
1. Título direto: `Seu financeiro, de forma simples`.
2. Cinco abas visíveis em telas pequenas: **Visão geral, Equipe, Custos, O que corrigir, Acertos**.
3. A Visão geral exibe primeiro apenas faturamento, custos, lucro e margem. Mostra explicitamente que o consolidado Trello 2026 é **JAN–SET declarado, não Cora bancário nem o ano completo**.
4. Margem da base 2026 é exibida como **≈ 32,68% indicativa**, com ressalva da diferença aritmética de R$ 0,10. A R3 antiga a ocultava inteiramente. Se houver divergência maior que R$ 0,10, mantém `Em revisão`, jamais margem certificada artificial.
5. Auditoria, fontes, saúde detalhada, gráficos e detalhamento de outros profissionais ficam em seções expansíveis, NÃO removidos.
6. Equipe diferencia rateios, apoios de obra e anotações Cora sem transformar custo em pagamento.
7. Custos, problemas e acertos preservados, mas com explicações e ações simples; operação de fechamento continua **apenas prévia, sem commit**.
8. Corrigida falha de JavaScript ao abrir a página **sem sessão**, causada por chamada a `r3Render` antes de o segundo script carregar.
9. Identidade visual azul/dourado e cartões responsivos; cinco guias inteiras visíveis no celular (2 linhas).

## Segurança e rastreabilidade
- Nova página: `preview/financeiro-v12-diretoria-clara-20261027/index.html`.
- Reaproveita endpoints R3: `cr-dashboard-gerencial-v4-manual-cora-ui-candidate-20261007`, `cr-v12-financial-settlements-trello-20261027`, `cr-v12-r3-risk-readonly-20261027`.
- Sem nova tabela, migration, custo, rateio, transferência, baixa, Trello, Cora ou Capital de Giro.
- `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html` permanece intacto.
- Não representa homologação financeira: PR #174 e conciliação Cora continuam P0.

## Testes executados no notebook Rogerio-2022
- **15/15 testes automatizados Node.js PASS** da R4.
- Puppeteer Chrome headless 375px SEM sessão: login visível, 5 abas, 0 erros de página, 0 scroll horizontal.
- Puppeteer Chrome headless 390px com API **simulada**: leitura de KPIs, fontes, ganhos por colaborador (incluindo R$ 12.300,00 em apoios Éder), filtro de custos, alertas e prévia de acerto; 0 erros JS, 0 requests de mutação/commit, 0 scroll horizontal. O teste passou em exit code 0.
- A sessão e os dados do teste de navegação são SIMULADOS; E2E com dados bancários reais, Android e envio financeiro real não realizados.
- Meta dos gates: Central Canonical Guard e CONSTRU-REI Change Trace em verde, depois publicar somente nova preview Pages, confirmar HTTP 200.

## Valores não homologados
- Rateios Trello JAN–SET/2026: Éder R$ 42.462,87; Rogério R$ 42.462,88; Fabrício R$ 30.331,23; Gabrielly R$ 16.789,82, não comprovam saques Cora.
- Base operacional importada: 278 cartões / 262 códigos distintos, 75 incompletos e 1 divergente. Repetições não são despesas duplicadas até conferência.
- Custos não classificados históricos e distribuição adicional R$ 5.105,10 exigem conciliação por documento.
- Fechamento PR #174 não é liberado a partir da R4.

## Rollback
Reverter a PR que introduziu esta preview. Não eliminar R3, R2, arquivos de evidência, Edge, Cofre Zero nem produção.