import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const BUILD="CR-FIN-V12-AUTO-CONSOLIDATION-20261121-R1";
const SB=(Deno.env.get("SUPABASE_URL")||"").replace(/\/$/,""),KEY=(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"").trim();
const TK=(Deno.env.get("TRELLO_API_KEY")||"").trim(),TT=(Deno.env.get("TRELLO_API_TOKEN")||"").trim();
const FIN="6952fd5947e9864456eab14a",CG="692e0d6c360c13a9cd738f33",WORK="6974b24c16d17ca76351a950",ANNUAL="6add3128f02eef0b8a7d69b5";
const MN=["JANEIRO","FEVEREIRO","MARÇO","ABRIL","MAIO","JUNHO","JULHO","AGOSTO","SETEMBRO","OUTUBRO","NOVEMBRO","DEZEMBRO"];
function ok(b,m){if(!b)throw Error(m)}
function brl(c){return "R$ "+(c/100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}
function amt(s){return Math.round(Number(String(s).replace(/\./g,"").replace(",","."))*100)}
function pct(c,g){return (100*c/g).toFixed(2).replace(".",",")+"%"}
function norm(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase()}
function val(s,re){const m=String(s).match(re);ok(!!m,"MISSING_FIELD");return amt(m[1])}
function append(s,key){return String(s).includes("CR-FIN-AUTO-SYNC|"+key)?s:String(s).trimEnd()+"\nCR-FIN-AUTO-SYNC|"+key+"\n"}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}})}
async function api(path,method="GET",body){
 ok(!!TK&&!!TT,"NO_TRELLO_AUTH");
 const u=new URL("https://api.trello.com/1"+path);u.searchParams.set("key",TK);u.searchParams.set("token",TT);
 const r=await fetch(u,{method,headers:{"content-type":"application/json"},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(19000)});
 const txt=await r.text();if(!r.ok)throw Error("TRELLO_"+method+"_"+r.status);
 return txt?JSON.parse(txt):null;
}
async function rest(path,method="GET",body){
 ok(!!SB&&!!KEY,"NO_DB_AUTH");
 const r=await fetch(SB+"/rest/v1/"+path,{method,headers:{"apikey":KEY,"authorization":"Bearer "+KEY,"content-type":"application/json","prefer":"return=representation"},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 const txt=await r.text();if(!r.ok)throw Error("DB_"+method+"_"+r.status+":"+txt.slice(0,120));
 return txt?JSON.parse(txt):null;
}
async function card(id){return api("/cards/"+id+"?fields=id,name,idList,desc,shortUrl")}
async function list(id){const x=await api("/lists/"+id+"/cards?filter=open&fields=id,name,idList,desc,shortUrl");ok(Array.isArray(x),"CARDS_INVALID");return x}
function periodCodes(d){
 const found=[],periods=[],seen=new Set();
 for(const m of String(d).matchAll(/CR-ACERTO-PERIODO\|(\d{4}-\d\d-\d\d_\d{4}-\d\d-\d\d)\|((?:\d{1,5}-26)(?:,\d{1,5}-26)*)/g)){
  ok(!periods.includes(m[1]),"DUPLICATED_PERIOD_MARKER");periods.push(m[1]);
  for(const c of m[2].split(",")){ok(!seen.has(c),"DUPLICATED_WORK");seen.add(c);found.push(c)}
 }
 return {periods,codes:found};
}
function section(d,key){
 const mark="CR-ACERTO-PERIODO|"+key+"|",idx=d.indexOf(mark);
 ok(idx>=0&&d.indexOf(mark,idx+1)<0,"PERIOD_RECORD_NOT_UNIQUE");
 const head="📋 ACERTOS REGISTRADOS — "+key.replace("_"," A "),start=d.lastIndexOf(head,idx);
 ok(start>=0,"FULL_SETTLEMENT_RECORD_NOT_FOUND");
 const block=d.slice(start,idx),cases=(d.slice(idx).match(/^CR-ACERTO-PERIODO\|[^\n]+\|((?:\d{1,5}-26)(?:,\d{1,5}-26)*)/m)||[])[1]?.split(",")||[];
 const rows=[...block.matchAll(/^•\s*(\d{1,5}-26)\s*\|\s*Base R\$\s*([0-9.,]+)\s*\|\s*Custos R\$\s*([0-9.,]+)\s*\|\s*Lucro R\$\s*([0-9.,]+)/gm)];
 const result={
  base:val(block,/💵 Base financeira das obras:\s*R\$\s*([0-9.,]+)/),
  costs:val(block,/💸 Custos:\s*R\$\s*([0-9.,]+)/),
  profit:val(block,/💰 Lucro líquido:\s*R\$\s*([0-9.,]+)/),
  cg:val(block,/^Capital de Giro:\s*R\$\s*([0-9.,]+)/m),
  osvaldo:val(block,/^Osvaldo \(10% das obras designadas\):\s*R\$\s*([0-9.,]+)/m),
  fab:val(block,/^Fabrício:\s*R\$\s*([0-9.,]+)/m),
  eder:val(block,/^Éder:\s*R\$\s*([0-9.,]+)/m),
  rog:val(block,/^Rogério:\s*R\$\s*([0-9.,]+)/m),
  gabi:val(block,/^Gabrielly:\s*R\$\s*([0-9.,]+)/m),
  count:Number((block.match(/🏗️ Obras:\s*(\d+)/)||[])[1]||0)
 };
 ok(rows.length===result.count&&cases.length===result.count&&new Set(cases).size===result.count&&cases.every((x,i)=>rows[i][1]===x),"WORK_ID_MISMATCH");
 const total=(j)=>rows.reduce((z,r)=>z+amt(r[j]),0);
 ok(total(2)===result.base&&total(3)===result.costs&&total(4)===result.profit&&result.base-result.costs===result.profit,"ARITHMETIC_MISMATCH");
 const distributed=["Fabrício","Éder","Rogério","Gabrielly"].reduce((z,name)=>z+val(block,new RegExp("^"+name+":\\s*R\\$\\s*([0-9.,]+)","m")),0);
 ok(distributed+result.cg+result.osvaldo===result.profit,"RATEIO_DIFFERENCE");
 return result;
}
function monthlyText(desc,t,key){
 let d=String(desc),ids=periodCodes(d);
 ok(ids.periods.includes(key),"MONTH_WORK_MARKER_MISSING");
 const lines=[
 "✅ ACERTOS REGISTRADOS: "+ids.periods.length+" cortes documentados",
 "🏗️ OBRAS ACERTADAS: "+ids.codes.length+" obras únicas",
 "💵 Base financeira consolidada: "+brl(t.gross_cents),
 "💸 Custos consolidados nas obras: "+brl(t.costs_cents),
 "💰 LUCRO LÍQUIDO CONSOLIDADO: "+brl(t.profit_cents)+" | Margem: "+pct(t.profit_cents,t.gross_cents)
 ];
 const re=[/^✅ ACERTOS (?:REGISTRADOS|CONFIRMADOS):.*$/m,/^🏗️ OBRAS ACERTADAS:.*$/m,/^💵 Base financeira(?: consolidada)?:.*$/m,/^💸 Custos(?: contabilizados nas obras| consolidados nas obras)?:.*$/m,/^💰 LUCRO LÍQUIDO(?: CONSOLIDADO)?:.*$/m];
 let match=0;for(let i=0;i<re.length;i++){if(re[i].test(d)){d=d.replace(re[i],lines[i]);match++}}
 if(match!==5)d="📊 RESUMO FINANCEIRO V12 ATUAL\n"+lines.join("\n")+"\n\n"+d;
 d=append(d,key);ok(d.length<=16384,"MONTH_CARD_LIMIT");
 return {desc:d,work_count:ids.codes.length};
}
function annualText(desc,mk,t,y,key,works){
 let d=String(desc);ok(d.includes("CR-FINANCE-MONTHLY-SOURCE-2026-V3"),"ANNUAL_NOT_CANONICAL");
 const rows=[
 [/^💵 BRUTO DECLARADO:.*$/m,"💵 BRUTO DECLARADO: "+brl(y.gross_cents)],
 [/^💸 CUSTOS DECLARADOS:.*$/m,"💸 CUSTOS DECLARADOS: "+brl(y.costs_cents)],
 [/^✅ LUCRO LÍQUIDO DECLARADO:.*$/m,"✅ LUCRO LÍQUIDO DECLARADO: "+brl(y.profit_cents)],
 [/^📊 MARGEM DECLARADA:.*$/m,"📊 MARGEM DECLARADA: "+pct(y.profit_cents,y.gross_cents)],
 [/^🧮 BRUTO − CUSTOS:.*$/m,"🧮 BRUTO − CUSTOS: "+brl(y.gross_cents-y.costs_cents)]
 ];for(const [re,v] of rows){ok(re.test(d),"ANNUAL_FIELD_NOT_FOUND");d=d.replace(re,v)}
 const code=["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"][Number(mk.slice(5))-1];
 const re=new RegExp("^"+code+" \\|.*$","m");
 ok(re.test(d),"ANNUAL_MONTH_LINE_NOT_FOUND");
 d=d.replace(re,code+" | "+brl(t.gross_cents)+" / "+brl(t.costs_cents)+" / "+brl(t.profit_cents));
 const comp=new RegExp("^• "+code+":.*$","m");
 if(comp.test(d))d=d.replace(comp,"• "+code+": "+brl(t.gross_cents)+" bruto / "+brl(t.costs_cents)+" custos / "+brl(t.profit_cents)+" lucro ("+works+" obras)");
 d=append(d,key);ok(d.length<=16384,"ANNUAL_CARD_LIMIT");
 const title="📊 RESUMO ANUAL FINANCEIRO 2026 — "+(mk==="2026-12"?"JAN–DEZ":"JAN–NOV")+" | BRUTO "+brl(y.gross_cents)+" | LUCRO "+brl(y.profit_cents);
 return {desc:d,title};
}
// Single writer of CG GLOBAL totals is the established Capital de Giro reconciler,
// which sets ABSOLUTE totals from period cards. Never increment CG in finance RPC.
async function reconcileCapitalFromPeriodCards(){
 ok(!!KEY&&!!SB,"CG_SERVICE_CREDENTIALS_MISSING");
 const r=await fetch(SB+"/functions/v1/cr-trello-capital-giro-v1?action=service-sync",{
  method:"POST",
  headers:{"authorization":"Bearer "+KEY,"apikey":KEY,"content-type":"application/json"},
  body:JSON.stringify({source:"V12_FINANCE_POSTCOMMIT"}),
  signal:AbortSignal.timeout(45000)
 });
 const response=await r.json().catch(()=>null);
 ok(r.ok&&response?.ok===true&&response?.service_reconciled===true,
  "CG_RECONCILIATION_PENDING:"+(response?.error||"HTTP_"+r.status));
 const rows=await rest("cr_working_capital_state_v1?state_key=eq.GLOBAL&select=capital_generated,real_balance,historical_cards");
 ok(Array.isArray(rows)&&rows.length===1,"CG_GLOBAL_STATE_NOT_UNIQUE");
 const cg=rows[0],generated=Math.round(Number(cg.capital_generated)*100),
 balance=Math.round(Number(cg.real_balance)*100);
 const returnedGenerated=Math.round(Number(response.capital_generated)*100),
 returnedBalance=Math.round(Number(response.real_balance)*100);
 ok(Number.isSafeInteger(generated)&&Number.isSafeInteger(balance)
  &&generated===returnedGenerated&&balance===returnedBalance
  &&Number(cg.historical_cards)===Number(response.historical_cards),
  "CG_RECONCILIATION_READBACK_MISMATCH");
 return {generated_cents:generated,balance_cents:balance,historical_cards:Number(cg.historical_cards)};
}
async function doSync(body){
 const key=String(body.period_key||"");
 ok(/^2026-\d\d-\d\d_2026-\d\d-\d\d$/.test(key),"INVALID_PERIOD");
 const registry=await rest("cr_finance_2026_period_send_registry_v12?period_key=eq."+encodeURIComponent(key)+"&select=status,month_card_id,capital_card_url");
 const earlier=await rest("cr_finance_v12_consolidation_ledger_v1?period_key=eq."+encodeURIComponent(key)+"&select=period_key,trello_state");
 if(earlier.length===1&&earlier[0].trello_state==="SYNCED")return {ok:true,already_synced:true,period:key,no_writes:true};
 ok(registry?.length===1&&registry[0].status==="COMMITTED","REGISTRY_NOT_COMMITTED");
 const m=await card(registry[0].month_card_id);ok(m.idList===FIN,"INVALID_MONTH_SOURCE");
 let cut;try{cut=section(m.desc,key)}catch(e){
  const comments=await api("/cards/"+m.id+"/actions?filter=commentCard&limit=1000");
  const relevant=comments.filter(x=>String(x.data?.text||"").includes("CR-ACERTO-PERIODO|"+key+"|"));
  ok(relevant.length===1,"FULL_MONTH_COMMENT_NOT_UNIQUE");cut=section(relevant[0].data.text,key)
 }
 const short=(String(registry[0].capital_card_url||"").match(/\/c\/([A-Za-z0-9]+)/)||[])[1];
 ok(!!short,"CG_CARD_MISSING");
 const cgCard=await card(short);
 ok(cgCard.desc.includes("CG_PERIOD_KEY|"+key)&&Math.round(Number((cgCard.desc.match(/CG_CREDIT\|([0-9.]+)/)||[])[1])*100)===cut.cg,"CG_CREDIT_NOT_MATCHED");
 const state=await rest("rpc/cr_finance_v12_consolidate_committed","POST",{
  p_period_key:key,p_base_cents:cut.base,p_cost_cents:cut.costs,p_profit_cents:cut.profit,
  p_capital_cents:cut.cg,p_osvaldo_cents:cut.osvaldo,p_work_count:cut.count
 });
 ok(state?.ok===true,"CONSOLIDATION_RPC_FAILED");
 const capital=await reconcileCapitalFromPeriodCards();
 const text=monthlyText(m.desc,state.monthly,key);
 if(text.desc!==m.desc)await api("/cards/"+m.id,"PUT",{desc:text.desc});
 const a=await card(ANNUAL),an=annualText(a.desc,state.month_key,state.monthly,state.annual,key,text.work_count);
 if(an.desc!==a.desc||an.title!==a.name)await api("/cards/"+ANNUAL,"PUT",{desc:an.desc,name:an.title});
 const received=await api("/lists/"+FIN+"?fields=name");
 const prefix="VALORES RECEBIDOS 2026 | JAN–DEZ | "+(state.month_key==="2026-12"?"JAN–DEZ":"JAN–NOV");
 const suffix=" | OUT 11 OBRAS | NOV "+(state.month_key==="2026-11"?text.work_count:"20")+" OBRAS | DEZ "+(state.month_key==="2026-12"?text.work_count+" OBRAS":"ABERTO");
 const finName=prefix+": BRUTO "+brl(state.annual.gross_cents)+" | CUSTOS "+brl(state.annual.costs_cents)+" | LUCRO "+brl(state.annual.profit_cents)+" | MARGEM "+pct(state.annual.profit_cents,state.annual.gross_cents)+suffix;
 if(received.name!==finName)await api("/lists/"+FIN,"PUT",{name:finName});
 const cc=await list(CG),masters=cc.filter(x=>String(x.desc||"").includes("CR-CAPITAL-GIRO-SUMMARY-V1"));
 ok(masters.length===1,"CG_MASTER_NOT_UNIQUE");
 let cgText=masters[0].desc;
 for(const [re,v] of [
  [/^💰 CAPITAL GERADO \/ HISTÓRICO:.*$/m,"💰 CAPITAL GERADO / HISTÓRICO: "+brl(capital.generated_cents)],
  [/^✅ SALDO REAL DISPONÍVEL:.*$/m,"✅ SALDO REAL DISPONÍVEL: "+brl(capital.balance_cents)],
  [/^➖ CONSUMO LÍQUIDO HISTÓRICO:.*$/m,"➖ CONSUMO LÍQUIDO HISTÓRICO: "+brl(capital.generated_cents-capital.balance_cents)]
 ]){ok(re.test(cgText),"CG_MASTER_FIELD_MISSING");cgText=cgText.replace(re,v)}
 const cgRows=await rest("cr_working_capital_state_v1?state_key=eq.GLOBAL&select=historical_cards");
 ok(cgRows.length===1&&Number(cgRows[0].historical_cards)===capital.historical_cards,"CG_GLOBAL_NOT_UNIQUE");
 cgText=cgText.replace(/^📋 Períodos de Capital:.*$/m,"📋 Períodos de Capital: "+capital.historical_cards);
 cgText=append(cgText,key);
 const cn="📊 CAPITAL DE GIRO — GERADO "+brl(capital.generated_cents)+" | SALDO REAL "+brl(capital.balance_cents);
 if(cgText!==masters[0].desc||cn!==masters[0].name)await api("/cards/"+masters[0].id,"PUT",{desc:cgText,name:cn});
 const cgName="💱 CAPITAL DE GIRO TEMPORÁRIO | GERADO: "+brl(capital.generated_cents)+" | SALDO REAL: "+brl(capital.balance_cents);
 const cl=await api("/lists/"+CG+"?fields=name");if(cl.name!==cgName)await api("/lists/"+CG,"PUT",{name:cgName});
 const monthName=MN[Number(state.month_key.slice(5))-1],ls=await api("/boards/"+WORK+"/lists?fields=id,name");
 const targets=ls.filter(x=>norm(x.name).includes(monthName)&&/26/.test(x.name));ok(targets.length===1,"OPERATIONAL_MONTH_AMBIGUOUS");
 const oc=await list(targets[0].id),summaries=oc.filter(x=>x.name.includes("RESUMO DA LISTA"));
 ok(summaries.length===1,"OPERATIONS_SUMMARY_AMBIGUOUS");
 const works=oc.filter(x=>x.id!==summaries[0].id);
 const ids=works.map(x=>(x.name.match(/(^|[^0-9])(\d{1,5}-26)(?![0-9])/)||[])[2]);
 ok(ids.length===text.work_count&&ids.every(Boolean)&&new Set(ids).size===ids.length,"OPERATIONS_COUNT_DIFFERENT");
 const opsTitle="📊 RESUMO DA LISTA — "+ids.length+" OBRAS | BASE "+brl(state.monthly.gross_cents)+" | LUCRO "+brl(state.monthly.profit_cents);
 let opsText=String(summaries[0].desc||"");
 const already=opsText.includes("CR-FIN-AUTO-SYNC|"+key);
 const fields=[["Fabrício","fab"],["Éder","eder"],["Rogério","rog"],["Gabrielly","gabi"],["Osvaldo","osvaldo"],["Capital de Giro","cg"]];
 if(opsText.includes("CR-TRELLO-LIST-SUMMARY-V3")){
  for(const [re,val] of [
    [/^🏗️ .*?obras únicas:.*$/m,"🏗️ "+ids.length+" obras únicas: acertos financeiros confirmados"],
    [/^💵 Base financeira considerada.*$/m,"💵 Base financeira considerada: "+brl(state.monthly.gross_cents)],
    [/^💸 Custos já lançados nas obras:.*$/m,"💸 Custos já lançados nas obras: "+brl(state.monthly.costs_cents)],
    [/^✅ Lucro líquido:.*$/m,"✅ Lucro líquido: "+brl(state.monthly.profit_cents)+" | 📊 Margem: "+pct(state.monthly.profit_cents,state.monthly.gross_cents)]
  ])if(re.test(opsText))opsText=opsText.replace(re,val);
  if(!already){
   for(const [label,kind] of fields){
    const re=new RegExp("^("+label+"[^\\n]*?): R\\$\\s*([0-9.,]+)","m");
    const m=opsText.match(re);ok(!!m,"OPERATIONS_RATEIO_NOT_FOUND:"+label);
    opsText=opsText.replace(re,m[1]+": "+brl(amt(m[2])+cut[kind]));
   }
   opsText+="\n📋 NOVO CORTE "+key+": "+periodCodes(m.desc).codes.slice(-cut.count).join(", ")+"\n📌 Rateios apurados; PIX não comprovados automaticamente.";
  }
 }else{
  opsText=["📊 CONSTRU-REI — "+targets[0].name,
   "🏗️ Obras únicas: "+ids.length,
   "💵 Base financeira considerada: "+brl(state.monthly.gross_cents),
   "💸 Custos já lançados nas obras: "+brl(state.monthly.costs_cents),
   "✅ Lucro líquido: "+brl(state.monthly.profit_cents)+" | 📊 Margem: "+pct(state.monthly.profit_cents,state.monthly.gross_cents),
   ...fields.map(([label,kind])=>label+": "+brl(cut[kind])),
   "📌 Rateios apurados não representam PIX; apoios estão nos custos.",
   "CR-TRELLO-LIST-SUMMARY-V3"].join("\n");
 }
 opsText=append(opsText,key);ok(opsText.length<=16384,"OPERATIONS_SUMMARY_LIMIT");
 if(summaries[0].name!==opsTitle||summaries[0].desc!==opsText)await api("/cards/"+summaries[0].id,"PUT",{name:opsTitle,desc:opsText});
 const pend=await list("6800f3a6b0c58c0518f249b5");
 if(pend.filter(x=>/(^|[^0-9])\d{1,5}-26(?![0-9])/.test(String(x.name||""))).length===0){
  await rest("cr_working_capital_state_v1?state_key=eq.GLOBAL","PATCH",{pending_current_acerto:0});
 }
 const updated=await rest("cr_finance_v12_consolidation_ledger_v1?period_key=eq."+encodeURIComponent(key),"PATCH",{trello_state:"SYNCED",last_error:null,updated_at:new Date().toISOString()});
 ok(Array.isArray(updated)&&updated.length===1&&updated[0].trello_state==="SYNCED","LEDGER_SYNC_CONFIRMATION_FAILED");
 return {ok:true,period:key,already_applied:state.already_applied,monthly:state.monthly,annual:state.annual,capital,works:text.work_count,trello_synced:true,no_bank_writes:true};
}
Deno.serve(async req=>{
 if(req.method==="GET")return json({ok:true,build:BUILD,writes_only_after_committed:true});
 if(req.method!=="POST")return json({ok:false,error:"POST_REQUIRED"},405);
 if(!KEY||String(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"")!==KEY)return json({ok:false,error:"SERVICE_AUTH_REQUIRED"},403);
 const input=await req.json().catch(()=>null);if(!input||JSON.stringify(input).length>1500)return json({ok:false,error:"INVALID_BODY"},400);
 try{return json(await doSync(input))}catch(e){return json({ok:false,build:BUILD,error:String(e?.message||e).slice(0,300),pending_reconciliation:true,bank_writes:false},409)}
});
