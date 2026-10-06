(()=>{'use strict';
if(window.__CR_HUMAN_IDENTITY_V3)return;window.__CR_HUMAN_IDENTITY_V3=true;
const ROOT='https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/';
const PEOPLE={
 rogerio:{name:'Rogério',role:'Diretor • visão, decisão e governança',face:ROOT+'rogerio-face.webp'},
 eder:{name:'Éder',role:'Admin Técnico • operação técnica e controle',face:ROOT+'eder-face.webp'},
 gabrielly:{name:'Gabrielly',role:'Atendimento • triagem e comunicação',face:ROOT+'gabrielly-face.webp'},
 fabricio:{name:'Fabrício',role:'Execução • campo, qualidade e entrega',face:ROOT+'fabricio-face.webp'}
};
const PAGE_OWNERS={
 app:['gabrielly'],pendapp:['gabrielly'],checklist:['fabricio'],sst:['fabricio'],
 wizy:['eder'],eder:['eder'],technical:['eder'],admin:['rogerio'],
 docs:['rogerio','eder'],academy:['eder','gabrielly'],os:['eder','fabricio']
};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function detect(text){
 const n=norm(text),out=[];
 Object.entries(PEOPLE).forEach(([k,p])=>{
   const hit=n.includes(norm(p.name))||(k==='gabrielly'&&/\bgabi\b/.test(n))||(k==='fabricio'&&/\bfabricio\b/.test(n))||(k==='eder'&&/\beder\b/.test(n));
   if(hit)out.push(p);
 });
 return out;
}
function roster(){
 return '<div class="cr-team-title">EQUIPE CONSTRU-REI</div><div class="cr-team-roster" data-cr-team-roster="v3">'+Object.values(PEOPLE).map(p=>'<div class="cr-team-person"><img src="'+p.face+'" alt="'+esc(p.name)+'" loading="lazy"><div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div></div>').join('')+'</div>';
}
function ensureProfile(){
 const w=document.querySelector('.cr-profile.cr-profile-static .cr-avatar')||document.querySelector('.cr-profile .cr-avatar');
 const img=w&&w.querySelector('img');if(!w||!img)return;
 w.classList.add('cr-human-profile');
 if(!/rogerio-face\.webp(?:\?|$)/.test(img.src)){img.src=PEOPLE.rogerio.face+'?v=3';img.alt='Rogério • Diretor CONSTRU-REI';}
 const profile=w.closest('.cr-profile');if(profile){profile.setAttribute('aria-label','Rogério • Diretor');profile.style.display='flex';}
}
function ensureAgenda(){
 document.querySelectorAll('#crAgendaRows .cr-agenda-row').forEach(r=>{
   const main=r.querySelector('.cr-agenda-main');if(!main)return;
   const strong=main.querySelector('strong');
   let box=main.querySelector('.cr-agenda-team-avatars');
   const ps=detect((strong?strong.textContent+' ':'')+r.textContent);
   if(!ps.length){if(box)box.remove();return;}
   const sig=ps.map(p=>p.name).join('|');
   if(box&&box.dataset.sig===sig)return;
   if(!box){box=document.createElement('div');box.className='cr-agenda-team-avatars';(strong||main.firstChild)?main.insertBefore(box,strong||main.firstChild):main.appendChild(box);}
   box.dataset.sig=sig;
   box.innerHTML=ps.map(p=>'<img src="'+p.face+'?v=3" alt="'+esc(p.name)+'" title="'+esc(p.name)+'" loading="lazy">').join('');
 });
}
function ownerHtml(keys){
 const ps=keys.map(k=>PEOPLE[k]).filter(Boolean);if(!ps.length)return'';
 return '<div class="cr-human-photos">'+ps.map(p=>'<img src="'+p.face+'?v=3" alt="'+esc(p.name)+'" loading="lazy">').join('')+'</div><div><b>'+ps.map(p=>esc(p.name)).join(' • ')+'</b><small>'+ps.map(p=>esc(p.role)).join(' | ')+'</small></div>';
}
function ensureOwner(pageId){
 const keys=PAGE_OWNERS[pageId],page=document.getElementById(pageId);if(!keys||!page)return;
 let d=page.querySelector(':scope > .cr-human-owner');const h=page.querySelector(':scope > h1');
 if(!h)return;if(!d){d=document.createElement('div');d.className='cr-human-owner';d.dataset.ownerFor=pageId;h.insertAdjacentElement('afterend',d);}
 d.innerHTML=ownerHtml(keys);
}
function ensureMeeting(){
 const c=document.getElementById('meetCard');if(!c)return;
 if(!c.querySelector('[data-cr-team-roster]')){const a=c.querySelector('.actions');if(a)a.insertAdjacentHTML('beforebegin',roster());else c.insertAdjacentHTML('beforeend',roster());}
}
function ensureAuthNav(){
 const gt=[...document.querySelectorAll('.grp .gt')].find(x=>norm(x.textContent)==='acesso tecnico');
 const grp=gt&&gt.closest('.grp');if(!grp)return;
 if(!grp.querySelector('[data-page="technical"]'))grp.insertAdjacentHTML('beforeend','<button class="nav cr-human-access-nav" data-page="technical"><i></i>Éder — Admin Técnico</button>');
 if(!grp.querySelector('[data-page="admin"]'))grp.insertAdjacentHTML('beforeend','<button class="nav cr-human-access-nav" data-page="admin"><i></i>Rogério — Diretor</button>');
}
function ensureSentinel(){if(!document.getElementById('crHumanIdentitySentinel')){const d=document.createElement('i');d.id='crHumanIdentitySentinel';d.title='Identidade humana ativa';document.body.appendChild(d);}}
function localGo(id){
 document.querySelectorAll('.page').forEach(x=>x.classList.toggle('on',x.id===id));
 document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('on',x.getAttribute('data-page')===id));
 const n=document.querySelector('.nav[data-page="'+id+'"]'),c=document.getElementById('crumb');if(c)c.textContent=n?n.textContent.trim():id;
 const s=document.getElementById('side');if(s)s.classList.remove('open');window.scrollTo(0,0);
 setTimeout(mount,20);
}
function interceptAuth(e){
 const el=e.target.closest('[data-page="technical"],[data-page="admin"]');if(!el)return;
 const id=el.getAttribute('data-page');if(!document.getElementById(id))return;
 e.preventDefault();e.stopImmediatePropagation();localGo(id);
}
function mount(){
 document.querySelectorAll('.cr-page-human').forEach(x=>x.remove());
 ensureProfile();ensureAgenda();ensureMeeting();ensureAuthNav();ensureSentinel();
 Object.keys(PAGE_OWNERS).forEach(ensureOwner);
}
document.addEventListener('click',interceptAuth,true);
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;mount();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
['hashchange','popstate','focus'].forEach(ev=>addEventListener(ev,schedule));
setInterval(mount,1800);
})();