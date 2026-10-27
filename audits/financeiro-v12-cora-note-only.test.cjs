"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const dir=path.join(__dirname,"..");
const edge=fs.readFileSync(path.join(dir,"candidates/financeiro-v12-period-close-20261024/cora-aprovisionamento-backend/index.ts"),"utf8");
const html=fs.readFileSync(path.join(dir,"preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html"),"utf8");
const start=edge.indexOf("function bankAnnotationData("),end=edge.indexOf("async function existingAnnotation(",start);
assert.ok(start>0&&end>start);
const extracted=edge.slice(start,end)
 .replace("p:ReturnType<typeof clean>,raw:any","p,raw")
 .replaceAll("(v:any)","(v)")
 .replace("(sum:number,v:any)","(sum,v)")
 .replaceAll("(a:any,b:any)","(a,b)");
const ctx=vm.createContext({});
vm.runInContext(extracted+"\nthis.validate=bankAnnotationData",ctx);
const p=(c)=>({direction:"OUT",operation_id:"CORA_"+"a".repeat(64),case:"799-26",date:"2026-10-25",amount_cents:c,reference:"EXAMPLE_BANK_REFERENCE_20261025"});
const row=(cs,n)=>({case:cs,daily_count:n,cents:n*15000});
test("Éder three daily annotations for two settled works total 450 with no Trello cost lookup",()=>{
 const out=ctx.validate(p(45000),{beneficiary:"Éder Cibin",purpose:"Apoio no extrato",allocations:[row("799-26",2),row("818-26",1)]});
 assert.equal(out.amount_cents,45000);assert.equal(out.allocations.length,2);assert.equal(out.allocations.reduce((s,a)=>s+a.cents,0),45000);
});
test("Fabrício separate bank operation of 450 can have same works with distinct source ID",()=>{
 const out=ctx.validate({...p(45000),operation_id:"CORA_"+"b".repeat(64),reference:"EXAMPLE_BANK_REFERENCE_20261025_B"},
  {beneficiary:"Fabrício Lucas Berto",purpose:"Apoios",allocations:[row("799-26",1),row("818-26",2)]});
 assert.equal(out.beneficiary,"Fabrício Lucas Berto");assert.equal(out.allocations.length,2);assert.equal(out.amount_cents,45000);
});
test("João Victor five daily annotations can be split across four works without duplicate case labels",()=>{
 const out=ctx.validate(p(75000),{beneficiary:"João Victor Cibin",purpose:"5 diárias",allocations:[row("799-26",2),row("818-26",1),row("820-26",1),row("821-26",1)]});
 assert.equal(out.allocations.reduce((s,x)=>s+x.daily_count,0),5);assert.equal(out.allocations.reduce((s,x)=>s+x.cents,0),75000);
});
test("never silently accepts a missing R$150 allocation",()=>{
 assert.throws(()=>ctx.validate(p(75000),{beneficiary:"João Victor",purpose:"Diárias",allocations:[row("799-26",2),row("818-26",1),row("820-26",1)]}),/ANNOTATION_TOTAL_DIFFERS_FROM_BANK/);
});
test("duplicate work, invalid values and unverifiable direction never create annotations",()=>{
 assert.throws(()=>ctx.validate(p(45000),{beneficiary:"Éder Cibin",purpose:"Apoio",allocations:[row("799-26",2),row("799-26",1)]}),/ANNOTATION_DUPLICATED_WORK/);
 assert.throws(()=>ctx.validate({...p(45000),direction:"OTHER"},{beneficiary:"Éder Cibin",purpose:"Apoio",allocations:[row("799-26",3)]}),/BANK_ANNOTATION_REQUIRES_VERIFIED_CORA_MOVEMENT/);
 assert.throws(()=>ctx.validate(p(45000),{beneficiary:"Éder Cibin",purpose:"Apoio",allocations:[{case:"799-26",daily_count:3,cents:44000}]}),/ANNOTATION_WORK_COUNT_OR_VALUE_INVALID/);
});
test("IN: recebimento informativo preserva direção e soma sem lançar custo",()=>{
 const out=ctx.validate({...p(45000),direction:"IN"},{
  beneficiary:"Imobiliária",purpose:"Recebimento informativo",allocations:[{case:"799-26",daily_count:1,cents:45000}]
 });
 assert.equal(out.direction,"IN");
 assert.equal(out.amount_cents,45000);
 assert.equal(out.allocations.length,1);
 assert.equal(out.allocations[0].cents,45000);
});
test("no operational write or bank operation in bankAnnotationFlow",()=>{
 const body=edge.split("async function bankAnnotationFlow(")[1].split("async function batchBankStatus(")[0];
 assert.match(body,/existingAnnotation/);
 assert.match(body,/annotation_only:true/);
 assert.match(body,/no_cost_write:true/);
 assert.match(body,/no_trello_write:true/);
 assert.match(body,/no_cora_write:true/);
 assert.match(body,/no_capital_write:true/);
 assert.match(body,/BANK_ANNOTATION_ALREADY_EXISTS_REVIEW/);
 assert.doesNotMatch(body,/\blegacy\(|trelloApiWrite\(|\bwriteReceipt\(|cr_finance_v12_claim|cr_finance_v12_finish|manual-cora-commit/);
});
test("authenticated bank verification protects both preview and save",()=>{
 const verify=edge.indexOf("await verifiedBankOrigin(p,k)");
 const routes=edge.indexOf('if(action==="bank-annotation-preview"||action==="bank-annotation-commit")');
 assert.ok(verify>=0&&routes>verify);
 assert.match(edge,/BANK_ANNOTATION_PREVIEW_CHANGED/);
 assert.match(edge,/bank_reference:p.reference/);
 assert.match(edge,/method:"POST"/);
});
test("bank status lists annotations independently from accounting status",()=>{
 const body=edge.split("async function batchBankStatus(")[1].split("Deno.serve(")[0];
 assert.match(body,/url.searchParams.set\("operation_id","in\.\("/);
 assert.match(body,/existing.annotated=true/);
 assert.match(body,/existing.annotation=/);
 assert.match(body,/existing=\(statuses\[id\]\|\|\{state:"PENDENTE"/);
 assert.doesNotMatch(body,/existing.state="TRELLO_CONFIRMED"/);
});
test("visible bank statement renders purpose, beneficiary, count and work names",()=>{
 for(const s of ['value="bank-note"','id="cr-ap-note-only"','id="cr-ap-note-person"','id="cr-ap-note-reason"','id="cr-ap-note-rows"','id="cr-ap-note-preview"','id="cr-ap-note-confirm"',"ANOTAÇÃO CORA · SEM CUSTOS","bank-annotation-preview","bank-annotation-commit"])assert.ok(html.includes(s),s);
 assert.match(html,/kind.value=notePresent\?"bank-note":bankDirection\(m\)==="IN"\?"receipt":"bank-note"/);
 assert.match(html,/ledger\?\.annotated===true/);
 assert.match(html,/no_cost_write!==true/);
});
test("all inline candidate scripts remain valid JS",()=>{
 const re=/<script([^>]*)>([\s\S]*?)<\/script>/ig;let m,n=0;
 while((m=re.exec(html))){if(!m[2].trim()||/type=["'](?:application\/json|application\/ld\+json)["']/i.test(m[1]))continue;
  assert.doesNotThrow(()=>new vm.Script(m[2],{filename:"inline-"+n+".js"}));n++}
 assert.ok(n>=5);
});
