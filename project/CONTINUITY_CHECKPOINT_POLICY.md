# CONSTRU-REI — REGRA PÉTREA DE CONTINUIDADE E CHECKPOINTS

Status: CANÔNICA / OBRIGATÓRIA
Vigência: 2026-10-06

## Objetivo
Impedir perda de contexto, decisões, histórico, estado técnico, links, commits, pendências e próximos passos em conversas longas por texto ou voz.

## Regra pétrea
Durante qualquer execução longa do projeto CONSTRU-REI, deve existir checkpoint de continuidade **no máximo a cada 10 minutos de trabalho ativo**.

O checkpoint também é obrigatório, independentemente do intervalo, nos seguintes gatilhos:
1. antes de encerrar ou interromper uma chamada/conversa;
2. quando houver risco de queda, limite de voz, troca de dispositivo ou troca de sessão;
3. antes e depois de mudança crítica em produção;
4. ao mudar de fase, frente ou prioridade;
5. ao homologar, promover, congelar ou fazer rollback;
6. após decisão canônica do Rogério;
7. quando houver nova dependência, link, commit, regra, ativo visual ou arquitetura relevante.

## Conteúdo mínimo do checkpoint
Cada checkpoint deve registrar:
- data/hora BRT;
- versão/link canônico ativo;
- o que foi concluído e validado;
- o que ainda está pendente;
- decisões tomadas;
- commits/branches/checkpoints relevantes;
- riscos ou bugs conhecidos;
- próxima ação exata;
- regra antirregressão aplicável.

## Fonte de verdade
A continuidade operacional deve ser registrada em:
- `docs/CONSTRUREI_CURRENT_STATE.md`

Documentos específicos de governança podem complementar o registro, mas não substituem a atualização do estado atual.

## Voz e texto
A regra é idêntica para conversas por voz e por texto. O formato da conversa não altera a obrigação de checkpoint.

## Limite técnico
Esta é uma regra operacional do projeto, não um cron automático externo. Ela deve ser aplicada durante a execução ativa e reforçada nos gatilhos acima.

## Autoridade
Rogério é a autoridade humana Master para alterar esta regra.

