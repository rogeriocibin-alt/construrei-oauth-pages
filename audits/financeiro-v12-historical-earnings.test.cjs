"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
const ts=fs.readFileSync(path.join(root,"candidates/financeiro-v12-trello-financial-summary-20261027/index.ts"),"utf8");
const html=fs.readFileSync(path.join(root,"production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html"),"utf8");
function extract(start,end){
 const a=ts.indexOf(start),b=ts.indexOf(end,a);assert.ok(a>=0&&b>a,start);
 return ts.slice(a,b);
}
const pure=extract("function parseBR(","Deno.serve(")
.replace(/function parseBR\(v:string\)/g,"function parseBR(v)")
.replace(/function sourceLine\(section:string,re:RegExp\):number\|null/g,"function sourceLine(section,re)")
.replace(/function annualSummary\(card:any\)/g,"function annualSummary(card)")
.replace(/function annual2024\(card:any\)/g,"function annual2024(card)")
.replace(/function annual2025\(card:any\)/g,"function annual2025(card)")
.replace(/function supportBeneficiary\(original:string,lineText:string\)/g,"function supportBeneficiary(original,lineText)")
// financeSupport2026 contains await and TS casts, truncate to pure portions only.
;
const funcs=pure.slice(0,pure.indexOf("function privilegedKey()"))+"\n"+extract("function supportBeneficiary(","async function financeSupport2026(").replace(/function supportBeneficiary\(original:string,lineText:string\)/,"function supportBeneficiary(original,lineText)");
const fn=vm.runInNewContext('const CARD="6add3128f02eef0b8a7d69b5"; const CARD_2024="6ab1b9314159bc6227a4efea";const CARD_2025="6ab1c5c887007ac7e2368b2f";'+funcs+'\n({annualSummary,annual2024,annual2025,supportBeneficiary})');
const d24=[
"📊 RESUMO ANUAL 2024",
"📋 Obras: 334 | ⚠️ A conferir: 54",
"💰 Bruto: R$ 486.353,65",
"💸 Custos: R$ 237.015,65",
"💵 Lucro/Saldo consolidado: R$ 236.356,71 | 📈 Margem: 48,60%",
"👥 RATEIO HISTÓRICO CONFIRMADO",
"Fabrício: R$ 22.955,34",
"Éder: R$ 104.797,75",
"Rogério: R$ 104.797,85",
"Camila: R$ 14.867,87",
"Gabi: não identificada no padrão 2024",
"Capital de Giro explícito: R$ 396,81",
"13% legado sem atribuição nominal: R$ 449,87",
"💰 Total de destinações confirmadas: R$ 248.265,49",
"CR-TRELLO-ANNUAL-SUMMARY-V3"
].join("\n");
const d25=[
"📊 RESUMO ANUAL 2025",
"📋 Obras finalizadas: 375",
"💰 Faturamento anual reconciliado: R$ 773.950,45",
"⚠️ RENTABILIDADE ANUAL", "O lucro anual permanece PARCIALMENTE CONFIRMADO",
"CR-TRELLO-ANNUAL-SUMMARY-2025-RECON-V2"
].join("\n");
test("2024 historical breakdown matches exact Trello annual rates and flags inconsistency",()=>{
const a=fn.annual2024({name:"RESUMO ANUAL 2024 — 334 OBRAS",desc:d24,id:"6ab1b9314159bc6227a4efea"});
assert.equal(a.declared_by_person_cents.eder,10479775);
assert.equal(a.declared_by_person_cents.rogerio,10479785);
assert.equal(a.declared_by_person_cents.fabricio,2295534);
assert.equal(a.gross_cents,48635365);
assert.equal(a.cost_cents,23701565);
assert.equal(a.declared_profit_cents,23635671);
assert.equal(a.sum_declared_shares_cents,24826549);
assert.equal(a.bank_withdrawal_proof,false);
assert.equal(a.issues_count,54);
});
test("2025 gross confirmed, but profits/withdrawals not invented",()=>{
const a=fn.annual2025({name:"RESUMO ANUAL 2025 — 375 OBRAS",desc:d25,id:"6ab1c5c887007ac7e2368b2f"});
assert.equal(a.gross_cents,77395045);assert.equal(a.cases,375);
assert.equal(a.declared_profit_cents,null);
assert.equal(a.declared_by_person_cents,null);
});
test("fails closed on invalid historical source",()=>{
assert.throws(()=>fn.annual2024({name:"Other",desc:d24}),/FINANCIAL_2024_SOURCE_NOT_CANONICAL/);
assert.throws(()=>fn.annual2025({name:"RESUMO ANUAL 2025",desc:d25.replace("CR-TRELLO-ANNUAL-SUMMARY-2025-RECON-V2","OTHER")}),/FINANCIAL_2025_SOURCE_NOT_CANONICAL/);
assert.throws(()=>fn.annual2024({name:"RESUMO ANUAL 2024",desc:d24.replace("R$ 104.797,75","R$ 999.797,75")}),/FINANCIAL_2024_TOTAL_NOT_EQUAL_ITEMS/);
});
test("named worker aliases remain explicit or flagged not silently treated as João Victor",()=>{
assert.equal(fn.supportBeneficiary("Outro prestador (identificar)","21/09 R$100,00 Diária Rafaele"),"Rafa / Rafaele (conferir identidade)");
assert.equal(fn.supportBeneficiary("Outro prestador (identificar)","21/09 R$100,00 Diária Bia"),"Bia (conferir identidade)");
assert.equal(fn.supportBeneficiary("João (identificação a confirmar)","12/05 R$120,00 Diária João"),"João (identificação a confirmar)");
});
test("support sources are read-only, 2023 remains bank-only",()=>{
assert.match(ts,/if\(year==="2023"\)return output\(\{ok:true,year:2023,bank_only:true/);
assert.match(ts,/if\(u\.searchParams\.get\("kind"\)==="support"\)/);
assert.match(ts,/cr_finance_v12_support_2026_source/);
assert.match(ts,/bank_annotations_are_separate_from_costs:true/);
assert.match(ts,/bank_withdrawal_proof:false/);
assert.match(ts,/if\(req\.method!=="GET"\)/);
assert.doesNotMatch(html,/TRELLO_API_KEY|SUPABASE_SERVICE_ROLE_KEY/);
});
test("official dashboard shows all business partners, daily workers and historical sources",()=>{
for(const x of ["tile(\"Gabrielly\"","tile(\"Éder\"","tile(\"Fabrício\"","tile(\"Rogério\"","tile(\"Ágata (histórico)\"","cr-v12-historical-2024","cr-v12-historical-2025","cr-v12-earnings-other","2023 continua exclusivamente"])assert.ok(html.includes(x),x);
});
test("all official inline JavaScript parses",()=>{
const rx=/<script([^>]*)>([\s\S]*?)<\/script>/gi;let a,n=0;
while((a=rx.exec(html))){if(!a[2].trim()||/type=["'](?:application\/json|application\/ld\+json)["']/i.test(a[1]))continue;new vm.Script(a[2],{filename:"official-inline-"+(++n)+".js"});}
assert.ok(n>=18);
});
