# CONSTRU-REI | Cobertura bilateral Trello × Cora | checkpoint 22/10/2026

**Situação:** auditoria de leitura concluída para os boards localizados de 2024, 2025 e 2026. NÃO é homologação contábil integral, nem alteração da V12 publicada. Fonte de consulta: Trello Gestão de Obras (listas abertas e listas de arquivamento disponíveis), Cora cache de movimentações do Supabase e banco de dados Cora atualizado.

## Protocolo de extração
- Boards: Gestão de Obras 2024 e 2025 (12 listas mensais cada), Gestão de Obras 2026 (12 listas mensais + Em Andamento, Ag. Pagamento, Ag. Acerto, Retornos, Arquivados = 17 listas).
- Paginação de todos os cards abertos em cada lista consultada, no máximo seis/sétima página conforme grupo; nenhuma lista retornou páginas restantes na conferência por ano. Cards presentes em duas listas de um mesmo board foram deduplicados pelo identificador Trello.
- A pesquisa por boards Trello com o termo "2023", "OBRAS 2023", "CONSTRU 2023" não retornou board de 2023. A auditoria bilateral de 2023 permanece indisponível por ausência de fonte histórica equivalente, embora o extrato Cora esteja importado.
- Leitura de custos: `DD/MM - R$1.234,56` e `DD/MM - 1.234,56`; ano explícito `DD/MM/AAAA` respeitado ou ano do board como referência. Valores convertidos em centavos inteiros; datas inválidas rejeitadas.
- Correspondências candidatas só são contabilizadas quando Trello e Cora coincidem em **número da obra, data civil de Curitiba, valor exato em centavos e direção débito**. A transação Cora deve citar **uma única obra**. Caso contrário, bloqueio/revisão.
- Para contabilidade `CONFIRMADO_COM_EVIDENCIA`, é necessário também o ID bancário no registro do card e comprovação independente; esses detalhes não foram fornecidos em todos os cards. Por isso, os números abaixo são **EVIDÊNCIAS COMPATÍVEIS**, não receitas/custos fechados.

## Resultado com parser novo, por board
| Board Trello | Listas | Cards vistos | Cards únicos no board* | Linhas com custo reconhecido | Linhas com correspondência candidata | IDs Cora distintos entre correspondências no board | IDs Cora em uma única linha no board | IDs reutilizados no board | Linhas com chave bancária ambígua |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Gestão de Obras 2024 | 12 | 346 | 330 | 1.881 | 102 | 101 | 100 | 1 | 0 |
| Gestão de Obras 2025 | 12 | 399 | 372 | 2.604 | 258 | 241 | 227 | 14 | 16 |
| Gestão de Obras 2026 | 17 | 297 | 277 | 1.927 | 261 | 245 | 231 | 14 | 21 |
| **Soma de leituras por board** | **41** | **1.042** | **979*** | **6.412** | **621** | **587*** | **558*** | **29*** | **37** |

**Nota essencial:** o asterisco indica **soma das contagens deduplicadas dentro de cada board**, NÃO uma deduplicação global entre 2024, 2025 e 2026. Cards e pagamentos podem estar repetidos entre boards de anos diferentes. A tentativa de conferência global em uma chamada atingiu o limite de consultas do conector, logo NÃO afirmar 979 cards ou 587 IDs como globalmente exclusivos; 558 é a soma de casos de ID utilizado em uma linha por board, não um total auditado de pares únicos interanuais.

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
1. Deduplicação global interboards de cards e IDs bancários. Não somar os subtotais por ano como exclusivos.
2. Localização/recuperação do Trello de 2023 ou documentação equivalente; ausência de board impede auditoria bilateral total.
3. Comprovantes de débito Cora e IDs bancários por item nas despesas históricas Trello; valores coincidentes sem recibo são *candidatos*.
4. 45 movimentos multiobra precisam de rateio comprovado; 37 linhas são ambíguas por colisão de mesma chave; e há repetição de IDs em linhas de custo.
5. Comparação de compra com cartão de crédito versus fatura e pagamento bancário, para impedir despesa duplicada.
6. Não alterar obras fechadas, mesmo diante de discrepância; trilha de custo posterior deve registrar a origem preservada.

**Status de encerramento da etapa:** varredura disponível encerrada e reproduzível por critérios; conciliação contábil individual integral NÃO comprovada, logo não ampliar a homologação operacional V12 para homologação contábil total.
