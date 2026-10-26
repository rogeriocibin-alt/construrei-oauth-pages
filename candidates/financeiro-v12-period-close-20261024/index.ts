import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// CONSTRU-REI | candidato isolado. Escrita somente após prévia e confirmação de diretor.
const SB=(Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co").replace(/\/$/,"");
const HOST="https://rogeriocibin-alt.github.io",API="https://api.trello.com/1";
const FIN="6952fd5947e9864456eab14a",WORK="6974b24c16d17ca76351a950";
const CORS={"access-control-allow-origin":HOST,"access-control-allow-headers":"content-type,x-cr-session","access-control-allow-methods":"GET,POST,OPTIONS","cache-control":"no-store"};
const ans=(x:any,status=200)=>new Response(JSON.stringify(x),{status,headers:{...CORS,"content-type":"application/json"}});
async function director(req:Request){
 const token=req.headers.get("x-cr-session")||"";if(token.length<12||token.length>400)return false;
 try{const r=await fetch(SB+"/functions/v1/central-gestao-api?api=me",{headers:{"x-cr-session":token},signal:AbortSignal.timeout(10000)});const j=await r.json();return r.ok&&j.ok&&j.role==="ADMIN_MASTER_ROGERIO"}catch{return false}
}
async function trello(path:string,method="GET",payload:any=null){
 const key=(Deno.env.get("TRELLO_API_KEY")||"").trim(),token=(Deno.env.get("TRELLO_API_TOKEN")||"").trim();
 if(!key||!token)throw Error("TRELLO_AUTH_UNAVAILABLE");
 const u=new URL(API+path);u.searchParams.set("key",key);u.searchParams.set("token",token);
 const r=await fetch(u,{method,headers:{"content-type":"application/json"},body:payload?JSON.stringify(payload):undefined,signal:AbortSignal.timeout(17000)});
 if(!r.ok)throw Error("TRELLO_"+method+"_"+r.status);
 return r.json();
}
async function acertos(){
 // O endpoint upstream exige verify_jwt=true. A sessão do diretor já foi validada
 // na entrada; esta chamada servidor->servidor usa uma credencial de serviço
 // mantida exclusivamente no ambiente da Edge, nunca enviada ao navegador.
 const key=(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"").trim();
 if(!key)throw Error("ACERTO_LIVE_SERVICE_AUTH_UNAVAILABLE");
 const r=await fetch(SB+"/functions/v1/cr-dashboard-gerencial-v4-manual-cora-candidate-20261007?api=acerto-live&gc=0",{
  headers:{Authorization:"Bearer "+key},signal:AbortSignal.timeout(30000)
 });
 if(r.status===401||r.status===403)throw Error("ACERTO_LIVE_SERVICE_AUTH_REJECTED");
 if(!r.ok)throw Error("ACERTO_LIVE_HTTP_"+r.status);const j=await r.json();
 if(!j.ok||!Array.isArray(j.items))throw Error("ACERTO_LIVE_INVALID");return j.items;
}
const months=["","JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
function input(b:any){
 const start=String(b.start||""),end=String(b.end||""),t1=Date.parse(start+"T12:00:00Z"),t2=Date.parse(end+"T12:00:00Z");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||!Number.isFinite(t1)||!Number.isFinite(t2)||new Date(t1).toISOString().slice(0,10)!==start||new Date(t2).toISOString().slice(0,10)!==end||t1>t2||t2-t1>45*86400000||!start.startsWith("2026-")||!end.startsWith("2026-"))throw Error("PERIODO_INVALIDO");
 const cases=Array.isArray(b.cases)?[...new Set(b.cases.map((x:any)=>String(x).trim()))].sort((x:any,y:any)=>x.localeCompare(y,undefined,{numeric:true})):[];
 if(!cases.length||cases.length>40||cases.some((x:any)=>!/^\d{1,5}-26$/.test(x)))throw Error("OBRAS_INVALIDAS");
 return {start,end,cases,month:Number(end.slice(5,7)),monthName:months[Number(end.slice(5,7))]};
}
function sum(a:any[],f:(x:any)=>number){return a.reduce((z,x)=>z+Number(f(x)||0),0)}
function brl(x:number){return "R$ "+(x/100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}
function normal(x:string){return x.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase()}
function hasCase(desc:string,c:string){return new RegExp("(^|[^0-9])"+c+"(?![0-9])","i").test(desc)}
function marker(p:any){return "CR-ACERTO-PERIODO|"+p.start+"_"+p.end+"|"+p.cases.join(",")}
async function sha(s:string){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,"0")).join("")}
// Trello limits action reads to 1000 records per request. Continue until exhausted;
 // never infer that missing older comments imply a clean, unsent month.
async function readAllMonthCommentTexts(cardId:string){
 const out:string[]=[],seen=new Set<string>();
 let before="";
 for(let page=0;page<30;page++){
  const uri="/cards/"+cardId+"/actions?filter=commentCard&limit=1000"+(before?"&before="+encodeURIComponent(before):"");
  const batch=await trello(uri);
  if(!Array.isArray(batch))throw Error("MONTH_COMMENTS_UNAVAILABLE");
  for(const action of batch){
   const id=String(action?.id||"");
   if(!/^[a-f0-9]{24}$/i.test(id)||seen.has(id)||typeof action?.data?.text!=="string")
    throw Error("MONTH_COMMENT_INVALID_OR_REPEATED");
   seen.add(id);out.push(action.data.text);
  }
  if(batch.length<1000)return out;
  const cursor=String(batch[batch.length-1]?.id||"");
  if(!cursor||cursor===before)throw Error("MONTH_COMMENT_CURSOR_INVALID");
  before=cursor;
 }
 throw Error("MONTH_COMMENTS_PAGINATION_INCOMPLETE");
}
/* A director-only READ-ONLY diagnostic when a financial preview cannot be homologated.
 * It never creates a fingerprint or permits commit. Information is explicitly provisional. */
async function diagnosticPreview(body:any){
 const p=input(body);
 const live=await acertos();
 const rows=p.cases.map((caseNo:string)=>{
  const all=live.filter((r:any)=>r.case===caseNo);
  const r=all.length===1?all[0]:null;
  const vals=r?[r.base_cents,r.cost_cents,r.profit_cents,r.rateio?.fabricio_cents,r.rateio?.eder_cents,
    r.rateio?.rogerio_cents,r.rateio?.gabi_cents,r.rateio?.capital_giro_cents]:[];
  const valid=r&&vals.every(x=>Number.isSafeInteger(x))&&r.base_cents>0&&r.base_cents-r.cost_cents===r.profit_cents&&
    r.rateio.fabricio_cents+r.rateio.eder_cents+r.rateio.rogerio_cents+r.rateio.gabi_cents+r.rateio.capital_giro_cents===r.profit_cents;
  return {case:caseNo,found:!!r,unique:all.length===1,source:"AG_ACERTO_TRELLO_LIVE",
    base_cents:valid?r.base_cents:null,cost_cents:valid?r.cost_cents:null,profit_cents:valid?r.profit_cents:null,
    valid_for_arithmetic:!!valid,issues:(Array.isArray(r?.issues)?r.issues:[]).map((x:any)=>String(x).slice(0,100)).slice(0,15),
    trello_url:r?.trello_url||null};
 });
 return {ok:true,diagnostic:true,period:p,rows,writes:false,preview_validated:false,can_commit:false,
   note:"CONSULTA NAO HOMOLOGADA: exige previas financeiras regulares e confirmacao posterior."};
}
// Reuse the existing, guarded Capital de Giro period-close service. It owns the
// unique card reservation, balance reconciliation and bank-neutral credit record.
// This connector never writes Cora or creates a separate CG implementation.
// Service-role-only operation journal. Prevents two simultaneous confirmations for
// the same cutoff. An ambiguous failure remains REVIEW_REQUIRED, never auto-retried.
async function periodRegistry(action:string,payload:any){
 const key=(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"").trim();
 if(!key)throw Error("PERIOD_REGISTRY_SERVICE_UNAVAILABLE");
 const rpc=action==="claim"?"cr_finance_v12_period_claim":"cr_finance_v12_period_checkpoint";
 const r=await fetch(SB+"/rest/v1/rpc/"+rpc,{method:"POST",
  headers:{"apikey":key,Authorization:"Bearer "+key,"content-type":"application/json"},
  body:JSON.stringify(payload),signal:AbortSignal.timeout(14000)});
 if(!r.ok)throw Error("PERIOD_REGISTRY_HTTP_"+r.status);
 const result=await r.json();
 if(!result?.ok)throw Error(String(result?.error||"PERIOD_REGISTRY_DENIED"));
 return result;
}
async function periodRegistryLookup(key:string){
 const token=(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"").trim();
 if(!token)throw Error("PERIOD_REGISTRY_SERVICE_UNAVAILABLE");
 const u=new URL(SB+"/rest/v1/cr_finance_2026_period_send_registry_v12");
 u.searchParams.set("period_key","eq."+key);
 u.searchParams.set("select","period_key,fingerprint,status");
 const r=await fetch(u,{headers:{"apikey":token,Authorization:"Bearer "+token},signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error("PERIOD_REGISTRY_READ_"+r.status);
 const rows=await r.json();
 if(!Array.isArray(rows)||rows.length>1)throw Error("PERIOD_REGISTRY_INTEGRITY");
 return rows[0]||null;
}
async function cgPeriodService(action:string,p:any,session:string,fingerprint?:string){
 if(!session||session.length<12)throw Error("CG_DIRECTOR_SESSION_MISSING");
 const body:any={start:p.start,end:p.end};
 if(fingerprint)body.fingerprint=fingerprint;
 const url=SB+"/functions/v1/cr-trello-capital-giro-v1?action="+action;
 const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json","x-cr-session":session},
  body:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
 const j=await r.json().catch(()=>null);
 if(!r.ok||!j?.ok)throw Error("CAPITAL_PERIOD_SERVICE_"+String(j?.error||r.status));
 return j;
}
async function cgCreationPlan(p:any,rows:any[],expected:number,session:string){
 const preview=await cgPeriodService("close-preview",p,session);
 if(preview.no_write!==true||preview.preview!==true||!(/^[0-9a-f]{64}$/i.test(String(preview.fingerprint||""))))
  throw Error("CG_PREVIEW_UNVERIFIED");
 if(preview.works!==rows.length||preview.capital_cents!==expected)
  throw Error("CG_PREVIEW_DIFFERENT_ACERTO");
 // Same amount and count are not enough: verify EXACT work IDs from the canonical
 // Trello acerto the capital service will consume.
 const source=await trello("/cards/6ab6f27658e42565c7413b7b?fields=id,desc,shortUrl");
 const description=String(source.desc||""),pivot=description.lastIndexOf("📋 RESUMO");
 if(pivot<0||source.shortUrl!==preview.source_url)throw Error("CG_SOURCE_MISMATCH");
 const ids=[...description.slice(0,pivot).matchAll(/\b(\d{1,5}-2[456])\s*\|/g)].map(x=>x[1]).sort();
 const want=rows.map((x:any)=>x.case).sort();
 if(ids.length!==want.length||ids.some((x:string,i:number)=>x!==want[i]))
  throw Error("CG_SOURCE_WORKS_DIFFER");
 return {fingerprint:preview.fingerprint,capital_cents:preview.capital_cents,
  works:preview.works,source_url:preview.source_url,case_ids:ids};
}
async function gather(body:any,session:string=""){
 const p=input(body);
 if(!p.monthName)throw Error("MES_INVALIDO");
 // Cross-month cuts are valid: financial competence is always the month of the end date.
 // Each distinct work ID may be sent once, regardless of overlap between date ranges.
 const [live,finCards,workLists]=await Promise.all([acertos(),trello("/lists/"+FIN+"/cards?fields=id,name,desc,shortUrl"),trello("/boards/"+WORK+"/lists?fields=id,name")]);
 const matchingMonths=finCards.filter((x:any)=>normal(x.name).trim()===p.monthName+" 2026");
 if(matchingMonths.length>1)throw Error("MONTH_DUPLICATED_REVIEW");
 const month=matchingMonths[0]||null;
 const target=workLists.find((x:any)=>normal(x.name).includes(p.monthName)&&normal(x.name).includes("26"));
 const pending=workLists.find((x:any)=>normal(x.name)==="AG. ACERTO");
 if(!target||!pending)throw Error("DESTINO_NAO_ENCONTRADO");
 // Comments are part of this SAME canonical monthly card, especially once 16K is reached.
 const monthlyTexts=month?await readAllMonthCommentTexts(month.id):[];
 // Historical cuts can reside in comments of another month once its text filled.
 // Check every canonical 2026 month, not merely the destination month's comments.
 const otherMonths=finCards.filter((x:any)=>x.id!==month?.id&&months.slice(1).some((m:string)=>normal(x.name).trim()===m+" 2026"));
 const historicalTexts=(await Promise.all(otherMonths.map((x:any)=>readAllMonthCommentTexts(x.id)))).flat();
 const duplicate=String(month?.desc||"").includes(marker(p))||monthlyTexts.some((t:string)=>t.includes(marker(p)))||historicalTexts.some((t:string)=>t.includes(marker(p)));
 if(duplicate)throw Error("PERIOD_ALREADY_SENT");
 for(const c of p.cases){
  if(finCards.some((x:any)=>hasCase(x.desc||"",c))||monthlyTexts.some((t:string)=>hasCase(t,c))||historicalTexts.some((t:string)=>hasCase(t,c)))throw Error("OBRA_JA_REGISTRADA:"+c);
 }
 // A repeated source row is ambiguous: never pick the first matching work silently.
 const rows=p.cases.map(c=>{
  const matches=live.filter((x:any)=>x.case===c);
  if(matches.length>1)throw Error("OBRA_LIVE_AMBIGUA:"+c);
  return matches[0]||null;
 });
 if(rows.some(x=>!x))throw Error("OBRA_FORA_DA_LISTA_AG_ACERTO");
 for(const r of rows){
  const a=r.rateio;
  const val=[r.base_cents,r.cost_cents,r.profit_cents,a?.fabricio_cents,a?.eder_cents,a?.rogerio_cents,a?.gabi_cents,a?.capital_giro_cents];
  if(val.some(x=>!Number.isSafeInteger(x))||r.base_cents<=0||r.profit_cents<0||r.base_cents-r.cost_cents!==r.profit_cents||sum([a],x=>x.fabricio_cents+x.eder_cents+x.rogerio_cents+x.gabi_cents+x.capital_giro_cents)!==r.profit_cents||r.issues?.some((x:string)=>/SEM_|DIVERG|CONFLITO/i.test(x)))throw Error("OBRA_PRECISA_CONFERENCIA:"+r.case);
 }
 const cards=await Promise.all(rows.map(async r=>{
  const m=String(r.trello_url||"").match(/trello\.com\/c\/([a-zA-Z0-9]+)/);if(!m)throw Error("LINK_OBRA_INVALIDO");
  const c=await trello("/cards/"+m[1]+"?fields=id,name,desc,idList,dateLastActivity,shortUrl");
  if(c.idList!==pending.id)throw Error("OBRA_NAO_PENDENTE:"+r.case);return c;
 }));
 const totals={count:rows.length,base_cents:sum(rows,r=>r.base_cents),cost_cents:sum(rows,r=>r.cost_cents),profit_cents:sum(rows,r=>r.profit_cents),fabricio_cents:sum(rows,r=>r.rateio.fabricio_cents),eder_cents:sum(rows,r=>r.rateio.eder_cents),rogerio_cents:sum(rows,r=>r.rateio.rogerio_cents),gabi_cents:sum(rows,r=>r.rateio.gabi_cents),capital_cents:sum(rows,r=>r.rateio.capital_giro_cents)};
 if(totals.base_cents-totals.cost_cents!==totals.profit_cents||totals.fabricio_cents+totals.eder_cents+totals.rogerio_cents+totals.gabi_cents+totals.capital_cents!==totals.profit_cents)throw Error("PERIODO_NAO_FECHA");
 const capitals=await trello("/lists/692e0d6c360c13a9cd738f33/cards?fields=id,name,desc");
 const ckey="CG_PERIOD_KEY|"+p.start+"_"+p.end;
 const matchingCapitalCards=capitals.filter((x:any)=>String(x.desc||"").includes(ckey));
 if(matchingCapitalCards.length>1)throw Error("CAPITAL_PERIOD_DUPLICATED_REVIEW");
 const existing=matchingCapitalCards[0]||null;
 const cm=existing?String(existing.desc||"").match(/CG_CREDIT\|([0-9]+(?:\.[0-9]{1,2})?)/):null;
 const credit=cm?Math.round(Number(cm[1])*100):null;
 // Decisão documentada do diretor em 24/10/2026: exceção única, com valores e período exatos.
 // NÃO lança a diferença como crédito ou débito e NÃO se aplica a outros fechamentos.
 const accepted_exception=p.start==="2026-10-10"&&p.end==="2026-10-23"&&rows.length===11&&
   credit===105806&&totals.capital_cents===122720&&
   String(existing?.desc||"").includes("CG_PERIOD_KEY|2026-10-10_2026-10-23")&&
   String(existing?.desc||"").includes("CG_CREDIT|1058.06");
 const cg_plan=!existing&&session?await cgCreationPlan(p,rows,totals.capital_cents,session):null;
 const capital_validation={exists:!!existing,period_card_url:existing?.shortUrl||null,credit_cents:credit,
   expected_cents:totals.capital_cents,difference_cents:credit==null?null:totals.capital_cents-credit,
   ok:credit!=null&&Math.abs(credit-totals.capital_cents)<=1,
   can_create:!!cg_plan,creation_preview:cg_plan,
   accepted_exception:accepted_exception?"CR-CG-DIFF-16914-ACCEPTED-20261024":null};
 const work_fingerprint=await sha(JSON.stringify({p,month:month?[month.id,month.desc]:["MONTH_MISSING",p.monthName],
  rows:rows.map(r=>[r.case,r.base_cents,r.cost_cents,r.profit_cents,r.rateio]),
  cards:cards.map(c=>[c.id,c.idList,c.desc,c.dateLastActivity])}));
 const fingerprint=await sha(JSON.stringify({work_fingerprint,capital_validation}));
 return {p,rows,cards,month,target,totals,capital_validation,duplicate,fingerprint,work_fingerprint};
}
function block(c:any){
 const p=c.p,t=c.totals;
 const l=["","━━━━━━━━━━━━━━━━━━━━━━","📋 ACERTOS REGISTRADOS — "+p.start+" A "+p.end,"━━━━━━━━━━━━━━━━━━━━━━","🏗️ Obras: "+t.count,"💵 Base financeira das obras: "+brl(t.base_cents),"💸 Custos: "+brl(t.cost_cents),"💰 Lucro líquido: "+brl(t.profit_cents),"📈 Margem: "+(t.profit_cents/t.base_cents*100).toFixed(2).replace(".",",")+"%","","👥 RATEIOS APURADOS (RETIRADAS NÃO COMPROVADAS PELO FECHAMENTO)","Fabrício: "+brl(t.fabricio_cents),"Éder: "+brl(t.eder_cents),"Rogério: "+brl(t.rogerio_cents),"Gabrielly: "+brl(t.gabi_cents),"Capital de Giro: "+brl(t.capital_cents),"","REFERÊNCIAS DAS OBRAS"];
 for(const r of c.rows)l.push("• "+r.case+" | Base "+brl(r.base_cents)+" | Custos "+brl(r.cost_cents)+" | Lucro "+brl(r.profit_cents)+" | "+r.trello_url);
 if(c.capital_validation.accepted_exception){
   l.push("⚠️ EXCEÇÃO HISTÓRICA CG ACEITA PELO DIRETOR EM 24/10/2026",
   "Crédito CG no registro legado: R$ 1.058,06 | CG pelos rateios do lote: R$ 1.227,20",
   "Diferença conhecida: R$ 169,14. Não lançar ajuste adicional nem modificar saldo histórico.",
   "Decisão original documentada em https://trello.com/c/lUHP2wNe",
   c.capital_validation.accepted_exception);
 }
 l.push(marker(p),"━━━━━━━━━━━━━━━━━━━━━━");return l.join("\n");
}
// A missing month can be created only inside an authenticated, fingerprint-confirmed commit.
// A unique PostgreSQL reservation MUST succeed before POST /cards. On uncertainty, stop;
// never retry card creation blindly (manual readback/reconciliation required).
async function monthRegistry(action:string,payload:any){
 const key=(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"").trim();
 if(!key)throw Error("MONTH_CLAIM_SERVICE_UNAVAILABLE");
 const name=action==="claim"?"cr_finance_2026_month_claim":"cr_finance_2026_month_finish";
 const r=await fetch(SB+"/rest/v1/rpc/"+name,{method:"POST",headers:{"apikey":key,Authorization:"Bearer "+key,"content-type":"application/json"},
  body:JSON.stringify(payload),signal:AbortSignal.timeout(16000)});
 if(!r.ok)throw Error("MONTH_CLAIM_HTTP_"+r.status);
 const result=await r.json();
 if(!result?.ok)throw Error(String(result?.error||"MONTH_CLAIM_DENIED"));
 return result;
}
async function provisionMonth(c:any){
 const yearMonth="2026-"+String(c.p.month).padStart(2,"0");
 const name=c.p.monthName+" 2026",tag="CR-MONTH-CANONICAL|"+yearMonth;
 const bankMonth=(await trello("/lists/"+FIN+"/cards?fields=id,name,desc,shortUrl")).filter((x:any)=>normal(x.name).trim()===name);
 if(bankMonth.length)throw Error("MONTH_CREATED_SINCE_PREVIEW_RELOAD");
 const lock=await monthRegistry("claim",{p_year_month:yearMonth,p_fingerprint:c.fingerprint});
 if(lock.claimed!==true)throw Error("MONTH_CREATION_ALREADY_RESERVED_REVIEW");
 let created:any=null;
 try{
  const check=await trello("/lists/"+FIN+"/cards?fields=id,name,desc,shortUrl");
  if(check.some((x:any)=>normal(x.name).trim()===name))throw Error("MONTH_CREATED_CONCURRENTLY_REVIEW");
  created=await trello("/cards","POST",{idList:FIN,name,desc:"CONSTRU-REI | VALORES RECEBIDOS "+name+
    "\nACERTOS CONFIRMADOS: nenhum corte incluído até esta criação. Não equivale a recebimento bancário.\n"+tag,pos:"bottom"});
  if(!/^[0-9a-f]{24}$/i.test(String(created?.id||"")))throw Error("MONTH_CREATE_RESULT_INVALID");
  const after=await trello("/cards/"+created.id+"?fields=id,idList,name,desc,shortUrl");
  if(after.id!==created.id||after.idList!==FIN||normal(after.name).trim()!==name||!String(after.desc||"").includes(tag))
   throw Error("MONTH_CREATE_READBACK_MISMATCH");
  const siblings=await trello("/lists/"+FIN+"/cards?fields=id,name");
  if(siblings.filter((x:any)=>normal(x.name).trim()===name).length!==1)throw Error("MONTH_DUPLICATE_AFTER_CREATE_REVIEW");
  const finish=await monthRegistry("finish",{p_year_month:yearMonth,p_fingerprint:c.fingerprint,p_card_id:created.id,p_status:"COMMITTED"});
  if(finish.status!=="COMMITTED"||finish.card_id!==created.id)throw Error("MONTH_RESERVATION_FINISH_UNVERIFIED");
  return after;
 }catch(e){
  await monthRegistry("finish",{p_year_month:yearMonth,p_fingerprint:c.fingerprint,p_card_id:created?.id||null,p_status:"REVIEW_REQUIRED"}).catch(()=>null);
  throw Error("MONTH_CREATION_UNCERTAIN_REVIEW_REQUIRED:"+String((e as Error)?.message||e));
 }
}
// A month is the ONLY Trello financial card for a period. The card's description has a
// 16K limit; use its own verified comments to retain the full cut, never create period cards.
function compactMonthCut(c:any){
 const p=c.p,t=c.totals;
 return ["","━━━━━━━━━━━━","📋 CORTE DE ACERTOS "+p.start+" A "+p.end+" ("+t.count+" obras)",
 "OBRAS: "+p.cases.join(", "),
 "Base "+brl(t.base_cents)+" | Custos "+brl(t.cost_cents)+" | Lucro "+brl(t.profit_cents),
 "RATEIO: Fabrício "+brl(t.fabricio_cents)+" | Éder "+brl(t.eder_cents)+" | Rogério "+brl(t.rogerio_cents)+" | Gabrielly "+brl(t.gabi_cents)+" | CG "+brl(t.capital_cents),
 "DETALHAMENTO INTEGRAL: comentário neste MESMO cartão mensal, associado à chave abaixo.",
 marker(p),"━━━━━━━━━━━━"].join("\n");
}
async function ensureMonthCutComment(c:any,full:string){
 if(full.length>16384)throw Error("MONTH_COMMENT_CAPACITY_EXCEEDED");
 const before=await readAllMonthCommentTexts(c.month.id);
 if(before.some((text:string)=>text.includes(marker(c.p))))return;
 await trello("/cards/"+c.month.id+"/actions/comments","POST",{text:full});
 const after=await readAllMonthCommentTexts(c.month.id);
 if(!after.some((text:string)=>text.includes(marker(c.p))))throw Error("MONTH_COMMENT_SAVE_UNCONFIRMED");
}
// Recovery is a separate operation. The acerto must ALREADY be fully recorded.
 // Never reissue month text, CG credits, bank movements or other accounting entries.
async function recoverySelection(b:any){
 const p=input(b);
 const [finCards,lists]=await Promise.all([
  trello("/lists/"+FIN+"/cards?fields=id,name,desc,shortUrl"),
  trello("/boards/"+WORK+"/lists?fields=id,name")
 ]);
 const matches=finCards.filter((x:any)=>normal(x.name).trim()===p.monthName+" 2026");
 if(matches.length!==1)throw Error("RECOVERY_MONTH_NOT_UNIQUE");
 const month=matches[0];
 const target=lists.filter((x:any)=>normal(x.name).includes(p.monthName)&&normal(x.name).includes("26"));
 const pending=lists.filter((x:any)=>normal(x.name)==="AG. ACERTO");
 if(target.length!==1||pending.length!==1)throw Error("RECOVERY_LIST_NOT_UNIQUE");
 const mark=marker(p);
 const header="📋 ACERTOS REGISTRADOS — "+p.start+" A "+p.end;
 const texts=[String(month.desc||""),...await readAllMonthCommentTexts(month.id)];
 const recorded=texts.filter((t:string)=>{
  const pos=t.indexOf(mark);
  return pos>=0&&t.lastIndexOf(header,pos)>=0;
 });
 if(recorded.length!==1)throw Error("RECOVERY_FULL_PERIOD_RECORD_NOT_UNIQUE");
 const full=recorded[0],end=full.indexOf(mark),start=full.lastIndexOf(header,end);
 if(end<0||start<0)throw Error("RECOVERY_PERIOD_RECORD_INVALID");
 const section=full.slice(start,end);
 const refs=new Map<string,string>();
 for(const line of section.split(/\r?\n/)){
  const m=line.match(/^\s*•\s*(\d{1,5}-26)\s*\|\s*Base\b.+https:\/\/trello\.com\/c\/([a-zA-Z0-9]{6,20})/);
  if(!m)continue;
  if(refs.has(m[1]))throw Error("RECOVERY_DUPLICATE_WORK_REF");
  refs.set(m[1],m[2]);
 }
 if(refs.size!==p.cases.length||p.cases.some((c:string)=>!refs.has(c)))
  throw Error("RECOVERY_WORK_REFS_MISMATCH");
 const records=await Promise.all(p.cases.map(async (no:string)=>{
  const card=await trello("/cards/"+refs.get(no)+"?fields=id,name,idList,shortUrl");
  if(!card||!new RegExp("(^|[^0-9])"+no+"(?![0-9])").test(String(card.name||"")))
   throw Error("RECOVERY_WORK_ID_MISMATCH:"+no);
  if(card.idList!==target[0].id&&card.idList!==pending[0].id)
   throw Error("RECOVERY_WORK_OUTSIDE_ALLOWED_LIST:"+no);
  return {case:no,id:card.id,idList:card.idList,url:card.shortUrl||null,
   needs_move:card.idList===pending[0].id};
 }));
 const fingerprint=await sha(JSON.stringify({
  p,month_id:month.id,month_desc:month.desc,record:full,target_id:target[0].id,
  refs:records.map((x:any)=>[x.case,x.id,x.idList])
 }));
 return {p,month,target:target[0],pending:pending[0],records,fingerprint};
}
async function recoverPeriod(b:any,commit:boolean){
 const c=await recoverySelection(b);
 if(!commit)return {ok:true,preview:true,recovery:true,
  period:c.p,already_moved:c.records.filter((x:any)=>!x.needs_move).map((x:any)=>x.case),
  pending_move:c.records.filter((x:any)=>x.needs_move).map((x:any)=>x.case),
  fingerprint:c.fingerprint,writes:false,month_url:c.month.shortUrl||null};
 if(String(b.fingerprint||"")!==c.fingerprint)throw Error("RECOVERY_STALE_PREVIEW");
 const moved:string[]=[],already_moved=c.records.filter((x:any)=>!x.needs_move).map((x:any)=>x.case);
 const unresolved:string[]=[];
 for(const item of c.records.filter((x:any)=>x.needs_move)){
  try{
   const now=await trello("/cards/"+item.id+"?fields=idList");
   if(now.idList===c.target.id){already_moved.push(item.case);continue}
   if(now.idList!==c.pending.id){unresolved.push(item.case+":LIST_CHANGED");continue}
   await trello("/cards/"+item.id,"PUT",{idList:c.target.id});
   const after=await trello("/cards/"+item.id+"?fields=idList");
   if(after.idList===c.target.id)moved.push(item.case);
   else unresolved.push(item.case+":MOVE_NOT_VERIFIED");
  }catch(e){unresolved.push(item.case+":"+String((e as Error)?.message||e).slice(0,90))}
 }
 if(unresolved.length===0){
  try{
   const key=c.p.start+"_"+c.p.end;
   const ledger=await periodRegistryLookup(key);
   if(ledger?.status==="PARTIAL"||ledger?.status==="MONTH_RECORDED"){
    await periodRegistry("checkpoint",{p_period_key:key,p_fingerprint:ledger.fingerprint,
     p_status:"COMMITTED",p_month_card_id:c.month.id});
   }else if(ledger&&ledger.status!=="COMMITTED"){
    unresolved.push("REGISTRO_DO_PERIODO_EXIGE_REVISAO");
   }
  }catch(e){unresolved.push("STATUS_DO_PERIODO_NAO_CONFIRMADO:"+String((e as Error)?.message||e).slice(0,70))}
 }
 return {ok:unresolved.length===0,recovery:true,recorded:true,moved,already_moved,
  unresolved,partial:unresolved.length>0,month_url:c.month.shortUrl||null,
  no_accounting_writes:true};
}

/* Indicador comercial: Gestão Click é fonte dos orçamentos; não inferir a receber de movimentos Cora/Trello. */
async function gcAwaitingPayment(){
 const access=(Deno.env.get("GESTAOCLICK_ACCESS_TOKEN")||"").trim();
 const secret=(Deno.env.get("GESTAOCLICK_SECRET_ACCESS_TOKEN")||"").trim();
 if(!access||!secret)throw Error("GC_CREDENTIALS_UNAVAILABLE");
 const unique=new Set<string>();let total=0,count=0,processed=0,pages=0,complete=false;
 for(let page=1;page<=30;page++){
  const url=new URL("https://api.gestaoclick.com/api/orcamentos");
  url.searchParams.set("pagina",String(page));url.searchParams.set("limite","100");
  url.searchParams.set("ordenacao","data");url.searchParams.set("direcao","desc");
  const r=await fetch(url,{headers:{"access-token":access,"secret-access-token":secret,"accept":"application/json"},signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw Error("GC_ORCAMENTOS_HTTP_"+r.status);
  const body=await r.json();if(!Array.isArray(body?.data))throw Error("GC_ORCAMENTOS_FORMAT_INVALID");
  const rows=body.data;pages=page;
  for(const q of rows){
   const id=String(q.id||q.codigo||"").trim();if(!id||unique.has(id))continue;unique.add(id);
   const digits=String(q.codigo||"").replace(/\D/g,"");if(!digits.endsWith("26")||digits.length<3)continue;
   processed++;
   const status=String(q.nome_situacao||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\s+/g," ").trim();
   if(!/(^|\s)AGUARDANDO PAGAMENTO(\s|$)/.test(status))continue;
   const raw=String(q.valor_total??"").trim().replace(/R\$/gi,"").replace(/\s/g,"");
   const n=Number(raw.includes(",")?raw.replace(/\./g,"").replace(",","."):raw);
   if(!Number.isFinite(n)||n<0)throw Error("GC_AWAITING_PAYMENT_AMOUNT_INVALID");
   total+=Math.round(n*100);count++;
  }
  if(rows.length<100){complete=true;break}
 }
 if(!complete)throw Error("GC_PAGINATION_INCOMPLETE");
 return {ok:true,source:"GESTAOCLICK_ORCAMENTOS_2026",status:"AGUARDANDO PAGAMENTO",total_cents:total,count,quotes_2026_seen:processed,pages,complete,read_at:new Date().toISOString(),writes:false};
}
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(req.headers.get("origin")&&req.headers.get("origin")!==HOST)return ans({ok:false,error:"ORIGIN_DENIED"},403);
 if(req.method==="GET")return ans({ok:true,build:"CR-V12-PERIODO-CG-LEDGER-RECOVERY-20261026-V7",production:false,mode:"CANDIDATE",bank_writes:false});
 if(req.method!=="POST")return ans({ok:false,error:"METHOD_NOT_ALLOWED"},405);
 if(!await director(req))return ans({ok:false,error:"DIRECTOR_SESSION_REQUIRED"},401);
 const action=new URL(req.url).searchParams.get("action");
 if(!["preview","commit","gc-awaiting-payment","preview-diagnostic","recovery-preview","recovery-commit"].includes(action||""))return ans({ok:false,error:"INVALID_ACTION"},400);
 if(action==="gc-awaiting-payment"){
  try{return ans(await gcAwaitingPayment())}catch(e){return ans({ok:false,error:String((e as Error)?.message||e)},503)}
 }
 const b=await req.json().catch(()=>null);
 if(!b)return ans({ok:false,error:"INVALID_BODY"},400);
 let periodClaim:any=null;
 try{
  if(action==="preview-diagnostic")return ans(await diagnosticPreview(b));
  if(action==="recovery-preview"||action==="recovery-commit"){
   const x=await recoverPeriod(b,action==="recovery-commit");
   return ans(x,x.partial?207:200);
  }
  let c=await gather(b,req.headers.get("x-cr-session")||"");
  if(action==="preview")return ans({ok:true,preview:true,period:c.p,totals:c.totals,capital_validation:c.capital_validation,fingerprint:c.fingerprint,duplicate:c.duplicate,requires_month_creation:!c.month,writes:false});
  if(c.duplicate)return ans({ok:false,error:"PERIOD_ALREADY_SENT"},409);
  if(!c.capital_validation.ok&&!c.capital_validation.accepted_exception&&!c.capital_validation.can_create)
   return ans({ok:false,error:"CAPITAL_PERIOD_NOT_RECONCILED",capital_validation:c.capital_validation},409);
  if(b.fingerprint!==c.fingerprint)return ans({ok:false,error:"STALE_PREVIEW"},409);
  const periodKey=c.p.start+"_"+c.p.end;
  const claim=await periodRegistry("claim",{p_period_key:periodKey,p_fingerprint:c.fingerprint});
  if(claim.claimed!==true)throw Error("PERIOD_ALREADY_RESERVED_REVIEW");
  periodClaim={p_period_key:periodKey,p_fingerprint:c.fingerprint};
  let cgCreated:any=null;
  if(c.capital_validation.can_create){
   const plan=c.capital_validation.creation_preview;
   const created=await cgPeriodService("close-commit",c.p,req.headers.get("x-cr-session")||"",plan.fingerprint);
   if(created.created!==true||!created.card_url)throw Error("CAPITAL_CREATION_UNVERIFIED_REVIEW");
   cgCreated=created;
   await periodRegistry("checkpoint",{...periodClaim,p_status:"CG_RECORDED",p_capital_card_url:created.card_url});
   const after=await gather(b,req.headers.get("x-cr-session")||"");
   if(after.work_fingerprint!==c.work_fingerprint||!after.capital_validation.ok)
    throw Error("CAPITAL_CREATED_MONTH_PENDING_REVIEW");
   c=after;
  }
  if(!c.month)c.month=await provisionMonth(c);
  const full=block(c);
  let next=String(c.month.desc||"").trimEnd()+"\n"+full+"\n";
  if(next.length>16384){
   // Safe fallback: full details stay INSIDE the existing monthly card as a comment.
   // Save and verify that comment before indexing the cut; a retry reuses its marker.
   next=String(c.month.desc||"").trimEnd()+"\n"+compactMonthCut(c)+"\n";
   if(next.length>16384)return ans({ok:false,error:"MONTH_CARD_CAPACITY_EXCEEDED",length:next.length},409);
   await ensureMonthCutComment(c,full);
  }
  await trello("/cards/"+c.month.id,"PUT",{desc:next});
  const confirmed=await trello("/cards/"+c.month.id+"?fields=desc");
  if(confirmed.desc!==next)throw Error("MONTH_SAVE_UNCONFIRMED_POSSIBLE_WRITE");
  await periodRegistry("checkpoint",{...periodClaim,p_status:"MONTH_RECORDED",p_month_card_id:c.month.id});
  const moved:string[]=[],fail:string[]=[];
  for(let i=0;i<c.cards.length;i++){
   try{
    const fresh=await trello("/cards/"+c.cards[i].id+"?fields=idList");
    if(fresh.idList!==c.cards[i].idList){fail.push(c.rows[i].case+":CHANGED");continue}
    await trello("/cards/"+c.cards[i].id,"PUT",{idList:c.target.id});
    const check=await trello("/cards/"+c.cards[i].id+"?fields=idList");
    if(check.idList===c.target.id)moved.push(c.rows[i].case);else fail.push(c.rows[i].case+":UNVERIFIED");
   }catch(e){fail.push(c.rows[i].case+":"+String(e).slice(0,55))}
  }
  await periodRegistry("checkpoint",{...periodClaim,p_status:fail.length?"PARTIAL":"COMMITTED",
   p_month_card_id:c.month.id,p_capital_card_url:cgCreated?.card_url||c.capital_validation.period_card_url||null,
   p_error_code:fail.length?("UNRESOLVED_WORKS_"+fail.length):null});
  periodClaim=null;
  return ans({ok:fail.length===0,recorded:true,month:c.p.monthName,moved,unresolved:fail,
   month_url:c.month.shortUrl,capital_created:!!cgCreated,capital_card_url:cgCreated?.card_url||c.capital_validation.period_card_url,
   partial:!!fail.length},fail.length?207:200);
 }catch(e){
  if(periodClaim)await periodRegistry("checkpoint",{...periodClaim,p_status:"REVIEW_REQUIRED",
   p_error_code:String((e as Error)?.message||e).slice(0,150)}).catch(()=>null);
  return ans({ok:false,error:String(e).slice(0,300)},409);
 }
});
