# CONSTRU-REI — CHECKPOINT FIN-CORA-MANUAL-SALDO — 2026-10-13

## Decisão da Diretoria
Rogério aprovou em 13/10/2026 a identidade visual CLARA do Dashboard Financeiro para o ajuste manual do Saldo Cora Verificado e solicitou homologação sem troca do link oficial. A aprovação visual refere-se ao protótipo de teste isolado; não é prova de integração financeira ou de sincronização em múltiplos dispositivos.

## Fonte canônica
Dashboard oficial: `production/dashboard-financeiro-v4/` → redirecionamento estável para `production/dashboard-financeiro-v4-homologado-20261007/`.
PR #115: https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/115
Branch: `candidate/fin-cora-verified-manual-20261013`
Último commit de estilo: `f57a35a1d93a424aeff7d642ae9ce25ffd93ecbe`

## Escopo autorizado
- Campo Saldo Cora Verificado com botão de edição manual.
- Ajustar o saldo projetado pela diferença no valor verificado sem lançar movimentação no Trello.
- Preservar a futura integração API Cora, Trello, Gestão Click, cards e demais funções.
- Identidade visual idêntica ao Dashboard Financeiro homologado (azul/branco, faixa azul degradê, acentos dourados, cartões claros).
- Não mudar o endereço oficial; não causar regressões.

## Estado do teste
- Aprovação visual fornecida pela Diretoria em conversa.
- Candidata GitHub PR #115 ainda em draft; produção NÃO alterada.
- Botão adaptado à classe visual `manualbtn` usada pelo Dashboard oficial.
- Protótipo HTML local de interface não substitui teste integrado.
- PENDENTE: teste funcional isolado automatizado / CI, celular e notebook, persistência após atualização, formato de moeda, tratamentos de erro, operações reais protegidas.
- RISCO: `localStorage` é específico do dispositivo/navegador; não garante sincronização ou conciliação. Não afirmar controle centralizado nem saldo bancário verificado via API.
- Exigir autorização técnica/homologação integrada antes de promover; se não for comprovado isolamento financeiro, parar. NÃO disparar testes de lançamento real.
- Não alterar/deletar histórico, outras telas, infraestrutura, Edge Functions, tabelas ou agendamentos.
- Rollback: não promover PR; baseline produção intacta.

## Estado formal
`VISUAL_APROVADO` / `CANDIDATA_ISOLADA` / `INTEGRACAO_PENDENTE` / `PRODUCAO_INALTERADA`.


## Auditoria de integração — 13/10/2026
- Supabase existente: `yspuaamokjbrosytqjpg` (CONSTRU-REI Centro de Controle), ativo; não foi criado projeto novo.
- `cr-dashboard-gerencial-v4-manual-cora-ui-candidate-20261007` v3 já valida `x-cr-session` contra `central-gestao-api?api=me`, mas esta autenticação por si só não prova autorização do usuário para ajustar o saldo global. `verify_jwt=false` exige atenção especial ao controle interno.
- Fluxo Cora Manual existente já faz operações Trello; NÃO testar escrita real para simular homologação.
- PR #115 ainda usa `localStorage` para `CORA_VERIFIED_KEY` e `CORA_PROJECTED_KEY`. Isso não sincroniza aparelhos e a projeção local não é fonte contábil.
- A listagem de tabelas públicas existentes não identificou uma entidade específica de saldo Cora centralizado. Não se deve presumir que uma tabela genérica permite lançamento seguro. Persistência centralizada requer contrato de API e modelo de autorização/auditoria, com idempotência e controle de concorrência.
- Não foram executadas migrações, alterações financeiras em banco, deploy de Edge Functions nem merge. Link oficial permanece intacto.
- Antes de promover: definir registro central (saldo em centavos, data da verificação, operador, justificativa e versão), autenticação da diretoria, trilha de auditoria append-only, concorrência otimista; separar saldo bancário verificado de projeção, preservar movimentos Trello e efetuar testes integrados autorizados sem movimentação real.
- Estado final desta auditoria: `VISUAL_APROVADO`, `BACKEND_NAO_HOMOLOGADO`, `PROMOCAO_BLOQUEADA_POR_SEGURANCA`. Prosseguir apenas depois de implementação testada em isolamento, sem dependência de aparelho e sem operação financeira fictícia em produção.
