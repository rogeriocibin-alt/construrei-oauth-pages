# Financeiro V12 — auditoria de fontes e desatualização visual (08/11/2026)
**Estado atual: Dashboard corrigido, PR #215 incorporada e GitHub Pages publicado em 08/11/2026; conciliação financeira global permanece P0 em andamento.**
**Titular: Diretoria e Financeiro REI; atuação técnica: CR Assertivo.**
**Pendência única: FIN-V12-CORA-TRELLO-AUDITORIA-20261022.**

## Constatações com origem
- Gestão Financeira — resumo anual Trello (https://trello.com/c/3CddF0rf): declarado JAN–NOV R$496.125,97 bruto, R$333.630,63 custos, R$162.495,24 lucro. Fevereiro guarda R$0,10 de diferença matemática histórica; não corrigir retroativamente.
- Gestão de Obras — resumo anual (https://trello.com/c/gf25RQPa): carteira operacional 286 obras, bruto R$591.268,24. Mensais 259 cartões, R$516.189,90; outras listas 27 cartões, R$75.078,34. Carteira não é valor bancariamente recebido.
- Novembro Trello mensal (https://trello.com/c/gkZIjUfm): 12 obras, base R$12.902,05, custos R$8.091,02, lucro R$4.811,03; corte confirmado/retirado 07/11. Registro histórico V12 contém snapshot anterior de lucro R$4.681,03. Diferença R$130,00 é de versões do demonstrativo, não lançável em banco.
- Capital do corte (https://trello.com/c/BJbixvOj): crédito único R$481,08, débito já registrado R$450,00, saldo do corte R$31,08. Não duplicar.
- Capital geral, Trello Gestão Financeira: gerado R$22.187,79, saldo do livro R$2.826,54; NÃO é saldo Cora.
- Banco Mestre public.cr_finance_2026_work_card_source_v1: 281 registros, com meses anteriores a outubro com importação de 25/10; outubro/novembro sincronizados em 08/11. Fonte derivada não é o Trello ao vivo.
- Obra 666-26 https://trello.com/c/Q0mUjp16: fechado R$4.188,88, custo R$3.571,59, saldo informado R$547,29. Aritmética aponta R$617,29, diferença R$70,00; bloquear correção financeira até prova de custo extra/desconto.
- Obra 682-26, em aguardando pagamento https://trello.com/c/Df6EOo1l: fechado R$3.000,00 e recebido descrito R$3.900,00 com comissão de R$900,00; exige distinguir repasse bruto de receita reconhecida antes de consolidar.
- Cora: RPC public.cr_cora_live_status() informa saudável em 08/11 10:30 BRT, mas não demonstra correspondência individual de PIX/recebimentos com os cartões.

## Alteração controlada
Arquivo oficial na branch candidata: `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html`.
- Retira valor estático antigo apresentado antes de autenticação.
- Exibe primeiro a fonte financeira mensal declarada quando válida; mantém snapshot histórico V12 abaixo, explicitamente sem dupla contagem.
- Identifica projeções armazenadas no navegador como MANUAIS / NÃO OFICIAIS.
- Corrige texto ultrapassado que tratava outubro e novembro como não consolidados.
- Não cria POST, não escreve no Trello, Cora, Supabase ou Capital; funções, IDs e URLs existentes preservados.

## Gates
- Testes estáticos e sintáticos na CI. Não equivalem a E2E autenticado.
- Testar sessão Diretoria notebook e Android com banco, acertos, histórico, Capital de Giro, custos, auditoria, exportação e estados de erro.
- Conciliar movimentos bancários por IDs; verificação do saldo oficial de produção.
- Atualizar espelho do Banco Mestre exclusivamente por rotina idempotente homologada, com backup e confirmação de atualização.
- Publicação GitHub Pages da PR #215 confirmada por ação [42496156876](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/42496156876). Teste E2E autenticado em navegador de diretoria continua pendente; não equiparar deploy a conciliação integral.
- Rollback: reverter o commit desta branch / PR, sem revert de dados financeiros.


## Execução efetiva no Banco Mestre (08/11, 10h45 BRT)
- Depois de conferir os 12 cartões operacionais ao vivo de NOVEMBRO, uma prévia SQL validou 12 IDs distintos, 12 códigos esperados, 12 bases aritmeticamente balanceadas, somas R$12.902,05 / R$8.091,02 / R$4.811,03.
- Executado UPSERT **somente** em `public.cr_finance_2026_work_extract_v1`, com guarda de vínculo em `cr_finance_2026_work_card_source_v1` e condição de unicidade por `source_card_id`. Foram 10 novos/alterados em 12; três inserções e sete atualizações, dois preexistentes preservados.
- Gerada automaticamente pelo Postgres a coluna `calculated_profit_cents`; a execução teve erro anterior sem escrita por tentativa de inserir na coluna gerada; em seguida corrigida. Verificação pós-gravação: **12/12 BALANCED, soma exata, zero diferença**. Tabela completa passou a 281 extrações; 212 BALANCED, 68 INCOMPLETE, 1 DIVERGENT. `financial_parse_state=PENDING_RECONCILIATION` permanece correto: balanço aritmético NÃO certifica recebimento bancário.
- Resumo mensal e histórico do corte não foram regravados, Capital de Giro intacto. Gestor existente `FIN-V12-CORA-TRELLO-AUDITORIA-20261022` recebeu nota auditável, mantendo status Em andamento/P0.

## Cora — comparação por ID sem escrever novos custos
- Cache `cora_cache.movements`: **89 movimentos 23/10–08/11** (16 créditos R$16.380,23; 73 débitos R$29.723,51).
- Apenas **65** referências bancárias têm `cr_finance_v12_operations.status=COMMITTED` com a mesma referência; **24** não possuem esse vínculo por ID (11 créditos R$9.437,96 e 13 débitos R$9.279,95). Falta de vínculo não prova falta de custo no Trello; possíveis pacotes/apoios e transfers.
- Quatro PIX de 07/11 correspondem exatamente aos rateios registrados no cartão mensal: Fabrício R$962,21; Éder R$1.347,10; Rogério R$1.347,10; Gabrielly R$673,54 — total R$4.329,95, presentes na Cora e `cr_cora_bank_annotations_v12`, porém não em `cr_finance_v12_operations` por ID.
- **ERRO DE CLASSIFICAÇÃO ENCONTRADO E CORRIGIDO (08/11), mantendo os originais**: as quatro anotações bancárias dos rateios estão com `purpose="Apoios / diárias — identificação das obras no extrato Cora"` e `allocations=[{case:"755-26",...}]`. São saques de lucros do acerto geral, não custos da obra 755-26. Os dois apoios de R$750,00 também possuem alocação concentrada na 755-26 e carecem de distribuição por diárias/obras. Não reescrever anotações via SQL simples: existe tabela de revisões com fingerprint e exigência de ao menos uma alocação, exigindo correção transacional pela rotina homologada.
- Fonte Cora cache saudável em 08/11 12h30 BRT; 47/47 meses importados, mas conciliação banco×obras permanece pendente.

## Arquitetura da correção publicada
- Operação viva 2026: o bruto anual de listas mensais recebe o nome **BRUTO OPERACIONAL · LISTAS MENSAIS**, não mais "Faturamento vivo".
- Consulta de acertos: soma automaticamente os 11 registros mensais declarados JAN–NOV com validação de integridade e mostra bruto/custos/lucro em campo próprio, diferente da carteira operacional.
- Snapshot anterior continua consultável, jamais somado a novembro atual.
- Teste de sintaxe executado sobre os 22 scripts internos da versão candidata: 22 válidos, 0 erros; não substitui E2E.


## Resultado executado e atualizado — 08/11/2026, 12h55 BRT

### Banco Mestre sem inventar lançamentos
- 281 linhas em `public.cr_finance_2026_work_extract_v1`: **248 BALANCED** com conta fechada até o centavo, **32 INCOMPLETE**, **1 DIVERGENT**.
- Nesta operação foram **recuperadas 36 extrações derivadas** contra a descrição EXATA dos cartões Trello atuais: 28 por parser seguro de bases explícitas (março/julho/agosto/setembro), depois 8 por valor de aditivos/recebimentos/prestações que estavam em formatos legados. Cada atualização foi baseada em ID imutável Trello, título e categoria e com guarda do estado anterior; 248/248 saldo calculado = lucro registrado.
- **Não houve reabertura dos acertos, novo lançamento bancário ou novo crédito/débito de Capital.** A extração derivada não é a fonte bancária nem corrige o valor financeiro anual automaticamente.
- Dos 32 ainda incompletos, **11 cartões estão em listas mensais antigas** com lacunas, ajustes entre base e bruto ou divergência matemática não resolvida: março 138-26, 171-26, 211-26, 90-26; abril 199-26, 268-26, 276-26; agosto 260-26; setembro 261-26, 716-26, 717-26. Outros **21** estão em listas operacionais, arquivos ou retornos, muitos legitimamente sem acerto. Toda a lista com link está no [cartão único de auditoria Trello](https://trello.com/c/B47EVGmv).
- **Único DIVERGENT: 666-26**: bruto R$4.188,88, custos registrados R$3.571,59, lucro declarado R$547,29, mas diferença matemática R$617,29, portanto R$70,00 não explicados. [Origem Trello](https://trello.com/c/Q0mUjp16). Não ajustar custos nem rateios liquidados sem prova da diferença. Fevereiro conserva também R$0,10 histórico na soma mensal.

### Cora — PIX e trilha de retificação versionada
- Quatro PIX de **07/11** no Cora coincidem com os rateios definitivos das 12 obras do período 24/10–06/11: Fabrício R$962,21, Éder R$1.347,10, Rogério R$1.347,10 e Gabrielly R$673,54 = **R$4.329,95**.
- **4 revisões versionadas foram efetivamente gravadas por RPC oficial `public.cr_cora_bank_annotation_revise_v12`** em `public.cr_cora_bank_annotation_revisions_v12`. Atualizam finalidade para distribuição de lucro, não custo/apoio/diária, e discriminam o valor de cada PIX entre as mesmas 12 obras de origem; soma de cada PIX idêntica ao extrato, sem alterar `cr_cora_bank_annotations_v12` original nem a movimentação Cora. O módulo Cora V12 consulta a última revisão.
- Na janela de 23/10 a 08/11 existem 89 movimentos Cora. 65 ligados pelo mesmo ID a operações V12 e 24 sem vínculo direto; desses, **14 com anotações bancárias próprias** (incluindo 4 PIX retificados), **10 ainda sem identificação por ID em operação ou anotação**. Esses 10 **não são necessariamente custos omissos no Trello**: não há autorização para somá-los como despesas por suposição. Lista individual de todos os 24 no [cartão de auditoria](https://trello.com/c/B47EVGmv).

### Links e governança das fontes
- [Dashboard Financeiro V12 publicado](https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v12-operacoes-homologada-20261023/) via [PR #215](https://github.com/rogeriocibin-alt/construrei-oauth-pages/pull/215) incorporada. 6 testes estáticos passaram, 22 scripts compilados. **Sessão autenticada e interações de diretor não validadas**: restrição de acesso.
- [Gestão Financeira, resumo anual](https://trello.com/c/3CddF0rf) e [novembro](https://trello.com/c/gkZIjUfm): evidência PIX anexada sem regravar acertos.
- [Gestão de Obras 2026, carteira operacional](https://trello.com/c/gf25RQPa), [Capital de Giro geral](https://trello.com/c/QRs2VwFb) e [Capital de Giro do corte](https://trello.com/c/BJbixvOj): comentários de auditoria anexados sem alterar saldos.
- [Cartão de auditoria central](https://trello.com/c/B47EVGmv): 32 pendências de obra + 24 referências Cora com URL/ID e separação de categorias. Gestor Supabase **FIN-V12-CORA-TRELLO-AUDITORIA-20261022** recebeu apontamentos, mantendo P0 Em andamento.
- **Governança CI:** a ação GitHub Pages terminou SUCCESS; a ação Change Trace do push squash gerou alerta vermelho por ausência da referência de PR no título do commit, **não por falha de deploy ou dos cálculos**. [Log](https://github.com/rogeriocibin-alt/construrei-oauth-pages/actions/runs/42496157340). O padrão de commit para próximas mesclas deve incluir `(#numero_da_PR)` para o guard de rastreabilidade.

### Critério realista de encerramento P0
Exige comprovantes para os 11 casos históricos mensais sem fechamento matemático confiável, verificação de 1 divergência R$70, classificação dos 10 movimentos Cora ainda sem vínculo por ID e teste E2E autenticado das telas. **Não alegar missão 100% concluída antes dessas verificações.**
