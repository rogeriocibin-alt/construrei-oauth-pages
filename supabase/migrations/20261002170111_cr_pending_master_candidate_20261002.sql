-- CONSTRU-REI Pendencias Vivas V3 candidate
-- Isolated candidate storage. No production router promotion.
begin;

create table if not exists public.cr_pending_master_candidate_20261002 (
  pending_id uuid primary key default gen_random_uuid(),
  request_id uuid null,
  budget_code text null,
  title text not null,
  description text not null default '',
  category text not null default 'OPERACIONAL',
  source_system text not null default 'MANUAL',
  source_ref text null,
  source_url text null,
  client_name text null,
  responsible text null,
  status text not null default 'ABERTO'
    check (status in ('ABERTO','EM_ANDAMENTO','BLOQUEADO','AGUARDANDO_TERCEIRO','AGENDADO','AMANHA','CONCLUIDO')),
  priority text not null default 'P2'
    check (priority in ('P0','P1','P2','P3')),
  blocked boolean not null default false,
  block_reason text not null default '',
  next_action text not null default '',
  next_action_source text not null default '',
  next_action_responsible text null,
  due_at timestamptz null,
  confirmation_state text not null default 'NAO_REQUERIDA'
    check (confirmation_state in ('NAO_REQUERIDA','REQUER_HUMANO','CONFIRMADA','REJEITADA')),
  created_by text not null,
  updated_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_movement_at timestamptz not null default now(),
  completed_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists cr_pending_master_candidate_source_uidx
  on public.cr_pending_master_candidate_20261002(source_system,source_ref)
  where source_ref is not null and source_ref <> '';
create index if not exists cr_pending_master_candidate_status_idx
  on public.cr_pending_master_candidate_20261002(status,priority,updated_at desc);

create table if not exists public.cr_pending_events_candidate_20261002 (
  event_id uuid primary key default gen_random_uuid(),
  pending_id uuid not null references public.cr_pending_master_candidate_20261002(pending_id) on delete restrict,
  event_kind text not null,
  actor_kind text not null check (actor_kind in ('HUMAN','AGENT','SYSTEM')),
  actor_code text not null,
  actor_name text not null,
  actor_role text not null default '',
  correlation_id uuid not null default gen_random_uuid(),
  idempotency_key text null,
  source_ref text null,
  before_data jsonb not null default '{}'::jsonb,
  after_data jsonb not null default '{}'::jsonb,
  human_gate boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists cr_pending_events_candidate_idem_uidx
  on public.cr_pending_events_candidate_20261002(idempotency_key)
  where idempotency_key is not null and idempotency_key <> '';
create index if not exists cr_pending_events_candidate_pending_idx
  on public.cr_pending_events_candidate_20261002(pending_id,created_at desc);

create table if not exists public.cr_agent_access_candidate_20261002 (
  agent_code text primary key,
  display_name text not null,
  authority_level integer not null,
  permissions text[] not null default '{}',
  write_mode text not null default 'HUMAN_SESSION_DELEGATED'
    check (write_mode in ('READ_ONLY','HUMAN_SESSION_DELEGATED','DISABLED')),
  can_homologate boolean not null default false,
  active boolean not null default true,
  governance_source text not null default 'cr_agent_governance_canon_v1',
  updated_at timestamptz not null default now()
);

insert into public.cr_agent_access_candidate_20261002
(agent_code,display_name,authority_level,permissions,write_mode,can_homologate)
values
('BIO','BIO — Orquestrador Mestre',90,array['READ','CLASSIFY','PROPOSE','CONSOLIDATE'],'HUMAN_SESSION_DELEGATED',false),
('BIO_GESTOR','BIO Gestor — Inteligência Gerencial',60,array['READ','ANALYZE','PROPOSE'],'READ_ONLY',false),
('CR_ASSERTIVO','CR Assertivo — Executor Técnico',70,array['READ','CREATE','UPDATE','BLOCK','DEFER','COMPLETE_PROPOSE'],'HUMAN_SESSION_DELEGATED',false),
('SISTEMA','Sistema CONSTRU-REI',20,array['READ'],'READ_ONLY',false)
on conflict (agent_code) do update set
  display_name=excluded.display_name,
  authority_level=excluded.authority_level,
  permissions=excluded.permissions,
  write_mode=excluded.write_mode,
  can_homologate=excluded.can_homologate,
  active=true,
  updated_at=now();

create table if not exists public.cr_pending_sources_candidate_20261002 (
  source_code text primary key,
  source_name text not null,
  mode text not null,
  status text not null check (status in ('OK','ATENCAO','INDISPONIVEL','NAO_MONITORADO','NAO_INTEGRADO')),
  last_checked_at timestamptz null,
  details jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.cr_pending_sources_candidate_20261002(source_code,source_name,mode,status,details)
values
('BANCO_MESTRE','Banco Mestre de Pendências','CANDIDATE_WRITE','OK','{"scope":"isolated_candidate"}'),
('CENTRAL_CANONICA','Central canônica','READ_ONLY','OK','{"baseline":"92ef8f27d71ac176abc6452df165a048c4405d60"}'),
('GESTAOCLICK','GestãoClick','READ_ONLY_PLANNED','NAO_INTEGRADO','{"rule":"não inventar métricas"}'),
('TRELLO','Trello','READ_ONLY_PLANNED','NAO_INTEGRADO','{"rule":"não inventar métricas"}'),
('AGENDA','Agenda operacional','READ_ONLY_PLANNED','NAO_INTEGRADO','{"rule":"não inventar métricas"}')
on conflict (source_code) do update set
  source_name=excluded.source_name,
  mode=excluded.mode,
  status=excluded.status,
  details=excluded.details,
  updated_at=now();

alter table public.cr_pending_master_candidate_20261002 enable row level security;
alter table public.cr_pending_events_candidate_20261002 enable row level security;
alter table public.cr_agent_access_candidate_20261002 enable row level security;
alter table public.cr_pending_sources_candidate_20261002 enable row level security;

revoke all on table public.cr_pending_master_candidate_20261002 from anon, authenticated;
revoke all on table public.cr_pending_events_candidate_20261002 from anon, authenticated;
revoke all on table public.cr_agent_access_candidate_20261002 from anon, authenticated;
revoke all on table public.cr_pending_sources_candidate_20261002 from anon, authenticated;

create or replace function public.cr_pending_events_candidate_append_only_guard_20261002()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'cr_pending_events_candidate_20261002 is append-only';
end;
$$;

revoke all on function public.cr_pending_events_candidate_append_only_guard_20261002()
  from public, anon, authenticated;

drop trigger if exists cr_pending_events_candidate_append_only_guard
  on public.cr_pending_events_candidate_20261002;
create trigger cr_pending_events_candidate_append_only_guard
before update or delete on public.cr_pending_events_candidate_20261002
for each row execute function public.cr_pending_events_candidate_append_only_guard_20261002();

commit;
