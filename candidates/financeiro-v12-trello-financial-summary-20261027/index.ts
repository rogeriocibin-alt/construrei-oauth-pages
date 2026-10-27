import "jsr:@supabase/functions-js/edge-runtime.d.ts";
/* CONSTRU-REI: ONLY Trello-declared financial-settlement summary.
 * 2023: bank-only, no operating Trello KPI. 2024/25: do not invent a settlement source.
 * This endpoint is read-only: it NEVER mutates bank/Trello/cards/operations/CG.
 */
const SB=(Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co").replace(/\/$/,"");
const CARD="6add3128f02eef0b8a7d69b5"; // Trello GESTÃO FINANCEIRA / resumo financeiro anual 2026
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
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(req.method!=="GET")return output({ok:false,error:"READ_ONLY"},405);
 const u=new URL(req.url),year=u.searchParams.get("year")||"2026";
 if(!["2023","2024","2025","2026"].includes(year))return output({ok:false,error:"INVALID_YEAR"},400);
 if(!await sessionValid(req))return output({ok:false,error:"DIRECTOR_OR_USER_SESSION_REQUIRED"},401);
 if(year==="2023")return output({ok:true,year:2023,bank_only:true,trello_financial_summary:null,source:"CORA_ONLY_2023"});
 if(year!=="2026")return output({ok:true,year:Number(year),trello_operational_source:true,trello_financial_summary:null,source:"TRELLO_OPERATIONS",status:"ANNUAL_FINANCIAL_CLOSURE_NOT_VERIFIED",source_fallback_forbidden:true});
 const key=sec("TRELLO_API_KEY"),token=sec("TRELLO_API_TOKEN");
 if(!key||!token)return output({ok:false,error:"TRELLO_BACKEND_CREDENTIALS_UNAVAILABLE"},503);
 const url=new URL("https://api.trello.com/1/cards/"+CARD);
 for(const [k,v]of Object.entries({key,token,fields:"id,name,desc,dateLastActivity,closed"}))url.searchParams.set(k,v);
 try{
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),13000);
  let r:Response;try{r=await fetch(url,{headers:{accept:"application/json"},signal:ctl.signal})}finally{clearTimeout(t)}
  if(!r.ok)return output({ok:false,error:"TRELLO_FINANCIAL_SOURCE_READ_FAILED"},502);
  const card=await r.json();
  if(card.id!==CARD||card.closed===true)return output({ok:false,error:"FINANCIAL_SOURCE_ID_INVALID"},409);
  return output(annualSummary(card));
 }catch(e){return output({ok:false,error:String((e as Error)?.message||e).slice(0,110)},409)}
});
