-- CONSTRU-REI Financeiro V12: registro idempotente de fechamento por corte.
-- Somente semântica de orquestração; nenhum pagamento ou lançamento financeiro.
CREATE TABLE IF NOT EXISTS public.cr_finance_2026_period_send_registry_v12 (
  period_key text PRIMARY KEY CHECK (period_key ~ '^2026-[0-9]{2}-[0-9]{2}_2026-[0-9]{2}-[0-9]{2}$'),
  fingerprint text NOT NULL CHECK (fingerprint ~ '^[0-9a-f]{64}$'),
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','CG_RECORDED','MONTH_RECORDED','PARTIAL','COMMITTED','REVIEW_REQUIRED')),
  month_card_id text CHECK (month_card_id IS NULL OR month_card_id ~ '^[0-9a-f]{24}$'),
  capital_card_url text CHECK (capital_card_url IS NULL OR length(capital_card_url)<=500),
  error_code text CHECK (error_code IS NULL OR length(error_code)<=160),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cr_finance_2026_period_send_registry_v12 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cr_finance_2026_period_send_registry_v12 FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.cr_finance_v12_period_claim(p_period_key text,p_fingerprint text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp
AS $$
DECLARE v public.cr_finance_2026_period_send_registry_v12%ROWTYPE;
BEGIN
 IF p_period_key !~ '^2026-[0-9]{2}-[0-9]{2}_2026-[0-9]{2}-[0-9]{2}$'
    OR p_fingerprint !~ '^[0-9a-f]{64}$' THEN
   RETURN jsonb_build_object('ok',false,'error','PERIOD_CLAIM_INVALID');
 END IF;
 INSERT INTO public.cr_finance_2026_period_send_registry_v12(period_key,fingerprint)
 VALUES(p_period_key,p_fingerprint)
 ON CONFLICT DO NOTHING RETURNING * INTO v;
 IF FOUND THEN RETURN jsonb_build_object('ok',true,'claimed',true,'status',v.status); END IF;
 SELECT * INTO v FROM public.cr_finance_2026_period_send_registry_v12 WHERE period_key=p_period_key;
 RETURN jsonb_build_object('ok',false,'claimed',false,'error','PERIOD_ALREADY_RESERVED_REVIEW',
 'status',v.status,'fingerprint_matches',v.fingerprint=p_fingerprint);
END; $$;

CREATE OR REPLACE FUNCTION public.cr_finance_v12_period_checkpoint(
 p_period_key text,p_fingerprint text,p_status text,
 p_month_card_id text DEFAULT NULL,p_capital_card_url text DEFAULT NULL,p_error_code text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp
AS $$
DECLARE v public.cr_finance_2026_period_send_registry_v12%ROWTYPE;
BEGIN
 IF p_status NOT IN ('CG_RECORDED','MONTH_RECORDED','PARTIAL','COMMITTED','REVIEW_REQUIRED')
 OR (p_month_card_id IS NOT NULL AND p_month_card_id !~ '^[0-9a-f]{24}$')
 OR length(coalesce(p_error_code,''))>160 THEN
  RETURN jsonb_build_object('ok',false,'error','PERIOD_CHECKPOINT_INVALID');
 END IF;
 SELECT * INTO v FROM public.cr_finance_2026_period_send_registry_v12
 WHERE period_key=p_period_key AND fingerprint=p_fingerprint FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','PERIOD_REGISTRY_NOT_FOUND'); END IF;
 IF v.status='COMMITTED' AND p_status='COMMITTED' THEN
  RETURN jsonb_build_object('ok',true,'status','COMMITTED','idempotent',true);
 END IF;
 IF NOT (
 (v.status='PENDING' AND p_status IN ('CG_RECORDED','MONTH_RECORDED','REVIEW_REQUIRED'))
 OR (v.status='CG_RECORDED' AND p_status IN ('MONTH_RECORDED','REVIEW_REQUIRED'))
 OR (v.status='MONTH_RECORDED' AND p_status IN ('PARTIAL','COMMITTED','REVIEW_REQUIRED'))
 OR (v.status='PARTIAL' AND p_status IN ('COMMITTED','REVIEW_REQUIRED'))
 ) THEN
  RETURN jsonb_build_object('ok',false,'error','PERIOD_TRANSITION_DENIED','status',v.status);
 END IF;
 UPDATE public.cr_finance_2026_period_send_registry_v12
 SET status=p_status,
  month_card_id=coalesce(p_month_card_id,month_card_id),
  capital_card_url=coalesce(p_capital_card_url,capital_card_url),
  error_code=left(p_error_code,160),updated_at=now()
 WHERE period_key=p_period_key AND fingerprint=p_fingerprint;
 RETURN jsonb_build_object('ok',true,'status',p_status);
END; $$;

REVOKE ALL ON FUNCTION public.cr_finance_v12_period_claim(text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.cr_finance_v12_period_checkpoint(text,text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cr_finance_v12_period_claim(text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cr_finance_v12_period_checkpoint(text,text,text,text,text,text) TO service_role;
