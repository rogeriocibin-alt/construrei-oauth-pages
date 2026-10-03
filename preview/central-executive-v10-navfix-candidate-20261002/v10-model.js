(()=>{'use strict';
if(window.__CR_V10_MODEL)return;window.__CR_V10_MODEL=true;
const API='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-agenda-executive-v9-google-candidate-20261002';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const navByText=t=>$('.side>.grp .nav,.side .cr-v10-original .nav').find(x=>norm(x.innerText)===t)||$('.side .nav').find(x=>norm(x.innerText)===t);
const proxy=t=>{const n=navByText(t); if(n)n.click()};
function activatePage(id,label){
 const p=document.getElementById(id);if(!p)return false;
 $('.page').forEach(x=>x.classList.remove('on'));p.classList.add('on');
 $('.side .nav').forEach(x=>x.classList.remove('on'));
 const n=$('.side .nav').find(x=>x.dataset.page===id);if(n)n.classList.add('on');
 const title=label||norm(n?.innerText)||'Central CONSTRU-REI';
 const crumb=$('#crumb');if(crumb)crumb.textContent=title;
 const vt=$('.cr-v10-title b');if(vt)vt.textContent=title;
 try{window.scrollTo({top:0,left:0,behavior:'instant'})}catch{window.scrollTo(0,0)}
 return true;
}
function goPrimary(text,id,label){
 const n=navByText(text);if(n){try{n.click()}catch{}}
 setTimeout(()=>{if(document.querySelector('.page.on')?.id!==id)activatePage(id,label)},20);
}
const today=()=>{const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),da=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+da};
const sess=()=>{try{return sessionStorage.getItem('crGestaoSession')||localStorage.getItem('crGestaoSession')||''}catch{return''}};
async function api(view,date=today()){const h={},s=sess();if(s)h['x-cr-session']=s;const r=await fetch(API+'?view='+view+'&date='+date+'&t='+Date.now(),{headers:h,cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Error(d.error||('HTTP '+r.status));return d}
function findLegacyCard(label){return $$('.cr-op-card').find(c=>norm($('.cr-op-label',c)?.textContent)===label)}
function cardVal(label){return norm($('.cr-op-value',findLegacyCard(label))?.textContent)||'—'}
function quoteStatuses(){return $$('#crV5QuoteStatuses .cr-v5-status').map(x=>({name:norm($('span',x)?.textContent),value:Number(norm($('b',x)?.textContent).replace(/\D/g,''))||0,el:x})).filter(x=>x.name)}
function pendingRows(){return $$('.cr-pending-card').slice(0,3).map((x,i)=>({title:norm($('h3',x)?.textContent)||['Banco Mestre','Vencidas','Ontem'][i],total:norm($('.cr-pending-total',x)?.textContent)||'—',desc:norm($('.cr-pending-lines',x)?.innerText)||'Sem alimentação operacional homologada',btn:$('.btn',x)}))}
function healthRows(){return $$('.cr-health-card').slice(0,8).map(x=>({label:norm($('.cr-health-label',x)?.textContent),value:norm($('.cr-health-value',x)?.textContent)||'—',sub:norm($('.cr-health-sub',x)?.textContent)||''})).filter(x=>x.label)}
function flowRows(){return $$('.cr-flow-card').slice(0,10).map((x,i)=>({code:norm($('.cr-flow-code',x)?.textContent)||('F0'+i),title:norm($('h3',x)?.textContent)||'',state:norm($('.cr-flow-state',x)?.innerText)||'',btn:$('.cr-flow-actions .btn',x)}))}
function buildHeader(){
 const main=$('.main');if(!main||$('.cr-v10-header'))return;
 const h=document.createElement('header');h.className='cr-v10-header';
 const date=new Intl.DateTimeFormat('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(new Date());
 h.innerHTML='<div class="cr-v10-title"><button class="cr-v10-menu" aria-label="Abrir menu">☰</button><div><b>Dashboard Executivo</b><small>Visão completa • Controle total • Central CONSTRU-REI</small></div></div><label class="cr-v10-search">⌕<input aria-label="Busca global" placeholder="Buscar serviços, clientes, orçamentos..."></label><div class="cr-v10-user"><div class="cr-v10-avatar">RD</div><div><b>Rogério</b><small>Diretor</small></div><span class="cr-v10-date">'+esc(date)+'</span></div>';
 main.insertBefore(h,main.firstChild);
 $('.cr-v10-menu',h).onclick=()=>$('.side')?.classList.toggle('open');
 const input=$('input',h);input.onkeydown=e=>{if(e.key!=='Enter')return;const q=norm(input.value).toLowerCase();if(!q)return;const n=$$('.side .nav').find(x=>norm(x.innerText).toLowerCase().includes(q));if(n)n.click()};
}
function buildSidebar(){
 const side=$('.side');if(!side||$('.cr-v10-primary-nav'))return;
 const groups=$('.side>.grp');groups.forEach(g=>g.classList.add('cr-v10-original'));
 const nav=document.createElement('div');nav.className='cr-v10-primary-nav';
 const defs=[
  ['⌂','Início','Dashboard Executivo','dashboard','Dashboard Executivo'],
  ['⚙','Operação','Esteira F00 → F09','flows','Operação'],
  ['✓','Pendências','APP • Pendências','pendapp','Pendências'],
  ['▥','Inteligência','IA & Context Gateway','context','Inteligência'],
  ['▭','Base técnica','Documentações','docs','Base técnica']
 ];
 nav.innerHTML=defs.map((d,i)=>'<button class="cr-v10-side-btn '+(i===0?'on':'')+'" data-target="'+esc(d[2])+'" data-page="'+esc(d[3])+'" data-label="'+esc(d[4])+'"><span class="cr-v10-side-icon">'+d[0]+'</span>'+d[1]+'</button>').join('');
 const more=document.createElement('details');more.className='cr-v10-more';more.innerHTML='<summary>Mais acessos ▾</summary>';
 groups.forEach(g=>more.appendChild(g.cloneNode(true)));
 side.insertBefore(nav,groups[0]||null);side.appendChild(more);
 $('.cr-v10-side-btn',nav).forEach(b=>b.onclick=()=>{
   goPrimary(b.dataset.target,b.dataset.page,b.dataset.label);
   $('.cr-v10-side-btn',nav).forEach(x=>x.classList.remove('on'));b.classList.add('on');side.classList.remove('open');
 });
 $('.cr-v10-more .nav',more).forEach(cl=>cl.onclick=e=>{
   e.preventDefault();e.stopPropagation();
   const txt=norm(cl.innerText),id=cl.dataset.page;
   if(id)activatePage(id,txt);
   else {const orig=navByText(txt);if(orig&&orig!==cl)orig.click()}
   side.classList.remove('open');
 });
}
function legacyWrap(){
 const dash=$('#dashboard');if(!dash||$('.cr-v10',dash))return null;
 const legacy=document.createElement('div');legacy.className='cr-v10-legacy';
 while(dash.firstChild)legacy.appendChild(dash.firstChild);
 dash.appendChild(legacy);
 const root=document.createElement('div');root.className='cr-v10';dash.insertBefore(root,legacy);return root;
}
function skeleton(root){
 root.innerHTML='<section class="cr-v10-hero"><div class="cr-v10-hero-main"><div class="cr-v10-hero-copy"><h1>Central <span>CONSTRU-REI</span></h1><p>Controle executivo de desenvolvimento, operação e governança.</p></div><div class="cr-v10-actions"><button class="cr-v10-action primary" data-act="app">＋ Abrir APP</button><button class="cr-v10-action" data-act="agenda">▣ Agenda Google</button><button class="cr-v10-action" data-act="gerencial">▤ Dashboard Gerencial V4</button></div></div><div class="cr-v10-hero-art"></div></section>'+
 '<section class="cr-v10-kpis" id="v10Kpis"></section>'+
 '<section class="cr-v10-main-grid"><article class="cr-v10-card"><div class="cr-v10-card-head"><span>▣</span><h2>Agenda e operação de hoje</h2><small>Atividades do dia com origem integrada aos sistemas.</small><span class="spacer"></span><button class="cr-v10-link" data-act="agenda">Ver agenda completa →</button></div><div class="cr-v10-agenda-body" id="v10Agenda"><div class="cr-v10-empty">Carregando agenda real…</div></div></article><article class="cr-v10-card"><div class="cr-v10-card-head"><span>▥</span><h2>Orçamentos / Serviços em fluxo</h2><small>Visão consolidada por status.</small><span class="spacer"></span><button class="cr-v10-link" data-act="quotes">Ver detalhes →</button></div><div class="cr-v10-flow-body" id="v10Quotes"></div></article></section>'+
 '<section class="cr-v10-lower"><article class="cr-v10-card"><div class="cr-v10-card-head"><span>☷</span><h2>Ações prioritárias</h2><small>Itens que requerem atenção executiva.</small><span class="spacer"></span><button class="cr-v10-link" data-act="pending">Ver todas →</button></div><div class="cr-v10-priority-body" id="v10Priorities"></div></article><article class="cr-v10-card"><div class="cr-v10-card-head"><span>⌁</span><h2>Saúde técnica</h2><small>Status dos principais serviços.</small><span class="spacer"></span><button class="cr-v10-link" data-act="health">Ver status completo →</button></div><div class="cr-v10-health" id="v10Health"></div></article></section>'+
 '<section class="cr-v10-card"><div class="cr-v10-card-head"><span>▦</span><h2>Esteira F00 → F09</h2><small>Acompanhe o fluxo completo, do primeiro contato ao pós-venda.</small><span class="spacer"></span><button class="cr-v10-link" data-act="flows">Ver esteira completa →</button></div><div class="cr-v10-pipeline"><div class="cr-v10-pipe" id="v10Pipe"></div></div></section>';
 $$('[data-act]',root).forEach(b=>b.onclick=()=>{
   const a=b.dataset.act;
   if(a==='app')proxy('APP CONSTRU-REI'); else if(a==='agenda')($('#crV9AgendaOpen')||$('#crV5AgendaOpen'))?.click();
   else if(a==='gerencial')proxy('Dashboard Gerencial V4'); else if(a==='quotes')$('#crV5QuotesOpen')?.click();
   else if(a==='pending')proxy('APP • Pendências'); else if(a==='health')proxy('Saúde do Sistema'); else if(a==='flows')proxy('Esteira F00 → F09');
 });
}
function renderKpis(publicAgenda){
 const q=quoteStatuses(), flow=q.reduce((s,x)=>s+(['AGUARDANDO APROVAÇÃO','EM ANDAMENTO','AGUARDANDO PAGAMENTO','AGUARDANDO VISITA/AGENDAMENTO','EM ELABORAÇÃO','RETORNO'].includes(x.name)?x.value:0),0);
 const exceptions=cardVal('Exceções de fonte');
 const visits=publicAgenda?.kpis?.visits;
 const data=[
  ['blue','⚙','Serviços em andamento',cardVal('Serviços em andamento'),'Fonte operacional'],
  ['green','$','Aguardando pagamento',cardVal('Aguardando pagamento'),'Gestão financeira'],
  ['purple','▣','Visitas hoje',Number.isFinite(visits)?visits:'—','Google Agenda'],
  ['orange','▤','Orçamentos em fluxo',flow||cardVal('Orçamentos em fluxo'),'GestãoClick'],
  ['red','!','Exceções de fonte',exceptions,'Monitoramento']
 ];
 $('#v10Kpis').innerHTML=data.map(x=>'<article class="cr-v10-card cr-v10-kpi '+x[0]+'"><div class="cr-v10-kpi-icon">'+x[1]+'</div><h3>'+esc(x[2])+'</h3><div class="val">'+esc(x[3])+'</div><div class="meta">'+esc(x[4])+'</div></article>').join('');
}
function fmtTime(v){try{return new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date(v))}catch{return'—'}}
function renderAgenda(details,publicAgenda){
 const host=$('#v10Agenda');if(!host)return;
 const items=details?.items||[];
 if(!items.length){const k=publicAgenda?.kpis||{};host.innerHTML='<div class="cr-v10-empty"><b>'+esc(k.events_total??'—')+' eventos identificados hoje.</b><br>O detalhamento exige sessão autorizada; nenhum compromisso foi inventado.</div>';return}
 host.innerHTML=items.slice(0,6).map((x,i)=>'<div class="cr-v10-ag-row"><div class="cr-v10-time">'+esc(fmtTime(x.starts_at))+'</div><span class="cr-v10-dot" style="background:'+(i%3===0?'#0a8cff':i%3===1?'#16b879':'#f2b233')+'"></span><div><div class="cr-v10-ag-title">'+esc(x.title||x.type||'Compromisso')+'</div><div class="cr-v10-ag-desc">'+esc(x.location||x.description||'')+'</div></div><span class="cr-v10-badge '+(x.incomplete?'warn':'ok')+'">'+esc(x.incomplete?'Informação incompleta':'Programada')+'</span><span class="cr-v10-source">Google Agenda</span></div>').join('');
}
function renderQuotes(){
 const host=$('#v10Quotes'),q=quoteStatuses().sort((a,b)=>b.value-a.value).slice(0,5);if(!host)return;
 if(!q.length){host.innerHTML='<div class="cr-v10-empty">Aguardando leitura real do GestãoClick.</div>';return}
 const max=Math.max(...q.map(x=>x.value),1),cols=['#0a8cff','#16b879','#ef4558','#f2b233','#93a9bd'];
 host.innerHTML=q.map((x,i)=>'<div class="cr-v10-flow-row"><span>'+esc(x.name.replace(/\b\w/g,m=>m.toUpperCase()).toLowerCase().replace(/^./,m=>m.toUpperCase()))+'</span><div class="cr-v10-bar"><i style="width:'+Math.max(3,x.value/max*100)+'%;--bar:'+cols[i]+'"></i></div><b>'+x.value+'</b></div>').join('');
}
function renderPriorities(){
 const host=$('#v10Priorities'),rows=pendingRows();if(!host)return;
 if(!rows.length){host.innerHTML='<div class="cr-v10-empty">Aguardando alimentação operacional homologada.</div>';return}
 host.innerHTML=rows.map((x,i)=>'<div class="cr-v10-priority"><div class="cr-v10-priority-icon">'+(i===0?'!':'•')+'</div><div><div class="cr-v10-priority-title">'+esc(x.title)+'</div><div class="cr-v10-priority-desc">'+esc(x.total!=='—'?x.total+' • '+x.desc:x.desc)+'</div></div><div class="cr-v10-resp">Gestão executiva</div><div class="cr-v10-sev '+(i===0?'high':'')+'">'+(i===0?'Alta':'Média')+'</div><button class="cr-v10-open">Abrir gestão</button></div>').join('');
 $$('.cr-v10-open',host).forEach((b,i)=>b.onclick=()=>rows[i].btn?.click());
}
function renderHealth(){
 const host=$('#v10Health'),rows=healthRows();if(!host)return;
 const prefer=['Banco de Dados','Trello','GestãoClick','Agenda'];let pick=prefer.map(n=>rows.find(x=>x.label.toLowerCase()===n.toLowerCase())).filter(Boolean);if(pick.length<4)pick=[...pick,...rows.filter(x=>!pick.includes(x))].slice(0,4);
 if(!pick.length){host.innerHTML='<div class="cr-v10-empty">Sem fonte operacional de saúde nesta leitura.</div>';return}
 host.innerHTML=pick.map(x=>'<div class="cr-v10-health-card"><h4>'+esc(x.label)+'</h4><b>'+esc(x.value)+'</b><small>'+esc(x.sub||'Estado informado pela telemetria disponível')+'</small></div>').join('');
}
function renderPipe(){
 const host=$('#v10Pipe'),rows=flowRows();if(!host)return;
 host.innerHTML=rows.map((x,i)=>'<div class="cr-v10-step '+(i<3?'done':i===3?'active':'')+'"><div class="cr-v10-step-dot">'+(i<3?'✓':x.code.replace('F',''))+'</div><b>'+esc(x.code)+'</b><span>'+esc(x.title.replace(/&/g,'e'))+'</span><button aria-label="Abrir '+esc(x.code)+'"></button></div>').join('');
 $$('.cr-v10-step button',host).forEach((b,i)=>b.onclick=()=>rows[i].btn?.click());
}
async function refresh(){
 let pub=null,det=null;try{pub=await api('public')}catch{}
 try{det=await api('details')}catch{}
 renderKpis(pub);renderAgenda(det,pub);renderQuotes();renderPriorities();renderHealth();renderPipe();
}
function init(){
 buildHeader();buildSidebar();const root=legacyWrap();if(!root)return;skeleton(root);
 setTimeout(refresh,1000);setTimeout(refresh,3200);setInterval(refresh,30000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
})();