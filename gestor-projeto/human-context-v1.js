(()=>{'use strict';
if(window.__CR_GESTOR_HUMAN_CONTEXT_V1)return;window.__CR_GESTOR_HUMAN_CONTEXT_V1=true;
const REG='https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/team-registry.json?v=20261006';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function render(d){
 const team=Object.values(d.people||{}),top=document.querySelector('.topbar');
 if(top&&!top.querySelector('.cr-owner-human-cluster')){
  const c=document.createElement('div');c.className='cr-owner-human-cluster';c.title='Equipe humana CONSTRU-REI';
  c.innerHTML=team.map(p=>'<img src="'+esc(p.face)+'" alt="'+esc(p.name)+'" title="'+esc(p.name)+' • '+esc(p.short_role||p.role)+'">').join('');
  const brand=top.querySelector('.topbar-brand');brand?brand.insertAdjacentElement('afterend',c):top.appendChild(c);
 }
 const area=(new URLSearchParams(location.search).get('area')||'').toLowerCase();
 const key=area==='admin'?'rogerio':area==='technical'?'eder':'';
 if(!key)return;
 const p=d.people&&d.people[key],content=document.querySelector('.content');
 if(!p||!content||content.querySelector('.cr-owner-context'))return;
 const card=document.createElement('section');card.className='cr-owner-context';card.dataset.crOwnerContext=key;
 card.innerHTML='<img src="'+esc(p.face)+'" alt="'+esc(p.name)+'"><div><b>'+esc(p.name)+' • '+esc(p.short_role||p.role)+'</b><small>'+esc(p.role)+'</small></div>';
 content.insertBefore(card,content.firstChild);
}
function start(){fetch(REG,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(render).catch(()=>{})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();