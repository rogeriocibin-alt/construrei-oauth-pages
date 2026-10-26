'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const edge=fs.readFileSync(path.join(__dirname,'../candidates/financeiro-v12-period-close-20261024/index.ts'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
const at=edge.indexOf('async function recoverySelection(b:any)'),end=edge.indexOf('/* Indicador comercial',at);
assert.ok(at>0&&end>at);
const src=edge.slice(at,end)
 .replace('recoverySelection(b:any)','recoverySelection(b)')
 .replace('recoverPeriod(b:any,commit:boolean)','recoverPeriod(b,commit)')
 .replace('new Map<string,string>()','new Map()')
 .replaceAll('(x:any)','(x)')
 .replaceAll('(t:string)','(t)')
 .replaceAll('(no:string)','(no)')
 .replaceAll('(c:string)','(c)')
 .replace('const moved:string[]','const moved')
 .replace('const unresolved:string[]','const unresolved')
 .replaceAll('String((e as Error)?.message||e)','String(e?.message||e)');
const FIN='monthly',WORK='operational';
const monthId='a'.repeat(24),listPending='b'.repeat(24),listTarget='c'.repeat(24);
const ids={'579-26':'lsg5ojHi','799-26':'CJ27HA7S'};
const p={start:'2026-10-10',end:'2026-10-23',month:10,monthName:'OUTUBRO',cases:['579-26','799-26']};
const marker='CR-ACERTO-PERIODO|2026-10-10_2026-10-23|579-26,799-26';
const doc=[
 '📋 ACERTOS REGISTRADOS — 2026-10-10 A 2026-10-23',
 '• 579-26 | Base R$ 1.850,00 | Custos R$ 1.317,37 | Lucro R$ 532,63 | https://trello.com/c/lsg5ojHi',
 '• 799-26 | Base R$ 2.830,22 | Custos R$ 1.860,22 | Lucro R$ 970,00 | https://trello.com/c/CJ27HA7S',
 marker
].join('\n');
function rig({record=true,foreign=false,failMove=false,initial={},ledger=null}={}){
 const movement={...{'579-26':listTarget,'799-26':listPending},...initial};
 const requests=[];
 const items=Object.keys(ids).map(no=>({case:no,id:ids[no],name:'Orçamento '+no}));
 const trello=async(url,method='GET',payload)=>{
  requests.push({url,method,payload});
  if(url.startsWith('/lists/'+FIN+'/cards'))return[{id:monthId,name:'OUTUBRO 2026',desc:record?doc:'outro texto',shortUrl:'https://trello.com/c/october'}];
  if(url.startsWith('/boards/'+WORK+'/lists'))return[
   {id:listPending,name:'AG. ACERTO'}, {id:listTarget,name:'10. OUTUBRO 26'}];
  const id=url.match(/\/cards\/(\w+)/)?.[1];
  const found=items.find(x=>x.id===id);
  if(!found)throw Error('CARD_NOT_FOUND '+url);
  if(method==='PUT'){
   if(failMove)throw Error('SIMULATED_TIMEOUT');
   movement[found.case]=payload.idList;return {};
  }
  return {id:found.id,idList:foreign?('d'.repeat(24)):movement[found.case],
   name:found.name,shortUrl:'https://trello.com/c/'+found.id};
 };
 const sandbox={
  input:()=>p,trello,FIN,WORK,
  normal:s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase(),
  readAllMonthCommentTexts:async()=>[],
  marker:()=>marker,sha:async()=>JSON.stringify(movement),
  periodRegistryLookup:async()=>ledger,
  periodRegistry:async(action,payload)=>{requests.push({url:'ledger',method:'CHECKPOINT',action,payload});return {ok:true,status:payload.p_status}},
  ans:()=>null
 };
 vm.runInNewContext(src+'\nthis.resume=recoverPeriod',sandbox);
 return {resume:sandbox.resume,requests,movement};
}
test('prévia recupera somente corte já presente e identifica obras faltantes',async()=>{
 const h=rig();const pre=await h.resume(p,false);
 assert.equal(pre.preview,true);assert.equal(pre.writes,false);
 assert.deepEqual(Array.from(pre.already_moved),['579-26']);
 assert.deepEqual(Array.from(pre.pending_move),['799-26']);
 assert.equal(h.requests.filter(x=>x.method!=='GET').length,0);
});
test('confirmação com fingerprint move APENAS obra pendente, sem escrever acerto nem CG',async()=>{
 const h=rig(),pre=await h.resume(p,false);
 const out=await h.resume({...p,fingerprint:pre.fingerprint},true);
 assert.equal(out.ok,true);assert.deepEqual(Array.from(out.moved),['799-26']);
 assert.deepEqual(Array.from(out.already_moved),['579-26']);
 assert.equal(out.no_accounting_writes,true);
 const writes=h.requests.filter(x=>x.method!=='GET');
 assert.equal(writes.length,1);
 assert.match(writes[0].url,/\/cards\/CJ27HA7S/);
 assert.equal(writes[0].payload.idList,listTarget);
});
test('segunda execução é idempotente e não movimenta outra vez',async()=>{
 const h=rig(),pre=await h.resume(p,false);
 await h.resume({...p,fingerprint:pre.fingerprint},true);
 const next=await h.resume(p,false);
 const done=await h.resume({...p,fingerprint:next.fingerprint},true);
 assert.equal(done.ok,true);assert.equal(done.moved.length,0);
 assert.equal(done.already_moved.length,2);
 assert.equal(h.requests.filter(x=>x.method==='PUT').length,1);
});
test('prévia alterada ou período não registrado bloqueiam gravação',async()=>{
 const h=rig();
 await assert.rejects(h.resume({...p,fingerprint:'invalid'},true),/RECOVERY_STALE_PREVIEW/);
 const missing=rig({record:false});
 await assert.rejects(missing.resume(p,false),/RECOVERY_FULL_PERIOD_RECORD_NOT_UNIQUE/);
 assert.equal(h.requests.filter(x=>x.method==='PUT').length,0);
});
test('obra fora da lista prevista impede movimentação',async()=>{
 const h=rig({foreign:true});
 await assert.rejects(h.resume(p,false),/RECOVERY_WORK_OUTSIDE_ALLOWED_LIST/);
 assert.equal(h.requests.filter(x=>x.method==='PUT').length,0);
});
test('falha de PUT gera parcial, permite reconsulta sem nova gravação de acerto',async()=>{
 const h=rig({failMove:true}),pre=await h.resume(p,false);
 const out=await h.resume({...p,fingerprint:pre.fingerprint},true);
 assert.equal(out.ok,false);assert.equal(out.partial,true);
 assert.equal(out.unresolved.length,1);
 assert.equal(h.requests.filter(x=>x.method==='PUT').length,1);
});
test('recuperação é exclusiva do diretor; formulário exige confirmação',()=>{
 assert.match(edge,/if\(!await director\(req\)\)return/);
 assert.match(edge,/action==="recovery-preview"\|\|action==="recovery-commit"/);
 assert.match(html,/id="crp-recovery-cases"/);
 assert.match(html,/id="crp-recovery-confirm"[^>]*disabled/);
 assert.match(html,/if\(!confirm\("Confirma movimentar SOMENTE/);
 assert.match(html,/await crpApi\("recovery-preview",input\)/);
 assert.match(html,/await crpApi\("recovery-commit",CRP_RECOVERY\)/);
});

test('recuperação total encerra estado PARTIAL do ledger, sem novos valores',async()=>{
 const h=rig({ledger:{period_key:'2026-10-10_2026-10-23',fingerprint:'a'.repeat(64),status:'PARTIAL'}});
 const pre=await h.resume(p,false);
 const out=await h.resume({...p,fingerprint:pre.fingerprint},true);
 assert.equal(out.ok,true);
 const status=h.requests.filter(x=>x.method==='CHECKPOINT');
 assert.equal(status.length,1);
 assert.equal(status[0].payload.p_status,'COMMITTED');
 assert.equal(status[0].payload.p_month_card_id,monthId);
 assert.equal(h.requests.filter(x=>x.method==='PUT').length,1);
});
test('ledger em revisão exige conciliação sem declarar conclusão',async()=>{
 const h=rig({ledger:{fingerprint:'a'.repeat(64),status:'REVIEW_REQUIRED'}});
 const pre=await h.resume(p,false);
 const out=await h.resume({...p,fingerprint:pre.fingerprint},true);
 assert.equal(out.ok,false);
 assert.equal(out.partial,true);
 assert.ok(out.unresolved.some(x=>String(x).includes('REGISTRO_DO_PERIODO')));
});
