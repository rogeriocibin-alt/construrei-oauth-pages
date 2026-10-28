# CONSTRU-REI | Atualização da candidata EXISTENTE V12 (27/10/2026)

## Decisão executiva
O diretor rejeitou as UX R3/R4 e determinou preservar a gestão visual e operacional da V12 homologada. Antes de alterar, verificamos que:
- A página prévia EXISTENTE `preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html` já incluía o fluxo `crp-period-send-v2`, porém faltavam os dois scripts mais novos e os painéis de ganhos/histórico presentes na produção.
- A produção em `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html`, SHA `a210ce859f63110701244d78ad2da359312eea5b`, já contém os módulos de rateio JAN–SET 2026, apoios/diárias, história 2024–2025, Cora, fechamento, CG, Central e GestãoClick. Não houve alteração ao original.
- A ação correta é atualizar SOMENTE o endereço da candidata existente, **não lançar outro Dashboard R5 nem substituir o desenho**.

## Implementação
O HTML da candidata foi reconstruído byte a byte com o arquivo oficial, inserindo exclusivamente:
1. Aviso inequívoco de ambiente candidato, após a abertura do `body`.
2. Um painel `Conferência das obras e qualidade dos dados` depois do histórico de rateios, sem mudar a posição ou o código de qualquer controle existente.
3. Script novo `cr-v12-auditoria-importada-runtime` (GET apenas) que exige a sessão do diretor e lê `cr-v12-r3-risk-readonly-20261027?year=2026`. Fonte importada Trello/Supabase, nunca Cora oficial. Valida esquema, aritmética de contagens e data do corte; nunca trata cartão repetido como custo duplicado. Não escreve.

### Fonte importada em 27/10
- **278 cartões** e **262 códigos distintos**: 16 registros adicionais do mesmo código de obra (não são necessariamente custos duplicados).
- **202** balanceados, **75** incompletos, **1** divergente, diferença absoluta aritmética **R$ 70,00**.
- Corte documentado do espelho: **24/10/2026**, **não** é um instantâneo ao vivo até 27/10.
- Rateios do cartão financeiro Trello da tela existente: **JAN–SET/2026**, não significa pagamentos bancários. Apoios/diárias de 2026 aparecem em seus próprios cartões, com identidade incerta de João.

## Evidências efetivas
- Notebook autorizado Rogerio-2022: **9/9 testes Node PASS** para paridade exata da produção, scripts idênticos, dados, esquema e leitura GET sem qualquer commit.
- Comparação byte a byte: removidos somente banner, painel e script novos da candidata, arquivo reconstruído = **100% idêntico** ao HTML homologado (353.394 caracteres).
- Chrome headless autorizado: teste 390 px sem sessão e 390/1280 px com dados simulados de auditoria: **0 pageerror, 0 mutações, sem overflow horizontal**. Os seis blocos exibem 278 / 262 / 202 / 75 / 1 / 16; status identifica corte 2026-10-24.
- A navegação em ambiente real de diretor e o E2E de fechamento com alteração Trello não foram feitos. A prévia não homologa fluxo financeiro.

## Instrução de preservação
- **PR #174 continua DRAFT** com código backend de acertos. A branch dessa PR contém uma versão anterior do arquivo de preview; não mesclar sua página antiga sobre a candidata atualizada. Antes de homologá-la, rebasear/atualizar a página pela base oficial mais recente, executar novamente testes E2E, conferir CG/Resumo mensal/Conciliação e prova de idempotência. Manter os códigos de backend protegidos.
- Não inserir qualquer valor inventado em 2023–2026. Não alterar custo, comissão, apoio, retirada, obra encerrada, Cora, Trello ou CG por inferência.
- Metadados de audit/preview são consulta, não prova de saneamento dos R$299.426,50 vistos no vídeo.

## Rollback
Reverter apenas esta PR e restaurar o arquivo de preview anterior. A produção, PR #174, módulos de ganhos, movimentações bancárias e Cofre Zero permanecem intactos.
