import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB=Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co";
const AUTH=SB+"/functions/v1/central-gestao-api";
let SRK="";
try{
  const k=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");
  SRK=k.default||k.service_role||Object.values(k)[0]||"";
}catch{}
if(!SRK) SRK=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";

const BUILD="CR-PENDENCIAS-VIVAS-V2-CANDIDATE-20261002";
const BASE={
  "cache-control":"no-store, no-cache, must-revalidate, max-age=0",
  "pragma":"no-cache",
  "access-control-allow-origin":"*",
  "access-control-allow-headers":"content-type,x-cr-session,x-cr-key,authorization",
  "access-control-allow-methods":"GET,POST,OPTIONS",
  "content-type":"application/json; charset=utf-8",
  "x-construrei-build":BUILD,
  "x-construrei-candidate":"true"
};

const OPEN=new Set(["Não iniciado","Aguardando","Em andamento","Bloqueado","Em validação"]);
const DONE=new Set(["Concluído","Cancelado"]);
const VALID_KINDS=new Set(["FOUND","STARTED","BLOCKED","DEFERRED","COMPLETED","HOMOLOGATED","REOPENED"]);
const AGENTS=new Set(["Bio","Bio Gestor","CR Assertivo","Sistema"]);

function J(data:any,status=200){return new Response(JSON.stringify(data),{status,headers:BASE})}
function T(v:any,n=4000){return String(v??"").replace(/[<>]/g,"").slice(0,n)}
function norm(s:any){return T(s,500).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()}
function tokens(s:any){return new Set(norm(s).split(" ").filter(x=>x.length>2))}
function sim(a:any,b:any){
  const A=tokens(a),B=tokens(b); if(!A.size||!B.size)return 0;
  let i=0; for(const x of A)if(B.has(x))i++;
  return i/(A.size+B.size-i);
}
function publicStatus(x:any){
  const s=String(x.status||"");
  if(s==="Não iniciado")return "PENDENTE";
  if(s==="Em andamento")return "EM ANDAMENTO";
  if(s==="Bloqueado")return "BLOQUEADA";
  if(s==="Em validação")return "EXECUÇÃO CONCLUÍDA • AGUARDANDO HOMOLOGAÇÃO";
  if(s==="Concluído")return "CONCLUÍDA";
  if(s==="Cancelado")return "HISTÓRICO";
  if(s==="Aguardando"){
    const d=x.due_date?new Date(String(x.due_date)+"T23:59:59-03:00"):null;
    return d&&d.getTime()>Date.now()?"ADIADA / AMANHÃ":"PENDENTE";
  }
  return s.toUpperCase()||"PENDENTE";
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
  if(!r.ok)throw Error("DB "+r.status+": "+txt.slice(0,400));
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
async function audit(itemId:string,actor:string,action:string,oldData:any,newData:any){
  return db("cc_changes",{method:"POST",body:JSON.stringify({
    item_id:itemId,editor:actor,action,old_data:oldData||null,new_data:newData||null
  })});
}
async function evidence(item:any,actor:string,kind:string,b:any,auth:any){
  const title=T(b?.evidence?.title||b?.evidence_title||("Evento "+kind+" • "+item.id),300);
  const desc=T(b?.evidence?.description||b?.description||b?.note||"",4000)||null;
  const url=T(b?.evidence?.external_url||b?.external_url||"",1200)||null;
  const actorHuman=!AGENTS.has(actor);
  const row={
    item_id:item.id,
    scope:"PENDENCIA_VIVA_V2_CANDIDATE",
    evidence_type:T(b?.evidence?.type||"EVENT",40),
    title,description:desc,external_url:url,
    actor_kind:actorHuman?"HUMAN":"AGENT",
    actor_name:actor,
    actor_role:actorHuman?String(auth?.role||"HUMAN"):"AGENT_AUTOMATION",
    created_by_client_id:null,
    data_classification:"EVIDENCIA_OPERACIONAL_RESTRITA",
    review_status:kind==="HOMOLOGATED"?"HOMOLOGADO":"REGISTRADO_PARA_REVISAO",
    append_only_locked:true,
    metadata:{
      source:BUILD,kind,
      idempotency_key:T(b?.idempotency_key,200),
      commit:T(b?.commit,120),
      branch:T(b?.branch,180),
      module:T(b?.module||b?.area,100),
      source_ref:T(b?.source_ref,500)
    }
  };
  const rows=await db("cr_operational_evidence",{method:"POST",body:JSON.stringify(row)});
  await db("cc_items?id=eq."+encodeURIComponent(item.id),{method:"PATCH",body:JSON.stringify({
    last_evidence_at:new Date().toISOString(),updated_by:actor,updated_at:new Date().toISOString()
  })}).catch(()=>{});
  return rows?.[0]||row;
}
async function already(idem:string){
  if(!idem)return null;
  const rows=await db("cc_changes?action=in.(agent_event,agent_event_deduplicated)&select=id,item_id,new_data,created_at&order=created_at.desc&limit=1000");
  return rows.find((x:any)=>String(x?.new_data?.idempotency_key||"")===idem)||null;
}
async function findDup(title:string,area:string){
  const rows=await db("cc_items?select=id,title,area,status,priority,owner,operational_owner,updated_at&order=updated_at.desc&limit=500");
  const open=rows.filter((x:any)=>OPEN.has(String(x.status||"")) && (!area||String(x.area||"")===area));
  let best:any=null,score=0;
  for(const x of open){
    const s=norm(x.title)===norm(title)?1:sim(x.title,title);
    if(s>score){score=s;best=x}
  }
  return score>=0.66?{item:best,score}:null;
}
async function readBoard(req:Request,u:URL){
  const auth=await who(req); if(!auth)return J({ok:false,error:"Autenticação necessária."},401);
  const showHistory=u.searchParams.get("history")==="1";
  const items=await db("cc_items?select=*&order=sequence_order.asc,sort_order.asc,updated_at.desc&limit=500");
  const changes=await db("cc_changes?select=id,item_id,editor,action,new_data,created_at&order=created_at.desc&limit=1000");
  const ev=await db("cr_operational_evidence?select=evidence_id,item_id,title,evidence_type,actor_name,actor_role,review_status,external_url,metadata,created_at&order=created_at.desc&limit=2000");
  const evCount:any={}; for(const e of ev)evCount[e.item_id]=(evCount[e.item_id]||0)+1;
  const active=items.filter((x:any)=>showHistory||!DONE.has(String(x.status||""))).map((x:any)=>({
    ...x,public_status:publicStatus(x),evidence_count:evCount[x.id]||0,
    last_change:changes.find((c:any)=>c.item_id===x.id)||null
  }));
  const count=(s:string)=>active.filter((x:any)=>x.public_status===s).length;
  return J({ok:true,build:BUILD,mode:"ISOLATED_CANDIDATE",profile:auth.profile,role:auth.role,
    metrics:{
      pending:count("PENDENTE"),
      in_progress:count("EM ANDAMENTO"),
      blocked:count("BLOQUEADA"),
      deferred:count("ADIADA / AMANHÃ"),
      awaiting_homologation:count("EXECUÇÃO CONCLUÍDA • AGUARDANDO HOMOLOGAÇÃO"),
      completed_today:items.filter((x:any)=>String(x.status)==="Concluído"&&String(x.updated_at||"").slice(0,10)===new Date().toISOString().slice(0,10)).length,
      overdue:active.filter((x:any)=>x.due_date&&new Date(x.due_date+"T23:59:59-03:00").getTime()<Date.now()).length
    },
    items:active
  });
}
async function handleEvent(req:Request){
  const auth=await who(req); if(!auth)return J({ok:false,error:"Autenticação necessária."},401);
  const b=await req.json().catch(()=>({}));
  const kind=T(b.kind,40).toUpperCase(); if(!VALID_KINDS.has(kind))return J({ok:false,error:"Evento inválido."},400);
  const idem=T(b.idempotency_key,200); if(!idem)return J({ok:false,error:"idempotency_key é obrigatória."},400);
  const prior=await already(idem); if(prior)return J({ok:true,idempotent:true,reused:true,item_id:prior.item_id,change_id:prior.id,build:BUILD});
  const actor=T(b.actor||auth.profile||"Sistema",100);
  let item:any=null,dedup:any=null;
  if(kind==="FOUND"&&!b.item_id){
    const title=T(b.title,300); if(!title)return J({ok:false,error:"title é obrigatório para FOUND."},400);
    const area=T(b.area||"CENTRAL",80);
    dedup=await findDup(title,area);
    if(dedup){
      item=dedup.item;
      await audit(item.id,actor,"agent_event_deduplicated",null,{
        idempotency_key:idem,kind,source_title:title,merged_into:item.id,similarity:dedup.score,build:BUILD
      });
      const ev=await evidence(item,actor,kind,{...b,note:"Evento semelhante condensado na pendência existente."},auth);
      return J({ok:true,deduplicated:true,merged_into:item.id,similarity:dedup.score,item,evidence:ev,build:BUILD},200);
    }
    const id="PV2-"+Date.now().toString(36).toUpperCase()+"-"+crypto.randomUUID().slice(0,6).toUpperCase();
    const row={
      id,section:T(b.section||"task",50),item_type:"pendencia_viva",
      area, title,description:T(b.description),owner:T(b.owner||"",180),
      operational_owner:T(b.operational_owner||actor,180),priority:T(b.priority||"P1",20),
      status:"Não iniciado",note:T(b.note),next_step:T(b.next_step||"Triar pendência criada automaticamente.",4000),
      blocker:"",updated_by:actor,environment:T(b.environment||"CANDIDATE",80),
      version_label:BUILD,due_date:b.due_date?T(b.due_date,40):null
    };
    const rows=await db("cc_items",{method:"POST",body:JSON.stringify(row)}); item=rows?.[0]||row;
  }else{
    const id=T(b.item_id,120); if(!id)return J({ok:false,error:"item_id é obrigatório."},400);
    item=(await db("cc_items?id=eq."+encodeURIComponent(id)+"&select=*&limit=1"))?.[0];
    if(!item)return J({ok:false,error:"Pendência não encontrada."},404);
  }

  const old={...item};
  const patch:any={updated_by:actor,updated_at:new Date().toISOString()};
  if(kind==="STARTED"){patch.status="Em andamento";patch.blocker="";}
  if(kind==="BLOCKED"){patch.status="Bloqueado";patch.blocker=T(b.blocker||"Bloqueio identificado pelo agente.",4000)}
  if(kind==="DEFERRED"){patch.status="Aguardando";if(b.due_date)patch.due_date=T(b.due_date,40);patch.next_step=T(b.next_step||item.next_step||"Retomar na data programada.",4000)}
  if(kind==="COMPLETED"){
    const needsHuman=b.human_gate!==false||["P0","P1"].includes(String(item.priority||""));
    patch.status=needsHuman?"Em validação":"Concluído";patch.blocker="";
    patch.note=T(b.note||item.note,4000);
  }
  if(kind==="HOMOLOGATED"){
    if(auth.role!=="ADMIN_MASTER_ROGERIO")return J({ok:false,error:"Homologação exige perfil Diretor."},403);
    patch.status="Concluído";patch.blocker="";patch.approval_ok=true;
  }
  if(kind==="REOPENED"){patch.status="Em andamento";patch.blocker=T(b.blocker||"",4000)}
  if(b.next_step!==undefined)patch.next_step=T(b.next_step,4000);
  if(b.owner!==undefined)patch.owner=T(b.owner,180);
  if(b.priority!==undefined)patch.priority=T(b.priority,20);

  if(Object.keys(patch).length>2){
    const rows=await db("cc_items?id=eq."+encodeURIComponent(item.id),{method:"PATCH",body:JSON.stringify(patch)});
    item=rows?.[0]||{...item,...patch};
  }
  const ev=await evidence(item,actor,kind,b,auth);
  await audit(item.id,actor,"agent_event",old,{
    ...item,idempotency_key:idem,kind,build:BUILD,evidence_id:ev?.evidence_id||null
  });
  return J({ok:true,build:BUILD,event:kind,item:{...item,public_status:publicStatus(item)},evidence:ev,human_gate:item.status==="Em validação"});
}
function selftest(){
  type It={id:string,title:string,status:string,priority:string,area:string,due_date?:string,history:any[]};
  let seq=0;
  const items:It[]=[];
  const seen=new Set<string>();
  const snap=(it:It)=>({...it,history:it.history.map(x=>({...x}))});
  function emit(kind:string,b:any){
    const key=String(b.idempotency_key||"");
    if(seen.has(key)){
      const it=items.find(x=>x.id===b.item_id)||items[0];
      return {ok:true,idempotent:true,item:it?snap(it):null};
    }
    let it=items.find(x=>x.id===b.item_id);
    if(kind==="FOUND"&&!it){
      const dup=items.find(x=>x.area===b.area&&sim(x.title,b.title)>=0.66&&!["Concluído","Cancelado"].includes(x.status));
      if(dup){
        dup.history.push({key,kind,dedup:true,source_ref:b.source_ref||null});
        seen.add(key);
        return {ok:true,deduplicated:true,merged_into:dup.id,item:snap(dup)};
      }
      it={id:"QA-"+(++seq),title:b.title,status:"Não iniciado",priority:b.priority||"P1",area:b.area||"CENTRAL",history:[]};
      items.push(it);
    }
    if(!it)throw Error("item missing");
    if(kind==="STARTED")it.status="Em andamento";
    if(kind==="BLOCKED")it.status="Bloqueado";
    if(kind==="DEFERRED"){it.status="Aguardando";it.due_date=b.due_date}
    if(kind==="COMPLETED")it.status=(b.human_gate!==false||["P0","P1"].includes(it.priority))?"Em validação":"Concluído";
    if(kind==="HOMOLOGATED")it.status="Concluído";
    if(kind==="REOPENED")it.status="Em andamento";
    it.history.push({key,kind,status:it.status,source_ref:b.source_ref||null});
    seen.add(key);
    return {ok:true,item:snap(it)};
  }

  const a=emit("FOUND",{title:"QA criar pendência manual",area:"CENTRAL",priority:"P2",idempotency_key:"A",source_ref:"manual"});
  const b=emit("STARTED",{item_id:a.item.id,idempotency_key:"B",source_ref:"agent-run-1"});
  const c=emit("COMPLETED",{item_id:a.item.id,human_gate:false,idempotency_key:"C",source_ref:"commit:abc"});
  const d0=emit("FOUND",{title:"QA bloqueio técnico",area:"APP",priority:"P1",idempotency_key:"D0"});
  const d=emit("BLOCKED",{item_id:d0.item.id,idempotency_key:"D",source_ref:"dependency:api"});
  const e0=emit("FOUND",{title:"QA atividade amanhã",area:"CENTRAL",priority:"P1",idempotency_key:"E0"});
  const e=emit("DEFERRED",{item_id:e0.item.id,due_date:"2026-10-03",idempotency_key:"E",source_ref:"agenda:tomorrow"});
  const f=emit("FOUND",{title:"QA atividade amanha",area:"CENTRAL",priority:"P1",idempotency_key:"F",source_ref:"duplicate-source"});
  const g0=emit("FOUND",{title:"QA reabrir item concluído",area:"APP",priority:"P2",idempotency_key:"G0",source_ref:"manual"});
  const g1=emit("COMPLETED",{item_id:g0.item.id,human_gate:false,idempotency_key:"G1",source_ref:"commit:def"});
  const g=emit("REOPENED",{item_id:g0.item.id,idempotency_key:"G2",source_ref:"bug:reopened"});
  const h0=emit("FOUND",{title:"QA gate humano",area:"CENTRAL",priority:"P0",idempotency_key:"H0"});
  const h1=emit("COMPLETED",{item_id:h0.item.id,idempotency_key:"H1",source_ref:"agent:done"});
  const idemA=emit("STARTED",{item_id:e0.item.id,idempotency_key:"IDEMP",source_ref:"agent:retry"});
  const idemB=emit("STARTED",{item_id:e0.item.id,idempotency_key:"IDEMP",source_ref:"agent:retry"});
  const checks={
    A_create:a.item.status==="Não iniciado",
    B_auto_started:b.item.status==="Em andamento",
    C_auto_completed:c.item.status==="Concluído",
    D_blocked:d.item.status==="Bloqueado",
    E_deferred:e.item.status==="Aguardando"&&e.item.due_date==="2026-10-03",
    F_dedup:f.deduplicated===true&&f.merged_into===e0.item.id,
    G_reopened:g1.item.status==="Concluído"&&g.item.status==="Em andamento",
    H_history:g.item.history.length===3,
    I_origin_trace:g.item.history.some(x=>x.source_ref==="commit:def")&&g.item.history.some(x=>x.source_ref==="bug:reopened"),
    human_gate:h1.item.status==="Em validação",
    idempotency:idemA.idempotent!==true&&idemB.idempotent===true
  };
  return {ok:Object.values(checks).every(Boolean),build:BUILD,checks,synthetic_only:true,production_rows_written:0,synthetic_items:items.map(x=>({id:x.id,title:x.title,status:x.status,events:x.history.length}))};
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:{...BASE,"content-type":"text/plain"}});
  const u=new URL(req.url),api=(u.searchParams.get("api")||"health").toLowerCase();
  try{
    if(api==="health")return J({ok:true,build:BUILD,mode:"ISOLATED_CANDIDATE",writes:"AUTH_REQUIRED",production_router_touched:false});
    if(api==="selftest")return J(selftest());
    if(api==="board"&&req.method==="GET")return readBoard(req,u);
    if(api==="event"&&req.method==="POST")return handleEvent(req);
    return J({ok:false,error:"Rota não encontrada."},404);
  }catch(e){return J({ok:false,error:e instanceof Error?e.message:String(e),build:BUILD},500)}
});