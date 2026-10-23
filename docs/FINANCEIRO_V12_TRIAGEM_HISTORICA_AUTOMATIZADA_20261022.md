# CONSTRU-REI — triagem automática aprimorada de cartões financeiros (22/10/2026)

**Escopo:** evidências da PR #143, somente leitura. Nenhum cartão foi editado, nenhuma despesa foi lançada ou paga, nenhum acerto foi reaberto e nenhum valor foi modificado no Supabase/Cora/Trello. Dashboard V11 e V12 homologados preservados.

## Resultado da análise de cartões acessíveis
Uma releitura autenticada retornou **306 cartões abertos** no quadro `GESTÃO DE OBRAS 2026` (paginação concluída). A seleção ampliada encontrou **233 cartões** com identificador de obra no título e `Total de Custos` preenchido. Inclui, excepcionalmente, alguns cartões com códigos terminados em **-25** presentes nesse quadro e um cartão sintético de QA; por isso **233 é número de cartões no quadro**, não número de obras executadas em 2026.

Aplicando o extrator histórico aprimorado (prefixo `R$R$`, prestadores com cifra no final, `R$NF`, preços inteiros, caracteres invisíveis, PIX colado e datas inválidas bloqueadas), as categorias **provisórias, textuais e mutuamente exclusivas** foram:

| Categoria | Cartões | O que permite concluir |
|---|---:|---|
| SOMA_TEXTUAL_COMPATIVEL | **202** | Despesas datadas reconhecidas somam o total declarado; não prova quitação Cora |
| DIVERGENCIA_A_VERIFICAR | **11** | Diferença de soma; investigar rubricas fora da seção, estornos, origem e comprovantes |
| SEM_SECAO_CUSTOS | **10** | Não inferir custos de campos alheios à seção |
| REGRA_HISTORICA_CAPITAL_GIRO_A_VERIFICAR | **6** | Diferença idêntica ao Capital de Giro rotulado; não lançar CG novamente |
| LEITURA_INCOMPLETA | **2** | Uma ou mais linhas ambíguas não entram em cálculo |
| MULTIPLAS_ETAPAS_A_VERIFICAR | **1** | Etapas separadas; não misturar bases diferentes |
| SEM_LINHAS_VALIDAS | **1** | Card de teste QA; nunca contabilizar como obra |
| **Total selecionado** | **233** | Classificação por texto, NÃO conciliação bancária |

**Observação metodológica importante:** a varredura estrita anterior encontrou 216 cartões com total, 205 com despesas analisáveis, 176 somas compatíveis e 29 exceções. Os números acima resultam de critério e leitor ampliados: os dois conjuntos **não devem ser subtraídos** ou usados como taxa de evolução contábil, porque os filtros são distintos.

### Exemplos de causas tratáveis automaticamente na leitura
- [579-26](https://trello.com/c/lsg5ojHi): `R$R$850,00` já reconhecido, soma textual compatível; **não** adicionada nova despesa.
- [607-26](https://trello.com/c/vHTlzair): `JR 450,00` já reconhecido, soma textual compatível.
- 234-26, 512-26, 578-26: leitura reconhece formatos históricos de prestadores sem prefixo monetário.
- [735-26](https://trello.com/c/XLRc5AdN): oito despesas somam **R$ 857,25**, Total de Custos do fechamento **R$ 714,41**, diferença **R$ 142,84** exatamente igual aos itens concatenados R$ 87,20 + R$ 55,64. Cora tem débitos coincidentes por dia/valor mas sem descrição ou identificador bilateral; **não é prova para baixar/corrigir obra**.
- [500-26](https://trello.com/c/px8l6D3B): R$ 1.600 de mão de obra constam antes da seção `Custos`; diferença textual de -R$ 1.600 não deve virar "erro" automaticamente.
- [694-26](https://trello.com/c/clP543YL): cartão tem fases históricas distintas e total de etapa; não somar os pagamentos de períodos diferentes no mesmo fechamento.

### Controle de segurança adicionado
- `audits/finance-v12-reconcile-readonly.cjs`: bloqueia referências a outras obras e IDs bancários parciais.
- Bloqueio adicional: quando código da obra é de um ano e cartão está em board de outro, uma linha sem **ano explícito** recebe `ANO_REFERENCIA_AMBIGUO` e não pode ser conciliada por suposição.
- `audits/finance-v12-cost-integrity-readonly.cjs`: leitor somente leitura, suporta variantes históricas e sinaliza Capital de Giro sem recalcular resultado.
- Nenhum desses controles grava em Cora, Supabase ou Trello; a política de `CONFIRMADO_COM_EVIDENCIA` continua exigindo identificador bancário exato, card/linha, data, centavos, direção e comprovante independente.

## Encerramento correto
**A triagem dos cartões abertos do quadro 2026 foi ampliada e documentada.** Continuam pendentes, para homologação contábil por obra, origem bancária de transações sem descrição, IDs repetidos, linhas ambíguas, multiobra, compras com cartão/fatura e Trello histórico de 2023 não localizado entre os quadros acessíveis (inclusive arquivados). Nenhum percentual "100% conciliado" foi atribuído. PR #143 DRAFT e release V12 congelado.
