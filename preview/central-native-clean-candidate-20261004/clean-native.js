(()=>{'use strict';
if(window.__CR_NATIVE_CLEAN_V1)return;window.__CR_NATIVE_CLEAN_V1=true;
window.__CR_NATIVE_HOME_OWNER=true;
const BUILD='CR-CENTRAL-NATIVE-GC-STATUS-BARS-20261004';
const FAST='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v12-1-candidate-20261003?view=public-home';
const PENDING='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes?api=pending-board';
const APP='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento';
const GC_STATUS='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-gestaoclick-orcamentos-status-candidate-20261004';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const brl=c=>c==null?'—':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(c)/100);
const state={fast:null,pending:null,gc:null,errors:{},timings:{},lastRefresh:null};
async function get(u,timeoutMs=8000){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeoutMs),started=performance.now();
 try{
  const r=await fetch(u+(u.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store',signal:ctrl.signal});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||d.ok===false)throw Error(d.error||('HTTP '+r.status));
  return {data:d,ms:Math.round(performance.now()-started)};
 }catch(err){
  if(err?.name==='AbortError')throw Error('TIMEOUT_'+timeoutMs+'ms');
  throw err;
 }finally{clearTimeout(timer)}
}
function stamp(){const e=$('#crHomeUpdated');if(e)e.textContent='Atualizado '+new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date())}
function card(cls,ic,l,v,d,s){return '<article class="cr-op-card '+cls+'"><div class="cr-op-top"><span class="cr-op-icon">'+ic+'</span><span class="cr-op-label">'+esc(l)+'</span></div><div class="cr-op-value">'+esc(v)+'</div><div class="cr-op-detail">'+esc(d)+'</div><div class="cr-op-status">'+esc(s)+'</div></article>'}
function renderKpis(){
 const h=$('#kpis');if(!h)return;
 const k=state.fast?.kpis||{},waiting=state.errors.fast?'Leitura rápida indisponível — nova tentativa automática':'Conectando…';
 h.innerHTML=[
  card('blue','⚙','Serviços em andamento',k.services_in_progress?.count??'—',state.fast?'Fonte operacional real':waiting,'Trello'),
  card('green','$','Aguardando pagamento',k.awaiting_payment?.count??'—',state.fast?brl(k.awaiting_payment?.amount_cents):waiting,'GestãoClick'),
  card('amber','✓','Aguardando acerto',k.awaiting_adjustment?.count??'—',state.fast?brl(k.awaiting_adjustment?.amount_cents):waiting,'GestãoClick')
 ].join('');
 stamp();
}
function pendingStats(arr){
 arr=Array.isArray(arr)?arr:[];
 return {
  blocked:arr.filter(x=>/BLOQUE/i.test([x.status,x.operational_status].join(' '))).length,
  waiting:arr.filter(x=>/AGUARD|DECIS|PEND/i.test([x.status,x.operational_status,x.next_step].join(' '))).length,
  corrections:arr.filter(x=>/CORRE|AJUST|REVIS/i.test([x.status,x.title,x.next_step].join(' '))).length
 };
}
function pendingCard(icon,label,open,arr,target,tone){
 const st=pendingStats(arr);
 return '<article class="cr-pending-card cr-live-pending '+esc(tone||'blue')+'"><div class="cr-pending-icon">'+icon+'</div><div class="cr-pending-copy"><h3>'+esc(label)+'</h3><div class="cr-pending-total">'+esc(open??0)+'</div><div class="cr-pending-lines"><span><i class="bad"></i>'+st.blocked+' bloqueada(s)</span><span><i class="warn"></i>'+st.waiting+' aguardando</span><span><i class="ok"></i>'+st.corrections+' ajuste/revisão</span></div></div><button class="btn primary" data-action="go" data-page-target="'+esc(target)+'">Abrir pendências</button></article>';
}
function renderPending(){
 const h=$('#boardSummary');if(!h)return;
 const b=state.pending;
 if(!b){
  h.innerHTML='<article class="cr-pending-card cr-inc-pending"><div class="cr-pending-icon">!</div><div class="cr-pending-copy"><h3>Pendências WIZY / APP / Éder</h3><div class="cr-pending-lines"><span>'+(state.errors.pending?'Fonte temporariamente indisponível — nova tentativa automática.':'Conectando à fonte de pendências…')+'</span></div></div></article>';
  return;
 }
 const s=b.summary||{},boards=b.boards||{};
 h.innerHTML=[
  pendingCard('▯','APP',s.app?.open??0,boards.app,'pendapp','blue'),
  pendingCard('⌘','WIZY',s.wizy?.open??0,boards.wizy,'wizy','purple'),
  pendingCard('♙','ÉDER',s.eder?.open??0,boards.eder,'eder','amber')
 ].join('');
}
function renderHealth(){
 const h=$('#homeHealth');if(!h)return;
 const s=state.fast?.sources||{},rows=[
  ['Banco de Dados',s.database?.ok,state.timings.fast],
  ['Trello',s.trello?.ok,state.timings.fast],
  ['GestãoClick',s.gestaoclick?.ok??(state.fast?true:(state.errors.fast?false:null)),state.timings.fast],
  ['Pendências',state.pending?true:(state.errors.pending?false:null),state.timings.pending]
 ];
 h.innerHTML=rows.map(([n,v,ms])=>'<article class="cr-health-card '+(v===true?'ok':'')+'"><div class="cr-health-label">'+esc(n)+'</div><div class="cr-health-value">'+esc(v===true?'Operacional':v===false?'Atenção':'Carregando')+'</div><div class="cr-health-sub">'+esc(v===true?('Fonte disponível'+(ms!=null?' • '+ms+' ms':'')):v===false?'Verificar integração':'Sem presumir estado')+'</div></article>').join('');
}
function renderAll(){renderKpis();renderPending();renderHealth()}
function patchReturns(){document.querySelectorAll('a[href]').forEach(el=>{const href=el.getAttribute('href')||'';if(/central-atendimento/.test(href)&&!/return=/.test(href)){try{const u=new URL(href,location.href);u.searchParams.set('return',location.href);el.setAttribute('href',u.toString())}catch(_){}}})}
let refreshing=false;
async function refresh(){
 if(refreshing)return;
 refreshing=true;
 if(!state.fast&&!state.pending)document.documentElement.dataset.crNativeState='loading';
 state.errors={};
 const load=async(key,url,apply,timeoutMs=8000)=>{
  try{
   const out=await get(url,timeoutMs);
   state[key]=out.data;
   state.timings=state.timings||{};
   state.timings[key]=out.ms;
   state.lastRefresh=new Date().toISOString();
   apply();
   document.documentElement.dataset.crNativeState='live';
  }catch(err){
   state.errors[key]=String(err);
   apply();
   if(!state.fast&&!state.pending)document.documentElement.dataset.crNativeState='error';
  }
 };
 await Promise.allSettled([
  load('fast',FAST,()=>{renderKpis();renderHealth();stamp()},8000),
  load('pending',PENDING,()=>{renderPending();renderHealth();stamp()},6500)
 ]);
 refreshing=false;
}

const MATURITY='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes';
const MATURITY_BASE='./maturity-audit.json?v=1';
const MATURITY_AX=[['management','Gestão e Visibilidade'],['finance','Financeiro / GestãoClick'],['technical','Base Técnica e Governança'],['data','Dados e Integrações'],['operation','Operação + Trello + Automações'],['central','Central / Ecossistema'],['flows','Esteira F00–F09'],['app','APP Operacional'],['service','Atendimento Integrado']];
const mClamp=n=>Math.max(0,Math.min(100,Math.round(n||0)));
const mTone=n=>n<45?'#e74c5c':n<65?'#d89a18':n<75?'#18aeb2':n<90?'#2d8fe5':'#1769b0';
const mText=n=>n<45?'Prioridade':n<60?'Estruturado':n<75?'Integrado':n<90?'Gerenciado':'Otimizado';
function mObjects(v,out=[]){if(!v)return out;if(Array.isArray(v)){v.forEach(x=>mObjects(x,out));return out}if(typeof v==='object'){out.push(v);Object.keys(v).forEach(k=>mObjects(v[k],out))}return out}
function mStatus(s){s=String(s||'').toUpperCase();if(/HOMOLOG|CONCLU|APROV|OPERACIONAL|PRODU/.test(s))return 1;if(/VALID|TEST|PRONTO/.test(s))return .78;if(/ANDAMENTO|IMPLEMENT|DESENV|EXECU/.test(s))return .55;if(/BLOQUE|AGUARD|PEND/.test(s))return .28;return .35}
function mFlow(objs,code){return objs.find(x=>String(x.code||x.id||'').toUpperCase()===code)}
function mArea(objs,re){return objs.filter(x=>re.test(String(x.area||x.module||x.code||x.title||''))&&(x.status||x.operational_status||x.implementation_status))}
function mCompletion(items){if(!items.length)return null;return items.reduce((a,x)=>a+mStatus(x.status||x.operational_status||x.implementation_status),0)/items.length}
function mGauge(id,n){const e=document.getElementById(id);if(!e)return;const t=id==='crMlAutonomy'?'#16b5a6':id==='crMlGeneral'?'#2087f2':mTone(n);e.style.setProperty('--p',n);e.style.setProperty('--tone',t);const b=e.querySelector('.cr-ml-ring b');if(b)b.textContent=n+'%';let chip=e.querySelector('.cr-ml-level');if(!chip){chip=document.createElement('span');chip.className='cr-ml-level';const box=e.lastElementChild;if(box)box.appendChild(chip)}if(chip)chip.textContent='NÍVEL • '+mText(n).toUpperCase()}
function mAxis(k,n,note,detail){const e=document.querySelector('[data-axis="'+k+'"]');if(!e)return;const t=mTone(n);e.style.setProperty('--tone',t);e.dataset.level=mText(n);const b=e.querySelector('.cr-ml-row b'),i=e.querySelector('.cr-ml-track i'),s=e.querySelector('small');if(b)b.textContent=n+'%';if(i)i.style.width=n+'%';if(s)s.textContent=mText(n)+' • '+note;if(detail)e.title=detail}
async function maturityGet(q,timeout){const out=await get(MATURITY+'?api='+q+'&maturity=1',timeout);return out.data}
let maturityBaseCache=null;
async function maturityBase(){
 if(maturityBaseCache)return maturityBaseCache;
 try{const r=await fetch(MATURITY_BASE,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);maturityBaseCache=await r.json();return maturityBaseCache}catch(_){return null}
}
function mEvidence(base,k,fallback){const a=base?.axes?.[k];return Array.isArray(a?.evidence)&&a.evidence.length?a.evidence[0]:fallback}
function mDetail(base,k){const a=base?.axes?.[k];if(!a)return'';const e=Array.isArray(a.evidence)?a.evidence.join(' • '):'';return e+(a.gap?' | Próximo: '+a.gap:'')}
function mBlend(base,k,liveScore,liveCount){const b=Number(base?.axes?.[k]?.score);if(!Number.isFinite(b))return mClamp(liveScore);if(!liveCount)return mClamp(b);const w=.18+.07*(liveCount/3);return mClamp(b*(1-w)+liveScore*w)}
let maturityRefreshing=false;
async function refreshMaturity(){
 if(maturityRefreshing||!document.getElementById('crMaturityLive'))return;
 maturityRefreshing=true;
 try{
  const [res,base]=await Promise.all([
   Promise.allSettled([maturityGet('public-summary',5000),maturityGet('development-summary',8000)]),
   maturityBase()
  ]);
  const pub=res[0].status==='fulfilled'?res[0].value:null,board=state.pending||null,dev=res[1].status==='fulfilled'?res[1].value:null;
  const live=[pub,board,dev].filter(Boolean).length,po=mObjects(pub),bo=mObjects(board),doo=mObjects(dev),all=po.concat(bo,doo);
  const flowVals=[];for(let i=0;i<10;i++){const f=mFlow(all,'F0'+i);if(f)flowVals.push(mStatus(f.implementation_status||f.status||f.operational_status))}
  const flowLive=flowVals.length?flowVals.reduce((a,b)=>a+b,0)/flowVals.length:null;
  const appC=mCompletion(mArea(bo,/APP/i)),serviceC=mCompletion(mArea(all,/ATEND|F00|F01/i));
  const liveM={
   management:mClamp(70+(pub?12:0)+(board?8:0)+(dev?5:0)),
   finance:mClamp(70+(pub?10:0)+(JSON.stringify(pub||{}).match(/gest[aã]o.?click|finance/ig)||[]).length*2),
   technical:mClamp(58+(dev?22:0)+(pub?8:0)+(board?7:0)),
   data:mClamp((live/3)*100),
   operation:mClamp(55+(board?10:0)+(pub?8:0)+(mCompletion(bo)||0)*22),
   central:mClamp(62+(pub?12:0)+(board?8:0)+(dev?8:0)),
   flows:mClamp(flowLive==null?45:35+flowLive*60),
   app:mClamp(appC==null?(board?45:30):35+appC*60),
   service:mClamp(serviceC==null?32:25+serviceC*68)
  };
  const m={};MATURITY_AX.forEach(([k])=>m[k]=mBlend(base,k,liveM[k],live));
  const weighted=MATURITY_AX.reduce((acc,[k])=>{const w=Number(base?.axes?.[k]?.weight)||1;acc.sum+=m[k]*w;acc.w+=w;return acc},{sum:0,w:0});
  const general=mClamp(weighted.w?weighted.sum/weighted.w:0);
  const liveAutonomy=mClamp(m.data*.18+m.operation*.17+m.flows*.22+m.app*.20+m.service*.23);
  const baseAut=Number(base?.autonomy?.score);
  const autonomy=Number.isFinite(baseAut)?mClamp(live?baseAut*.75+liveAutonomy*.25:baseAut):liveAutonomy;
  mGauge('crMlGeneral',general);mGauge('crMlAutonomy',autonomy);
  mAxis('management',m.management,mEvidence(base,'management','Dashboard + fontes executivas'),mDetail(base,'management'));
  mAxis('finance',m.finance,mEvidence(base,'finance','capacidade financeira embarcada'),mDetail(base,'finance'));
  mAxis('technical',m.technical,mEvidence(base,'technical','governança + saúde técnica'),mDetail(base,'technical'));
  mAxis('data',m.data,mEvidence(base,'data',live+'/3 fontes vivas respondendo'),mDetail(base,'data'));
  mAxis('operation',m.operation,mEvidence(base,'operation','Trello, automações e pendências'),mDetail(base,'operation'));
  mAxis('central',m.central,mEvidence(base,'central','Central e serviços integrados'),mDetail(base,'central'));
  mAxis('flows',m.flows,mEvidence(base,'flows',flowVals.length+'/10 fluxos com evidência'),mDetail(base,'flows'));
  mAxis('app',m.app,mEvidence(base,'app',appC==null?'sem evidência suficiente':'pendências e estados do APP'),mDetail(base,'app'));
  mAxis('service',m.service,mEvidence(base,'service',serviceC==null?'sem evidência suficiente':'F00/F01 e atendimento'),mDetail(base,'service'));
  const l=document.getElementById('crMlLive'),src=document.getElementById('crMlSource');
  if(l){l.textContent='● AUDITADO + LIVE • '+general+'%';l.style.background=live===3?'#e8f7ef':'#fff3d6';l.style.color=live===3?'#177349':'#8b6412'}
  if(src){const stamp=base?.audited_at?new Date(base.audited_at).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'checkpoint';src.textContent=live+'/3 fontes • base '+stamp;src.title=base?.scoring_note||'Maturidade estrutural auditada + evidência viva'}
  const foot=document.querySelector('#crMaturityLive .cr-ml-foot span:first-child');if(foot&&base?.leverage)foot.innerHTML='<b>Alavanca atual:</b> '+esc(base.leverage);
  window.CR_MATURITY={general,autonomy,axes:m,liveSources:live,base};
 }finally{maturityRefreshing=false}
}


// GestãoClick • barras executivas de status (fonte real, leitura assíncrona)
function gcRank(name){
 const n=String(name||'').toUpperCase();
 const order=[
  /NOVO|VISITA|AGEND/,
  /AN[ÁA]LISE/,
  /ELABORA|OR[ÇC]AMENTO/,
  /ENVIO|ENVIADO/,
  /AGUARDANDO APROVA|APROVA[ÇC][ÃA]O/,
  /^APROVADO$/,
  /ANDAMENTO|EXECU/,
  /RETORNO/,
  /PAGAMENTO/,
  /ACERTO|REVIS|AJUST/,
  /FINALIZ|CONCLU/,
  /N[ÃA]O APROV|REPROV/,
  /CANCEL/
 ];
 const i=order.findIndex(r=>r.test(n));return i<0?90:i;
}
function gcTone(name){
 const n=String(name||'').toUpperCase();
 if(/CANCEL/.test(n))return '#8ba0b5';
 if(/N[ÃA]O APROV|REPROV/.test(n))return '#e84b5b';
 if(/FINALIZ|CONCLU|^APROVADO$/.test(n))return '#28b567';
 if(/PAGAMENTO|ACERTO/.test(n))return '#f08a24';
 if(/AGUARDANDO APROVA/.test(n))return '#e9aa18';
 if(/ANDAMENTO|EXECU/.test(n))return '#6f5be8';
 if(/RETORNO/.test(n))return '#8d55d9';
 if(/ELABORA|OR[ÇC]AMENTO/.test(n))return '#13b8c8';
 if(/ENVIO|ENVIADO/.test(n))return '#49a9f8';
 if(/AN[ÁA]LISE/.test(n))return '#7c61df';
 return '#2488ef';
}
function gcSkeleton(){
 return '<div class="cr-gc-skeleton"><i></i><i></i><i></i><i></i></div>';
}
function renderGcStatuses(){
 const h=$('#crGcStatusRows'),meta=$('#crGcStatusMeta');if(!h)return;
 if(!state.gc){
  h.innerHTML=state.errors.gc
   ?'<div class="cr-gc-unavailable"><b>Dados temporariamente indisponíveis</b><span>O restante da Central continua operacional. Nova tentativa ocorrerá automaticamente.</span></div>'
   :gcSkeleton();
  if(meta)meta.textContent=state.errors.gc?'GestãoClick indisponível':'Conectando…';
  return;
 }
 const rows=Array.isArray(state.gc.statuses)?state.gc.statuses.slice():[];
 rows.sort((a,b)=>gcRank(a.status)-gcRank(b.status)||String(a.status).localeCompare(String(b.status),'pt-BR'));
 if(!rows.length){
  h.innerHTML='<div class="cr-gc-unavailable"><b>Nenhum status retornado</b><span>A fonte respondeu sem distribuição de orçamentos; nenhum zero foi presumido.</span></div>';
  if(meta)meta.textContent='Fonte respondeu sem distribuição';
  return;
 }
 const max=Math.max(1,...rows.map(x=>Number(x.count)||0));
 const sum=rows.reduce((a,x)=>a+(Number(x.count)||0),0);
 h.innerHTML=rows.map(x=>{
  const count=Number(x.count)||0,tone=gcTone(x.status),w=count?Math.max(3,Math.round(count/max*100)):0;
  return '<article class="cr-gc-row" style="--gc-tone:'+tone+'">'+
   '<span class="cr-gc-dot"></span>'+
   '<div class="cr-gc-name">'+esc(x.status||'SEM STATUS')+'</div>'+
   '<div class="cr-gc-track"><i style="width:'+w+'%"></i></div>'+
   '<b class="cr-gc-count">'+count+'</b>'+
  '</article>';
 }).join('');
 const total=Number(state.gc.total_count);
 const match=Number.isFinite(total)?sum===total:true;
 if(meta){
  const read=state.gc.read_at?new Date(state.gc.read_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'—';
  meta.textContent=rows.length+' status • '+(Number.isFinite(total)?total:sum)+' orçamentos • '+read+(match?'':' • divergência');
  meta.classList.toggle('warn',!match||state.gc.complete===false);
 }
}
let gcRefreshing=false;
async function refreshGcStatuses(){
 if(gcRefreshing)return;gcRefreshing=true;
 try{
  const out=await get(GC_STATUS,18000);
  state.gc=out.data;
  state.timings.gc=out.ms;
  delete state.errors.gc;
 }catch(err){
  state.errors.gc=String(err);
 }finally{
  renderGcStatuses();renderHealth();gcRefreshing=false;
 }
}

function boot(){
 document.documentElement.dataset.crBuild=BUILD;
 document.documentElement.dataset.crNativeState='loading';
 renderAll();renderGcStatuses();patchReturns();
 refresh().finally(()=>setTimeout(refreshMaturity,300));refreshGcStatuses();setInterval(refresh,30000);setInterval(refreshMaturity,60000);setInterval(refreshGcStatuses,300000);
 window.CR_NATIVE_CLEAN={BUILD,state,refresh,refreshMaturity,refreshGcStatuses,APP,GC_STATUS};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();