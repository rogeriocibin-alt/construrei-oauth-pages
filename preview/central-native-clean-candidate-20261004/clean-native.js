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
function renderHealth(){const h=$('#homeHealth');if(!h)return;const s=state.fast?.sources||{},rows=[['Banco de Dados',s.database?.ok],['Trello',s.trello?.ok],['Google Agenda',s.agenda?.ok],['GestãoClick',state.full?.sources?.gestaoclick?.ok??null]];h.innerHTML=rows.map(([n,v])=>'<article class="cr-health-card '+(v===true?'ok':'')+'"><div class="cr-health-label">'+esc(n)+'</div><div class="cr-health-value">'+esc(v===true?'Operacional':v===false?'Atenção':'Carregando')+'</div><div class="cr-health-sub">'+esc(v===true?'Fonte disponível':v===false?'Verificar integração':'Sem presumir estado')+'</div></article>').join('')}
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
function boot(){
 document.documentElement.dataset.crBuild=BUILD;
 document.documentElement.dataset.crNativeState='loading';
 renderAll();patchReturns();
 const b=$('.cr-flow-panel .cr-panel-action');if(b)b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();refresh()});
 refresh();setInterval(refresh,30000);
 window.CR_NATIVE_CLEAN={BUILD,state,refresh,APP};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();