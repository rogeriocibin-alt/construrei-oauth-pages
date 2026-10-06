(()=>{'use strict';
if(window.__CR_HUMAN_IDENTITY_V5)return;window.__CR_HUMAN_IDENTITY_V5=true;

const BASE='../../assets/team/';
const PEOPLE={
 rogerio:{name:'Rogério',role:'Diretor',face:BASE+'rogerio-face.webp?v=5',aliases:['rogerio','rogério']},
 eder:{name:'Éder',role:'Admin Técnico',face:BASE+'eder-face.webp?v=5',aliases:['eder','éder']},
 gabrielly:{name:'Gabrielly',role:'Atendimento',face:BASE+'gabrielly-face.webp?v=5',aliases:['gabrielly','gabi','gabriela']},
 fabricio:{name:'Fabrício',role:'Execução',face:BASE+'fabricio-face.webp?v=5',aliases:['fabricio','fabrício']}
};

const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

function picks(text){
 const n=norm(text);
 if(/toda.*equipe|equipe inteira|todos|toda a equipe/.test(n))return Object.values(PEOPLE);
 const out=[];
 Object.values(PEOPLE).forEach(p=>{if(p.aliases.some(a=>n.includes(norm(a))))out.push(p)});
 return out;
}

function mountProfile(){
 const wrap=document.querySelector('.cr-profile .cr-avatar');
 const img=wrap&&wrap.querySelector('img');
 if(!wrap||!img)return;
 wrap.classList.add('cr-human-profile');
 if(!img.src.includes('rogerio-face.webp'))img.src=PEOPLE.rogerio.face;
 img.alt='Rogério • Diretor CONSTRU-REI';
 const profile=wrap.closest('.cr-profile');
 if(profile){
   profile.setAttribute('aria-label','Rogério • Diretor');
   profile.style.setProperty('display','flex','important');
   profile.style.setProperty('visibility','visible','important');
 }
}

function mountAgenda(){
 document.querySelectorAll('#crAgendaRows .cr-agenda-row').forEach(row=>{
   const main=row.querySelector('.cr-agenda-main');
   const strong=main&&main.querySelector('strong');
   if(!main||!strong)return;

   const people=picks(strong.textContent);
   let box=main.querySelector('.cr-agenda-team-avatars');

   if(!people.length){
     if(box)box.remove();
     return;
   }

   const sig=people.map(p=>p.name).join('|');
   if(!box){
     box=document.createElement('div');
     box.className='cr-agenda-team-avatars';
     box.setAttribute('aria-label','Equipe responsável');
     strong.insertAdjacentElement('beforebegin',box);
   }
   if(box.dataset.sig===sig)return;

   box.dataset.sig=sig;
   box.innerHTML=people.map(p=>'<img src="'+esc(p.face)+'" alt="'+esc(p.name)+'" title="'+esc(p.name)+'" loading="eager">').join('');
 });
}

function badge(id,p){
 const page=document.getElementById(id);
 if(!page)return;
 const h=page.querySelector(':scope > h1')||page.querySelector('h1');
 if(!h)return;
 let d=page.querySelector(':scope > .cr-page-human');
 if(!d){
   d=document.createElement('div');
   d.className='cr-page-human';
   h.insertAdjacentElement('afterend',d);
 }
 d.innerHTML='<img src="'+esc(p.face)+'" alt="'+esc(p.name)+'"><div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div>';
}

function mountPages(){
 badge('eder',PEOPLE.eder);
 badge('technical',PEOPLE.eder);
 badge('admin',PEOPLE.rogerio);
}

function mountAll(){mountProfile();mountAgenda();mountPages()}

if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',()=>{mountAll();setTimeout(mountAll,250);setTimeout(mountAll,900)},{once:true});
}else{
 mountAll();setTimeout(mountAll,250);setTimeout(mountAll,900);
}

document.addEventListener('click',e=>{
 if(e.target.closest('[data-page],[data-page-target],#crTopHome,#crBackBtn,#crHomeBtn,#crTopBack'))setTimeout(mountPages,20);
},true);

const agendaHost=document.getElementById('crAgendaRows');
if(agendaHost){
 let timer=null;
 new MutationObserver(()=>{
   clearTimeout(timer);
   timer=setTimeout(mountAgenda,25);
 }).observe(agendaHost,{childList:true,subtree:true});
}

window.addEventListener('focus',()=>setTimeout(mountAll,40));
})();