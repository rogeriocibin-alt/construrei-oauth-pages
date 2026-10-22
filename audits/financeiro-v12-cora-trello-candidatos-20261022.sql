-- CONSTRU-REI V12 — classificação SOMENTE LEITURA das movimentações Cora por evidência de obra.
-- Proibido usar este resultado para gravar no Trello ou reabrir obra/alterar saldos.
-- Competência Cora em UTC (de acordo com os resumos bancários e o release V12).
-- "IDENTIFICADOR_NO_TEXTO" é CANDIDATO, não é transação conciliada.
-- "CARD" identifica a tipologia do lançamento no extrato de conta; não prova compra em fatura de crédito.
WITH movimentos AS (
 SELECT source_id,occurred_at,amount_centavos,direction,description,transaction_type,
  regexp_match(coalesce(description,''), '(^|[^0-9])([0-9]{2,5})-(24|25|26)([^0-9]|$)') AS match_obra
 FROM cora_cache.movements
), classificados AS (
 SELECT source_id, date_trunc('year',occurred_at)::date AS ano_utc,
  CASE WHEN match_obra IS NOT NULL THEN 'IDENTIFICADOR_NO_TEXTO'
       WHEN coalesce(description,'') ILIKE '%obra%' THEN 'MENCAO_OBRA_SEM_NUMERO'
       WHEN nullif(btrim(description),'') IS NULL THEN 'DESCRICAO_VAZIA'
       ELSE 'SEM_IDENTIFICADOR_DE_OBRA'
  END AS classe,
  CASE WHEN match_obra IS NOT NULL THEN match_obra[2]||'-'||match_obra[3] ELSE NULL END AS numero_candidato,
  transaction_type
 FROM movimentos
)
SELECT ano_utc,classe,count(*) AS movimentos,
 count(DISTINCT source_id) AS ids_unicos,
 count(DISTINCT numero_candidato) AS obras_candidatas_unicas,
 count(*) FILTER (WHERE transaction_type='CARD') AS extrato_tipo_card
FROM classificados
GROUP BY ano_utc,classe
ORDER BY ano_utc,classe;

-- Atribuição automática a cards deve exigir trilha explícita no Trello: 
-- 1) número exato da obra, 2) direção, data e centavos, 
-- 3) id bancário/recibo no card, 4) card único, 5) confirmação de idempotência.
-- Não basta correspondência de valor ou nome. Não comparar duplicadamente compra de cartão com pagamento da fatura.
