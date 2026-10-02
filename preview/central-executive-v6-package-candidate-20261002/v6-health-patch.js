(()=>{'use strict';
if(window.__CR_V6_HEALTH_PATCH)return;window.__CR_V6_HEALTH_PATCH=true;
const API='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-executive-readonly-v6-candidate-20261002';
let H=null,painting=false;
const q=id=>document.getElementById(id);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function card(label,value,sub,state=''){return '<div class="card kpi cr-kpi '+state+'"><div class="lab">'+esc(label)+'</div><div class="val">'+esc(value)+'</div><div class="mut">'+esc(sub)+'</div></div>'}
function render(){
 if(!H||painting)return;painting=true;
 const s=H.sources||{},host=q('healthCards');
 if(host)host.innerHTML=
  card('API Executiva V6','ONLINE','Candidata somente leitura','health')+
  card('Banco de Dados',s.database?.ok?'RESPONDENDO':'INDISPONÍVEL',(s.database?.latency_ms??'—')+' ms',s.database?.ok?'health':'risk')+
  card('Trello',s.trello?.ok?'RESPONDENDO':'INDISPONÍVEL',(s.trello?.latency_ms??'—')+' ms • leitura real',s.trello?.ok?'health':'risk')+
  card('GestãoClick',s.gestaoclick?.ok?'RESPONDENDO':'INDISPONÍVEL',(s.gestaoclick?.latency_ms??'—')+' ms • HTTP '+(s.gestaoclick?.http_status??'—'),s.gestaoclick?.ok?'health':'risk')+
  card('Agenda operacional',s.agenda?.operational_records>0?'FONTE ATIVA':'SEM FONTE HOMOLOGADA',(s.agenda?.operational_records??0)+' registro(s) não-QA',s.agenda?.operational_records>0?'health':'warn')+
  card('Banco Mestre',s.pending_master?.records>0?'ALIMENTADO':'BASE PRONTA • SEM ALIMENTAÇÃO',(s.pending_master?.records??0)+' registro(s) • '+(s.pending_master?.live??0)+' vivo(s)',s.pending_master?.records>0?'health':'warn')+
  card('Latência completa',(H.latency_ms??'—')+' ms','Trello + GestãoClick + Banco','tech')+
  card('Última verificação',H.checked_at?new Date(H.checked_at).toLocaleString('pt-BR'):'—','Telemetria real','tech');
 const page=q('health');
 if(page&&!q('crV6HealthNotice')){
   const n=document.createElement('div');n.id='crV6HealthNotice';n.className='notice good';
   n.innerHTML='<b>Saúde Técnica V6 ativa.</b> Os estados abaixo vêm de verificações reais. Fonte ausente não é exibida como OK; a Central canônica não é alterada por esta candidata.';
   const h1=page.querySelector('h1');if(h1)h1.insertAdjacentElement('afterend',n);
 }
 const note=q('crV5QuoteNote');
 if(note&&/orçamentos lidos/i.test(note.textContent||''))note.textContent=(note.textContent||'')+' Tempo por etapa ainda não é exposto pela fonte; não foi estimado.';
 setTimeout(()=>painting=false,0);
}
async function refresh(){try{const r=await fetch(API+'?view=health&t='+Date.now(),{cache:'no-store'}),d=await r.json();if(!r.ok||d.ok===false)throw Error(d.error||('HTTP '+r.status));H=d;render()}catch(e){const host=q('healthCards');if(host)host.innerHTML=card('Saúde Técnica','INDISPONÍVEL',e.message,'risk')}}
function init(){const host=q('healthCards');if(host)new MutationObserver(()=>{if(H&&!painting)setTimeout(render,0)}).observe(host,{childList:true});refresh();setInterval(refresh,30000);setInterval(render,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();