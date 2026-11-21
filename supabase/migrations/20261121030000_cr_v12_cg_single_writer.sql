-- CONSTRU-REI V12: monthly delta once per committed period. Capital de Giro GLOBAL is a single-writer ABSOLUTE ledger handled by cr-trello-capital-giro-v1. Do NOT add CG credit in this function.
CREATE OR REPLACE FUNCTION public.cr_finance_v12_consolidate_committed(p_period_key text, p_base_cents bigint, p_cost_cents bigint, p_profit_cents bigint, p_capital_cents bigint, p_osvaldo_cents bigint, p_work_count integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
 v_registry public.cr_finance_2026_period_send_registry_v12%ROWTYPE;
 v_month_key text;
 v_month public.cr_finance_2026_monthly_source_snapshots%ROWTYPE;
 v_cg public.cr_working_capital_state_v1%ROWTYPE;
 v_cg_period public.cr_working_capital_periods_v1%ROWTYPE;
 v_existing public.cr_finance_v12_consolidation_ledger_v1%ROWTYPE;
 v_gross bigint; v_cost bigint; v_profit bigint;
 v_cg_generated numeric; v_cg_balance numeric;
 v_annual_gross bigint; v_annual_cost bigint; v_annual_profit bigint;
 v_marker text;
BEGIN
 IF p_period_key !~ '^2026-(0[1-9]|1[0-2])-[0-3][0-9]_2026-(0[1-9]|1[0-2])-[0-3][0-9]$'
  OR split_part(p_period_key,'_',1)>split_part(p_period_key,'_',2)
  OR p_work_count NOT BETWEEN 1 AND 40 OR p_base_cents<=0
  OR p_cost_cents<0 OR p_base_cents-p_cost_cents<>p_profit_cents
  OR p_capital_cents<0 OR p_osvaldo_cents<0 OR p_capital_cents+p_osvaldo_cents>p_profit_cents
 THEN RAISE EXCEPTION 'INVALID_CONSOLIDATION_INPUT'; END IF;
 v_month_key:=left(split_part(p_period_key,'_',2),7);
 v_marker:='CR-FINANCE-SYNC-V12|'||p_period_key||'|COMMITTED';

 SELECT * INTO v_registry FROM public.cr_finance_2026_period_send_registry_v12
 WHERE period_key=p_period_key AND status='COMMITTED';
 IF NOT FOUND OR coalesce(v_registry.month_card_id,'')='' THEN
   RAISE EXCEPTION 'PERIOD_NOT_COMMITTED'; END IF;

 -- A CG credit already exists before any consolidation. Do not create a second credit.
 SELECT * INTO v_cg_period FROM public.cr_working_capital_periods_v1 WHERE period_key=p_period_key;
 IF NOT FOUND OR v_cg_period.status<>'ACTIVE' OR
    round(v_cg_period.capital_generated*100)::bigint<>p_capital_cents THEN
   RAISE EXCEPTION 'CG_PERIOD_NOT_RECONCILED'; END IF;

 SELECT * INTO v_existing FROM public.cr_finance_v12_consolidation_ledger_v1
 WHERE period_key=p_period_key FOR UPDATE;
 IF FOUND THEN
   IF v_existing.base_cents<>p_base_cents OR v_existing.cost_cents<>p_cost_cents
    OR v_existing.profit_cents<>p_profit_cents OR v_existing.capital_cents<>p_capital_cents
    OR v_existing.osvaldo_cents<>p_osvaldo_cents OR v_existing.work_count<>p_work_count
    OR v_existing.month_card_id<>v_registry.month_card_id THEN
      RAISE EXCEPTION 'PERIOD_LEDGER_FINGERPRINT_MISMATCH'; END IF;
 ELSE
   SELECT * INTO v_month FROM public.cr_finance_2026_monthly_source_snapshots
    WHERE year_month=v_month_key FOR UPDATE;
   IF NOT FOUND OR v_month.source_status NOT IN ('DECLARED_UNRECONCILED','OPEN_UNCONFIRMED')
    OR position(v_marker IN coalesce(v_month.notes,''))>0 THEN
     RAISE EXCEPTION 'MONTH_SOURCE_ALREADY_UPDATED_OR_NOT_READY'; END IF;
   SELECT * INTO v_cg FROM public.cr_working_capital_state_v1
    WHERE state_key='GLOBAL' FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'CG_GLOBAL_MISSING'; END IF;
   IF EXISTS (SELECT 1 FROM jsonb_array_elements_text(coalesce(v_cg.metadata->'synced_period_keys','[]'::jsonb)) e(value)
      WHERE e.value=p_period_key) THEN RAISE EXCEPTION 'CG_ALREADY_COUNTED'; END IF;

   v_gross:=coalesce(v_month.gross_cents,0)+p_base_cents;
   v_cost:=coalesce(v_month.costs_cents,0)+p_cost_cents;
   v_profit:=coalesce(v_month.declared_profit_cents,0)+p_profit_cents;
   UPDATE public.cr_finance_2026_monthly_source_snapshots
    SET gross_cents=v_gross,costs_cents=v_cost,declared_profit_cents=v_profit,
        source_status='DECLARED_UNRECONCILED',
        observed_cutoff=split_part(p_period_key,'_',2)::date,
        notes=coalesce(notes,'')||E'\n'||v_marker||' | '||
          p_work_count||' obras, base '||p_base_cents||', custos '||p_cost_cents||
          ', lucro '||p_profit_cents||', CG '||p_capital_cents||', Osvaldo '||p_osvaldo_cents||
          '. Rateios apurados, PIX não comprovados automaticamente.'
    WHERE year_month=v_month_key;

   -- CG global is reconciled ABSOLUTELY from Trello period cards by
   -- cr-trello-capital-giro-v1. Never add the newly created credit again.
   -- This RPC only books the monthly financial delta once per period_key.
   -- A separate CG reconciliation must succeed before marking Trello SYNCED.

   INSERT INTO public.cr_finance_v12_consolidation_ledger_v1(
    period_key,month_key,month_card_id,base_cents,cost_cents,profit_cents,
    capital_cents,osvaldo_cents,work_count,trello_state)
    VALUES (p_period_key,v_month_key,v_registry.month_card_id,p_base_cents,p_cost_cents,
     p_profit_cents,p_capital_cents,p_osvaldo_cents,p_work_count,'PENDING');
 END IF;

 SELECT gross_cents,costs_cents,declared_profit_cents
 INTO v_gross,v_cost,v_profit FROM public.cr_finance_2026_monthly_source_snapshots WHERE year_month=v_month_key;
 SELECT capital_generated,real_balance
 INTO v_cg_generated,v_cg_balance FROM public.cr_working_capital_state_v1 WHERE state_key='GLOBAL';
 SELECT sum(gross_cents),sum(costs_cents),sum(declared_profit_cents)
 INTO v_annual_gross,v_annual_cost,v_annual_profit FROM public.cr_finance_2026_monthly_source_snapshots
 WHERE year_month LIKE '2026-%' AND source_status='DECLARED_UNRECONCILED';
 RETURN jsonb_build_object('ok',true,'already_applied',v_existing.period_key IS NOT NULL,
  'period_key',p_period_key,'month_key',v_month_key,'month_card_id',v_registry.month_card_id,
  'monthly',jsonb_build_object('gross_cents',v_gross,'costs_cents',v_cost,'profit_cents',v_profit),
  'annual',jsonb_build_object('gross_cents',v_annual_gross,'costs_cents',v_annual_cost,'profit_cents',v_annual_profit),
  'capital',jsonb_build_object('generated_cents',round(v_cg_generated*100)::bigint,'balance_cents',round(v_cg_balance*100)::bigint),
  'trello_state',(SELECT trello_state FROM public.cr_finance_v12_consolidation_ledger_v1 WHERE period_key=p_period_key));
END
$function$;
