import "jsr:@supabase/functions-js/edge-runtime.d.ts";
/* CONSTRU-REI: ONLY Trello-declared financial-settlement summary.
 * 2023: bank-only, no operating Trello KPI. 2024/25: do not invent a settlement source.
 * This endpoint is read-only: it NEVER mutates bank/Trello/cards/operations/CG.
 */
const SB=(Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co").replace(/\/$/,"");
const CARD="6add3128f02eef0b8a7d69b5"; // Trello GESTÃO FINANCEIRA / resumo financeiro anual 2026
const CARD_2024="6ab1b9314159bc6227a4efea"; // GESTÃO DE OBRAS 2024 annual, original 50/50 legacy rules
const CARD_2025="6ab1c5c887007ac7e2368b2f"; // GESTÃO DE OBRAS 2025 annual, revenue confirmed, profit partial
const CORS={"access-control-allow-origin":"https://rogeriocibin-alt.github.io","access-control-allow-headers":"x-cr-session,content-type","access-control-allow-methods":"GET,OPTIONS","cache-control":"no-store","vary":"Origin","x-content-type-options":"nosniff"};
const output=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...CORS,"content-type":"application/json; charset=utf-8"}});
function sec(k:string){return (Deno.env.get(k)||"").trim()}
async function sessionValid(req:Request){
 const session=req.headers.get("x-cr-session")||"";
 if(session.length<12||session.length>500)return false;
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
 try{
  const r=await fetch(SB+"/functions/v1/central-gestao-api?api=me",{headers:{"x-cr-session":session},signal:controller.signal});
  const j=await r.json().catch(()=>null);
  return r.ok && j?.ok===true;
 }catch{return false}finally{clearTimeout(timeout)}
}
function parseBR(v:string){
 if(!/^\d{1,3}(?:\.\d{3})*,\d{2}$|^\d+,\d{2}$/.test(v))return null;
 const [whole,fraction]=v.split(",");
 const n=Number(whole.replace(/\./g,""))*100+Number(fraction);
 return Number.isSafeInteger(n)?n:null;
}
function sourceLine(section:string,re:RegExp):number|null{
 const m=section.match(re);
 return m?parseBR(m[1]):null;
}
function annualSummary(card:any){
 const desc=String(card?.desc||"");
 const title=String(card?.name||"");
 if(!/RESUMO ANUAL FINANCEIRO 2026/i.test(title) ||
    !desc.includes("CR-ANUAL-VALORES-RECEBIDOS-2026-PARCIAL-V2-20261025"))
 throw Error("FINANCIAL_SOURCE_NOT_CANONICAL");
 const start=desc.indexOf("TOTAIS DE RATEIO/RETIRADAS DECLARADOS");
 const end=desc.indexOf("QUADRO MENSAL",start);
 if(start<0||end<=start)throw Error("FINANCIAL_SHARES_SECTION_MISSING");
 const section=desc.slice(start,end);
 const people={
  fabricio:sourceLine(section,/^[^\r\n]*Fabrício\s*:\s*R\$\s*([\d.,]+)/mi),
  eder:sourceLine(section,/^[^\r\n]*Éder\s*:\s*R\$\s*([\d.,]+)/mi),
  rogerio:sourceLine(section,/^[^\r\n]*Rogério\s*:\s*R\$\s*([\d.,]+)/mi),
  gabrielly:sourceLine(section,/^[^\r\n]*Gabrielly\s*:\s*R\$\s*([\d.,]+)/mi),
  agata_historical:sourceLine(section,/^[^\r\n]*Ágata histórica\s*:\s*R\$\s*([\d.,]+)/mi),
 };
 const capital=sourceLine(section,/^[^\r\n]*Capital de Giro do rateio informado\s*:\s*R\$\s*([\d.,]+)/mi);
 const stated=sourceLine(section,/^[^\r\n]*Soma das parcelas descritas\s*:\s*R\$\s*([\d.,]+)/mi);
 const gross=sourceLine(desc,/BRUTO DOS ACERTOS REGISTRADOS \(JAN[–-]SET\)\s*:\s*R\$\s*([\d.,]+)/i);
 const cost=sourceLine(desc,/CUSTOS DECLARADOS NOS RESUMOS\s*:\s*R\$\s*([\d.,]+)/i);
 const profit=sourceLine(desc,/LUCRO LÍQUIDO DECLARADO\s*:\s*R\$\s*([\d.,]+)/i);
 const all=[...Object.values(people),capital,stated,gross,cost,profit];
 if(all.some(v=>v===null||v<0))throw Error("FINANCIAL_SUMMARY_VALUE_MISSING");
 const calculated=Object.values(people).reduce((a,b)=>a+(b||0),0)+(capital||0);
 if(calculated!==stated)throw Error("FINANCIAL_SHARES_SUM_MISMATCH");
 if(people.eder!==4246287||people.rogerio!==4246288) {
  // A changed canonical summary is allowed only when internal sums still work.
  if(people.eder==null||people.rogerio==null)throw Error("FINANCIAL_PEOPLE_MISSING");
 }
 return {
  ok:true,year:2026,coverage:"JAN-SET",coverage_end:"2026-09-30",status:"TRELLO_DECLARED_UNRECONCILED",
  kind:"ALLOCATIONS_DECLARED_NOT_CONFIRMED_BANK_WITHDRAWALS",
  gross_cents:gross,cost_cents:cost,declared_profit_cents:profit,
  declared_by_person_cents:people,capital_declared_cents:capital,
  sum_declared_shares_cents:calculated,declared_minus_profit_cents:calculated-(profit||0),
  profit_arithmetic_difference_cents:(gross||0)-(cost||0)-(profit||0),
  asof_trello:card.dateLastActivity||null,source_url:"https://trello.com/c/3CddF0rf",
  source_card_id:CARD,bank_withdrawal_proof:false,trello_updated_live:true,
  notes:["2023 só movimentação bancária Cora","Resumo 2026 declarado, não prova transferência bancária","Rateio histórico abril apresenta inconsistência conhecida; não ajustar lançamentos antigos"]
 };
}

function annual2024(card:any){
 const desc=String(card?.desc||"");
 if(!/RESUMO ANUAL 2024/.test(String(card?.name||""))||!desc.includes("CR-TRELLO-ANNUAL-SUMMARY-V3"))throw Error("FINANCIAL_2024_SOURCE_NOT_CANONICAL");
 const start=desc.indexOf("RATEIO HISTÓRICO CONFIRMADO"),end=desc.indexOf("Total de destinações confirmadas",start);
 if(start<0||end<start)throw Error("FINANCIAL_2024_SHARE_SECTION_MISSING");
 const section=desc.slice(start,end);
 const people={
  fabricio:sourceLine(section,/^[^\r\n]*Fabrício\s*:\s*R\$\s*([\d.,]+)/mi),
  eder:sourceLine(section,/^[^\r\n]*Éder\s*:\s*R\$\s*([\d.,]+)/mi),
  rogerio:sourceLine(section,/^[^\r\n]*Rogério\s*:\s*R\$\s*([\d.,]+)/mi),
  camila:sourceLine(section,/^[^\r\n]*Camila\s*:\s*R\$\s*([\d.,]+)/mi)
 };
 const capital=sourceLine(section,/^[^\r\n]*Capital de Giro explícito\s*:\s*R\$\s*([\d.,]+)/mi);
 const unidentified=sourceLine(section,/^[^\r\n]*13%\s*legado sem atribuição nominal\s*:\s*R\$\s*([\d.,]+)/mi);
 const stated=sourceLine(desc,/Total de destinações confirmadas\s*:\s*R\$\s*([\d.,]+)/mi);
 const gross=sourceLine(desc,/^[^\r\n]*Bruto\s*:\s*R\$\s*([\d.,]+)/mi);
 const cost=sourceLine(desc,/^[^\r\n]*Custos\s*:\s*R\$\s*([\d.,]+)/mi);
 const profit=sourceLine(desc,/^[^\r\n]*Lucro\/Saldo consolidado\s*:\s*R\$\s*([\d.,]+)/mi);
 if([...Object.values(people),capital,unidentified,stated,gross,cost,profit].some(x=>x===null||x<0))throw Error("FINANCIAL_2024_VALUE_MISSING");
 const computed=Object.values(people).reduce((a,b)=>a+(b||0),0)+(capital||0)+(unidentified||0);
 if(computed!==stated)throw Error("FINANCIAL_2024_TOTAL_NOT_EQUAL_ITEMS");
 return {ok:true,year:2024,status:"TRELLO_HISTORICAL_ALLOCATION_PARTIAL",
  kind:"ALLOCATIONS_DECLARED_NOT_CONFIRMED_BANK_WITHDRAWALS",
  source:"TRELLO_OBRAS_ANNUAL_2024",source_url:"https://trello.com/c/cGFAsZTN",
  source_card_id:CARD_2024,asof_trello:card.dateLastActivity||null,
  gross_cents:gross,cost_cents:cost,declared_profit_cents:profit,
  declared_by_person_cents:people,capital_declared_cents:capital,
  legacy_unattributed_cents:unidentified,sum_declared_shares_cents:computed,
  declared_minus_profit_cents:computed-(profit||0),
  profit_arithmetic_difference_cents:(gross||0)-(cost||0)-(profit||0),
  issues_count:54,bank_withdrawal_proof:false,trello_updated_live:true,
  notes:["Regra histórica 50/50 até julho; transição em agosto; nominal depois","54 obras a conferir","Lucro histórico não deve ser alterado para forçar fechamento"]};
}
function annual2025(card:any){
 const desc=String(card?.desc||"");
 if(!/RESUMO ANUAL 2025/.test(String(card?.name||""))||!desc.includes("CR-TRELLO-ANNUAL-SUMMARY-2025-RECON-V2"))throw Error("FINANCIAL_2025_SOURCE_NOT_CANONICAL");
 const gross=sourceLine(desc,/Faturamento anual reconciliado\s*:\s*R\$\s*([\d.,]+)/mi);
 const works=Number(desc.match(/Obras finalizadas\s*:\s*(\d+)/i)?.[1]||0);
 if(gross===null||gross<=0||works<=0)throw Error("FINANCIAL_2025_REVENUE_UNVERIFIED");
 return {ok:true,year:2025,status:"TRELLO_GROSS_RECONCILED_PROFIT_PARTIAL",
  kind:"ANNUAL_GROSS_ONLY_NO_CONFIRMED_WITHDRAWALS",
  source:"TRELLO_OBRAS_ANNUAL_2025",source_url:"https://trello.com/c/VmkhcR7e",
  source_card_id:CARD_2025,asof_trello:card.dateLastActivity||null,
  gross_cents:gross,cases:works,declared_profit_cents:null,
  declared_by_person_cents:null,bank_withdrawal_proof:false,trello_updated_live:true,
  notes:["Faturamento anual reconciliado em 12 meses","Lucro parcial devido à obra 213-24 sem fechamento final","Não atribuir retiradas a sócios sem fonte financeira confirmada"]};
}


function privilegedKey(){
 let role=sec("SUPABASE_SERVICE_ROLE_KEY");
 if(role)return role;
 try{const keys=JSON.parse(sec("SUPABASE_SECRET_KEYS")||"{}");return String(keys.default||keys.service_role||Object.values(keys)[0]||"");}catch{return ""}
}
function supportBeneficiary(original:string,lineText:string){
 if(original!=="Outro prestador (identificar)")return original;
 const n=lineText.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 if(/\bbia(?:\s+dietz)?\b/.test(n))return "Bia (conferir identidade)";
 if(/\braf(?:a|aele|ael)\b/.test(n))return "Rafa / Rafaele (conferir identidade)";
 if(/\bmarcelo\b/.test(n))return "Marcelo";
 if(/\bgabriel\b/.test(n))return "Gabriel (conferir identidade)";
 if(/\bmaicon\b/.test(n))return "Maicon";
 if(/\bandre[y]?\b/.test(n))return "André / Andrey (conferir identidade)";
 if(/\bjhow\b/.test(n))return "Jhow";
 return original;
}
async function financeSupport2026(){
 const role=privilegedKey();
 if(!role)return output({ok:false,error:"DB_SERVICE_NOT_AVAILABLE"},503);
 const headers={authorization:"Bearer "+role,apikey:role,accept:"application/json"};
 const base=SB+"/rest/v1/";
 const endpoints=[
   "cr_finance_v12_support_2026_source?select=work_code,source_card_id,source_url,line_number,line_text,payment_kind,beneficiary,amount_cents,evidence_state,last_synced_at&order=work_code.asc,line_number.asc&limit=1000",
   "cr_cora_bank_annotations_v12?select=beneficiary,direction,amount_cents,created_at&direction=eq.OUT&limit=1000"
 ];
 try{
 const all=await Promise.all(endpoints.map(async url=>{
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),15000);
  try{
    const res=await fetch(base+url,{headers,signal:ctl.signal});
    if(!res.ok)throw Error("DB_SUPPORT_READ_FAILED_"+res.status);
    const data=await res.json();
    if(!Array.isArray(data))throw Error("DB_SUPPORT_INVALID_RESPONSE");
    return data;
  }finally{clearTimeout(t)}
 }));
 const rows=all[0],bankNotes=all[1];
 if(rows.length>=1000||bankNotes.length>=1000)throw Error("SUPPORT_SOURCE_PAGINATION_REQUIRED");
 const byPerson:Record<string,{total_cents:number,lines:number,works:Set<string>,missing:number}>={};
 let total=0,missing=0;
 const flagged:any[]=[];
 for(const r of rows){
   const name=supportBeneficiary(String(r.beneficiary||"Outro prestador (identificar)"),String(r.line_text||""));
   byPerson[name]??={total_cents:0,lines:0,works:new Set<string>(),missing:0};
   const p=byPerson[name],v=Number(r.amount_cents);
   p.lines++;if(r.work_code)p.works.add(String(r.work_code));
   if(!Number.isSafeInteger(v)||v<=0){missing++;p.missing++;flagged.push({case:r.work_code,line_number:r.line_number,reason:"MISSING_AMOUNT"});continue}
   p.total_cents+=v;total+=v;
   if((String(r.evidence_state||"")!=="TRELLO_COST_LINE_UNRECONCILED" || name.includes("conferir identidade")) && flagged.length<30){
     flagged.push({case:r.work_code,line_number:r.line_number,reason:String(r.evidence_state||"REVIEW")});
   }
 }
 const support=Object.fromEntries(Object.entries(byPerson).map(([name,v])=>[name,{total_cents:v.total_cents,lines:v.lines,works:v.works.size,missing_amounts:v.missing}]));
 const bank=Object.fromEntries(bankNotes.filter(r=>r.direction==="OUT").map(r=>[String(r.beneficiary||"").trim(),0]));
 for(const r of bankNotes){
   if(r.direction!=="OUT")continue;
   const key=String(r.beneficiary||"").trim(),v=Number(r.amount_cents);
   if(Number.isSafeInteger(v)&&v>0)bank[key]=(bank[key]||0)+v;
 }
 const asof=rows.reduce((mx,r)=>String(r.last_synced_at||"")>mx?String(r.last_synced_at):mx,"");
 return output({ok:true,year:2026,kind:"TRELLO_SUPPORT_DAILY_COST_LINES",
  source:"SUPABASE_DERIVED_FROM_TRELLO_2026_SNAPSHOT",stage_snapshot_asof:asof,
  totals:{amount_cents:total,lines:rows.length,missing_amounts:missing,distinct_works:new Set(rows.map(r=>String(r.work_code||""))).size},
  by_person:support,needs_review:flagged.slice(0,30),
  bank_annotations_out_by_beneficiary_cents:bank,
  bank_annotations_count:bankNotes.length,
  bank_annotations_are_separate_from_costs:true,
  sums_must_not_be_added_to_bank_notes:true,
  bank_withdrawal_proof:false,
  limitations:["Linha de custo Trello, não prova de pagamento bancário","Base operacional importada: atualização registrada em stage_snapshot_asof","João não equivale automaticamente a João Victor","Não aplicar rateios de 2026 retroativamente aos anos 2024/25","Valores de apoio/diárias não devem integrar percentual do rateio"]});
 }catch(e){return output({ok:false,error:String((e as Error)?.message||e).slice(0,110)},502)}
}

Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(req.method!=="GET")return output({ok:false,error:"READ_ONLY"},405);
 const u=new URL(req.url),year=u.searchParams.get("year")||"2026";
 if(!["2023","2024","2025","2026"].includes(year))return output({ok:false,error:"INVALID_YEAR"},400);
 if(!await sessionValid(req))return output({ok:false,error:"DIRECTOR_OR_USER_SESSION_REQUIRED"},401);
 if(year==="2023")return output({ok:true,year:2023,bank_only:true,trello_financial_summary:null,source:"CORA_ONLY_2023"});
 if(u.searchParams.get("kind")==="support"){
  if(year!=="2026")return output({ok:true,year:Number(year),source:"TRELLO_SOURCE_PENDING_HISTORICAL_RECONCILIATION",support_rows:null,financial_amounts_not_assumed:true});
  return financeSupport2026();
 }
 const cardId=year==="2024"?CARD_2024:year==="2025"?CARD_2025:CARD;
 const key=sec("TRELLO_API_KEY"),token=sec("TRELLO_API_TOKEN");
 if(!key||!token)return output({ok:false,error:"TRELLO_BACKEND_CREDENTIALS_UNAVAILABLE"},503);
 const url=new URL("https://api.trello.com/1/cards/"+cardId);
 for(const [k,v]of Object.entries({key,token,fields:"id,name,desc,dateLastActivity,closed"}))url.searchParams.set(k,v);
 try{
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),13000);
  let r:Response;try{r=await fetch(url,{headers:{accept:"application/json"},signal:ctl.signal})}finally{clearTimeout(t)}
  if(!r.ok)return output({ok:false,error:"TRELLO_FINANCIAL_SOURCE_READ_FAILED"},502);
  const card=await r.json();
  if(card.id!==cardId||card.closed===true)return output({ok:false,error:"FINANCIAL_SOURCE_ID_INVALID"},409);
  return output(year==="2024"?annual2024(card):year==="2025"?annual2025(card):annualSummary(card));
 }catch(e){return output({ok:false,error:String((e as Error)?.message||e).slice(0,110)},409)}
});
