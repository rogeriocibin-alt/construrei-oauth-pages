-- FIN-CORA PR115 · candidata; NÃO executar na produção antes de testes e auditoria
-- PostgREST acessível somente pela camada server-side service role; nunca chave no navegador.
create table if not exists public.cr_cora_verified_balance_v1 (
  singleton boolean primary key default true check (singleton),
  balance_cents bigint not null check (balance_cents >= 0),
  version bigint not null default 1 check (version > 0),
  verified_on date not null,
  source text not null check (source in ('manual','api')),
  updated_at timestamptz not null default now(),
  updated_by text not null
);
create table if not exists public.cr_cora_verified_balance_audit_v1 (
  id bigint generated always as identity primary key,
  action_id uuid not null unique,
  actor text not null,
  previous_cents bigint,
  new_cents bigint not null check (new_cents>=0),
  previous_version bigint,
  new_version bigint not null,
  source text not null,
  reason text not null,
  happened_at timestamptz not null default now()
);
alter table public.cr_cora_verified_balance_v1 enable row level security;
alter table public.cr_cora_verified_balance_audit_v1 enable row level security;
revoke all on public.cr_cora_verified_balance_v1 from anon,authenticated;
revoke all on public.cr_cora_verified_balance_audit_v1 from anon,authenticated;
-- No seed: opening saldo deve ser confirmado pelo responsável; não usar valor ilustrativo.
create or replace function public.cr_cora_manual_verified_update_v1(
 p_action_id uuid,p_actor text,p_cents bigint,p_expected_version bigint,p_verified_on date,p_reason text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare cur public.cr_cora_verified_balance_v1%rowtype; next_ver bigint;
begin
 if coalesce(current_setting('request.jwt.claim.role',true),'') <> 'service_role' then
   raise exception 'SERVICE_ROLE_REQUIRED';
 end if;
 if p_actor is null or length(trim(p_actor)) < 3 or p_reason is null or length(trim(p_reason)) < 8
 or p_cents is null or p_cents < 0 or p_expected_version is null
 or p_action_id is null or p_verified_on is null then raise exception 'INVALID_INPUT'; end if;
 if exists(select 1 from public.cr_cora_verified_balance_audit_v1 where action_id=p_action_id) then
   return jsonb_build_object('ok',true,'duplicate',true);
 end if;
 select * into cur from public.cr_cora_verified_balance_v1 where singleton=true for update;
 if not found then
   if p_expected_version <> 0 then raise exception 'VERSION_CONFLICT'; end if;
   insert into public.cr_cora_verified_balance_v1(singleton,balance_cents,version,verified_on,source,updated_by)
   values(true,p_cents,1,p_verified_on,'manual',p_actor);
   next_ver:=1;
 else
   if cur.version <> p_expected_version then raise exception 'VERSION_CONFLICT'; end if;
   next_ver:=cur.version+1;
   update public.cr_cora_verified_balance_v1
     set balance_cents=p_cents,version=next_ver,verified_on=p_verified_on,
     source='manual',updated_at=now(),updated_by=p_actor where singleton=true;
 end if;
 insert into public.cr_cora_verified_balance_audit_v1(
  action_id,actor,previous_cents,new_cents,previous_version,new_version,source,reason)
 values(p_action_id,p_actor,cur.balance_cents,p_cents,cur.version,next_ver,'manual',p_reason);
 return jsonb_build_object('ok',true,'version',next_ver,'balance_cents',p_cents);
end $$;
revoke all on function public.cr_cora_manual_verified_update_v1(uuid,text,bigint,bigint,date,text) from public,anon,authenticated;
grant execute on function public.cr_cora_manual_verified_update_v1(uuid,text,bigint,bigint,date,text) to service_role;
