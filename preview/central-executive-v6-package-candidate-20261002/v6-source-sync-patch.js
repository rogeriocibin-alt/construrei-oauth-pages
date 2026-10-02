(()=>{'use strict';
if(window.__CR_V6_SOURCE_SYNC)return;window.__CR_V6_SOURCE_SYNC=true;
const EXEC='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v6-candidate-20261002';
const PEND='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-pendencias-vivas-candidate-20261002';
const q=id=>document.getElementById(id);
function sess(){try{return sessionStorage.getItem('crGestaoSession')||localStorage.getItem('crGestaoSession')||''}catch(_){return''}}
async function api(url,opt={}){const h={...(opt.headers||{})},s=sess();if(s)h['x-cr-session']=s;const r=await fetch(url,{...opt,headers:h,cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Error(d.error||('HTTP '+r.status));return d}
function install(){
 const head=q('crV5PendingNew')?.parentElement;if(!head||q('crV6SyncSources'))return;
 const b=document.createElement('button');b.id='crV6SyncSources';b.className='cr-v5-btn';b.type='button';b.textContent='Importar exceções reais';b.title='Cria pendências candidatas apenas para exceções objetivas das fontes, com deduplicação por origem.';head.insertBefore(b,q('crV5PendingHistory')||null);
 b.onclick=sync;
}
async function sync(){
 const b=q('crV6SyncSources');if(!sess()){alert('Entre como Diretor/Técnico para alimentar o Banco Mestre candidato.');return}
 b.disabled=true;b.textContent='Lendo fontes…';
 try{
   const d=await api(EXEC+'?view=home&t='+Date.now()),items=d.exceptions?.items||[];
   if(!items.length){alert('Nenhuma exceção objetiva nova foi detectada nas fontes atuais.');return}
   let created=0,dedup=0,failed=0;
   for(const x of items){
     const issue=String(x.issue||'EXCEÇÃO DE FONTE').trim(),caseNo=String(x.case||'').trim();
     const ref='trello-exception:'+caseNo+':'+issue.toLowerCase().replace(/[^a-z0-9]+/gi,'-').slice(0,90);
     const body={
       kind:'FOUND',title:(caseNo?caseNo+' • ':'')+issue,
       description:'Exceção objetiva detectada automaticamente na leitura executiva do Trello. Nenhum dado foi inferido.',
       category:'OPERACIONAL',budget_code:caseNo||null,priority:'P2',
       next_action:'Revisar a exceção na origem e registrar a correção comprovável.',
       source_system:'TRELLO',source_ref:ref,source_url:x.source_url||null,
       idempotency_key:'source-sync:'+ref
     };
     try{
       const r=await api(PEND+'?api=event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
       if(r.deduplicated||r.idempotent)dedup++;else created++;
     }catch(_){failed++}
   }
   alert('Banco Mestre candidato: '+created+' criada(s), '+dedup+' já existente(s), '+failed+' falha(s). A produção não foi alterada.');
   location.reload();
 }catch(e){alert('Sincronização candidata: '+e.message)}
 finally{b.disabled=false;b.textContent='Importar exceções reais'}
}
function init(){install();new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();