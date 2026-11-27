(function(){
'use strict';
if(window.__CR_AGENDA_SMART_TEXT_R6)return;
window.__CR_AGENDA_SMART_TEXT_R6=true;
// Hotfix 2026-10-08: prevent recursive mutations and verify clipboard fallback.

const API='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-agenda-smart-text-candidate-20261004';
const CACHE=new Map(),OPEN=new Set(),INFLIGHT=new Map();
const session=()=>{try{return sessionStorage.getItem('crGestaoSession')||''}catch(_){return ''}};
let lastSession=session();
function syncSession(){
 const now=session();
 if(now!==lastSession){
  lastSession=now;CACHE.clear();OPEN.clear();INFLIGHT.clear();
  document.querySelectorAll('.cr-agenda-detail').forEach(d=>{d.replaceChildren();d.hidden=true});
  document.querySelectorAll('.cr-agenda-row.cr-agenda-open').forEach(a=>a.classList.remove('cr-agenda-open'));
  document.querySelectorAll('[data-cr-agenda-expand]').forEach(b=>b.textContent='Expandir');
 }
 return now;
}
function live(id,token){return !!token&&token===syncSession()&&!!item(id)}
function cacheKey(id){const x=item(id);return x?JSON.stringify([id,x.starts_at,x.ends_at,x.case,x.title,x.description,x.location,x.team]):''}
function cached(id){const c=CACHE.get(id);return c&&c.key===cacheKey(id)&&Date.now()-c.at<120000?c.data:null}
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const items=()=>{const a=window.CR_NATIVE_CLEAN?.state?.agenda;return session()&&a?.authenticated&&Array.isArray(a.items)?a.items:[]};
const item=id=>items().find(x=>String(x.id||'')===String(id))||null;
const row=id=>qa('.cr-agenda-row').find(x=>String(x.dataset.crAgendaId||'')===String(id))||null;
const host=id=>{const a=row(id);return a?q('.cr-agenda-detail',a):null};
const button=id=>{const a=row(id);return a?q('[data-cr-agenda-expand]',a):null};

function style(){
 if(document.getElementById('crAgendaSmartTextR6Style'))return;
 const s=document.createElement('style');s.id='crAgendaSmartTextR6Style';
 s.textContent=[
 '#dashboard .cr-agenda-actions{display:grid;gap:4px;justify-items:end;align-items:center}',
 '#dashboard .cr-agenda-expand{border:1px solid #bedbf0;background:linear-gradient(180deg,#fff,#eef7fd);color:#075da9;border-radius:8px;padding:5px 8px;font-size:7px;font-weight:900;cursor:pointer;white-space:nowrap}',
 '#dashboard .cr-agenda-row.cr-agenda-open{grid-column:1/-1;border-color:#8fc9ef;box-shadow:0 8px 24px rgba(20,92,153,.10)}',
 '#dashboard .cr-agenda-detail{grid-column:1/-1;border-top:1px solid #e1edf5;margin-top:3px;padding-top:9px;min-width:0}',
 '#dashboard .cr-agenda-detail[hidden]{display:none!important}',
 '#dashboard .cr-agenda-detail-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:7px}',
 '#dashboard .cr-agenda-detail-head b{font-size:9px;color:#163d68}.cr-agenda-source{font-size:7px;color:#718ba3;font-weight:800}',
 '#dashboard .cr-agenda-textbox{width:100%;max-height:430px;overflow:auto;white-space:pre-wrap;word-break:break-word;background:#f7fbfe;border:1px solid #d7e7f2;border-radius:10px;padding:11px;color:#17345a;font:500 10px/1.48 Inter,system-ui,sans-serif;margin:0}',
 '#dashboard .cr-agenda-copybar{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}',
 '#dashboard .cr-agenda-copybar button{border:0;border-radius:9px;padding:8px 11px;font-size:8px;font-weight:900;cursor:pointer}',
 '#dashboard .cr-agenda-copy{background:linear-gradient(180deg,#1489ff,#075bd8);color:#fff}',
 '#dashboard .cr-agenda-refresh{background:#e9f2f8;color:#24567e;border:1px solid #cbdfea!important}',
 '#dashboard .cr-agenda-load{padding:10px;color:#56738d;font-size:9px}',
 '#dashboard .cr-agenda-error{background:#fff4e9;border:1px solid #ecc89f;border-radius:10px;padding:10px;color:#744414;font-size:9px;line-height:1.4}',
 '#dashboard .cr-agenda-missing{margin-top:7px;padding:7px 9px;border-radius:8px;background:#fff7e7;border:1px solid #f0d7a0;color:#745513;font-size:8px}',
 '#dashboard .cr-agenda-copy-ok{color:#08774a;font-size:8px;font-weight:900;align-self:center}',
 '@media(max-width:700px){#dashboard .cr-agenda-actions{grid-column:3;grid-row:1;align-self:center}#dashboard .cr-agenda-detail{grid-column:1/-1}#dashboard .cr-agenda-expand{font-size:9px;padding:7px 9px}#dashboard .cr-agenda-textbox{font-size:11px;max-height:52vh}#dashboard .cr-agenda-copybar button{font-size:10px;padding:9px 12px}}',
 '@media(max-width:420px){#dashboard .cr-agenda-actions{grid-column:2;grid-row:auto;justify-items:start;display:flex;gap:6px;flex-wrap:wrap}}'
 ].join('');
 document.head.appendChild(s);
}
function setOpen(id,on){
 const a=row(id),b=button(id),d=host(id);if(!a||!b||!d)return;
 a.classList.toggle('cr-agenda-open',on);d.hidden=!on;b.textContent=on?'Ocultar':'Expandir';
 on?OPEN.add(id):OPEN.delete(id);
}
function render(id,data){
 const d=host(id);if(!d||!session()||!item(id))return;
 const partial=data.sources?.gestaoclick?.partial?'<div class="cr-agenda-missing">⚠ Consulta parcial ao GestãoClick. Revise os dados antes de copiar.</div>':'';
 const missing=Array.isArray(data.missing_fields)&&data.missing_fields.length?'<div class="cr-agenda-missing">⚠ Informação não localizada no GestãoClick: '+esc(data.missing_fields.join(', '))+'. Revise antes de enviar ao grupo.</div>':'';
 d.innerHTML='<div class="cr-agenda-detail-head"><b>Texto operacional pronto</b><span class="cr-agenda-source">Agenda + GestãoClick • '+esc(data.mode||'')+'</span></div><pre class="cr-agenda-textbox">'+esc(data.text||'')+'</pre>'+partial+missing+'<div class="cr-agenda-copybar"><button type="button" class="cr-agenda-copy" data-cr-agenda-copy="'+esc(id)+'">Copiar texto</button><button type="button" class="cr-agenda-refresh" data-cr-agenda-refresh="'+esc(id)+'">Atualizar dados</button><span class="cr-agenda-copy-ok" data-cr-agenda-copy-status></span></div>';
}
async function generate(id,force=false){
 const token=syncSession(),it=item(id),d=host(id);if(!token||!it||!d)return;
 const key=cacheKey(id),old=cached(id);
 if(old&&!force){render(id,old);return}
 if(INFLIGHT.has(id))return;
 const request={};INFLIGHT.set(id,request);
 if(force)CACHE.delete(id);
 d.innerHTML='<div class="cr-agenda-load">Consultando o GestãoClick e montando o texto padrão…</div>';
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),65000);
 try{
   const agenda=window.CR_NATIVE_CLEAN?.state?.agenda;
   const date=Number(it.day_order)===1?agenda?.tomorrow:agenda?.today;
   const r=await fetch(API,{method:'POST',cache:'no-store',signal:ac.signal,headers:{'content-type':'application/json','x-cr-session':token},body:JSON.stringify({event:{id:it.id},date})});
   const data=await r.json().catch(()=>({}));
   if(!live(id,token)||key!==cacheKey(id)||INFLIGHT.get(id)!==request)return;
   if(!r.ok||!data.ok||typeof data.text!=='string'||!data.text.trim())throw new Error(data.message||data.error||('HTTP '+r.status));
   CACHE.set(id,{key,at:Date.now(),data});
   if(OPEN.has(id))render(id,data);
 }catch(e){
   if(!live(id,token)||key!==cacheKey(id)||INFLIGHT.get(id)!==request)return;
   const target=host(id);if(target&&OPEN.has(id))target.innerHTML='<div class="cr-agenda-error"><b>Não foi possível gerar o texto agora.</b><br>'+esc(e?.name==='AbortError'?'Tempo de consulta esgotado.':e?.message||String(e))+'<div class="cr-agenda-copybar"><button type="button" class="cr-agenda-refresh" data-cr-agenda-refresh="'+esc(id)+'">Tentar novamente</button></div></div>';
 }finally{clearTimeout(timer);if(INFLIGHT.get(id)===request)INFLIGHT.delete(id)}
}
async function copy(id){
 const token=syncSession();if(!live(id,token))return;const data=cached(id);if(!data?.text){await generate(id,true);return}
 const a=row(id),st=a?q('[data-cr-agenda-copy-status]',a):null;
 let ok=false;
 try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(data.text);ok=true}}catch(_){}
 if(!ok&&live(id,token)){
   const ta=document.createElement('textarea');ta.value=data.text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';
   document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);
   try{ok=!!document.execCommand('copy')}catch(_){}
   ta.remove();
 }
 if(st){st.textContent=ok?'✓ Copiado':'Não foi possível copiar. Selecione o texto acima.';setTimeout(()=>{if(st.isConnected)st.textContent=''},3200)}
 if(!ok){const pre=a?q('.cr-agenda-textbox',a):null;if(pre){const range=document.createRange();range.selectNodeContents(pre);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range)}}
}
function orderedItems(){
 return items().slice().sort((a,b)=>(Number(a.day_order)||0)-(Number(b.day_order)||0)||String(a.starts_at||'').localeCompare(String(b.starts_at||'')));
}
function decorate(){
 const list=orderedItems(),rows=qa('#crAgendaRows .cr-agenda-row');
 rows.forEach((a,i)=>{
   const it=list[i];if(!it)return;
   const id=String(it.id||it.case||[it.starts_at,it.title].join('|'));
   a.dataset.crAgendaId=id;
   let actions=q('.cr-agenda-actions',a);
   if(!actions){
     actions=document.createElement('div');actions.className='cr-agenda-actions';
     const kind=q('.cr-agenda-kind',a);if(kind)actions.appendChild(kind);
     const b=document.createElement('button');b.type='button';b.className='cr-agenda-expand';b.setAttribute('data-cr-agenda-expand',id);b.textContent='Expandir';actions.appendChild(b);a.appendChild(actions);
   }
   if(!q('.cr-agenda-detail',a)){const d=document.createElement('div');d.className='cr-agenda-detail';d.setAttribute('data-cr-agenda-detail',id);d.hidden=true;a.appendChild(d)}
 });
}
function restore(){
 syncSession();style();decorate();
 qa('.cr-agenda-row[data-cr-agenda-id]').forEach(a=>{const id=a.dataset.crAgendaId||'';if(OPEN.has(id)){setOpen(id,true);const d=host(id);if(d&&!d.textContent.trim()){const c=cached(id);if(c)render(id,c);else if(INFLIGHT.has(id))d.innerHTML='<div class="cr-agenda-load">Consultando GestãoClick…</div>';else generate(id,false)}}});
}
document.addEventListener('click',e=>{
 syncSession();const exp=e.target.closest('[data-cr-agenda-expand]');
 if(exp){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const id=exp.getAttribute('data-cr-agenda-expand')||'';const on=!OPEN.has(id);setOpen(id,on);if(on)generate(id,false);return}
 const cp=e.target.closest('[data-cr-agenda-copy]');
 if(cp){e.preventDefault();e.stopPropagation();copy(cp.getAttribute('data-cr-agenda-copy')||'');return}
 const rf=e.target.closest('[data-cr-agenda-refresh]');
 if(rf){e.preventDefault();e.stopPropagation();const id=rf.getAttribute('data-cr-agenda-refresh')||'';CACHE.delete(id);generate(id,true);return}
},true);
const agendaHost=q('#crAgendaRows');
if(agendaHost){let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;restore()},40)}).observe(agendaHost,{childList:true,subtree:false})}
style();setTimeout(restore,200);setInterval(syncSession,500);
})();