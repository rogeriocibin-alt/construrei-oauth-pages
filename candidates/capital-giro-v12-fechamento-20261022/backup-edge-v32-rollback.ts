import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BUILD="CR-CAPITAL-GIRO-V1-FIX-BALANCE-PARSER-20261016-R3";
const BASE="https://api.trello.com/1";
const FUNCTION_SLUG="cr-trello-capital-giro-v1";

const FINANCE_BOARD="65b2fbebdb0ed307a75d88f6";
const CAPITAL_LIST="692e0d6c360c13a9cd738f33";
const RECEIVED_2026_LIST="6952fd5947e9864456eab14a";
const WORKS_BOARD="6974b24c16d17ca76351a950";
const SETTLEMENT_LIST="6800f3a6b0c58c0518f249b5";
const SETTLEMENT_CARD="6ab6f27658e42565c7413b7b";

const SUMMARY_MARK="CR-CAPITAL-GIRO-SUMMARY-V1";
const CARD_MARK="CR-CAPITAL-GIRO-PERIOD-V1";
const MANUAL_BEGIN="CR-CG-MANUAL-BEGIN";
const MANUAL_END="CR-CG-MANUAL-END";
const WH_SIG="CRCG26-7f0e5c9db81a4d31";
const AUTO_START="2026-09-19";

function json(data:any,status=200){
  return new Response(JSON.stringify(data),{status,headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"no-store",
    "x-content-type-options":"nosniff",
    "access-control-allow-origin":"*",
    "access-control-allow-headers":"content-type,x-cr-session",
    "access-control-allow-methods":"GET,POST,OPTIONS",
    "x-construrei-build":BUILD
  }});
}
function env(n:string){return (Deno.env.get(n)||"").trim()}
function dbSecret(){
  try{
    const x=JSON.parse(env("SUPABASE_SECRET_KEYS")||"{}");
    return String(x.default||x.service_role||Object.values(x)[0]||"");
  }catch{return env("SUPABASE_SERVICE_ROLE_KEY")}
}
async function db(path:string,init:RequestInit={}){
  const base=env("SUPABASE_URL").replace(/\/$/,""),key=dbSecret();
  if(!base||!key)throw new Error("SUPABASE_DB_CREDENTIAL_GATE");
  const r=await fetch(base+"/rest/v1/"+path,{...init,headers:{
    "apikey":key,"authorization":"Bearer "+key,"content-type":"application/json",
    ...(init.headers||{})
  }});
  const t=await r.text();let j:any=null;try{j=t?JSON.parse(t):null}catch{j=t}
  if(!r.ok)throw new Error("DB_HTTP_"+r.status+"_"+String(t).slice(0,140));
  return j;
}
function keyDates(key:string){
  const p=String(key||"").split("_");
  return {start:p[0]||"",end:p[1]||""};
}
function autoEligible(key:string){return keyDates(key).start>=AUTO_START}
function sleep(ms:number){return new Promise(r=>setTimeout(r,ms))}
function round2(n:number){return Math.round((Number(n)||0)*100)/100}
function brl(n:number){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(round2(n))}
function pad(n:number){return String(n).padStart(2,"0")}

function money(v:any){
  if(v===null||v===undefined)return null;
  let raw=String(v).trim();
  let neg=/^\s*-/.test(raw)||/R\$\s*-/.test(raw);
  let s=raw.replace(/\s/g,"").replace(/R\$/gi,"").replace(/[()]/g,"").replace(/[^0-9,.-]/g,"");
  if(!s)return null;
  if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");
  else{
    const p=s.split(".");
    if(p.length>2)s=p.join("");
  }
  const n=Number(s);
  return Number.isFinite(n)?round2(neg?-Math.abs(n):n):null;
}
function firstMoney(text:any){
  const m=String(text||"").match(/R\$\s*([-]?\s*[0-9.]+,\s*[0-9]{1,2})/i);
  return m?money(m[1]):null;
}
function allSaldo(text:any){
  const out:number[]=[];
  const re=/SALDO(?:\s+REAL(?:\s+DISPON[IÍ]VEL)?)?(?:\s*\/[^:\n]+)?\s*(?:=|:)?\s*R?\$?\s*(-?\s*[0-9.]+,\s*[0-9]{1,2})/gi;
  let m; const s=String(text||"");
  while((m=re.exec(s))!==null){const n=money(m[1]);if(n!==null)out.push(n)}
  return out;
}
function allCapital(text:any){
  const out:number[]=[];
  const s=String(text||"").replace(/\*/g,"");
  const re=/Capital\s+(?:de\s+)?Giro(?:\s+Tempor[aá]rio)?[\s\S]{0,100}?R\$\s*([0-9.]+,\s*[0-9]{1,2})/gi;
  let m;while((m=re.exec(s))!==null){const n=money(m[1]);if(n!==null)out.push(n)}
  return out;
}
function periodMatch(text:any){
  const s=String(text||"");
  const m=s.match(/ACERTOS?(?:\s+DE|\s+de|\s+De|\s*)?\s*(\d{1,2})\/(\d{1,2})\s*(?:a|A|AT[EÉ]|at[eé]|-|–)\s*(\d{1,2})\/(\d{1,2})/);
  if(!m)return null;
  return {sd:+m[1],sm:+m[2],ed:+m[3],em:+m[4],display:pad(+m[1])+"/"+pad(+m[2])+" a "+pad(+m[3])+"/"+pad(+m[4])};
}
function periodKey(p:any,endYear:number){
  const startYear=p.sm>p.em?endYear-1:endYear;
  return startYear+"-"+pad(p.sm)+"-"+pad(p.sd)+"_"+endYear+"-"+pad(p.em)+"-"+pad(p.ed);
}
function keyFromMarker(desc:any){
  const m=String(desc||"").match(/CG_PERIOD_KEY\|([0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{4}-[0-9]{2}-[0-9]{2})/);
  return m?m[1]:null;
}
function extractManual(desc:any){
  const s=String(desc||"");
  const a=s.indexOf(MANUAL_BEGIN),b=s.indexOf(MANUAL_END);
  if(a<0||b<a)return "";
  return s.slice(a+MANUAL_BEGIN.length,b).trim();
}
function manualTotals(text:string){
  let credits=0,debits=0,count=0;
  for(const raw of String(text||"").split(/\r?\n/)){
    const line=raw.trim();
    if(!line||line.startsWith("#"))continue;
    const m=line.match(/(?:R\$\s*([+-]?\s*[0-9.]+,\s*[0-9]{1,2})|([+-])\s*R\$\s*([0-9.]+,\s*[0-9]{1,2}))/i);
    if(!m)continue;
    let val=money(m[1]||m[3]);
    if(val===null)continue;
    const credit=/CR[EÉ]DITO|ESTORNO|DEVOLU[CÇ][AÃ]O|REEMBOLSO/i.test(line)||/\+\s*R\$/i.test(line)||m[2]==="+";
    val=Math.abs(val);
    if(credit)credits+=val;else debits+=val;
    count++;
  }
  return {credits:round2(credits),debits:round2(debits),count};
}
async function trello(path:string,method="GET",body:any=null){
  const key=env("TRELLO_API_KEY"),token=env("TRELLO_API_TOKEN");
  if(!key||!token)throw new Error("TRELLO_CREDENTIAL_GATE_REQUIRED");
  const u=new URL(BASE+path);
  u.searchParams.set("key",key);u.searchParams.set("token",token);
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),12000);
  try{
    const r=await fetch(u.toString(),{method,headers:{"accept":"application/json","content-type":"application/json","x-trello-client-identifier":"CONSTRU-REI-CAPITAL-GIRO-V1"},body:body===null?undefined:JSON.stringify(body),signal:ctl.signal});
    const t=await r.text();let j:any=null;try{j=t?JSON.parse(t):null}catch{j=t}
    if(!r.ok)throw new Error("TRELLO_HTTP_"+r.status+"_"+String(t).slice(0,120));
    return j;
  }finally{clearTimeout(tm)}
}
async function cards(listId:string){
  const x=await trello("/lists/"+encodeURIComponent(listId)+"/cards?filter=open&fields=id,name,desc,idList,pos,dateLastActivity,shortUrl");
  return Array.isArray(x)?x:[];
}
async function updateCard(id:string,p:any){return trello("/cards/"+id,"PUT",p)}
async function createCard(name:string,desc:string){return trello("/cards","POST",{idList:CAPITAL_LIST,name,desc,pos:"top"})}
async function updateListName(name:string){return trello("/lists/"+CAPITAL_LIST,"PUT",{name})}

function sourcePeriodsFromCard(card:any){
  const desc=String(card?.desc||"").replace(/\*/g,"");
  const y=(String(card?.name||"").match(/\b(20\d{2})\b/)||[])[1];
  const endYear=y?Number(y):2026;
  const re=/ACERTOS?(?:\s+DE|\s+de|\s+De|\s*)?\s*(\d{1,2})\/(\d{1,2})\s*(?:a|A|AT[EÉ]|at[eé]|-|–)\s*(\d{1,2})\/(\d{1,2})/g;
  const ms=[...desc.matchAll(re)];
  const out:any[]=[];
  for(let i=0;i<ms.length;i++){
    const m=ms[i],start=m.index||0,end=i+1<ms.length?(ms[i+1].index||desc.length):desc.length;
    const seg=desc.slice(start,end);
    const p={sd:+m[1],sm:+m[2],ed:+m[3],em:+m[4],display:pad(+m[1])+"/"+pad(+m[2])+" a "+pad(+m[3])+"/"+pad(+m[4])};
    const vals=allCapital(seg);
    if(!vals.length)continue;
    const capital=vals[vals.length-1];
    out.push({key:periodKey(p,endYear),display:p.display,capital,source_card_id:String(card.id),source_card_name:String(card.name||""),source_url:String(card.shortUrl||"")});
  }
  return out;
}
function legacyInfo(card:any,knownPeriods:any[]){
  const credit=firstMoney(card?.name)||0;
  const d=allSaldo(card?.desc),n=allSaldo(card?.name);
  const explicit=String(card?.desc||"").match(/CG_BALANCE\|(-?\d+(?:\.\d+)?)/);
  const balance=explicit?Number(explicit[1]):(d.length?d[d.length-1]:(n.length?n[n.length-1]:credit));
  const pm=periodMatch(card?.name);
  let key=keyFromMarker(card?.desc);
  if(!key&&pm){
    const same=knownPeriods.find(x=>x.display===pm.display);
    if(same)key=same.key;
  }
  const titleBal=n.length?n[n.length-1]:null;
  const descBal=d.length?d[d.length-1]:null;
  return {card,credit:round2(credit),balance:round2(balance||0),period:pm?.display||null,key,titleBal,descBal,
    divergent:titleBal!==null&&descBal!==null&&Math.abs(titleBal-descBal)>0.009,
    machine:String(card?.desc||"").includes(CARD_MARK)};
}
function buildMachineDesc(src:any,manual:string){
  const mv=manualTotals(manual),balance=round2(src.capital+mv.credits-mv.debits);
  const lines=[
    "🏦 CAPITAL DE GIRO — ACERTO "+src.display,
    "",
    "💰 Crédito gerado no acerto: "+brl(src.capital),
    "➕ Créditos / estornos manuais: "+brl(mv.credits),
    "➖ Débitos / despesas manuais: "+brl(mv.debits),
    "✅ SALDO REAL DISPONÍVEL: "+brl(balance),
    "",
    "📌 Origem: "+src.source_card_name,
    src.source_url?"🔗 "+src.source_url:"",
    "",
    "🧾 LANÇAMENTOS MANUAIS",
    "Use uma linha por movimentação.",
    "Débito: 26/09 - R$ 120,00 Contabilidade",
    "Crédito: 26/09 + R$ 50,00 Estorno",
    MANUAL_BEGIN,
    manual||"",
    MANUAL_END,
    "",
    CARD_MARK,
    "CG_PERIOD_KEY|"+src.key,
    "CG_CREDIT|"+src.capital.toFixed(2),
    "CG_BALANCE|"+balance.toFixed(2)
  ].filter(Boolean);
  return {desc:lines.join("\n"),balance,mv};
}
async function pendingCurrent(){
  try{
    const c=await trello("/cards/"+SETTLEMENT_CARD+"?fields=id,name,desc,dateLastActivity,shortUrl");
    const d=String(c?.desc||"").replace(/\*/g,"");
    const sm=d.match(/Gabi:[^\n]*Capital\s+(?:de\s+)?Giro:\s*R\$\s*([0-9.]+,\s*[0-9]{1,2})/i);
    let v=sm?money(sm[1]):null;
    if(v===null){const vals=allCapital(d);v=vals.length?vals[vals.length-1]:null}
    return {capital:v===null?null:round2(v),updated_at:c?.dateLastActivity||null,url:c?.shortUrl||null};
  }catch{return {capital:null,updated_at:null,url:null}}
}
async function authorized(req:Request){
  const s=(req.headers.get("x-cr-session")||"").trim();
  if(!s)return false;
  const base=env("SUPABASE_URL").replace(/\/$/,"");
  try{
    const r=await fetch(base+"/functions/v1/cr-dashboard-gerencial-v4-renderfix-ui-candidate?api=me",{headers:{"x-cr-session":s},signal:AbortSignal.timeout(8000)});
    return r.ok;
  }catch{return false}
}
async function reconcile(doWrites:boolean){
  const [capCards,receivedCards,pending]=await Promise.all([cards(CAPITAL_LIST),cards(RECEIVED_2026_LIST),pendingCurrent()]);
  const periods:any[]=[];
  for(const c of receivedCards)periods.push(...sourcePeriodsFromCard(c));
  const byKey=new Map<string,any>();
  for(const p of periods)byKey.set(p.key,p);
  const known=[...byKey.values()];
  const summaries=capCards.filter(c=>String(c.desc||"").includes(SUMMARY_MARK)||String(c.name||"").startsWith("📊 CAPITAL DE GIRO"));
  let info=capCards.filter(c=>!summaries.includes(c)&&periodMatch(c.name)).map(c=>legacyInfo(c,known));
  const existingByKey=new Map<string,any>();
  for(const x of info)if(x.key)existingByKey.set(x.key,x);
  const created:any[]=[];const updated:any[]=[];

  if(doWrites){
    for(const src of known){
      if(!autoEligible(src.key))continue;
      const ex=existingByKey.get(src.key);
      const kd=keyDates(src.key);
      if(!ex){
        const lock=await db("cr_working_capital_periods_v1?on_conflict=period_key",{
          method:"POST",
          headers:{"prefer":"resolution=ignore-duplicates,return=representation"},
          body:JSON.stringify({
            period_key:src.key,period_start:kd.start,period_end:kd.end,period_label:src.display,
            source_card_id:src.source_card_id,source_card_name:src.source_card_name,
            capital_generated:src.capital,real_balance:src.capital,status:"CREATING",
            metadata:{source_url:src.source_url,build:BUILD}
          })
        });
        if(Array.isArray(lock)&&lock.length){
          const built=buildMachineDesc(src,"");
          const name=(brl(src.capital)+" ACERTOS "+src.display+" — SALDO REAL "+brl(built.balance)).slice(0,512);
          const c=await createCard(name,built.desc);
          await db("cr_working_capital_periods_v1?period_key=eq."+encodeURIComponent(src.key),{
            method:"PATCH",headers:{"prefer":"return=minimal"},
            body:JSON.stringify({trello_card_id:String(c?.id||""),capital_generated:src.capital,manual_credits:0,manual_debits:0,real_balance:built.balance,status:"ACTIVE",updated_at:new Date().toISOString()})
          });
          created.push({period:src.display,capital:src.capital,id:c?.id||null});
        }
      }else if(ex.machine){
        const manual=extractManual(ex.card.desc);
        const built=buildMachineDesc(src,manual);
        const name=(brl(src.capital)+" ACERTOS "+src.display+" — SALDO REAL "+brl(built.balance)).slice(0,512);
        if(String(ex.card.name||"")!==name||String(ex.card.desc||"")!==built.desc){
          await updateCard(ex.card.id,{name,desc:built.desc});
          updated.push({period:src.display,balance:built.balance,id:ex.card.id});
        }
        await db("cr_working_capital_periods_v1?on_conflict=period_key",{
          method:"POST",headers:{"prefer":"resolution=merge-duplicates,return=minimal"},
          body:JSON.stringify({
            period_key:src.key,period_start:kd.start,period_end:kd.end,period_label:src.display,
            source_card_id:src.source_card_id,source_card_name:src.source_card_name,
            trello_card_id:String(ex.card.id||""),capital_generated:src.capital,
            manual_credits:built.mv.credits,manual_debits:built.mv.debits,real_balance:built.balance,
            status:"ACTIVE",metadata:{source_url:src.source_url,build:BUILD},updated_at:new Date().toISOString()
          })
        });
      }
    }
    if(created.length||updated.length){
      info=(await cards(CAPITAL_LIST)).filter(c=>!String(c.desc||"").includes(SUMMARY_MARK)&&!String(c.name||"").startsWith("📊 CAPITAL DE GIRO")&&periodMatch(c.name)).map(c=>legacyInfo(c,known));
    }
  }

  let generated=0,balance=0;
  const divergent:any[]=[];
  for(const x of info){
    generated+=x.credit;balance+=x.balance;
    if(x.divergent)divergent.push({id:x.card.id,name:x.card.name,title_balance:x.titleBal,description_balance:x.descBal,url:x.card.shortUrl});
  }
  generated=round2(generated);balance=round2(balance);
  const consumed=round2(generated-balance);
  const listName=("💱 CAPITAL DE GIRO TEMPORÁRIO | GERADO: "+brl(generated)+" | SALDO REAL: "+brl(balance)).slice(0,512);
  const summaryName=("📊 CAPITAL DE GIRO — GERADO "+brl(generated)+" | SALDO REAL "+brl(balance)).slice(0,512);
  const summaryDesc=[
    "📊 CAPITAL DE GIRO — CONTROLE AUTOMÁTICO",
    "",
    "💰 CAPITAL GERADO / HISTÓRICO: "+brl(generated),
    "✅ SALDO REAL DISPONÍVEL: "+brl(balance),
    "➖ CONSUMO LÍQUIDO HISTÓRICO: "+brl(consumed),
    "",
    "⏳ CAPITAL DO ACERTO ATUAL AINDA NÃO TRANSFERIDO: "+(pending.capital===null?"N/D":brl(pending.capital)),
    "📋 Períodos de Capital: "+info.length,
    "⚠️ Títulos divergentes do último saldo interno: "+divergent.length,
    "",
    "REGRA:",
    "• Capital Gerado = soma dos créditos de Capital de Giro por período.",
    "• Saldo Real = soma do saldo disponível de cada período após despesas, débitos, estornos e créditos.",
    "• O acerto atual só entra no histórico quando o período é registrado em VALORES RECEBIDOS 2026.",
    "• Débitos futuros devem ser lançados no bloco LANÇAMENTOS MANUAIS do card do período; a matemática é automática.",
    "",
    SUMMARY_MARK
  ].join("\n");

  if(doWrites){
    await db("cr_working_capital_state_v1?on_conflict=state_key",{
      method:"POST",headers:{"prefer":"resolution=merge-duplicates,return=minimal"},
      body:JSON.stringify({
        state_key:"GLOBAL",capital_generated:generated,real_balance:balance,net_consumed:consumed,
        pending_current_acerto:pending.capital,historical_cards:info.length,divergence_count:divergent.length,
        last_period_label:known.length?known[known.length-1].display:null,
        metadata:{build:BUILD,auto_start:AUTO_START,source:"TRELLO_RECONCILED"},
        updated_at:new Date().toISOString()
      })
    });
    const currentList=await trello("/lists/"+CAPITAL_LIST+"?fields=id,name");
    if(String(currentList?.name||"")!==listName)await updateListName(listName);
    let s=summaries[0]||null;
    if(!s){
      s=await createCard(summaryName,summaryDesc);
    }else if(String(s.name||"")!==summaryName||String(s.desc||"")!==summaryDesc){
      await updateCard(s.id,{name:summaryName,desc:summaryDesc});
    }
    if(s?.id)await updateCard(s.id,{pos:"top"});
  }
  return {
    ok:true,build:BUILD,
    capital_generated:generated,
    real_balance:balance,
    net_consumed:consumed,
    periods:info.length,
    pending_current_acerto:pending.capital,
    pending_current_updated_at:pending.updated_at,
    title_description_divergences:divergent,
    created_period_cards:created,
    updated_period_cards:updated,
    list_name:listName,
    rule:"CAPITAL_GENERATED_IS_NOT_AVAILABLE_BALANCE"
  };
}
async function installWebhook(){
  const token=env("TRELLO_API_TOKEN"),key=env("TRELLO_API_KEY");
  if(!token||!key)throw new Error("TRELLO_CREDENTIAL_GATE_REQUIRED");
  const base=env("SUPABASE_URL").replace(/\/$/,"");
  const cb=base+"/functions/v1/"+FUNCTION_SLUG+"?action=webhook&sig="+encodeURIComponent(WH_SIG);
  const existing=await trello("/tokens/"+encodeURIComponent(token)+"/webhooks");
  const found=Array.isArray(existing)?existing.find((x:any)=>String(x?.idModel)===FINANCE_BOARD&&String(x?.callbackURL)===cb&&x?.active!==false):null;
  if(found)return {created:false,id:found.id,callback:cb};
  const path="/tokens/"+encodeURIComponent(token)+"/webhooks?key="+encodeURIComponent(key)+"&callbackURL="+encodeURIComponent(cb)+"&idModel="+encodeURIComponent(FINANCE_BOARD)+"&description="+encodeURIComponent("CONSTRU-REI Capital de Giro V1");
  const w=await trello(path,"POST",{});
  return {created:true,id:w?.id||null,callback:cb};
}
function webhookRelevant(payload:any){
  const a=payload?.action||{},d=a?.data||{};
  const board=String(d?.board?.id||payload?.model?.id||"");
  if(board!==FINANCE_BOARD)return false;
  const type=String(a?.type||"");
  if(!["createCard","updateCard","deleteCard","copyCard","moveCardFromBoard","moveCardToBoard"].includes(type))return false;
  const name=String(d?.card?.name||"");
  if(name.startsWith("📊 CAPITAL DE GIRO"))return false;
  return true;
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":"*","access-control-allow-headers":"content-type,x-cr-session","access-control-allow-methods":"GET,POST,OPTIONS"}});
  const u=new URL(req.url),action=(u.searchParams.get("action")||"health").toLowerCase();
  if(req.method==="HEAD")return new Response(null,{status:200,headers:{"x-construrei-build":BUILD}});
  if(action==="health")return json({ok:true,build:BUILD,mode:"trello-ledger-reconcile",finance_board:FINANCE_BOARD,capital_list:CAPITAL_LIST,received_list:RECEIVED_2026_LIST});
  if(action==="summary"){
    if(!(await authorized(req)))return json({ok:false,error:"UNAUTHORIZED"},401);
    try{return json(await reconcile(false))}catch(e){return json({ok:false,build:BUILD,error:String(e?.message||e)},500)}
  }
  if(action==="sync"){
    if(u.searchParams.get("sig")!==WH_SIG)return json({ok:false,error:"FORBIDDEN"},403);
    try{return json(await reconcile(true))}catch(e){return json({ok:false,build:BUILD,error:String(e?.message||e)},500)}
  }
  if(action==="install-webhook"){
    if(u.searchParams.get("sig")!==WH_SIG)return json({ok:false,error:"FORBIDDEN"},403);
    try{return json({ok:true,build:BUILD,webhook:await installWebhook()})}catch(e){return json({ok:false,build:BUILD,error:String(e?.message||e)},500)}
  }
  if(action==="kick"){
    if(u.searchParams.get("sig")!==WH_SIG)return json({ok:false,error:"FORBIDDEN"},403);
    // @ts-ignore
    EdgeRuntime.waitUntil(reconcile(true));
    return json({ok:true,build:BUILD,accepted:true},202);
  }
  if(action==="bootstrap"){
    if(u.searchParams.get("sig")!==WH_SIG)return json({ok:false,error:"FORBIDDEN"},403);
    try{const w=await installWebhook();const s=await reconcile(true);return json({ok:true,build:BUILD,webhook:w,summary:s})}catch(e){return json({ok:false,build:BUILD,error:String(e?.message||e)},500)}
  }
  if(action==="webhook"){
    if(u.searchParams.get("sig")!==WH_SIG)return json({ok:false,error:"FORBIDDEN"},403);
    if(req.method!=="POST")return json({ok:false,error:"POST_REQUIRED"},405);
    let p:any=null;try{p=await req.json()}catch{return json({ok:false,error:"INVALID_JSON"},400)}
    if(!webhookRelevant(p))return json({ok:true,build:BUILD,ignored:true});
    await sleep(700);
    try{return json(await reconcile(true))}catch(e){return json({ok:false,build:BUILD,error:String(e?.message||e)},500)}
  }
  return json({ok:false,error:"NOT_FOUND"},404);
});