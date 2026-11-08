"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const backend=fs.readFileSync(path.join(root,"candidates/financeiro-v12-fechar-obra-guard-20261025/index.ts"),"utf8");
const html=fs.readFileSync(path.join(root,"production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html"),"utf8");

function inventoryHelper(){
 const start=backend.indexOf("function crFinanceInventoryReadOnly(");
 const end=backend.indexOf("async function boardBundle(name:string){",start);
 assert.ok(start>0&&end>start,"Inventário isolado da API não foi encontrado");
 const js=backend.slice(start,end)
 .replace("function crFinanceInventoryReadOnly(cards:any[],listNames:Map<string,string>,yearSuffix:string)","function crFinanceInventoryReadOnly(cards,listNames,yearSuffix)")
 .replace("const entries:any[]=[];","const entries=[];")
 .replace("let reason:string|null=null;","let reason=null;")
 .replace("new Map<string,number>()","new Map()");
 const context={
  norm:x=>String(x).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]+/g," ").trim().replace(/\s+/g," "),
  extractCase:x=>{const m=String(x||"").match(/\b(\d{1,5})\s*-\s*(\d{2})\b/);return m?m[1]+"-"+m[2]:null},
  financialParse:(c,list)=>({status:"FINALIZADO",gross_cents:c.gross??null,cost_cents:c.cost??null,profit_cents:c.gross!=null&&c.cost!=null?c.gross-c.cost:null,financial_source:{confidence:"MÉDIA"},issues:[]}),
  safe:(x,n)=>String(x||"").slice(0,n),Date,Map,String,Number,Array,RegExp
 };
 return vm.runInNewContext(js+"\ncrFinanceInventoryReadOnly",context);
}
const make=(id,name,list,closed=false,extra={})=>({id,name,idList:list,closed,dateLastActivity:"2026-11-08T16:00:00Z",shortUrl:"https://trello.com/c/"+id.slice(0,8),...extra});
test("cards idênticos têm IDs separados; aditivo 411-26 não é deduplicado",()=>{
 const run=inventoryHelper();
 const cards=[
  make("111111111111111111111111","✅ (411-26) Obra principal","month",false,{gross:179160,cost:130000}),
  make("222222222222222222222222","✅ (411-26) Aditivo legítimo orçamento 436-26","month",false,{gross:45000,cost:10000}),
  make("333333333333333333333333","✅ CANCELADO (0023-26) Desistência","archive",true,{gross:94000}),
  make("444444444444444444444444","RESUMO DA LISTA — 500 obras","month",true)
 ];
 const x=run(cards,new Map([["month","06. JUNHO 26"],["archive","ARQUIVADOS"]]),"26");
 assert.equal(x.scanned_cards,4);
 assert.equal(x.auxiliary_cards,1);
 assert.equal(x.indexed_cards,3);
 assert.equal(x.cards.filter(z=>z.work_code==="411-26").length,2);
 assert.ok(x.cards.filter(z=>z.work_code==="411-26").every(z=>z.same_work_code_count===2));
 assert.equal(x.cards.find(z=>z.work_code==="0023-26").archive_reason,"CANCELADO");
 assert.equal(x.cards.find(z=>z.work_code==="0023-26").provisional,null);
 assert.equal(x.cards.find(z=>z.work_code==="411-26").accounting_posted,false);
 assert.equal(x.cards.find(z=>z.work_code==="411-26").bank_received_confirmed,false);
});
test("card na lista ARQUIVADOS entra no histórico mesmo com closed=false",()=>{
 const run=inventoryHelper();
 const x=run([make("555555555555555555555555","🧪 (9999-26) TESTE","a",false,{gross:100,cost:0})],new Map([["a","ARQUIVADOS"]]),"26");
 assert.equal(x.cards[0].card_state,"IN_ARCHIVE_LIST");
 assert.equal(x.cards[0].provisional_only,false);
 assert.equal(x.cards[0].archive_reason,"TESTE");
});
test("inventário só expõe GET 2026 opcional, sem redefinir os métodos de lançamento",()=>{
 assert.match(backend,/filter:"all",fields:"id,name,desc,idList,labels/);
 assert.match(backend,/year==="2026"&&u\.searchParams\.get\("inventory"\)==="1"/);
 assert.match(backend,/if\(req\.method==="POST"&&api==="manual-close-work"\)/);
 assert.match(backend,/if\(req\.method==="POST"&&api==="manual-cora-commit"\)/);
 assert.match(backend,/if\(api==="acerto-live"\)/);
 assert.match(backend,/function primaryDedup\(rows:any\[\]\)/);
 assert.match(backend,/function canonicalAcertoRateio\(profit:number\|null\)/);
 assert.match(backend,/statement:"CONSULTA_INFORMATIVA_NAO_LANCAMENTO"/);
 assert.match(backend,/source:"TRELLO_LIVE_ALL_CARDS"/);
});
test("dashboard V12 mantém integração atual, agora requer leitura opcional do inventário",()=>{
 assert.match(html,/api\("api=year&year=2026&inventory=1"\)/);
 assert.match(html,/id="cr-finance-inventory-list"/);
 assert.match(html,/crFinanceInventoryRender/);
 assert.match(html,/cr-finance-v12-inventory-readonly/);
 assert.match(html,/cr-finance-v12-period-close-candidate-20261024/);
 assert.match(html,/cr-trello-capital-giro-v1/);
 assert.match(html,/manualCommit\(\)/);
 assert.doesNotMatch(html,/TRELLO_API_KEY|SUPABASE_SERVICE_ROLE_KEY/);
});
test("todos os scripts inline do V12 permanecem sintaticamente válidos",()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());
 assert.ok(scripts.length>=23);
 for(const code of scripts)assert.doesNotThrow(()=>new vm.Script(code));
});
