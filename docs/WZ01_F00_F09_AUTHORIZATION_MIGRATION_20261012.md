# WZ-01 • Contrato de autorização F00–F09 (candidata)

Data: 12/10/2026, Brasília. Estado: **P0 aberto**. Fonte única da pendência: Gestor / Supabase cc_items.id=WZ-01. Sem novo cartão.

## Evidências somente leitura

- cr-flow-runtime-v2 ACTIVE v17 usa verify_jwt=false, conexão privilegiada ao banco, leituras list/get e alterações na mesma função. Não foi identificada validação explícita de identidade/sessão antes dessas operações no código inspecionado. Campos actor são originados do cliente.
- cr-f00-intake ACTIVE v24 também usa verify_jwt=false e banco privilegiado. Define helper auth(req), porém não foi encontrada chamada a esse helper no handler inspecionado; rotas me/list/get exigem revisão.
- As dez páginas HTML oficiais F00–F09 chamam Edge. Amostras F00, F01, F02 e F09 têm POST sem sessão/cabeçalho de identidade visível. O scanner existente agora apresenta evidência das dez páginas, mas **não conclui segurança a partir de uma palavra Authorization no HTML**.
- RLS e GRANTs do banco impedem acesso SQL direto não autorizado conforme auditoria anterior, mas não substituem autorização na camada Edge que usa service_role.
- Nenhum pedido ao serviço para obter/alterar chamados de clientes foi realizado. Trata-se de risco P0 de exposição e escrita potencial, não de incidente/exploração comprovados.

## Política de autorização a implementar somente em candidata isolada

| Classe de operação | Exemplos | Condição mínima |
|---|---|---|
| Pública limitada | health, eventual abertura de novo chamado | Dados mínimos, validação e limite de tamanho/taxa; nunca listar casos, obter dados anteriores nem ler anexos de terceiros |
| Privada de consulta | list, get, flow-state, eventos/anexos | Sessão validada no servidor, usuário ativo, vínculo do caso à organização e autorização por papel |
| Privada de escrita | route, flow-save, flow-advance, budget-save, budget-release, aprovações | Todas as anteriores mais permissão da etapa, idempotência, trilha de auditoria e actor derivado do usuário validado, nunca confiando no actor do body |
| Integração externa | Webhooks legítimos | Canal separado com segredo server-side, assinatura ou outra credencial forte, proteção a replay e limite de escopo |

Segredos service_role jamais chegam ao navegador. Recomendação arquitetural: perfis individuais (Gabrielly, Fabrício, Éder, Rogério) com autorização server-side; separação por organização/caso; operações anônimas estritamente delimitadas. A escolha de identidade e acesso é decisão de Diretoria antes de qualquer publicação.

## Provas de aceitação sintéticas e negativas

1. Ausência de sessão: negar list/get/flow-state e escritas privadas, sem retornar detalhes.
2. Token inválido, expirado e revogado: negar em todas as rotas privadas.
3. Organização A consultando ou editando caso da B: negar.
4. Perfil sem permissão de etapa/orçamento/aprovação: negar.
5. actor/role forjados no corpo: ignorar, negar elevação e registrar tentativa.
6. Identificador de caso/handoff alterado para outro usuário: negar.
7. Reenvio com chave idempotente: não duplicar eventos ou efeitos.
8. Tentativa de ler/upload de arquivo de outro caso: negar.
9. Erros ou upstream indisponível: não revelar token, segredo ou dados de terceiros.
10. Abertura pública mínima, se aprovada: permitir entrada nova mas não consultar antigos.
11. Testes positivos com usuários e casos fictícios para todas as etapas F00–F09.
12. Compatibilidade funcional da Central e das dez páginas, celulares/notebook, PWA/cache, navegação/voltar e rollback seguro.

## Roteiro de liberação sem quebra

1. Preservar versão atual e inventário de consumidores (guard do PR #108).
2. Definir quem pode acessar cada rota, perfil e tenant; manter apenas intake público legitimamente necessário.
3. Implementar em candidata isolada e executar testes sem dados reais nem produção.
4. Validar transição das dez páginas para identidade/sessão. **Não simplesmente ativar verify_jwt=true em produção**: os clientes atuais podem parar de funcionar.
5. Homologar CI + E2E celular/notebook + autorização negativa + rollback conjunto antes de qualquer promoção.
6. Após eventual promoção aprovada, monitorar saúde, respostas não autorizadas, idempotência e auditoria; reverter atomica e imediatamente se houver regressão.

**Critério final:** zero leitura/escrita privada sem identidade válida e permissão para o caso/tenant; verificação de revogação; actor confiável; dez páginas E2E; backups e rollback testados. Até prova final, manter **P0 aberto**.

**Escopo desta alteração:** alerta em CI existente e documentação apenas. Nenhuma alteração de Edge, banco, URLs, acessos, custos, backup, cron ou produção. **Não é uma correção de autenticação**.

## Entrega técnica incremental: contrato isolado executável

- O arquivo `security/contracts/wz01-flow-authorization.mjs` implementa uma política pura de **negação por padrão**, que rejeita sessão inválida/revogada/vencida, usuário inativo, cargo sem permissão, caso de outro tenant e acesso a caso não atribuído; deriva o ator do principal autenticado no servidor, nunca do body enviado pelo navegador.
- A suíte `security/contracts/wz01-flow-authorization.test.mjs` usa fixtures totalmente sintéticas e roda no **Central Canonical Guard existente**, sem workflow, serviço, função Edge ou banco adicional.
- **Não integrada à produção**: as funções atuais continuam inalteradas. A API de autorização precisa de adaptadores server-side reais que verifiquem sessão, papel, tenant e permissão por caso; o código oferece contrato, não infraestrutura de identidade.
- **Bloqueio estrutural identificado**: o inventário de colunas das tabelas `cr_flow_handoffs` / `cr_f00_cases` / `cr_f00_operators` não evidenciou relação explícita entre caso e organização/usuário em colunas dedicadas. Não improvisar `tenant_id` nem conceder políticas globais. Antes de integrar, provar chave canônica de vinculação, migração reconciliável/backfill e autorização read/write por caso, mantendo compatibilidade dos 10 clientes. Não criar tabela/coluna ou alterar RLS automaticamente.
- A execução CI dos fixtures comprova apenas a semântica do contrato isolado, **não** autenticação real, compatibilidade do navegador, logs de produção ou correção P0.
