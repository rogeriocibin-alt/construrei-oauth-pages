(()=>{'use strict';
if(window.__CR_TEAM_IDENTITY_V2)return;window.__CR_TEAM_IDENTITY_V2=true;
const ROOT='https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/';
const PRESENT='./presentation/';
const PEOPLE={
 rogerio:{name:'Rogério',role:'Diretor • visão, decisão e governança',face:ROOT+'rogerio-face.webp'},
 eder:{name:'Éder',role:'Admin Técnico • operação técnica e controle',face:ROOT+'eder-face.webp'},
 gabrielly:{name:'Gabrielly',role:'Atendimento • triagem e comunicação',face:ROOT+'gabrielly-face.webp'},
 fabricio:{name:'Fabrício',role:'Execução • campo e entrega',face:ROOT+'fabricio-face.webp'}
};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function detect(text){const n=norm(text),out=[];Object.values(PEOPLE).forEach(p=>{if(n.includes(norm(p.name))||(p.name==='Gabrielly'&&/\bgabi\b/.test(n)))out.push(p)});return out}
function roster(){return '<div class="cr-team-title">EQUIPE CONSTRU-REI</div><div class="cr-team-roster" data-cr-team-roster="1">'+Object.values(PEOPLE).map(p=>'<div class="cr-team-person"><img src="'+p.face+'" alt="'+esc(p.name)+'" loading="lazy"><div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div></div>').join('')+'</div>'}
function profile(){const w=document.querySelector('.cr-profile .cr-avatar'),img=w&&w.querySelector('img');if(!w||!img)return;w.classList.add('cr-human-profile');if(!/rogerio-face/.test(img.src)){img.src=PEOPLE.rogerio.face;img.alt='Rogério • Diretor CONSTRU-REI'}}
function meeting(){
 const c=document.getElementById('meetCard');if(!c)return;
 if(!c.querySelector('[data-cr-team-roster]')){const a=c.querySelector('.actions');if(a)a.insertAdjacentHTML('beforebegin',roster());else c.insertAdjacentHTML('beforeend',roster())}
}
function agenda(){document.querySelectorAll('#crAgendaRows .cr-agenda-row').forEach(r=>{const m=r.querySelector('.cr-agenda-main'),s=m&&m.querySelector('strong');if(!m||!s||m.querySelector('.cr-agenda-team-avatars'))return;const ps=detect(s.textContent);if(!ps.length)return;const d=document.createElement('div');d.className='cr-agenda-team-avatars';d.innerHTML=ps.map(p=>'<img src="'+p.face+'" alt="'+esc(p.name)+'" title="'+esc(p.name)+'" loading="lazy">').join('');s.insertAdjacentElement('beforebegin',d)})}
function badge(id,p){const page=document.getElementById(id);if(!page||page.querySelector('.cr-page-human'))return;const h=page.querySelector('h1');if(!h)return;const d=document.createElement('div');d.className='cr-page-human';d.innerHTML='<img src="'+p.face+'" alt="'+esc(p.name)+'"><div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div>';h.insertAdjacentElement('afterend',d)}
function presentation(){
 const card=document.getElementById('presentationCard');
 if(card&&!card.dataset.teamV2){card.innerHTML='<div class="tag">APRESENTAÇÃO EXECUTIVA VIVA</div><h2>CONSTRU-REI • Estratégia, operação e equipe</h2><p class="mut">Apresentação viva com a equipe humana integrada ao contexto institucional.</p><div class="actions"><button class="btn primary" id="crTeamOpenPresentation">Abrir aqui</button><button class="btn" id="crTeamCopyPresentation">Copiar link</button></div>';card.dataset.teamV2='1'}
 const o=document.getElementById('crTeamOpenPresentation');if(o)o.onclick=()=>location.assign(PRESENT);
 const cp=document.getElementById('crTeamCopyPresentation');if(cp)cp.onclick=async()=>{const u=new URL(PRESENT,location.href).href;try{await navigator.clipboard.writeText(u);cp.textContent='✓ Link copiado'}catch(_){prompt('Copie o link:',u)}};
}
function intercept(e){const t=e.target.closest('[aria-label="Abrir Apresentação"],[data-origin="presentation"]');if(!t)return;e.preventDefault();e.stopImmediatePropagation();location.assign(PRESENT)}
function mount(){profile();meeting();agenda();badge('eder',PEOPLE.eder);badge('technical',PEOPLE.eder);badge('admin',PEOPLE.rogerio);presentation()}
document.addEventListener('click',intercept,true);
let lock=false;const schedule=()=>{if(lock)return;lock=true;setTimeout(()=>{lock=false;mount()},60)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
setInterval(mount,2500);
})();