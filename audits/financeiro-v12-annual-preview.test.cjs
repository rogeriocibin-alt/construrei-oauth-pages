'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const edge=fs.readFileSync(path.join(root,'candidates/financeiro-v12-period-close-20261024/index.ts'),'utf8');
const html=fs.readFileSync(path.join(root,'preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
const start=edge.indexOf('async function annualPreview2026()'),end=edge.indexOf('/* Indicador comercial:',start);
assert.ok(start>0&&end>start);
const js=edge.slice(start,end)
 .replace('new Set<string>()','new Set()')
 .replace('issues:string[]','issues')
 .replace('declared:any','declared')
 .replaceAll('(x:any)','(x)');
const rows=[
 {year_month:'2026-01',source_status:'DECLARED_UNRECONCILED',gross_cents:1623558,costs_cents:912011,declared_profit_cents:711547,source_card_url:'https://trello.com/c/jan'},
 {year_month:'2026-02',source_status:'DECLARED_UNRECONCILED',gross_cents:1432061,costs_cents:912798,declared_profit_cents:519253,source_card_url:'https://trello.com/c/fev'},
 {year_month:'2026-10',source_status:'OPEN_UNCONFIRMED',gross_cents:null,costs_cents:null,declared_profit_cents:null}
];
function harness(data=rows,key='fake-service-role'){
 const calls=[];
 const sandbox={Deno:{env:{get:()=>key}},SB:'https://example.supabase.co',URL,
  AbortSignal:{timeout:()=>null},fetch:async(u,opt)=>{calls.push({u:String(u),opt});return{ok:true,status:200,json:async()=>data}}};
 vm.runInNewContext(js+'\nthis.read=annualPreview2026;',sandbox);
 return {read:sandbox.read,calls};
}
test('anual: distingue declarado de bancário, detecta 10 centavos e outubro aberto',async()=>{
 const h=harness(),r=await h.read();
 assert.equal(r.ok,true);assert.equal(r.writes,false);
 assert.equal(r.bank_confirmed,false);assert.equal(r.can_publish_annual,false);
 assert.equal(r.declared.months,2);assert.equal(r.arithmetic_gap_cents,10);
 assert.ok(r.issues.some(x=>x.includes('2026-02:DIFERENCA_10')));
 assert.ok(r.issues.some(x=>x.includes('2026-10:NAO_CONCILIADO')));
 assert.equal(h.calls.length,1);
 assert.equal(h.calls[0].opt.headers.Authorization,'Bearer fake-service-role');
});
test('anual: fonte duplicada bloqueada sem somar duas vezes',async()=>{
 const h=harness([rows[0],rows[0]]);
 await assert.rejects(h.read(),/ANNUAL_MONTH_DUPLICATE_OR_INVALID/);
});
test('anual: consulta não roda sem chave de serviço',async()=>{
 const h=harness(rows,'');
 await assert.rejects(h.read(),/ANNUAL_SOURCE_SERVICE_UNAVAILABLE/);
 assert.equal(h.calls.length,0);
});
test('anual: prévia em botão separado, sem alteração do cartão anual Trello',()=>{
 assert.match(edge,/if\(action==="annual-preview"\)return ans\(await annualPreview2026\(\)\)/);
 assert.match(html,/Conferir resumo anual 2026 — somente leitura/);
 assert.match(html,/await crpApi\("annual-preview",\{\}\)/);
 assert.doesNotMatch(js,/trello\(|\/cards\/|PUT|POST/);
});
