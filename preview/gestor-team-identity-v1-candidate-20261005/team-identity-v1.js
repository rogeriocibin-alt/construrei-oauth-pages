(()=>{'use strict';
if(window.__CR_TEAM_IDENTITY_V1)return;window.__CR_TEAM_IDENTITY_V1=true;
const BASE='../../assets/team/';
const PEOPLE=[
 {key:'rogerio',name:'Rogério',role:'Diretor • Gate Master',img:BASE+'rogerio.webp'},
 {key:'eder',name:'Éder',role:'Admin Técnico • Operação técnica',img:BASE+'eder.webp'},
 {key:'gabrielly',name:'Gabrielly',role:'Atendimento • Triagem',img:BASE+'gabrielly.webp'},
 {key:'fabricio',name:'Fabrício',role:'Execução • Campo',img:BASE+'fabricio.webp'}
];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function card(p){return '<article class="cr-human-card"><img src="'+esc(p.img)+'" alt="'+esc(p.name)+' • CONSTRU-REI" loading="lazy"><div><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></div></article>'}
function mount(){
 const host=document.querySelector('#view-agents .ah-root'),hero=host&&host.querySelector('.ah-hero');
 if(!host||!hero||host.querySelector('.cr-human-team'))return false;
 const s=document.createElement('section');s.className='cr-human-team';
 s.innerHTML='<div class="cr-human-team-head"><div><small>EQUIPE HUMANA • IDENTIDADE OPERACIONAL</small><h3>Quem conduz a CONSTRU-REI</h3></div><span>Pessoas reais • papéis visíveis • responsabilidade clara</span></div><div class="cr-human-team-grid">'+PEOPLE.map(card).join('')+'</div><div class="cr-human-note">Os retratos identificam pessoas da equipe. Avatares do Agent Hub continuam exclusivos dos agentes digitais, preservando a separação de alçadas.</div>';
 hero.insertAdjacentElement('afterend',s);return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(mount()||tries>80)clearInterval(timer)},100);
new MutationObserver(()=>mount()).observe(document.documentElement,{childList:true,subtree:true});
})();