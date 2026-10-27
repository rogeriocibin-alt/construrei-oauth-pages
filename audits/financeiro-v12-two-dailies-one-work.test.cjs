"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const edge=fs.readFileSync(path.join(__dirname,"../candidates/financeiro-v12-period-close-20261024/cora-aprovisionamento-backend/index.ts"),"utf8");
const a=edge.indexOf("async function existingMatchCandidates("),b=edge.indexOf("async function existingLinksForCard(",a);
assert.ok(a>=0&&b>a);
const fn=edge.slice(a,b)
 .replace("p:ReturnType<typeof clean>,k:string,costCase:string=p.case","p,k,costCase=p.case")
 .replace("toleranceDays:number=1","toleranceDays=1")
 .replace("const matches:{match_key:string;line:string;cents:number}[]=[];","const matches=[];")
 .replaceAll("(c:any)","(c)").replaceAll("(x:any)","(x)");
const cases=[
 {id:"card799",name:"✅ (799-26) Encerrada",idList:"outubro",shortUrl:"https://trello.com/c/CJ27HA7S",
  desc:"Valor Fechado: R$ 1000,00\nCustos:\n22/10 - R$150,00 Apoio - EDER - Diária 1 - Ref. PIX\n23/10 - R$150,00 Apoio - EDER - Diária 2 - Ref. PIX\nTotal Custos: R$ 300,00"},
 {id:"card818",name:"✅ (818-26) Encerrada",idList:"outubro",shortUrl:"https://trello.com/c/pqCRLtJY",
  desc:"Custos:\n23/10 - R$150,00 Apoio - EDER - Diária 3 - Ref. PIX\nTotal Custos: R$ 150,00"}
];
const ctx=vm.createContext({
 BOARD_2026:"board2026",
 trelloApiRead:async url=>url.includes("/lists?")?[{id:"outubro",name:"10. OUTUBRO 26"}]:cases,
 caseInName:s=>(String(s).match(/(\d{1,5}-26)/)||[])[1]||null,
 shortLink:s=>s,
 card:async url=>cases.find(x=>x.shortUrl===url),
 amount:s=>Math.round(Number(String(s).replace(/\./g,"").replace(",","."))*100),
 sha256:async str=>crypto.createHash("sha256").update(str).digest("hex")
});
vm.runInContext(fn+"\nthis.scan=existingMatchCandidates",ctx);
const bank={operation_id:"CORA_fixture",case:"799-26",date:"2026-10-25",amount_cents:30000,direction:"OUT"};
test("two separate 150 daily lines may be selected inside one 300 parcel for a settled work",async()=>{
 const result=await ctx.scan(bank,"mock","799-26",3,true);
 assert.equal(result.matches.length,2);
 assert.equal(result.matches[0].cents,15000);
 assert.equal(result.matches[1].cents,15000);
 assert.notEqual(result.matches[0].match_key,result.matches[1].match_key);
 assert.equal(result.matches.reduce((s,x)=>s+x.cents,0),30000);
});
test("a third 150 daily line in a second settled work completes exactly 450",async()=>{
 const a=await ctx.scan(bank,"mock","799-26",3,true),b=await ctx.scan({...bank,case:"818-26",amount_cents:15000},"mock","818-26",3,true);
 assert.equal(b.matches.length,1);
 assert.equal(a.matches.reduce((s,x)=>s+x.cents,0)+b.matches[0].cents,45000);
});
test("old exact-match mode never confuses a single 150 with a 300 parcel",async()=>{
 const a=await ctx.scan(bank,"mock","799-26",3,false);
 assert.equal(a.matches.length,0);
});
test("final reconciliation requires selected line set and amount by work",()=>{
 const code=edge.split("async function multiExistingFlow(")[1].split("async function multiFlow(")[0];
 assert.match(code,/matchKeys\.length<1\|\|matchKeys\.length>10/);
 assert.match(code,/new Set\(matchKeys\)\.size!==matchKeys\.length/);
 assert.match(code,/exact\.reduce\(\(s,x\)=>s\+\(x\?\.cents\|\|0\),0\)!==part\.cents/);
 assert.match(code,/matches\.push\(\{case:part\.case,cents:matched\.cents/);
});
