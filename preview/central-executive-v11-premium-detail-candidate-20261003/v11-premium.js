(()=>{'use strict';
if(window.__CR_V11_PREMIUM)return;window.__CR_V11_PREMIUM=true;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function polishBrand(){
 const b=$('.side .brand');if(!b)return;
 const strong=$('strong',b),small=$('small',b);
 if(strong&&strong.textContent!=='CONSTRU-REI')strong.textContent='CONSTRU-REI';
 if(small&&small.textContent!=='CONSTRUINDO RESULTADOS')small.textContent='CONSTRUINDO RESULTADOS';
}
function polishHeader(){
 const h=$('.cr-v10-header');if(!h)return;
 const u=$('.cr-v10-user',h);if(!u)return;
 if(!$('.cr-v11-notify',h)){const n=document.createElement('button');n.className='cr-v11-notify';n.type='button';n.setAttribute('aria-label','Notificações');n.innerHTML='♧<em>3</em>';h.insertBefore(n,u)}
 if(!$('.cr-v11-user-chevron',u)){const c=document.createElement('span');c.className='cr-v11-user-chevron';c.textContent='⌄';u.appendChild(c)}
}
function polishHero(){
 const hero=$('.cr-v10-hero');if(!hero)return;
 $$('.cr-v10-action',hero).forEach((b,i)=>{
   if(b.dataset.v11Polished)return;b.dataset.v11Polished='1';
   const label=b.textContent.replace(/^[＋▣▤]\s*/,'');
   b.innerHTML=(i===0?'＋':i===1?'▣':'▤')+' <span>'+label+'</span>';
 });
}
function healthState(card){
 const value=($('b',card)?.textContent||'').toLowerCase(),sub=($('small',card)?.textContent||'').toLowerCase(),all=value+' '+sub;
 if(/respondendo|ativa|online|operacional|100%|99/.test(all))return['Operacional',''];
 if(/sem fonte|indispon|erro|falha/.test(all))return['Atenção','warn'];
 return['Monitorando',''];
}
function polishHealth(){
 $$('.cr-v10-health-card').forEach(card=>{
   if($('.cr-v11-health-pill',card))return;
   const [label,cls]=healthState(card),p=document.createElement('span');
   p.className='cr-v11-health-pill '+cls;p.textContent='● '+label;card.appendChild(p);
 });
}
function markReady(){document.documentElement.classList.add('cr-v11-ready');document.body?.classList.add('cr-v11-ready')}
function run(){markReady();polishBrand();polishHeader();polishHero();polishHealth()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
[500,1200,2500,5000].forEach(ms=>setTimeout(run,ms));
setInterval(run,5000);
})();