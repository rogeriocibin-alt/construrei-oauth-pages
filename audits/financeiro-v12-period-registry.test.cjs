'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const ts=fs.readFileSync(path.join(root,'candidates/financeiro-v12-period-close-20261024/index.ts'),'utf8');
const sql=fs.readFileSync(path.join(root,'candidates/financeiro-v12-period-close-20261024/period-send-registry-CANDIDATE.sql'),'utf8');
const a=ts.indexOf('async function periodRegistry('),b=ts.indexOf('async function cgPeriodService(',a);
assert.ok(a>0&&b>a);
const source=ts.slice(a,b).replace('action:string,payload:any','action,payload');
const fp='a'.repeat(64),key='2026-10-24_2026-10-26';
function rig({sessionKey='mock-service-role-only',serverStatus=200,response={ok:true,claimed:true,status:'PENDING'}}={}){
 const reqs=[];
 const ctx={Deno:{env:{get:()=>sessionKey}},SB:'https://example.supabase.co',
  fetch:async(url,opt)=>{reqs.push({url,opt});return{ok:serverStatus===200,status:serverStatus,json:async()=>response}},
  AbortSignal:{timeout:()=>null}};
 vm.runInNewContext(source+'\nthis.call=periodRegistry;',ctx);
 return {call:ctx.call,reqs};
}
test('unique period key, RLS, service-only access and no bank or cost mutations',()=>{
 assert.match(sql,/period_key text PRIMARY KEY/);
 assert.match(sql,/ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/REVOKE ALL ON public\.cr_finance_2026_period_send_registry_v12 FROM PUBLIC,anon,authenticated/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.cr_finance_v12_period_claim\(text,text\) FROM PUBLIC,anon,authenticated/);
 assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.cr_finance_v12_period_claim\(text,text\) TO service_role/);
 assert.match(sql,/ON CONFLICT DO NOTHING/);
 assert.doesNotMatch(sql,/INSERT INTO public\.cr_finance_v12_operations|UPDATE public\.cr_working_capital_periods_v1|api\.cora\.com\.br/i);
});
test('módulo chama apenas RPC privada com credencial Edge',async()=>{
 const h=rig(),r=await h.call('claim',{p_period_key:key,p_fingerprint:fp});
 assert.equal(r.claimed,true);
 assert.match(h.reqs[0].url,/\/rpc\/cr_finance_v12_period_claim/);
 assert.equal(h.reqs[0].opt.headers.apikey,'mock-service-role-only');
 assert.equal(h.reqs[0].opt.headers.Authorization,'Bearer mock-service-role-only');
 assert.equal(JSON.parse(h.reqs[0].opt.body).p_period_key,key);
});
test('sem service role ou reserva pré-existente bloqueia um novo lançamento',async()=>{
 const missing=rig({sessionKey:''});
 await assert.rejects(missing.call('claim',{p_period_key:key,p_fingerprint:fp}),/PERIOD_REGISTRY_SERVICE_UNAVAILABLE/);
 assert.equal(missing.reqs.length,0);
 const busy=rig({response:{ok:false,claimed:false,error:'PERIOD_ALREADY_RESERVED_REVIEW'}});
 await assert.rejects(busy.call('claim',{p_period_key:key,p_fingerprint:fp}),/PERIOD_ALREADY_RESERVED_REVIEW/);
});
test('falha HTTP não produz sucesso',async()=>{
 const h=rig({serverStatus:503});
 await assert.rejects(h.call('claim',{p_period_key:key,p_fingerprint:fp}),/PERIOD_REGISTRY_HTTP_503/);
});
test('ordem de efeitos: claim -> CG -> gravação mensal -> verificação -> checkpoint final',()=>{
 const x=ts.slice(ts.indexOf('Deno.serve(async req'));
 const idx=s=>x.indexOf(s);
 assert.ok(idx('const claim=await periodRegistry("claim"')>0);
 assert.ok(idx('const claim=await periodRegistry("claim"')<idx('cgPeriodService("close-commit"'));
 assert.ok(idx('const claim=await periodRegistry("claim"')<idx('if(!c.month)c.month=await provisionMonth(c)'));
 assert.ok(idx('p_status:"MONTH_RECORDED"')>idx('if(confirmed.desc!==next)throw'));
 assert.ok(idx('p_status:fail.length?"PARTIAL":"COMMITTED"')>idx('for(let i=0;i<c.cards.length;i++)'));
 assert.match(x,/p_status:"REVIEW_REQUIRED"/);
});
test('status registry não representa transferência, pagamento, retirada ou custo',()=>{
 assert.match(ts,/no_accounting_writes:true/);
 assert.doesNotMatch(source,/trello\("\/cards|manual-cora-commit|api\.cora\.com\.br/);
 assert.match(sql,/CHECK \(status IN \('PENDING','CG_RECORDED','MONTH_RECORDED','PARTIAL','COMMITTED','REVIEW_REQUIRED'\)\)/);
});
