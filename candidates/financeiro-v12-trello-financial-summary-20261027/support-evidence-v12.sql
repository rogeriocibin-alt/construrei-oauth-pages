-- CONSTRU-REI FINANCEIRO V12 — evidências de apoios e diárias
-- ONLY read-only projection of imported 2026 Trello COST_NOTE lines.
-- It does not constitute a new cost, bank movement, or proof of payout.
-- Identical lines from multiple imported cards are deduplicated; malformed rows remain visible.
create or replace view public.cr_finance_support_evidence_v12
with (security_invoker = true, security_barrier = true)
as
with src as (
 select work_code, line_number, btrim(line_text) as line_text, amount_cents,
        source_card_id, imported_at
 from public.cr_finance_2026_acerto_lines_v1
 where line_kind = 'COST_NOTE'
 and (line_text ~* 'apoio|di[aá]ria')
 and classification <> 'SUPPORT_RECAP_UNVERIFIED_NO_NEW_COST'
),
unique_lines as (
 select work_code,line_number,line_text,amount_cents,
        count(*)::integer as duplicate_import_count,
        array_agg(distinct source_card_id) as source_card_ids,
        max(imported_at) as source_imported_at
 from src
 group by work_code,line_number,line_text,amount_cents
),
classified as (
 select *,
 case
  when line_text ~* '(fabri|fábr|fabr)' then 'FABRICIO'
  when line_text ~* '([Éé]der|[Ee]der)' then 'EDER'
  when line_text ~* '[Jj]o[aã]o[[:space:]]+[Vv]ictor' then 'JOAO_VICTOR'
  when line_text ~* '[Jj]o[aã]o' then 'JOAO_IDENTIDADE_PENDENTE'
  when line_text ~* '([Rr]onaldy|[Rr]onald)' then 'RONALD_IDENTIDADE_PENDENTE'
  when line_text ~* '[Ee]ros' then 'EROS'
  when line_text ~* '[Bb]ia' then 'BIA_IDENTIDADE_PENDENTE'
  when line_text ~* '[Bb]rutinho' then 'BRUTINHO'
  when line_text ~* '[Pp]olaco' then 'POLACO'
  when line_text ~* '[Rr]afa' then 'RAFA_IDENTIDADE_PENDENTE'
  when line_text ~* '[Mm]arcelo' then 'MARCELO'
  when line_text ~* '[Gg]abriel' then 'GABRIEL_IDENTIDADE_PENDENTE'
  else 'BENEFICIARIO_NAO_IDENTIFICADO'
 end as beneficiary_key,
 case when line_text ~* 'apoio' then 'APOIO' else 'DIARIA' end as support_kind
 from unique_lines
)
select work_code,line_number,line_text,amount_cents,
       beneficiary_key,support_kind,duplicate_import_count,source_card_ids,source_imported_at,
       case
        when amount_cents is null or amount_cents <= 0 then 'VALOR_INCOMPLETO'
        when beneficiary_key like '%PENDENTE' or beneficiary_key='BENEFICIARIO_NAO_IDENTIFICADO' then 'IDENTIDADE_PENDENTE'
        when duplicate_import_count>1 then 'IMPORTACAO_DUPLICADA_COLAPSADA'
        else 'EVIDENCIA_TEXTUAL_NAO_CONCILIADA'
       end as evidence_status,
       case when amount_cents>0 and beneficiary_key not like '%PENDENTE'
                 and beneficiary_key<>'BENEFICIARIO_NAO_IDENTIFICADO'
            then amount_cents else null end as separately_identified_cents
from classified;

revoke all on public.cr_finance_support_evidence_v12 from PUBLIC, anon, authenticated;
grant select on public.cr_finance_support_evidence_v12 to service_role;

comment on view public.cr_finance_support_evidence_v12 is
'Read-only, duplicate-aware 2026 imported Trello support/daily evidence. No bank payment proof, no extra costs. All unverified; user must not use sums as confirmed payments.';
