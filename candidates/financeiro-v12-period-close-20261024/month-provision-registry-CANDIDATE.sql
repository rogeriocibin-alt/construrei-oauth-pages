-- CANDIDATE ONLY / NOT APPLIED. Reviewed schema is required before enabling month creation.
-- No transfer, cost, CG debit, or historical Trello mutation is performed by these RPCs.
create table if not exists public.cr_finance_2026_month_registry_v1 (
 year_month text primary key check (year_month ~ '^2026-(0[1-9]|1[0-2])$'),
 fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
 status text not null default 'PENDING' check (status in ('PENDING','COMMITTED','REVIEW_REQUIRED')),
 card_id text check (card_id is null or card_id ~ '^[0-9a-f]{24}$'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.cr_finance_2026_month_registry_v1 enable row level security;
revoke all on public.cr_finance_2026_month_registry_v1 from public, anon, authenticated;

create or replace function public.cr_finance_2026_month_claim(p_year_month text,p_fingerprint text)
returns jsonb language plpgsql security definer set search_path = public,pg_temp
as $$
declare v public.cr_finance_2026_month_registry_v1%rowtype;
begin
 if p_year_month !~ '^2026-(0[1-9]|1[0-2])$' or p_fingerprint !~ '^[0-9a-f]{64}$'
 then return jsonb_build_object('ok',false,'error','MONTH_CLAIM_INVALID'); end if;
 insert into public.cr_finance_2026_month_registry_v1(year_month,fingerprint)
 values(p_year_month,p_fingerprint) on conflict do nothing returning * into v;
 if found then return jsonb_build_object('ok',true,'claimed',true,'status','PENDING'); end if;
 select * into v from public.cr_finance_2026_month_registry_v1 where year_month=p_year_month;
 return jsonb_build_object('ok',true,'claimed',false,'status',v.status,'card_id',v.card_id);
end; $$;

create or replace function public.cr_finance_2026_month_finish(
 p_year_month text,p_fingerprint text,p_card_id text,p_status text
) returns jsonb language plpgsql security definer set search_path = public,pg_temp
as $$
declare v public.cr_finance_2026_month_registry_v1%rowtype;
begin
 if p_year_month !~ '^2026-(0[1-9]|1[0-2])$' or p_fingerprint !~ '^[0-9a-f]{64}$'
  or p_status not in ('COMMITTED','REVIEW_REQUIRED')
  or (p_card_id is not null and p_card_id !~ '^[0-9a-f]{24}$')
  or (p_status='COMMITTED' and p_card_id is null)
 then return jsonb_build_object('ok',false,'error','MONTH_FINISH_INVALID'); end if;
 update public.cr_finance_2026_month_registry_v1
 set status=p_status,card_id=coalesce(p_card_id,card_id),updated_at=now()
 where year_month=p_year_month and fingerprint=p_fingerprint and status='PENDING'
 returning * into v;
 if not found then
  select * into v from public.cr_finance_2026_month_registry_v1
   where year_month=p_year_month and fingerprint=p_fingerprint;
  if not found then return jsonb_build_object('ok',false,'error','MONTH_CLAIM_NOT_FOUND'); end if;
  return jsonb_build_object('ok',v.status=p_status and
   (p_card_id is null or v.card_id=p_card_id),'status',v.status,'card_id',v.card_id);
 end if;
 return jsonb_build_object('ok',true,'status',v.status,'card_id',v.card_id);
end; $$;

-- SECURITY DEFINER functions in public must not be callable by ordinary clients.
revoke all on function public.cr_finance_2026_month_claim(text,text) from public, anon, authenticated;
revoke all on function public.cr_finance_2026_month_finish(text,text,text,text) from public, anon, authenticated;
grant execute on function public.cr_finance_2026_month_claim(text,text) to service_role;
grant execute on function public.cr_finance_2026_month_finish(text,text,text,text) to service_role;
