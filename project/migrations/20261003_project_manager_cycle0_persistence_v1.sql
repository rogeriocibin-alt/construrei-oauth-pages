-- CONSTRU-REI — Project Manager V1.1 — Cycle 0 persistence
-- Applied to Supabase project yspuaamokjbrosytqjpg as migration:
-- project_manager_cycle0_persistence_v1
-- Additive only. Reuses existing checkpoints, backlog, GRC, backup, security and observability.
-- Public/anon/authenticated have no direct grants. service_role only.

create table if not exists cr_internal.pm_versions_v1 (
  version_id text primary key,
  product_key text not null,
  semantic_version text not null,
  build text,
  branch text,
  git_ref text,
  commit_sha text,
  checkpoint_ref text,
  baseline_version_id text references cr_internal.pm_versions_v1(version_id),
  status text not null check (status in ('draft','candidate','homologation','homologated','canonical','archived','rejected')),
  environment text not null default 'candidate',
  source text not null,
  confidence text not null default 'medium' check (confidence in ('high','medium','low','unknown')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_key, semantic_version)
);

create index if not exists pm_versions_v1_baseline_idx on cr_internal.pm_versions_v1(baseline_version_id);

create table if not exists cr_internal.pm_releases_v1 (
  release_id text primary key,
  version_id text not null references cr_internal.pm_versions_v1(version_id),
  product_key text not null,
  semantic_version text not null,
  build text not null,
  commit_sha text,
  branch text,
  checkpoint_ref text,
  environment text not null,
  status text not null check (status in ('planned','candidate','ready_for_homologation','homologated','canonical','rolled_back','archived','blocked')),
  release_notes jsonb not null default '[]'::jsonb,
  source_snapshot jsonb not null default '{}'::jsonb,
  test_summary jsonb not null default '{}'::jsonb,
  risk_summary jsonb not null default '{}'::jsonb,
  promotion_gate jsonb not null default '{}'::jsonb,
  rollback_reference text not null,
  created_by text not null,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  promoted_at timestamptz
);
create index if not exists pm_releases_v1_version_idx on cr_internal.pm_releases_v1(version_id);
create index if not exists pm_releases_v1_status_idx on cr_internal.pm_releases_v1(status);

create table if not exists cr_internal.pm_audits_v1 (
  audit_id text primary key,
  sequence_no integer not null unique,
  title text not null,
  audit_date date not null,
  audit_type text not null,
  product_key text not null,
  version_ref text,
  build text,
  environment text not null,
  audited_url text,
  auditor text not null,
  scope text not null,
  original_evidence jsonb not null default '{}'::jsonb,
  status text not null check (status in ('registered','analyzed','implementation_planned','in_treatment','retest','closed','archived')),
  summary text not null,
  source text not null,
  confidence text not null default 'high' check (confidence in ('high','medium','low','unknown')),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists cr_internal.pm_audit_findings_v1 (
  finding_id text primary key,
  audit_id text not null references cr_internal.pm_audits_v1(audit_id) on delete restrict,
  finding_code text not null,
  title text not null,
  description text not null,
  category text not null,
  severity text not null check (severity in ('critical','high','medium','low','info')),
  impact text not null,
  recommendation text not null,
  affected_product text,
  related_source text,
  implementation_item text,
  owner text,
  due_at timestamptz,
  status text not null check (status in ('open','planned','in_progress','blocked','implemented','retest','closed','accepted_risk','not_applicable')),
  treated_in_release text,
  evidence jsonb not null default '[]'::jsonb,
  retest_result text,
  last_verified_at timestamptz,
  retested_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(audit_id, finding_code)
);
create index if not exists pm_audit_findings_v1_audit_idx on cr_internal.pm_audit_findings_v1(audit_id);
create index if not exists pm_audit_findings_v1_status_idx on cr_internal.pm_audit_findings_v1(status);

create table if not exists cr_internal.pm_sources_v1 (
  source_id text primary key,
  source_name text not null,
  source_kind text not null,
  reference text,
  purpose text not null,
  owner text,
  status text not null check (status in ('healthy','degraded','error','stale','not_confirmed','disabled')),
  confidence text not null check (confidence in ('high','medium','low','unknown')),
  last_read_at timestamptz,
  last_success_at timestamptz,
  next_read_at timestamptz,
  stale_after interval,
  current_error text,
  notes text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cr_internal.pm_reconciliations_v1 (
  reconciliation_id text primary key,
  object_type text not null,
  object_key text not null,
  title text not null,
  source_a text not null,
  value_a jsonb not null,
  source_b text not null,
  value_b jsonb not null,
  difference jsonb not null default '{}'::jsonb,
  preferred_source text,
  resolution_rule text,
  status text not null check (status in ('open','investigating','reconciled','accepted_difference','blocked','closed')),
  owner text,
  evidence jsonb not null default '[]'::jsonb,
  last_verified_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pm_reconciliations_v1_status_idx on cr_internal.pm_reconciliations_v1(status);

create table if not exists cr_internal.pm_metric_definitions_v1 (
  metric_key text primary key,
  title text not null,
  domain text not null,
  definition text not null,
  formula text not null,
  canonical_source text not null,
  period_definition text not null,
  freshness_target interval,
  confidence_rule text not null,
  display_unit text,
  active boolean not null default true,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cr_internal.pm_business_metrics_v1 (
  metric_id uuid primary key default gen_random_uuid(),
  metric_key text not null references cr_internal.pm_metric_definitions_v1(metric_key),
  metric_period_start timestamptz,
  metric_period_end timestamptz,
  numeric_value numeric,
  text_value text,
  structured_value jsonb not null default '{}'::jsonb,
  source text not null,
  confidence text not null check (confidence in ('high','medium','low','unknown')),
  measured_at timestamptz not null,
  last_verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists pm_business_metrics_v1_metric_idx on cr_internal.pm_business_metrics_v1(metric_key, measured_at desc);

create table if not exists cr_internal.pm_automation_runs_v1 (
  run_id uuid primary key default gen_random_uuid(),
  automation_key text not null,
  run_kind text not null,
  status text not null check (status in ('running','success','partial','failed','skipped','blocked')),
  idempotency_key text,
  started_at timestamptz not null,
  finished_at timestamptz,
  duration_ms bigint,
  result jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  retry_count integer not null default 0,
  next_attempt_at timestamptz,
  source text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists pm_automation_runs_v1_idempotency_uidx
  on cr_internal.pm_automation_runs_v1(idempotency_key) where idempotency_key is not null;

create table if not exists cr_internal.pm_events_v1 (
  event_id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_key text not null,
  event_type text not null,
  actor_type text not null,
  actor text not null,
  before_state jsonb not null default '{}'::jsonb,
  after_state jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  correlation_id uuid,
  idempotency_key text,
  source text not null,
  confidence text not null default 'high' check (confidence in ('high','medium','low','unknown')),
  created_at timestamptz not null default now()
);
create index if not exists pm_events_v1_entity_idx on cr_internal.pm_events_v1(entity_type, entity_key, created_at desc);
create unique index if not exists pm_events_v1_idempotency_uidx
  on cr_internal.pm_events_v1(idempotency_key) where idempotency_key is not null;

alter table cr_internal.pm_versions_v1 enable row level security;
alter table cr_internal.pm_releases_v1 enable row level security;
alter table cr_internal.pm_audits_v1 enable row level security;
alter table cr_internal.pm_audit_findings_v1 enable row level security;
alter table cr_internal.pm_sources_v1 enable row level security;
alter table cr_internal.pm_reconciliations_v1 enable row level security;
alter table cr_internal.pm_metric_definitions_v1 enable row level security;
alter table cr_internal.pm_business_metrics_v1 enable row level security;
alter table cr_internal.pm_automation_runs_v1 enable row level security;
alter table cr_internal.pm_events_v1 enable row level security;

revoke all on cr_internal.pm_versions_v1, cr_internal.pm_releases_v1, cr_internal.pm_audits_v1,
 cr_internal.pm_audit_findings_v1, cr_internal.pm_sources_v1, cr_internal.pm_reconciliations_v1,
 cr_internal.pm_metric_definitions_v1, cr_internal.pm_business_metrics_v1,
 cr_internal.pm_automation_runs_v1, cr_internal.pm_events_v1
from public, anon, authenticated;

grant select, insert, update, delete on cr_internal.pm_versions_v1, cr_internal.pm_releases_v1,
 cr_internal.pm_audits_v1, cr_internal.pm_audit_findings_v1, cr_internal.pm_sources_v1,
 cr_internal.pm_reconciliations_v1, cr_internal.pm_metric_definitions_v1,
 cr_internal.pm_business_metrics_v1, cr_internal.pm_automation_runs_v1, cr_internal.pm_events_v1
to service_role;
