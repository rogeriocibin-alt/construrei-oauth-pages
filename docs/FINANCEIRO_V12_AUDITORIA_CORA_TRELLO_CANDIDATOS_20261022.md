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
| Identificador explícito de obra `123-26` ou semelhante | **1.160** | Candidato para pesquisar card; NÃO confirma que registro equivalente exista nem que valor ou origem coincidam |
| Menciona "obra", sem identificador de orçamento | **563** | Exige pesquisa contextual com confirmação humana; não vincular automaticamente |
| Descrição vazia | **3.681** | Não há texto suficiente para estabelecer obra; não inventar associação |
| Outros, sem indicador suficiente | **2.272** | Pode ser gasto bancário, administrativo ou pessoal/empresa; não impor categoria |
| **Total de movimentos classificados** | **7.676** | **100% da base classificada**, NÃO 100% conciliada com cartões |

Os 1.160 candidatos mencionam **562 números distintos de obra** no conjunto. Os valores foram apurados em 22/10/2026; dados vivos mudam após novas movimentações.

**Por ano:** 2023: 1 candidato / 1.150 movimentos; 2024: 198 / 2.180; 2025: 466 / 2.564; 2026 até o snapshot: 495 / 1.782. Os demais grupos ficam separados conforme a consulta.

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
