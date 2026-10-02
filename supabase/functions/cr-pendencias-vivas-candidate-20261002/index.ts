import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB=Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co";
const AUTH=SB+"/functions/v1/central-gestao-api";
let SRK="";
try{
  const k=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");
  SRK=k.default||k.service_role||Object.values(k)[0]||"";
}catch{}
if(!SRK) SRK=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";

const BUILD="CR-PENDENCIAS-VIVAS-V3-AGENT-ACCESS-CANDIDATE-20261002";
const BASELINE="92ef8f27d71ac176abc6452df165a048c4405d60";
const MASTER="cr_pending_master_candidate_20261002";
const EVENTS="cr_pending_events_candidate_20261002";
const ACCESS="cr_agent_access_candidate_20261002";
const SOURCES="cr_pending_sources_candidate_20261002";

const BASE={
  "cache-control":"no-store, no-cache, must-revalidate, max-age=0",
  "pragma":"no-cache",
  "access-control-allow-origin":"*",
  "access-control-allow-headers":"content-type,x-cr-session,x-cr-key,authorization",
  "access-control-allow-methods":"GET,POST,OPTIONS",
  "content-type":"application/json; charset=utf-8",
  "x-construrei-build":BUILD,
  "x-construrei-candidate":"true",
  "x-construrei-baseline":BASELINE
};
const VALID_KINDS=new Set(["FOUND","STARTED","BLOCKED","DEFERRED","COMPLETED","HOMOLOGATED","REOPENED"]);
const TERMINAL=new Set(["CONCLUIDO"]);
const PERM:any={
  FOUND:"CREATE",STARTED:"UPDATE",BLOCKED:"BLOCK",DEFERRED:"DEFER",
  COMPLETED:"COMPLETE_PROPOSE",REOPENED:"UPDATE"
};

function J(data:any,status=200,extra:Record<string,string>={}){return new Response(JSON.stringify(data),{status,headers:{...BASE,...extra}})}
function T(v:any,n=4000){return String(v??"").replace(/[<>]/g,"").slice(0,n)}
function norm(s:any){return T(s,500).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
function tokens(s:any){return new Set(norm(s).split(" ").filter(x=>x.length>2))}
function sim(a:any,b:any){
  const A=tokens(a),B=tokens(b); if(!A.size||!B.size)return 0;
  let i=0; for(const x of A)if(B.has(x))i++;
  return i/(A.size+B.size-i);
}
function uuid(v:any){
  const s=T(v,80);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)?s:null;
}
function tomorrowISO(){
  const d=new Date(Date.now()-3*60*60*1000); d.setUTCDate(d.getUTCDate()+1);
  return d.toISOString().slice(0,10);
}
function publicStatus(x:any){
  if(x.confirmation_state==="REQUER_HUMANO")return "EXECUÇÃO CONCLUÍDA • AGUARDANDO HOMOLOGAÇÃO";
  if(x.status==="ABERTO")return "PENDENTE";
  if(x.status==="EM_ANDAMENTO")return "EM ANDAMENTO";
  if(x.status==="BLOQUEADO")return "BLOQUEADA";
  if(x.status==="AGUARDANDO_TERCEIRO")return "AGUARDANDO TERCEIRO";
  if(x.status==="AGENDADO")return "AGENDADO";
  if(x.status==="AMANHA")return "ADIADA / AMANHÃ";
  if(x.status==="CONCLUIDO")return "CONCLUÍDA";
  return T(x.status,80);
}
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
async function agent(code:string){
  if(!code)return null;
  const rows=await db(ACCESS+"?agent_code=eq."+encodeURIComponent(code)+"&active=eq.true&select=*&limit=1");
  return rows?.[0]||null;
}
function can(a:any,p:string){return !!a&&Array.isArray(a.permissions)&&a.permissions.includes(p)}
function writeRole(role:string){return ["ADMIN_MASTER_ROGERIO","ADMIN_TECNICO_EDER"].includes(role)}
async function priorEvent(idem:string){
  if(!idem)return null;
  const rows=await db(EVENTS+"?idempotency_key=eq."+encodeURIComponent(idem)+"&select=event_id,pending_id,event_kind,after_data,created_at&limit=1");
  return rows?.[0]||null;
}
async function getItem(id:string){
  const rows=await db(MASTER+"?pending_id=eq."+encodeURIComponent(id)+"&select=*&limit=1");
  return rows?.[0]||null;
}
async function findDup(title:string,category:string,responsible:string){
  const rows=await db(MASTER+"?status=neq.CONCLUIDO&select=*&order=updated_at.desc&limit=500");
  let best:any=null,score=0;
  for(const x of rows){
    if(category&&x.category!==category)continue;
    if(responsible&&x.responsible&&x.responsible!==responsible)continue;
    const s=norm(x.title)===norm(title)?1:sim(x.title,title);
    if(s>score){score=s;best=x}
  }
  return score>=0.66?{item:best,score}:null;
}
async function appendEvent(args:any){
  const row={
    pending_id:args.pending_id,event_kind:args.event_kind,
    actor_kind:args.actor_kind,actor_code:args.actor_code,actor_name:args.actor_name,
    actor_role:args.actor_role||"",correlation_id:args.correlation_id,
    idempotency_key:args.idempotency_key||null,source_ref:args.source_ref||null,
    before_data:args.before_data||{},after_data:args.after_data||{},
    human_gate:!!args.human_gate,metadata:args.metadata||{}
  };
  const rows=await db(EVENTS,{method:"POST",body:JSON.stringify(row)});
  return rows?.[0]||row;
}
async function sourceRows(){
  return db(SOURCES+"?select=*&order=source_code.asc");
}
async function board(req:Request,u:URL){
  const auth=await who(req); if(!auth)return J({ok:false,error:"Autenticação necessária."},401);
  const history=u.searchParams.get("history")==="1";
  const qs=history?"":"&status=neq.CONCLUIDO";
  const items=await db(MASTER+"?select=*&order=priority.asc,updated_at.desc&limit=500"+qs);
  const ids=items.map((x:any)=>x.pending_id);
  const events=ids.length?await db(EVENTS+"?pending_id=in.("+ids.join(",")+")&select=event_id,pending_id,event_kind,actor_kind,actor_code,actor_name,actor_role,correlation_id,idempotency_key,source_ref,human_gate,metadata,created_at&order=created_at.desc&limit=2000"):[];
  const enriched=items.map((x:any)=>({...x,public_status:publicStatus(x),last_event:events.find((e:any)=>e.pending_id===x.pending_id)||null}));
  return J({ok:true,build:BUILD,baseline:BASELINE,mode:"ISOLATED_CANDIDATE",profile:auth.profile,role:auth.role,items:enriched});
}
async function summary(){
  const items=await db(MASTER+"?select=pending_id,status,priority,due_at,confirmation_state,blocked,completed_at,updated_at&limit=1000");
  const sources=await sourceRows();
  const active=items.filter((x:any)=>!TERMINAL.has(x.status));
  const pub=(s:string)=>active.filter((x:any)=>publicStatus(x)===s).length;
  const today=new Date(Date.now()-3*60*60*1000).toISOString().slice(0,10);
  const tomorrow=tomorrowISO();
  return J({ok:true,build:BUILD,baseline:BASELINE,mode:"ISOLATED_CANDIDATE",
    metrics:{
      total_live:active.length,
      pending:pub("PENDENTE"),
      in_progress:pub("EM ANDAMENTO"),
      blocked:pub("BLOQUEADA"),
      waiting_third_party:pub("AGUARDANDO TERCEIRO"),
      tomorrow:active.filter((x:any)=>String(x.due_at||"").slice(0,10)===tomorrow||x.status==="AMANHA").length,
      overdue:active.filter((x:any)=>x.due_at&&String(x.due_at).slice(0,10)<today).length,
      awaiting_homologation:active.filter((x:any)=>x.confirmation_state==="REQUER_HUMANO").length,
      completed_today:items.filter((x:any)=>x.status==="CONCLUIDO"&&String(x.completed_at||"").slice(0,10)===today).length
    },
    sources:sources.map((x:any)=>({source_code:x.source_code,source_name:x.source_name,mode:x.mode,status:x.status,last_checked_at:x.last_checked_at}))
  });
}
async function technicalHealth(){
  const started=performance.now();
  let dbState="OK",dbLatency=0;
  try{
    const t=performance.now(); await db(MASTER+"?select=pending_id&limit=1"); dbLatency=Math.round(performance.now()-t);
  }catch(_){dbState="INDISPONIVEL"}
  let prod:any={status:"INDISPONIVEL",latency_ms:null,baseline:null};
  try{
    const t=performance.now(),r=await fetch(SB+"/functions/v1/centro-operacoes?api=health",{cache:"no-store"});
    prod={status:r.ok?"OK":"ATENCAO",latency_ms:Math.round(performance.now()-t),baseline:r.headers.get("x-construrei-baseline")||null};
  }catch(_){}
  const sources=await sourceRows();
  const external=sources.filter((x:any)=>["GESTAOCLICK","TRELLO","AGENDA"].includes(x.source_code))
    .map((x:any)=>({component:x.source_name,status:x.status,mode:x.mode,last_checked_at:x.last_checked_at}));
  return J({ok:true,build:BUILD,baseline:BASELINE,mode:"REAL_CHECKS_NO_FAKE_OK",checked_at:new Date().toISOString(),
    components:[
      {component:"API Pendências Vivas candidata",status:"OK",latency_ms:Math.round(performance.now()-started),version:BUILD},
      {component:"Banco Mestre candidata",status:dbState,latency_ms:dbLatency,environment:"CANDIDATE"},
      {component:"Central canônica",...prod,environment:"PRODUCTION_READ_ONLY"},
      ...external
    ]
  });
}
async function handleEvent(req:Request){
  const auth=await who(req); if(!auth)return J({ok:false,error:"Autenticação necessária."},401);
  const role=T(auth.role,100);
  if(!writeRole(role))return J({ok:false,error:"Perfil sem permissão de escrita nesta candidata."},403);

  const b=await req.json().catch(()=>({}));
  const kind=T(b.kind,40).toUpperCase();
  if(!VALID_KINDS.has(kind))return J({ok:false,error:"Evento inválido."},400);
  const idem=T(b.idempotency_key,200);
  if(!idem)return J({ok:false,error:"idempotency_key é obrigatória."},400);
  const oldPrior=await priorEvent(idem);
  if(oldPrior)return J({ok:true,idempotent:true,reused:true,pending_id:oldPrior.pending_id,event_id:oldPrior.event_id,build:BUILD});

  const agentCode=T(b.agent_code,80).toUpperCase();
  const ag=agentCode?await agent(agentCode):null;
  if(agentCode&&!ag)return J({ok:false,error:"Agente inexistente ou inativo."},403);
  if(ag&&ag.write_mode!=="HUMAN_SESSION_DELEGATED")return J({ok:false,error:"Agente configurado como somente leitura."},403);
  if(kind==="HOMOLOGATED"){
    if(role!=="ADMIN_MASTER_ROGERIO")return J({ok:false,error:"Homologação exige Diretoria."},403);
    if(agentCode)return J({ok:false,error:"Homologação não pode ser executada por agente."},403);
  }else if(ag&&!can(ag,PERM[kind]))return J({ok:false,error:"Agente sem permissão para "+kind+"."},403);

  const actorKind=ag?"AGENT":"HUMAN";
  const actorCode=ag?ag.agent_code:role;
  const actorName=ag?ag.display_name:T(auth.profile||role,160);
  const actorRole=ag?"DELEGATED_BY_"+role:role;
  const correlationId=uuid(b.correlation_id)||crypto.randomUUID();
  const sourceRef=T(b.source_ref,500)||null;
  const metadata={
    build:BUILD,baseline:BASELINE,
    human_initiator:{profile:T(auth.profile,160),role},
    agent:ag?{code:ag.agent_code,authority_level:ag.authority_level,write_mode:ag.write_mode}:null,
    source_system:T(b.source_system||"MANUAL",100),
    commit:T(b.commit,120)||null,branch:T(b.branch,180)||null,module:T(b.module||b.category,100)||null
  };

  let item:any=null;
  if(kind==="FOUND"&&!b.pending_id){
    const title=T(b.title,300); if(!title)return J({ok:false,error:"title é obrigatório para FOUND."},400);
    const sourceSystem=T(b.source_system||"MANUAL",100);
    if(sourceRef){
      const same=await db(MASTER+"?source_system=eq."+encodeURIComponent(sourceSystem)+"&source_ref=eq."+encodeURIComponent(sourceRef)+"&select=*&limit=1");
      if(same?.[0])return J({ok:true,deduplicated:true,reason:"SOURCE_IDENTITY",merged_into:same[0].pending_id,item:{...same[0],public_status:publicStatus(same[0])},build:BUILD});
    }
    const category=T(b.category||"OPERACIONAL",80).toUpperCase();
    const responsible=T(b.responsible||"",180)||null;
    const dup=await findDup(title,category,responsible||"");
    if(dup)return J({ok:true,deduplicated:true,reason:"SEMANTIC",merged_into:dup.item.pending_id,similarity:dup.score,item:{...dup.item,public_status:publicStatus(dup.item)},build:BUILD});

    const row={
      request_id:uuid(b.request_id),budget_code:T(b.budget_code,100)||null,
      title,description:T(b.description),category,source_system:sourceSystem,source_ref:sourceRef,
      source_url:T(b.source_url,1200)||null,client_name:T(b.client_name,240)||null,responsible,
      status:"ABERTO",priority:["P0","P1","P2","P3"].includes(T(b.priority,20))?T(b.priority,20):"P2",
      blocked:false,block_reason:"",next_action:T(b.next_action||"Triar e definir próxima ação.",4000),
      next_action_source:T(b.next_action_source||sourceSystem,200),next_action_responsible:T(b.next_action_responsible||responsible||"",180)||null,
      due_at:b.due_at?T(b.due_at,60):null,confirmation_state:"NAO_REQUERIDA",
      created_by:actorName,updated_by:actorName,metadata
    };
    const rows=await db(MASTER,{method:"POST",body:JSON.stringify(row)}); item=rows?.[0]||row;
    const ev=await appendEvent({pending_id:item.pending_id,event_kind:"FOUND",actor_kind:actorKind,actor_code:actorCode,actor_name:actorName,actor_role:actorRole,correlation_id:correlationId,idempotency_key:idem,source_ref:sourceRef,before_data:{},after_data:item,human_gate:false,metadata});
    return J({ok:true,build:BUILD,event:"FOUND",item:{...item,public_status:publicStatus(item)},event_record:ev,human_gate:false});
  }

  const id=T(b.pending_id,80); if(!uuid(id))return J({ok:false,error:"pending_id válido é obrigatório."},400);
  item=await getItem(id); if(!item)return J({ok:false,error:"Pendência não encontrada."},404);
  const before={...item};
  const now=new Date().toISOString();
  const patch:any={updated_by:actorName,updated_at:now,last_movement_at:now};

  if(kind==="STARTED"){patch.status="EM_ANDAMENTO";patch.blocked=false;patch.block_reason="";}
  if(kind==="BLOCKED"){patch.status="BLOQUEADO";patch.blocked=true;patch.block_reason=T(b.block_reason||b.blocker||"Bloqueio identificado.",4000);}
  if(kind==="DEFERRED"){
    const date=T(b.due_at||b.due_date,60);
    const day=date.slice(0,10);
    patch.status=day===tomorrowISO()?"AMANHA":"AGENDADO";
    patch.due_at=date||null; patch.blocked=false;
    if(b.next_action!==undefined)patch.next_action=T(b.next_action,4000);
  }
  if(kind==="COMPLETED"){
    const needsHuman=b.human_gate!==false||["P0","P1"].includes(String(item.priority||""));
    if(needsHuman){patch.status="EM_ANDAMENTO";patch.confirmation_state="REQUER_HUMANO";}
    else{patch.status="CONCLUIDO";patch.confirmation_state="NAO_REQUERIDA";patch.completed_at=now;}
    patch.blocked=false;patch.block_reason="";
  }
  if(kind==="HOMOLOGATED"){
    patch.status="CONCLUIDO";patch.confirmation_state="CONFIRMADA";patch.completed_at=now;patch.blocked=false;patch.block_reason="";
  }
  if(kind==="REOPENED"){
    patch.status="EM_ANDAMENTO";patch.confirmation_state="NAO_REQUERIDA";patch.completed_at=null;patch.blocked=false;patch.block_reason=T(b.block_reason||"",4000);
  }
  if(b.next_action!==undefined)patch.next_action=T(b.next_action,4000);
  if(b.next_action_responsible!==undefined)patch.next_action_responsible=T(b.next_action_responsible,180)||null;
  if(b.responsible!==undefined)patch.responsible=T(b.responsible,180)||null;
  if(b.priority!==undefined&&["P0","P1","P2","P3"].includes(T(b.priority,20)))patch.priority=T(b.priority,20);

  const rows=await db(MASTER+"?pending_id=eq."+encodeURIComponent(item.pending_id),{method:"PATCH",body:JSON.stringify(patch)});
  item=rows?.[0]||{...item,...patch};
  const humanGate=item.confirmation_state==="REQUER_HUMANO";
  const ev=await appendEvent({pending_id:item.pending_id,event_kind:kind,actor_kind:actorKind,actor_code:actorCode,actor_name:actorName,actor_role:actorRole,correlation_id:correlationId,idempotency_key:idem,source_ref:sourceRef,before_data:before,after_data:item,human_gate:humanGate,metadata});
  return J({ok:true,build:BUILD,event:kind,item:{...item,public_status:publicStatus(item)},event_record:ev,human_gate:humanGate});
}
function selftest(){
  const agents:any={
    BIO:{permissions:["READ","CLASSIFY","PROPOSE","CONSOLIDATE"],mode:"HUMAN_SESSION_DELEGATED"},
    BIO_GESTOR:{permissions:["READ","ANALYZE","PROPOSE"],mode:"READ_ONLY"},
    CR_ASSERTIVO:{permissions:["READ","CREATE","UPDATE","BLOCK","DEFER","COMPLETE_PROPOSE"],mode:"HUMAN_SESSION_DELEGATED"}
  };
  const seen=new Set<string>();
  const items:any[]=[];
  function emit(kind:string,b:any){
    if(seen.has(b.key))return{idempotent:true};
    const perm=PERM[kind];
    if(b.agent&&(!agents[b.agent]||agents[b.agent].mode==="READ_ONLY"||!agents[b.agent].permissions.includes(perm)))return{denied:true};
    seen.add(b.key);
    if(kind==="FOUND"){const it={id:crypto.randomUUID(),title:b.title,status:"ABERTO",priority:b.priority||"P2",confirmation:"NAO_REQUERIDA",history:[]};it.history.push({kind,source_ref:b.source_ref});items.push(it);return{item:structuredClone(it)}}
    const it=items.find(x=>x.id===b.id);if(!it)return{missing:true};
    if(kind==="STARTED")it.status="EM_ANDAMENTO";
    if(kind==="BLOCKED")it.status="BLOQUEADO";
    if(kind==="DEFERRED")it.status="AMANHA";
    if(kind==="COMPLETED"){const gate=b.gate!==false||["P0","P1"].includes(it.priority);if(gate){it.status="EM_ANDAMENTO";it.confirmation="REQUER_HUMANO"}else it.status="CONCLUIDO"}
    if(kind==="REOPENED"){it.status="EM_ANDAMENTO";it.confirmation="NAO_REQUERIDA"}
    it.history.push({kind,source_ref:b.source_ref});return{item:structuredClone(it)};
  }
  const a=emit("FOUND",{key:"a",agent:"CR_ASSERTIVO",title:"QA base",priority:"P2",source_ref:"qa:1"});
  const b=emit("STARTED",{key:"b",agent:"CR_ASSERTIVO",id:a.item.id,source_ref:"qa:2"});
  const c=emit("COMPLETED",{key:"c",agent:"CR_ASSERTIVO",id:a.item.id,gate:false,source_ref:"qa:3"});
  const p0=emit("FOUND",{key:"p0",agent:"CR_ASSERTIVO",title:"QA gate",priority:"P0"});
  const gate=emit("COMPLETED",{key:"g",agent:"CR_ASSERTIVO",id:p0.item.id,gate:false});
  const idem1=emit("REOPENED",{key:"idem",agent:"CR_ASSERTIVO",id:a.item.id});
  const idem2=emit("REOPENED",{key:"idem",agent:"CR_ASSERTIVO",id:a.item.id});
  const bioWrite=emit("FOUND",{key:"bio",agent:"BIO",title:"não deve gravar"});
  const gestorWrite=emit("FOUND",{key:"gestor",agent:"BIO_GESTOR",title:"não deve gravar"});
  const checks={
    create:a.item.status==="ABERTO",
    start:b.item.status==="EM_ANDAMENTO",
    complete_no_gate:c.item.status==="CONCLUIDO",
    p0_human_gate:gate.item.confirmation==="REQUER_HUMANO"&&gate.item.status==="EM_ANDAMENTO",
    idempotency:idem1.idempotent!==true&&idem2.idempotent===true,
    bio_write_denied:bioWrite.denied===true,
    bio_gestor_read_only:gestorWrite.denied===true,
    origin_trace:a.item.history[0].source_ref==="qa:1",
    no_production_write:true
  };
  return {ok:Object.values(checks).every(Boolean),build:BUILD,baseline:BASELINE,checks,synthetic_only:true,production_rows_written:0,candidate_rows_written:0};
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:{...BASE,"content-type":"text/plain"}});
  const u=new URL(req.url),api=(u.searchParams.get("api")||"health").toLowerCase();
  try{
    if(api==="health")return J({ok:true,build:BUILD,baseline:BASELINE,mode:"ISOLATED_CANDIDATE",store:[MASTER,EVENTS],agent_bridge:"HUMAN_SESSION_DELEGATED",writes:"AUTH_AND_PERMISSION_REQUIRED",production_router_touched:false});
    if(api==="selftest")return J(selftest());
    if(api==="summary")return summary();
    if(api==="technical-health")return technicalHealth();
    if(api==="board"&&req.method==="GET")return board(req,u);
    if(api==="event"&&req.method==="POST")return handleEvent(req);
    return J({ok:false,error:"Rota não encontrada."},404);
  }catch(e){return J({ok:false,error:e instanceof Error?e.message:String(e),build:BUILD},500)}
});