(()=>{'use strict';
const URL='./maturity-audit.json?v=1';
const qs=(s,r=document)=>r.querySelector(s);
const levelFor=n=>n>=90?'Otimizado':n>=75?'Gerenciado':n>=60?'Integrado':n>=40?'Estruturado':'Inicial';
const ringColor=n=>n>=90?'#49d391':n>=75?'#d0a23c':n>=60?'#2db4ff':n>=40?'#ffd166':'#ff6b78';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function setGauge(id,score,level){
 const root=qs(id); if(!root)return;
 const ring=qs('.cr-ml-ring',root), num=qs('.cr-ml-ring b',root);
 if(ring){ring.style.setProperty('--p',Math.max(0,Math.min(100,score)));ring.style.setProperty('--ring',ringColor(score));}
 if(num)num.textContent=score+'%';
 let chip=qs('.cr-ml-level',root);
 if(!chip){chip=document.createElement('span');chip.className='cr-ml-level';root.lastElementChild.appendChild(chip);}
 chip.textContent='NÍVEL • '+(level||levelFor(score)).toUpperCase();
}
function axisText(a){
 const ev=(a.evidence||[]).slice(0,2).join(' • ');
 return ev+(a.gap?' | Próximo: '+a.gap:'');
}
function render(d){
 setGauge('#crMlGeneral',Number(d.general?.score||0),d.general?.level);
 setGauge('#crMlAutonomy',Number(d.autonomy?.score||0),d.autonomy?.level);
 Object.entries(d.axes||{}).forEach(([key,a])=>{
   const card=qs('.cr-ml-card[data-axis="'+CSS.escape(key)+'"]'); if(!card)return;
   const score=Math.max(0,Math.min(100,Number(a.score||0)));
   const level=a.level||levelFor(score);
   const b=qs('.cr-ml-row b',card),bar=qs('.cr-ml-track i',card),small=qs('small',card);
   if(b)b.textContent=score+'%';
   if(bar)bar.style.width=score+'%';
   if(small)small.textContent=(a.evidence||[])[0]||'Evidência registrada';
   card.dataset.level=level;
   card.title=axisText(a);
 });
 const live=qs('#crMlLive'); if(live)live.textContent='● AUDITADO • '+String(d.general?.score||'—')+'% GERAL';
 const src=qs('#crMlSource'); if(src){
   const dt=d.audited_at?new Date(d.audited_at):null;
   const when=dt&&!isNaN(dt)?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}).format(dt):'checkpoint atual';
   src.textContent='matriz auditável • '+when;
   src.title=(d.scoring_note||'')+' '+(d.methodology?.note||'');
 }
 const foot=qs('#crMaturityLive .cr-ml-foot span:first-child');
 if(foot)foot.innerHTML='<b>Alavanca atual:</b> '+esc(d.leverage||'Atendimento → APP → F00/F01 → esteira ponta a ponta');
 window.CR_MATURITY_AUDIT=d;
}
async function boot(){
 try{
   const r=await fetch(URL,{cache:'no-store'});
   if(!r.ok)throw new Error('HTTP '+r.status);
   render(await r.json());
 }catch(err){
   const live=qs('#crMlLive');if(live)live.textContent='● AUDITORIA INDISPONÍVEL';
   const src=qs('#crMlSource');if(src)src.textContent='falha ao carregar matriz';
   console.warn('[CR maturity audit]',err);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();