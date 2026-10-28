import "jsr:@supabase/functions-js/edge-runtime.d.ts";
/* CONSTRU-REI R3 — auditoria 2026 somente leitura, sem Cora real ou writes.
   Auth: sessão da diretoria conferida pela Central. Secrets only in Edge. */
const SB=(Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co").replace(/\/$/,"");
const ORIGIN="https://rogeriocibin-alt.github.io";
const CORS={"access-control-allow-origin":ORIGIN,"access-control-allow-headers":"x-cr-session,content-type","access-control-allow-methods":"GET,OPTIONS","cache-control":"no-store","vary":"Origin","x-content-type-options":"nosniff"};
const out=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...CORS,"content-type":"application/json;charset=utf-8"}});
const secret=()=>{let k=(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"").trim();if(k)return k;try{const j=JSON.parse((Deno.env.get("SUPABASE_SECRET_KEYS")||"{}"));return String(j.default||j.service_role||"").trim()}catch{return ""}};
async function director(req){
 const value=req.headers.get("x-cr-session")||"";
 if(value.length<12||value.length>500)return false;
 try{
  const r=await fetch(SB+"/functions/v1/central-gestao-api?api=me",{headers:{"x-cr-session":value},signal:AbortSignal.timeout(9000)});
  const j=await r.json().catch(()=>null);
  return r.ok&&j?.ok===true&&j?.role==="ADMIN_MASTER_ROGERIO";
 }catch{return false}
}
async function rows(table,select,order=""){
 const key=secret();if(!key)throw Error("SERVICE_READ_CREDENTIAL_UNAVAILABLE");
 const url=new URL(SB+"/rest/v1/"+table);url.searchParams.set("select",select);url.searchParams.set("limit","1000");
 if(order)url.searchParams.set("order",order);
 const res=await fetch(url,{headers:{"authorization":"Bearer "+key,"apikey":key,accept:"application/json"},signal:AbortSignal.timeout(16000)});
 if(!res.ok)throw Error("SOURCE_"+table+"_HTTP_"+res.status);
 const data=await res.json();if(!Array.isArray(data)||data.length>=1000)throw Error("SOURCE_"+table+"_PAGINATION_REQUIRED");
 return data;
}
const cents=x=>x===null||x===undefined||x===""?null:Number.isSafeInteger(Number(x))?Number(x):null;
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(req.headers.get("origin")&&req.headers.get("origin")!==ORIGIN)return out({ok:false,error:"ORIGIN_RESTRICTED"},403);
 if(req.method!=="GET")return out({ok:false,error:"READ_ONLY"},405);
 if(!await director(req))return out({ok:false,error:"DIRECTOR_SESSION_REQUIRED"},401);
 if(new URL(req.url).searchParams.get("year")!=="2026")return out({ok:false,error:"ONLY_2026_SNAPSHOT"},400);
 try{
  const result=await Promise.allSettled([
   rows("cr_finance_2026_work_extract_v1","work_code,validation_state,closed_cents,cost_cents,declared_profit_cents,extracted_at"),
   rows("cr_cora_bank_annotations_v12","beneficiary,direction,amount_cents,bank_date,created_at"),
   rows("cr_finance_2026_period_send_registry_v12","period_key,status,updated_at"),
   rows("cr_finance_2026_work_card_source_v1","import_cutoff,last_synced_at,work_code")
  ]);
  if(result[0].status!=="fulfilled")throw Error("WORK_SOURCE_READ_FAILED");
  const items=result[0].value;
  const breakdown={},review=[],codes=new Set();
  let fullyComputable=0,aggregateAbsGap=0,duplicateCardEntries=0;const duplicateExamples=[];
  for(const r of items){
   const status=String(r.validation_state||"UNKNOWN").slice(0,60);
   breakdown[status]=(breakdown[status]||0)+1;
   const id=String(r.work_code||"").trim();
   if(!/^\d{1,5}-26$/.test(id))throw Error("WORK_IDENTITY_INVALID");
   if(codes.has(id)){duplicateCardEntries++;if(duplicateExamples.length<30)duplicateExamples.push(id)}
   else codes.add(id);
   const gross=cents(r.closed_cents),cost=cents(r.cost_cents),profit=cents(r.declared_profit_cents);
   let gap=null;if(gross!==null&&cost!==null&&profit!==null){gap=gross-cost-profit;fullyComputable++;aggregateAbsGap+=Math.abs(gap)}
   if(status!=="BALANCED"&&review.length<100)review.push({work_code:id,status,gap_cents:gap});
  }
  const annotations=result[1].status==="fulfilled"?result[1].value:null;
  const byPerson={},annotationCoverage={count:0,total_out_cents:0,total_in_cents:0};
  if(annotations)for(const a of annotations){
   const name=String(a.beneficiary||"Sem beneficiário definido").trim().slice(0,100)||"Sem beneficiário definido";
   const amount=cents(a.amount_cents),direction=String(a.direction||"").toUpperCase();
   if(amount===null||amount<0)continue;
   if(direction==="OUT"){annotationCoverage.total_out_cents+=amount;byPerson[name]=(byPerson[name]||0)+amount}
   else if(direction==="IN")annotationCoverage.total_in_cents+=amount;
   annotationCoverage.count++;
  }
  const registry=result[2].status==="fulfilled"?result[2].value:null;
  const periods={};if(registry)for(const r of registry){const s=String(r.status||"UNKNOWN");periods[s]=(periods[s]||0)+1}
  const stage=result[3].status==="fulfilled"?result[3].value:null;
  const asof=(stage||[]).map(x=>String(x.last_synced_at||"")).sort().at(-1)||null;
  const cutoff=(stage||[]).map(x=>String(x.import_cutoff||"")).sort().at(-1)||null;
  return out({ok:true,year:2026,source:"SUPABASE_TRELLO_2026_IMPORT_NOT_LIVE_TRELLO",
   retrieved_at:new Date().toISOString(),source_last_synced_at:asof,source_import_cutoff:cutoff,
   works:{count:items.length,unique_codes:codes.size,duplicate_card_entries:duplicateCardEntries,duplicate_examples:duplicateExamples,states:breakdown,complete_arithmetic:fullyComputable,abs_gap_cents:aggregateAbsGap,needs_review:review},
   annotations:annotations?{...annotationCoverage,by_beneficiary_out_cents:byPerson,proof_of_bank_payment:false,bank_statement:false}:null,
   period_registry:registry?{count:registry.length,status:periods}:null,
   source_availability:{works:true,annotations:!!annotations,period_registry:!!registry,source_stage:!!stage},
   warnings:["Cora annotacoes nao comprovam baixa ou saque","Espelho importado nao equivale ao Trello ao vivo","Nao editar historico sem prova","Esta API somente consulta, nao movimenta saldos ou obras"],
   no_writes:true,bank_proof:false});
 }catch(e){return out({ok:false,error:String(e?.message||e).slice(0,125)},503)}
});