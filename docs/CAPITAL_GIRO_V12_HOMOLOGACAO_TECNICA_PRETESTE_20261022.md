# CONSTRU-REI — CAPITAL DE GIRO V12
## Checkpoint de homologação técnica para teste operacional | 22/10/2026

**Status autorizado pelo Diretor:** HOMOLOGADA TECNICAMENTE PARA TESTE OPERACIONAL EM 23/10/2026 AO FINAL DO DIA.
**Não significa homologação operacional definitiva:** ainda não houve teste autenticado end-to-end (prévia + confirmação + criação de card) nas obras efetivamente finalizadas. Não efetuar merge da PR #147 ou substituir a V12 congelada até essa validação.

### Fonte e identidade
- Repositório: `rogeriocibin-alt/construrei-oauth-pages`
- PR de continuidade: https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/147 (DRAFT).
- Dashboard candidato publicado: https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v12-capital-fechamento-candidato-20261022/
- HTML validado em `main` e candidata, blob Git `922fcfa7d91a86dc310b0fde3ab2b5c0eba4bebc`.
- Correção do netguard `V12_SOMENTE_LEITURA`, commit `ebd9cfafdbca07e0ddd4f0d2cf5c7d1700270c57`, GitHub Pages run `39869813490` SUCCESS.
- CI Central Canonical Guard run `39869817105` SUCCESS.
- Cofre Zero CAS run `39869814025` SUCCESS.
- Supabase projeto `yspuaamokjbrosytqjpg`, Edge Function EXISTENTE `cr-trello-capital-giro-v1` na versão 34, ACTIVE; conteúdo idêntico à candidata `candidates/capital-giro-v12-fechamento-20261022/cr-trello-capital-giro-v1.ts` (blob `cf77a25e675cb37ed0aa3edd368c07f4d623214a`).
- Backup rollback da Edge v32 disponível em `candidates/capital-giro-v12-fechamento-20261022/backup-edge-v32-rollback.ts`.
- V12 congelada protegida, blob inalterado `68960c5a8abf3dd53be5c2d1d2f0e7a00b8b308c` (ref `release/financeiro-v12-operacional-congelada-20261022`).
- V11 e seus lançamentos permanecem preservados.

### Regras homologadas tecnicamente
1. Trello continua a fonte operacional. A central reconhece períodos da lista financeira e atualiza o seletor/saldo automaticamente com a aba financeira visível, sem alterar seleções de débitos ativas.
2. Mostrar saldos positivos, negativos e saldo líquido (não confundir R$ 2.595,75 positivo com R$ 2.479,69 líquido — negativos históricos R$ 116,06).
3. O botão `Encerrar período de acertos` oferece sugestão de datas, prévia sem escrita e confirmação explícita da Diretoria. POST permitido **apenas** aos endpoints `close-preview` e `close-commit` pelo netguard; demais operações não autorizadas permanecem bloqueadas.
4. O backend exige a sessão `ADMIN_MASTER_ROGERIO`, confere quantidade e unicidade das obras, soma de Capital de Giro, diferença de rateio zero e nenhuma pendência. Valores vêm do Acerto Vivo e são recalculados no commit com fingerprint.
5. A chave do período é única; a reserva idempotente no Supabase precede a criação do cartão; existem verificações adicionais contra reutilização das mesmas obras e do snapshot do Acerto Vivo.
6. Não permite período com data final futura. **Hoje 22/10**; amanhã 23/10/2026 é a data prevista para o teste com as obras que finalizarem.
7. Nenhum fechamento de obra, gravação bancária ou transferência Cora é disparado automaticamente pelo encerramento de Capital de Giro.

### Dados de referência — não copiar como valores de fechamento futuros
- Capital de Giro histórico gerado: **R$ 20.648,65**.
- Saldo líquido histórico: **R$ 2.479,69**.
- 26 cards históricos na lista do Capital de Giro.
- `cr_working_capital_periods_v1`: zero registros no pré-teste; não houve card novo de período criado durante a homologação técnica.
- Acerto Vivo consultado às 22:33 UTC em 22/10/2026: **8 obras**, Capital de Giro **R$ 879,67**, diferença zero, pendências nenhuma; sujeito a mudanças até o encerramento real. O estado agregado no Supabase guardava valor pendente anterior (**R$ 1.053,33**) em leitura separada, não devendo ser usado para confirmar acerto; o backend de fechamento relê o cartão vivo.

### Roteiro de validação final — 23/10/2026 ao final do dia
1. Acessar a URL da candidata em notebook e celular; autenticar com sessão da Diretoria.
2. Conferir se todas as obras que realmente serão fechadas compõem o Acerto Vivo, com valores/custos/lucro e rateio 20%/28%/28%/14%/10% corretos e nenhum item pendente ou duplicado.
3. Em `Resultados e Acertos → Capital de Giro`, sugerir datas; conferir período final esperado (em princípio 10/10 a 23/10, condicionado à cronologia real).
4. Clicar em **Pré-visualizar encerramento**. Exigir resposta válida com quantidade de obras, Capital de Giro atualizado e nenhum registro.
5. Somente após conferência humana dos valores, clicar **Confirmar e gerar card no Trello**, uma única vez.
6. Verificar cartão único e correto na lista `💱 CAPITAL DE GIRO TEMPORÁRIO`; verificar nova linha ACTIVE no ledger de períodos, atualização de painel e total de Capital. Duplicar o comando não pode duplicar card/crédito.
7. Conferir notebook + celular, comprovantes e lançamentos preexistentes, e só então considerar promoção definitiva e fechamento da PR #147.
8. Se resposta ambígua (ex.: `CREATION_REQUIRES_REVIEW`, tempo excedido ou registro `CREATING`), **não clicar novamente**; verificar card e ledger e resolver o estado antes de retomar.

### Governança
- Documento é o **checkpoint salvável** para retomada. Homologação: **etapa técnica liberada para teste**; **homologação operacional final PENDENTE do teste 23/10**.
- Não alterar período histórico, não corrigir saldo por suposição, não migrar a produção, não abrir nova Edge Function, não criar despesas fictícias.
