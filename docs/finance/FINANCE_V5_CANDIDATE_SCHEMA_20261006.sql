-- CONSTRU-REI — FINANCE V5 — CANDIDATE SCHEMA ONLY
-- Date: 2026-10-06
-- IMPORTANT: DO NOT APPLY TO PRODUCTION WITHOUT HUMAN HOMOLOGATION.
-- Purpose:
--   1) derive one canonical cost center from the latest approved quote for each case;
--   2) define a Cora movement review queue that is NOT a parallel financial ledger;
--   3) keep cr_financial_entries_v1 as the only canonical provisioned financial-entry destination.
-- Current Cora state: STAGE waiting support (invalid_client). Production untouched.

begin;

-- ---------------------------------------------------------------------------
-- 1. COST CENTERS = DERIVED VIEW, NOT A NEW LEDGER/TABLE
-- ---------------------------------------------------------------------------
-- The view intentionally derives cost centers from the existing canonical chain:
-- cr_cases_v1 -> cr_quotes_v1 -> cr_quote_approvals_v1.
-- One cost center per case: the most recently approved quote wins.
-- No amount is synthesized; approved_amount falls back only to the quote's own sale_amount.
create or replace view public.cr_financial_cost_centers_v1 as
with latest_decision_per_quote as (
  select distinct on (a.quote_id)
    a.approval_id,
    a.case_id,
    a.quote_id,
    a.decision,
    a.approved_amount,
    a.decided_by_party_id,
    a.decided_by_name,
    a.decided_at,
    a.created_at
  from public.cr_quote_approvals_v1 a
  order by a.quote_id, a.decided_at desc, a.created_at desc, a.approval_id desc
),
approved_quote_versions as (
  select
    c.case_id,
    c.case_code,
    c.phase as case_phase,
    c.status as case_status,
    c.service_category,
    c.responsible,
    q.quote_id,
    q.quote_code,
    q.version as quote_version,
    q.currency,
    q.materials_amount,
    q.labor_amount,
    q.third_party_amount,
    q.other_cost_amount,
    q.total_cost_amount,
    q.sale_amount,
    q.expected_margin_pct,
    coalesce(d.approved_amount, q.sale_amount) as approved_amount,
    d.approval_id,
    d.decision,
    d.decided_by_party_id,
    d.decided_by_name,
    d.decided_at as approved_at
  from public.cr_quotes_v1 q
  join public.cr_cases_v1 c on c.case_id = q.case_id
  join latest_decision_per_quote d on d.quote_id = q.quote_id
  where upper(trim(d.decision)) in ('APPROVED','APROVADO','APROVADA')
),
latest_approved_per_case as (
  select distinct on (case_id) *
  from approved_quote_versions
  order by case_id, approved_at desc, quote_version desc, quote_id desc
)
select
  case_id,
  case_code as cost_center_code,
  case_code as cost_center_key,
  quote_id,
  quote_code,
  quote_version,
  approval_id,
  decision,
  approved_amount,
  approved_at,
  currency,
  total_cost_amount as expected_cost_amount,
  sale_amount,
  expected_margin_pct,
  case_phase,
  case_status,
  service_category,
  responsible,
  materials_amount,
  labor_amount,
  third_party_amount,
  other_cost_amount
from latest_approved_per_case;

comment on view public.cr_financial_cost_centers_v1 is
'FINANCE V5: cost centers derived from the latest human-approved canonical quote per case. No parallel ledger.';

-- ---------------------------------------------------------------------------
-- 2. CORA REVIEW QUEUE = INBOX / WORKFLOW, NOT ACCOUNTING TRUTH
-- ---------------------------------------------------------------------------
create table if not exists public.cr_cora_review_queue_v1 (
  movement_id uuid primary key default gen_random_uuid(),
  environment text not null default 'STAGE',
  external_movement_id text not null,
  occurred_at timestamptz not null,
  direction text not null,
  amount numeric(14,2) not null,
  currency char(3) not null default 'BRL',
  description text,
  counterparty_name text,
  counterparty_document text,

  status text not null default 'PENDING_REVIEW',

  -- Human classification. Nullable while movement is waiting for review.
  case_id uuid,
  quote_id uuid,
  category text,
  review_note text,
  reviewed_by text,
  reviewed_at timestamptz,

  -- Filled only after an explicit, authorized Provisionar operation.
  provisioned_entry_id uuid,
  provisioned_by text,
  provisioned_at timestamptz,

  -- Reconciliation is a separate step from provisioning.
  reconciled_at timestamptz,

  -- Store only the minimum backend trace needed for audit/idempotency.
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cr_cora_review_queue_v1_environment_chk
    check (environment in ('STAGE','PRODUCTION')),
  constraint cr_cora_review_queue_v1_direction_chk
    check (direction in ('CREDIT','DEBIT')),
  constraint cr_cora_review_queue_v1_amount_chk
    check (amount >= 0),
  constraint cr_cora_review_queue_v1_status_chk
    check (status in (
      'PENDING_REVIEW',
      'READY_TO_PROVISION',
      'PROVISIONED',
      'RECONCILED',
      'IGNORED',
      'BLOCKED'
    )),
  constraint cr_cora_review_queue_v1_case_fk
    foreign key (case_id) references public.cr_cases_v1(case_id) on delete restrict,
  constraint cr_cora_review_queue_v1_quote_fk
    foreign key (quote_id) references public.cr_quotes_v1(quote_id) on delete restrict,
  constraint cr_cora_review_queue_v1_entry_fk
    foreign key (provisioned_entry_id) references public.cr_financial_entries_v1(entry_id) on delete restrict,
  constraint cr_cora_review_queue_v1_external_uq
    unique (environment, external_movement_id)
);

create index if not exists cr_cora_review_queue_v1_status_idx
  on public.cr_cora_review_queue_v1(environment, status, occurred_at desc);

create index if not exists cr_cora_review_queue_v1_case_idx
  on public.cr_cora_review_queue_v1(case_id, occurred_at desc)
  where case_id is not null;

create index if not exists cr_cora_review_queue_v1_entry_idx
  on public.cr_cora_review_queue_v1(provisioned_entry_id)
  where provisioned_entry_id is not null;

alter table public.cr_cora_review_queue_v1 enable row level security;

comment on table public.cr_cora_review_queue_v1 is
'FINANCE V5: Cora movement inbox for human review. It must never replace cr_financial_entries_v1 as the canonical financial ledger.';

-- Intentionally NO client-facing RLS policies in this candidate.
-- Service/backend access only until Rogério validates the full workflow.

-- ---------------------------------------------------------------------------
-- 3. PROVISIONING CONTRACT (DESIGN — NOT CREATED HERE)
-- ---------------------------------------------------------------------------
-- Future authorized backend transaction:
--   A) lock queue row;
--   B) require status READY_TO_PROVISION;
--   C) require case_id/cost center + category selected by human;
--   D) INSERT exactly one traceable row into cr_financial_entries_v1;
--      - amount remains non-negative;
--      - entry_type determines CREDIT/DEBIT semantics;
--      - metadata records cora movement_id/external_movement_id and origin;
--   E) update queue row with provisioned_entry_id/status PROVISIONED;
--   F) reconciliation later marks settled_at/status in cr_financial_entries_v1
--      and queue status RECONCILED;
--   G) closed work is never reopened; late cost follows canonical absorption rule
--      while preserving original Cora movement trace in metadata.
--
-- Idempotency requirement:
--   unique(environment, external_movement_id) +
--   one provisioned_entry_id per queue movement.
--
-- HUMAN GATE:
--   No automatic Provisionar from Cora. Rogério confirms cost center + category first.

rollback;
-- Candidate ends with ROLLBACK by design. This file is an architecture/test artifact,
-- not a production migration.
