import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SB=Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co";
const AUTH=SB+"/functions/v1/central-gestao-api";
let SRK="";try{const k=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");SRK=k.default||k.service_role||Object.values(k)[0]||""}catch{}
if(!SRK)SRK=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const BUILD="CR-EXECUTIVE-READONLY-V4-20261002";
const H={"content-type":"application/json; charset=utf-8","cache-control":"no-store","access-control-allow-origin":"*","access-control-allow-headers":"content-type,x-cr-session,x-cr-key,authorization","access-control-allow-methods":"GET,OPTIONS","x-construrei-build":BUILD,"x-construrei-candidate":"true"};
const J=(d:any,s=200)=>new Response(JSON.stringify(d),{status:s,headers:H});
async function db(path:string,init:RequestInit={}){
  if(!SRK)throw Error("Secret key indisponível");
  const r=await fetch(SB+"/rest/v1/"+path,{
    ...init,
    headers:{
      apikey:SRK,authorization:"Bearer "+SRK,"content-type":"application/json",
      prefer:"return=representation",...(init.headers||{})
    }
  });
  const txt=await r.text();
  if(!r.ok)throw Error("DB "+r.status+": "+txt.slice(0,500));
  return txt?JSON.parse(txt):[];
}
async function who(req:Request){
  const h=new Headers();
  for(const k of ["x-cr-session","x-cr-key","authorization"]){
    const v=req.headers.get(k); if(v)h.set(k,v);
  }
  const r=await fetch(AUTH+"?api=me",{headers:h,cache:"no-store"});
  const d=await r.json().catch(()=>({}));
  return r.ok?d:null;
}

function daySP(v:any){const d=new Date(v);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).format(d):null}
function dayOffset(day:string,n:number){const d=new Date(day+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
const done=(x:any)=>["CONCLUIDO","COMPLETED","CANCELADO","CANCELLED"].includes(String(x.status||"").toUpperCase());
function calculate(agenda:any[],pending:any[],now=new Date()){
 const today=daySP(now)!,tomorrow=dayOffset(today,1),yesterday=dayOffset(today,-1);
 const active=agenda.filter(x=>!done(x));
 const live=pending.filter(x=>x.status!=="CONCLUIDO");
 const day=(d:string)=>active.filter(x=>daySP(x.starts_at)===d);
 const todayItems=day(today),tomorrowItems=day(tomorrow),yesterdayItems=day(yesterday);
 const yesterdayPending=live.filter(x=>x.due_at&&daySP(x.due_at)===yesterday);
 return {today,tomorrow,yesterday,agenda:{today:todayItems.length,tomorrow:tomorrowItems.length,yesterday_pending:yesterdayItems.length,
 without_confirmation:active.filter(x=>x.executor_confirmation!=="CONFIRMADO"||x.customer_confirmation!=="CONFIRMADO").length,
 without_responsible:active.filter(x=>!String(x.responsible||"").trim()).length,
 incomplete:active.filter(x=>!x.starts_at||!x.ends_at||!x.title||!x.address||!x.contact||!x.access_info).length,
 coverage:agenda.length?"REGISTERED_INTERNAL_NON_QA_ONLY":"NO_OPERATIONAL_REGISTRATIONS",
 note:"Somente registros operacionais internos cadastrados; cobertura externa da agenda ainda não homologada.",
 items:{today:todayItems,tomorrow:tomorrowItems,yesterday:yesterdayItems}},
 pending:{yesterday:yesterdayPending.length,overdue:live.filter(x=>x.due_at&&daySP(x.due_at)!<today).length,total_live:live.length},
 checked_at:now.toISOString()};
}
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:H});
 if(req.method!=="GET")return J({ok:false,error:"READ_ONLY_GET_ONLY"},405);
 try{
  const a=await who(req);if(!a?.role)return J({ok:false,error:"Autenticação necessária."},401);
  const [agenda,pending]=await Promise.all([
   db("cr_work_agenda_v1?select=id,title,starts_at,ends_at,responsible,status,executor_confirmation,customer_confirmation,address,contact,access_info,attendance_id,case_number&is_qa=eq.false&archived_at=is.null&cancelled_at=is.null&privacy_class=eq.INTERNAL&visibility_scope=eq.INTERNAL_TEAM&order=starts_at.asc&limit=1001"),
   db("cr_pending_master_candidate_20261002?select=pending_id,status,due_at&limit=1001")
  ]);
  if(agenda.length>1000||pending.length>1000)return J({ok:false,error:"SOURCE_LIMIT_EXCEEDED"},503);
  const data=calculate(agenda,pending);
  // Only expose fields needed for executive drill-down, never contacts or access instructions.
  Object.keys(data.agenda.items).forEach(k=>{(data.agenda.items as any)[k]=(data.agenda.items as any)[k].map((x:any)=>({id:x.id,title:x.title,starts_at:x.starts_at,ends_at:x.ends_at,responsible:x.responsible,status:x.status,case_number:x.case_number,attendance_id:x.attendance_id}))});
  return J({ok:true,build:BUILD,mode:"CANDIDATE_READ_ONLY",...data,writes_enabled:false});
 }catch(_){return J({ok:false,error:"EXECUTIVE_SOURCE_UNAVAILABLE",build:BUILD},503)}
});