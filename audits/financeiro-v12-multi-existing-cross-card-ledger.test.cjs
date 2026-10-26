"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const edge=fs.readFileSync(path.join(__dirname,"../candidates/financeiro-v12-period-close-20261024/cora-aprovisionamento-backend/index.ts"),"utf8");
const section=(start,end)=>{const a=edge.indexOf(start),b=edge.indexOf(end,a+start.length);assert.ok(a>=0&&b>a);return edge.slice(a,b)};
test("cross-card safety scans JSONB allocations, not just primary card_id",()=>{
 const h=section("async function linkedCostRows(","async function reconcileExisting(");
 assert.match(h,/url\.searchParams\.set\("payload","cs\."\+JSON\.stringify\(\{allocations:\[\{card_id:cardId,match_key:matchKey\}\]\}\)\)/);
 assert.match(h,/existingLinksForCard\(cardId,k\)/);
 assert.match(h,/Promise\.all\(/);
 assert.match(h,/!otherRes\.ok/);
 assert.match(h,/!Array\.isArray\(otherRows\)\|\|otherRows\.length>=1000/);
});
test("the exact line on a secondary work is considered already linked",()=>{
 const h=section("async function linkedCostRows(","async function reconcileExisting(");
 assert.match(h,/x\.payload\?\.allocations\?\.some\?\.\(\(a:any\)=>a\.card_id===cardId&&a\.match_key===matchKey\)/);
 assert.match(h,/x\.status!=="FAILED"/);
 assert.match(h,/String\(x\.payload\?\.trello_match_key\|\|""\)===matchKey/);
});
test("both preview candidate discovery and final commit enforce cross-card uniqueness",()=>{
 const p=section("async function multiExistingCandidates(","async function multiExistingFlow(");
 const c=section("async function multiExistingFlow(","async function multiFlow(");
 assert.match(p,/await linkedCostRows\(scan\.target\.id,m\.match_key,k\)/);
 assert.match(c,/await linkedCostRows\(scan\.target\.id,selected,k\)/);
 assert.match(c,/MULTI_EXISTING_LINE_ALREADY_LINKED_/);
});
test("cross-card guard never mutates financial or Trello data",()=>{
 const h=section("async function linkedCostRows(","async function reconcileExisting(");
 assert.doesNotMatch(h,/\blegacy\(|trelloApiWrite\(|cr_finance_v12_claim|cr_finance_v12_finish|manual-cora-commit|method:"POST"/);
 assert.match(h,/fetch\(url,\{headers:headers\(k\),signal:AbortSignal\.timeout\(12000\)\}\)/);
});
