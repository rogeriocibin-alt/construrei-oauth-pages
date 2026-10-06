(()=>{'use strict';
if(window.__CR_HUMAN_IDENTITY_CONTEXT_V2)return;window.__CR_HUMAN_IDENTITY_CONTEXT_V2=true;
const REG='https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/team-registry.json?v=20261006-context-v2';
const fallback={
 rogerio:{name:'Rogério',role:'Diretor',face:'https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/rogerio-face.webp'},
 eder:{name:'Éder',role:'Admin Técnico',face:'https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/eder-face.webp'},
 gabrielly:{name:'Gabrielly',role:'Atendimento',face:'https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/gabrielly-face.webp'},
 fabricio:{name:'Fabrício',role:'Execução',face:'https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/team/fabricio-face.webp'}
};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function context(){
 const seg=location.pathname.split('/').filter(Boolean),last=seg[seg.length-1]||'';
 if(/^f0[0-9]$/.test(last))return last;
 if(last==='app-construrei'||location.pathname.includes('app-official-candidate'))return 'app';
 const map={'f00-captura-inteligente':'f00','f01-atendimento':'f01','f02-orcamentos':'f02','f03-propostas-os':'f03','f04-agenda':'f04','f05-materiais-terceiros':'f05','f06-campo-evidencias':'f06','f07-qualidade-documentos':'f07','f08-financeiro-cobranca':'f08','f09-pos-venda-garantia':'f09'};
 return map[last]||last||'app';
}
function resolve(d){
 const k=context(),all=Object.keys(d.people||fallback);
 let keys=(d.page_contexts&&d.page_contexts[k]);
 if(keys==null&&d.link_contexts)keys=d.link_contexts[k];
 if(keys==='team')keys=all;
 return Array.isArray(keys)?keys:[];
}
function decorateModules(people){
 document.querySelectorAll('.cr-module').forEach(btn=>{
  if(btn.querySelector('.cr-module-avatar'))return;
  const t=(btn.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const p=Object.values(people).find(x=>{
   const n=String(x.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   return n&&t.includes(n);
  });
  if(!p)return;
  const img=document.createElement('img');img.className='cr-module-avatar';img.src=p.face;img.alt=p.name;img.title=p.name+' • '+(p.short_role||p.role||'');btn.insertBefore(img,btn.firstChild);
 });
}
function mount(d){
 document.querySelectorAll('[data-cr-human-canon]').forEach(x=>x.remove());
 const people=d.people||fallback,keys=resolve(d),team=keys.map(k=>people[k]).filter(Boolean);
 decorateModules(people);
 if(!team.length)return;
 const host=document.querySelector('main,.main,.content,.wrap,.container')||document.body;if(!host)return;
 const bar=document.createElement('section');bar.className='cr-human-canon-bar';bar.dataset.crHumanCanon='context-v2';
 const label=team.length===1?'Responsável':'Responsáveis';
 bar.innerHTML='<div class="cr-human-canon-copy"><b>'+label+' • CONSTRU-REI</b><small>Identidade humana contextual • responsabilidade real por etapa</small></div><div class="cr-human-canon-avatars">'+team.map(p=>'<img src="'+esc(p.face)+'?v=context2" alt="'+esc(p.name)+' • '+esc(p.role)+'" title="'+esc(p.name)+' • '+esc(p.role)+'" loading="eager">').join('')+'</div>';
 host.insertBefore(bar,host.firstChild);
}
function start(){fetch(REG,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(mount).catch(()=>mount({people:fallback,page_contexts:{app:['gabrielly'],f00:['gabrielly'],f01:['gabrielly'],f02:['eder','rogerio'],f03:['eder','rogerio'],f04:['gabrielly','fabricio'],f05:['fabricio','eder'],f06:['fabricio'],f07:['eder','fabricio'],f08:['rogerio'],f09:['gabrielly','eder']}}))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();