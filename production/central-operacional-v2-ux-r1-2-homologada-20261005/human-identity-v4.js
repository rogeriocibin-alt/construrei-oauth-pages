(()=>{'use strict';
if(window.__CR_HUMAN_IDENTITY_V4)return;window.__CR_HUMAN_IDENTITY_V4=true;
const ROOT='../../assets/team/';
const P={
 rogerio:{name:'Rogério',role:'Diretor • visão, decisão e governança',face:ROOT+'rogerio-face.webp?v=4'},
 eder:{name:'Éder',role:'Admin Técnico • operação técnica e controle',face:ROOT+'eder-face.webp?v=4'},
 gabrielly:{name:'Gabrielly',role:'Atendimento • triagem e comunicação',face:ROOT+'gabrielly-face.webp?v=4'},
 fabricio:{name:'Fabrício',role:'Execução • campo, qualidade e entrega',face:ROOT+'fabricio-face.webp?v=4'}
};
const OWNER={app:['gabrielly'],pendapp:['gabrielly'],checklist:['fabricio'],sst:['fabricio'],wizy:['eder'],eder:['eder'],technical:['eder'],admin:['rogerio'],docs:['rogerio','eder'],academy:['eder','gabrielly'],os:['eder','fabricio']};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function detect(s){
 const n=norm(s),out=[];
 if(/\brogerio\b/.test(n))out.push(P.rogerio);
 if(/\beder\b/.test(n))out.push(P.eder);
 if(/\bgabrielly\b|\bgabi\b/.test(n))out.push(P.gabrielly);
 if(/\bfabricio\b/.test(n))out.push(P.fabricio);
 return out;
}
function profile(){
 const wrap=document.querySelector('.cr-profile.cr-profile-static .cr-avatar')||document.querySelector('.cr-profile .cr-avatar');
 const img=wrap&&wrap.querySelector('img');if(!wrap||!img)return;
 wrap.classList.add('cr-human-profile');
 img.src=P.rogerio.face;img.alt='Rogério • Diretor CONSTRU-REI';
 const pr=wrap.closest('.cr-profile');if(pr){pr.setAttribute('aria-label','Rogério • Diretor');pr.style.setProperty('display','flex','important');pr.style.setProperty('visibility','visible','important')}
}
function agenda(){
 document.querySelectorAll('#crAgendaRows .cr-agenda-row').forEach(row=>{
   const main=row.querySelector('.cr-agenda-main');if(!main)return;
   const strong=main.querySelector('strong');
   const people=detect((strong?.textContent||'')+' '+(main.textContent||''));
   let box=main.querySelector('.cr-agenda-team-avatars');
   if(!people.length){if(box)box.remove();return}
   const sig=people.map(x=>x.name).join('|');
   if(!box){box=document.createElement('div');box.className='cr-agenda-team-avatars';main.insertBefore(box,strong||main.firstChild)}
   if(box.dataset.sig===sig)return;
   box.dataset.sig=sig;
   box.setAttribute('aria-label','Equipe responsável: '+people.map(x=>x.name).join(', '));
   box.innerHTML=people.map(x=>'<img src="'+x.face+'" alt="'+esc(x.name)+'" title="'+esc(x.name)+'" loading="eager">').join('');
 });
}
function owner(id){
 const page=document.getElementById(id),keys=OWNER[id];if(!page||!keys)return;
 const h=page.querySelector(':scope > h1');if(!h)return;
 let d=page.querySelector(':scope > .cr-human-owner');
 if(!d){d=document.createElement('div');d.className='cr-human-owner';h.insertAdjacentElement('afterend',d)}
 const ps=keys.map(k=>P[k]);
 const sig=keys.join('|');if(d.dataset.sig===sig)return;d.dataset.sig=sig;
 d.innerHTML='<div class="cr-human-photos">'+ps.map(x=>'<img src="'+x.face+'" alt="'+esc(x.name)+'">').join('')+'</div><div><b>'+ps.map(x=>esc(x.name)).join(' • ')+'</b><small>'+ps.map(x=>esc(x.role)).join(' | ')+'</small></div>';
}
function mountStatic(){profile();Object.keys(OWNER).forEach(owner)}
function mountAll(){mountStatic();agenda()}
function onNav(){setTimeout(mountStatic,0);setTimeout(agenda,80)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mountAll();setTimeout(mountAll,250);setTimeout(mountAll,900)},{once:true});else{mountAll();setTimeout(mountAll,250);setTimeout(mountAll,900)}
document.addEventListener('click',e=>{if(e.target.closest('[data-page],[data-page-target],#crTopHome,#crBackBtn,#crHomeBtn'))onNav()},true);
const host=document.getElementById('crAgendaRows');
if(host)new MutationObserver(()=>{clearTimeout(window.__crHumanAgendaTimer);window.__crHumanAgendaTimer=setTimeout(agenda,25)}).observe(host,{childList:true,subtree:true});
window.addEventListener('focus',()=>setTimeout(mountAll,40));
})();