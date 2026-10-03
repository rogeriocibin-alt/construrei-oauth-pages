(()=>{'use strict';if(window.__CR_V121)return;window.__CR_V121=true;
const FAST='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v12-1-candidate-20261003?view=public-home';
const AGENDA='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-agenda-executive-v12-1-candidate-20261003?view=public';
const FULL='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v12-candidate-20261003?view=public-home';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const brl=c=>c==null?'—':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(c)/100);
async function get(u){const r=await fetch(u+(u.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Error(d.error||r.status);return d}
function page(id,label){const p=document.getElementById(id);if(!p)return false;$$('.page').forEach(x=>x.classList.remove('on'));p.classList.add('on');const t=$('.cr-v10-title b');if(t)t.textContent=label;$('.side')?.classList.remove('open');return true}
function legacy(label){const n=$$('.side .cr-v10-original .nav,.side>.grp .nav').find(x=>(x.innerText||'').trim()===label);if(n){n.click();$('.side')?.classList.remove('open');return true}return false}
function nav(){const side=$('.side');if(!side||$('#crV121Nav'))return;const n=document.createElement('nav');n.id='crV121Nav';n.className='cr-v121-nav';
 const groups=[
 ['⌂','Início',[['Dashboard Executivo','dashboard','Dashboard Executivo']]],
 ['⚙','Operação',[['Hoje na Operação','dashboard','Dashboard Executivo'],['Agenda','agenda','Agenda'],['Serviços','ops','Operação'],['Orçamentos','quotes','Orçamentos'],['APP / Atendimento','pendapp','APP • Pendências'],['Fluxos F00–F09','flows','Esteira F00 → F09']]],
 ['$','Financeiro',[['Aguardando Pagamento','finance','Gestão Financeira'],['Aguardando Acertos','finance','Gestão Financeira'],['Gestão Financeira','finance','Gestão Financeira'],['Acertos','acertos','Acertos']]],
 ['☷','Gestão',[['Minha Atenção','dashboard','Dashboard Executivo'],['Pendências','pendapp','APP • Pendências'],['Auditorias','audit','Auditorias']]],
 ['⌁','Inteligência & Integrações',[['GestãoClick','quotes','Orçamentos'],['Trello','ops','Operação'],['Google Agenda','agenda','Agenda'],['Fontes / Sincronização','health','Saúde do Sistema']]],
 ['▣','Desenvolvimento',[['Saúde Técnica','health','Saúde do Sistema'],['Releases','versions','Versões'],['Checkpoints','versions','Versões']]],
 ['▤','Base Técnica',[['Documentação','docs','Documentações'],['Academy','academy','Academy'],['Governança','governance','Governança']]]
 ];
 n.innerHTML=groups.map((g,i)=>'<details class="cr-v121-group" '+(i<2?'open':'')+'><summary><span>'+g[0]+'</span>'+esc(g[1])+'</summary><div class="cr-v121-sub">'+g[2].map(x=>'<button data-page="'+esc(x[1])+'" data-legacy="'+esc(x[2])+'">'+esc(x[0])+'</button>').join('')+'</div></details>').join('');
 const brand=$('.brand',side);brand?.insertAdjacentElement('afterend',n);
 $$('button',n).forEach(b=>b.onclick=()=>{if(!page(b.dataset.page,b.textContent.trim()))legacy(b.dataset.legacy);$$('button',n).forEach(x=>x.classList.remove('on'));b.classList.add('on')});
}
function removePipe(){const h=$$('.cr-v10-card-head h2').find(x=>(x.textContent||'').includes('Esteira F00'));const card=h?.closest('.cr-v10-card');if(!card)return;card.innerHTML='<div class="cr-v10-card-head"><span>◆</span><h2>Gestão da Diretoria</h2><small>Sinais executivos sustentados por fontes reais.</small></div><div class="cr-v121-director" id="crV121Director"><div class="cr-v121-director-card"><h4>Carregando gestão…</h4><b>—</b><small>Somente métricas comprovadas.</small></div></div>'}
function agenda(d){const host=$('#v10Agenda'),items=d?.items||[];if(!host)return;const tm=v=>new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(new Date(v));
 host.innerHTML=items.length?items.slice(0,7).map(x=>'<div class="cr-v10-ag-row"><div class="cr-v10-time">'+esc(tm(x.starts_at))+'</div><span class="cr-v10-dot"></span><div><div class="cr-v10-ag-title">'+esc(x.title||x.type)+'</div><div class="cr-v121-ag-team">'+esc((x.team||[]).length?(x.team||[]).join(' + '):'Responsável não identificado')+'</div><div class="cr-v121-ag-case">'+esc([x.case,x.type,x.location].filter(Boolean).join(' • '))+'</div></div><span class="cr-v10-badge '+(x.incomplete?'warn':'ok')+'">'+esc(x.incomplete?'Incompleta':x.type)+'</span><span class="cr-v10-source">Google</span></div>').join(''):'<div class="cr-v10-empty">Nenhum compromisso comprovado para hoje.</div>'}
function kpis(f,a){const host=$('#v10Kpis');if(!host)return;const k=f.kpis||{},ak=a.kpis||{};const data=[['blue','⚙','Serviços em andamento',k.services_in_progress?.count??'—','Trello'],['green','$','Aguardando pagamento',k.awaiting_payment?.count??'—',brl(k.awaiting_payment?.amount_cents)],['purple','▣','Agenda hoje',ak.events_total??'—','Google Agenda'],['orange','▤','Agenda amanhã',k.agenda_tomorrow?.count??'—','Google Agenda'],['green','✓','Aguardando acerto',k.awaiting_adjustment?.count??'—',brl(k.awaiting_adjustment?.amount_cents)]];
 host.innerHTML=data.map(x=>'<article class="cr-v10-card cr-v10-kpi '+x[0]+'"><div class="cr-v10-kpi-icon">'+x[1]+'</div><h3>'+esc(x[2])+'</h3><div class="val">'+esc(x[3])+'</div><div class="meta">'+esc(x[4])+'</div></article>').join('')}
function director(f,full){const h=$('#crV121Director');if(!h)return;const k=f.kpis||{},by=full?.quotes?.by_status||{},ap=by['AGUARDANDO APROVAÇÃO'];const cards=[
 ['Aguardando aprovação',ap?.count??'—',ap?brl(ap.total_cents):'GestãoClick carregando',''],
 ['Valores a receber',k.awaiting_payment?.count??'—',brl(k.awaiting_payment?.amount_cents),'money'],
 ['Aguardando acerto',k.awaiting_adjustment?.count??'—',brl(k.awaiting_adjustment?.amount_cents),'warn'],
 ['Agenda amanhã',k.agenda_tomorrow?.count??'—','Google Agenda','']
 ];h.innerHTML=cards.map(x=>'<div class="cr-v121-director-card '+x[3]+'"><h4>'+esc(x[0])+'</h4><b>'+esc(x[1])+'</b><small>'+esc(x[2])+'</small></div>').join('')}
function quotes(full){const host=$('#v10Quotes');if(!host||!full?.quotes?.by_status)return;const e=Object.entries(full.quotes.by_status).sort((a,b)=>b[1].count-a[1].count),mx=Math.max(1,...e.map(x=>x[1].count));host.className='cr-v12-flow-body';host.innerHTML=e.map(([n,v])=>'<div class="cr-v12-flow-row"><span>'+esc(n)+'</span><div class="bar"><i style="width:'+Math.max(2,v.count/mx*100)+'%"></i></div><b>'+v.count+'</b><em>'+esc(brl(v.total_cents))+'</em></div>').join('')}
async function init(){nav();removePipe();const t0=performance.now();let f={},a={};try{[f,a]=await Promise.all([get(FAST),get(AGENDA)]);kpis(f,a);agenda(a);director(f,null);const st=$('#crV5State');if(st)st.textContent='CANDIDATA V12.1 • carregamento progressivo';document.documentElement.dataset.crV121FastMs=String(Math.round(performance.now()-t0))}catch(e){console.error('V121_FAST',e)}
 setTimeout(async()=>{try{const full=await get(FULL);quotes(full);director(f,full)}catch(e){console.error('V121_DETAIL',e)}},150);
}
function boot(){setTimeout(init,450)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();