'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const edge=fs.readFileSync(path.join(root,'candidates/financeiro-v12-period-close-20261024/index.ts'),'utf8');
const sql=fs.readFileSync(path.join(root,'candidates/financeiro-v12-period-close-20261024/month-provision-registry-CANDIDATE.sql'),'utf8');
const html=fs.readFileSync(path.join(root,'preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
const i=edge.indexOf('async function monthRegistry('),j=edge.indexOf('// A month is the ONLY Trello financial card',i);
assert.ok(i>0&&j>i);
const js=edge.slice(i,j).replace('action:string,payload:any','action,payload').replace('c:any','c').replaceAll('(x:any)','(x)').replace('let created:any=null','let created=null').replace('(e as Error)','e');
const monthId='abcdefabcdefabcdefabcdef',name='NOVEMBRO 2026',tag='CR-MONTH-CANONICAL|2026-11';
const candidate={p:{month:11,monthName:'NOVEMBRO'},fingerprint:'b'.repeat(64)};
const card={id:monthId,idList:'6952fd5947e9864456eab14a',name,desc:'registro '+tag,shortUrl:'https://trello.com/c/test'};
function harness({claim=true,withExisting=false,failPost=false,finishStatus='COMMITTED'}={}){
 const calls=[];let created=false,finishPayload=null;
 const trello=async(uri,method='GET',payload=null)=>{
  calls.push({kind:'trello',uri,method,payload});
  if(uri==='/cards'&&method==='POST'){
   if(failPost)throw Error('SIMULATED_TRELLO_TIMEOUT');
   created=true;return {id:monthId};
  }
  if(uri.startsWith('/cards/'+monthId))return card;
  if(uri.startsWith('/lists/'))return (withExisting||created)?[card]:[];
  throw Error('unexpected '+uri);
 };
 const fetch=async(url,opt)=>{
  const action=url.includes('_month_claim')?'claim':'finish';
  const p=JSON.parse(opt.body);
  calls.push({kind:'db',action,payload:p});
  if(action==='finish')finishPayload=p;
  return {ok:true,json:async()=>action==='claim'?{ok:true,claimed:claim,status:claim?'PENDING':'COMMITTED'}:{ok:true,status:finishStatus,card_id:monthId}};
 };
 const sandbox={Deno:{env:{get:k=>k==='SUPABASE_SERVICE_ROLE_KEY'?'fake-service':'ignored'}},
  SB:'https://sample.supabase.co',fetch,AbortSignal:{timeout:()=>null},trello,
  FIN:'6952fd5947e9864456eab14a',normal:s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()};
 vm.runInNewContext(js+'\nthis.provision=provisionMonth',sandbox);
 return {provision:sandbox.provision,calls,getFinish:()=>finishPayload};
}
test('criação normal: reserva única antes de criar um cartão, lê e confirma',async()=>{
 const h=harness(),out=await h.provision(candidate);
 assert.equal(out.id,monthId);
 assert.equal(h.calls.filter(x=>x.kind==='trello'&&x.uri==='/cards'&&x.method==='POST').length,1);
 const claim=h.calls.findIndex(x=>x.kind==='db'&&x.action==='claim');
 const create=h.calls.findIndex(x=>x.kind==='trello'&&x.uri==='/cards');
 const finish=h.calls.findIndex(x=>x.kind==='db'&&x.action==='finish');
 assert.ok(claim>=0&&create>claim&&finish>create);
 assert.equal(h.getFinish().p_status,'COMMITTED');
 assert.equal(h.getFinish().p_card_id,monthId);
});
test('reserva concorrente ou mês já existente: nunca cria outro cartão',async()=>{
 const a=harness({claim:false});
 await assert.rejects(a.provision(candidate),/MONTH_CREATION_ALREADY_RESERVED_REVIEW/);
 assert.equal(a.calls.filter(x=>x.kind==='trello'&&x.uri==='/cards').length,0);
 const b=harness({withExisting:true});
 await assert.rejects(b.provision(candidate),/MONTH_CREATED_SINCE_PREVIEW_RELOAD/);
 assert.equal(b.calls.filter(x=>x.kind==='db'&&x.action==='claim').length,0);
});
test('timeout depois de reserva: exige revisão e não confirma mês',async()=>{
 const h=harness({failPost:true});
 await assert.rejects(h.provision(candidate),/MONTH_CREATION_UNCERTAIN_REVIEW_REQUIRED/);
 assert.equal(h.getFinish().p_status,'REVIEW_REQUIRED');
 assert.equal(h.calls.filter(x=>x.kind==='trello'&&x.uri==='/cards'&&x.method==='POST').length,1);
});
test('prévia aponta necessidade de criar mês; Copiar não ativa o envio',()=>{
 assert.match(edge,/requires_month_creation:!c\.month/);
 assert.match(html,/CARTÃO MENSAL AUSENTE/);
 assert.match(html,/CRP_LAST\.requires_month_creation/);
 assert.ok(edge.indexOf('if(b.fingerprint!==c.fingerprint)')<edge.indexOf('c.month=await provisionMonth(c)'));
 assert.match(edge,/MONTH_CREATED_SINCE_PREVIEW_RELOAD/);
 assert.match(html,/monthly text copy never/i.test(html)?/monthly text copy never/:/async function crpSend/);
});
test('reserva PostgreSQL é privada e não altera dados contábeis',()=>{
 assert.match(sql,/enable row level security/i);
 assert.match(sql,/revoke all on public\.cr_finance_2026_month_registry_v1 from public, anon, authenticated/i);
 assert.match(sql,/grant execute on function public\.cr_finance_2026_month_claim\(text,text\) to service_role/i);
 assert.match(sql,/on conflict do nothing/i);
 assert.doesNotMatch(sql,/update public\.cr_finance_v12_operations/i);
 assert.doesNotMatch(sql,/create\s+table\s+.*capital.*giro/i);
});
