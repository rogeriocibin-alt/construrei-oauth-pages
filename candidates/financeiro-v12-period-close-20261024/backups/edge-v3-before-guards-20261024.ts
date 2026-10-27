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
 const r=await fetch(SB+"/functions/v1/cr-dashboard-gerencial-v4-manual-cora-candidate-20261007?api=acerto-live&gc=0",{signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error("ACERTO_LIVE_HTTP_"+r.status);const j=await r.json();
 if(!j.ok||!Array.isArray(j.items))throw Error("ACERTO_LIVE_INVALID");return j.items;
}
const months=["","JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
function input(b:any){
 const start=String(b.start||""),end=String(b.end||""),t1=Date.parse(start+"T12:00:00Z"),t2=Date.parse(end+"T12:00:00Z");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||!Number.isFinite(t1)||!Number.isFinite(t2)||t1>t2||t2-t1>45*86400000||!end.startsWith("2026-"))throw Error("PERIODO_INVALIDO");
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
async function gather(body:any){
 const p=input(body);
 if(!p.monthName)throw Error("MES_INVALIDO");
 const [live,finCards,workLists]=await Promise.all([acertos(),trello("/lists/"+FIN+"/cards?fields=id,name,desc,shortUrl"),trello("/boards/"+WORK+"/lists?fields=id,name")]);
 const month=finCards.find((x:any)=>normal(x.name).trim()===p.monthName+" 2026");
 const target=workLists.find((x:any)=>normal(x.name).includes(p.monthName)&&normal(x.name).includes("26"));
 const pending=workLists.find((x:any)=>normal(x.name)==="AG. ACERTO");
 if(!month||!target||!pending)throw Error("DESTINO_NAO_ENCONTRADO");
 const duplicate=String(month.desc||"").includes(marker(p));
 for(const c of p.cases){
  if(!duplicate&&finCards.some((x:any)=>hasCase(x.desc||"",c)))throw Error("OBRA_JA_REGISTRADA:"+c);
 }
 const rows=p.cases.map(c=>live.find((x:any)=>x.case===c));
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
 const existing=capitals.find((x:any)=>String(x.desc||"").includes(ckey));
 const cm=existing?String(existing.desc||"").match(/CG_CREDIT\|([0-9]+(?:\.[0-9]{1,2})?)/):null;
 const credit=cm?Math.round(Number(cm[1])*100):null;
 // Decisão documentada do diretor em 24/10/2026: exceção única, com valores e período exatos.
 // NÃO lança a diferença como crédito ou débito e NÃO se aplica a outros fechamentos.
 const accepted_exception=p.start==="2026-10-10"&&p.end==="2026-10-23"&&rows.length===11&&
   credit===105806&&totals.capital_cents===122720&&
   String(existing?.desc||"").includes("CG_PERIOD_KEY|2026-10-10_2026-10-23")&&
   String(existing?.desc||"").includes("CG_CREDIT|1058.06");
 const capital_validation={exists:!!existing,period_card_url:existing?.shortUrl||null,credit_cents:credit,
   expected_cents:totals.capital_cents,difference_cents:credit==null?null:totals.capital_cents-credit,
   ok:credit!=null&&Math.abs(credit-totals.capital_cents)<=1,
   accepted_exception:accepted_exception?"CR-CG-DIFF-16914-ACCEPTED-20261024":null};
 const fingerprint=await sha(JSON.stringify({p,month:[month.id,month.desc],capital_validation,rows:rows.map(r=>[r.case,r.base_cents,r.cost_cents,r.profit_cents,r.rateio]),cards:cards.map(c=>[c.id,c.idList,c.desc,c.dateLastActivity])}));
 return {p,rows,cards,month,target,totals,capital_validation,duplicate,fingerprint};
}
function block(c:any){
 const p=c.p,t=c.totals;
 const l=["","━━━━━━━━━━━━━━━━━━━━━━","💰 ACERTOS EFETIVADOS — "+p.start+" A "+p.end,"━━━━━━━━━━━━━━━━━━━━━━","🏗️ Obras: "+t.count,"💵 Base recebida: "+brl(t.base_cents),"💸 Custos: "+brl(t.cost_cents),"💰 Lucro líquido: "+brl(t.profit_cents),"📈 Margem: "+(t.profit_cents/t.base_cents*100).toFixed(2).replace(".",",")+"%","","👥 RETIRADAS CONFIRMADAS","Fabrício: "+brl(t.fabricio_cents),"Éder: "+brl(t.eder_cents),"Rogério: "+brl(t.rogerio_cents),"Gabrielly: "+brl(t.gabi_cents),"Capital de Giro: "+brl(t.capital_cents),"","REFERÊNCIAS DAS OBRAS"];
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
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
 if(req.headers.get("origin")&&req.headers.get("origin")!==HOST)return ans({ok:false,error:"ORIGIN_DENIED"},403);
 if(req.method==="GET")return ans({ok:true,build:"CR-V12-PERIODO-20261024",production:false,mode:"CANDIDATE",bank_writes:false});
 if(req.method!=="POST")return ans({ok:false,error:"METHOD_NOT_ALLOWED"},405);
 if(!await director(req))return ans({ok:false,error:"DIRECTOR_SESSION_REQUIRED"},401);
 const action=new URL(req.url).searchParams.get("action");
 if(!["preview","commit"].includes(action||""))return ans({ok:false,error:"INVALID_ACTION"},400);
 const b=await req.json().catch(()=>null);
 if(!b)return ans({ok:false,error:"INVALID_BODY"},400);
 try{
  const c=await gather(b);
  if(action==="preview")return ans({ok:true,preview:true,period:c.p,totals:c.totals,capital_validation:c.capital_validation,fingerprint:c.fingerprint,duplicate:c.duplicate,writes:false});
  if(c.duplicate)return ans({ok:false,error:"PERIOD_ALREADY_SENT"},409);
  if(!c.capital_validation.ok&&!c.capital_validation.accepted_exception)return ans({ok:false,error:"CAPITAL_PERIOD_NOT_RECONCILED",capital_validation:c.capital_validation},409);
  if(b.fingerprint!==c.fingerprint)return ans({ok:false,error:"STALE_PREVIEW"},409);
  const next=String(c.month.desc||"").trimEnd()+"\n"+block(c)+"\n";
  if(next.length>16384)return ans({ok:false,error:"MONTH_CARD_CAPACITY_EXCEEDED",length:next.length},409);
  await trello("/cards/"+c.month.id,"PUT",{desc:next});
  const confirmed=await trello("/cards/"+c.month.id+"?fields=desc");
  if(confirmed.desc!==next)return ans({ok:false,error:"MONTH_SAVE_UNCONFIRMED",possible_write:true},409);
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
  return ans({ok:fail.length===0,recorded:true,month:c.p.monthName,moved,unresolved:fail,month_url:c.month.shortUrl,partial:!!fail.length},fail.length?207:200);
 }catch(e){return ans({ok:false,error:String(e).slice(0,300)},409)}
});
