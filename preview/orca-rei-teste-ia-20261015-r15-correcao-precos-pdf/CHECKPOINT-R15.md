# CONSTRU-REI • ORÇA-REI — CANDIDATA R15 (15/10/2026)

Estado: **ISOLADA, AGUARDANDO HOMOLOGAÇÃO DE PDF E IA REAL**.

Origem preservada: R14. Diretório único: `preview/orca-rei-teste-ia-20261015-r15-correcao-precos-pdf/`. Não altera R11, R12, R13, R14, central, produção, Supabase, custos, cache, credenciais ou Edge Functions.

## Correções
- Unidades comerciais `PCT`, `PACOTE`, `EMBALAGEM` e `CX`: transmissão ao endpoint existente como `UN` porque a função legada mapeia embalagem -> unidade. A unidade **do documento permanece PCT/CX**. Quantidade não é convertida nem multiplicada: estimativa representa **1 embalagem comercial genérica**, sujeita a confirmação obrigatória de conteúdo, peso, preço de venda e aceitação humana. Não confundir com cotação de pacote específico.
- Resolver a rejeição indevida de preço `PCT x UN` na R14, conservando bloqueio para pacotes com quantidade interna explicitada sem fator de conversão e outras inconsistências documentadas.
- Preservar preço inserido manualmente e evitar passar preço sem origem como cotação publicada.
- Orçamento com qualquer revisão pendente passa a mostrar `TOTAL PRELIMINAR — CONFERIR` (em vez de `SEM ACESSO` em caso de embalagem).
- Rodapé institucional antes fixo com bottom negativo agora segue o fluxo, evitando cobrir a última linha na quebra de página. Impressão A4, layout azul/dourado e anexos mantidos.
- Limpeza pontual de acentos em títulos padronizados do parecer.
- R15 serve JavaScript por chave única, evitando cache antigo da R14.

## Limites explícitos
- O valor genérico sugerido pela IA não valida rendimento/marca/peso de embalagem: em rejunte, uma estimativa preliminar ainda requer conferência da embalagem e comercial.
- Se a IA não fornecer valor ou estiver fora de cota, o item continua sem preço e deve indicar pendência; sem cálculo inventado.
- Não há mudança de backend, criação de chamada paga, banco ou função duplicada.
- Os testes automáticos cobrem sintaxe, PCT / UN, revisão obrigatória e renderização HTML de PDF; a geração IA real, a impressão A4 física no Android e notebook e a qualidade documental final necessitam homologação separada.

## Regressões proibidas
Não substituir arquivos homologados, não remover bloqueio de parecer com valores, não confundir custo com venda, não presumir inspeção em foto, não aprovar preços automaticamente, não repetir custo por quantidade, não converter pacote em unidades físicas sem base.
