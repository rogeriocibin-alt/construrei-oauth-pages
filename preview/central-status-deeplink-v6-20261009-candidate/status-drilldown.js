(()=>{'use strict';
if(window.__CR_NATIVE_CLEAN_V1)return;window.__CR_NATIVE_CLEAN_V1=true;
window.__CR_NATIVE_HOME_OWNER=true;
const BUILD='CR-CENTRAL-HERO-FULL-BG-20261004';
const FAST='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v12-1-candidate-20261003?view=public-home';
const PENDING='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-pendencias-executive-v2-candidate-20261004';
const AGENDA='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-agenda-executive-v12-1-candidate-20261003?view=public';
const BUDGET_STATUS='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-gc-orcamentos-status-v5-drilldown-20261009';
const APP='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const brl=c=>c==null?'—':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(c)/100);
const state={fast:null,pending:null,agenda:null,budgets:null,errors:{},timings:{},lastRefresh:null,lastAgendaOkAt:null,lastBudgetOkAt:null};
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
 const statusRows=state.budgets?.statuses?mergeBudgetStatuses(state.budgets.statuses):[];
 const statusCount=key=>{
  if(!state.budgets)return '—';
  return statusRows.filter(x=>x.canonical_key===key).reduce((sum,x)=>sum+(Number(x.count)||0),0);
 };
 const statusDetail=key=>{
  if(!state.budgets)return state.errors.budgets?'Fonte indisponível':'Carregando GestãoClick…';
  const sum=statusRows.filter(x=>x.canonical_key===key).reduce((a,x)=>a+Number(x.total_cents||0),0);
  return brl(sum);
 };
 h.innerHTML=[
  card('blue','⚙','Serviços em andamento',statusCount('EM_ANDAMENTO'),statusDetail('EM_ANDAMENTO'),'GestãoClick'),
  card('green','$','Aguardando pagamento',statusCount('AGUARDANDO_PAGAMENTO'),statusDetail('AGUARDANDO_PAGAMENTO'),'GestãoClick'),
  card('amber','✓','Aguardando acerto',statusCount('AGUARDANDO_ACERTO'),statusDetail('AGUARDANDO_ACERTO'),'GestãoClick'),
  card('purple','✎','Em elaboração',statusCount('EM_ELABORACAO'),statusDetail('EM_ELABORACAO'),'GestãoClick'),
  card('teal','▤','Elaborados',statusCount('ELABORADOS'),statusDetail('ELABORADOS'),'GestãoClick'),
  card('orange','↗','Aguardando envio',statusCount('AGUARDANDO_ENVIO'),statusDetail('AGUARDANDO_ENVIO'),'GestãoClick'),
  card('red','↶','Retornos',statusCount('RETORNO'),statusDetail('RETORNO'),'GestãoClick')
 ].join('');
 stamp();
}
function execStage(label,value,active,tone,icon){
 const n=Math.max(0,Number(value)||0),pct=active?Math.round(n*100/active):0;
 return '<div class="crx-stage '+tone+'"><div class="crx-stage-head"><span class="crx-stage-icon">'+icon+'</span><span>'+esc(label)+'</span><b>'+n+'</b></div><div class="crx-stage-track"><i style="width:'+pct+'%"></i></div><small>'+pct+'% dos itens ativos</small></div>';
}
function execMeter(b){
 const x=b?.execution||{},pct=Math.max(0,Math.min(100,Number(x.index)||0));
 const active=Number(x.active)||0,done=Number(x.concluded)||0,val=Number(x.validation)||0,prog=Number(x.progress)||0,waiting=Number(x.waiting)||0,blocked=Number(x.blocked)||0;
 return '<section class="crx-exec">'+
  '<div class="crx-exec-top"><div><span class="crx-eyebrow">EXECUÇÃO VIVA</span><h3>Avanço operacional do sistema</h3></div><span class="crx-live-dot"><i></i>ATUALIZAÇÃO AUTOMÁTICA</span></div>'+
  '<div class="crx-exec-main">'+
   '<div class="crx-gauge-wrap"><svg class="crx-gauge" viewBox="0 0 120 120" role="img" aria-label="Execução '+pct+' por cento"><defs><linearGradient id="crxGaugeGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#167ee8"/><stop offset="55%" stop-color="#0aa7d8"/><stop offset="100%" stop-color="#15b58e"/></linearGradient></defs><circle class="crx-gauge-bg" cx="60" cy="60" r="48" pathLength="100"></circle><circle class="crx-gauge-val" cx="60" cy="60" r="48" pathLength="100" style="stroke-dasharray:'+pct+' '+(100-pct)+'"></circle></svg><div class="crx-gauge-center"><b>'+pct+'%</b><span>EXECUÇÃO</span></div></div>'+
   '<div class="crx-exec-copy"><p>Índice ponderado pelo estado real das pendências.</p><div class="crx-exec-number"><b>'+active+'</b><span>itens ativos monitorados</span></div><div class="crx-exec-legend"><span><i class="done"></i>Concluído 100%</span><span><i class="review"></i>Validação 75%</span><span><i class="run"></i>Andamento 50%</span><span><i class="wait"></i>Aguardando 25%</span></div></div>'+
  '</div>'+
  '<div class="crx-stages">'+[
   execStage('Concluídas',done,active,'done','✓'),
   execStage('Em validação',val,active,'review','◆'),
   execStage('Em andamento',prog,active,'run','↗'),
   execStage('Aguardando',waiting,active,'wait','◷'),
   execStage('Bloqueadas',blocked,active,'blocked','!')
  ].join('')+'</div>'+
 '</section>';
}
function pendingMini(icon,label,s,target,tone){
 s=s||{};
 const open=Number(s.open)||0,total=Number(s.total)||0,done=Number(s.done)||0,blocked=Number(s.blocked)||0,waiting=Number(s.waiting)||0,review=Number(s.review)||0,progress=Number(s.progress)||0;
 const base=Math.max(1,total-Number(s.cancelled||0)),resolved=Math.max(0,Math.min(100,Math.round(done*100/base)));
 return '<button type="button" class="crx-owner '+esc(tone||'blue')+'" data-action="go" data-page-target="'+esc(target)+'">'+
  '<span class="crx-owner-top"><span class="crx-owner-icon">'+icon+'</span><b>'+esc(label)+'</b><span class="crx-owner-arrow">›</span></span>'+
  '<span class="crx-owner-body"><span class="crx-owner-gauge" style="--p:'+resolved+'"><strong>'+open+'</strong><small>ABERTAS</small></span><span class="crx-owner-status"><em><i class="bad"></i>'+blocked+' bloqueadas</em><em><i class="warn"></i>'+waiting+' aguardando</em><em><i class="ok"></i>'+review+' revisão</em><em><i class="run"></i>'+progress+' andamento</em></span></span>'+
 '</button>';
}
function renderPending(){
 const h=$('#boardSummary');if(!h)return;
 const b=state.pending;
 if(!b){
  h.innerHTML='<article class="crx-loading"><span></span><b>Painel executivo</b><small>'+(state.errors.pending?'Fonte temporariamente indisponível — nova tentativa automática.':'Sincronizando pendências vivas…')+'</small></article>';
  return;
 }
 const s=b.summary||{};
 h.innerHTML=execMeter(b)+'<div class="crx-owner-grid">'+[
  pendingMini('▯','APP',s.app,'pendapp','blue'),
  pendingMini('⌘','WIZY',s.wizy,'wizy','purple'),
  pendingMini('♙','ÉDER',s.eder,'eder','amber')
 ].join('')+'</div>';
}
function budgetNorm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function budgetRank(name){
 const n=budgetNorm(name);
 if(/NOVO|VISITA|AGENDAMENTO/.test(n))return 10;
 if(/ANALIS|ELABOR|ORCAMENT/.test(n))return 20;
 if(/AGUARDANDO ENVIO|ENVIAD/.test(n))return 30;
 if(/AGUARDANDO APROV/.test(n))return 40;
 if(/APROVAD/.test(n)&&!/NAO APROV|REPROV/.test(n))return 50;
 if(/ANDAMENTO|EXECU/.test(n))return 60;
 if(/RETORNO/.test(n))return 65;
 if(/PAGAMENTO/.test(n))return 70;
 if(/ACERTO|AJUST/.test(n))return 75;
 if(/FINAL|CONCLU/.test(n))return 80;
 if(/NAO APROV|REPROV/.test(n))return 90;
 if(/CANCEL/.test(n))return 100;
 return 85;
}
// A mesma paleta é usada nos cartões executivos e nas barras GestãoClick.
const CR_STATUS_COLORS={
 EM_ANDAMENTO:'#0877f9',AGUARDANDO_PAGAMENTO:'#12b76a',
 AGUARDANDO_ACERTO:'#f3ad00',EM_ELABORACAO:'#8b36d6',
 ELABORADOS:'#009da5',AGUARDANDO_ENVIO:'#ff8614',RETORNO:'#ff375f'
};
function budgetColor(name){
 const n=budgetNorm(name),key=canonicalBudgetStatus(name).key;
 if(CR_STATUS_COLORS[key])return CR_STATUS_COLORS[key];
 if(/CANCEL/.test(n))return '#8094a8';
 if(/NAO APROV|REPROV/.test(n))return '#e54d5d';
 if(/FINAL|CONCLU/.test(n))return '#16a99b';
 if(/PAGO|RECEBIDO/.test(n))return '#2fbd69';
 if(/ENVIAD/.test(n))return '#44a6e8';
 if(/AGUARDANDO APROV/.test(n))return '#eea91c';
 if(/APROVAD/.test(n))return '#2fbd69';
 if(/ANALIS/.test(n))return '#7658d7';
 if(/ORCAMENT/.test(n))return '#17acd0';
 if(/NOVO|VISITA|AGENDAMENTO/.test(n))return '#2e86ed';
 const palette=['#258edc','#14a7a0','#6c63d9','#36a86f','#4c9bd9','#8b65c9'];
 let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))>>>0;return palette[h%palette.length];
}
function budgetSkeleton(){
 return '<div class="cr-budget-skeleton">'+[1,2,3,4].map(()=>'<div class="cr-budget-sk-row"><i></i><span></span><b></b></div>').join('')+'</div>';
}
function canonicalBudgetStatus(v){
 const raw=String(v||'SEM STATUS').trim()||'SEM STATUS',n=budgetNorm(raw);
 if(!n||n==='SEM STATUS')return{key:'SEM_STATUS',name:'Sem status'};
 if(/CANCEL/.test(n))return{key:'CANCELADO',name:'Cancelado'};
 if(/NAO APROV|REPROV/.test(n))return{key:'NAO_APROVADO',name:'Não aprovado'};
 if(/FINAL|CONCLU/.test(n))return{key:'CONCLUIDO',name:'Concluído'};
 if(/PAGO|RECEBIDO/.test(n))return{key:'PAGO_RECEBIDO',name:'Pago / Recebido'};
 if(/ACERTO|AJUST/.test(n))return{key:'AGUARDANDO_ACERTO',name:'Aguardando acerto'};
 if(/PAGAMENTO/.test(n))return{key:'AGUARDANDO_PAGAMENTO',name:'Aguardando pagamento'};
 if(/RETORNO/.test(n))return{key:'RETORNO',name:'Retorno'};
 if(/ANDAMENTO|EXECU/.test(n))return{key:'EM_ANDAMENTO',name:'Em andamento'};
 if(/AGUARDANDO APROV/.test(n))return{key:'AGUARDANDO_APROVACAO',name:'Aguardando aprovação'};
 if(/APROVAD/.test(n))return{key:'APROVADO',name:'Aprovado'};
 if(/AGUARDANDO ENVIO/.test(n))return{key:'AGUARDANDO_ENVIO',name:'Aguardando envio'};
 if(/ENVIAD/.test(n))return{key:'ENVIADO',name:'Enviado'};
 if(/ANALIS/.test(n))return{key:'EM_ANALISE',name:'Em análise'};
 if(/^(ELABORADO|ELABORADOS|ORCAMENTO ELABORADO|ORCAMENTOS ELABORADOS)$/.test(n))return{key:'ELABORADOS',name:'Elaborados'};
 if(/EM ELABORACAO|ELABORANDO|EM ELABOR/.test(n))return{key:'EM_ELABORACAO',name:'Em elaboração'};
 if(/ELABOR/.test(n))return{key:'ELABORADOS',name:'Elaborados'};
 if(/ORCAMENT/.test(n))return{key:'ORCAMENTO',name:'Orçamento'};
 if(/NOVO/.test(n))return{key:'NOVO',name:'Novo'};
 if(/VISITA|AGENDAMENTO|AGENDADO/.test(n))return{key:'AGENDADO',name:'Agendado'};
 return{key:'RAW:'+n,name:raw.replace(/\s+/g,' ')};
}
function mergeBudgetStatuses(input){
 const map=new Map();
 (Array.isArray(input)?input:[]).forEach((x,idx)=>{
  const c=canonicalBudgetStatus(x?.name||x?.status||'SEM STATUS');
  const key=String(c.key.startsWith('RAW:')?(x?.canonical_key||c.key):c.key);
  const name=c.name;
  const count=Number(x?.count)||0,total=Number(x?.total_cents)||0,order=Number(x?.source_order);
  if(!map.has(key)){
   map.set(key,{...x,canonical_key:key,name,count,total_cents:total,source_order:Number.isFinite(order)?order:budgetRank(name),_first:idx});
  }else{
   const row=map.get(key);
   row.count+=count;
   row.total_cents=(Number(row.total_cents)||0)+total;
   row.source_order=Math.min(Number(row.source_order)||999,Number.isFinite(order)?order:budgetRank(name));
  }
 });
 return [...map.values()];
}
function renderBudgets(){
 const h=$('#crBudgetStatusRows'),meta=$('#crBudgetMeta');if(!h)return;
 const d=state.budgets,err=state.errors.budgets;
 if(!d){
  if(err){
   h.innerHTML='<div class="cr-budget-unavailable"><b>Dados temporariamente indisponíveis</b><span>O GestãoClick não respondeu dentro da leitura segura. Nenhum contador zero foi presumido.</span></div>';
   if(meta)meta.textContent=state.lastBudgetOkAt?'Última leitura válida: '+new Date(state.lastBudgetOkAt).toLocaleTimeString('pt-BR'):'Fonte indisponível nesta leitura';
  }else{
   h.innerHTML=budgetSkeleton();if(meta)meta.textContent='Conectando ao GestãoClick…';
  }
  return;
 }
 const rows=mergeBudgetStatuses(d.statuses).filter(x=>! /^(PEDIDO EMBALADO|PEDIDO ENTREGUE)$/.test(budgetNorm(x.name))).sort((a,b)=>(Number(b.count)||0)-(Number(a.count)||0)||String(a.name).localeCompare(String(b.name),'pt-BR'));
 const max=Math.max(1,...rows.map(x=>Number(x.count)||0));
 h.innerHTML=rows.length?rows.map(x=>{
   const count=Number(x.count)||0,color=budgetColor(x.name),pct=count?Math.max(3,Math.round(count/max*100)):0;
   return '<div class="cr-budget-row" style="--budget-color:'+color+'"><i class="cr-budget-dot"></i><span class="cr-budget-name">'+esc(x.name||'SEM STATUS')+'</span><div class="cr-budget-track"><i style="width:'+pct+'%"></i></div><b class="cr-budget-count">'+count+'</b></div>';
 }).join(''):'<div class="cr-budget-unavailable"><b>Nenhum status retornado</b><span>A fonte respondeu sem situações de orçamento disponíveis.</span></div>';
 if(meta){
  const stale=err?' • atualização pendente':'';
  const total=Number(d.total??d.records_analyzed??rows.reduce((a,x)=>a+Number(x.count||0),0));
  const t=state.timings.budgets!=null?' • '+state.timings.budgets+' ms':'';
  meta.textContent=rows.length+' status únicos • '+total+' orçamentos • ordem decrescente'+t+stale;
  meta.title='Fonte: GestãoClick • '+(d.complete?'população completa':'leitura limitada')+(d.read_at?' • '+new Date(d.read_at).toLocaleString('pt-BR'):'');
 }
}
function agendaDay(offset){
 const d=new Date(Date.now()+offset*86400000);
 return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
}
function agendaTime(v){
 const d=new Date(v);if(!Number.isFinite(d.getTime()))return'—';
 return new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(d);
}
function renderAgendaToday(){
 const h=$('#crAgendaRows'),meta=$('#crAgendaMeta');if(!h)return;
 const d=state.agenda,err=state.errors.agenda;
 if(!d){
  h.innerHTML=err
   ?'<div class="cr-agenda-unavailable"><b>Agenda temporariamente indisponível</b><span>Nenhum compromisso fictício foi presumido. Nova tentativa automática.</span></div>'
   :'<div class="cr-agenda-skeleton"><i></i><i></i><i></i></div>';
  if(meta)meta.textContent=state.lastAgendaOkAt?'Última leitura válida: '+new Date(state.lastAgendaOkAt).toLocaleTimeString('pt-BR'):'Conectando à agenda…';
  return;
 }
 const items=(Array.isArray(d.items)?d.items:[]).slice().sort((a,b)=>(Number(a.day_order)||0)-(Number(b.day_order)||0)||String(a.starts_at||'').localeCompare(String(b.starts_at||'')));
 h.innerHTML=items.length?items.map(x=>{
  const team=Array.isArray(x.team)&&x.team.length?x.team.join(' + '):'Equipe não identificada';
  const tm=agendaTime(x.starts_at);
  const type=String(x.type||'COMPROMISSO').toUpperCase();
  const caseNo=x.case?String(x.case):'';
  const title=String(x.title||'Compromisso');
  const detail=[title,x.location].filter(Boolean).join(' • ');
  const day=String(x.day_label||'HOJE');
  const rid=String(x.id||caseNo||[x.starts_at,title].join('|'));
  return '<article class="cr-agenda-row" data-cr-agenda-id="'+esc(rid)+'">'+
   '<div class="cr-agenda-time">'+esc(tm)+'</div>'+
   '<div class="cr-agenda-main"><strong>'+esc(team)+'</strong><span>'+esc([day,type,caseNo].filter(Boolean).join(' • '))+'</span><small>'+esc(detail)+'</small></div>'+
   '<div class="cr-agenda-actions"><span class="cr-agenda-kind">'+esc(type)+'</span><button type="button" class="cr-agenda-expand" data-cr-agenda-expand="'+esc(rid)+'">Expandir</button></div>'+
   '<div class="cr-agenda-detail" data-cr-agenda-detail="'+esc(rid)+'" hidden></div>'+
  '</article>';
 }).join(''):'<div class="cr-agenda-empty">Nenhum compromisso confirmado para hoje ou amanhã.</div>';
 if(meta){
  const today=Number(d.today_count)||0,tomorrow=Number(d.tomorrow_count)||0,stale=err?' • atualização pendente':'';
  const checked=d.checked_at||state.lastAgendaOkAt;
  const tm=checked?new Date(checked).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'—';
  meta.textContent=today+' hoje • '+tomorrow+' amanhã • '+tm+stale;
  meta.title='Fonte primária: Google Agenda CONSTRU-REI';
 }
}
async function refreshAgendaToday(){
 try{
  const today=agendaDay(0),tomorrow=agendaDay(1);
  const started=performance.now();
  const res=await Promise.allSettled([
   get(AGENDA+'&date='+encodeURIComponent(today),9000),
   get(AGENDA+'&date='+encodeURIComponent(tomorrow),9000)
  ]);
  const td=res[0].status==='fulfilled'?res[0].value.data:null;
  const tm=res[1].status==='fulfilled'?res[1].value.data:null;
  if(!td&&!tm)throw Error('AGENDA_TODAY_AND_TOMORROW_UNAVAILABLE');
  const ti=Array.isArray(td?.items)?td.items.map(x=>({...x,day_label:'HOJE',day_order:0})):[];
  const ni=Array.isArray(tm?.items)?tm.items.map(x=>({...x,day_label:'AMANHÃ',day_order:1})):[];
  state.agenda={
   ok:true,
   today,tomorrow,
   today_count:ti.length,
   tomorrow_count:ni.length,
   items:ti.concat(ni),
   checked_at:new Date().toISOString()
  };
  state.timings.agenda=Math.round(performance.now()-started);
  state.lastAgendaOkAt=state.agenda.checked_at;
  delete state.errors.agenda;
 }catch(err){
  state.errors.agenda=String(err);
 }
 renderAgendaToday();
}
function renderHealth(){
 const h=$('#homeHealth');if(!h)return;
 const s=state.fast?.sources||{},rows=[
  ['Banco de Dados',s.database?.ok,state.timings.fast],
  ['Trello',s.trello?.ok,state.timings.fast],
  ['GestãoClick',state.budgets?.source_health?.gestaoclick??s.gestaoclick?.ok??(state.fast?true:(state.errors.fast?false:null)),state.timings.budgets??state.timings.fast],
  ['Pendências',state.pending?true:(state.errors.pending?false:null),state.timings.pending]
 ];
 h.innerHTML=rows.map(([n,v,ms])=>'<article class="cr-health-card '+(v===true?'ok':'')+'"><div class="cr-health-label">'+esc(n)+'</div><div class="cr-health-value">'+esc(v===true?'Operacional':v===false?'Atenção':'Carregando')+'</div><div class="cr-health-sub">'+esc(v===true?('Fonte disponível'+(ms!=null?' • '+ms+' ms':'')):v===false?'Verificar integração':'Sem presumir estado')+'</div></article>').join('');
}
function renderAll(){renderKpis();renderPending();renderAgendaToday();renderBudgets();renderHealth()}
function patchReturns(){document.querySelectorAll('a[href]').forEach(el=>{const href=el.getAttribute('href')||'';if(/central-atendimento/.test(href)&&!/return=/.test(href)){try{const u=new URL(href,location.href);u.searchParams.set('return',location.href);el.setAttribute('href',u.toString())}catch(_){}}})}
let refreshing=false;
async function refresh(){
 if(refreshing)return;
 refreshing=true;
 if(!state.fast&&!state.pending)document.documentElement.dataset.crNativeState='loading';
 delete state.errors.fast;delete state.errors.pending;
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


async function refreshBudgets(){
 try{
  const out=await get(BUDGET_STATUS,15000);
  state.budgets=out.data;
  state.timings.budgets=out.ms;
  state.lastBudgetOkAt=out.data?.read_at||new Date().toISOString();
  delete state.errors.budgets;
 }catch(err){
  state.errors.budgets=String(err);
 }
 renderBudgets();renderKpis();renderHealth();
}

const MATURITY='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes';
const MATURITY_BASE='./maturity-audit.json?v=1';
const MATURITY_AX=[['management','Gestão e Visibilidade'],['finance','Financeiro / GestãoClick'],['technical','Base Técnica e Governança'],['data','Dados e Integrações'],['operation','Operação + Trello + Automações'],['central','Central / Ecossistema'],['flows','Esteira F00–F09'],['app','APP Operacional'],['service','Atendimento Integrado']];
const mClamp=n=>Math.max(0,Math.min(100,Math.round(n||0)));
const mTone=n=>n<55?'#e2a11f':n<70?'#18a79c':n<90?'#2787e5':'#2dbb70';
const mText=n=>n<45?'Prioridade':n<60?'Estruturado':n<75?'Integrado':n<90?'Gerenciado':'Otimizado';
function mObjects(v,out=[]){if(!v)return out;if(Array.isArray(v)){v.forEach(x=>mObjects(x,out));return out}if(typeof v==='object'){out.push(v);Object.keys(v).forEach(k=>mObjects(v[k],out))}return out}
function mStatus(s){s=String(s||'').toUpperCase();if(/HOMOLOG|CONCLU|APROV|OPERACIONAL|PRODU/.test(s))return 1;if(/VALID|TEST|PRONTO/.test(s))return .78;if(/ANDAMENTO|IMPLEMENT|DESENV|EXECU/.test(s))return .55;if(/BLOQUE|AGUARD|PEND/.test(s))return .28;return .35}
function mFlow(objs,code){return objs.find(x=>String(x.code||x.id||'').toUpperCase()===code)}
function mArea(objs,re){return objs.filter(x=>re.test(String(x.area||x.module||x.code||x.title||''))&&(x.status||x.operational_status||x.implementation_status))}
function mCompletion(items){if(!items.length)return null;return items.reduce((a,x)=>a+mStatus(x.status||x.operational_status||x.implementation_status),0)/items.length}
function mGauge(id,n){const e=document.getElementById(id);if(!e)return;const t=id==='crMlAutonomy'?'#159bd7':'#0b68c9';e.style.setProperty('--p',n);e.style.setProperty('--tone',t);const b=e.querySelector('.cr-ml-ring b');if(b)b.textContent=n+'%';let chip=e.querySelector('.cr-ml-level');if(!chip){chip=document.createElement('span');chip.className='cr-ml-level';const box=e.lastElementChild;if(box)box.appendChild(chip)}if(chip)chip.textContent='NÍVEL • '+mText(n).toUpperCase()}
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

async function loadApprovedHeroBackground(){
 const hero=document.querySelector('#dashboard>.cr-home-hero.cr-executive-header');
 if(!hero)return;
 const base='./assets/hero-full-bg-b64/part';
 try{
  const parts=await Promise.all([1,2,3,4,5].map(async n=>{
   const r=await fetch(base+n+'.txt?v=20261004-final',{cache:'force-cache'});
   if(!r.ok)throw Error('HERO_BG_PART_'+n+'_'+r.status);
   return (await r.text()).trim();
  }));
  const b64=parts.join('');
  if(!/^UklGR/.test(b64)||b64.length<40000)throw Error('HERO_BG_INVALID');
  hero.style.setProperty('--cr-approved-hero','url("data:image/webp;base64,'+b64+'")');
  hero.classList.add('cr-hero-bg-live');
 }catch(err){
  hero.classList.add('cr-hero-bg-fallback');
  console.warn('[CONSTRU-REI] hero background fallback',err);
 }
}

function boot(){
 document.documentElement.dataset.crBuild=BUILD;
 document.documentElement.dataset.crNativeState='loading';
 renderAll();patchReturns();loadApprovedHeroBackground();
 refresh().finally(()=>setTimeout(refreshMaturity,300));setTimeout(refreshAgendaToday,80);setTimeout(refreshBudgets,160);setInterval(refresh,30000);setInterval(refreshAgendaToday,60000);setInterval(refreshMaturity,60000);setInterval(refreshBudgets,90000);
 window.CR_NATIVE_CLEAN={BUILD,state,refresh,refreshAgendaToday,refreshMaturity,refreshBudgets,loadApprovedHeroBackground,APP};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

const CR_STATUS_DRILL=[{key:'EM_ANDAMENTO',name:'Serviços em andamento'},{key:'AGUARDANDO_PAGAMENTO',name:'Aguardando pagamento'},{key:'AGUARDANDO_ACERTO',name:'Aguardando acerto'},{key:'EM_ELABORACAO',name:'Em elaboração'},{key:'ELABORADOS',name:'Elaborados'},{key:'AGUARDANDO_ENVIO',name:'Aguardando envio'},{key:'RETORNO',name:'Retornos'}];
function crDrillUI(){
 let node=document.getElementById('crStatusDrill');if(node)return node;
 node=document.createElement('div');node.id='crStatusDrill';node.setAttribute('role','dialog');node.setAttribute('aria-modal','true');node.hidden=true;
 node.innerHTML='<div class="crd-panel"><button class="crd-close" type="button" aria-label="Fechar">×</button><div class="crd-ey">GESTÃO OPERACIONAL • GESTÃOCLICK</div><h2 id="crdTitle">Situação</h2><div id="crdCount"></div><div id="crdBody"></div></div>';
 document.body.appendChild(node);
 node.querySelector('.crd-close').onclick=()=>{node.hidden=true};
 node.onclick=e=>{if(e.target===node)node.hidden=true};
 return node;
}
const CR_GC_LOGIN='https://gestaoclick.com/login/';
const CR_GC_FILTER_LINKS={EM_ANDAMENTO:"https://gestaoclick.com/pedidos/orcamentos/orcamentos_servicos?loja=534500&codigo=&data_inicio=&data_fim=&data_inicio_e=&data_fim_e=&cliente-id=&produto=&servico=&data_mes=&data_ano=&nome_cliente=&centro-custo=&nome_centro-custo=&equipamento=&marca=&modelo=&serie=&situacaoBuscaAvancada=true&situacao%5B0%5D=8553986&atributo%5B85718%5D=",AGUARDANDO_PAGAMENTO:"https://gestaoclick.com/pedidos/orcamentos/orcamentos_servicos?loja=534500&codigo=&data_inicio=&data_fim=&data_inicio_e=&data_fim_e=&cliente-id=&produto=&servico=&data_mes=&data_ano=&nome_cliente=&centro-custo=&nome_centro-custo=&equipamento=&marca=&modelo=&serie=&situacaoBuscaAvancada=true&situacao%5B0%5D=8595091&atributo%5B85718%5D=",AGUARDANDO_ACERTO:"https://gestaoclick.com/pedidos/orcamentos/orcamentos_servicos?loja=534500&codigo=&data_inicio=&data_fim=&data_inicio_e=&data_fim_e=&cliente-id=&produto=&servico=&data_mes=&data_ano=&nome_cliente=&centro-custo=&nome_centro-custo=&equipamento=&marca=&modelo=&serie=&situacaoBuscaAvancada=true&situacao%5B0%5D=8606987&atributo%5B85718%5D=",EM_ELABORACAO:"https://gestaoclick.com/pedidos/orcamentos/orcamentos_servicos?loja=534500&codigo=&data_inicio=&data_fim=&data_inicio_e=&data_fim_e=&cliente-id=&produto=&servico=&data_mes=&data_ano=&nome_cliente=&centro-custo=&nome_centro-custo=&equipamento=&marca=&modelo=&serie=&situacaoBuscaAvancada=true&situacao%5B0%5D=8553985&atributo%5B85718%5D="};
async function crOpenDrill(key,title){
 const node=crDrillUI();node.hidden=false;
 const statuses=state.budgets?.statuses?mergeBudgetStatuses(state.budgets.statuses):[];
 const status=statuses.find(s=>s.canonical_key===key);
 const count=status?Number(status.count)||0:null;
 const cents=status?Number(status.total_cents)||0:null;
 node.querySelector('#crdTitle').textContent=title||status?.name||key;
 node.querySelector('#crdCount').textContent=(count==null?'Contagem não disponível':count+' orçamento(s)')+' • SOMA '+(cents==null?'indisponível':brl(cents));
 const body=node.querySelector('#crdBody');
 body.replaceChildren();
 const intro=document.createElement('p');
 intro.textContent='Acesso ao Gestão Click: faça login com sua senha ou conta Google, caso a sessão não esteja aberta.';
 const exact=CR_GC_FILTER_LINKS[key];
 const login=document.createElement('a');login.href=exact||CR_GC_LOGIN;login.target='_blank';login.rel='noopener noreferrer';login.className='crd-gc-link';login.textContent=exact?'Abrir no Gestão Click com este filtro ↗':'Abrir Gestão Click • Senha ou Google ↗';
 const hint=document.createElement('p');hint.textContent=exact?'Filtro real identificado no link: Situação '+new URL(exact).searchParams.get('situacao[0]')+' ('+(title||status?.name||key)+'). Caso o Gestão Click solicite login, entre com senha ou Google; a continuidade automática do filtro após autenticação ainda precisa ser testada.':'Situação selecionada: '+(title||status?.name||key)+'. Após entrar, abra Orçamentos → Serviços → Busca avançada → Situação e selecione este status.';
 const copy=document.createElement('button');copy.type='button';copy.textContent='Copiar situação para o filtro';copy.className='crd-gc-copy';copy.onclick=()=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(title||status?.name||key).then(()=>{copy.textContent='Situação copiada ✓'}).catch(()=>{});};
 body.append(intro,login,hint,copy);
 const note=document.createElement('p');note.className='crd-gc-note';note.textContent=exact?'Endereço filtrado informado pela diretoria. O funcionamento após login depende do Gestão Click e ainda não foi validado.':'Ainda não recebemos um endereço filtrado validado para esta situação. Acesso pelo login oficial, sem inventar identificadores.';body.append(note);
}
function crBindDrill(){
 const k=document.querySelectorAll('#kpis .cr-op-card');
 k.forEach((el,i)=>{if(el.dataset.crDrill)return;const d=CR_STATUS_DRILL[i];if(!d)return;el.dataset.crDrill=d.key;el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label','Consultar '+d.name);el.onclick=()=>crOpenDrill(d.key,d.name);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();crOpenDrill(d.key,d.name)}}});
 document.querySelectorAll('#crBudgetStatusRows .cr-budget-row').forEach(el=>{if(el.dataset.crDrill)return;const name=el.querySelector('.cr-budget-name')?.textContent||'';const key=canonicalBudgetStatus(name).key;el.dataset.crDrill=key;el.setAttribute('role','button');el.setAttribute('tabindex','0');el.onclick=()=>crOpenDrill(key,name);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();crOpenDrill(key,name)}}});
}
const crDrillObserver=new MutationObserver(()=>crBindDrill());
document.addEventListener('DOMContentLoaded',()=>{crBindDrill();const a=document.getElementById('kpis'),b=document.getElementById('crBudgetStatusRows');if(a)crDrillObserver.observe(a,{childList:true});if(b)crDrillObserver.observe(b,{childList:true})});

})();