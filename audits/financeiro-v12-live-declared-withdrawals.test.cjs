"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"..");
const edge=fs.readFileSync(path.join(root,"candidates/financeiro-v12-trello-financial-summary-20261027/index.ts"),"utf8");
const html=fs.readFileSync(path.join(root,"production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html"),"utf8");
const pure=edge.slice(edge.indexOf("function parseBR("),edge.indexOf("function annual2024("))
  .replace("function parseBR(v:string)","function parseBR(v)")
  .replace("function sourceLine(section:string,re:RegExp):number|null","function sourceLine(section,re)")
  .replace("function annualSummary(card:any)","function annualSummary(card)");
const annualSummary=vm.runInNewContext('const CARD="6add3128f02eef0b8a7d69b5";'+pure+"\nannualSummary");
const desc=[
"CR-ANUAL-VALORES-RECEBIDOS-2026-PARCIAL-V2-20261025",
"BRUTO DOS ACERTOS REGISTRADOS (JAN–SET): R$ 444.914,01",
"CUSTOS DECLARADOS NOS RESUMOS: R$ 299.501,93",
"LUCRO LÍQUIDO DECLARADO: R$ 145.411,98",
"TOTAIS DE RATEIO/RETIRADAS DECLARADOS NOS FECHAMENTOS HISTÓRICOS",
"✅ Fabrício: R$ 30.331,23",
"✅ Éder: R$ 42.462,87",
"✅ Rogério: R$ 42.462,88",
"✅ Gabrielly: R$ 16.789,82",
"✅ Ágata histórica: R$ 3.451,53",
"🏦 Capital de Giro do rateio informado: R$ 15.018,75",
"📌 Soma das parcelas descritas: R$ 150.517,08",
"QUADRO MENSAL",
"Éder: R$ 99.999,99 [não pode contaminar a seção]"
].join("\n");
const sample={name:"📊 RESUMO ANUAL FINANCEIRO 2026",desc,id:"6add3128f02eef0b8a7d69b5",dateLastActivity:"2026-10-25T13:55:09Z"};
test("extracts whole Jan–Sep finance summary and no double counting",()=>{
const s=annualSummary(sample);
assert.equal(s.declared_by_person_cents.eder,4246287);
assert.equal(s.declared_by_person_cents.rogerio,4246288);
assert.equal(s.declared_by_person_cents.fabricio,3033123);
assert.equal(s.gross_cents,44491401);
assert.equal(s.declared_profit_cents,14541198);
assert.equal(s.declared_minus_profit_cents,510510);
assert.equal(s.profit_arithmetic_difference_cents,10);
assert.equal(s.bank_withdrawal_proof,false);
});
test("refuses summary with inconsistent partner shares",()=>{
assert.throws(()=>annualSummary({...sample,desc:desc.replace("R$ 42.462,87","R$ 52.462,87")}),/FINANCIAL_SHARES_SUM_MISMATCH/);
});
test("refuses wrong annual card version or source",()=>{
assert.throws(()=>annualSummary({...sample,desc:desc.replace("CR-ANUAL-VALORES-RECEBIDOS-2026-PARCIAL-V2-20261025","UNKNOWN_SOURCE")}),/FINANCIAL_SOURCE_NOT_CANONICAL/);
});
test("2023 must remain bank-only and other years cannot invent declared financial settlements",()=>{
assert.ok(edge.includes('if(year==="2023")return output({ok:true,year:2023,bank_only:true'));
assert.ok(edge.includes('const cardId=year==="2024"?CARD_2024:year==="2025"?CARD_2025:CARD;'));
assert.ok(edge.includes('if(u.searchParams.get("kind")==="support")'));
});
test("only GET authenticated; Trello key is backend-only, no write methods",()=>{
assert.ok(edge.includes('if(req.method!=="GET")'));
assert.ok(edge.includes('if(!await sessionValid(req))'));
assert.ok(!edge.includes('method:"PUT"')&&!edge.includes('method:"POST"'));
assert.ok(!html.includes("TRELLO_API_TOKEN")&&!html.includes("TRELLO_API_KEY"));
});
test("official dashboard includes separate declared shares, no replacement of cash history",()=>{
assert.ok(html.includes('id="cr-financial-trello-declared-2026"'));
assert.ok(!html.includes("TRELLO_FINANCIAL_PAYMENTS_ASSUMED"));
assert.ok(html.includes("cr-v12-financial-settlements-trello-20261027?year=2026"));
assert.ok(html.includes("2023: exclusivamente informações bancárias Cora"));
assert.ok(html.includes("cr-wdh-search"));
});
test("all executable inline scripts have valid syntax",()=>{
const tags=/<script([^>]*)>([\s\S]*?)<\/script>/ig;let x,n=0;
while((x=tags.exec(html))){
 if(!x[2].trim()||/type=["'](?:application\/json|application\/ld\+json)["']/i.test(x[1]))continue;
 new vm.Script(x[2],{filename:"official-"+(++n)+".js"});
}
assert.ok(n>=17);
});
