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
/* Human-readable Trello lines; immutable source_id and deterministic operation_id
 * live in the idempotent Supabase ledger, never duplicated in the card text.
 * Keep a temporary CRV12OP marker until BOTH Trello and ledger confirm commit. */
function withMarker(p:ReturnType<typeof clean>){
 const marker="CRV12OP_"+p.operation_id;
 const isBank=/^CORA_[0-9a-f]{64}$/.test(p.operation_id);
 let counterparty=p.counterparty,description=p.description,reference=p.reference;
 if(isBank){
  // The original reference is never discarded from p/fingerprint/ledger.
  description=description.split(p.reference).join("").replace(/ID bancário Cora\s*:/gi,"").replace(/^\s*[|·–-]\s*/,"").trim();
  const normalized=(x:string)=>x.normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLocaleLowerCase("pt-BR");
  if(normalized(description)===normalized(counterparty)||normalized(description)===normalized(p.category))description="";
  if(normalized(counterparty)===normalized(p.category))counterparty="";
  reference="Cora";
 }
 const ref=(reference.slice(0,Math.max(0,98-marker.length))+" "+marker).trim();
 return {operation_id:p.operation_id,case:p.case,direction:p.direction,date:p.date,amount:p.amount,category:p.category,counterparty,description,reference:ref};
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

/* Associate an existing cost with the bank movement WITHOUT writing to Trello.
 * Requires exact work, day and cents; operator chooses and confirms the exact
 * line. Matching only an amount does not authorize a reconciliation. */
async function sha256(s:string){
 const bytes=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));
 return Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,"0")).join("");
}
async function existingMatchCandidates(p:ReturnType<typeof clean>,k:string,costCase:string=p.case,toleranceDays:number=1){
 if(!/^\d{1,5}-26$/.test(costCase))throw Error("COST_DESTINATION_CASE_INVALID");
 const crossed=costCase!==p.case;
 if(p.direction!=="OUT"||!p.operation_id.startsWith("CORA_"))throw Error("EXISTING_ONLY_BANK_DEBITS");
 // Existing-cost matching is read-only and must not depend on legacy writer preview.
 // Resolve the work directly from the same canonical Trello board used by receipt reconciliation.
 const [lists,cards]=await Promise.all([
  trelloApiRead("/boards/"+BOARD_2026+"/lists?fields=id,name&filter=all"),
  trelloApiRead("/boards/"+BOARD_2026+"/cards?fields=id,name,idList,shortUrl&filter=all&limit=1000")
 ]);
 if(!Array.isArray(lists)||!Array.isArray(cards))throw Error("TRELLO_EXISTING_CONTEXT_UNAVAILABLE");
 const matchesByWork=cards.filter((c:any)=>caseInName(c.name)===costCase&&!/RESUMO|ACERTOS\\s+2026/i.test(String(c.name||"")));
 if(matchesByWork.length!==1)throw Error(matchesByWork.length?"EXISTING_DUPLICATE_WORK_CARDS":"EXISTING_CASE_NOT_FOUND");
 const entry=matchesByWork[0];
 const nameByList=new Map(lists.map((x:any)=>[String(x.id),String(x.name||"")]));
 if(!nameByList.has(String(entry.idList)))throw Error("EXISTING_WORK_LIST_NOT_VERIFIED");
 const short=shortLink(entry.shortUrl);
 if(!short)throw Error("TRELLO_TARGET_UNVERIFIED");
 const target=await card(short);
 if(target.id!==entry.id||target.idList!==entry.idList||caseInName(target.name)!==costCase)
  throw Error("EXISTING_WORK_MOVED_OR_CHANGED");
 const pre={target:{case:costCase,origin_case:p.case,trello_url:target.shortUrl}};
 const lines=String(target.desc||"").split(/\r?\n/);
 const matches:{match_key:string;line:string}[]=[];
 const mm=p.date.slice(5,7),dd=p.date.slice(8,10),yy=p.date.slice(2,4);
 let inCosts=false;
 for(const line of lines){
  if(/^\s*Custos\s*:/i.test(line)){inCosts=true;continue}
  if(!inCosts)continue;
  // Lines already linked by the Cora writer must never be reused as an old manual expense.
  if(/\bRef\.\s*Cora\b|\bID bancário Cora\s*:/i.test(line))continue;
  if(/^\s*(?:Total\s+Custos|Lucro|Saldo|Recebimentos?|Entradas?|Observa[cç][oõ]es?|Rateio)\s*:/i.test(line))break;
  const m=line.trim().match(/^(\d{2})\/(\d{2})(?:\/(\d{2}|\d{4}))?\s*[-–]\s*R\$\s*([\d.,]+)\b(.*)$/i);
  if(!m)continue;
  // One calendar day tolerance for documented prepayment; still require exact line selection.
  const lineYear=m[3]?(m[3].length===2?"20"+m[3]:m[3]):p.date.slice(0,4);
  const ledgerDay=new Date(lineYear+"-"+m[2]+"-"+m[1]+"T12:00:00Z");
  const bankDay=new Date(p.date+"T12:00:00Z");
  if(Number.isNaN(ledgerDay.getTime())||Math.abs(ledgerDay.getTime()-bankDay.getTime())>toleranceDays*86400000)continue;
  if(ledgerDay.toISOString().slice(0,10)!==lineYear+"-"+m[2]+"-"+m[1])continue;
  if(amount(m[4])!==p.amount_cents)continue;
  // Only link a cross-work cost if the exact line explicitly names the origin work.
  if(crossed&&!new RegExp("(^|[^0-9])"+p.case+"(?![0-9])","i").test(line))continue;
  const normalized=line.trim();
  // Two visually identical entries cannot be safely disambiguated.
  if(lines.filter(x=>x.trim()===normalized).length!==1)continue;
  matches.push({match_key:await sha256("CR-CORA-EXISTING-V1|"+target.id+"|"+normalized),line:normalized});
 }
 return {target,pre,matches:matches.slice(0,20),origin_case:p.case,cost_case:costCase};
}
async function existingLinksForCard(cardId:string,k:string){
 const endpoint=new URL(SB+"/rest/v1/cr_finance_v12_operations");
 endpoint.searchParams.set("card_id","eq."+cardId);
 endpoint.searchParams.set("select","operation_id,status,payload");
 endpoint.searchParams.set("limit","1000");
 const r=await fetch(endpoint,{headers:headers(k),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error("RECONCILIATION_LEDGER_READ_"+r.status);
 const rows=await r.json();
 if(!Array.isArray(rows)||rows.length>=1000)throw Error("RECONCILIATION_LEDGER_INCOMPLETE");
 return rows;
}
async function reconcileExisting(action:string,p:ReturnType<typeof clean>,raw:any,k:string,fp:string){
 const already=await existingLinksForCardIdByOperation(p.operation_id,k);
 if(already){
  if(already.status==="COMMITTED")return reply({ok:true,already_committed:true,reconciliation_kind:already.payload?.reconciliation_kind||"DIRECT_TRELLO",trello_url:already.trello_url});
  return reply({ok:false,error:"BANK_OPERATION_NEEDS_REVIEW",status:already.status},409);
 }
 const costCase=String(raw?.cost_case||p.case).trim();
 const scan=await existingMatchCandidates(p,k,costCase);
 const candidates=scan.matches;
 const prev= {ok:true,source:"TRELLO_EXISTING_CARD_VERIFIED",case:p.case,origin_case:p.case,cost_case:scan.cost_case,amount_centavos:p.amount_cents,date:p.date,
  trello_url:scan.target.shortUrl||scan.pre?.target?.trello_url,candidates,date_tolerance_days:1,requires_explicit_line_selection:true};
 if(action==="existing-preview")return reply(prev);
 const matchKey=String(raw?.match_key||"");
 const found=candidates.filter(x=>x.match_key===matchKey);
 if(found.length!==1)return reply({ok:false,error:"EXISTING_LINE_NOT_VERIFIED",possible_trello_write:false},409);
 const linked=await existingLinksForCard(scan.target.id,k);
 if(linked.some(x=>x.status!=="FAILED"&&String(x.payload?.trello_match_key||"")===matchKey))
  return reply({ok:false,error:"TRELLO_LINE_ALREADY_LINKED",possible_trello_write:false},409);
 const payload={case:p.case,date:p.date,direction:p.direction,amount_cents:p.amount_cents,category:p.category,
  reference:p.reference,origin_case:p.case,cost_case:scan.cost_case,
  reconciliation_kind:scan.cost_case===p.case?"EXISTING_TRELLO":"EXISTING_TRELLO_CROSS_WORK",trello_match_key:matchKey,trello_line_text:found[0].line};
 const claim=await rpc("cr_finance_v12_claim",{p_operation_id:p.operation_id,p_fingerprint:fp,p_card_id:scan.target.id,p_payload:payload},k);
 if(claim.ok===true&&claim.claimed===false&&claim.status==="COMMITTED")return reply({ok:true,already_committed:true,reconciliation_kind:"EXISTING_TRELLO",trello_url:claim.trello_url});
 if(claim.ok!==true||claim.claimed!==true)return reply({ok:false,error:claim.error||"RECONCILIATION_ALREADY_CLAIMED",status:claim.status},409);
 // No write to Trello happens here. The record is only a bank→existing-cost link.
 try{
  const secondScan=await card(shortLink(scan.target.shortUrl||scan.pre?.target?.trello_url)!);
  if(!String(secondScan.desc||"").split(/\r?\n/).some(x=>x.trim()===found[0].line))throw Error("EXISTING_LINE_CHANGED");
  const confirmed=await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,p_status:"COMMITTED",p_trello_url:scan.target.shortUrl||scan.pre?.target?.trello_url||null,p_error_code:null},k);
  if(confirmed.ok!==true)throw Error("LEDGER_CONFIRMATION_MISSING");
  return reply({ok:true,committed:true,reconciliation_kind:payload.reconciliation_kind,origin_case:p.case,cost_case:scan.cost_case,trello_url:scan.target.shortUrl||null,
   case:p.case,line:found[0].line,bank_source_id:p.reference});
 }catch(e){
  try{await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,p_status:"REVIEW_REQUIRED",
   p_trello_url:scan.target.shortUrl||null,p_error_code:String((e as Error)?.message||e).slice(0,100)},k)}catch{}
  return reply({ok:false,error:"REVIEW_REQUIRED",detail:String((e as Error)?.message||e).slice(0,90)},409);
 }
}
async function existingLinksForCardIdByOperation(id:string,k:string){
 const r=await fetch(SB+"/rest/v1/cr_finance_v12_operations?operation_id=eq."+encodeURIComponent(id)+
  "&select=status,trello_url,payload",{headers:headers(k),signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw Error("LEDGER_READ_"+r.status);
 const rows=await r.json();
 if(!Array.isArray(rows))throw Error("LEDGER_INVALID");
 return rows[0]||null;
}


/** Read real Trello cards; never fabricate work IDs or consider AG. ACERTO unpaid. */
const BOARD_2026="6974b24c16d17ca76351a950";
const CG_FUNCTION="cr-capital-despesas-v11-candidate-20261009";
async function trelloApiRead(path:string){
 const a=env("TRELLO_API_KEY"),t=env("TRELLO_API_TOKEN");
 if(!a||!t)throw Error("TRELLO_CREDENTIALS_UNAVAILABLE");
 const u=new URL("https://api.trello.com/1"+path);u.searchParams.set("key",a);u.searchParams.set("token",t);
 const r=await fetch(u,{signal:AbortSignal.timeout(14000)});
 if(!r.ok)throw Error("TRELLO_READ_"+r.status);
 return r.json();
}
function caseInName(v:unknown){
 const match=String(v||"").match(/(?:^|[^\d])(\d{1,5})\s*-\s*(26)(?!\d)/);
 return match?match[1]+"-"+match[2]:null;
}
function allowedList(direction:string,name:string){
 const n=String(name||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\s+/g," ").trim();
 const open=/EM ANDAMENTO|AGUARDANDO PAGAMENTO|AG\.?\s*PAGAMENTO|PAGAMENTO ATRASADO/.test(n);
 return direction==="IN"?open:open||/AGUARDANDO ACERTO|AG\.?\s*ACERTO|RETORNO/.test(n);
}
async function liveCases(direction:string){
 if(!["IN","OUT"].includes(direction))throw Error("INVALID_MOVEMENT_DIRECTION");
 const [lists,cards]=await Promise.all([
  trelloApiRead("/boards/"+BOARD_2026+"/lists?fields=id,name&filter=open"),
  trelloApiRead("/boards/"+BOARD_2026+"/cards?fields=id,name,desc,idList,shortUrl&filter=open&limit=1000")
 ]);
 if(!Array.isArray(lists)||!Array.isArray(cards))throw Error("TRELLO_LISTS_OR_CARDS_UNAVAILABLE");
 const lm=new Map(lists.map((x:any)=>[String(x.id),String(x.name||"")]));
 const filtered=cards.filter((c:any)=>{
  const name=String(c.name||""),num=caseInName(name);
  return !!num&&allowedList(direction,lm.get(String(c.idList))||"")&&!/RESUMO|ACERTOS\s+2026/i.test(name);
 }).map((c:any)=>({case:caseInName(c.name),name:String(c.name).slice(0,155),list:lm.get(String(c.idList)),
  id:String(c.id),url:String(c.shortUrl||"")}));
 const counts=new Map<string,number>();
 filtered.forEach((c:any)=>counts.set(c.case,(counts.get(c.case)||0)+1));
 return filtered.filter((c:any)=>counts.get(c.case)===1).sort((a:any,b:any)=>a.case.localeCompare(b.case,"pt-BR",{numeric:true}));
}
function splitValidate(raw:any,total:number){
 const rows=raw?.allocations;
 if(!Array.isArray(rows)||rows.length<2||rows.length>10)throw Error("SPLIT_REQUIRES_2_TO_10_TARGETS");
 const parts=rows.map((r:any)=>({case:String(r.case||"").trim(),cents:Number(r.cents)}));
 if(parts.some(a=>!/^\d{1,5}-26$/.test(a.case)||!Number.isSafeInteger(a.cents)||a.cents<=0))throw Error("INVALID_ALLOCATION_CASE_OR_CENTS");
 if(new Set(parts.map(a=>a.case)).size!==parts.length)throw Error("DUPLICATED_CASE_IN_SPLIT");
 if(parts.reduce((v,a)=>v+a.cents,0)!==total)throw Error("ALLOCATIONS_DO_NOT_SUM_TO_BANK_AMOUNT");
 return parts.sort((a,b)=>a.case.localeCompare(b.case,"pt-BR",{numeric:true}));
}
async function bankAlreadyUsed(p:ReturnType<typeof clean>,k:string){
 const existing=await existingLinksForCardIdByOperation(p.operation_id,k);
 if(!existing)return null;
 if(existing.status==="COMMITTED")return {ok:true,already_committed:true,
  reconciliation_kind:String(existing.payload?.reconciliation_kind||"DIRECT_TRELLO"),trello_url:existing.trello_url};
 throw Error("BANK_OPERATION_ALREADY_"+String(existing.status||"UNKNOWN"));
}

/* Receipt writes update both the visible Recebido movement and Valor Recebido
 * in a SINGLE Trello description update; never move/close the job card. */
async function receiptPlan(p:ReturnType<typeof clean>,verifiedCase?:{case:string;id:string;url:string;list:string;name:string}){
 if(p.direction!=="IN")throw Error("RECEIPT_DIRECTION_INVALID");
 if(verifiedCase&&verifiedCase.case!==p.case)throw Error("RECEIPT_CASE_MISMATCH");
 const eligible=verifiedCase?[verifiedCase]:(await liveCases("IN")).filter(x=>x.case===p.case);
 if(eligible.length!==1)throw Error("RECEIPT_CASE_NOT_OPEN_FOR_PAYMENT");
 const known=eligible[0],short=shortLink(known.url);
 if(!short)throw Error("RECEIPT_TARGET_URL_INVALID");
 const target=await card(short);
 if(target.id!==known.id)throw Error("RECEIPT_TARGET_CHANGED");
 const desc=String(target.desc||"");
 const grossLine=desc.match(/^\s*Valor\s+Fechado\s*:\s*R\$\s*([\d.,]+)\s*$/im);
 if(!grossLine)throw Error("RECEIPT_GROSS_TOTAL_MISSING");
 const gross=amount(grossLine[1]);if(gross===null)throw Error("RECEIPT_GROSS_TOTAL_INVALID");
 const receivedLines=[...desc.matchAll(/^\s*Valor\s+Recebido\s*:\s*R\$\s*([\d.,]+)\s*$/gim)];
 if(receivedLines.length>1||receivedLines.length===0&&/Valor\s+Recebido\s*:/i.test(desc))
   throw Error("RECEIPT_EXISTING_TOTAL_AMBIGUOUS");
 let existing=0;
 if(receivedLines.length){
  const v=amount(receivedLines[0][1])??(/^0+(?:[.,]0{1,2})?$/.test(receivedLines[0][1])?0:null);if(v===null)throw Error("RECEIPT_PREVIOUS_TOTAL_INVALID");
  existing=v;
 }else{
  for(const l of desc.split(/\r?\n/)){
   if(!/\bRecebido\b/i.test(l)||/Valor\s+Recebido\s*:/i.test(l))continue;
   const hit=l.match(/^\s*\d{2}\/\d{2}\s*[-–]\s*R\$\s*([\d.,]+)\s+Recebido\b/i);
   if(!hit)throw Error("RECEIPT_HISTORIC_LINE_REVIEW");
   const cents=amount(hit[1]);if(cents===null)throw Error("RECEIPT_HISTORIC_AMOUNT_INVALID");
   existing+=cents;
  }
 }
 const next=existing+p.amount_cents;
 if(!Number.isSafeInteger(next)||next>gross)throw Error("RECEIPT_EXCEEDS_CONTRACT_AMOUNT");
 const m=p.date;
 const day=m.slice(8,10)+"/"+m.slice(5,7);
 const tag="CRV12OP_"+p.operation_id;
 if(desc.includes(tag))throw Error("RECEIPT_TRELLO_MARKER_EXISTS_REVIEW");
 const counterparty=String(p.counterparty||"").replace(/[\r\n]/g," ").slice(0,70);
 const line=day+" - R$"+(p.amount_cents/100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})
  +" Recebido"+(counterparty?" - "+counterparty:"")+" - Ref. Cora "+tag;
 const totalLine="Valor Recebido: R$ "+(next/100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
 let updated=desc;
 if(receivedLines.length)updated=updated.replace(receivedLines[0][0],totalLine);
 else updated=updated.replace(grossLine[0],grossLine[0]+"\n"+totalLine);
 const costPos=updated.search(/\n\s*Custos\s*:/i);
 if(costPos<0)throw Error("RECEIPT_COST_SECTION_MISSING");
 updated=updated.slice(0,costPos)+"\n"+line+updated.slice(costPos);
 if(updated===desc||!updated.includes(tag))throw Error("RECEIPT_PREVIEW_INVALID");
 return {card:target,short,updated,tag,line,previous_cents:existing,received_cents:next,gross_cents:gross,
  target:{case:p.case,list:known.list,trello_url:known.url,card_name:known.name,line,amount_cents:p.amount_cents}};
}
async function writeReceipt(plan:Awaited<ReturnType<typeof receiptPlan>>){
 const latest=await card(plan.short);
 if(latest.id!==plan.card.id||String(latest.desc||"")!==String(plan.card.desc||""))
  throw Error("RECEIPT_CARD_CHANGED_REVALIDATE");
 const ak=env("TRELLO_API_KEY"),tk=env("TRELLO_API_TOKEN");
 if(!ak||!tk)throw Error("RECEIPT_TRELLO_CREDENTIALS_UNAVAILABLE");
 const url=new URL("https://api.trello.com/1/cards/"+latest.id);
 url.searchParams.set("key",ak);url.searchParams.set("token",tk);
 const r=await fetch(url,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({desc:plan.updated}),
  signal:AbortSignal.timeout(16000)});
 if(!r.ok)throw Error("RECEIPT_TRELLO_WRITE_"+r.status);
 const confirmed=await card(plan.short);
 if(confirmed.id!==latest.id||!String(confirmed.desc||"").includes(plan.tag)||
  !String(confirmed.desc||"").includes("Valor Recebido: R$ "+(plan.received_cents/100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})))
  throw Error("RECEIPT_VERIFICATION_REVIEW");
 return confirmed;
}

/** Financial reconciliation for previously paid jobs in AG. ACERTO.
 * NEVER writes Trello; the user's explicit confirmation only links an
 * authenticated bank movement to the already-paid operational record. */
async function existingReceiptCandidate(p:ReturnType<typeof clean>,k:string){
 if(p.direction!=="IN"||!p.operation_id.startsWith("CORA_"))throw Error("RECEIPT_ONLY_BANK_CREDITS");
 const [lists,cards]=await Promise.all([
  trelloApiRead("/boards/"+BOARD_2026+"/lists?fields=id,name&filter=open"),
  trelloApiRead("/boards/"+BOARD_2026+"/cards?fields=id,name,desc,idList,shortUrl&filter=open&limit=1000")
 ]);
 if(!Array.isArray(lists)||!Array.isArray(cards))throw Error("TRELLO_RECEIPT_CONTEXT_UNAVAILABLE");
 const matches=cards.filter((c:any)=>caseInName(c.name)===p.case&&!/RESUMO|ACERTOS\s+2026/i.test(String(c.name||"")));
 if(matches.length!==1)throw Error(matches.length?"RECEIPT_DUPLICATE_WORK_CARDS":"RECEIPT_CASE_NOT_FOUND");
 const entry=matches[0];
 const lm=new Map(lists.map((x:any)=>[String(x.id),String(x.name||"")]));
 const rawList=String(lm.get(String(entry.idList))||"");
 const normalized=rawList.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/\s+/g," ").trim();
 if(!/AGUARDANDO ACERTO|AG\.?\s*ACERTO/.test(normalized))
  throw Error(allowedList("IN",rawList)?"RECEIPT_NOT_ALREADY_PAID":"RECEIPT_WORK_NOT_ELIGIBLE");
 const short=shortLink(entry.shortUrl);
 if(!short)throw Error("RECEIPT_CARD_LINK_INVALID");
 const record=await card(short);
 if(record.id!==entry.id||record.idList!==entry.idList)throw Error("RECEIPT_CARD_MOVED_RETRY");
 const desc=String(record.desc||"");
 const grossLine=desc.match(/^\s*Valor\s+Fechado\s*:\s*R\$\s*([\d.,]+)\s*$/im);
 if(!grossLine||!grossLine[1])throw Error("RECEIPT_CONTRACT_TOTAL_MISSING");
 const gross=amount(grossLine[1]);
 if(!gross||gross!==p.amount_cents)throw Error("RECEIPT_AMOUNT_DIFFERS_FROM_PREVIOUSLY_PAID_WORK");
 const explicit=[...desc.matchAll(/^\s*Valor\s+Recebido\s*:\s*R\$\s*([\d.,]+)\s*$/gim)];
 if(explicit.length>1||explicit.length===0&&/Valor\s+Recebido\s*:/i.test(desc))throw Error("RECEIPT_EXISTING_AMOUNT_AMBIGUOUS");
 if(explicit.length&&amount(explicit[0][1])!==p.amount_cents)throw Error("RECEIPT_RECORDED_AMOUNT_MISMATCH");
 const linked=await existingLinksForCard(record.id,k);
 if(linked.some(x=>x.status!=="FAILED"&&
   (x.payload?.reconciliation_kind==="RECEIPT_EXISTING"||x.payload?.reconciliation_kind==="RECEIPT_TRELLO"||
   x.payload?.reconciliation_kind==="MULTI_TRELLO"&&x.payload?.direction==="IN")&&
   (x.payload?.case===p.case||x.payload?.allocations?.some?.((a:any)=>a.case===p.case))))
  throw Error("RECEIPT_ALREADY_LINKED_TO_THIS_WORK");
 const fp=await sha256(JSON.stringify({type:"RECEIPT_EXISTING",card:record.id,work:p.case,amount:p.amount_cents,
  date:p.date,description_digest:await sha256(desc),list:record.idList,bank:p.operation_id}));
 return {card:record,short,list:rawList,amount_cents:p.amount_cents,fingerprint:fp,
  target:{case:p.case,card_name:String(record.name||""),list:rawList,trello_url:entry.shortUrl,
   line:"Recebimento de "+p.date.slice(8,10)+"/"+p.date.slice(5,7)+": R$ "+
    (p.amount_cents/100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+
    " — obra em AG. ACERTO, sem novo lançamento."}};
}
async function existingReceiptFlow(action:string,p:ReturnType<typeof clean>,raw:any,k:string){
 const prior=await bankAlreadyUsed(p,k);
 if(prior)return reply({...prior,committed:true});
 const pre=await existingReceiptCandidate(p,k);
 if(action==="receipt-existing-preview")return reply({ok:true,preview:true,already_received:true,
  requires_explicit_confirmation:true,target:pre.target,fingerprint:pre.fingerprint,trello_write:false,
  note:"O Trello já classifica esta obra como recebida. Confira o comprovante antes de vincular a movimentação; nenhum valor será escrito no cartão."});
 if(String(raw?.expected_fingerprint||"")!==pre.fingerprint)throw Error("RECEIPT_EXISTING_PREVIEW_CHANGED");
 const payload={case:p.case,date:p.date,direction:"IN",amount_cents:p.amount_cents,reference:p.reference,
  category:"Recebimento",reconciliation_kind:"RECEIPT_EXISTING",trello_match_key:pre.fingerprint,
  trello_line_text:"AG. ACERTO · Valor Fechado confirmado"};
 const claim=await rpc("cr_finance_v12_claim",{p_operation_id:p.operation_id,p_fingerprint:await fingerprint(p),
  p_card_id:pre.card.id,p_payload:payload},k);
 if(claim.ok===true&&claim.claimed===false&&claim.status==="COMMITTED")
  return reply({ok:true,already_committed:true,reconciliation_kind:"RECEIPT_EXISTING",trello_url:pre.target.trello_url});
 if(claim.ok!==true||claim.claimed!==true)throw Error("RECEIPT_EXISTING_ALREADY_CLAIMED");
 try{
  // Final read before marking the bank movement; no Trello PUT/POST.
  const check=await card(pre.short);
  if(check.id!==pre.card.id||check.idList!==pre.card.idList||String(check.desc||"")!==String(pre.card.desc||""))
   throw Error("RECEIPT_WORK_CHANGED_DURING_CONFIRMATION");
  const done=await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,
   p_fingerprint:await fingerprint(p),p_status:"COMMITTED",p_trello_url:pre.target.trello_url,p_error_code:null},k);
  if(done.ok!==true)throw Error("RECEIPT_EXISTING_LEDGER_FINISH_MISSING");
  return reply({ok:true,committed:true,reconciliation_kind:"RECEIPT_EXISTING",target:pre.target,
   trello_write:false});
 }catch(e){
  try{await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:await fingerprint(p),
   p_status:"REVIEW_REQUIRED",p_trello_url:pre.target.trello_url,
   p_error_code:String((e as Error)?.message||e).slice(0,100)},k)}catch{}
  return reply({ok:false,error:"RECEIPT_EXISTING_REVIEW_REQUIRED",possible_trello_write:false},409);
 }
}

async function singleReceipt(action:string,p:ReturnType<typeof clean>,k:string,fp:string){
 const already=await bankAlreadyUsed(p,k);
 if(already)return reply({...already,committed:true});
 const plan=await receiptPlan(p);
 if(action==="preview")return reply({ok:true,preview:true,target:plan.target,receipt:{
  previous_cents:plan.previous_cents,new_cents:p.amount_cents,received_total_cents:plan.received_cents,gross_cents:plan.gross_cents}});
 const claimed=await rpc("cr_finance_v12_claim",{p_operation_id:p.operation_id,p_fingerprint:fp,
  p_card_id:plan.card.id,p_payload:{case:p.case,direction:p.direction,date:p.date,amount_cents:p.amount_cents,
   reference:p.reference,category:"Recebimento",reconciliation_kind:"RECEIPT_TRELLO"}},k);
 if(claimed.ok!==true||claimed.claimed!==true)throw Error(String(claimed.error||"RECEIPT_ALREADY_CLAIMED"));
 try{
  const confirmed=await writeReceipt(plan);
  const done=await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,p_status:"COMMITTED",
   p_trello_url:plan.target.trello_url,p_error_code:null},k);
  if(done.ok!==true)throw Error("RECEIPT_LEDGER_NOT_CONFIRMED");
  try{await tidyCommittedMarker(plan.short,plan.tag,String(confirmed.desc||""))}catch{}
  return reply({ok:true,committed:true,target:plan.target,reconciliation_kind:"RECEIPT_TRELLO",received_total_cents:plan.received_cents});
 }catch(e){
  const error=String((e as Error)?.message||e);
  try{await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,p_status:"REVIEW_REQUIRED",
   p_trello_url:plan.target.trello_url,p_error_code:error.slice(0,100)},k)}catch{}
  return reply({ok:false,error:"RECEIPT_REVIEW_REQUIRED",detail:error.slice(0,100),possible_trello_write:true},409);
 }
}

/* Reconcile multiple existing historical costs without changing a settled work.
 * All parcels must match an explicit date/amount/line in their original cards.
 * Complementary expenses are intentionally NOT forwarded to the legacy writer. */
async function multiExistingFlow(action:string,p:ReturnType<typeof clean>,raw:any,k:string){
 if(p.direction!=="OUT")throw Error("MULTI_EXISTING_DEBIT_ONLY");
 const prior=await bankAlreadyUsed(p,k);if(prior)return reply(prior);
 const parts=splitValidate(raw,p.amount_cents);
 const matches=[];
 for(const part of parts){
  const scan=await existingMatchCandidates({...p,case:part.case,amount_cents:part.cents,amount:(part.cents/100).toFixed(2)},k,part.case,3);
  const selected=String((raw.allocations||[]).find((a:any)=>String(a.case)===part.case)?.match_key||"");
  const exact=scan.matches.filter((x:any)=>x.match_key===selected);
  if(exact.length!==1)throw Error("MULTI_EXISTING_EXPLICIT_LINE_REQUIRED_"+part.case);
  const links=await existingLinksForCard(scan.target.id,k);
  if(links.some((x:any)=>x.status!=="FAILED"&&String(x.payload?.trello_match_key||"")===selected))
   throw Error("MULTI_EXISTING_LINE_ALREADY_LINKED_"+part.case);
  matches.push({case:part.case,cents:part.cents,match_key:selected,line:exact[0].line,
   card_id:scan.target.id,url:scan.target.shortUrl||scan.pre?.target?.trello_url,
   digest:await sha256(String(scan.target.desc||""))});
 }
 const fp=await sha256(JSON.stringify({kind:"MULTI_EXISTING_TRELLO",operation:p.operation_id,
  date:p.date,cents:p.amount_cents,matches}));
 if(action==="multi-preview")return reply({ok:true,preview:true,reconciliation_kind:"MULTI_EXISTING_TRELLO",
  trello_write:false,parts:matches.map(({case:cs,cents,line,url,match_key})=>({case:cs,cents,line,url,match_key})),
  total_cents:p.amount_cents,fingerprint:fp,requires_explicit_confirmation:true});
 if(String(raw.expected_fingerprint||"")!==fp)throw Error("MULTI_EXISTING_PREVIEW_CHANGED");
 const payload={reconciliation_kind:"MULTI_EXISTING_TRELLO",case:p.case,date:p.date,
  amount_cents:p.amount_cents,reference:p.reference,allocations:matches};
 const claim=await rpc("cr_finance_v12_claim",{p_operation_id:p.operation_id,p_fingerprint:fp,
  p_card_id:matches[0].card_id,p_payload:payload},k);
 if(claim.ok!==true||claim.claimed!==true)throw Error("MULTI_EXISTING_LEDGER_ALREADY_CLAIMED");
 try{
  for(const m of matches){
   const now=await card(shortLink(m.url)!);
   if(now.id!==m.card_id||await sha256(String(now.desc||""))!==m.digest)
    throw Error("MULTI_EXISTING_CARD_CHANGED_"+m.case);
  }
  const done=await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,
   p_fingerprint:fp,p_status:"COMMITTED",p_trello_url:matches[0].url,p_error_code:null},k);
  if(done.ok!==true)throw Error("MULTI_EXISTING_LEDGER_FINISH_UNCONFIRMED");
  return reply({ok:true,committed:true,reconciliation_kind:"MULTI_EXISTING_TRELLO",
   trello_write:false,total_cents:p.amount_cents,parts:matches.map(({case:cs,cents,url})=>({case:cs,cents,url}))});
 }catch(e){
  try{await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,
   p_status:"REVIEW_REQUIRED",p_trello_url:matches[0].url,
   p_error_code:String((e as Error).message||e).slice(0,90)},k)}catch{}
  throw Error("MULTI_EXISTING_REVIEW_REQUIRED");
 }
}
async function multiFlow(action:string,p:ReturnType<typeof clean>,raw:any,k:string){
 if(raw?.mode==="reconcile-existing")return multiExistingFlow(action,p,raw,k);
 const already=await bankAlreadyUsed(p,k);if(already)return reply(already);
 const parts=splitValidate(raw,p.amount_cents);
 const eligible=await liveCases(p.direction);
 // Settled jobs must never reach the legacy financial writer.
 const byCase=new Map(eligible.map((x:any)=>[x.case,x]));
 const list=parts.map(part=>({...part,card:byCase.get(part.case)}));
 if(list.some(x=>!x.card))throw Error("TARGET_CASE_NOT_ELIGIBLE_OR_DUPLICATE");
 const planned=[];
 for(const part of list){
  const itemId="CORA_"+await sha256("CR-CORA-MULTI-ITEM-V1|"+p.operation_id+"|"+part.case);
  const child={...p,operation_id:itemId,case:part.case,amount:(part.cents/100).toFixed(2),
   amount_cents:part.cents,category:p.direction==="IN"?"Recebimento":p.category,
   counterparty:p.counterparty,description:p.description,reference:"Cora"};
  const tagged=withMarker(child);
  const receipt=p.direction==="IN"?await receiptPlan(child,part.card as {case:string;id:string;url:string;list:string;name:string}):null;
  const target=receipt?{duplicate:false,target:receipt.target}:await legacy("manual-cora-preview",tagged,k);
  const link=String(target?.target?.trello_url||"");
  if(target.duplicate||shortLink(link)!==shortLink((part.card as any).url))throw Error("MULTI_TARGET_PREVIEW_CONFLICT_"+part.case);
  const fresh=await card(shortLink(link)!);
  const tag="CRV12OP_"+itemId;
  if(String(fresh.desc||"").includes(tag))throw Error("MULTI_ITEM_ALREADY_PRESENT_REVIEW");
  planned.push({case:part.case,cents:part.cents,id:(part.card as any).id,url:link,
   card_name:(part.card as any).name,tag,tagged,receipt,target:target.target,desc_digest:await sha256(String(fresh.desc||""))});
 }
 const fp=await sha256(JSON.stringify({type:"MULTI_TRELLO",bank:p.operation_id,
  direction:p.direction,date:p.date,cents:p.amount_cents,parts,
  targets:planned.map(x=>({id:x.id,desc_digest:x.desc_digest}))}));
 if(action==="multi-preview")return reply({ok:true,preview:true,bank_amount_centavos:p.amount_cents,
   direction:p.direction,parts:planned.map(({case:cs,cents,card_name,url,target})=>({case:cs,cents,card_name,url,line:target.line})),
   fingerprint:fp,source:"LIVE_TRELLO_CASES"});
 if(String(raw?.expected_fingerprint||"")!==fp)throw Error("MULTI_PREVIEW_CHANGED");
 const payload={case:p.case,date:p.date,direction:p.direction,amount_cents:p.amount_cents,category:p.category,
  reference:p.reference,reconciliation_kind:"MULTI_TRELLO",allocations:parts};
 const claim=await rpc("cr_finance_v12_claim",{p_operation_id:p.operation_id,p_fingerprint:fp,
  p_card_id:planned[0].id,p_payload:payload},k);
 if(claim.ok!==true||claim.claimed!==true)return reply({ok:false,error:claim.error||"MULTI_ALREADY_CLAIMED",status:claim.status},409);
 const wrote=[];
 try{
  for(const part of planned){
   const wr=part.receipt?{committed:true,duplicate:false}:await legacy("manual-cora-commit",part.tagged,k);
   if(wr?.committed!==true||wr?.duplicate===true)throw Error("MULTI_WRITE_NOT_NEW_"+part.case);
   const confirmed=part.receipt?await writeReceipt(part.receipt):await card(shortLink(part.url)!);
   if(!String(confirmed.desc||"").includes(part.tag))throw Error("MULTI_ITEM_NOT_VERIFIED_"+part.case);
   wrote.push({...part,confirmed});
  }
  const done=await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,
   p_status:"COMMITTED",p_trello_url:planned[0].url,p_error_code:null},k);
  if(done.ok!==true)throw Error("MULTI_LEDGER_FINISH_NOT_CONFIRMED");
  for(const part of wrote){try{await tidyCommittedMarker(shortLink(part.url)!,part.tag,String(part.confirmed.desc||""))}catch{}}
  return reply({ok:true,committed:true,reconciliation_kind:"MULTI_TRELLO",parts:planned.map(x=>({case:x.case,cents:x.cents,url:x.url})),
   total_cents:p.amount_cents});
 }catch(e){
  const error=String((e as Error)?.message||e).slice(0,99);
  try{await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,
   p_status:"REVIEW_REQUIRED",p_trello_url:planned[0].url,p_error_code:error},k)}catch{}
  return reply({ok:false,error:"PARTIAL_MULTI_REVIEW_REQUIRED",detail:error,possible_trello_write:true,
   verified_parts:wrote.map(x=>({case:x.case,cents:x.cents}))},409);
 }
}
/* Read-only settlement attribution of a real Cora debit to a selected acerto
 * period. A withdrawal is not a job cost, nor a Capital de Giro debit.
 * The existing financial ledger guarantees a bank source ID is only claimed once.
 * This action does not write to Trello or Cora. */
/* Director-only, read-only bank-settled withdrawals, never rateios inferred. */
async function withdrawalHistory(raw:any,k:string){
 const u=new URL(SB+"/rest/v1/cr_finance_v12_operations");
 u.searchParams.set("select","operation_id,payload,created_at,updated_at,trello_url");
 u.searchParams.set("payload->>reconciliation_kind","eq.WITHDRAWAL_SETTLEMENT");
 u.searchParams.set("status","eq.COMMITTED");
 u.searchParams.set("order","updated_at.desc");u.searchParams.set("limit","500");
 const r=await fetch(u,{headers:headers(k),signal:AbortSignal.timeout(18000)});
 if(!r.ok)throw Error("WITHDRAWAL_LEDGER_HISTORY_UNAVAILABLE");
 const all=await r.json();
 if(!Array.isArray(all))throw Error("WITHDRAWAL_HISTORY_INVALID");
 const year=String(raw?.year||"").trim(),month=String(raw?.month||"").trim();
 if(year&&!/^20\d{2}$/.test(year))throw Error("WITHDRAWAL_YEAR_INVALID");
 if(month&&!/^(0[1-9]|1[0-2])$/.test(month))throw Error("WITHDRAWAL_MONTH_INVALID");
 const rows=all.map((x:any)=>({id:String(x.operation_id||""),date:String(x.payload?.date||""),
  period:String(x.payload?.period||""),period_id:String(x.payload?.period_id||""),
  beneficiary:String(x.payload?.beneficiary||""),
  amount_cents:Number(x.payload?.amount_cents||0),
  bank_reference:String(x.payload?.reference||""),
  trello_url:String(x.trello_url||""),registered_at:String(x.updated_at||"")}))
  .filter((x:any)=>/^20\d{2}-\d{2}-\d{2}$/.test(x.date)&&Number.isSafeInteger(x.amount_cents)&&x.amount_cents>0)
  .filter((x:any)=>(!year||x.date.startsWith(year))&&(!month||x.date.slice(5,7)===month));
 return {ok:true,source:"V12_SETTLED_WITHDRAWALS_CORA",rows,total_cents:rows.reduce((a:number,x:any)=>a+x.amount_cents,0),
  count:rows.length,read_only:true,filters:{year:year||null,month:month||null}};
}
async function withdrawalFlow(req:Request,action:string,p:ReturnType<typeof clean>,raw:any,k:string){
 if(p.direction!=="OUT"||!p.operation_id.startsWith("CORA_"))throw Error("WITHDRAWAL_REQUIRES_VERIFIED_CORA_DEBIT");
 const beneficiary=String(raw?.beneficiary||"").trim().toUpperCase();
 if(!["FABRICIO","EDER","ROGERIO","GABRIELLY"].includes(beneficiary))throw Error("WITHDRAWAL_BENEFICIARY_INVALID");
 const periodId=String(raw?.period_id||"").trim();
 if(!/^[0-9a-f]{24}$/.test(periodId))throw Error("WITHDRAWAL_PERIOD_INVALID");
 const note=String(raw?.justification||"").trim().slice(0,300);
 if(!note)throw Error("WITHDRAWAL_JUSTIFICATION_REQUIRED");
 const r=await fetch(SB+"/functions/v1/"+CG_FUNCTION+"?action=periods",{
  headers:{"x-cr-session":req.headers.get("x-cr-session")||""},
  signal:AbortSignal.timeout(25000)});
 const j=await r.json().catch(()=>({ok:false}));
 if(!r.ok||j.ok!==true||!Array.isArray(j.periods))throw Error("WITHDRAWAL_PERIODS_UNAVAILABLE");
 const found=j.periods.filter((x:any)=>String(x.id)===periodId);
 if(found.length!==1)throw Error("WITHDRAWAL_PERIOD_NOT_FOUND");
 const period=found[0];
 const fp=await sha256(JSON.stringify({kind:"WITHDRAWAL_SETTLEMENT",bank:p.operation_id,
  amount_cents:p.amount_cents,date:p.date,period_id:periodId,beneficiary,justification:note}));
 const result={ok:true,period:{id:periodId,label:String(period.period||""),url:String(period.url||"")},
   beneficiary,date:p.date,bank_reference:p.reference,amount_cents:p.amount_cents,
   classification:"RETIRADA_PAGA_CORA",fingerprint:fp,writes:false};
 if(action==="withdrawal-preview")return reply({...result,preview:true});
 const prev=await bankAlreadyUsed(p,k);
 if(prev){
  // A bank debit already committed as an expense or CG use must never be
  // presented as a successfully linked withdrawal for this period.
  const prior=await existingLinksForCardIdByOperation(p.operation_id,k);
  const saved=prior?.payload||{};
  if(prev.reconciliation_kind!=="WITHDRAWAL_SETTLEMENT"||
     saved.period_id!==periodId||saved.beneficiary!==beneficiary||
     saved.justification!==note||saved.amount_cents!==p.amount_cents)
    throw Error("BANK_OPERATION_ALREADY_CLASSIFIED_DIFFERENTLY");
  return reply({...result,already_committed:true,writes:false,ledger_only:true});
 }
 if(String(raw?.expected_fingerprint||"")!==fp)throw Error("WITHDRAWAL_PREVIEW_CHANGED");
 const payload={case:null,direction:"OUT",date:p.date,amount_cents:p.amount_cents,
  category:"Retiradas",reference:p.reference,
  reconciliation_kind:"WITHDRAWAL_SETTLEMENT",beneficiary,period_id:periodId,
  period:String(period.period||""),justification:note,bank_transaction_id:p.operation_id,
  bank_original_description:p.description};
 const claim=await rpc("cr_finance_v12_claim",{p_operation_id:p.operation_id,
  p_fingerprint:fp,p_card_id:periodId,p_payload:payload},k);
 if(claim.ok!==true||claim.claimed!==true)throw Error("WITHDRAWAL_OPERATION_ALREADY_CLAIMED");
 try{
  // Metadata only. A bank debit is never issued or duplicated here.
  const done=await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,
   p_fingerprint:fp,p_status:"COMMITTED",p_trello_url:String(period.url||"")||null,
   p_error_code:null},k);
  if(done.ok!==true)throw Error("WITHDRAWAL_LEDGER_CONFIRMATION_FAILED");
  return reply({...result,committed:true,writes:true,ledger_only:true});
 }catch(e){
  try{await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,
   p_fingerprint:fp,p_status:"REVIEW_REQUIRED",
   p_trello_url:String(period.url||"")||null,
   p_error_code:String((e as Error).message||e).slice(0,100)},k)}catch{}
  throw Error("WITHDRAWAL_REVIEW_REQUIRED");
 }
}
async function capitalBridge(req:Request,action:string,p:ReturnType<typeof clean>,raw:any,k:string){
 if(p.direction!=="OUT")throw Error("CAPITAL_REQUIRES_BANK_DEBIT");
 const origin=SB+"/functions/v1/"+CG_FUNCTION;
 const auth=req.headers.get("x-cr-session")||"";
 const requestCapital=async(kind:string,body?:any)=>{
  const r=await fetch(origin+"?action="+kind,{method:body?"POST":"GET",headers:{"x-cr-session":auth,
    ...(body?{"content-type":"application/json"}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});
  const j=await r.json().catch(()=>({ok:false,error:"CAPITAL_RESPONSE_INVALID"}));
  if(!r.ok||j?.ok!==true)throw Error("CAPITAL_"+String(j?.error||r.status));
  return j;
 };
 const periods=await requestCapital("periods");
 const available=Array.isArray(periods.periods)?periods.periods:[];
 if(action==="capital-periods")return reply({ok:true,periods:available,source:"V11_CAPITAL_LIVE"});
 const allocations=(Array.isArray(raw?.allocations)?raw.allocations:[]).map((x:any)=>({id:String(x.id||""),cents:Number(x.cents)}));
 if(!allocations.length||allocations.length>20||new Set(allocations.map(a=>a.id)).size!==allocations.length
   ||allocations.some(a=>!Number.isSafeInteger(a.cents)||a.cents<=0)||allocations.reduce((v,a)=>v+a.cents,0)!==p.amount_cents)
  throw Error("CAPITAL_ALLOCATION_SUM_INVALID");
 const byId=new Map(available.map((x:any)=>[x.id,x]));
 if(allocations.some(a=>!byId.has(a.id)))throw Error("CAPITAL_PERIOD_NOT_FOUND");
 for(const a of allocations){if(Number((byId.get(a.id) as any).balance_cents)<a.cents)throw Error("CAPITAL_INSUFFICIENT_"+a.id)}
 const sorted=[...allocations].sort((a,b)=>a.id.localeCompare(b.id));
 const fp=await sha256(JSON.stringify({type:"CAPITAL_GIRO",bank:p.operation_id,
  allocations:sorted,balances:sorted.map(a=>({id:a.id,balance_cents:(byId.get(a.id) as any).balance_cents}))}));
 const response={ok:true,preview:true,source:"V11_CAPITAL_LIVE",total_cents:p.amount_cents,fingerprint:fp,
  allocations:allocations.map(a=>({id:a.id,cents:a.cents,period:(byId.get(a.id) as any).period,
   balance_cents:(byId.get(a.id) as any).balance_cents}))};
 if(action==="capital-preview")return reply(response);
 const already=await bankAlreadyUsed(p,k);if(already)return reply(already);
 if(raw?.expected_fingerprint!==fp)throw Error("CAPITAL_PREVIEW_CHANGED");
 const payload={case:"CAPITAL_GIRO",date:p.date,direction:p.direction,amount_cents:p.amount_cents,reference:p.reference,
  category:p.category,reconciliation_kind:"CAPITAL_GIRO",allocations};
 const claim=await rpc("cr_finance_v12_claim",{p_operation_id:p.operation_id,p_fingerprint:fp,
  p_card_id:allocations[0].id,p_payload:payload},k);
 if(claim.ok!==true||claim.claimed!==true)return reply({ok:false,error:claim.error||"CAPITAL_OPERATION_CLAIMED"},409);
 try{
  const x=await requestCapital("debit",{operation_id:p.operation_id,total_cents:p.amount_cents,
   description:(p.category||"Custo")+" · "+(p.description||p.counterparty||"Cora"),allocations});
  if(x.booked!==true)throw Error("CAPITAL_DEBIT_NOT_CONFIRMED");
  const done=await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,
   p_status:"COMMITTED",p_trello_url:(byId.get(allocations[0].id) as any).url||null,p_error_code:null},k);
  if(done.ok!==true)throw Error("CAPITAL_LEDGER_FINISH_UNCONFIRMED");
  return reply({ok:true,committed:true,reconciliation_kind:"CAPITAL_GIRO",allocations,amount_cents:p.amount_cents});
 }catch(e){
  try{await rpc("cr_finance_v12_finish",{p_operation_id:p.operation_id,p_fingerprint:fp,p_status:"REVIEW_REQUIRED",
   p_trello_url:(byId.get(allocations[0].id) as any).url||null,p_error_code:String((e as Error)?.message||e).slice(0,100)},k)}catch{}
  return reply({ok:false,error:"CAPITAL_REVIEW_REQUIRED",detail:String((e as Error)?.message||e).slice(0,100),
   possible_trello_write:true},409);
 }
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
    state:verifiedReference&&record.status==="COMMITTED"?(record.payload?.reconciliation_kind==="RECEIPT_EXISTING"?"RECEIPT_EXISTING":record.payload?.reconciliation_kind==="EXISTING_TRELLO"?"TRELLO_EXISTING":record.payload?.reconciliation_kind==="MULTI_TRELLO"?"TRELLO_MULTI":record.payload?.reconciliation_kind==="CAPITAL_GIRO"?"CAPITAL_CONFIRMED":"TRELLO_CONFIRMED"): "REVIEW_REQUIRED",
    reconciliation_kind:record.payload?.reconciliation_kind||"DIRECT_TRELLO",
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
 if(req.method!=="POST"||!["preview","commit","status","bank-status","existing-preview","existing-confirm","eligible-cases","multi-preview","multi-commit","capital-periods","capital-preview","capital-commit","withdrawal-history","withdrawal-preview","withdrawal-commit","receipt-existing-preview","receipt-existing-confirm"].includes(action))return reply({ok:false,error:"METHOD_NOT_ALLOWED"},405);
 if(!await director(req))return reply({ok:false,error:"DIRECTOR_SESSION_REQUIRED"},401);
 const k=key();if(!k)return reply({ok:false,error:"SERVICE_AUTH_UNAVAILABLE"},503);
 let raw:any=null;
 try{const t=await req.text();if(t.length>10000)return reply({ok:false,error:"PAYLOAD_TOO_LARGE"},413);raw=JSON.parse(t)}catch{return reply({ok:false,error:"INVALID_JSON"},400)}
 if(action==="eligible-cases"){
  try{const direction=String(raw?.direction||"IN");return reply({ok:true,cases:await liveCases(direction),source:"TRELLO_2026_LIVE"})}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e)},502)}
 }
 if(action==="withdrawal-history"){
  try{return reply(await withdrawalHistory(raw,k))}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e)},503)}
 }
 if(action==="bank-status"){
  try{const data=await batchBankStatus(raw,k);return reply(data,data.ok?200:400)}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e)},502)}
 }
 let p:ReturnType<typeof clean>;
 try{p=clean(raw)}catch(e){return reply({ok:false,error:String(e?.message||e)},400)}
 try{await verifiedBankOrigin(p,k)}
 catch(e){return reply({ok:false,error:String((e as Error)?.message||e)},409)}
 if(action==="receipt-existing-preview"||action==="receipt-existing-confirm"){
  try{return await existingReceiptFlow(action,p,raw,k)}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e).slice(0,135),possible_trello_write:false},409)}
 }
 if(action==="multi-preview"||action==="multi-commit"){
  try{return await multiFlow(action,p,raw,k)}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e).slice(0,120)},409)}
 }
 if(action==="withdrawal-preview"||action==="withdrawal-commit"){
  try{return await withdrawalFlow(req,action,p,raw,k)}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e).slice(0,120)},409)}
 }
 if(["capital-periods","capital-preview","capital-commit"].includes(action)){
  try{return await capitalBridge(req,action,p,raw,k)}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e).slice(0,120)},409)}
 }
 const fp=await fingerprint(p),tag="CRV12OP_"+p.operation_id;
 if(p.direction==="IN"&&(action==="preview"||action==="commit")){
  try{return await singleReceipt(action,p,k,fp)}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e).slice(0,120)},409)}
 }
 if(action==="existing-preview"||action==="existing-confirm"){
  try{return await reconcileExisting(action,p,raw,k,fp)}
  catch(e){return reply({ok:false,error:String((e as Error)?.message||e).slice(0,110),possible_trello_write:false},409)}
 }
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
  if(p.direction==="IN"&&!allowedList("IN",String(pre?.target?.list||"")))throw Error("RECEIPT_TARGET_ALREADY_PAID_OR_INELIGIBLE");
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
