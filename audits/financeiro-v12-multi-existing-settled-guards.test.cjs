'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../candidates/financeiro-v12-period-close-20261024/cora-aprovisionamento-backend/index.ts'),'utf8');
test('settled jobs are discovered only in reconciliation mode',()=>{
 assert.match(source,/raw\?\.mode==="reconcile-existing"/);
 assert.match(source,/async function reconciliationCases\(\)/);
 assert.match(source,/recon\?await reconciliationCases\(\):await liveCases\(direction\)/);
});
test('multi existing reconciliation does not call legacy writer',()=>{
 const part=source.split('async function multiExistingFlow(')[1].split('async function multiFlow(')[0];
 assert.ok(part,'multiExistingFlow exists');
 assert.doesNotMatch(part,/legacy\(|manual-cora-commit|writeReceipt\(|tidyCommittedMarker\(/);
 assert.match(part,/MULTI_EXISTING_EXPLICIT_LINE_REQUIRED/);
 assert.match(part,/MULTI_EXISTING_LINE_ALREADY_LINKED/);
 assert.match(part,/MULTI_EXISTING_PREVIEW_CHANGED/);
 assert.match(part,/cr_finance_v12_claim/);
 assert.match(part,/cr_finance_v12_finish/);
 assert.match(part,/REVIEW_REQUIRED/);
});
test('bank amount exact and unique allocations required',()=>{
 assert.match(source,/parts\.reduce\(\(v,a\)=>v\+a\.cents,0\)!==total/);
 assert.match(source,/DUPLICATED_CASE_IN_SPLIT/);
});
test('historical cost reconciled with immutable card digest',()=>{
 const part=source.split('async function multiExistingFlow(')[1].split('async function multiFlow(')[0];
 assert.match(part,/MULTI_EXISTING_CARD_CHANGED/);
 assert.match(part,/sha256\(String\(now\.desc\|\|""\)\)/);
 assert.match(part,/trello_write:false/);
});
