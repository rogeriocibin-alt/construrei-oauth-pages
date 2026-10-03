(()=>{'use strict';
if(window.__CR_V9_GOOGLE_AGENDA)return;window.__CR_V9_GOOGLE_AGENDA=true;
const API='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-agenda-executive-v9-google-candidate-20261002';
const q=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function sess(){try{return sessionStorage.getItem('crGestaoSession')||localStorage.getItem('crGestaoSession')||''}catch(_){return''}}
function isoDay(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day}
function off(n){const d=new Date();d.setDate(d.getDate()+n);return isoDay(d)}
async function get(url){const h={},s=sess();if(s)h['x-cr-session']=s;const r=await fetch(url,{headers:h,cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Error(d.error||('HTTP '+r.status));return d}
function card(label){return [...document.querySelectorAll('.cr-op-card')].find(c=>(c.querySelector('.cr-op-label')?.textContent||'').trim()===label)}
function setCard(label,count,detail,status){const c=card(label);if(!c)return;const v=c.querySelector('.cr-op-value'),d=c.querySelector('.cr-op-detail'),s=c.querySelector('.cr-op-status');if(v)v.textContent=String(count);if(d)d.textContent=detail;if(s)s.textContent=status;c.setAttribute('data-cr-agenda-v9','google-live')}
function setText(id,v){const e=q(id);if(e)e.textContent=String(v)}
function sourceState(src){if(!src)return'INDISPONÍVEL';return src.ok?'ONLINE':'INDISPONÍVEL'}
function installBanner(T){const note=q('crV5AgendaNote');if(!note)return;let b=q('crV9AgendaLiveBanner');if(!b){b=document.createElement('div');b.id='crV9AgendaLiveBanner';b.className='cr-v5-warn';b.style.marginTop='8px';note.insertAdjacentElement('afterend',b)}
const s=T.sources||{},k=T.kpis||{};b.innerHTML='<b>Agenda Viva V9 • Google Calendar ativo.</b> Google: '+sourceState(s.google_calendar)+' • Trello: '+sourceState(s.trello)+' • GestãoClick: '+sourceState(s.gestaoclick)+'<br>'+Number(k.events_total||0)+' eventos hoje • '+Number(k.trello_matched||0)+' vinculados ao Trello • '+Number(k.gestaoclick_matched||0)+' conciliados no GestãoClick.'}
function installOpen(){const old=q('crV5AgendaOpen');if(!old||q('crV9AgendaOpen'))return;old.style.display='none';const b=document.createElement('button');b.id='crV9AgendaOpen';b.type='button';b.className=old.className||'cr-v5-btn';b.textContent='Abrir Agenda Google';old.insertAdjacentElement('afterend',b);b.onclick=openDetails}
function paint(today,tomorrow,yesterday){
 const kt=today.kpis||{},km=tomorrow.kpis||{},ky=yesterday.kpis||{};
 const operationalToday=Number(kt.visits||0)+Number(kt.executions||0)+Number(kt.returns||0)+Number(kt.warranties||0);
 setCard('Visitas do dia',operationalToday,'Google Agenda • '+Number(kt.events_total||0)+' eventos totais','Hoje');
 setCard('Agenda de amanhã',Number(km.events_total||0),'Google Agenda ConstruRei • fonte oficial','Planejamento');
 setCard('Pendências de ontem',Number(ky.incomplete||0),'Eventos de ontem com informação incompleta','Cobrança');
 setText('crV5AgToday',kt.events_total||0);setText('crV5AgTomorrow',km.events_total||0);setText('crV5AgYesterday',ky.incomplete||0);
 if(q('crV5AgNoConfirm'))q('crV5AgNoConfirm').textContent=String(kt.simultaneous||0);
 if(q('crV5AgNoOwner'))q('crV5AgNoOwner').textContent=String(kt.without_case||0);
 if(q('crV5AgIncomplete'))q('crV5AgIncomplete').textContent=String(kt.incomplete||0);
 if(q('crV5AgendaNote'))q('crV5AgendaNote').textContent='Google Agenda ConstruRei define compromissos e horários. Trello e GestãoClick enriquecem os registros sem substituir a fonte oficial.';
 installBanner(today);installOpen();
 const state=q('crV5State');if(state)state.textContent='CANDIDATA V9 • Google Agenda ConstruRei';
}
function fmt(v){try{return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch{return''}}
function item(x){
 const gc=x.gestaoclick||{},tr=x.trello||{},flags=[x.simultaneous?'HORÁRIO SIMULTÂNEO':'',x.incomplete?'INFORMAÇÃO INCOMPLETA':''].filter(Boolean).join(' • ');
 return '<div class="cr-v5-agenda-item"><b>'+esc(fmt(x.starts_at))+' • '+esc(x.type||'COMPROMISSO')+(x.case?' • '+esc(x.case):'')+'</b><br>'+esc(x.title||'')+(x.location?'<br>'+esc(x.location):'')+(flags?'<br><b>'+esc(flags)+'</b>':'')+'<br><b>Trello:</b> '+esc(tr.matched?'vinculado':'não vinculado')+' • <b>GestãoClick:</b> '+esc(gc.matched?'conciliado':'não localizado')+(x.html_link?'<div style="margin-top:6px"><a class="cr-v5-btn primary" target="_blank" rel="noopener" href="'+esc(x.html_link)+'">Abrir no Google Agenda</a></div>':'')+'</div>';
}
async function openDetails(){const host=q('crV5AgendaDetails');if(!host)return;host.hidden=false;host.innerHTML='<div class="cr-v5-warn">Carregando Google Agenda…</div>';try{
 const days=[['Hoje',off(0)],['Amanhã',off(1)],['Ontem',off(-1)]];
 const data=await Promise.all(days.map(async g=>[g[0],await get(API+'?view=details&date='+g[1]+'&t='+Date.now())]));
 host.innerHTML='<div class="cr-v5-agenda-list">'+data.map(g=>'<div class="cr-v5-agenda-col"><h4>'+g[0]+'</h4>'+((g[1].items||[]).length?(g[1].items||[]).map(item).join(''):'<div class="cr-v5-agenda-item">Nenhum registro.</div>')+'</div>').join('')+'</div>';
 }catch(e){host.innerHTML='<div class="cr-v5-warn"><b>Agenda Google está ativa.</b><br>O detalhamento exige sessão Diretor/Técnico da Central. '+esc(e.message)+'</div>'}
}
let painting=false,last=null;
async function refresh(){try{
 const [t,m,y]=await Promise.all([get(API+'?view=public&date='+off(0)+'&t='+Date.now()),get(API+'?view=public&date='+off(1)+'&t='+Date.now()),get(API+'?view=public&date='+off(-1)+'&t='+Date.now())]);
 last=[t,m,y];painting=true;paint(t,m,y);setTimeout(()=>painting=false,0);
 }catch(e){const n=q('crV5AgendaNote');if(n)n.textContent='Agenda V9 indisponível nesta leitura: '+e.message}
}
function init(){installOpen();refresh();new MutationObserver(()=>{if(last&&!painting)setTimeout(()=>{painting=true;paint(...last);setTimeout(()=>painting=false,0)},10)}).observe(document.documentElement,{childList:true,subtree:true});setInterval(refresh,30000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();