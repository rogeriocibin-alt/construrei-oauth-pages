(()=>{'use strict';
if(window.__CR_HUMAN_IDENTITY_V9)return;window.__CR_HUMAN_IDENTITY_V9=true;
const ROOT='https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/';
const REG=ROOT+'team-registry.json?v=20261006-context-v3';
const LOGO='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/construrei-logo';
const LINKS={
 trello:'https://trello.com/b/qI0r9MT8/gest%C3%A3o-de-obras-2026',
 gestaoclick:'https://gestaoclick.com/inicio',
 cora:'https://app.cora.com.br'
};
let PEOPLE={
 rogerio:{name:'Rogério',role:'Diretor • visão, decisão e governança',face:ROOT+'rogerio-face.webp?v=9'},
 eder:{name:'Éder',role:'Admin Técnico • operação técnica e controle',face:ROOT+'eder-face.webp?v=9'},
 gabrielly:{name:'Gabrielly',role:'Atendimento • triagem e comunicação',face:ROOT+'gabrielly-face.webp?v=9'},
 fabricio:{name:'Fabrício',role:'Execução • campo, qualidade e entrega',face:ROOT+'fabricio-face.webp?v=9'}
};
let OWNER={
 app:['gabrielly'],pendapp:['rogerio'],checklist:['fabricio'],wizy:['eder'],eder:['eder'],
 technical:['eder'],admin:['rogerio'],meeting:['rogerio','eder','gabrielly','fabricio'],
 presentation:['rogerio','eder','gabrielly','fabricio']
};
const TRACK_OWNER={
 'ATENDIMENTO':['gabrielly'],'ORÇAMENTO':['eder','rogerio'],'OPERAÇÃO':['eder','fabricio'],
 'CAMPO':['fabricio'],'FINANCEIRO':['rogerio'],'GESTÃO':['rogerio'],
 'FERRAMENTAS OPERACIONAIS':['eder','gabrielly'],'SEGURANÇA':['eder','fabricio']
};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function picks(text){
 const n=norm(text);
 if(/toda.*equipe|equipe inteira/.test(n))return Object.values(PEOPLE);
 const found=Object.values(PEOPLE).filter(p=>n.includes(norm(p.name))||(p.name==='Gabrielly'&&/\bgabi\b/.test(n)));
 return found;
}
function img(p,cls=''){return '<img class="'+cls+'" src="'+esc(p.face)+'" alt="'+esc(p.name)+'" title="'+esc(p.name)+' • '+esc(p.role)+'" loading="eager">'}
function appBrand(){
 const p=document.querySelector('.cr-profile');if(!p)return;
 p.classList.add('cr-app-brand-profile');p.setAttribute('aria-label','APP CONSTRU-REI');
 p.innerHTML='<span class="cr-avatar cr-avatar-logo"><img src="'+LOGO+'" alt="APP CONSTRU-REI"></span>';
}
function openAgenda(){
 try{if(typeof window.go==='function')window.go('dashboard')}catch(_){}
 setTimeout(()=>{const a=document.getElementById('crAgendaToday');if(a)a.scrollIntoView({behavior:'smooth',block:'start'})},60);
}
function notification(){
 const b=document.getElementById('crTopHome');if(!b)return;
 b.classList.add('cr-notify-btn');b.innerHTML='🔔<span class="cr-notify-badge" hidden>1</span>';
 b.setAttribute('aria-label','Notificações da agenda');b.title='Abrir agenda e notificações';b.onclick=openAgenda;
 const now=new Date(),nm=now.getHours()*60+now.getMinutes();let best=null;
 document.querySelectorAll('#crAgendaRows .cr-agenda-row,#crAgendaRows>article,#crAgendaRows>div:not(.cr-agenda-skeleton)').forEach(row=>{
  const m=(row.textContent||'').match(/(?:^|\s)([01]?\d|2[0-3]):([0-5]\d)(?:\s|$)/);if(!m)return;
  const diff=(Number(m[1])*60+Number(m[2]))-nm;if(diff>=0&&(best==null||diff<best))best=diff;
 });
 const badge=b.querySelector('.cr-notify-badge');
 if(best!=null&&best<=60){badge.hidden=false;b.title=best===0?'Compromisso agora':'Próximo compromisso em '+best+' min';b.setAttribute('aria-label',b.title)}
 else if(badge)badge.hidden=true;
}
function agenda(){
 document.querySelectorAll('#crAgendaRows .cr-agenda-row').forEach(row=>{
  const main=row.querySelector('.cr-agenda-main')||row,strong=main.querySelector('strong');
  const source=[strong?.textContent||'',main.textContent||'',row.getAttribute('data-cr-team')||'',row.getAttribute('aria-label')||''].join(' ');
  const ps=picks(source);let box=row.querySelector('.cr-agenda-team-avatars');
  if(!ps.length){
   const genericText=norm(source);
   if(/prestador|terceiro|tecnico|equipe/.test(genericText)){
    if(!box){box=document.createElement('div');box.className='cr-agenda-team-avatars'}
    box.innerHTML='<span class="cr-generic-person" title="Prestador sem foto cadastrada">👤</span>';
    if(strong&&strong.parentElement===main)main.insertBefore(box,strong);else main.prepend(box);
   } else if(box)box.remove();
   return;
  }
  const sig=ps.map(p=>p.name).join('|');if(!box){box=document.createElement('div');box.className='cr-agenda-team-avatars'}
  if(box.dataset.sig!==sig){box.dataset.sig=sig;box.setAttribute('aria-label','Equipe responsável: '+ps.map(p=>p.name).join(', '));box.innerHTML=ps.map(p=>img(p)).join('')}
  if(!box.isConnected){if(strong&&strong.parentElement===main)main.insertBefore(box,strong);else main.prepend(box)}
 });notification();
}
function pendingCards(){
 const host=document.getElementById('boardSummary');if(!host)return;
 host.querySelectorAll('.cr-pending-card,button,article').forEach(card=>{
  const t=norm(card.textContent||'');let key=null;
  if(/\beder\b/.test(t))key='eder';else if(/\bwizy\b/.test(t))key='eder';else if(/\bapp\b/.test(t))key='rogerio';
  const old=card.querySelector('.cr-pending-owner-avatar');if(!key){if(old)old.remove();return}
  const p=PEOPLE[key];if(!p)return;
  if(old){if(old.src!==p.face)old.src=p.face;return}
  const im=document.createElement('img');im.className='cr-pending-owner-avatar';im.src=p.face;im.alt=p.name;im.title=p.name+' • '+p.role;
  const icon=card.querySelector('.cr-pending-icon');if(icon&&icon.parentElement===card)card.insertBefore(im,icon.nextSibling);else card.prepend(im);
 });
}
function ownerHtml(keys){
 const ps=keys.map(k=>PEOPLE[k]).filter(Boolean);if(!ps.length)return '';
 return '<div class="cr-human-photos">'+ps.map(p=>img(p)).join('')+'</div><div><b>'+ps.map(p=>esc(p.name)).join(' • ')+'</b><small>'+ps.map(p=>esc(p.role)).join(' | ')+'</small></div>';
}
function owner(id){
 const page=document.getElementById(id),keys=OWNER[id]||[];if(!page)return;
 const old=page.querySelector(':scope > .cr-human-owner');if(!keys.length){if(old)old.remove();return}
 const h=page.querySelector(':scope > h1')||page.querySelector('h1');if(!h)return;
 let d=old;if(!d){d=document.createElement('div');d.className='cr-human-owner';d.dataset.ownerFor=id;h.insertAdjacentElement('afterend',d)}
 d.innerHTML=ownerHtml(keys);
}
function removeDashboardRoster(){
 document.querySelectorAll('[data-cr-dashboard-team],.cr-dashboard-team').forEach(x=>x.remove());
}
function rosterCard(host,attr){
 if(!host)return;
 let old=host.querySelector('['+attr+']');if(old)return;
 const team=Object.values(PEOPLE);
 const html='<div class="cr-team-title">EQUIPE CONSTRU-REI</div><div class="cr-team-roster" '+attr+'="v9">'+team.map(p=>'<div class="cr-team-person">'+img(p)+'<div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div></div>').join('')+'</div>';
 const a=host.querySelector('.actions');if(a)a.insertAdjacentHTML('beforebegin',html);else host.insertAdjacentHTML('beforeend',html);
}
function roster(){rosterCard(document.getElementById('meetCard'),'data-cr-team-roster');rosterCard(document.getElementById('presentationCard'),'data-cr-presentation-team')}
function nav(){
 document.querySelectorAll('.nav[data-page]').forEach(el=>{
  const id=el.getAttribute('data-page'),keys=OWNER[id]||[],old=el.querySelector('.cr-human-nav-avatar');
  if(keys.length!==1){if(old)old.remove();return}
  if(old)return;const p=PEOPLE[keys[0]];if(!p)return;
  const im=document.createElement('img');im.className='cr-human-nav-avatar';im.src=p.face;im.alt=p.name;im.title=p.name+' • '+p.role;el.insertBefore(im,el.firstChild);
 });
}
function academy(){
 const host=document.getElementById('academy');if(!host)return;
 host.querySelectorAll('.crAcademyTrack').forEach(card=>{
  const b=card.querySelector('b');if(!b)return;const keys=TRACK_OWNER[b.textContent.trim()]||[];
  let box=card.querySelector('.cr-academy-owners');if(!keys.length){if(box)box.remove();return}
  if(!box){box=document.createElement('div');box.className='cr-academy-owners';card.appendChild(box)}
  box.innerHTML=keys.map(k=>PEOPLE[k]).filter(Boolean).map(p=>img(p)).join('');
 });
}
function quickAccess(){
 const panel=document.querySelector('#dashboard .cr-operation-panel .cr-panel-head');if(!panel)return;
 let box=document.getElementById('crBizQuick');
 if(!box){box=document.createElement('div');box.id='crBizQuick';box.className='cr-biz-quick';panel.appendChild(box)}
 const sig='v12-direct-stable-20261006';
 if(box.dataset.sig===sig)return;
 box.dataset.sig=sig;
 box.innerHTML=
  '<a href="'+LINKS.cora+'" target="_top" rel="noopener noreferrer" class="cr-biz-btn cora" title="Abrir Cora"><span class="cr-biz-logo"><img src="https://comunidade.cora.com.br/wp-content/uploads/2022/08/cora-logo.svg" alt="Cora"></span><small>Cora</small></a>'+
  '<a href="'+LINKS.trello+'" target="_top" rel="noopener noreferrer" class="cr-biz-btn trello" title="Abrir Trello • Gestão de Obras 2026"><span class="cr-biz-logo"><img src="https://trello.com/favicon.ico" alt="Trello"></span><small>Trello</small></a>'+
  '<a href="'+LINKS.gestaoclick+'" target="_top" rel="noopener noreferrer" class="cr-biz-btn gc" title="Abrir GestãoClick"><span class="cr-biz-logo"><img src="https://www.google.com/s2/favicons?domain=gestaoclick.com.br&sz=64" alt="GestãoClick"></span><small>GestãoClick</small></a>';
}
function topNav(){
 const menu=document.querySelector('.top .menu');if(menu)menu.classList.add('cr-menu-responsive-only');
 const back=document.getElementById('crTopBack');
 if(!back)return;
 back.title='Voltar ao módulo anterior / Gestor do Projeto';back.setAttribute('aria-label','Voltar');
 back.onclick=function(){
  try{
   const p=new URLSearchParams(location.search),origin=String(p.get('origin')||'').toLowerCase();
   const ref=String(document.referrer||'').toLowerCase();
   if(origin.includes('gestor')||ref.includes('/gestor-projeto/')){
    location.assign('https://rogeriocibin-alt.github.io/construrei-oauth-pages/gestor-projeto/');return;
   }
   if(typeof window.crCanonicalBack==='function'){window.crCanonicalBack();return}
   if(history.length>1){history.back();return}
   if(typeof window.go==='function')window.go('dashboard');
  }catch(_){if(typeof window.go==='function')window.go('dashboard')}
 };
}
function prune(){
 document.querySelectorAll('.grp').forEach(g=>{if(!g.querySelector('.nav'))g.remove()});
}
function mount(){
 prune();appBrand();removeDashboardRoster();topNav();notification();agenda();quickAccess();pendingCards();
 Object.keys(OWNER).forEach(owner);roster();nav();academy();
}
function loadRegistry(){
 fetch(REG,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
  if(d.people)PEOPLE=d.people;
  if(d.page_contexts){
   OWNER={...OWNER,
    app:d.page_contexts.app||OWNER.app,pendapp:d.page_contexts.pendapp||OWNER.pendapp,
    checklist:d.page_contexts.checklist||OWNER.checklist,wizy:d.page_contexts.wizy||OWNER.wizy,
    eder:d.page_contexts.eder||OWNER.eder,technical:d.page_contexts.technical||OWNER.technical,
    admin:d.page_contexts.admin||OWNER.admin,meeting:d.page_contexts.meeting||OWNER.meeting,
    presentation:d.page_contexts.presentation||OWNER.presentation};
  }
  mount();
 }).catch(()=>mount());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();loadRegistry();setTimeout(mount,250);setTimeout(mount,900)},{once:true});
else{mount();loadRegistry();setTimeout(mount,250);setTimeout(mount,900)}
document.addEventListener('click',e=>{if(e.target.closest('[data-page],[data-page-target],#crTopBack,#crBackBtn,#crHomeBtn'))setTimeout(mount,50)},true);
const ah=document.getElementById('crAgendaRows');if(ah){let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(agenda,35)}).observe(ah,{childList:true,subtree:true})}
new MutationObserver(()=>{setTimeout(mount,30)}).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('focus',()=>setTimeout(mount,50));
})();