# HOMOLOGAÇÃO OFICIAL — Dashboard Financeiro V12 · Operações Cora (23/10/2026)

## Decisão e alcance
Em 23/10/2026 o diretor confirmou testes reais de **lançamentos**, **inteligência/seleção de operações** e **conciliação** e solicitou a homologação da operação desenvolvida, com publicação na versão atual.

**Homologadas nesta promoção:** extrato Cora e conferência no ledger Supabase; lançamentos de custo em obra e manual; conciliação de despesas já existentes sem reescrita no Trello; reconhecimento de receita já recebida na lista AG. ACERTO sem duplicação; categorização/indicação colorida de registros gravados; seleção e prévia de rateio entre obras e contas do Capital de Giro; lançamento de recebimentos e suas prévias; filtros e validações de valores em centavos; autenticação de Diretoria; idempotência e preservação de histórico Cora/Trello.

**Expressamente fora da homologação desta data:** fluxo **Fechar Obra** e cálculo/lançamento de **Acertos**; o diretor testará posteriormente. O código legado destas rotinas foi preservado na nova versão sem ser alterado/reescrito nesta promoção.

**Limite de evidência dos cenários:** auditoria bancária na promoção encontrou 9 operações `CORA_` confirmadas e zero em revisão; 7 lançamentos diretos, 1 conciliação de custo existente, 1 conciliação de recebimento existente. Não há comprovação de E2E real individual de rateios multiobra ou débito ao Capital de Giro nesta auditoria; estes permanecem com validação dupla e bloqueio/revisão em caso de divergência. A confirmação geral do diretor não deve ser apresentada como prova técnica de cada combinação de rateio.

## Versão oficial, fonte e navegação
- **URL oficial de operação:** https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v12-operacoes-homologada-20261023/?v=fd7cf40a
- Caminho da versão aprovada: `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html`; criado no `main` em `fd7cf40a1c95914225759cfec0e15788d0b0fd8d`.
- O HTML é **byte a byte igual** ao que o usuário testou em `preview/dashboard-v12-aprovisionamento-cora-20261023/index.html`; blob Git `90befb41c47e2a6fe0cc030f6c23f7241fabd216`.
- Central oficial de acesso: `production/central-operacional-v2-ux-r1-2-homologada-20261005/index.html`, atualizada para apontar a esta versão com parâmetro de cache `v=fd7cf40a`; commit `4bb5e27f1ddfbc2c3eaf03f8dc2103429a87a5c2`.
- Backend isolado que a release reutiliza: `cr-cora-aprovisionamento-v12-candidate-20261023`, Supabase `yspuaamokjbrosytqjpg`, **ACTIVE v10**, com autenticação de Diretoria. O nome técnico permanece histórico nesta homologação para **não recriar serviço, credenciais, saldos ou ledger**.
- Branch de desenvolvimento / auditoria PR #148 (`candidate/central-aprovisionamento-cora-20261023`) mantida **DRAFT**, não mesclada por estar divergente da `main`. A promoção foi **seletiva**, somente arquivo de aplicação homologado. Testes e relatórios continuam na PR para rastreabilidade.

## Governança, versão congelada e rollback
O workflow `Central Canonical Guard` protege **byte a byte** o arquivo `production/dashboard-financeiro-v12-homologada-20261022/index.html` pelo blob `31ae6a8e9b2c231ada71628dc25416a1157b2b98`. Uma tentativa inicial de substituição do arquivo congelado acionou a proteção corretamente. O conteúdo foi restaurado integralmente. **A proteção não foi afrouxada ou desativada**.

- **V12 de 22/10 (imutável):** `production/dashboard-financeiro-v12-homologada-20261022/index.html`, blob canônico `31ae6a8e9b2c231ada71628dc25416a1157b2b98`.
- Backup de consulta: `production/dashboard-financeiro-v12-homologada-20261022/index-pre-operacoes-20261023.html`, com o mesmo blob canônico.
- Ponto de restauração integral do repositório anterior à promoção: branch `archive/financeiro-v12-pre-operacoes-20261023`, commit `ff273a8a12a353e04d91fad7828e9a53b17072f7`.
- **Rollback de navegação recomendado** se a release apresentar regressão: restaurar no menu da Central o URL da V12 congelada, sem mexer no backend/ledger; selecionar manualmente a branch de restauração somente para recuperação integral aprovada. **Jamais desfazer lançamentos bancários ou cartões Trello via rollback HTML.**

## Testes e aceite
- Confirmação pelo usuário de testes reais em celular dos lançamentos e da conciliação.
- Validação dos 13 scripts JavaScript da release, 23 scripts do HTML da Central, com sintaxe aprovada.
- Conferência de símbolos/capacidades do HTML da V12 preexistente: nenhum símbolo original perdido.
- Preview publicada e validada pelo GitHub Pages antes da promoção.
- Registros financeiros `CORA_` persistentes no Supabase, com 9 COMMITTED, 0 REVIEW_REQUIRED, incluindo 1 `EXISTING_TRELLO` e 1 `RECEIPT_EXISTING`.
- Workflow canônico exige preservação da V12 congelada. O status final de GitHub Pages/Canonical Guard após promoção deve constar na auditoria de release; não inferir sucesso de run pendente.

## Próxima etapa
Somente após o teste do usuário, revisar e homologar separadamente `Fechar Obra` e `Acertos`; preservar valores fechados, rateio do lucro líquido, capital de giro e proteção idempotente. Não reabrir obras fechadas sem autorização específica.

## Verificação final da publicação — 23/10/2026

**Evidências verificadas diretamente após a homologação seletiva:**

- Versão oficial: `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html`, Git blob `90befb41c47e2a6fe0cc030f6c23f7241fabd216`, **idêntico** ao arquivo `preview/dashboard-v12-aprovisionamento-cora-20261023/index.html` na `main`.
- Rota oficial na Central: `production/central-operacional-v2-ux-r1-2-homologada-20261005/index.html`, apontando explicitamente para o URL `/production/dashboard-financeiro-v12-operacoes-homologada-20261023/?v=fd7cf40a`.
- **GitHub Pages da Central após alteração:** [run 40005884131](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/40005884131) `completed/success`.
- **Central Canonical Guard após alteração:** [run 40005884665](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/40005884665) `completed/success`.
- **GitHub Pages mais recente da `main`:** [run 40006057226](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/40006057226) `completed/success`, commit `fa172d3a55b93077032f47e5c715efc0503a8b33`.
- **Original congelado e cópia de segurança:** `production/dashboard-financeiro-v12-homologada-20261022/index.html`, `production/dashboard-financeiro-v12-homologada-20261022/index-pre-operacoes-20261023.html` e a mesma versão na branch `archive/financeiro-v12-pre-operacoes-20261023` têm o Git blob canônico **`31ae6a8e9b2c231ada71628dc25416a1157b2b98`**.
- Supabase `cr-cora-aprovisionamento-v12-candidate-20261023` **ACTIVE v10**; a denominação do serviço é preservada para evitar duplicação de serviços ou alteração de integração. Consulta de auditoria: **9 operações Cora COMMITTED, 0 REVIEW_REQUIRED e 1 RECEIPT_EXISTING**.
- A PR [#148](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/148) permanece **DRAFT / sem merge**. Sua diferença ampla em relação à `main` não deve ser mesclada em massa, pois a promoção seletiva já foi concluída.
- **Fechar Obra e Acertos** não foram homologados nesta publicação; aguardam o teste específico do diretor, sem qualquer baixa ou fechamento automatizado.
- O workflow independente Cofre Zero possuía execução pendente na auditoria de GitHub Actions. A presença da branch de rollback e do HTML preservado **não deve ser confundida com restauração integral/backup Cofre Zero homologado**.

**Conclusão:** release seletiva da Central de Operações **publicada, vinculada no acesso oficial, guardada e tecnicamente verificada**. As operações financeiras em aberto, fechamentos e acertos permanecem sob seus próprios controles.
