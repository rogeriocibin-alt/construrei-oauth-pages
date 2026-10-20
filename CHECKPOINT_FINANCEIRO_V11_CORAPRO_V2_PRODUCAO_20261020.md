# CHECKPOINT — Dashboard Financeiro V11 + Gestão Cora Pro V2 | 20/10/2026

**Decisão da Diretoria:** promover a Gestão Cora Pro V2 homologada ao Dashboard Financeiro da CONSTRU-REI, conservando o link estável e todas as funções anteriores.

## Publicação oficial
- Entrada estável, usada pelo menu financeiro da Central: `production/dashboard-financeiro-v4/`.
- Nova V11 oficial: `production/dashboard-financeiro-v11-cora-pro-v2-20261020/`.
- Módulo Cora Pro V2 estático publicado: `production/gestao-cora-pro-v2-20261020/` (arquivos copiadas byte a byte do checkpoint de homologação).
- Tab nova **CORA PRO V2 · ONLINE** incorporada à V11. Módulo carregado em iframe GitHub Pages, dentro da mesma produção; possui autenticação específica de diretoria. Se não estiver logado, solicita sua chave do aplicativo, jamais senha do banco.
- Seven original tabs preserved: agora, fin, cora, hist, conc, cost, qual. O fechamento de obras, lançamentos Cora manual, saldo manual, acertos e parcelas não foram alterados.

## Fontes e execução
- Extrato e saldo Cora por cache Supabase e API mTLS, consulta de janela de dias recentes a cada ~5 minutos no cron já existente. UI relê somente cache.
- Trello = fonte canônica de obras, Gestão Click = fonte comercial/espelho, sem somar diretamente os valores ao caixa bancário. Conciliação automática por documento ainda não está autorizada/homologada.
- Banco verificado após publicação: 46 competências, 7.656 movimentos com 7.656 source IDs únicos, último sucesso de sincronização 20/10/2026 21:30:06Z sem erro.

## Prova da promoção
- GitHub Pages build/deployment success no commit `b8b0ac13369c7a3cfc9a53555cd3cc80eeea0a8b`.
- Browser abriu `production/gestao-cora-pro-v2-20261020/` e `production/dashboard-financeiro-v11-cora-pro-v2-20261020/index.html`, com aba nova visível e login da V11 presente.
- Caminho estável foi atualizado para redirecionar à V11 nova sem renomear/retirar o alias.
- Controle de regressão: versão antiga permanece integralmente publicada em `production/dashboard-financeiro-v4-homologado-20261007/` sem modificação. Branch `checkpoints/dashboard-v11-before-cora-pro-v2-promotion-20261020` preserva o estado antes da promoção.
- Rollback simples: repor no arquivo `production/dashboard-financeiro-v4/index.html` o endereço anterior `production/dashboard-financeiro-v4-homologado-20261007/` a partir do checkpoint anterior.
- Validação autenticada do módulo Cora Pro V2 dentro do iframe pelo usuário em dispositivos móveis/notebook: **não executada nesta sessão**. Não afirmar testes que não ocorreram.
- Nenhum banco duplicado, nenhum serviço de pagamento ou integração adicional foi criado nesta promoção; somente arquivos HTML/CSS/JS no GitHub e roteamento estável.

**Guardrails:** preservar URLs, identidade, histórico, rollback, chaves de acesso e versão anterior. Alterações futuras só em candidata, não na versão oficial.
