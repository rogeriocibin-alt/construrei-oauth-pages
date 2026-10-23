import "jsr:@supabase/functions-js/edge-runtime.d.ts";
/* CONSTRU-REI V12 isolated candidate: authorized, idempotent Trello entries.
 * No credentials or bank-balance mutations in the browser.
 * Requires public.cr_finance_v12_claim / finish and RLS-protected ledger.
 */
const SB=(Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co").replace(/\/$/,"");
const ORIGIN="https://rogeriocibin-alt.github.io";
const NAME="CR-CORA-APROVISIONAMENTO-V12-CANDIDATE-20261023";
const CORS={"access-control-allow-origin":ORIGIN,"access-control-allow-headers":"content-type,x-cr-session","access-control-allow-methods":"GET,POST,OPTIONS","vary":"Origin","cache-control":"no-store"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...CORS,"content-type":"application/json; charset=utf-8","x-construrei-build":NAME,"x-content-type-options":"nosniff"}});
function env(k:string){return (Deno.env.get(k)||"").trim()}
function key(){const k=env("SUPABASE_SERVICE_ROLE_KEY");if(k)return k;try{const j=JSON.parse(env("SUPABASE_SECRET_KEYS")||"{}");return String(j.default||j.service_role||Object.values(j)[0]||"")}catch{return ""}}
function headers(k:string){const h:Record<string,string>={"apikey":k,"content-type":"application/json"};if(k.startsWith("eyJ"))h.authorization="Bearer "+k;return h}
async function director(req:Request){
 const token=req.headers.get("x-cr-session")||"";
 if(token.length<12||token.length>400)return false;
 try{
  const r=await fetch(SB+"/functions/v1/central-gestao-api?api=me",{headers:{"x-cr-session":token},signal:AbortSignal.timeout(9000)});
  const x=await r.json();return r.ok&&x?.ok===true&&x.role==="ADMIN_MASTER_ROGERIO";
 }catch{return false}
}
async function rpc(name:string,body:Record<string,unknown>,k:string){
 const r=await fetch(SB+"/rest/v1/rpc/"+name,{method:"POST",headers:headers(k),body:JSON.stringify(body),signal:AbortSignal.timeout(14000)});
 const j=await r.json().catch(()=>({error:"RPC_PARSE_ERROR"}));
 if(!r.ok)throw Error("RPC_"+name+"_"+r.status);
 return j;
}
async function legacy(action:"manual-cora-preview"|"manual-cora-commit",body:Record<string,unknown>,k:string){
 const r=await fetch(SB+"/functions/v1/cr-dashboard-gerencial-v4-manual-cora-candidate-20261007?api="+action,{method:"POST",headers:{"authorization":"Bearer "+k,"apikey":k,"content-type":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(26000)});
 const j=await r.json().catch(()=>({ok:false,error:"LEGACY_PARSE_ERROR"}));
 if(!r.ok||j?.ok!==true)throw Error("LEGACY_"+String(j?.error||r.status).slice(0,90));
 return j;
}
function amount(v:unknown){
 const s=String(v??"").trim().replace(/R\$/ig,"").replace(/\s/g,"");
 if(!/^[0-9][0-9.,]*$/.test(s))return null;
 const n=Number(s.includes(",")?s.replace(/\./g,"").replace(",","."):s);
 const c=Math.round(n*100);
 return Number.isSafeInteger(c)&&c>0&&c<=10000000000?c:null;
}
function clean(body:any){
 const id=String(body?.operation_id||"").trim();
 const caseNo=String(body?.case||"").trim().replace(/\s/g,"");
 const direction=String(body?.direction||"").trim().toUpperCase();
 const date=String(body?.date||"").trim();
 const c=amount(body?.amount);
 const category=String(body?.category||"").trim().slice(0,80);
 const counterparty=String(body?.counterparty||"").trim().slice(0,120);
 const description=String(body?.description||"").trim().slice(0,180);
 const reference=String(body?.reference||"").trim().slice(0,60);
 if(!/^[A-Za-z0-9_-]{12,80}$/.test(id))throw Error("INVALID_OPERATION_ID");
 if(!/^\d{1,5}-?2[456]$/.test(caseNo))throw Error("INVALID_CASE_2024_2026");
 if(!["IN","OUT"].includes(direction))throw Error("INVALID_DIRECTION");
 if(!/^20\d{2}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date+"T12:00:00Z")))throw Error("INVALID_DATE");
 if(!c||!category||(!description&&!reference&&!counterparty))throw Error("MISSING_FINANCIAL_DETAILS");
 return {operation_id:id,case:caseNo,direction,date,amount:String(body.amount),amount_cents:c,category,counterparty,description,reference};
}
async function fingerprint(p:ReturnType<typeof clean>){
 const parts=[p.case.replace(/-/g,""),p.direction,p.date,String(p.amount_cents),p.category.toUpperCase(),p.counterparty.toUpperCase(),p.description.toUpperCase(),p.reference.toUpperCase()];
 const buffer=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(parts.join("|")));
 return Array.from(new Uint8Array(buffer),x=>x.toString(16).padStart(2,"0")).join("");
}
function withMarker(p:ReturnType<typeof clean>){
 const marker="CRV12OP_"+p.operation_id;
 const ref=(p.reference.slice(0,Math.max(0,98-marker.length))+" "+marker).trim();
 return {operation_id:p.operation_id,case:p.case,direction:p.direction,date:p.date,amount:p.amount,category:p.category,counterparty:p.counterparty,description:p.description,reference:ref};
}
/* Visible operation markers are removed only AFTER the ledger is COMMITTED.
 * The operation ID and fingerprint remain in Supabase; failed/uncertain writes
 * preserve their marker to support safe forensic recovery. */
async function tidyCommittedMarker(short:string,tag:string,expectedDesc:string){
 const before=await card(short),desc=String(before.desc||"");
 // Skip if the card changed between confirmation and cleanup (concurrent operator).
 if(desc!==expectedDesc)return false;
 if(!desc.includes(tag))return true;
 if(desc.split(tag).length!==2||!desc.includes(" "+tag)||(desc.match(/CRV12OP_(?:[0-9a-f-]{36}|CORA_[0-9a-f]{64})/g)||[]).length!==1)return false;
 const cleaned=desc.replace(" "+tag,"");
 const ak=env("TRELLO_API_KEY"),tk=env("TRELLO_API_TOKEN");
 if(!ak||!tk)return false;
 // Only the Trello description is changed. No financial figures or card state.
 const url=new URL("https://api.trello.com/1/cards/"+encodeURIComponent(before.id));
 url.searchParams.set("key",ak);url.searchParams.set("token",tk);
 const r=await fetch(url,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({desc:cleaned}),signal:AbortSignal.timeout(12000)});
 if(!r.ok)return false;
 const after=await card(short);
 return String(after.desc||"")===cleaned;
}

function shortLink(url:unknown){
 try{const u=new URL(String(url));const p=u.pathname.split("/").filter(Boolean);return u.protocol==="https:"&&u.hostname==="trello.com"&&p[0]==="c"&&/^[A-Za-z0-9]{6,12}$/.test(p[1]||"")?p[1]:null}catch{return null}
}
async function card(short:string){
 const ak=env("TRELLO_API_KEY"),tk=env("TRELLO_API_TOKEN");
 if(!ak||!tk)throw Error("TRELLO_CREDENTIALS_UNAVAILABLE");
 const u=new URL("https://api.trello.com/1/cards/"+short);
 u.searchParams.set("fields","id,name,desc,shortUrl,idList");
 u.searchParams.set("key",ak);u.searchParams.set("token",tk);
 const r=await fetch(u,{headers:{"accept":"application/json"},signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error("TRELLO_VERIFICATION_"+r.status);
 const j=await r.json();
 if(!/^[0-9a-f]{24}$/.test(String(j.id||"")))throw Error("TRELLO_CARD_ID_INVALID");
 return j;
}

/* Modo bancário isolado: reutiliza o mesmo ledger e a mesma escrita Trello V12,
 * mas verifica os fatos no cache oficial ANTES de qualquer preview ou commit.
 * Não cria outra integração Cora, cron, tabela ou movimento bancário. */
async function bankOperationId(sourceId:string){
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("CR-CORA-APROVISIONAMENTO-V1:"+sourceId));
 return "CORA_"+Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,"0")).join("");
}
async function verifiedBankOrigin(p:ReturnType<typeof clean>,k:string){
 if(!p.operation_id.startsWith("CORA_"))return;
 if(!/^[a-zA-Z0-9_:\-.]{10,60}$/.test(p.reference))throw Error("BANK_REFERENCE_REQUIRED");
 const expected=await bankOperationId(p.reference);
 if(p.operation_id!==expected)throw Error("BANK_OPERATION_ID_MISMATCH");
 const cache=await rpc("cr_cora_cache_dashboard",{p_start:p.date,p_end:p.date},k);
 const rows=Array.isArray(cache?.movements)?cache.movements.filter((m:any)=>String(m.source_id)===p.reference):[];
 if(rows.length!==1)throw Error("BANK_SOURCE_ID_UNAVAILABLE_OR_AMBIGUOUS");
 const bank=rows[0];
 if(!Number.isSafeInteger(Number(bank.amount_centavos))||Number(bank.amount_centavos)!==p.amount_cents)throw Error("BANK_AMOUNT_MISMATCH");
 const bankDirection=String(bank.direction).toLowerCase()==="debit"?"OUT":String(bank.direction).toLowerCase()==="credit"?"IN":"UNKNOWN";
 if(bankDirection!==p.direction)throw Error("BANK_DIRECTION_MISMATCH");
 if(String(bank.occurred_at||"").slice(0,10)!==p.date)throw Error("BANK_DATE_MISMATCH");
}
async function batchBankStatus(raw:any,k:string){
 const given=raw?.ids;
 if(!Array.isArray(given)||given.length>120)return {ok:false,error:"INVALID_BANK_ID_LIST"};
 const ids=Array.from(new Set(given.map((x:any)=>String(x||"").trim())));
 if(ids.some((v:string)=>!/^[a-zA-Z0-9_:\-.]{10,60}$/.test(v)))return {ok:false,error:"INVALID_BANK_ID"};
 const names=await Promise.all(ids.map(bankOperationId));
 const reverse=new Map(names.map((name,i)=>[name,ids[i]]));
 const statuses:Record<string,unknown>={};
 for(let i=0;i<names.length;i+=25){
  const endpoint=new URL(SB+"/rest/v1/cr_finance_v12_operations");
  endpoint.searchParams.set("operation_id","in.("+names.slice(i,i+25).join(",")+")");
  endpoint.searchParams.set("select","operation_id,status,trello_url,error_code,payload");
  const r=await fetch(endpoint,{headers:headers(k),signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw Error("BANK_LEDGER_READ_"+r.status);
  const records=await r.json();
  if(!Array.isArray(records))throw Error("BANK_LEDGER_INVALID");
  for(const record of records){
   const id=reverse.get(String(record.operation_id));
   if(!id)continue;
   const verifiedReference=String(record.payload?.reference||"")===id;
   statuses[id]={
    state:verifiedReference&&record.status==="COMMITTED"?"TRELLO_CONFIRMED": "REVIEW_REQUIRED",
    ledger_status:String(record.status||"UNKNOWN"),
    verified_reference:verifiedReference,
    case:verifiedReference?String(record.payload?.case||""):null,
    trello_url:verifiedReference?record.trello_url:null,
    operation_id:record.operation_id
   };
  }
 }
 return {ok:true,records:statuses,source:"V12_PERSISTENT_LEDGER",count:ids.length};
}

Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(req.headers.get("origin")&&req.headers.get("origin")!==ORIGIN)return reply({ok:false,error:"ORIGIN_DENIED"},403);
 const u=new URL(req.url),action=u.searchParams.get("action")||"health";
 if(action==="health"&&req.method==="GET")return reply({ok:true,candidate:true,build:NAME,trello_writes:"DIRECTOR_ONLY",bank_verification:"SERVER_SIDE_CACHE",status:"LEDGER_PERSISTENT"});
 if(req.method!=="POST"||!["preview","commit","status","bank-status"].includes(action))return reply({ok:false,error:"METHOD_NOT_ALLOWED"},405);
 if(!await director(req))return reply({ok:false,error:"DIRECTOR_SESSION_REQUIRED"},401);
 const k=key();if(!k)return reply({ok:false,error:"SERVICE_AUTH_UNAVAILABLE"},503);
 let raw:any=null;
 try{const t=await req.text();if(t.length>10000)return reply({ok:false,error:"PAYLOAD_TOO_LARGE"},413);raw=JSON.parse(t)}catch{return reply({ok:false,error:"INVALID_JSON"},400)}
 if(action==="bank-status"){
  try{const data=await batchBankStatus(raw,k);return reply(data,data.ok?200:400)}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e)},502)}
 }
 let p:ReturnType<typeof clean>;
 try{p=clean(raw)}catch(e){return reply({ok:false,error:String(e?.message||e)},400)}
 try{await verifiedBankOrigin(p,k)}
 catch(e){return reply({ok:false,error:String((e as Error)?.message||e)},409)}
 const fp=await fingerprint(p),tag="CRV12OP_"+p.operation_id;
 if(action==="commit"){
  const sr=await fetch(SB+"/rest/v1/cr_finance_v12_operations?operation_id=eq."+encodeURIComponent(p.operation_id)+"&select=operation_id,status,trello_url,fingerprint",{headers:headers(k),signal:AbortSignal.timeout(12000)});
  if(!sr.ok)return reply({ok:false,error:"LEDGER_READ_UNAVAILABLE"},503);
  const sj=await sr.json();const prior=Array.isArray(sj)?sj[0]:null;
  if(prior){
   if(prior.fingerprint!==fp)return reply({ok:false,error:"OPERATION_ID_CONFLICT"},409);
   if(prior.status==="COMMITTED")return reply({ok:true,committed:true,duplicate:true,trello_url:prior.trello_url,status:"COMMITTED"});
   return reply({ok:false,error:"OPERATION_NOT_RETRYABLE",status:prior.status},409);
  }
 }
 if(action==="status"){
  const r=await fetch(SB+"/rest/v1/cr_finance_v12_operations?operation_id=eq."+encodeURIComponent(p.operation_id)+"&select=operation_id,status,trello_url,error_code,fingerprint",{headers:headers(k),signal:AbortSignal.timeout(12000)});
  if(!r.ok)return reply({ok:false,error:"LEDGER_READ_"+r.status},502);
  const rows=await r.json();const rec=Array.isArray(rows)?rows[0]:null;
  if(!rec||rec.fingerprint!==fp)return reply({ok:false,error:"NO_MATCHING_OPERATION"},404);
  return reply({ok:true,status:rec.status,trello_url:rec.trello_url,error_code:rec.error_code});
 }
 try{
  const tagged=withMarker(p);
  const pre=await legacy("manual-cora-preview",tagged,k);
  if(pre.duplicate)return reply({ok:false,error:"EXISTING_TRELLO_MARKER_REQUIRES_REVIEW"},409);
  const short=shortLink(pre?.target?.trello_url);
  if(!short)throw Error("TRELLO_LINK_UNTRUSTED");
  const target=await card(short);
  if(String(target.desc||"").includes(tag))return reply({ok:false,error:"OPERATION_MARKER_ALREADY_IN_TRELLO"},409);
  if(action==="preview")return reply({ok:true,preview:true,committed:false,target:pre.target,operation_id:p.operation_id});
  const claim=await rpc("cr_finance_v12_claim",{p_operation_id:p.operation_id,p_fingerprint:fp,p_card_id:target.id,p_payload:{case:p.case,direction:p.direction,date:p.date,amount_cents:p.amount_cents,category:p.category,reference:p.reference}},k);
  if(claim.ok===true&&claim.claimed===false&&claim.status==="COMMITTED")
    return reply({ok:true,committed:true,duplicate:true,trello_url:claim.trello_url,target:pre.target});
  if(claim.ok!==true||claim.claimed!==true)return reply({ok:false,error:claim.error||"OPERATION_ALREADY_CLAIMED",status:claim.status||null},409);
  try{
   const wr=await legacy("manual-cora-commit",tagged,k);
   if(wr.committed!==true)throw Error("TRELLO_ACK_NOT_CONFIRMED");
   const confirmed=await card(short);
   if(!String(confirmed.desc||"").includes(tag))throw Error("TRELLO_MARKER_NOT_CONFIRMED");
   const done=await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,p_status:"COMMITTED",p_trello_url:confirmed.shortUrl||pre.target?.trello_url||null,p_error_code:null},k);
   if(done.ok!==true)throw Error("LEDGER_FINALIZE_UNCONFIRMED");
   let marker_hidden=false;
   try{marker_hidden=await tidyCommittedMarker(short,tag,String(confirmed.desc||""))}catch{/* committed operation remains authoritative */}
   return reply({ok:true,committed:true,duplicate:false,trello_url:confirmed.shortUrl||null,target:pre.target,status:"COMMITTED",marker_hidden});
  }catch(e){
   const error=String(e?.message||e).slice(0,100);
   try{await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,p_status:"REVIEW_REQUIRED",p_trello_url:pre.target?.trello_url||null,p_error_code:error},k)}catch{}
   return reply({ok:false,error:"REVIEW_REQUIRED",detail:error,operation_id:p.operation_id,possible_trello_write:true},409);
  }
 }catch(e){
  return reply({ok:false,error:String(e?.message||e).slice(0,120),possible_trello_write:false},502);
 }
});
