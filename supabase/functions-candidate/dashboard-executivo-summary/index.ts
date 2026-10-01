import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BUILD = "CR-DASHBOARD-EXEC-SUMMARY-CANDIDATE-20261001";
const TRELLO_READ = Deno.env.get("CR_TRELLO_READ_URL") || "https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-integration-hub-trello-candidate";
const SB_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

type MetricStatus = "ok" | "not_available" | "error" | "stale";
type Metric = { value: number | string | null; amount?: number | null; status: MetricStatus; source: string; updated_at?: string|null; note?: string };

function json(data:any,status=200){ return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","x-construrei-build":BUILD}}); }
function na(source:string,note:string):Metric{return {value:null,status:"not_available",source,note}}
function ok(value:any,source:string,extra:Partial<Metric>={}):Metric{return {value,status:"ok",source,...extra}}
async function timeoutFetch(url:string,init:RequestInit={},ms=8000){ const ctl=new AbortController(); const t=setTimeout(()=>ctl.abort(),ms); try{return await fetch(url,{...init,signal:ctl.signal,cache:"no-store"})}finally{clearTimeout(t)} }
async function sb(path:string){ if(!SB_URL||!SERVICE_ROLE) throw new Error("SUPABASE_SERVER_CREDENTIALS_UNAVAILABLE"); const r=await timeoutFetch(SB_URL+"/rest/v1/"+path,{headers:{apikey:SERVICE_ROLE,authorization:"Bearer "+SERVICE_ROLE}},7000); const d=await r.json().catch(()=>null); if(!r.ok) throw new Error("SUPABASE_READ_FAILED_"+r.status); return d; }
async function trelloBoardContext(auth:string){ const u=new URL(TRELLO_READ); u.searchParams.set("api","board-context"); u.searchParams.set("board_id","6974b24c16d17ca76351a950"); const r=await timeoutFetch(u.toString(),{headers:{authorization:auth}},10000); const d=await r.json().catch(()=>null); if(!r.ok) throw new Error("TRELLO_READ_FAILED_"+r.status); return d; }
function moneyAny(s:any){ const m=String(s||"").match(/R\$\s*([0-9.]+,[0-9]{2})/i); return m?Number(m[1].replace(/\./g,"").replace(",",".")):null; }
function moneyLabel(s:any,label:string){ const text=String(s||""); const i=text.toLowerCase().indexOf(label.toLowerCase()); return i<0?null:moneyAny(text.slice(i)); }
function countObras(s:any){ const m=String(s||"").match(/(\d+)\s+OBRAS?/i); return m?Number(m[1]):null; }
function summaryCard(cards:any[],listName:string){ return cards.find((c:any)=>String(c?.list_name||"").trim().toUpperCase()===listName.toUpperCase() && /RESUMO DA LISTA/i.test(String(c?.name||""))) || null; }

Deno.serve(async(req:Request)=>{
  if(req.method!=="GET") return json({ok:false,error:"READ_ONLY"},405);
  const auth=req.headers.get("authorization")||"";
  if(!/^Bearer\s+.+/i.test(auth)) return json({ok:false,error:"JWT_REQUIRED"},401);
  const now=new Date().toISOString();
  const out:any={ok:true,build:BUILD,updated_at:now,operacao:{
    servicos_em_andamento:na("TRELLO:GESTÃO DE OBRAS 2026/EM ANDAMENTO","aguardando leitura"),
    aguardando_pagamento:na("TRELLO:GESTÃO DE OBRAS 2026/AG. PAGAMENTO","aguardando leitura"),
    aguardando_acerto:na("TRELLO:GESTÃO DE OBRAS 2026/AG. ACERTO","aguardando leitura"),
    visitas_hoje:na("SUPABASE:cr_work_agenda_v1","fonte ainda não homologada como completa"),
    f00_pendentes:na("SUPABASE:cr_f00_cases","aguardando leitura"),
    f01_pendentes:na("SUPABASE:cr_f01_cases_v2","aguardando leitura"),
    orcamentos:na("CANONICAL_SOURCE_PENDING","cr_quotes_v1 ainda não possui dados operacionais suficientes"),
    alertas_operacionais:na("GRC_PENDING_RULE","agregação de severidades ainda não homologada")},
    pendencias:{app:na("CENTRO-OPERACOES:pending-board","fonte existe, integração futura"),wizy:na("CENTRO-OPERACOES:pending-board","fonte existe, integração futura"),eder:na("CENTRO-OPERACOES:pending-board","fonte existe, integração futura")},
    saude:{sistema:na("HEALTH_PROBES","não inferir sem check"),apis:na("HEALTH_PROBES","não inferir sem check"),integracoes:na("HEALTH_PROBES","não inferir sem check"),banco:na("HEALTH_PROBES","não inferir sem check"),tempo_resposta:na("HEALTH_PROBES","não inferir sem medição"),ambiente:na("RUNTIME","não inferir")}};
  const errors:any[]=[];
  try{
    const t=await trelloBoardContext(auth); const cards=Array.isArray(t?.cards)?t.cards:[];
    const a=summaryCard(cards,"EM ANDAMENTO"), p=summaryCard(cards,"AG. PAGAMENTO"), c=summaryCard(cards,"AG. ACERTO");
    if(a) out.operacao.servicos_em_andamento=ok(countObras(a.name),"TRELLO:GESTÃO DE OBRAS 2026/EM ANDAMENTO",{amount:moneyLabel(a.desc,"Volume financeiro em execução")??moneyAny(a.name),updated_at:a.last_activity||null});
    if(p) out.operacao.aguardando_pagamento=ok(countObras(p.name),"TRELLO:GESTÃO DE OBRAS 2026/AG. PAGAMENTO",{amount:moneyLabel(p.desc,"Bruto")??moneyAny(p.name),updated_at:p.last_activity||null});
    if(c) out.operacao.aguardando_acerto=ok(countObras(c.name),"TRELLO:GESTÃO DE OBRAS 2026/AG. ACERTO",{amount:moneyLabel(c.desc,"Base considerada")??moneyAny(c.name),updated_at:c.last_activity||null});
  }catch(e){errors.push({source:"trello",error:String(e instanceof Error?e.message:e)})}
  try{ const f00=await sb("cr_f00_cases?select=status"); const pending=(Array.isArray(f00)?f00:[]).filter((x:any)=>["AGUARDANDO_RESPOSTA","EM_COLETA"].includes(String(x.status||"").toUpperCase())).length; out.operacao.f00_pendentes=ok(pending,"SUPABASE:cr_f00_cases",{updated_at:now}); }catch(e){errors.push({source:"f00",error:String(e instanceof Error?e.message:e)})}
  try{ const f01=await sb("cr_f01_cases_v2?select=status,archived_at&archived_at=is.null"); const active=(Array.isArray(f01)?f01:[]).filter((x:any)=>String(x.status||"").toLowerCase()==="em_atendimento").length; out.operacao.f01_pendentes=ok(active,"SUPABASE:cr_f01_cases_v2",{updated_at:now}); }catch(e){errors.push({source:"f01",error:String(e instanceof Error?e.message:e)})}
  out.partial=errors.length>0; out.errors=errors; return json(out,200);
});