/* CONSTRU-REI Candidate Orchestration Guard 2026-10-04 */
(function(){"use strict";
const phase=(document.querySelector('meta[name="cr-flow-code"]')||{}).content||((location.pathname.match(/\/f(0\d)\//)||[])[1]?"F"+RegExp.$1:"");
const qs=new URLSearchParams(location.search), handoff=qs.get("handoff")||"";
const API="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-flow-runtime-v2";
const state={phase,handoff,mode:handoff?"SYNC":"QA_ISOLATED",identity:null,health:"UNKNOWN"};
async function post(api,body){const r=await fetch(API+"?api="+api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await r.json();if(!r.ok||j.ok===false)throw Error(j.error||("HTTP "+r.status));return j}
async function hydrate(){if(!handoff){state.health="QA_ONLY";return state}try{const j=await post("flow-state",{handoff_token:handoff});const h=j.handoff||{};state.identity={case_id:h.case_id||null,request_id:h.request_id||null,correlation_id:h.correlation_id||null,idempotency_key:h.idempotency_key||null,case_number:h.case_number||null,revision:h.revision||0};state.health=state.identity.case_id?"IDENTITY_OK":"IDENTITY_LEGACY";return state}catch(e){state.health="ERROR";state.error=String(e.message||e);return state}}
function audit(){const i=state.identity||{};return{phase:state.phase,mode:state.mode,health:state.health,identity_complete:!!(i.case_id&&i.request_id&&i.correlation_id),handoff:!!state.handoff,authority:{case:"cr_flow_handoffs",events:"cr_flow_events",agenda:"cr_work_agenda_v1"},warnings:[state.mode==="QA_ISOLATED"?"Modo isolado: localStorage é somente QA.":null,state.health==="IDENTITY_LEGACY"?"Caso legado sem identidade 360 completa; não criar nova identidade silenciosamente.":null].filter(Boolean)}}
window.CROrchestrator=Object.freeze({state,hydrate,audit,post,authorities:{case:"cr_flow_handoffs",events:"cr_flow_events",agenda:"cr_work_agenda_v1"}});
hydrate().then(()=>window.dispatchEvent(new CustomEvent("cr:orchestrator-ready",{detail:audit()})));
})();