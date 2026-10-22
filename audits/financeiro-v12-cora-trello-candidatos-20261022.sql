-- CONSTRU-REI | Auditoria Cora x Trello | Edição 2, 22/10/2026.
-- SOMENTE LEITURA: sem INSERT/UPDATE/DELETE, sem escrita no Trello, sem rateio automático.
-- Banco Cora: source_id imutável; competência bancária UTC.
-- Regex com limites NÃO consumidores: captura inclusive códigos adjacentes
-- "768-26 726-26 775-26", que a regex com prefixo/sufixo consumidores omitia.
-- A contagem de códigos é DISTINTA por ID de transação, evitando duplicação.
WITH bank AS (
 SELECT m.source_id,m.occurred_at,m.amount_centavos,m.direction,
        m.transaction_type,coalesce(m.description,'') AS description
 FROM cora_cache.movements m
), codes AS (
 SELECT b.source_id, array_agg(distinct m[1]||'-'||m[2] order by m[1]||'-'||m[2]) AS case_codes
 FROM bank b CROSS JOIN LATERAL
 regexp_matches(b.description,'(?<![0-9])([0-9]{2,5})-(24|25|26)(?![0-9])','g') AS m
 GROUP BY b.source_id
), classified AS (
 SELECT b.source_id,date_trunc('year',b.occurred_at)::date AS year_utc,
        b.direction,b.transaction_type,b.amount_centavos,
        coalesce(array_length(c.case_codes,1),0) AS n_cases,
        c.case_codes,
        CASE WHEN coalesce(array_length(c.case_codes,1),0)>1 THEN 'MULTIPLAS_OBRAS_SEM_RATEIO'
             WHEN coalesce(array_length(c.case_codes,1),0)=1 THEN 'UMA_OBRA_CANDIDATA_NAO_CONCILIADA'
             WHEN btrim(b.description)='' THEN 'SEM_DESCRICAO'
             WHEN b.description ILIKE '%obra%' THEN 'OBRA_SEM_IDENTIFICADOR'
             ELSE 'SEM_IDENTIFICADOR'
        END AS status
 FROM bank b LEFT JOIN codes c USING(source_id)
)
SELECT year_utc,status,count(*) AS movimentos,
       count(distinct source_id) AS ids_unicos,
       sum(case when direction='debit' then amount_centavos else 0 end) AS debitos_centavos,
       count(*) FILTER(WHERE transaction_type='CARD') AS movimentos_tipo_card
FROM classified GROUP BY year_utc,status ORDER BY year_utc,status;

-- Consulta detalhada para auditoria de conflitos (sem revelar dados em massa por default):
-- SELECT b.source_id,b.occurred_at,b.amount_centavos,b.direction,c.case_codes
-- FROM cora_cache.movements b
-- CROSS JOIN LATERAL (SELECT array_agg(distinct m[1]||'-'||m[2]) AS case_codes
--                    FROM regexp_matches(coalesce(b.description,''),
--                    '(?<![0-9])([0-9]{2,5})-(24|25|26)(?![0-9])','g') m) c
-- WHERE array_length(c.case_codes,1)>1 ORDER BY b.occurred_at DESC LIMIT 100;
--
-- Prova bilateral Trello: numero da obra + data local + centavos + direção +
-- ID bancário comprovado no card + operação idempotente. Valor isolado é apenas
-- EVIDENCIA_CANDIDATA, nunca CONFIRMADO_COM_EVIDENCIA.
