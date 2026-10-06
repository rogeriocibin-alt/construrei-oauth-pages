(()=>{'use strict';
if(window.__CR_GESTOR_HUMAN_CONTEXT_V2)return;window.__CR_GESTOR_HUMAN_CONTEXT_V2=true;
const REG='https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/team-registry.json?v=20261006-context-v2';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
fetch(REG,{cache:'no-store'}).then(r=>r.json()).then(d=>{
 const q=new URLSearchParams(location.search),area=(q.get('area')||'').toLowerCase();
 const key=area==='admin'?'rogerio':area==='technical'?'eder':'';
 if(!key)return;
 const p=d.people&&d.people[key];if(!p)return;
 const main=document.querySelector('main,.main,.workspace')||document.body;
 if(main&&!main.querySelector('.cr-owner-context')){
  const c=document.createElement('div');c.className='cr-owner-context';
  c.innerHTML='<img src="'+esc(p.face)+'" alt="'+esc(p.name)+'"><div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div>';
  main.insertBefore(c,main.firstChild);
 }
}).catch(()=>{});
})();