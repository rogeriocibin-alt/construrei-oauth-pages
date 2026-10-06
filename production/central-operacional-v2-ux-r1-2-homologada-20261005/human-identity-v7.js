(()=>{'use strict';
if(window.__CR_HUMAN_IDENTITY_V7)return;window.__CR_HUMAN_IDENTITY_V7=true;
const ROOT='https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/';
const REG=ROOT+'team-registry.json?v=20261006-context-v2';
const LOGO='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/construrei-logo';
let PEOPLE={
 rogerio:{name:'Rogério',role:'Diretor • visão, decisão e governança',face:ROOT+'rogerio-face.webp?v=7'},
 eder:{name:'Éder',role:'Admin Técnico • operação técnica e controle',face:ROOT+'eder-face.webp?v=7'},
 gabrielly:{name:'Gabrielly',role:'Atendimento • triagem e comunicação',face:ROOT+'gabrielly-face.webp?v=7'},
 fabricio:{name:'Fabrício',role:'Execução • campo, qualidade e entrega',face:ROOT+'fabricio-face.webp?v=7'}
};
let OWNER={app:['gabrielly'],pendapp:['rogerio'],checklist:['fabricio'],sst:[],wizy:['eder'],eder:['eder'],technical:['eder'],admin:['rogerio'],docs:[],academy:['rogerio','eder','gabrielly','fabricio'],os:[],meeting:['rogerio','eder','gabrielly','fabricio'],presentation:['rogerio','eder','gabrielly','fabricio']};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function picks(text){const n=norm(text);if(/toda.*equipe|equipe inteira/.test(n))return Object.values(PEOPLE);return Object.values(PEOPLE).filter(p=>n.includes(norm(p.name))||(p.name==='Gabrielly'&&/\bgabi\b/.test(n)))}
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
 document.querySelectorAll('#crAgendaRows .cr-agenda-row').forEach(row=>{
  const m=(row.textContent||'').match(/(?:^|\s)([01]?\d|2[0-3]):([0-5]\d)(?:\s|$)/);if(!m)return;
  const diff=(Number(m[1])*60+Number(m[2]))-nm;if(diff>=0&&(best==null||diff<best))best=diff;
 });
 const badge=b.querySelector('.cr-notify-badge');
 if(best!=null&&best<=60){badge.hidden=false;b.title=best===0?'Compromisso agora':'Próximo compromisso em '+best+' min';b.setAttribute('aria-label',b.title)}else if(badge)badge.hidden=true;
}
function agenda(){
 document.querySelectorAll('#crAgendaRows .cr-agenda-row').forEach(row=>{
  const main=row.querySelector('.cr-agenda-main')||row,strong=main.querySelector('strong');
  const source=[strong?.textContent||'',main.textContent||'',row.getAttribute('data-cr-team')||'',row.getAttribute('aria-label')||''].join(' ');
  const ps=picks(source);let box=row.querySelector('.cr-agenda-team-avatars');
  if(!ps.length){if(box)box.remove();return}
  const sig=ps.map(p=>p.name).join('|');if(!box){box=document.createElement('div');box.className='cr-agenda-team-avatars'}
  if(box.dataset.sig===sig)return;box.dataset.sig=sig;box.setAttribute('aria-label','Equipe responsável: '+ps.map(p=>p.name).join(', '));
  box.innerHTML=ps.map(p=>'<img src="'+esc(p.face)+'" alt="'+esc(p.name)+'" title="'+esc(p.name)+'" loading="eager">').join('');
  if(strong&&strong.parentElement===main)main.insertBefore(box,strong);else if(main.firstChild)main.insertBefore(box,main.firstChild);else main.appendChild(box);
 });notification();
}
function ownerHtml(keys){const ps=keys.map(k=>PEOPLE[k]).filter(Boolean);return '<div class="cr-human-photos">'+ps.map(p=>'<img src="'+esc(p.face)+'" alt="'+esc(p.name)+'">').join('')+'</div><div><b>'+ps.map(p=>esc(p.name)).join(' • ')+'</b><small>'+ps.map(p=>esc(p.role)).join(' | ')+'</small></div>'}
function owner(id){
 const page=document.getElementById(id),keys=OWNER[id]||[];if(!page)return;
 const old=page.querySelector(':scope > .cr-human-owner');if(!keys.length){if(old)old.remove();return}
 const h=page.querySelector(':scope > h1')||page.querySelector('h1');if(!h)return;
 let d=old;if(!d){d=document.createElement('div');d.className='cr-human-owner';d.dataset.ownerFor=id;h.insertAdjacentElement('afterend',d)}d.innerHTML=ownerHtml(keys);
}
function roster(){const c=document.getElementById('meetCard');if(!c||c.querySelector('[data-cr-team-roster]'))return;const team=Object.values(PEOPLE);const html='<div class="cr-team-title">EQUIPE CONSTRU-REI</div><div class="cr-team-roster" data-cr-team-roster="v7">'+team.map(p=>'<div class="cr-team-person"><img src="'+esc(p.face)+'" alt="'+esc(p.name)+'"><div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div></div>').join('')+'</div>';const a=c.querySelector('.actions');if(a)a.insertAdjacentHTML('beforebegin',html);else c.insertAdjacentHTML('beforeend',html)}
function nav(){document.querySelectorAll('.nav[data-page]').forEach(el=>{const id=el.getAttribute('data-page'),keys=OWNER[id]||[];const old=el.querySelector('.cr-human-nav-avatar');if(keys.length!==1){if(old)old.remove();return}if(old)return;const p=PEOPLE[keys[0]];if(!p)return;const img=document.createElement('img');img.className='cr-human-nav-avatar';img.src=p.face;img.alt=p.name;img.title=p.name+' • '+p.role;el.insertBefore(img,el.firstChild)})}
function prune(){
 document.querySelectorAll('.nav[data-page="docs"],.nav[data-page="technical"],.nav[data-page="admin"]').forEach(x=>x.remove());
 document.querySelectorAll('[data-page-target="os"],[data-page-target="docs"]').forEach(x=>x.remove());
 document.querySelectorAll('.grp').forEach(g=>{if(!g.querySelector('.nav'))g.remove()});
}
function mount(){prune();appBrand();notification();agenda();Object.keys(OWNER).forEach(owner);roster();nav()}
function loadRegistry(){fetch(REG,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(d.people)PEOPLE=d.people;if(d.page_contexts)OWNER=d.page_contexts;mount()}).catch(()=>mount())}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mount();loadRegistry();setTimeout(mount,250);setTimeout(mount,900)},{once:true});else{mount();loadRegistry();setTimeout(mount,250);setTimeout(mount,900)}
document.addEventListener('click',e=>{if(e.target.closest('[data-page],[data-page-target],#crTopBack,#crBackBtn,#crHomeBtn'))setTimeout(mount,40)},true);
const ah=document.getElementById('crAgendaRows');if(ah){let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(agenda,35)}).observe(ah,{childList:true,subtree:true})}
window.addEventListener('focus',()=>setTimeout(mount,50));
})();