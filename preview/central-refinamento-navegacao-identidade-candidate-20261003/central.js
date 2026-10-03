(()=>{'use strict';
if(window.__CR_RECONCILED)return;window.__CR_RECONCILED=true;
const BUILD='CR-CENTRAL-CANONICAL-LINKS-FUNCTIONAL-RECONCILIATION-20261003';
const FAST='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v12-1-candidate-20261003?view=public-home';
const AGENDA='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-agenda-executive-v12-1-candidate-20261003?view=public';
const FULL='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v12-candidate-20261003?view=public-home';
const BASE='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes';
const APP='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento';
const FLOW='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const brl=c=>c==null?'—':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(c)/100);
const state={agenda:null,fast:null,full:null,errors:{},updatedAt:{}};
const CR_CANONICAL_ROUTE_REGISTRY=Object.freeze({
 dashboard:{label:'Dashboard Executivo',page:'dashboard',source:'CANONICAL+EVOLUTION',status:'RECONCILED'},
 agenda:{label:'Agenda',page:'dashboard',focus:'v10Agenda',source:'GOOGLE+TRELLO+GESTAOCLICK',status:'EVOLUTION_CANDIDATE'},
 services:{label:'Serviços',page:'dashboard',focus:'v10Kpis',source:'TRELLO',status:'EVOLUTION_CANDIDATE'},
 quotes:{label:'Orçamentos',page:'dashboard',focus:'v10Quotes',source:'GESTAOCLICK',status:'EVOLUTION_CANDIDATE'},
 app:{label:'APP CONSTRU-REI',external:APP+'?mode=app',source:'LINK_REGISTRY_20261001',status:'HOMOLOGADO'},
 flows:{label:'Esteira F00 → F09',external:APP+'?mode=f00',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 f00:{label:'F00',external:FLOW+'f00',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 f01:{label:'F01',external:FLOW+'f01',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 f02:{label:'F02',external:FLOW+'f02',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 f03:{label:'F03',external:FLOW+'f03',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 f04:{label:'F04',external:FLOW+'f04',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 f05:{label:'F05',external:FLOW+'f05',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 f06:{label:'F06',external:FLOW+'f06',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 f07:{label:'F07',external:FLOW+'f07',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 f08:{label:'F08',external:FLOW+'f08',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 f09:{label:'F09',external:FLOW+'f09',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 checklist:{label:'Checklist de Campo',external:'https://checklistobrasconstrurei.vercel.app',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 homolog:{label:'Homologação',external:'https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/homologacao-links-candidate-20261001/#homolog',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 finance:{label:'Gestão Financeira',external:BASE+'?open=centro-comando',source:'LINK_REGISTRY_20261001',status:'HOMOLOGADO'},
 pending:{label:'APP • Pendências',external:BASE+'#pendapp',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 wizy:{label:'Wizy Flow • WZ',external:BASE+'#wizy',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 eder:{label:'Éder • Agora',external:BASE+'#eder',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 intelligence:{label:'IA & Context Gateway',external:BASE+'#context',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 docs:{label:'Documentação',external:BASE+'?open=docs',source:'LINK_REGISTRY_20261001',status:'PROTEGIDO'},
 meeting:{label:'Google Meet',external:'https://meet.google.com/xtw-rihq-jwi',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 presentation:{label:'Apresentação Institucional',external:BASE+'?open=presentation',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 academy:{label:'CONSTRU-REI Academy',external:BASE+'?open=academy',source:'LINK_REGISTRY_20261001',status:'EM_VALIDACAO'},
 history:{label:'Histórico / Snapshots',external:BASE+'#history',source:'LINK_REGISTRY_20261001',status:'PROTEGIDO'},
 health:{label:'Saúde do Sistema',external:BASE+'?open=health',source:'LINK_REGISTRY_20261001',status:'OPERACIONAL'},
 technical:{label:'Éder — Admin Técnico',external:BASE+'?open=technical',source:'LINK_REGISTRY_20261001',status:'PROTEGIDO'},
 admin:{label:'Rogério — Diretor',external:BASE+'?open=admin',source:'LINK_REGISTRY_20261001',status:'PROTEGIDO'}
});
const STATUS_COLORS={'AGUARDANDO VISITA/AGENDAMENTO':'#0a8cff','EM ELABORAÇÃO':'#3c8fe8','AGUARDANDO ENVIO':'#62a9ee','AGUARDANDO APROVAÇÃO':'#f2b233','EM ANDAMENTO':'#168fb8','RETORNO':'#7b46e8','AGUARDANDO PAGAMENTO':'#16b879','AGUARDANDO ACERTO':'#ff8a24','FINALIZADO':'#138a61','NÃO APROVADO':'#d85b67','CANCELADO':'#93a9bd'};
async function get(u){const r=await fetch(u+(u.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Error(d.error||('HTTP '+r.status));return d}
function activatePage(id,label){const p=document.getElementById(id);if(!p)return false;$$('.page').forEach(x=>x.classList.toggle('on',x===p));const t=$('.cr-v10-title b');if(t)t.textContent=label||id;$('.side')?.classList.remove('open');window.scrollTo(0,0);return true}
function navigate(key){
  const r=CR_CANONICAL_ROUTE_REGISTRY[key]; if(!r)return;
  if(r.external){
    const w=window.open(r.external,'_blank','noopener,noreferrer');
    if(!w) window.location.href=r.external;
    return;
  }
  if(activatePage(r.page,r.label)){
    try{history.replaceState({crCentral:true,page:r.page},'',location.pathname+location.search+'#'+r.page)}catch(_){}
    if(r.focus)setTimeout(()=>document.getElementById(r.focus)?.scrollIntoView({behavior:'smooth',block:'start'}),50);
  }
}
function header(){const main=$('.main');if(!main)return;$('.cr-v10-header')?.remove();const h=document.createElement('header');h.className='cr-v10-header';const date=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(new Date());h.innerHTML='<div class="cr-v10-title"><button class="cr-v10-menu" aria-label="Abrir menu">☰</button><div><b>Dashboard Executivo</b><small>Central CONSTRU-REI • candidata reconciliada</small></div></div><label class="cr-v10-search">⌕<input aria-label="Busca global" placeholder="Buscar módulo..."></label><div class="cr-v10-user"><div class="cr-v10-avatar">RD</div><div><b>Rogério</b><small>Diretor</small></div><span class="cr-v10-date">'+esc(date)+'</span></div>';main.insertBefore(h,main.firstChild);$('.cr-v10-menu',h).onclick=()=>$('.side')?.classList.toggle('open');$('input',h).onkeydown=e=>{if(e.key!=='Enter')return;const q=e.target.value.toLowerCase();const k=Object.keys(CR_CANONICAL_ROUTE_REGISTRY).find(k=>CR_CANONICAL_ROUTE_REGISTRY[k].label.toLowerCase().includes(q));if(k)navigate(k)}}
function nav(){const side=$('.side');if(!side)return;$('#crConNav')?.remove();const brand=$('.brand',side);if(brand){$('strong',brand).textContent='CONSTRU-REI';$('small',brand).textContent='CONSTRUINDO RESULTADOS'}const groups=[
['⌂','Início',[['Dashboard Executivo','dashboard']]],
['⚙','Operação',[['APP CONSTRU-REI','app'],['Esteira F00 → F09','flows'],['Checklist de Campo','checklist'],['Homologação','homolog']]],
['$','Financeiro',[['Gestão Financeira','finance']]],
['☷','Pendências',[['APP • Pendências','pending'],['Wizy Flow • WZ','wizy'],['Éder • Agora','eder']]],
['⌁','Inteligência & Integração',[['IA & Context Gateway','intelligence']]],
['▤','Documentação',[['Documentação','docs']]],
['★','Equipe & Conhecimento',[['Google Meet','meeting'],['Apresentação Institucional','presentation'],['CONSTRU-REI Academy','academy'],['Histórico / Snapshots','history'],['Saúde do Sistema','health']]],
['⚿','Acesso Técnico',[['Éder — Admin Técnico','technical'],['Rogério — Diretor','admin']]]];
const n=document.createElement('nav');n.id='crConNav';n.className='cr-con-nav';n.innerHTML=groups.map((g,i)=>'<details class="cr-con-group" '+(i<2?'open':'')+'><summary><span>'+g[0]+'</span>'+esc(g[1])+'</summary><div class="cr-con-sub">'+g[2].map(x=>'<button data-route="'+x[1]+'">'+esc(x[0])+'</button>').join('')+'</div></details>').join('');brand?.insertAdjacentElement('afterend',n);$$('button',n).forEach(b=>b.onclick=()=>{$$('button',n).forEach(x=>x.classList.remove('on'));b.classList.add('on');navigate(b.dataset.route)})}
function shell(){const dash=$('#dashboard');if(!dash)return;dash.innerHTML='<div class="cr-v10"><section class="cr-v10-hero"><div class="cr-v10-hero-main"><div class="cr-v10-hero-copy"><h1>Central <span>CONSTRU-REI</span></h1><p>Controle executivo de operação, agenda, orçamentos e gestão.</p></div><div class="cr-v10-actions"><button class="cr-v10-action primary" data-route="app">＋ Abrir APP</button><button class="cr-v10-action" data-route="agenda">▣ Agenda Google</button><button class="cr-v10-action cr-con-refresh">↻ Atualizar</button></div></div><div class="cr-v10-hero-art"></div></section><section class="cr-v10-kpis" id="v10Kpis"></section><section class="cr-v10-main-grid"><article class="cr-v10-card"><div class="cr-v10-card-head"><span>▣</span><h2>Agenda e operação de hoje</h2><small>Horário • equipe • atividade • orçamento • local.</small><span class="spacer"></span><span id="crAgendaUpdated" class="cr-con-updated"></span></div><div class="cr-v10-agenda-body" id="v10Agenda"><div class="cr-v10-empty">Carregando Google Agenda…</div></div></article><article class="cr-v10-card"><div class="cr-v10-card-head"><span>▥</span><h2>Orçamentos / Serviços em fluxo</h2><small>Status reais do GestãoClick, com leitura por cor.</small><span class="spacer"></span><span id="crQuotesUpdated" class="cr-con-updated"></span></div><div class="cr-v12-flow-body" id="v10Quotes"><div class="cr-v10-empty">Carregando agregados…</div></div></article></section><section class="cr-v10-lower"><article class="cr-v10-card"><div class="cr-v10-card-head"><span>☷</span><h2>Minha Atenção / Pendências</h2><small>Sem confundir exceção técnica com pendência operacional.</small></div><div class="cr-v10-priority-body" id="v10Priorities"></div></article><article class="cr-v10-card"><div class="cr-v10-card-head"><span>⌁</span><h2>Saúde das fontes</h2><small>Resumo executivo das integrações.</small></div><div class="cr-v10-health" id="v10Health"></div></article></section><section class="cr-v10-card"><div class="cr-v10-card-head"><span>◆</span><h2>Gestão da Diretoria</h2><small>Sinais sustentados por fontes reais.</small></div><div class="cr-con-director" id="crConDirector"></div></section></div>';$$('[data-route]',dash).forEach(b=>b.onclick=()=>navigate(b.dataset.route));$('.cr-con-refresh',dash).onclick=refreshAll}
function fmtTime(v){try{return new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date(v))}catch{return'—'}}
function renderAgenda(){const h=$('#v10Agenda'),a=state.agenda;if(!h)return;if(!a){h.innerHTML='<div class="cr-v10-empty">Google Agenda — indisponível nesta leitura.</div>';return}const items=a.items||[];h.innerHTML=items.length?items.slice(0,8).map(x=>'<div class="cr-v10-ag-row"><div class="cr-v10-time">'+esc(fmtTime(x.starts_at))+'</div><span class="cr-v10-dot"></span><div><div class="cr-v10-ag-title">'+esc(x.title||x.type||'Compromisso')+'</div><div class="cr-con-ag-team">'+esc((x.team||[]).length?x.team.join(' + '):'Responsável não identificado')+'</div><div class="cr-con-ag-case">'+esc([x.case,x.type,x.location].filter(Boolean).join(' • '))+'</div></div><span class="cr-v10-badge '+(x.incomplete?'warn':'ok')+'">'+esc(x.incomplete?'Incompleta':x.type||'Programada')+'</span><span class="cr-v10-source">Google</span></div>').join(''):'<div class="cr-v10-empty">Nenhum compromisso comprovado para hoje.</div>';if($('#crAgendaUpdated'))$('#crAgendaUpdated').textContent=state.updatedAt.agenda?'Atualizado '+state.updatedAt.agenda:''}
function renderKpis(){const h=$('#v10Kpis'),f=state.fast,a=state.agenda;if(!h)return;const k=f?.kpis||{},ak=a?.kpis||{};const rows=[['blue','⚙','Serviços em andamento',k.services_in_progress?.count??'—','Trello'],['green','$','Aguardando pagamento',k.awaiting_payment?.count??'—',brl(k.awaiting_payment?.amount_cents)],['purple','▣','Agenda hoje',ak.events_total??'—','Google Agenda'],['orange','▤','Agenda amanhã',k.agenda_tomorrow?.count??'—','Google Agenda'],['green','✓','Aguardando acerto',k.awaiting_adjustment?.count??'—',brl(k.awaiting_adjustment?.amount_cents)]];h.innerHTML=rows.map(x=>'<article class="cr-v10-card cr-v10-kpi '+x[0]+'"><div class="cr-v10-kpi-icon">'+x[1]+'</div><h3>'+esc(x[2])+'</h3><div class="val">'+esc(x[3])+'</div><div class="meta">'+esc(x[4])+'</div></article>').join('')}
function quoteMap(){const q=state.full?.quotes;return q?.by_status||q?.status_distribution||{}}
function renderQuotes(){const h=$('#v10Quotes');if(!h)return;const m=quoteMap(),e=Object.entries(m).map(([name,v])=>[name,typeof v==='number'?{count:v,total_cents:null}:v]).sort((a,b)=>(b[1].count||0)-(a[1].count||0));if(!e.length){h.innerHTML='<div class="cr-v10-empty">'+(state.errors.full?'GestãoClick — indisponível nesta leitura.':'GestãoClick carregando em segundo plano…')+'</div>';return}const mx=Math.max(1,...e.map(x=>x[1].count||0));h.innerHTML=e.map(([n,v])=>{const c=STATUS_COLORS[n]||'#93a9bd';return '<div class="cr-con-status" style="--status:'+c+'"><span>'+esc(n)+'</span><div class="bar"><i style="width:'+Math.max(2,(v.count||0)/mx*100)+'%"></i></div><b>'+esc(v.count??'—')+'</b><em>'+esc(brl(v.total_cents))+'</em></div>'}).join('');if($('#crQuotesUpdated'))$('#crQuotesUpdated').textContent=state.updatedAt.full?'Atualizado '+state.updatedAt.full:''}
function renderPending(){const h=$('#v10Priorities');if(!h)return;const p=state.fast?.pending;if(!p||p.source_status==='SOURCE_IN_IMPLEMENTATION'){h.innerHTML='<div class="cr-con-pending"><b>Pendências • fonte em implantação</b>O Banco Mestre ainda não possui alimentação operacional homologada. Exceções técnicas não são convertidas em pendências.</div>';return}h.innerHTML='<div class="cr-con-pending"><b>'+esc(p.total_live)+' pendências vivas</b>Fonte operacional identificada e disponível.</div>'}
function renderHealth(){const h=$('#v10Health');if(!h)return;const s=state.fast?.sources||{};const rows=[['Banco de Dados',s.database?.ok],['Trello',s.trello?.ok],['Google Agenda',s.agenda?.ok],['GestãoClick',state.full?.sources?.gestaoclick?.ok??(state.full?true:null)]];h.innerHTML=rows.map(([n,v])=>'<div class="cr-v10-health-card"><h4>'+esc(n)+'</h4><b>'+esc(v===true?'Operacional':v===false?'Atenção':'Carregando')+'</b><small>'+esc(v===true?'Fonte disponível':v===false?'Verificar integração':'Atualização progressiva')+'</small></div>').join('')}
function renderDirector(){const h=$('#crConDirector');if(!h)return;const k=state.fast?.kpis||{},m=quoteMap(),ap=m['AGUARDANDO APROVAÇÃO'];const cards=[['Aguardando aprovação',ap?.count??'—',ap?brl(ap.total_cents):'GestãoClick'],['Valores a receber',k.awaiting_payment?.count??'—',brl(k.awaiting_payment?.amount_cents)],['Aguardando acerto',k.awaiting_adjustment?.count??'—',brl(k.awaiting_adjustment?.amount_cents)],['Agenda amanhã',k.agenda_tomorrow?.count??'—','Google Agenda']];h.innerHTML=cards.map(x=>'<div class="cr-con-director-card"><h4>'+esc(x[0])+'</h4><b>'+esc(x[1])+'</b><small>'+esc(x[2])+'</small></div>').join('')}
function renderFast(){renderKpis();renderAgenda();renderPending();renderHealth();renderDirector()}
function renderFull(){renderQuotes();renderHealth();renderDirector()}
async function loadFast(){try{const [f,a]=await Promise.all([get(FAST),get(AGENDA)]);state.fast=f;state.agenda=a;const t=new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit'}).format(new Date());state.updatedAt.fast=t;state.updatedAt.agenda=t}catch(e){state.errors.fast=String(e)}renderFast()}
async function loadFull(){try{state.full=await get(FULL);state.updatedAt.full=new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit'}).format(new Date())}catch(e){state.errors.full=String(e)}renderFull()}
async function refreshAll(){const b=$('.cr-con-refresh');if(b){b.disabled=true;b.textContent='↻ Atualizando…'}await loadFast();await loadFull();if(b){b.disabled=false;b.textContent='↻ Atualizar'}}
function boot(){document.documentElement.classList.add('cr-v11-ready');header();nav();shell();renderFast();loadFast();setTimeout(loadFull,100);window.CR_CENTRAL={BUILD,state,ROUTES:CR_CANONICAL_ROUTE_REGISTRY,refresh:refreshAll}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
/* CR refinement 2026-10-03: identity + navigation guard, no legacy fallback */
(function(){
  function bindIdentity(){
    const brand=document.querySelector('.brand img');
    const hero=document.getElementById('crHeroLogo');
    if(brand&&hero&&!hero.getAttribute('src')) hero.setAttribute('src',brand.currentSrc||brand.getAttribute('src')||'');
  }
  window.crCanonicalBack=function(){ activatePage('dashboard','Dashboard Executivo'); try{history.replaceState({crCentral:true,page:'dashboard'},'',location.pathname+location.search+'#dashboard')}catch(_){} };
  window.addEventListener('popstate',function(){ if(location.pathname.includes('central-canonical-links-functional-reconciliation-candidate-20261003')) window.crCanonicalBack(); });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindIdentity);else bindIdentity();
})();