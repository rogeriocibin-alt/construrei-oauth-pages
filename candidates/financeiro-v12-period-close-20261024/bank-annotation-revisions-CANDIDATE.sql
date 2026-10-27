-- CANDIDATA ISOLADA: NÃO APLICAR SEM GATES DE HOMOLOGAÇÃO.
-- Correções de anotações bancárias: histórico original é imutável.
-- Nenhuma escrita Cora/Trello/Capital de Giro ou custo contábil.
create table if not exists public.cr_cora_bank_annotation_revisions_v12 (
  revision_id bigint generated always as identity primary key,
  operation_id text not null references public.cr_cora_bank_annotations_v12(operation_id) on delete restrict,
  revision_number integer not null check (revision_number >= 1),
  previous_fingerprint text not null check (previous_fingerprint ~ '^[0-9a-f]{64}$'),
  fingerprint text not null check (fingerprint ~ '^[0-9a-f]{64}$'),
  beneficiary text not null check (char_length(beneficiary) between 3 and 120),
  purpose text not null check (char_length(purpose) between 3 and 500),
  allocations jsonb not null check (jsonb_typeof(allocations) = 'array' and jsonb_array_length(allocations) between 1 and 15),
  correction_reason text not null check (char_length(correction_reason) between 10 and 500),
  created_at timestamptz not null default now(),
  unique (operation_id, revision_number),
  unique (operation_id, fingerprint),
  check (previous_fingerprint <> fingerprint)
);
alter table public.cr_cora_bank_annotation_revisions_v12 enable row level security;
revoke all on public.cr_cora_bank_annotation_revisions_v12 from public, anon, authenticated;
grant select,insert on public.cr_cora_bank_annotation_revisions_v12 to service_role;
revoke all on sequence public.cr_cora_bank_annotation_revisions_v12_revision_id_seq from public, anon, authenticated;
grant usage,select on sequence public.cr_cora_bank_annotation_revisions_v12_revision_id_seq to service_role;

-- Chamada exclusivamente de backend com a service_role; SECURITY INVOKER.
-- SERIALIZA revisões da mesma operação pelo lock na anotação original;
-- valida CAS e mantém cada versão precedente na tabela append-only.
create or replace function public.cr_cora_bank_annotation_revise_v12(
 p_operation_id text, p_expected_previous_fp text, p_new_fingerprint text,
 p_beneficiary text, p_purpose text, p_allocations jsonb, p_reason text)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
 original public.cr_cora_bank_annotations_v12%rowtype;
 last_revision public.cr_cora_bank_annotation_revisions_v12%rowtype;
 last_fp text;
 next_revision integer;
 written public.cr_cora_bank_annotation_revisions_v12%rowtype;
 total bigint;
 invalid_rows integer;
 unique_works integer;
begin
 select * into original from public.cr_cora_bank_annotations_v12
  where operation_id=p_operation_id for update;
 if not found then raise exception 'ANNOTATION_ORIGINAL_NOT_FOUND'; end if;
 select * into last_revision from public.cr_cora_bank_annotation_revisions_v12
  where operation_id=p_operation_id order by revision_number desc limit 1;
 last_fp := coalesce(last_revision.fingerprint, original.fingerprint);
 if last_fp = p_new_fingerprint then
  return jsonb_build_object('already_committed',true,'revision_number',coalesce(last_revision.revision_number,0),'fingerprint',last_fp);
 end if;
 if last_fp is distinct from p_expected_previous_fp then raise exception 'ANNOTATION_REVISION_STALE'; end if;
 if p_new_fingerprint !~ '^[0-9a-f]{64}$'
  or char_length(p_beneficiary) not between 3 and 120
  or char_length(p_purpose) not between 3 and 500
  or char_length(p_reason) not between 10 and 500
  or jsonb_typeof(p_allocations) is distinct from 'array'
  then raise exception 'ANNOTATION_REVISION_INVALID'; end if;
 if jsonb_array_length(p_allocations) not between 1 and 15 then raise exception 'ANNOTATION_REVISION_INVALID_PARTS'; end if;
 select coalesce(sum((v->>'cents')::bigint),0),
        count(*) filter (where
          coalesce(jsonb_typeof(v),'null') <> 'object'
          or coalesce(jsonb_typeof(v->'case'),'null') <> 'string'
          or coalesce(jsonb_typeof(v->'daily_count'),'null') <> 'number'
          or coalesce(jsonb_typeof(v->'cents'),'null') <> 'number'
          or coalesce(v->>'case','') !~ '^[0-9]{1,5}-26
        count(distinct v->>'case')
 into total, invalid_rows, unique_works
 from jsonb_array_elements(p_allocations) v;
 if total <> original.amount_cents or invalid_rows <> 0 or unique_works <> jsonb_array_length(p_allocations) then
  raise exception 'ANNOTATION_REVISION_BANK_TOTAL_OR_PARTS_INVALID';
 end if;
 next_revision := coalesce(last_revision.revision_number,0)+1;
 insert into public.cr_cora_bank_annotation_revisions_v12
   (operation_id,revision_number,previous_fingerprint,fingerprint,beneficiary,purpose,allocations,correction_reason)
 values
   (p_operation_id,next_revision,last_fp,p_new_fingerprint,p_beneficiary,p_purpose,p_allocations,p_reason)
 returning * into written;
 return jsonb_build_object('committed',true,'revision_number',written.revision_number,'fingerprint',written.fingerprint);
end;
$$;
revoke all on function public.cr_cora_bank_annotation_revise_v12(text,text,text,text,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.cr_cora_bank_annotation_revise_v12(text,text,text,text,text,jsonb,text) to service_role;
-- Verificar grants, RLS, 2 envios iguais e concorrência antes da publicação.

          or coalesce(v->>'daily_count','') !~ '^[0-9]{1,2}
        count(distinct v->>'case')
 into total, invalid_rows, unique_works
 from jsonb_array_elements(p_allocations) v;
 if total <> original.amount_cents or invalid_rows <> 0 or unique_works <> jsonb_array_length(p_allocations) then
  raise exception 'ANNOTATION_REVISION_BANK_TOTAL_OR_PARTS_INVALID';
 end if;
 next_revision := coalesce(last_revision.revision_number,0)+1;
 insert into public.cr_cora_bank_annotation_revisions_v12
   (operation_id,revision_number,previous_fingerprint,fingerprint,beneficiary,purpose,allocations,correction_reason)
 values
   (p_operation_id,next_revision,last_fp,p_new_fingerprint,p_beneficiary,p_purpose,p_allocations,p_reason)
 returning * into written;
 return jsonb_build_object('committed',true,'revision_number',written.revision_number,'fingerprint',written.fingerprint);
end;
$$;
revoke all on function public.cr_cora_bank_annotation_revise_v12(text,text,text,text,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.cr_cora_bank_annotation_revise_v12(text,text,text,text,text,jsonb,text) to service_role;
-- Verificar grants, RLS, 2 envios iguais e concorrência antes da publicação.

          or coalesce(v->>'cents','') !~ '^[0-9]{1,11}
        count(distinct v->>'case')
 into total, invalid_rows, unique_works
 from jsonb_array_elements(p_allocations) v;
 if total <> original.amount_cents or invalid_rows <> 0 or unique_works <> jsonb_array_length(p_allocations) then
  raise exception 'ANNOTATION_REVISION_BANK_TOTAL_OR_PARTS_INVALID';
 end if;
 next_revision := coalesce(last_revision.revision_number,0)+1;
 insert into public.cr_cora_bank_annotation_revisions_v12
   (operation_id,revision_number,previous_fingerprint,fingerprint,beneficiary,purpose,allocations,correction_reason)
 values
   (p_operation_id,next_revision,last_fp,p_new_fingerprint,p_beneficiary,p_purpose,p_allocations,p_reason)
 returning * into written;
 return jsonb_build_object('committed',true,'revision_number',written.revision_number,'fingerprint',written.fingerprint);
end;
$$;
revoke all on function public.cr_cora_bank_annotation_revise_v12(text,text,text,text,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.cr_cora_bank_annotation_revise_v12(text,text,text,text,text,jsonb,text) to service_role;
-- Verificar grants, RLS, 2 envios iguais e concorrência antes da publicação.

          or (v->>'daily_count')::integer not between 1 and 30
          or (v->>'cents')::bigint <= 0
          or (v->>'cents')::bigint % nullif((v->>'daily_count')::integer,0) is distinct from 0),
        count(distinct v->>'case')
 into total, invalid_rows, unique_works
 from jsonb_array_elements(p_allocations) v;
 if total <> original.amount_cents or invalid_rows <> 0 or unique_works <> jsonb_array_length(p_allocations) then
  raise exception 'ANNOTATION_REVISION_BANK_TOTAL_OR_PARTS_INVALID';
 end if;
 next_revision := coalesce(last_revision.revision_number,0)+1;
 insert into public.cr_cora_bank_annotation_revisions_v12
   (operation_id,revision_number,previous_fingerprint,fingerprint,beneficiary,purpose,allocations,correction_reason)
 values
   (p_operation_id,next_revision,last_fp,p_new_fingerprint,p_beneficiary,p_purpose,p_allocations,p_reason)
 returning * into written;
 return jsonb_build_object('committed',true,'revision_number',written.revision_number,'fingerprint',written.fingerprint);
end;
$$;
revoke all on function public.cr_cora_bank_annotation_revise_v12(text,text,text,text,text,jsonb,text) from public, anon, authenticated;
grant execute on function public.cr_cora_bank_annotation_revise_v12(text,text,text,text,text,jsonb,text) to service_role;
-- Verificar grants, RLS, 2 envios iguais e concorrência antes da publicação.
