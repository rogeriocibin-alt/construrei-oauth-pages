"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const ui=fs.readFileSync(path.join(__dirname,"../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html"),"utf8");
const edge=fs.readFileSync(path.join(__dirname,"../candidates/financeiro-v12-period-close-20261024/cora-aprovisionamento-backend/index.ts"),"utf8");
const month=fs.readFileSync(path.join(__dirname,"../candidates/financeiro-v12-period-close-20261024/index.ts"),"utf8");
test("interface offers specific withdrawal inside Cora provisioning",()=>{
 for(const marker of ['value="withdrawal"','id="cr-ap-withdraw-period"','id="cr-ap-withdraw-beneficiary"','id="cr-ap-withdraw-note"','id="cr-ap-withdraw-preview"','id="cr-ap-withdraw-confirm"'])
  assert.ok(ui.includes(marker),marker);
 assert.ok(ui.includes('wdConfirmButton.disabled=true'));
});
test("withdrawal validates authenticated bank debit, documented acerto period and beneficiary",()=>{
 assert.match(edge,/verifiedBankOrigin\(p,k\)/);
 assert.match(edge,/WITHDRAWAL_REQUIRES_VERIFIED_CORA_DEBIT/);
 assert.match(edge,/WITHDRAWAL_PERIOD_NOT_FOUND/);
 assert.match(edge,/WITHDRAWAL_BENEFICIARY_INVALID/);
 assert.match(edge,/WITHDRAWAL_JUSTIFICATION_REQUIRED/);
});
test("withdrawal is ledger-only: no extra Cora payment, no job cost, no CG debit",()=>{
 const functionBody=edge.slice(edge.indexOf("async function withdrawalFlow("),edge.indexOf("async function capitalBridge("));
 assert.ok(functionBody.length>1000);
 assert.ok(!/legacy\(|trelloApiWrite\(|requestCapital\("debit"|manual-cora-commit|\/cards\//.test(functionBody));
 assert.ok(functionBody.includes('reconciliation_kind:"WITHDRAWAL_SETTLEMENT"'));
 assert.ok(functionBody.includes('bankAlreadyUsed(p,k)'));
 assert.ok(functionBody.includes('cr_finance_v12_claim'));
 assert.ok(functionBody.includes('cr_finance_v12_finish'));
 assert.ok(functionBody.includes('REVIEW_REQUIRED'));
});
test("withdrawal confirm requires unchanged preview and direct user approval",()=>{
 assert.match(ui,/JSON\.stringify\(current\)!==JSON\.stringify\(original\)/);
 assert.match(ui,/if\(!confirm\("Confirmar o v[ií]nculo/);
 assert.match(ui,/existingRequest\("withdrawal-commit",wdPreview\.payload\)/);
});
test("multi-allocation and one-Cora-to-many destinations still present",()=>{
 for(const marker of ['value="multi-expense"','value="multi-receipt"','value="capital"','SPLIT_REQUIRES_2_TO_10_TARGETS','CAPITAL_ALLOCATION_SUM_INVALID','CAPITAL_INSUFFICIENT_'])
  assert.ok(ui.includes(marker)||edge.includes(marker),marker);
});
test("monthly text copy never invokes Trello commit",()=>{
 assert.ok(ui.includes('onclick="copyAcerto()"'));
 assert.ok(ui.includes('onclick="copyAcertoResumo()"'));
 assert.ok(ui.includes('onclick="crpSend()"'));
 assert.ok(month.includes('PERIOD_ALREADY_SENT'));
});
test("scripts in the candidate HTML parse as JavaScript",()=>{
 const regex=/<script([^>]*)>([\s\S]*?)<\/script>/ig;
 let script,checked=0;
 while((script=regex.exec(ui))){
  const attrs=script[1]||"",body=script[2]||"";
  if(!body.trim()||/type=["'](?:application\/json|application\/ld\+json)["']/i.test(attrs))continue;
  assert.doesNotThrow(()=>new vm.Script(body,{filename:"candidate-inline-script-"+(checked+1)+".js"}));
  checked++;
 }
 assert.ok(checked>=5,"Expected inline JavaScript scripts; checked "+checked);
});

test("retirada conciliada integra consulta histórica mensal sem criar pagamento presumido",()=>{
 assert.match(edge,/async function withdrawalHistory\(/);
 assert.match(edge,/payload->>reconciliation_kind/);
 assert.match(edge,/eq\.WITHDRAWAL_SETTLEMENT/);
 assert.match(edge,/status","eq\.COMMITTED"/);
 assert.match(edge,/read_only:true/);
 assert.ok(ui.includes('id="cr-withdraw-history"'));
 assert.ok(ui.includes('action=withdrawal-history'));
 assert.ok(ui.includes('json.source!=="V12_SETTLED_WITHDRAWALS_CORA"'));
 assert.ok(ui.includes('Nenhum valor presumido'));
});

test("does not misreport a previously classified bank expense as withdrawal",()=>{
 const body=edge.slice(edge.indexOf("async function withdrawalFlow("),edge.indexOf("async function capitalBridge("));
 assert.match(body,/BANK_OPERATION_ALREADY_CLASSIFIED_DIFFERENTLY/);
 assert.match(body,/prev\.reconciliation_kind!==\"WITHDRAWAL_SETTLEMENT\"/);
 assert.match(body,/saved\.period_id!==periodId/);
 assert.match(body,/saved\.beneficiary!==beneficiary/);
 assert.match(body,/saved\.amount_cents!==p\.amount_cents/);
 assert.match(body,/already_committed:true,writes:false,ledger_only:true/);
});
