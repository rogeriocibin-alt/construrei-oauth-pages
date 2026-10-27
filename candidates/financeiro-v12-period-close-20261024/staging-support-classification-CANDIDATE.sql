-- CONSTRU-REI | V12 staging pós-importação | CANDIDATE, 2026-10-26
-- Aplicar somente depois de importar os textos de origem ao staging.
-- Não modifica Trello, Cora, fechamento, rateio real, custos agregados ou CG.
-- Nunca somar valores COST_NOTE deste staging como pagamentos/custos reais.
BEGIN;
WITH matched AS MATERIALIZED (
 SELECT source_card_id,line_number
 FROM public.cr_finance_2026_acerto_lines_v1
 WHERE line_kind='RATEIO_OR_ACERTO'
   AND line_text ~* '(apoio|di[aá]ria)'
   AND line_text !~* '(rateio|lucro|retirada)'
), changed AS (
 UPDATE public.cr_finance_2026_acerto_lines_v1 t
 SET line_kind='COST_NOTE',
     classification='SUPPORT_TEXT_UNVERIFIED_NO_NEW_COST'
 FROM matched m
 WHERE t.source_card_id=m.source_card_id AND t.line_number=m.line_number
 RETURNING t.work_code,t.line_number
)
SELECT count(*) AS explicit_support_reclassified FROM changed;

-- Recapitulação informativa 727-26, sem segundo custo: requer título anterior
-- APOIO / DIÁRIAS e ocorrência de Apoio Éder já documentada no mesmo cartão.
WITH matched AS MATERIALIZED (
 SELECT l.source_card_id,l.line_number
 FROM public.cr_finance_2026_acerto_lines_v1 l
 WHERE l.work_code='727-26' AND l.line_kind='RATEIO_OR_ACERTO'
   AND l.line_text ~* '^[[:space:]]*(Éder|Eder)[[:space:]]*:[[:space:]]*R\$[[:space:]]*150,00[[:space:]]*$'
   AND l.amount_cents=15000
   AND (SELECT s.line_text FROM public.cr_finance_2026_acerto_lines_v1 s
        WHERE s.source_card_id=l.source_card_id AND s.line_number<l.line_number
          AND s.line_text ~* '(APOIO[[:space:]]*/[[:space:]]*DI[AÁ]RIAS|RATEIO DO LUCRO|RATEIO DE LUCRO|CAPITAL DE GIRO|FECHAMENTO DA OBRA)'
        ORDER BY s.line_number DESC LIMIT 1)
       ~* '^APOIO[[:space:]]*/[[:space:]]*DI[AÁ]RIAS'
   AND EXISTS (SELECT 1 FROM public.cr_finance_2026_acerto_lines_v1 prior
      WHERE prior.source_card_id=l.source_card_id
        AND prior.line_number<l.line_number
        AND prior.line_text ~* '(apoio[[:space:]]+(eder|éder)|(eder|éder)[[:space:]]+apoio)'
        AND prior.amount_cents=l.amount_cents)
), changed AS (
 UPDATE public.cr_finance_2026_acerto_lines_v1 t
 SET line_kind='COST_NOTE',
     classification='SUPPORT_RECAP_UNVERIFIED_NO_NEW_COST'
 FROM matched m
 WHERE t.source_card_id=m.source_card_id AND t.line_number=m.line_number
 RETURNING t.work_code,t.line_number
)
SELECT count(*) AS informative_recaps_reclassified FROM changed;
COMMIT;

-- Pós-prova sugerida: 0 candidatos mal classificados e nenhum valor alterado.
SELECT count(*) AS support_still_misclassified
FROM public.cr_finance_2026_acerto_lines_v1
WHERE line_kind='RATEIO_OR_ACERTO' AND line_text ~* '(apoio|di[aá]ria)'
  AND line_text !~* '(rateio|lucro|retirada)';
