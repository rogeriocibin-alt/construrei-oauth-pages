(()=>{'use strict';
if(window.__CR_HUMAN_IDENTITY_CANON_V1)return;window.__CR_HUMAN_IDENTITY_CANON_V1=true;
const REG='https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/team-registry.json?v=20261006';
const fallback=[
 {name:'Rogério',role:'Diretor',face:'https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/rogerio-face.webp'},
 {name:'Éder',role:'Admin Técnico',face:'https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/eder-face.webp'},
 {name:'Gabrielly',role:'Atendimento',face:'https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/gabrielly-face.webp'},
 {name:'Fabrício',role:'Execução',face:'https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/fabricio-face.webp'}
];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function mount(team){
 if(document.querySelector('[data-cr-human-canon="v1"]'))return;
 const host=document.querySelector('main,.main,.content,.wrap,.container')||document.body;
 if(!host)return;
 const bar=document.createElement('section');bar.className='cr-human-canon-bar';bar.dataset.crHumanCanon='v1';
 bar.innerHTML='<div class="cr-human-canon-copy"><b>Equipe CONSTRU-REI</b><small>Identidade humana canônica • pessoas reais • papéis visíveis</small></div><div class="cr-human-canon-avatars">'+team.map(p=>'<img src="'+esc(p.face)+'?v=canon1" alt="'+esc(p.name)+' • '+esc(p.role)+'" title="'+esc(p.name)+' • '+esc(p.role)+'" loading="eager">').join('')+'</div>';
 if(host===document.body)host.insertBefore(bar,host.firstChild);else host.insertBefore(bar,host.firstChild);
}
function start(){fetch(REG,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>mount(Object.values(d.people||{}))).catch(()=>mount(fallback))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();