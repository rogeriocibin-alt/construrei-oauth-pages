"use strict";
const fs=require("fs"),test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),path=require("node:path");
const candidate=fs.readFileSync(path.join(__dirname,"candidate.html"),"utf8");
const official=fs.readFileSync(path.join(__dirname,"official.html"),"utf8");
const scripts=s=>[...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(x=>({id:x[1].match(/id="([^"]+)"/)?.[1]||null,js:x[2]}));
const C=scripts(candidate),O=scripts(official);
test("candidate retains exactly all existing official scripts in identical order",()=>{
 assert.equal(C.length,O.length);
 for(let i=0;i<O.length;i++)assert.equal(C[i].id,O[i].id);
 const changed=C.filter((x,i)=>x.js!==O[i].js);
 assert.equal(changed.length,1,"only manual central script may change");
 assert.match(changed[0].js,/manualValidateFields/);
});
test("all JS parses",()=>{for(const x of C)assert.doesNotThrow(()=>new vm.Script(x.js),x.id||"inline")});
test("client checks exact backend required fields before request",()=>{
 const js=C.map(x=>x.js).join("\n");
 for(const t of ["manualValidateFields","mc_case","mc_date","mc_amount","mc_category","mc_party","mc_desc","mc_ref","MISSING_FINANCIAL_DETAILS"])assert.ok(js.includes(t),t);
 assert.match(js,/if\(!manualValidateFields\(\)\)return/);
 assert.match(js,/!value\("mc_party"\)&&!value\("mc_desc"\)&&!value\("mc_ref"\)/);
});
test("preview never commits automatically",()=>{const j=C.map(x=>x.js).join("\n");assert.match(j,/v12ProtectedWrite\("preview",p\)/);assert.match(j,/v12ProtectedWrite\("commit",p\)/);assert.match(j,/if\(!manualValidateFields\(\)\)return/);});
test("manual form explains required information in Portuguese",()=>{assert.match(candidate,/id="mc-required-help"/);assert.match(candidate,/favorecido/);assert.match(candidate,/descrição/);assert.match(candidate,/referência/);assert.match(candidate,/aria-invalid/);});
test("critical financial modules preserved",()=>{for(const id of ["cr-v12-audit-imported-readonly-runtime","cr-v12-earnings-support-and-history","cr-v12-trello-financial-withdrawals-live","crp-period-send-v2","cr-v12-withdraw-history-runtime","v12-finance-safe-call"])assert.ok(candidate.includes(id))});
test("production unchanged in this workstream",()=>{assert.ok(official.includes("V12 OPERAÇÃO HOMOLOGADA"));assert.ok(!official.includes("v12-manual-validation-candidate-css"))});
