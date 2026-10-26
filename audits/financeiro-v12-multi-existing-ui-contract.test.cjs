"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.join(__dirname,"..");
const edge=fs.readFileSync(path.join(root,"candidates/financeiro-v12-period-close-20261024/cora-aprovisionamento-backend/index.ts"),"utf8");
const ui=fs.readFileSync(path.join(root,"preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html"),"utf8");
test("multi-existing is a separate explicit operation, never the legacy multi-expense writer",()=>{
 assert.match(ui,/<option value="multi-existing">/);
 assert.match(ui,/const multi=\["multi-expense","multi-existing","multi-receipt","capital"\]/);
 assert.match(ui,/mode:"reconcile-existing"/);
 assert.match(edge,/if\(raw\?\.mode==="reconcile-existing"\)return multiExistingFlow/);
});
test("authenticated multi-candidates route is read only and verifies the full Cora debit first",()=>{
 const route=edge.indexOf('if(action==="multi-candidates")');
 assert.ok(route>edge.indexOf("await verifiedBankOrigin(p,k)"));
 assert.ok(route<edge.indexOf('if(action==="multi-preview"',route));
 const body=edge.split("async function multiExistingCandidates(")[1].split("async function multiExistingFlow(")[0];
 assert.match(body,/splitValidate\(raw,p.amount_cents\)/);
 assert.match(body,/existingMatchCandidates\(/);
 assert.match(body,/linkedCostRows\(/);
 assert.match(body,/trello_write:false/);
 assert.doesNotMatch(body,/\blegacy\(|trelloApiWrite\(|\bwriteReceipt\(|manual-cora-commit|cr_finance_v12_claim|cr_finance_v12_finish/);
});
test("each parcel requires a specific unlinked Trello expense line before preview and commit",()=>{
 assert.match(ui,/lines\.dataset\.crMultiMatch=String\(part.case\)/);
 assert.match(ui,/check\.type="checkbox"/);
 assert.match(ui,/if\(alloc.some\(x=>!x.match_keys.length\)\)throw Error/);
 assert.match(ui,/expected_fingerprint:response.fingerprint/);
 assert.match(ui,/JSON.stringify\(splitPreview.payload.allocations\)!==JSON.stringify\(currentAlloc\)/);
 assert.match(edge,/MULTI_EXISTING_EXPLICIT_LINE_REQUIRED_/);
 assert.match(edge,/MULTI_EXISTING_PREVIEW_CHANGED/);
 assert.match(edge,/MULTI_EXISTING_CARD_CHANGED_/);
});
test("no historical work edit, bank payment, or CG charge on settled reconciliation",()=>{
 const body=edge.split("async function multiExistingFlow(")[1].split("async function multiFlow(")[0];
 assert.match(body,/trello_write:false/);
 assert.doesNotMatch(body,/\blegacy\(|\bwriteReceipt\(|trelloApiWrite\(|manual-cora-commit|requestCapital\(/);
 assert.match(ui,/SEM alterar custos das obras/);
 assert.match(ui,/response.trello_write!==false/);
});
test("cancelled or revised allocation cannot use stale matching choices",()=>{
 assert.match(ui,/splitCandidates=null;splitLineKeys.clear\(\)/);
 assert.match(ui,/JSON.stringify\(splitCandidates.allocations\)!==JSON.stringify\(baseAlloc\)/);
 assert.match(ui,/chosenExpenseLines\(x.key\)\.map\(a=>a.match_key\)/);
 assert.match(ui,/check.addEventListener\("change",\(\)=>\{splitPreview=null;splitCommitButton.disabled=true\}/);
});
test("ledger distinguishes committed multi reconciliation and retains bank status visibility",()=>{
 assert.match(edge,/reconciliation_kind==="MULTI_EXISTING_TRELLO"\)\?"TRELLO_MULTI"/);
 assert.match(ui,/"TRELLO_MULTI","CAPITAL_CONFIRMED"/);
 assert.match(ui,/response.reconciliation_kind!=="MULTI_EXISTING_TRELLO"/);
});
test("all candidate inline scripts remain valid JavaScript",()=>{
 let count=0,match;const re=/<script([^>]*)>([\s\S]*?)<\/script>/gi;
 while((match=re.exec(ui))){
  if(!match[2].trim()||/type=["'](?:application\/json|application\/ld\+json)["']/i.test(match[1]))continue;
  assert.doesNotThrow(()=>new vm.Script(match[2],{filename:"v12-inline-"+count+".js"}));
  count++;
 }
 assert.ok(count>=5);
});
