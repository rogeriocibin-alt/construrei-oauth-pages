/* CONSTRU-REI | Financeiro V12 | Evidencia read-only de duplicidade 2026
 * Executada em 2026-10-26 contra Supabase; nunca promove dados ao Trello.
 * Esta consulta NAO e a fonte bancaria; Cora continua sendo a fonte oficial.
 * Saida: somente codigos, classes e somas, sem descricoes ou IDs pessoais.
 */
WITH repeated AS (
 SELECT work_code, COUNT(*) AS n
 FROM public.cr_finance_2026_work_card_source_v1
 GROUP BY work_code HAVING COUNT(*) > 1
), pairs AS (
 SELECT a.work_code, a.source_card_id AS id_a, b.source_card_id AS id_b,
 a.card_state AS state_a, b.card_state AS state_b,
 a.source_list AS list_a, b.source_list AS list_b,
 a.card_title AS title_a, b.card_title AS title_b,
 a.raw_description AS description_a, b.raw_description AS description_b,
 ea.validation_state AS validation_a, eb.validation_state AS validation_b,
 ea.closed_cents AS gross_a, eb.closed_cents AS gross_b,
 ea.cost_cents AS cost_a, eb.cost_cents AS cost_b,
 ea.declared_profit_cents AS profit_a, eb.declared_profit_cents AS profit_b,
 ea.received_claim_cents AS received_a, eb.received_claim_cents AS received_b,
 r.n AS code_count
 FROM public.cr_finance_2026_work_card_source_v1 a
 JOIN public.cr_finance_2026_work_card_source_v1 b
   ON a.work_code=b.work_code AND a.source_card_id<b.source_card_id
 JOIN repeated r ON r.work_code=a.work_code
 LEFT JOIN public.cr_finance_2026_work_extract_v1 ea ON ea.source_card_id=a.source_card_id
 LEFT JOIN public.cr_finance_2026_work_extract_v1 eb ON eb.source_card_id=b.source_card_id
), checks AS (
 SELECT *,
   (state_a='OPEN' AND state_b='ARCHIVED' OR state_a='ARCHIVED' AND state_b='OPEN') AS active_and_archived,
   (validation_a='BALANCED' AND validation_b='BALANCED') AS both_balanced,
   (regexp_replace(trim(coalesce(title_a,'')), '\s+', ' ', 'g') =
    regexp_replace(trim(coalesce(title_b,'')), '\s+', ' ', 'g')
    AND length(trim(coalesce(description_a,'')))>0
    AND regexp_replace(trim(coalesce(description_a,'')), '\s+', ' ', 'g') =
        regexp_replace(trim(coalesce(description_b,'')), '\s+', ' ', 'g')) AS same_source_text,
   (gross_a IS NOT DISTINCT FROM gross_b
     AND cost_a IS NOT DISTINCT FROM cost_b
     AND profit_a IS NOT DISTINCT FROM profit_b
     AND received_a IS NOT DISTINCT FROM received_b) AS same_money,
   ((state_a='OPEN' AND validation_a='BALANCED' AND state_b='ARCHIVED' AND validation_b='INCOMPLETE'
      AND (list_b IN ('EM ANDAMENTO','AG. ACERTO') OR title_b ILIKE '%Gabrielly Criar Card%')
      AND (gross_b IS NULL OR gross_b=gross_a)
      AND (cost_b IS NULL OR cost_b=cost_a)
      AND (profit_b IS NULL OR profit_b=profit_a)
      AND (received_b IS NULL OR received_b=received_a))
    OR (state_b='OPEN' AND validation_b='BALANCED' AND state_a='ARCHIVED' AND validation_a='INCOMPLETE'
      AND (list_a IN ('EM ANDAMENTO','AG. ACERTO') OR title_a ILIKE '%Gabrielly Criar Card%')
      AND (gross_a IS NULL OR gross_a=gross_b)
      AND (cost_a IS NULL OR cost_a=cost_b)
      AND (profit_a IS NULL OR profit_a=profit_b)
      AND (received_a IS NULL OR received_a=received_b))) AS provisional_mirror,
   (work_code='9999-26' AND title_a~*'(teste|cr-qa|homologa[cç][aã]o)'
       AND title_b~*'(teste|cr-qa|homologa[cç][aã]o)') AS both_qa,
   (state_a='OPEN' AND state_b='OPEN'
     AND validation_a='BALANCED' AND validation_b='BALANCED'
     AND (title_a ILIKE '%aditivo%' OR title_b ILIKE '%aditivo%')) AS addendum_pair
 FROM pairs
), classifications AS (
 SELECT work_code,id_a,id_b,code_count,
 CASE
   WHEN code_count<>2 THEN 'REVIEW_REQUIRED'
   WHEN both_qa THEN 'TEST_ONLY_EXCLUDED'
   WHEN active_and_archived AND both_balanced AND same_source_text AND same_money THEN 'EXACT_ARCHIVED_COPY'
   WHEN provisional_mirror THEN 'PROVISIONAL_ARCHIVED_MIRROR'
   WHEN addendum_pair THEN 'REVIEW_DISTINCT_ADDITIVE'
   ELSE 'REVIEW_REQUIRED'
 END AS classification,
 CASE WHEN code_count=2 AND active_and_archived AND both_balanced AND same_source_text AND same_money
   THEN CASE WHEN state_a='ARCHIVED' THEN gross_a ELSE gross_b END ELSE 0 END AS excluded_duplicate_gross_cents
 FROM checks
)
SELECT work_code,classification,
 COUNT(*) AS pair_count,
 COALESCE(SUM(excluded_duplicate_gross_cents),0) AS potential_duplicate_gross_cents
FROM classifications
GROUP BY work_code,classification ORDER BY work_code;
