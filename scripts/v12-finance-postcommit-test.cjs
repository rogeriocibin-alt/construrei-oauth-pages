"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const filename=path.join(__dirname,"../supabase/functions/cr-finance-v12-postcommit-sync/index.ts");
const source=fs.readFileSync(filename,"utf8").replace(/^import .*?;\r?\n/,"");
let handler;
const sandbox={
 Deno:{env:{get:k=>k==="SUPABASE_SERVICE_ROLE_KEY"?"test-only-jwt":""},serve:f=>{handler=f}},
 Response,Request,URL,AbortSignal,Intl,Date,Set,Map,Math,Number,String,JSON,Error,RegExp,
 fetch:async()=>{throw Error("NO_NETWORK_IN_UNIT_TEST")}
};
vm.createContext(sandbox);
vm.runInContext(source+"\nthis.unit={section,periodCodes,monthlyText,annualText,brl,amt};",sandbox);
const {section,periodCodes,monthlyText,annualText,brl,amt}=sandbox.unit;
const codes=["128-26","682-26","755-26","824-26","831-26","836-26","844-26","845-26"];
const base=[94500,390000,649071,72000,26000,174379,251826,630541];
const costs=[80445,293869,528788,43320,14810,127259,152593,448146];
const period="2026-11-07_2026-11-19";
const oldMarker="CR-ACERTO-PERIODO|2026-10-24_2026-11-06|647-26,650-26,700-26,781-26,801-26,805-26,806-26,808-26,809-26,812-26,827-26,828-26";
const marker="CR-ACERTO-PERIODO|"+period+"|"+codes.join(",");
const month=[
 "CONSTRU-REI | GESTÃO FINANCEIRA",
 "✅ ACERTOS CONFIRMADOS: 1 corte",
 "🏗️ OBRAS ACERTADAS: 12 obras",
 "💵 Base financeira: R$ 12.902,05",
 "💸 Custos contabilizados nas obras: R$ 8.091,02",
 "💰 LUCRO LÍQUIDO: R$ 4.811,03 | Margem: 37,29%",
 oldMarker,
 "📋 ACERTOS REGISTRADOS — 2026-11-07 A 2026-11-19",
 "🏗️ Obras: 8",
 "💵 Base financeira das obras: R$ 22.883,17",
 "💸 Custos: R$ 16.892,30",
 "💰 Lucro líquido: R$ 5.990,87",
 "Fabrício: R$ 1.198,18",
 "Éder: R$ 1.677,44",
 "Rogério: R$ 1.677,44",
 "Gabrielly: R$ 838,73",
 "Capital de Giro: R$ 317,46",
 "Osvaldo (10% das obras designadas): R$ 281,62",
 "REFERÊNCIAS DAS OBRAS",
 ...codes.map((code,i)=>"• "+code+" | Base "+brl(base[i])+" | Custos "+brl(costs[i])+" | Lucro "+brl(base[i]-costs[i])+" | https://trello.com/c/test"+i),
 marker
].join("\n");
const result=section(month,period);
assert.equal(result.base,2288317);
assert.equal(result.costs,1689230);
assert.equal(result.profit,599087);
assert.equal(result.cg,31746);
assert.equal(result.osvaldo,28162);
assert.equal(result.count,8);
assert.equal(result.fab,119818);
assert.equal(result.eder,167744);
assert.equal(result.rog,167744);
assert.equal(result.gabi,83873);
const monthly=monthlyText(month,{gross_cents:3578522,costs_cents:2498332,profit_cents:1080190},period);
assert.equal(monthly.work_count,20);
assert(monthly.desc.includes("20 obras únicas"));
assert(monthly.desc.includes("R$ 35.785,22"));
assert.equal(monthlyText(monthly.desc,{gross_cents:3578522,costs_cents:2498332,profit_cents:1080190},period).desc,monthly.desc);
assert.throws(()=>section(month.replace("💸 Custos: R$ 16.892,30","💸 Custos: R$ 16.893,30"),period),/ARITHMETIC_MISMATCH/);
assert.throws(()=>periodCodes(month+"\n"+oldMarker),/DUPLICATED_PERIOD_MARKER/);
assert.throws(()=>periodCodes(month+"\nCR-ACERTO-PERIODO|2026-11-20_2026-11-25|128-26"),/DUPLICATED_WORK/);
const annualSample=[
 "📊 CONSTRU-REI | RESUMO ANUAL FINANCEIRO 2026",
 "💵 BRUTO DECLARADO: R$ 496.125,97",
 "💸 CUSTOS DECLARADOS: R$ 333.630,63",
 "✅ LUCRO LÍQUIDO DECLARADO: R$ 162.495,24",
 "📊 MARGEM DECLARADA: 32,75%",
 "🧮 BRUTO − CUSTOS: R$ 162.495,34",
 "NOV | R$ 12.902,05 / R$ 8.091,02 / R$ 4.811,03",
 "• NOV: R$ 12.902,05 bruto / R$ 8.091,02 custos / R$ 4.811,03 lucro (12 obras)",
 "CR-FINANCE-MONTHLY-SOURCE-2026-V3"
].join("\n");
const args=[
 "2026-11",
 {gross_cents:3578522,costs_cents:2498332,profit_cents:1080190},
 {gross_cents:51900914,costs_cents:35052293,profit_cents:16848611},
 period,20
];
const annual=annualText(annualSample,...args);
assert(annual.title.includes("R$ 519.009,14"));
assert(annual.desc.includes("R$ 168.486,11"));
assert(annual.desc.includes("R$ 168.486,21")); // February historical gap is preserved.
assert(annual.desc.includes("NOV | R$ 35.785,22"));
assert.equal(annualText(annual.desc,...args).desc,annual.desc);
(async()=>{
 const denied=await handler(new Request("https://example.invalid/sync",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({period_key:period})}));
 assert.equal(denied.status,403);
 const ping=await handler(new Request("https://example.invalid/sync"));
 assert.equal(ping.status,200);
 const h=await ping.json();
 assert.equal(h.writes_only_after_committed,true);
 assert(!source.includes("https://api.cora"));
 console.log("PASS: eight works, rates, capital/Osvaldo, historical difference, 2 duplicate guards, authentication, idempotent display.");
})().catch(e=>{console.error(e);process.exitCode=1});
