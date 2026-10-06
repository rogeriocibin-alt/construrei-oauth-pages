(()=>{'use strict';
if(window.__CR_TEAM_IDENTITY_V1)return;window.__CR_TEAM_IDENTITY_V1=true;
const BASE='../../assets/team/';
const PEOPLE={
 rogerio:{name:'Rogério',role:'Diretor',card:BASE+'rogerio.webp',face:BASE+'rogerio-face.webp',aliases:['rogerio','rogério']},
 eder:{name:'Éder',role:'Admin Técnico',card:BASE+'eder.webp',face:BASE+'eder-face.webp',aliases:['eder','éder']},
 gabrielly:{name:'Gabrielly',role:'Atendimento',card:BASE+'gabrielly.webp',face:BASE+'gabrielly-face.webp',aliases:['gabrielly','gabi','gabriela']},
 fabricio:{name:'Fabrício',role:'Execução',card:BASE+'fabricio.webp',face:BASE+'fabricio-face.webp',aliases:['fabricio','fabrício']}
};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function picks(text){
 const n=norm(text); if(/toda.*equipe|equipe inteira|todos/.test(n))return Object.values(PEOPLE);
 const out=[];Object.values(PEOPLE).forEach(p=>{if(p.aliases.some(a=>n.includes(norm(a))))out.push(p)});
 return out;
}
function mountProfile(){
 const wrap=document.querySelector('.cr-profile .cr-avatar');const img=wrap&&wrap.querySelector('img');if(!wrap||!img)return;
 if(!wrap.classList.contains('cr-human-profile')){wrap.classList.add('cr-human-profile');img.src=PEOPLE.rogerio.face;img.alt='Rogério • Diretor CONSTRU-REI';}
}
function rosterHtml(){return '<div class="cr-team-roster" data-cr-team-roster="1">'+Object.values(PEOPLE).map(p=>'<div class="cr-team-person"><img src="'+esc(p.card)+'" alt="'+esc(p.name)+' • CONSTRU-REI" loading="lazy"><div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div></div>').join('')+'</div>'}
function mountMeeting(){
 const h=document.querySelector('#meetCard');if(!h||h.querySelector('[data-cr-team-roster]'))return;
 const anchor=h.querySelector('.actions');if(anchor)anchor.insertAdjacentHTML('beforebegin',rosterHtml());else h.insertAdjacentHTML('beforeend',rosterHtml());
}
function mountAgenda(){
 document.querySelectorAll('#crAgendaRows .cr-agenda-row').forEach(row=>{
  const main=row.querySelector('.cr-agenda-main'),strong=main&&main.querySelector('strong');if(!main||!strong||main.querySelector('.cr-agenda-team-avatars'))return;
  const people=picks(strong.textContent);if(!people.length)return;
  const box=document.createElement('div');box.className='cr-agenda-team-avatars';box.setAttribute('aria-label','Equipe responsável');
  box.innerHTML=people.map(p=>'<img src="'+esc(p.face)+'" alt="'+esc(p.name)+'" title="'+esc(p.name)+'" loading="lazy">').join('');
  strong.insertAdjacentElement('beforebegin',box);
 });
}
function badge(id,p){
 const page=document.getElementById(id);if(!page||page.querySelector('.cr-page-human'))return;
 const h=page.querySelector('h1');if(!h)return;const d=document.createElement('div');d.className='cr-page-human';
 d.innerHTML='<img src="'+esc(p.face)+'" alt="'+esc(p.name)+'"><div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div>';
 h.insertAdjacentElement('afterend',d);
}
function mount(){mountProfile();mountMeeting();mountAgenda();badge('eder',PEOPLE.eder);badge('technical',PEOPLE.eder);badge('admin',PEOPLE.rogerio)}
let scheduled=false;const run=()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;mount()},40)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
setInterval(mount,3000);
})();