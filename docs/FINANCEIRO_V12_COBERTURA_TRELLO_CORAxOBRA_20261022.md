# CONSTRU-REI | Cobertura bilateral Trello × Cora | checkpoint 22/10/2026

**Situação:** auditoria de leitura e deduplicação GLOBAL entre os boards localizados de 2024, 2025 e 2026 concluídas, com 3 respostas completas de leitura Trello (sem páginas pendentes). NÃO é homologação contábil integral, nem alteração da V12 publicada. Fonte de consulta: Trello Gestão de Obras (listas abertas e listas de arquivamento disponíveis), Cora cache de movimentações do Supabase e banco de dados Cora atualizado.

## Protocolo de extração
- Boards: Gestão de Obras 2024 e 2025 (12 listas mensais cada), Gestão de Obras 2026 (12 listas mensais + Em Andamento, Ag. Pagamento, Ag. Acerto, Retornos, Arquivados = 17 listas).
- Paginação de todos os cards abertos em cada lista consultada, no máximo seis/sétima página conforme grupo; nenhuma lista retornou páginas restantes na conferência por ano. Cards presentes em duas listas de um mesmo board foram deduplicados pelo identificador Trello.
- A pesquisa por boards Trello com o termo "2023", "OBRAS 2023", "CONSTRU 2023" não retornou board de 2023. A auditoria bilateral de 2023 permanece indisponível por ausência de fonte histórica equivalente, embora o extrato Cora esteja importado.
- Leitura de custos: `DD/MM - R$1.234,56` e `DD/MM - 1.234,56`; ano explícito `DD/MM/AAAA` respeitado ou ano do board como referência. Valores convertidos em centavos inteiros; datas inválidas rejeitadas.
- Correspondências candidatas só são contabilizadas quando Trello e Cora coincidem em **número da obra, data civil de Curitiba, valor exato em centavos e direção débito**. A transação Cora deve citar **uma única obra**. Caso contrário, bloqueio/revisão.
- Para contabilidade `CONFIRMADO_COM_EVIDENCIA`, é necessário também o ID bancário no registro do card e comprovação independente; esses detalhes não foram fornecidos em todos os cards. Por isso, os números abaixo são **EVIDÊNCIAS COMPATÍVEIS**, não receitas/custos fechados.

## Resultado final (leitura integral por board e deduplicação global de IDs)

A leitura final usou `trelloReadCard(list_by_board)` para os três boards e devolveu **347, 410 e 306 cards** respectivamente, sem cursor pendente. Cada identificador de card foi contado uma vez em toda a extração. Os lançamentos foram comparados com os **1.115 movimentos Cora que citam exatamente uma obra**. Datas inválidas foram rejeitadas, e o dia bancário foi interpretado no fuso de Curitiba.

| Board | Cards retornados | Cards com obra extraível | Custos com data e valor válidos | Linhas candidatas compatíveis | IDs Cora distintos vinculáveis por chave | Uso único no board | IDs reutilizados no board | Linhas bancárias ambíguas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Gestão de Obras 2024 | 347 | 330 | 1.879 | 102 | 101 | 100 | 1 | 0 |
| Gestão de Obras 2025 | 410 | 372 | 2.601 | 258 | 241 | 227 | 14 | 16 |
| Gestão de Obras 2026 | 306 | 277 | 1.926 | 261 | 245 | 231 | 14 | 21 |
| **Total confirmado globalmente** | **1.063** | **979** | **6.406** | **621** | **587** | **558** | **29** | **37** |

**Importante:** a conferência global recalculou o uso de cada `source_id` bancário contra todos os cards de 2024, 2025 e 2026. **Não encontrou IDs Cora reutilizados entre boards de anos diferentes**; as 29 reutilizações aconteceram dentro do conjunto de um mesmo ano. Dessa forma, os **587 IDs distintos, 558 de uso único e 29 reutilizados** são totais globais confiáveis para esse recorte e essa regra de matching. As 621 linhas candidatas são ocorrências de correspondência; *não* são 621 pagamentos únicos. 

Dos **1.115 movimentos bancários com uma única obra explícita**, **587** apresentaram ao menos uma correspondência por número da obra, dia, centavos e direção, e **528** não apresentaram correspondência inequívoca nessa chave, incluindo situações de formato não compatível ou colisão de valores bancários. **Não** atribuir esses 528 a uma obra errada nem declarar falta de pagamento.

**Nenhuma dessas 587 correspondências é, apenas por essa chave, um lançamento plenamente conciliado**: a comprovação do identificador Cora no card e do comprovante de origem continua sendo o requisito de confirmação contábil. O relatório não promove os 558 pares exclusivos a `CONFIRMADO_COM_EVIDENCIA` sem o recibo necessário.

## Cobertura e classificação de extrato (todos os anos 2023–2026)
- `cora_cache.movements`: 7.676 movimentos, 7.676 source_id distintos no checkpoint.
- 1.115 com somente uma obra explícita na descrição bancária — **candidatos**, sem vínculo Trello confirmado.
- 45 movimentações citam 2+ obras distintas — **não** ratear automaticamente por valor integral.
- 563 textos mencionam obra sem número; 3.681 sem descrição; 2.272 sem identificação suficiente.
- Total 7.676, sem sobreposição dessas classes. O matching Trello depende do formato disponível e da presença da obra correta no card.
- A soma de fluxo Cora de 46 meses por competência UTC e seis âncoras bancárias oficiais é uma **comprovação diferente** dessa auditoria por obra, já incorporada ao release operacional V12.

## Casos específicos conferidos
- Obra `775-26` (card `https://trello.com/c/dYuHiLPe`): PIX materiais R$ 1.785,22 em 07/10 (`ent_H7JkjhdfSNGrcqTjiLvuRg`) e alimentação R$ 105,00 em 08/10 (`ent_IbX0FLcqTF6CCA3c4A3CpQ`). Par candidato por obra, dia e centavos, único em chave bancária; sem ID Cora embutido na linha Trello, permanece compatível, não certificado.
- O mesmo código `775-26` consta em três PIX que abrangem mais de uma obra: R$ 300 em 09/10, R$ 450 em 14/10 e R$ 450 em 22/10. Nenhum deles foi integralmente associado à obra 775-26 nem replicado em cards.
- Capital de Giro no Trello e no Supabase atualizado automaticamente: R$ 20.648,65 gerados – R$ 17.291,96 consumidos = R$ 3.356,69 disponíveis; pendente do acerto atual R$ 381,29 separado; nenhum débito manual adicional criado por esta auditoria.
- Três compras com identificador histórico de operação no comentário do card de Capital de Giro somam R$ 594,45 no Trello; **não** estão individualmente comprovadas em extrato de conta como compra de cartão de crédito ou liquidação de fatura; não criar pagamento duplicado.

## Controle implementado na candidata
- `audits/financeiro-v12-cora-trello-candidatos-20261022.sql`: SQL SELECT classifica todas as transações, usando regex de fronteiras não consumidoras, impedindo que números adjacentes desapareçam.
- `audits/finance-v12-reconcile-readonly.cjs`: módulo JS de matching em memória **sem funções de escrita**, com bloqueios por banco ambíguo, duplicidade de ID, reutilização de movimento, múltiplas obras e ausência de comprovante.
- `audits/finance-v12-reconcile-readonly.test.cjs`: oito testes sintéticos para formatos históricos/modernos, evidência distinta de confirmação, duplicidade, concorrentes para mesma chave, multiobra, ID repetido e validação de origem.
- Conectado como teste ao **Central Canonical Guard existente** na branch candidata; nenhuma automação paralela.
- Release V12 homologada `production/dashboard-financeiro-v12-homologada-20261022/index.html` permanece intacta no blob `68960c5a8abf3dd53be5c2d1d2f0e7a00b8b308c`; guard da main já protege o hash.

## Pendências verificáveis, sem inventar conciliação
1. Deduplicação interboards **concluída neste checkpoint**: 587 IDs Cora distintos e 29 reutilizações em linhas de custo. Os casos reutilizados continuam bloqueados para contabilização dupla e exigem verificação individual.
2. Localização/recuperação do Trello de 2023 ou documentação equivalente; ausência de board impede auditoria bilateral total.
3. Comprovantes de débito Cora e IDs bancários por item nas despesas históricas Trello; valores coincidentes sem recibo são *candidatos*.
4. 45 movimentos multiobra precisam de rateio comprovado; 37 linhas são ambíguas por colisão de mesma chave; e há repetição de IDs em linhas de custo.
5. Comparação de compra com cartão de crédito versus fatura e pagamento bancário, para impedir despesa duplicada.
6. Não alterar obras fechadas, mesmo diante de discrepância; trilha de custo posterior deve registrar a origem preservada.

**Status de encerramento da etapa:** varredura global concluída em todos os boards 2024–2026 disponíveis, reconciliando candidatos sem sobreposição de IDs. O domínio de 2023 continua sem board Trello equivalente, e não existe comprovante bancário explicitamente embutido em cada uma das 587 correspondências. **Conciliação contábil individual integral NÃO comprovada**; não ampliar a homologação operacional V12 para homologação contábil total.
