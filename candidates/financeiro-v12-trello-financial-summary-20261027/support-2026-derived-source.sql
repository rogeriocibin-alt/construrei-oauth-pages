-- CONSTRU-REI V12 - Fonte auditável dos APOIOS / DIÁRIAS 2026.
-- A fonte existente não está conciliada com banco; VIEW sem novas despesas.
-- Coluna amount_cents derivada de valor informado na linha, se ausente no estágio.
-- 2023 permanece SOMENTE Cora; 2024/2025 conservam suas regras históricas.
create or replace view public.cr_finance_v12_support_2026_source
with (security_invoker = true)
as
with canonical_cards as (
 select source_card_id, work_code, source_url, source_last_activity,
        last_synced_at, card_state,
        row_number() over (
          partition by work_code
          order by (card_state='OPEN') desc, source_last_activity desc nulls last, source_card_id
        ) as canonical_number
 from public.cr_finance_2026_work_card_source_v1
 where work_code ~ '^[0-9]{1,5}-26$'
),
raw_support as (
 select c.work_code, c.source_card_id, c.source_url, c.source_last_activity, c.last_synced_at,
        l.line_number, l.line_text, l.classification, l.amount_cents as imported_amount_cents,
        translate(lower(l.line_text),'áàâãéêíóôõúüç','aaaaeeiooouuc') as normalized_line,
        regexp_match(l.line_text,'R\$\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{2})?)','i') as raw_amount
 from public.cr_finance_2026_acerto_lines_v1 l
 join canonical_cards c on c.source_card_id=l.source_card_id and c.canonical_number=1
 where l.line_kind='COST_NOTE'
 and translate(lower(l.line_text),'áàâãéêíóôõúüç','aaaaeeiooouuc') ~ '(diaria|apoio)'
 and translate(lower(l.line_text),'áàâãéêíóôõúüç','aaaaeeiooouuc') !~ '(total de (apoio|diaria)|subtotal|estorno)'
),
normalized as (
 select r.*,
        coalesce(r.imported_amount_cents,
          case when r.raw_amount is not null
          then round(replace(replace(r.raw_amount[1],'.',''),',','.')::numeric*100)::bigint
          else null end
        ) as parsed_amount_cents,
        case
          when r.normalized_line ~ '\meder\M' then 'Éder'
          when r.normalized_line ~ '\mfabricio\M' then 'Fabrício'
          when r.normalized_line ~ '\mjoao\M' and r.normalized_line ~ '\mvictor\M' then 'João Victor'
          when r.normalized_line ~ '\mjoao\M' then 'João (identificação a confirmar)'
          when r.normalized_line ~ '\mronald(y|y)?\M' then 'Ronald / Ronaldy'
          when r.normalized_line ~ '\mbrutinho\M' then 'Brutinho'
          when r.normalized_line ~ '\meros\M' then 'Eros'
          when r.normalized_line ~ '\mpolaco\M' then 'Polaco'
          when r.normalized_line ~ '\mjhow\M' then 'Jhow'
          when r.normalized_line ~ '\mjosimar\M' then 'Josimar'
          else 'Outro prestador (identificar)'
        end as beneficiary,
        case when r.normalized_line ~ '\m(diaria)\M' then 'DIARIA' else 'APOIO' end as payment_kind
 from raw_support r
)
select work_code, source_card_id, source_url, line_number, line_text,
       payment_kind, beneficiary,
       parsed_amount_cents as amount_cents,
       imported_amount_cents,
       case
         when parsed_amount_cents is null or parsed_amount_cents<=0 then 'AMOUNT_MISSING'
         when beneficiary like '%confirmar%' or beneficiary like 'Outro%' then 'BENEFICIARY_REVIEW'
         else 'TRELLO_COST_LINE_UNRECONCILED'
       end as evidence_state,
       'TRELLO_OPERATIONAL_COST_ENTRY'::text as source_kind,
       'NOT_CORA_BANK_WITHDRAWAL_PROOF'::text as payment_confirmation,
       source_last_activity, last_synced_at
from normalized;
revoke all on public.cr_finance_v12_support_2026_source from public, anon, authenticated;
grant select on public.cr_finance_v12_support_2026_source to service_role;
