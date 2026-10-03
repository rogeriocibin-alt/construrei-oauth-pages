(()=>{'use strict';
if(window.__CR_V11_PREMIUM)return;window.__CR_V11_PREMIUM=true;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function polishBrand(){
 const b=$('.side .brand');if(!b)return;
 const strong=$('strong',b),small=$('small',b);
 if(strong)strong.textContent='CONSTRU-REI';
 if(small)small.textContent='CONSTRUINDO RESULTADOS';
}
function polishHeader(){
 const h=$('.cr-v10-header');if(!h||$('.cr-v11-notify',h))return;
 const u=$('.cr-v10-user',h);if(!u)return;
 const n=document.createElement('button');n.className='cr-v11-notify';n.type='button';n.setAttribute('aria-label','Notificações');n.innerHTML='♧<em>3</em>';
 h.insertBefore(n,u);
 const c=document.createElement('span');c.className='cr-v11-user-chevron';c.textContent='⌄';u.appendChild(c);
}
function polishHero(){
 const hero=$('.cr-v10-hero');if(!hero)return;
 const acts=$$('.cr-v10-action',hero);
 acts.forEach((b,i)=>{if(i===0)b.innerHTML='＋ <span>'+b.textContent.replace(/^＋\s*/,'')+'</span>';else if(i===1)b.innerHTML='▣ <span>'+b.textContent.replace(/^▣\s*/,'')+'</span>';else if(i===2)b.innerHTML='▤ <span>'+b.textContent.replace(/^▤\s*/,'')+'</span>'});
}
function healthState(card){
 const value=($('b',card)?.textContent||'').toLowerCase();
 const sub=($('small',card)?.textContent||'').toLowerCase();
 if(/respondendo|ativa|online|operacional|100%|99/.test(value+' '+sub))return['Operacional',''];
 if(/sem fonte|indispon|erro|falha/.test(value+' '+sub))return['Atenção','warn'];
 return['Monitorando',''];
}
function polishHealth(){
 $$('.cr-v10-health-card').forEach(card=>{
   if($('.cr-v11-health-pill',card))return;
   const [label,cls]=healthState(card);
   const p=document.createElement('span');p.className='cr-v11-health-pill '+cls;p.textContent='● '+label;card.appendChild(p);
 });
}
function markReady(){
 document.documentElement.classList.add('cr-v11-ready');
 document.body?.classList.add('cr-v11-ready');
}
function run(){markReady();polishBrand();polishHeader();polishHero();polishHealth();}
const mo=new MutationObserver(()=>run());
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();mo.observe(document.documentElement,{childList:true,subtree:true})});
else {run();mo.observe(document.documentElement,{childList:true,subtree:true})}
setTimeout(run,800);setTimeout(run,2200);setTimeout(run,5000);
})();