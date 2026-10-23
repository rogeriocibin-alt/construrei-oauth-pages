# CONSTRU-REI | Dashboard Gerencial V12 — candidata de validação publicada
**Checkpoint 21/10/2026** • Engenharia CR Assertivo • domínio de regras Financeiro REI • aprovação humana pendente.

## Links canônicos de teste
- **Candidata publicada (somente leitura):** https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v12-validacao-20261021/
- **Desenvolvimento / revisão:** https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/142
- **Produção V11:** preservada; não houve troca do alias oficial.
- **Código V12:** candidates/dashboard-gerencial-v12-navigation-20261021/index.html, branch candidate/financeiro-v12-auditoria-20261021.
- **Publicação separada:** production/dashboard-financeiro-v12-validacao-20261021/index.html no main. Commit 2780ccd4a3e1f608d0aa6f3f5846dd9b651d10b7.
- GitHub Pages workflow 39693949147: **SUCCESS**.

## Quality gates executados
- GitHub Actions workflow "Financeiro V12 | Candidata sem regressao", run 39693867525: **SUCCESS**.
- Testes unitários financeiros (fixtures): PASS; não são conciliação real.
- Smoke offline: **34 verificações PASS**, quatro scripts inline com sintaxe JavaScript válida. Cobre 8 seções legadas, seis ambientes, paleta, bloqueio de escrita, Cora Pro V2, marcadores de auditoria e responsividade.
- Central Canonical Guard na branch: SUCCESS.
- Opera/notebook e Remote Desktop: não conectados na sessão; não afirmar que houve nova validação visual no notebook ou celular. Esse teste cabe ao diretor.

## Dados reais revisados
- Cora 2023+: 46 competências no cache; 7.668 movimentos e 7.668 IDs distintos na leitura de 21/10/2026. Último sucesso de sincronização 23:25 UTC; zero erro então.
- Totais de créditos/débitos dos movimentos conferem com os resumos mensais do cache. **Isso não é a mesma coisa que saldos oficiais conciliados.**
- Saldos: apenas 6 competências com equação bancária oficial comprovada; 37 competências com saldos zero substitutos; 1 sem saldos; 2 diferenças em 2023 (agosto R$ 300,00, dezembro R$ 200,00). Não alterar historicamente nem exibir como verificado.
- Trello 2024+: manter regras históricas, sem recálculo retroativo de rateios. 2025 possui rentabilidade parcialmente confirmada devido à obra 213-24. 2026 mistura bruto operacional vivo com financeiro fechado; bloquear margem agregada quando as bases diferem.
- Capital de giro: 26 períodos, R$ 20.648,65 gerados, R$ 17.291,96 consumidos, R$ 3.356,69 disponíveis, zero falsos alertas. Período de 04/06 a 12/06 (R$ 385,11) reintegrado ao histórico, sem alterar o disponível. Card-resumo Trello, nome da lista e agregado Supabase atualizados.

## Entrega técnica
- Arquitetura em seis ambientes com identidade CONSTRU-REI V11, mantendo os oito módulos de origem.
- Modo somente leitura no candidato, incluindo interceptação de métodos mutáveis. Não usá-lo para encerramento de obra nem gravação Trello.
- Cora Pro V2 existente embutido, sem novo conector ou serviço pago.
- Módulos Auditoria e Saúde incluem quadros estáticos datados para confiabilidade Cora + auditoria dinâmica de capital de giro.
- Status claro: **PRONTA PARA VALIDAR NAVEGAÇÃO, CONSULTAS E CORES; NÃO HOMOLOGADA PARA PRODUÇÃO FINANCEIRA**.

## Critérios de aceite humano (um único ciclo notebook + celular)
Abrir seis ambientes, selecionar 2024/2025/2026, conferir avisos de margem, verificar Cora Pro V2, conferir capital gerado/disponível, testar filtros e voltar/navegar; confirmar identidade azul/branco/dourado e usabilidade celular; nenhuma escrita deve ser possível na prévia.

## Ainda não satisfeito
Conciliação completa de retiradas Trello × Cora; conferência externa dos saldos históricos (38 períodos sem saldos confiáveis e duas diferenças); escrita E2E isolada; aceite explícito do diretor. **Não promover a PR nem alterar o alias da V11 sem esses gates.**
