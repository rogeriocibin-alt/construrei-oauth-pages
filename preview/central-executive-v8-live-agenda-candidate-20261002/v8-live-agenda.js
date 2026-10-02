(()=>{'use strict';
if(window.__CR_V8_LIVE_AGENDA)return;window.__CR_V8_LIVE_AGENDA=true;
const API='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-agenda-executive-v8-candidate-20261002';
const q=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function sess(){try{return sessionStorage.getItem('crGestaoSession')||localStorage.getItem('crGestaoSession')||''}catch(_){return''}}
async function get(url){const h={},s=sess();if(s)h['x-cr-session']=s;const r=await fetch(url,{headers:h,cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Error(d.error||('HTTP '+r.status));return d}
function card(label){return [...document.querySelectorAll('.cr-op-card')].find(c=>(c.querySelector('.cr-op-label')?.textContent||'').trim()===label)}
function setCard(label,count,match,total,status){
 const c=card(label);if(!c)return;
 const v=c.querySelector('.cr-op-value'),d=c.querySelector('.cr-op-detail'),s=c.querySelector('.cr-op-status');
 if(v)v.textContent=String(count);
 if(d)d.textContent='Trello agendado • GestãoClick '+match+'/'+total+' conciliado'+(total===1?'':'s');
 if(s)s.textContent=status;
 c.setAttribute('data-cr-agenda-v8','live');
}
function setText(id,v){const e=q(id);if(e)e.textContent=String(v)}
function installBanner(D){
 const note=q('crV5AgendaNote');if(!note)return;
 let b=q('crV8AgendaLiveBanner');
 if(!b){b=document.createElement('div');b.id='crV8AgendaLiveBanner';b.className='cr-v5-warn';b.style.marginTop='8px';note.insertAdjacentElement('afterend',b)}
 const cov=D.coverage||{};
 b.innerHTML='<b>Agenda Viva V8 ativa.</b> Data/agendamento: Trello. Conferência: GestãoClick. '+(cov.trello_scheduled_cards||0)+' cards com agenda • '+(cov.matched_scheduled_cards||0)+' conciliados com orçamento/O.S. no Click.';
}
function installOpen(){
 const old=q('crV5AgendaOpen');if(!old||q('crV8AgendaOpen'))return;
 old.style.display='none';
 const b=document.createElement('button');b.id='crV8AgendaOpen';b.type='button';b.className=old.className||'cr-v5-btn';b.textContent='Abrir Agenda Viva';
 old.insertAdjacentElement('afterend',b);b.onclick=openDetails;
}
function paint(D){
 const k=D.kpis||{};
 const t=k.visits_today||{},a=k.agenda_tomorrow||{},p=k.pending_yesterday||{};
 setCard('Visitas do dia',t.count,t.gc_matched,t.count,'Hoje');
 setCard('Agenda de amanhã',a.count,a.gc_matched,a.count,'Planejamento');
 setCard('Pendências de ontem',p.count,p.gc_matched,p.count,'Cobrança');
 setText('crV5AgToday',t.count);setText('crV5AgTomorrow',a.count);setText('crV5AgYesterday',p.count);
 if(q('crV5AgNoConfirm'))q('crV5AgNoConfirm').textContent='—';
 if(q('crV5AgNoOwner'))q('crV5AgNoOwner').textContent='—';
 if(q('crV5AgIncomplete'))q('crV5AgIncomplete').textContent='—';
 if(q('crV5AgendaNote'))q('crV5AgendaNote').textContent='Agenda operacional viva: Trello define data/start; GestãoClick concilia orçamento e ordem de serviço.';
 installBanner(D);installOpen();
 const state=q('crV5State');if(state&&/CANDIDATA V6|CANDIDATA V7/i.test(state.textContent||''))state.textContent='CANDIDATA V8 • Agenda viva Trello + GestãoClick';
}
function item(x){
 const gc=x.gestaoclick||{},link=x.trello_url?'<a class="cr-v5-btn primary" target="_blank" rel="noopener" href="'+esc(x.trello_url)+'">Abrir Trello</a>':'';
 return '<div class="cr-v5-agenda-item"><b>'+esc(x.case)+' • '+esc(x.list)+'</b><br>'+esc(x.title||'')+'<br><b>GestãoClick:</b> '+esc(gc.matched?'conciliado':'não localizado')+(gc.quote_status?' • Orçamento: '+esc(gc.quote_status):'')+(gc.order_status?' • O.S.: '+esc(gc.order_status):'')+(gc.customer?' • '+esc(gc.customer):'')+'<div style="margin-top:6px">'+link+'</div></div>';
}
async function openDetails(){
 const host=q('crV5AgendaDetails');if(!host)return;
 host.hidden=false;host.innerHTML='<div class="cr-v5-warn">Carregando Agenda Viva…</div>';
 try{
   const D=await get(API+'?view=details&t='+Date.now()),i=D.items||{};
   const groups=[['Hoje',i.today||[]],['Amanhã',i.tomorrow||[]],['Pendências de ontem',i.pending_yesterday||[]]];
   host.innerHTML='<div class="cr-v5-agenda-list">'+groups.map(g=>'<div class="cr-v5-agenda-col"><h4>'+g[0]+'</h4>'+(g[1].length?g[1].map(item).join(''):'<div class="cr-v5-agenda-item">Nenhum registro.</div>')+'</div>').join('')+'</div>';
 }catch(e){
   host.innerHTML='<div class="cr-v5-warn"><b>Totais da Agenda Viva já estão ativos.</b><br>O detalhamento por obra exige sessão Diretor/Técnico da Central. '+esc(e.message)+'</div>';
 }
}
let D=null,painting=false;
async function refresh(){try{D=await get(API+'?view=public&t='+Date.now());painting=true;paint(D);setTimeout(()=>painting=false,0)}catch(e){const n=q('crV5AgendaNote');if(n)n.textContent='Agenda V8 indisponível nesta leitura: '+e.message}}
function init(){
 installOpen();refresh();
 new MutationObserver(()=>{if(D&&!painting)setTimeout(()=>{painting=true;paint(D);setTimeout(()=>painting=false,0)},10)}).observe(document.documentElement,{childList:true,subtree:true});
 setInterval(refresh,30000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();