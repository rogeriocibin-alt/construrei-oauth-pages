-- Candidata ORÇA-REI | controle atômico, diário, para IA sem login.
-- Não aplicar em produção sem confirmação de projeto Gemini Free e revisão da governança.
-- Uma única tabela pequena no banco existente; não cria projeto, Edge ou scheduler.
create schema if not exists cr_private;
revoke all on schema cr_private from PUBLIC, anon, authenticated;
grant usage on schema cr_private to service_role;

create table if not exists cr_private.cr_orca_public_budget_v1 (
  usage_day date not null,
  bucket text not null,
  requests integer not null default 0 check (requests >= 0),
  last_request_at timestamptz not null default now(),
  primary key (usage_day, bucket)
);
revoke all on cr_private.cr_orca_public_budget_v1 from PUBLIC, anon, authenticated;
grant select, insert, update on cr_private.cr_orca_public_budget_v1 to service_role;

create or replace function public.cr_orca_public_claim_v1(p_fingerprint text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  today_utc date := (now() at time zone 'UTC')::date;
  global_count integer;
  client_count integer;
  last_client timestamptz;
  client_bucket text;
begin
  -- Apenas o backend service_role pode executar: revogação e grant explícitos abaixo.
  if p_fingerprint is null or p_fingerprint !~ '^[a-f0-9]{64}$' then
    return pg_catalog.jsonb_build_object('allowed',false,'reason','invalid_fingerprint');
  end if;

  client_bucket := 'client:' || p_fingerprint;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('orca-v1:' || today_utc::text, 0));
  select requests into global_count from cr_private.cr_orca_public_budget_v1
    where usage_day = today_utc and bucket = 'global';
  select requests, last_request_at into client_count, last_client
    from cr_private.cr_orca_public_budget_v1
    where usage_day = today_utc and bucket = client_bucket;

  if coalesce(global_count,0) >= 8 then
    return pg_catalog.jsonb_build_object('allowed',false,'reason','daily_global_quota','remaining',0);
  end if;
  if coalesce(client_count,0) >= 2 then
    return pg_catalog.jsonb_build_object('allowed',false,'reason','daily_client_quota');
  end if;
  if last_client is not null and now() - last_client < interval '60 seconds' then
    return pg_catalog.jsonb_build_object('allowed',false,'reason','cooldown');
  end if;

  insert into cr_private.cr_orca_public_budget_v1 (usage_day, bucket, requests)
    values (today_utc, 'global', 1)
    on conflict (usage_day, bucket)
    do update set requests = cr_private.cr_orca_public_budget_v1.requests+1,
      last_request_at = now();
  insert into cr_private.cr_orca_public_budget_v1 (usage_day, bucket, requests)
    values (today_utc, client_bucket, 1)
    on conflict (usage_day, bucket)
    do update set requests = cr_private.cr_orca_public_budget_v1.requests+1,
      last_request_at = now();

  return pg_catalog.jsonb_build_object('allowed',true,'remaining',7-coalesce(global_count,0));
end;
$$;
revoke all on function public.cr_orca_public_claim_v1(text) from PUBLIC, anon, authenticated;
grant execute on function public.cr_orca_public_claim_v1(text) to service_role;
comment on function public.cr_orca_public_claim_v1(text) is
  'ORÇA-REI candidata: reservar orçamento de chamadas, somente service_role, 8 globais/dia, 2/fingerprint/dia, 60s de intervalo';
