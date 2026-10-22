# CONSTRU-REI | Auditoria de candidatos de conciliação Cora × Trello — 22/10/2026

**Estado:** APURAÇÃO PARCIAL DOCUMENTADA (somente leitura). Não alterar a release V12 homologada nem os cartões históricos. Nova branch isolada: `candidate/financeiro-v12-conciliacao-por-obra-20261022`.

## Fontes auditadas
- Banco: `cora_cache.movements` do Supabase `yspuaamokjbrosytqjpg`. Chave bancária: `source_id`; instante bancário: `occurred_at` UTC. Classificação por texto da própria transação, sem OCR, heurísticas de valores ou reescrita.
- Trello: card `https://trello.com/c/QRs2VwFb` da Gestão Financeira, leitura por conector. O card apresenta Capital Gerado **R$ 20.648,65**, Consumo Líquido **R$ 17.291,96**, Saldo Disponível **R$ 3.356,69**, Acerto Atual Pendente **R$ 381,29**, 26 períodos e zero divergências dos títulos.
- Supabase `public.cr_working_capital_state_v1`: consulta após a atualização automática (timestamp `2026-10-22 16:52:04 UTC`) reproduziu exatamente os quatro valores e a quantidade de períodos, sem mutação manual.
- `public.cr_finance_v12_operations`: **0 registros**; não afirmar prova de lançamento pela trilha idempotente V12 segura só porque o gestor testou gravações operacionais em um dos canais.
- Cora BANK statement não é a mesma coisa que a fatura de cartão de crédito. Falta de um débito idêntico na tabela de movimentos não é prova de que uma compra com cartão de crédito falhou ou foi omitida.

## Classificação de rastreabilidade (sem vínculos automáticos)
Consulta reproduzível: `audits/financeiro-v12-cora-trello-candidatos-20261022.sql` (somente SELECT).

| Categoria excluente | Movimentos | O que realmente significa |
|---|---:|---|
| Um único número de obra `123-26` | **1.115** | Um único **candidato** de obra no texto; requer vinculação bilateral no Trello |
| Dois ou mais números de obra | **45** | **Bloqueado para atribuição integral**; exige rateio documentado |
| Menciona "obra", sem número de orçamento | **563** | Exige pesquisa contextual com confirmação humana |
| Descrição vazia | **3.681** | Não há texto suficiente para estabelecer obra |
| Outros, sem indicador suficiente | **2.272** | Pode ser gasto bancário, administrativo ou não relacionado a obra; não impor categoria |
| **Total de movimentos classificados** | **7.676** | **100% da base classificada**, NÃO 100% conciliada com cartões |

Os **1.160 movimentos** com algum número identificável foram segregados em **1.115 de obra única** e **45 multiobra**, usando expressão regular com limites não consumidores. O agrupamento inicial com regex consumidora omitia códigos adicionais em duas transações multiobra. A classificação nova foi conferida sobre os mesmos 7.676 IDs únicos. Os valores foram apurados em 22/10/2026; dados vivos mudam após novas movimentações.

**Por ano (obra única / multiobra):** 2023 1 / 0 (1.150 movimentos); 2024 188 / 10 (2.180); 2025 458 / 8 (2.564); 2026 468 / 27 (1.782). Total por ano confere com todos os movimentos; sem dupla contagem.

## Trilha Trello das três despesas previamente documentadas
O card oficial de Capital de Giro traz comentário de auditoria de 16/10 com vínculos e marcadores históricos:
- Botinas **R$ 225,68** `OP 64d17f69-a771-4f07-8323-b2be0021c736`: R$ 45,58 no card `UxMFnUbT`, R$ 174,34 no `HTDcoObj` e R$ 5,76 no `usdLCZyL`. Soma R$ 225,68.
- Botina João Victor **R$ 109,90** `OP e5cc9b03-cc14-4227-a3bd-f7df580a8ca9`: período `usdLCZyL`.
- Calças equipe **R$ 258,87** `OP d5c7d552-0c89-4c33-bc1e-43e4813623e4`: período `usdLCZyL`.
- **Total relatado no comentário de auditoria Trello: R$ 594,45**. O conteúdo é evidência da anotação histórica e não uma confirmação independente no extrato bancário.

**Risco de duplicidade:** uma compra dividida por mais de um período nunca deve ser vinculada pelo valor integral em cada cartão. Registrar e conferir pelo identificador de operação, valores parcela-a-parcela, soma exata e comprovante de origem. Não repetir os débitos já relatados.

## Regras do próximo gate: conciliação por obra
1. Usar `source_id` imutável do Cora e identificador inequívoco de cada card Trello; registrar pares sem lançar novamente.
2. Validar data, direção (entrada/saída), centavos e identificador bancário efetivamente registrado no card; coincidência de valor **isolada** jamais basta.
3. Diferenciar cartão de crédito, débito bancário e pagamento de fatura para impedir contagem em duplicidade no custo por obra.
4. Não fazer matching automático sobre descrições vazias ou meras menções a "obra".
5. Não alterar obras fechadas. Acertos e custos posteriores devem seguir a regra operacional vigente, preservando origem.
6. Exibir resultados nas categorias `CONFIRMADO_COM_EVIDENCIA`, `CANDIDATO_NAO_VERIFICADO`, `AMBIGUO`, `SEM_VINCULO`; casos não confirmados jamais entram em indicadores de margem "real conciliada".
7. Para concluir conciliação integral, é preciso ler o card e o histórico correspondente à transação (incluindo descrições e referências), não apenas a tabela de movimentos.

## Proteção da release V12 homologada
- URL: https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v12-homologada-20261022/
- HTML congelado: `68960c5a8abf3dd53be5c2d1d2f0e7a00b8b308c`.
- O workflow já existente `Central Canonical Guard` foi reforçado em main, commit `6874d43ac6988d536c1c976364854cde830eb4a5`, para falhar caso o hash do HTML homologado se altere. Execução **39822384439: SUCCESS**.
- Governança: o guard detecta regressões e não impede administradores de escrever diretamente na branch; preservação ainda depende da revisão e das políticas do repositório.
- Não foram criados novos serviços ou alterados saldos, chaves, movimentações, obras, faturas, Trello ou funções Supabase.

**Conclusão:** a sincronização do Capital de Giro alcançou o Trello automaticamente, o congelamento foi reforçado e todos os movimentos bancários receberam uma classificação reproduzível. A correspondência por transação e por obra continua sob verificação; não homologar como contábil integral sem evidência bilateral.

## Segundo checkpoint — evidência bilateral de obra 775-26
- Card Trello localizado por busca autenticada: `https://trello.com/c/dYuHiLPe`, lista EM ANDAMENTO (Gestão de Obras 2026).
- Trello informa `07/10 R$ 1.785,22 Material Piso` e `08/10 R$ 105,00 Almoço Éder, João e Fabrício — Ref. PIX`.
- Cora encontrou em 07/10 o débito PIX R$ 1.785,22, descrição `Materiais Obra 775-26`, `source_id=ent_H7JkjhdfSNGrcqTjiLvuRg`; e em 08/10 o PIX R$ 105,00, descrição `775-26 Almoço todos`, `source_id=ent_IbX0FLcqTF6CCA3c4A3CpQ`.
- Ambos os pares são únicos na base bancária para mesma data civil Brasília, direção e centavos. **Classificação: EVIDÊNCIA BILATERAL COMPATÍVEL / AGUARDANDO ID DA OPERAÇÃO NO TRELLO**. Não afirmar que o ID Cora foi efetivamente gravado nos dois lançamentos do card.
- O mesmo extrato possui mais três transações que citam 775-26 e **também outras obras** (R$ 300,00 em 09/10, R$ 450,00 em 14/10 e R$ 450,00 em 22/10). Esses totais não podem ser debitados integralmente na obra 775-26. O cartão de 20/10 tem um apoio de R$ 150,00 que pode corresponder a parte do último PIX, mas vinculação integral e rateio entre os outros dois trabalhos **não foram comprovados**.
- Uma busca por valor/data não autoriza escrita nem modificação de despesa antiga.

## Limite objetivo apurado
Foram classificados todos os 7.676 movimentos em cinco conjuntos excludentes; **nenhuma movimentação foi transferida, corrigida ou inserida nos cartões Trello**. A trilha exemplar de 775-26 foi confrontada bilateralmente por valor/data/obra; os 1.115 candidatos restantes exigem varredura do conteúdo dos respectivos cartões, seus comprovantes e seus IDs. O conector não forneceu exportação transacional completa de todos os cartões e suas referências para comparação em massa nesta execução. Não é possível atestar 100% de conciliação por obra com apenas o extrato.

## Terceiro checkpoint — operação V12 escrita e riscos de vinculação (22/10)
**Escopo:** checagens autenticadas somente de leitura no Supabase e Trello. Nenhuma transação, cartão, saldo ou operação alterados.

### Prova de escrita pelo canal V12 (não equivale a conciliação Cora)
- Ao contrário do instantâneo anterior de zero linhas, `public.cr_finance_v12_operations` passou a ter **1 linha**, operação `4ff20bfa-88b3-4ae4-848e-49146111b2c0`, status `COMMITTED`, registrada em **2026-10-22 17:21:22 UTC**.
- Obra `799-26`, cartão Trello [CJ27HA7S](https://trello.com/c/CJ27HA7S), R$ 100,70, saída, Alimentação, data 22/10, referência PIX. Descrição autenticada do cartão contém o marcador exato `CRV12OP_4ff20bfa-88b3-4ae4-848e-49146111b2c0` **uma vez**.
- Extrato Cora contém débito PIX **R$ 100,70 em 22/10 13:43 BRT**, `source_id=ent_uhS0im23Qb90nTnz6pUzXwg`, **sem descrição**; há outra transação de **R$ 100,70 em 20/10 13:23 BRT**, `source_id=ent_KjJj1G4tR0OA99qasTtjHfg`, também sem descrição. Mesmo valor não comprova identidade: o `source_id` Cora **não está no lançamento Trello**; portanto o par 22/10 é `CANDIDATO_NAO_VERIFICADO`, **não** `CONFIRMADO_COM_EVIDENCIA`.
- Estado auditado demonstra persistência bilateral **Supabase↔Trello da operação V12**; **não** demonstra repetição idempotente sob falha/reenvio (essa prova exige teste específico seguro). Não repetir a operação real para testar.

### Revisão transversal de obras e rateio
- Cartão da obra [768-26](https://trello.com/c/eqRchlZA) contém duas despesas de apoio de **15/10 R$ 150,00 cada** cujo próprio texto diz **REF OBRA 748-26**. Como o cartão 768-26 possui fechamento e margem já registrados, **não reclassificar nem recalcular** até checar a origem e a regra de custos posteriores; sinalizar `REFERENCIA_CRUZADA_A_VERIFICAR`.
- PIX bancário de **17/10 R$ 300,00**, `source_id=ent_yOzL5TAXTv2ScOKQBU4190Q`, menciona obras **748-26 e 694-26**. Não debitar R$ 300,00 integral em nenhuma delas sem rateio e comprovação.
- PIX de **22/10 R$ 450,00**, `source_id=ent_60opXwvgTIOoflRI0hsOQg`, menciona 768-26, 775-26 e 755-26. A descrição sugere diárias individuais de Éder; o rateio por data/obra necessita confirmação documental. Não duplicar a saída em três cartões.
- A obra [775-26](https://trello.com/c/dYuHiLPe) mantém as duas evidências compatíveis de 07/10 R$ 1.785,22 e 08/10 R$ 105,00 já descritas, mas permanece sem IDs bancários incorporados no cartão. Não marcar como integralmente conciliada.

### Checagem de atualização da base
- Consulta na execução: `cora_cache.movements` contém **7.676 movimentos e 7.676 IDs únicos**; o mais recente ocorreu em **2026-10-22 16:43:15 UTC** (13:43 BRT). A coluna `imported_at` atingiu **18:15:14 UTC** (15:15 BRT); há **23 movimentos com data de ocorrência nas últimas 48 horas**.
- Isso confirma **ingestão recente do cache**, não prova que todos os eventos disponíveis na API bancária tenham sido importados, nem que o saldo oficial esteja concilado transação a transação.

**Gate mantido:** PR #143 deve permanecer DRAFT, com leitura isolada. Publicação V12 congelada e PR #142 não devem ser modificadas. Não converter comparação de valor/data em gravação automática em cartões; exigir fonte bancária e trilha de identidade antes de alterar indicador de margem.

## Quarto checkpoint — varredura textual de 295 cartões Trello 2026

**Execução:** leitura autenticada das listas operacionais do board `GESTÃO DE OBRAS 2026`: EM ANDAMENTO, AG. PAGAMENTO, AG. ACERTO, RETORNOS, OUTUBRO, SETEMBRO, AGOSTO, JULHO, JUNHO, MAIO, ABRIL, MARÇO, FEVEREIRO, JANEIRO e ARQUIVADOS. **15 listas, 295 cartões abertos, sem paginação pendente**. Listas RESUMO ANUAL e meses futuros novembro/dezembro não foram incluídas, assim como cartões realmente arquivados/fechados fora das listas abertas.

**Triagem determinística, NÃO auditoria contábil fechada:** linhas de descrição de cada card com preço `R$`, termo “obra” ou “ref obra” e identificador `NNN-26` diferente do identificador principal no título do card foram sinalizadas. A consulta encontrou **29 linhas com referências cruzadas**. Podem ser reembolsos/custos posteriores intencionalmente concentrados na obra atual, não necessariamente erros ou duplicatas. Regra canônica: **não reabrir obras fechadas; preservar origem de custos posteriores**.

Exemplos para revisão **sem qualquer atualização de cartão**:
- [500-26](https://trello.com/c/px8l6D3B), lista AGOSTO: 5 linhas com referência às obras **479-26** e **347-26**, incluindo apoio e taxa de link.
- [451-26](https://trello.com/c/1sQFY6jA): material R$ 421,89 citando **125-26**; [480-26](https://trello.com/c/7B17EA9v): retorno R$ 500,00 citando **125-26**.
- [791-26](https://trello.com/c/vQ91NeQg), EM ANDAMENTO: despesas R$ 30,00 e R$ 53,70 com referências a **798-26** e **499-26**.
- [420-26](https://trello.com/c/yGn1Xf7Z), JUNHO: custos R$ 3,00 e R$ 100,00 com referência **401-26**.
- [768-26](https://trello.com/c/eqRchlZA), AG. ACERTO: R$ 150,00 + R$ 150,00 com referência **748-26**, também documentados no checkpoint anterior.
- [775-26](https://trello.com/c/dYuHiLPe), EM ANDAMENTO: diferencial de mão de obra R$ 20,00 citando **687-26**.

**Campos a completar mediante evidência:** 9 cartões possuem o campo `Total Custos: R$` **sem valor imediatamente preenchido**, sendo 5 em ARQUIVADOS (lista, não estado de card), 2 em SETEMBRO, 1 em AG. PAGAMENTO e 1 em AGOSTO. Isso **não prova** lucro incorreto nem autoriza preenchimento automático; avaliar cada obra e seus lançamentos antes de computar KPIs de margem real. Não contar resumos como obras.

**Cobertura e limites:** 295 é quantidade de cartões abertos dessas 15 listas, não a quantidade de obras conciliadas. Os 29 são *linhas* e não 29 cartões distintos, divergências comprovadas ou transações bancárias. A heurística textual não detecta despesas sem o literal `obra` ou sem código de orçamento. Continuação da conciliação exigirá evidência por ID Cora `source_id`, cartão, lançamento individual e eventual comprovante, com rateio explícito em movimentos multiobra.

**Governança:** não foram feitos novos lançamentos no Trello, nem ajustes nas obras fechadas, no saldo Cora ou no Capital de Giro, nem alterações na V12 congelada. PR #143 continua DRAFT.
