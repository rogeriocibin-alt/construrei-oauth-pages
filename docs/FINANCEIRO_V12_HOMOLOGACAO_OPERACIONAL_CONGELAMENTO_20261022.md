# CONSTRU-REI | Homologação operacional e congelamento de versão | V12

**Data:** 22/10/2026
**Decisão do diretor:** homologar e congelar a Dashboard Financeiro V12, após informar aprovação de visual, operação, Trello e saldo Cora.
**Alcance formal:** homologação operacional do aplicativo + reconciliação aritmética de extrato bancário e Capital de Giro. A **conciliação contábil individual de transações Cora × cartões Trello, fechamentos e rateios por obra não recebe declaração de 100%**, por falta de trilha probatória por operação, ainda que o diretor tenha testado operações bem-sucedidas.

## Links oficiais e fallback
- **V12 homologada operacional:** https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v12-homologada-20261022/
- **Central oficial:** https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/central-operacional-v2-ux-r1-2-homologada-20261005/
- **URL de validação V12 preservada:** https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v12-validacao-20261021/
- **Fallback V4 do menu anterior (preservado):** https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v4/?v=close-work-20261007-cba2edc9
- **V11:** não foi substituída nem apagada; seu conteúdo permanece disponível para retorno. Não editar V11 como parte desta homologação.

## Código aprovado
- HTML exato do release: Git blob `68960c5a8abf3dd53be5c2d1d2f0e7a00b8b308c`.
- Código-fonte da branch `candidate/financeiro-v12-auditoria-20261021`, commit `bd7dc7c94a20eca7888be75b19ee028019aa87ff`.
- CI financeiro **SUCCESS** run 39817852421; Central Canonical Guard **SUCCESS** run 39817852427. Smoke: 110 verificações offline, 11 scripts inline válidos, ids únicos.
- Publicação da rota validada e verificação Cora e Trello sem criação de novos serviços pagos; permissões de gravação restritas aos canais existentes. V11 e obras fechadas sem alterações.
- Promoção do botão Gestão Financeira da Central para a URL V12 em commit `299b821f3c6133e79f7bc3b03623c3ad65b1e0f3`, guard **SUCCESS** run 39818356356. O URL V4 prévio ficou conservado em `window.CR_FINANCE_V4_ROLLBACK_URL`, sem remoção.
- Os dados vivos continuam sincronizando do backend; o congelamento refere-se **ao código, à configuração de navegação e às evidências de auditoria**, não ao saldo bancário em tempo real.

## Evidência contábil bancária
Consulte `docs/FINANCEIRO_V12_CONCILIACAO_CORA_46_MESES_20261022_EVIDENCIA.md`.
- Competência bancária é **UTC**; usar mês Brasil produz diferenças artificiais em transações perto da meia-noite.
- 46/46 competências com somas exatas dos movimentos importados por fonte; 6 âncoras de saldos oficiais conferidas sem diferenças; 40 saldos mensais derivados reconstituídos sem convertê-los em declarações oficiais individuais.
- Saldo final encadeado de janeiro/2023 a outubro/2026 **igual ao snapshot oficial da Cora na mesma consulta**.
- 2 divergências legadas de campos de saldo (agosto/2023, dezembro/2023) assinaladas e **não reescritas**.
- Snapshot financeiro é pontual e a API Cora continua operando; a versão congelada não fixa saldo ou movimentos.
- Capital de Giro com fonte Trello e identidade gerado − consumido = disponível, 26 períodos no último resumo.
- `public.cr_finance_v12_operations` não tinha registros no checkpoint de engenharia; o aceite do diretor no Trello é relatado e aceito para experiência funcional, mas não substitui a evidência individual do ledger idempotente.
- Histórico de margem, custo e lucro parcial sempre marcado quando bases não equivalem.

## Regras de preservação e rollback
1. Não sobrescrever o diretório `dashboard-financeiro-v12-homologada-20261022` sem novo PR e nova homologação explícita do diretor.
2. Central aponta à V12; rollback rápido = retornar a URL de Gestão Financeira ao endereço V4 antigo, usando a versão anterior da Central (blob `361dfc1585f11e0c304fdcd018af273551975b9b`), sem qualquer apagamento de dados.
3. Manter candidata/PR #142 para desenvolvimento futuro isolado, sem modificações na versão congelada.
4. Nenhuma alteração em serviços Cora, certificados, JWT, Supabase, contas bancárias, cards financeiros, obras fechadas ou regras de rateio foi realizada para congelar o código.
5. Um novo ciclo de mudanças deve usar outra candidata e passar em desktop, mobile, smoke financeiro, publicação e guard Central; comparações contra este blob de HTML.
6. Congelamento por commit SHA e branch de referência. Sem regra adicional de proteção de branch no GitHub, administradores ainda podem mover refs; o hash identificado é a identidade verificável e imutável do conteúdo.
