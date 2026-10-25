# CONSTRU-REI — Envio de acertos por período | Candidata 24/10/2026

**Baseline preservada:** `production/dashboard-financeiro-v12-operacoes-homologada-20261023/`. A interface candidata está em `preview/dashboard-financeiro-v12-envio-acertos-20261024/`, contendo a base operacional 23/10 byte a byte, salvo inserção do aviso e do bloco de envio. A seleção das datas reaproveita os campos `cg-close-start` e `cg-close-end` da função homologada de Capital de Giro.

**Ambiente:** candidato isolado `candidate/financeiro-v12-envio-acertos-periodo-20261024`; release V12 homologado **não alterado em produção**. Integração server-side `cr-finance-v12-period-close-candidate-20261024` no Supabase, sem escritos Cora.

## Fluxo executável
Diretor seleciona obras na tabela Acertos em Aberto, informa início/fim do período, clica **Pré-visualizar**. O backend lê dados atuais do Trello via função de Acerto Vivo e verifica status AG. ACERTO, base/custos/lucro, rateio 20/28/28/14/10, duplicidades na lista VALORES RECEBIDOS 2026, mudança concorrente e capacidade do cartão mensal. Devolve fingerprint estável e resumo, **sem gravar**.

Após confirmação explícita em **Enviar para Gestão Financeira**, recarrega as fontes e exige a mesma fingerprint; registra bloco de acerto no cartão mensal (mês de término do período) com referências individuais, verifica leitura do cartão gravado e então move os cards de obra para a lista operacional daquele mês. Em falhas parciais, responde com lista de pendências e **não** afirma conclusão integral. Não altera as descrições financeiras de cada obra, não lança Cora nem reajusta períodos históricos. O fluxo do botão não substitui baixa bancária.

## Auditoria histórica janeiro–outubro — achados prioritários
**Setembro:** lista operacional com 33 obras e R$ 84.130,55 em bruto. Card financeiro tem somente 21 obras de dois períodos, R$ 47.912,07. As 12 obras ausentes do detalhamento (725, 717, 716, 691, 675, 666, 657, 655, 615, 586, 447 e 261-26) somam R$ 36.218,48 em valores fechados. O período 19/09–29/09 possui registro de R$ 1.114,54 de Capital de Giro, mas não comprova retiradas individuais. O cartão operacional exibe custos R$ 54.355,47 e lucro R$ 29.705,08; matematicamente o lucro seria R$ 29.775,08, divergência de R$ 70,00. Não modificar automaticamente sem localizar o ajuste.

**Origem identificada para os R$ 70,00:** obra `666-26`, Valor Fechado R$ 4.188,88 menos Custos R$ 3.571,59 resulta em R$ 617,29, enquanto o Saldo e Rateio registrados estão em R$ 547,29. Falta comprovar se houve custo ausente ou saldo incorreto; não alterar a obra encerrada sem prova.

**Outubro:** lista operacional com 11 obras e R$ 17.349,10 em bruto, custos R$ 12.697,86, lucro R$ 4.651,24. Rateios exibidos: R$ 4.336,11 equipe + R$ 424,44 capital = R$ 4.760,55, R$ 109,31 acima do lucro. Card Valores Recebidos OUTUBRO ainda não possui os acertos discriminados. **Origem provável da divergência de R$ 109,31 em outubro:** parser legado contabiliza R$ 150,00 de `Éder: R$ 150,00` em bloco de apoio como rateio (obra 727-26) e ignora R$ 40,71 de Capital de Giro com rótulo e valor em linhas distintas (obra 649-26). Diferença líquida R$ 109,29, com R$ 0,02 adicionais a conciliar por centavos; ajuste do parser é outra etapa, não aplicar rateio retroativo automaticamente.

Nova leva de 11 obras continua AG. ACERTO do período 10/10–23/10 e **não deve ser reconhecida como retirada sem o comando de fechamento**.

**Janeiro–agosto:** os cartões mensais antigos incluem modelos diferentes de distribuição, incluindo Ágata, retenções sobre bruto e apoio/diárias. Preservar os históricos; conciliar mês a mês sem aplicar retrospectivamente regra atual nem misturar recebido, faturamento e retiradas.

Referências:
- Setembro financeiro: https://trello.com/c/2kgwU3T1
- Outubro financeiro: https://trello.com/c/T7lyFBlT
- Setembro obras: https://trello.com/c/kqc3ncxg
- Outubro obras: https://trello.com/c/542C66z2
- CG setembro final: https://trello.com/c/4tR6F5Ww
- CG outubro inicial: https://trello.com/c/usdLCZyL

## Trava adicional do lote atual
O Acerto Vivo consultado em 24/10 encontra **11 obras** em AG. ACERTO: base R$ 38.309,91, custos R$ 26.037,68, lucro R$ 12.272,23, Capital de Giro calculado pelos rateios individuais **R$ 1.227,20**. O card existente da competência 10/10–23/10 registra Capital de Giro **R$ 1.058,06**: diferença **R$ 169,14**. A função candidata V2 agora **permite prévia, mas bloqueia o envio** se o card de Capital de Giro não existir ou divergir, sem presumir ajustes bancários. A origem da diferença continua em auditoria e nenhuma retirada foi enviada.

## Evidências de teste
- Suite Node.js no notebook: 7/7 PASS, inclui segurança de sessão, idempotência, netguard, scripts inline e as contas históricas.
- Supabase Edge Function candidata ACTIVE, versão 2. GET health: OK. POST sem sessão: HTTP 401 esperado.
- Página de preview publicada em caminho isolado no GitHub Pages; UI V12 oficial de 23/10 intocada.
- Central Canonical Guard PR candidato: aprovado em etapa de verificação anterior; rever após novos commits.

## Gates para homologação
- Sintaxe/CI da candidata; GET health; rejeição de POST sem sessão.
- Prévia real com autenticação diretor; validação de fingerprint e comparação de totais.
- Teste autorizado e controlado de envio real, leitura bilateral e idempotência (sem lançar 11 obras pendentes antes da confirmação).
- Recuperação em caso de falha parcial de movimentação entre listas.
- Reconciliar as diferenças históricas de R$ 70,00 em setembro e R$ 109,31 em outubro, ou isolá-las como exceção de origem identificada.
- Verificar notebook e celular, atualizar agregação de acertos mensais do Dashboard V12, Gestor e Central antes de promover como homologado.

**Nenhuma retirada retroativa presumida nesta candidata.**


## Escopo executivo autorizado em 24/10/2026 — V12 2026 (não homologado)

**Contrato de entrega — duas listas, um fechamento**. O Dashboard é a interface de operação; banco registra movimentos, saldos e evidências; Trello é espelho operacional/de leitura. Escopo exclusivo 01/01/2026–31/12/2026. Não reconstruir 2023–2025. Janeiro–agosto de 2026 são somente leitura e devem ser preservados. Setembro será conciliado sem presumir retiradas. Histórico até hoje serve para consulta (intervalo livre, texto padrão, base/custos/lucro/margem/rateios com proveniência); somente cards atualmente em AG. ACERTO podem compor novo fechamento.

**Ao confirmar uma prévia autenticada**, executar uma única operação lógica, idempotente e auditável:
1. Revalidar elegibilidade das obras, datas, rateios, saldo e fingerprint sob bloqueio de concorrência no servidor; rejeitar duplicatas por chave única do período e conjunto de obras.
2. Registrar a operação e discriminar valores: orçamento bruto, entrada/recebimento efetivo comprovado, custos, lucro, percentual de custo, margem, Fabrício 20%, Éder 28%, Rogério 28%, Gabrielly 14%, Capital de Giro 10% (apenas quando regra aplicável; não recalcular históricos antigos). Não equiparar faturamento a recebimento bancário.
3. Criar/atualizar o cartão do período no **topo da lista Capital de Giro — Temporário/Gerado**, com datas, valor gerado, saldo acumulado e saldo real/disponível após os acertos. Débito operacional de saldo disponível **não é** movimentação fictícia da conta Cora. Caso já exista, atualizar sem duplicar crédito/débito.
4. Criar cartão mensal em **Valores Recebidos 2026** se ausente; anexar texto detalhado dos acertos ao mês correto, consolidar acumulado mensal e total anual a partir de registros únicos, preservando imagens/textos anteriores. Cortes entre meses: ratear por competência comprovada, jamais atribuir arbitrariamente.
5. Recalcular cabeçalho/resumo anual: total de orçamentos, recebimentos reais, custos, lucro, custo %, margem %, rateios individuais e Capital de Giro. Evitar substituir o **título literal da lista** se isso quebrar automações/identificação por nome; oferecer resumo em posição visualmente superior (cartão fixado/primeiro ou interface da lista).
6. Refletir os mesmos dados no Dashboard V12 e na Central; validar retorno de leitura bilateral banco↔Trello e consistência dos indicadores. Persistir comprovantes de execução, erro e recuperações.
7. Gerar anexo/arte mensal no padrão da imagem **Modelo Setembro.png** (fundo claro; tipografia amarela/laranja com contorno azul e ornamentos laranja), para outubro e próximos meses, sem refazer meses já concluídos. **Arquivo de referência anexado na conversa; não há arte gerada/publicada nesta etapa.**
8. Em falha parcial, não repetir o débito nem o bloco de acertos; retomar pela mesma chave de idempotência com status parcial e relatório de pendências. Testar concorrência, repetição, indisponibilidade Trello, cartão mensal ausente e rollback sem destruir o histórico.

**Exceção aprovada:** divergência R$ 169,14 referente ao período 10/10–23/10 é ressalva específica documentada; **não** fazer ajuste retroativo ou alterar saldo Cora. Divergências R$ 70,00 (setembro) e R$ 109,31 (outubro) exigem classificação e rastreabilidade; não presumir conciliação.

### Gap confirmado na implementação corrente

No runtime candidato `candidates/financeiro-v12-period-close-20261024/index.ts`, a ação `commit` atualmente **somente** acrescenta bloco no card mensal já existente e move cartões entre listas após confirmação. Não cria cartão de Capital de Giro, não debita/controla saldo, não cria mês ausente, não persiste livro financeiro do período, não recalcula consolidado anual, não publica Central, não gera arte mensal. Além disso a seleção de destino é pelo **mês final**, insuficiente para intervalos que cruzam meses. **Não homologar nem operar fechamento real como fluxo completo** até essas lacunas serem resolvidas e comprovadas.

### Critérios adicionais de homologação

- Verificar fonte oficial de recebimentos, custos e rateios de todas as obras do corte e testes de igualdade dos totais, incluindo arredondamentos centesimais e apoio Éder isolado de rateio.
- Testes unitários, integração e E2E autenticado com testemunho de ambos cartões novos, saldo real/disponível, acumulados mensal/anual, Dashboard, Central e imagem.
- Comprovar duas execuções do mesmo fechamento com **um único** efeito financeiro e sem novo cartão; testar indisponibilidade após gravação parcial.
- Teste em notebook e celular, snapshot da produção congelada, plano de retorno à versão anterior e gates CI PASS recentes.
- Entregar uma única URL candidata somente depois do pacote inteiro pronto, com evidências e pendências residuais reais; merge apenas após homologação.


## Checkpoint executado 24/10/2026 — importação dos resumos mensais existentes

**Mudança real no Supabase** `yspuaamokjbrosytqjpg`: migração `cr_finance_2026_monthly_source_snapshots_readonly_import_20261024` criou `public.cr_finance_2026_monthly_source_snapshots`, com RLS ativa, sem grants para anon/authenticated; chave primária `year_month`, restrita a 2026. Inserção `ON CONFLICT DO NOTHING` preserva dados anteriores. Importados 9 resumos declarados dos cartões originais JANEIRO–SETEMBRO e OUTUBRO como `OPEN_UNCONFIRMED`. Importação de resumos, **não** lançamentos de obras, pagamentos ou retiradas. Trello, Cora, capital e V12 produção não foram modificados por essa operação.

**Verificação SQL após importação:** 9 meses `DECLARED_UNRECONCILED`, 1 mês `OPEN_UNCONFIRMED`; bruto 40.749.553 centavos (R$ 407.495,53), custos 27.322.890 (R$ 273.228,90), lucro declarado 13.426.653 (R$ 134.266,53), lucro aritmético 13.426.663 (R$ 134.266,63). Diferença de R$ 0,10 originária de fevereiro, mantida sem correção arbitrária. Status exige conciliação antes de publicar como dado de retiradas comprovadas.

**Constatação documental:** existe no Trello o cartão anual https://trello.com/c/3CddF0rf, com os mesmos agregados históricos. Não duplicar. No card anual, a soma dos rateios históricos informados excede o lucro declarado em R$ 5.105,10; concentração em abril (R$ 5.105,80), ainda sem conciliação. Setembro está parcial (21 de 33 obras); outubro tem cartão mas não comprova retiradas. Preservar como ressalvas, não corrigir automaticamente.

**Próxima ação obrigatória:** ingerir e validar dados por obra/operação, inclusive datas efetivas de acerto e rateios históricos, com staging idempotente e conferência contra cartões operacionais, antes de atualizar KPIs de retiradas como conciliados. Depois concluir backend de fechamento, saldo CG, mês/anual, capas e Central com testes E2E. Não homologar a candidata com o trabalho parcial.


## Checkpoint de importação individual Trello — 24/10/2026

Foi executada varredura completa do quadro Gestão de Obras 2026 por cartões `open` e `archived`, com resultado **308 ativos + 88 arquivados = 396 cartões**, incluindo resumos, controles e cartões de obras antigas. Com identificação rígida `NNNN-26` no título, foram encontrados **278 cartões individuais** (262 ativos, 16 arquivados), representando **262 códigos de obras distintos** e **16 códigos duplicados entre cartões**.

Foi aplicada no Supabase do projeto `yspuaamokjbrosytqjpg` a migração `cr_finance_2026_work_card_source_v1_staging_20261024`, criando `public.cr_finance_2026_work_card_source_v1`, com RLS ativada, sem SELECT público (anon/authenticated), chave primária ID de cartão Trello e índice por código. Cada registro guarda código normalizado, URL, lista, título, descrição integral original, estado ativo/arquivado e última atividade. Importação concluída por 14 lotes com upsert condicionado a mudança, sem movimentar quaisquer cartões.

**Teste real pós-gravação:** SQL retornou 278 cartões, 262 códigos únicos, 262 ativos, 16 arquivados, 276 descrições preenchidas e 275 com marcadores textuais financeiros. Os 16 códigos que aparecem em dois cartões são: 13-26, 19-26, 20-26, 22-26, 28-26, 290-26, 32-26, 320-26, 4-26, 411-26, 44-26, 51-26, 53-26, 675-26, 7-26 e 9999-26. **Dois cartões com o mesmo código não são duas receitas automaticamente.**

**Limite de cobertura:** 278 são cartões com código de 2026 reconhecível no título, não uma prova de que TODAS as obras de 2026 estão completas; ainda deve ocorrer investigação dos demais cartões não identificados por padrão, vínculos 2025/2026 e referências internas. Os textos originais foram importados como *fonte bruta* sob status `PENDING_RECONCILIATION`, não como receita/retirada comprovada. Resumos mensais seguem segregados em `cr_finance_2026_monthly_source_snapshots`. Não houve lançamento Cora, nova retirada, alteração de cartões Trello nem promoção da candidata.

**Próxima etapa P0:** extrair com parser testado campos financeiros individualizados de cada obra e os movimentos datados, identificar conflitos/múltiplos cartões e conciliar com os cartões mensais, Cora e o mecanismo de acerto vivo; atualizar Ledger derivado com proveniência explícita; só então ligar os KPIs financeiros e automatizar o fechamento idempotente de Capital de Giro + Valores Recebidos + Central, incluindo referência visual mensal. Não declarar 100% antes da conciliação.
