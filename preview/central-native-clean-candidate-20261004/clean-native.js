(()=>{'use strict';
if(window.__CR_NATIVE_CLEAN_V1)return;window.__CR_NATIVE_CLEAN_V1=true;
window.__CR_NATIVE_HOME_OWNER=true;
const BUILD='CR-CENTRAL-NATIVE-CLEAN-FROM-0DBC-20261004';
const FAST='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v12-1-candidate-20261003?view=public-home';
const AGENDA='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-agenda-executive-v12-1-candidate-20261003?view=public';
const FULL='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v12-candidate-20261003?view=public-home';
const APP='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const brl=c=>c==null?'—':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(c)/100);
const state={fast:null,agenda:null,full:null,errors:{},timings:{},lastRefresh:null};
const COLORS={'AGUARDANDO VISITA/AGENDAMENTO':'#0a8cff','EM ELABORAÇÃO':'#3c8fe8','AGUARDANDO ENVIO':'#62a9ee','AGUARDANDO APROVAÇÃO':'#f2b233','EM ANDAMENTO':'#168fb8','RETORNO':'#7b46e8','AGUARDANDO PAGAMENTO':'#16b879','AGUARDANDO ACERTO':'#ff8a24','FINALIZADO':'#138a61','NÃO APROVADO':'#d85b67','CANCELADO':'#93a9bd'};
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
function operationalToday(){const a=state.agenda?.kpis;if(!a)return null;return Number(a.visits||0)+Number(a.executions||0)+Number(a.returns||0)+Number(a.warranties||0)}
function stamp(){const e=$('#crHomeUpdated');if(e)e.textContent='Atualizado '+new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date())}
function card(cls,ic,l,v,d,s){return '<article class="cr-op-card '+cls+'"><div class="cr-op-top"><span class="cr-op-icon">'+ic+'</span><span class="cr-op-label">'+esc(l)+'</span></div><div class="cr-op-value">'+esc(v)+'</div><div class="cr-op-detail">'+esc(d)+'</div><div class="cr-op-status">'+esc(s)+'</div></article>'}
function renderKpis(){const h=$('#kpis');if(!h)return;const k=state.fast?.kpis||{};h.innerHTML=[
 card('blue','⚙','Serviços em andamento',k.services_in_progress?.count??'—',state.fast?'Fonte operacional real':'Conectando…','Trello'),
 card('green','$','Aguardando pagamento',k.awaiting_payment?.count??'—',state.fast?brl(k.awaiting_payment?.amount_cents):'Conectando…','GestãoClick'),
 card('purple','▣','Visitas do dia',state.agenda?operationalToday():'—',state.agenda?'Google Agenda':'Conectando…','Hoje'),
 card('orange','▤','Agenda amanhã',k.agenda_tomorrow?.count??'—',state.fast?'Google Agenda':'Conectando…','Planejamento'),
 card('amber','✓','Aguardando acerto',k.awaiting_adjustment?.count??'—',state.fast?brl(k.awaiting_adjustment?.amount_cents):'Conectando…','GestãoClick')
].join('');stamp()}
function time(v){try{return new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date(v))}catch{return'—'}}
function renderAgenda(){const h=$('#quick');if(!h)return;const a=state.agenda;if(!a){h.innerHTML='<div class="cr-inc-state">'+(state.errors.agenda?'Agenda indisponível nesta leitura — nenhum zero foi presumido.':'Conectando à Agenda…')+'</div>';return}const it=a.items||[];h.innerHTML=it.length?it.slice(0,7).map(x=>'<article class="cr-quick-card cr-inc-agenda-card"><div class="cr-quick-icon">▣</div><h3>'+esc(time(x.starts_at)+' • '+(x.title||x.type||'Compromisso'))+'</h3><p>'+esc([(x.team||[]).join(' + ')||'Responsável não identificado',x.case,x.location].filter(Boolean).join(' • '))+'</p><span class="cr-inc-badge '+(x.incomplete?'warn':'ok')+'">'+esc(x.incomplete?'Informação incompleta':x.type||'Programada')+'</span></article>').join(''):'<div class="cr-inc-state">Nenhum compromisso comprovado para hoje.</div>'}
function renderQuotes(){const h=$('#flowHome');if(!h)return;const m=state.full?.quotes?.by_status||state.full?.quotes?.status_distribution||{},rows=Object.entries(m).map(([n,v])=>[n,typeof v==='number'?{count:v,total_cents:null}:v]).sort((a,b)=>(b[1].count||0)-(a[1].count||0));h.innerHTML=rows.length?rows.map(([n,v])=>'<article class="cr-flow-card cr-inc-status" style="--status:'+esc(COLORS[n]||'#93a9bd')+'"><div class="cr-flow-code">'+esc(n)+'</div><div class="cr-flow-active"><b>'+esc(v.count??'—')+'</b> registros</div><div class="cr-flow-state">'+esc(brl(v.total_cents))+'</div><div class="cr-inc-statusbar"><i></i></div></article>').join(''):'<div class="cr-inc-state">'+(state.errors.full?'GestãoClick indisponível nesta leitura — sem zero presumido.':'Conectando ao GestãoClick…')+'</div>'}
function renderPending(){const h=$('#boardSummary');if(!h)return;const p=state.fast?.pending;if(!p||p.source_status==='SOURCE_IN_IMPLEMENTATION'){h.innerHTML='<article class="cr-pending-card cr-inc-pending"><div class="cr-pending-icon">!</div><div class="cr-pending-copy"><h3>'+(state.fast?'Pendências • fonte em implantação':'Pendências • conectando')+'</h3><div class="cr-pending-lines"><span>'+(state.fast?'Banco Mestre ainda sem alimentação operacional homologada.':'Carregando fonte operacional…')+'</span><span>Exceções técnicas não são convertidas em pendências.</span></div></div></article>';return}h.innerHTML='<article class="cr-pending-card"><div class="cr-pending-icon">▥</div><div class="cr-pending-copy"><h3>Pendências vivas</h3><div class="cr-pending-total">'+esc(p.total_live)+'</div><div class="cr-pending-lines"><span>Fonte operacional identificada.</span></div></div></article>'}
function renderHealth(){const h=$('#homeHealth');if(!h)return;const s=state.fast?.sources||{},rows=[['Banco de Dados',s.database?.ok,state.timings.fast],['Trello',s.trello?.ok,state.timings.fast],['Google Agenda',s.agenda?.ok,state.timings.agenda],['GestãoClick',state.full?.sources?.gestaoclick?.ok??null,state.timings.full]];h.innerHTML=rows.map(([n,v,ms])=>'<article class="cr-health-card '+(v===true?'ok':'')+'"><div class="cr-health-label">'+esc(n)+'</div><div class="cr-health-value">'+esc(v===true?'Operacional':v===false?'Atenção':'Carregando')+'</div><div class="cr-health-sub">'+esc(v===true?('Fonte disponível'+(ms!=null?' • '+ms+' ms':'')):v===false?'Verificar integração':'Sem presumir estado')+'</div></article>').join('')}
function renderAll(){renderKpis();renderAgenda();renderQuotes();renderPending();renderHealth()}
function patchReturns(){document.querySelectorAll('a[href]').forEach(el=>{const href=el.getAttribute('href')||'';if(/central-atendimento/.test(href)&&!/return=/.test(href)){try{const u=new URL(href,location.href);u.searchParams.set('return',location.href);el.setAttribute('href',u.toString())}catch(_){}}})}
let refreshing=false;
async function refresh(){
 if(refreshing)return;
 refreshing=true;
 if(!state.fast&&!state.agenda&&!state.full)document.documentElement.dataset.crNativeState='loading';
 state.errors={};
 const load=async(key,url,apply)=>{
  try{
   const out=await get(url);
   state[key]=out.data;
   state.timings=state.timings||{};
   state.timings[key]=out.ms;
   state.lastRefresh=new Date().toISOString();
   apply();
   document.documentElement.dataset.crNativeState='live';
  }catch(err){
   state.errors[key]=String(err);
   apply();
   if(!state.fast&&!state.agenda&&!state.full)document.documentElement.dataset.crNativeState='error';
  }
 };
 await Promise.allSettled([
  load('fast',FAST,()=>{renderKpis();renderPending();renderHealth();stamp()}),
  load('agenda',AGENDA,()=>{renderAgenda();renderKpis();renderHealth();stamp()}),
  load('full',FULL,()=>{renderQuotes();renderHealth();stamp()})
 ]);
 refreshing=false;
}

const MATURITY='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes';
const MATURITY_AX=[['management','Gestão e Visibilidade'],['finance','Financeiro / GestãoClick'],['technical','Base Técnica e Governança'],['data','Dados e Integrações'],['operation','Operação + Trello + Automações'],['central','Central / Ecossistema'],['flows','Esteira F00–F09'],['app','APP Operacional'],['service','Atendimento Integrado']];
const mClamp=n=>Math.max(0,Math.min(100,Math.round(n||0)));
const mTone=n=>n<45?'#d88b22':n<65?'#d6a51f':n<80?'#e2b62f':n<90?'#1684a7':'#08724f';
const mText=n=>n<45?'Prioridade':n<65?'Em construção':n<80?'Avançando':n<90?'Forte':'Maduro';
function mObjects(v,out=[]){if(!v)return out;if(Array.isArray(v)){v.forEach(x=>mObjects(x,out));return out}if(typeof v==='object'){out.push(v);Object.keys(v).forEach(k=>mObjects(v[k],out))}return out}
function mStatus(s){s=String(s||'').toUpperCase();if(/HOMOLOG|CONCLU|APROV|OPERACIONAL|PRODU/.test(s))return 1;if(/VALID|TEST|PRONTO/.test(s))return .78;if(/ANDAMENTO|IMPLEMENT|DESENV|EXECU/.test(s))return .55;if(/BLOQUE|AGUARD|PEND/.test(s))return .28;return .35}
function mFlow(objs,code){return objs.find(x=>String(x.code||x.id||'').toUpperCase()===code)}
function mArea(objs,re){return objs.filter(x=>re.test(String(x.area||x.module||x.code||x.title||''))&&(x.status||x.operational_status||x.implementation_status))}
function mCompletion(items){if(!items.length)return null;return items.reduce((a,x)=>a+mStatus(x.status||x.operational_status||x.implementation_status),0)/items.length}
function mGauge(id,n){const e=document.getElementById(id);if(!e)return;const t=mTone(n);e.style.setProperty('--p',n);e.style.setProperty('--tone',t);e.querySelector('b').textContent=n+'%'}
function mAxis(k,n,note){const e=document.querySelector('[data-axis="'+k+'"]');if(!e)return;const t=mTone(n);e.style.setProperty('--tone',t);e.querySelector('b').textContent=n+'%';e.querySelector('i').style.width=n+'%';e.querySelector('small').textContent=mText(n)+' • '+note}
async function maturityGet(q,timeout){const out=await get(MATURITY+'?api='+q+'&maturity=1',timeout);return out.data}
let maturityRefreshing=false;
async function refreshMaturity(){
 if(maturityRefreshing||!document.getElementById('crMaturityLive'))return;maturityRefreshing=true;
 const res=await Promise.allSettled([maturityGet('public-summary',5000),maturityGet('pending-board',6500),maturityGet('development-summary',8000)]);
 const pub=res[0].status==='fulfilled'?res[0].value:null,board=res[1].status==='fulfilled'?res[1].value:null,dev=res[2].status==='fulfilled'?res[2].value:null;
 const live=[pub,board,dev].filter(Boolean).length,po=mObjects(pub),bo=mObjects(board),doo=mObjects(dev),all=po.concat(bo,doo);
 const flowVals=[];for(let i=0;i<10;i++){const f=mFlow(all,'F0'+i);if(f)flowVals.push(mStatus(f.implementation_status||f.status||f.operational_status))}
 const flowLive=flowVals.length?flowVals.reduce((a,b)=>a+b,0)/flowVals.length:null;
 const appC=mCompletion(mArea(bo,/APP/i)),serviceC=mCompletion(mArea(all,/ATEND|F00|F01/i));
 const m={management:mClamp(70+(pub?12:0)+(board?8:0)+(dev?5:0)),finance:mClamp(70+(pub?10:0)+(JSON.stringify(pub||{}).match(/gest[aã]o.?click|finance/ig)||[]).length*2),technical:mClamp(58+(dev?22:0)+(pub?8:0)+(board?7:0)),data:mClamp((live/3)*100),operation:mClamp(55+(board?10:0)+(pub?8:0)+(mCompletion(bo)||0)*22),central:mClamp(62+(pub?12:0)+(board?8:0)+(dev?8:0)),flows:mClamp(flowLive==null?45:35+flowLive*60),app:mClamp(appC==null?(board?45:30):35+appC*60),service:mClamp(serviceC==null?32:25+serviceC*68)};
 const general=mClamp(m.management*.12+m.finance*.09+m.technical*.10+m.data*.12+m.operation*.13+m.central*.10+m.flows*.13+m.app*.10+m.service*.11);
 const autonomy=mClamp(m.data*.18+m.operation*.17+m.flows*.22+m.app*.20+m.service*.23);
 mGauge('crMlGeneral',general);mGauge('crMlAutonomy',autonomy);
 mAxis('management',m.management,'Dashboard + fontes executivas');mAxis('finance',m.finance,'capacidade financeira embarcada');mAxis('technical',m.technical,'governança + saúde técnica');mAxis('data',m.data,live+'/3 fontes vivas respondendo');mAxis('operation',m.operation,'Trello, automações e pendências');mAxis('central',m.central,'Central e serviços integrados');mAxis('flows',m.flows,flowVals.length+'/10 fluxos com evidência');mAxis('app',m.app,appC==null?'sem evidência suficiente':'pendências e estados do APP');mAxis('service',m.service,serviceC==null?'sem evidência suficiente':'F00/F01 e atendimento');
 const l=document.getElementById('crMlLive'),src=document.getElementById('crMlSource');if(l){l.textContent='● LIVE • '+new Date().toLocaleTimeString('pt-BR');l.style.background=live===3?'#e8f7ef':'#fff3d6';l.style.color=live===3?'#177349':'#8b6412'}if(src)src.textContent=live+'/3 fontes • auditoria em segundo plano';
 maturityRefreshing=false;
}

function boot(){
 document.documentElement.dataset.crBuild=BUILD;
 document.documentElement.dataset.crNativeState='loading';
 renderAll();patchReturns();
 const b=$('.cr-flow-panel .cr-panel-action');if(b)b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();refresh()});
 refresh().finally(()=>setTimeout(refreshMaturity,300));setInterval(refresh,30000);setInterval(refreshMaturity,60000);
 window.CR_NATIVE_CLEAN={BUILD,state,refresh,refreshMaturity,APP};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();