"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,".."),candidate=path.join(root,"candidates/financeiro-v12-period-close-20261024");
const edge=fs.readFileSync(path.join(candidate,"cora-aprovisionamento-backend/index.ts"),"utf8");
const sql=fs.readFileSync(path.join(candidate,"bank-annotation-revisions-CANDIDATE.sql"),"utf8");
const html=fs.readFileSync(path.join(root,"preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html"),"utf8");
const slice=(s,begin,end)=>{const start=s.indexOf(begin);assert.ok(start>=0,begin);const finish=s.indexOf(end,start+begin.length);assert.ok(finish>start,end);return s.slice(start,finish)};
test("revisions are separate append-only rows; original annotation is never updated",()=>{
 assert.match(sql,/create table if not exists public\.cr_cora_bank_annotation_revisions_v12/i);
 assert.match(sql,/references public\.cr_cora_bank_annotations_v12\(operation_id\)/);
 assert.match(sql,/unique \(operation_id, revision_number\)/);
 assert.match(sql,/unique \(operation_id, fingerprint\)/);
 assert.doesNotMatch(sql,/update\s+public\.cr_cora_bank_annotations_v12\s+set/i);
 assert.doesNotMatch(sql,/delete\s+from\s+public\.cr_cora_bank_annotations_v12/i);
});
test("database correction RPC serializes per bank ID and compares fingerprints",()=>{
 assert.match(sql,/where operation_id=p_operation_id for update/i);
 assert.match(sql,/last_fp is distinct from p_expected_previous_fp/i);
 assert.match(sql,/ANNOTATION_REVISION_STALE/);
 assert.match(sql,/if last_fp = p_new_fingerprint then/i);
 assert.match(sql,/last_revision\.revision_number,0\)\+1/);
});
test("database validates exact bank amount and unique 1-15 allocations",()=>{
 assert.match(sql,/total <> original\.amount_cents/);
 assert.match(sql,/unique_works <> jsonb_array_length\(p_allocations\)/);
 assert.match(sql,/jsonb_array_length\(p_allocations\) not between 1 and 15/);
 assert.match(sql,/char_length\(p_reason\) not between 10 and 500/);
});
test("RLS and RPC permissions exclude public and authenticated",()=>{
 assert.match(sql,/enable row level security/);
 assert.match(sql,/revoke all on public\.cr_cora_bank_annotation_revisions_v12 from public, anon, authenticated/);
 assert.match(sql,/security invoker/i);
 assert.match(sql,/revoke all on function public\.cr_cora_bank_annotation_revise_v12[^\n]+from public, anon, authenticated/);
 assert.match(sql,/grant execute on function public\.cr_cora_bank_annotation_revise_v12[^\n]+to service_role/);
});
test("backend preview and commit require existing annotation and matching old fingerprint",()=>{
 const body=slice(edge,"async function bankAnnotationRevisionFlow(","async function batchBankStatus(");
 for(const s of ["bankAnnotationData(p,raw)","existingAnnotation(p.operation_id,k)","ANNOTATION_TO_REVISE_NOT_FOUND","ANNOTATION_REVISION_STALE_RELOAD","ANNOTATION_PREVIOUS_FINGERPRINT_REQUIRED","ANNOTATION_REVISION_REASON_REQUIRED","ANNOTATION_REVISION_PREVIEW_CHANGED"])assert.ok(body.includes(s),s);
 assert.match(body,/bank-annotation-revise-preview/);
 assert.match(body,/rpc\/cr_cora_bank_annotation_revise_v12/);
 assert.match(body,/saved\.fingerprint!==newFp/);
});
test("new revision endpoint is director-only with verified Cora movement",()=>{
 const director=edge.indexOf("if(!await director(req))"),origin=edge.indexOf("try{await verifiedBankOrigin(p,k)}"),route=edge.indexOf('if(action==="bank-annotation-revise-preview"||action==="bank-annotation-revise-commit")',origin);
 assert.ok(director>0&&origin>director&&route>origin);
 assert.match(edge,/bank-annotation-revise-commit/);
});
test("new revision flow cannot execute financial / Trello writers",()=>{
 const body=slice(edge,"async function bankAnnotationRevisionFlow(","async function batchBankStatus(");
 assert.doesNotMatch(body,/trelloApiWrite\(|manual-cora-commit|\blegacy\(|cr_finance_v12_claim|cr_finance_v12_finish|writeReceipt\(/);
 for(const phrase of ["no_trello_write:true","no_cost_write:true","no_cora_write:true","no_capital_write:true"])assert.ok(body.includes(phrase),phrase);
});
test("status uses latest revision and retains the original record",()=>{
 const fetch=slice(edge,"async function existingAnnotation(","async function bankAnnotationFlow(");
 assert.match(fetch,/const original=j\[0\]\|\|null/);
 assert.match(fetch,/order","revision_number.desc"/);
 assert.match(fetch,/root_fingerprint:original\.fingerprint/);
 const batch=slice(edge,"async function batchBankStatus(","Deno.serve(");
 assert.match(batch,/latest=new Map/);
 assert.match(batch,/revision_number:note\.revision_number\|\|0/);
});
test("UI permits previously annotated row correction without side-effecting ledger",()=>{
 assert.match(html,/Revisar anotação do extrato/);
 assert.match(html,/loadBankNoteCorrection\(ledger.annotation\)/);
 assert.match(html,/expected_previous_fingerprint:noteRevisionBase.fingerprint/);
 assert.match(html,/bank-annotation-revise-preview/);
 assert.match(html,/bank-annotation-revise-commit/);
 assert.match(html,/cr-ap-note-correction-reason/);
 assert.match(html,/CORREÇÃO AUDITÁVEL/);
});
test("UI client network guard knows both correction routes",()=>{
 const scope=slice(html,'<script id="v12-netguard">','</script>');
 assert.match(scope,/bank-annotation-revise-preview/);
 assert.match(scope,/bank-annotation-revise-commit/);
});
test("inline candidate Javascript has no parse failures",()=>{
 const re=/<script([^>]*)>([\s\S]*?)<\/script>/ig;let m,n=0;
 while((m=re.exec(html))){if(!m[2].trim()||/type=["'](?:application\/json|application\/ld\+json)["']/i.test(m[1]))continue;assert.doesNotThrow(()=>new vm.Script(m[2],{filename:"inline-"+n+".js"}));n++}
 assert.ok(n>=5);
});
