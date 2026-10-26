'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const edge=fs.readFileSync(path.join(__dirname,'../candidates/financeiro-v12-period-close-20261024/index.ts'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
const begin=edge.indexOf('async function cgPeriodService('),end=edge.indexOf('async function gather(',begin);
assert.ok(begin>0&&end>begin);
const js=edge.slice(begin,end).replace('action:string,p:any,session:string,fingerprint?:string','action,p,session,fingerprint')
 .replace('const body:any','const body').replace('p:any,rows:any[],expected:number,session:string','p,rows,expected,session')
 .replaceAll('(x:any)','(x)').replaceAll('(x:string,i:number)','(x,i)');
const period={start:'2026-10-24',end:'2026-10-26'};
const rows=[{case:'799-26'},{case:'818-26'}],fingerprint='a'.repeat(64);
const sourceUrl='https://trello.com/c/sa0x7eVL';
function fake({capital=9000,works=2,cases=['799-26','818-26'],source=sourceUrl,noWrite=true,session='test-director-session'}={}){
 const calls=[];
 const plan={ok:true,preview:true,no_write:noWrite,capital_cents:capital,works,source_url:source,fingerprint};
 const desc=cases.map((x,i)=>String(i+1)+'️⃣ '+x+' | Cliente JBA\nCapital de Giro: R$ 45,00').join('\n')+'\n📋 RESUMO\n';
 const sandbox={
  SB:'https://example.supabase.co',
  fetch:async(u,opt)=>{calls.push({type:'fetch',u,opt});return {ok:true,status:200,json:async()=>u.endsWith('close-preview')?plan:{ok:true,created:true,card_url:'https://trello.com/c/new-cg'}};},
  trello:async u=>{calls.push({type:'trello',u});return {desc,shortUrl:sourceUrl}},
  AbortSignal:{timeout:()=>null}
 };
 vm.runInNewContext(js+'\nthis.plan=cgCreationPlan;this.service=cgPeriodService',sandbox);
 return {plan:p=>sandbox.plan(period,p,9000,session),service:sandbox.service,calls};
}
test('CG: reusa serviço canônico, autentica diretor e compara códigos',async()=>{
 const h=fake(),p=await h.plan(rows);
 assert.equal(p.fingerprint,fingerprint);assert.equal(p.capital_cents,9000);
 assert.deepEqual(Array.from(p.case_ids),['799-26','818-26']);
 assert.equal(h.calls.filter(x=>x.type==='fetch').length,1);
 assert.match(h.calls.find(x=>x.type==='fetch').u,/cr-trello-capital-giro-v1\?action=close-preview/);
 assert.equal(h.calls[0].opt.headers['x-cr-session'],'test-director-session');
});
test('CG: valor, quantidade, obra ou origem distintos bloqueiam fechamento',async()=>{
 await assert.rejects(fake({capital:9100}).plan(rows),/CG_PREVIEW_DIFFERENT_ACERTO/);
 await assert.rejects(fake({works:3}).plan(rows),/CG_PREVIEW_DIFFERENT_ACERTO/);
 await assert.rejects(fake({cases:['799-26','579-26']}).plan(rows),/CG_SOURCE_WORKS_DIFFER/);
 await assert.rejects(fake({source:'https://trello.com/c/other'}).plan(rows),/CG_SOURCE_MISMATCH/);
 await assert.rejects(fake({noWrite:false}).plan(rows),/CG_PREVIEW_UNVERIFIED/);
});
test('CG: commit encaminha fingerprint, sem escrever no Cora',async()=>{
 const h=fake(),r=await h.service('close-commit',period,'test-director-session',fingerprint);
 assert.equal(r.created,true);
 const request=h.calls[0];
 assert.match(request.u,/cr-trello-capital-giro-v1\?action=close-commit/);
 assert.equal(JSON.parse(request.opt.body).fingerprint,fingerprint);
 assert.equal(h.calls.filter(x=>x.type==='trello').length,0);
 assert.doesNotMatch(js,/api\.cora\.com\.br|manual-cora-commit/);
});
test('CG: ausência de sessão não acessa serviço externo',async()=>{
 const h=fake();
 await assert.rejects(h.service('close-preview',period,'bad'),/CG_DIRECTOR_SESSION_MISSING/);
 assert.equal(h.calls.length,0);
});
test('CG: após gerar cartão, reconfere obras e valor antes de enviar acerto',()=>{
 assert.match(edge,/const after=await gather\(b,req\.headers\.get\("x-cr-session"\)\|\|""\)/);
 assert.match(edge,/after\.work_fingerprint!==c\.work_fingerprint\|\|!after\.capital_validation\.ok/);
 assert.match(edge,/CAPITAL_CREATED_MONTH_PENDING_REVIEW/);
 assert.match(html,/if\(!cv\.ok&&!cv\.accepted_exception&&!cv\.can_create\)/);
 assert.match(html,/giroNovo/);
});
