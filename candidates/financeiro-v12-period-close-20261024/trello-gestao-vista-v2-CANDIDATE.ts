import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const BUILD="CR-TRELLO-GESTAO-VISTA-V2-IDEMPOTENT-20260930C-ACERTO-CANONICAL-GROSS-NET-20261023-R2";
const BASE="https://api.trello.com/1";
const MARK="CR-TRELLO-LIST-SUMMARY-V2";
const DUP="CR-TRELLO-LIST-SUMMARY-DUPLICATE-QUARANTINE";
const KEY="CR-REPAIR-20260921";
const WH="CR-WH-20260921-V2";
const BOARDS=["67774d4587d76c3ac7bb4ad5","665b0fece8104b14ac706e54","6974b24c16d17ca76351a950"];
const BOARD26="6974b24c16d17ca76351a950", ANNUAL26="6ab1c5d190d5ad3adcd5353b", ANNUAL_LIST26="6974f68fc004c43337d874ce";
const SETTLEMENT_LIST="6800f3a6b0c58c0518f249b5", SETTLEMENT_CARD="6ab6f27658e42565c7413b7b", SETTLEMENT_MARK="CR-TRELLO-ACERTOS-LIVE-V2";
const OP26=["6ab1a9706a25bdb68823099e","665b0fece8104b14ac706e55","6800f431f2eb1415a46a5559","6800f3a6b0c58c0518f249b5","67fdb8228578310717c6d65f"];
const ACTIVE=new Set();
const STALE_STATUS_LABEL_IDS=new Set(["6974b3573ae254f826132e9b","6a85db18ff4ef5e0a9c9b009","6a7b29c48502ea81a086b03d"]);
function env(n){return (Deno.env.get(n)||"").trim()}
function norm(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase()}
function js(x,s=200){return new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json","cache-control":"no-store","x-construrei-build":BUILD}})}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function money(v){if(v==null)return null;let s=String(v).replace(/[^\d.,-]/g,"");if(!s)return null;let c=s.lastIndexOf(","),d=s.lastIndexOf("."),p=Math.max(c,d);if(p>=0&&s.length-p-1===2)s=s.slice(0,p).replace(/[.,]/g,"")+"."+s.slice(p+1);else s=s.replace(/[.,]/g,"");let n=Number(s);return Number.isFinite(n)?n:null}
function lm(l){let m=String(l).match(/R\s*\$+\s*:?\s*([\d.,]+)/i)||String(l).match(/\bRS\s*:?\s*([\d.,]+)/i);return m?money(m[1]):null}
function cm(l){let m=String(l).match(/:\s*(?:R\s*\$+\s*)?([\d.,]+)/i);return m?money(m[1]):null}
function cno(n,d=""){
 const name=String(n||"");
 if(/aditivo\s+do/i.test(name)){
  const o=name.match(/or[çc]amento\s*:?\s*(\d{1,5})\s*-\s*(\d{2})\b/i);
  if(o)return String(Number(o[1]))+"-"+o[2];
 }
 const m=(name+" "+String(d||"")).match(/\b(\d{1,5})\s*-\s*(\d{2})\b/);
 return m?String(Number(m[1]))+"-"+m[2]:null
}
function cnum(c){let x=cno(c.name,c.desc);return x?Number(x.split("-")[0]):null}
function brl(n){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n||0))}
function live(n){return ["em andamento","aguardando pagamento","ag. pagamento","ag pagamento","aguardando acerto","ag. acerto","ag acerto","retorno","retornos"].includes(norm(n))}
function noSummary(n){return ["retorno","retornos"].includes(norm(n))}
function primarySummary(c){return !String(c.desc||"").includes(DUP)&&(String(c.desc||"").includes(MARK)||norm(c.name).startsWith("📊 resumo da lista"))}
function summary(c){return primarySummary(c)||String(c.desc||"").includes(DUP)||String(c.id||"")===SETTLEMENT_CARD||String(c.desc||"").includes(SETTLEMENT_MARK)||norm(c.name).startsWith("💰 acertos 2026")}
function auxiliary(c){return /^\s*💰\s*\d{1,5}\s*-\s*\d{2}\b.*\blucro\b/i.test(String(c?.name||""))}
function derived(c){return summary(c)||auxiliary(c)}
function workflowRole(n){let x=norm(n);if(["andamento","em andamento"].includes(x))return "progress";if(["aguardando pagamento","ag. pagamento","ag pagamento"].includes(x))return "payment";if(["aguardando acerto","ag. acerto","ag acerto"].includes(x))return "settlement";if(["retorno","retornos"].includes(x))return "return";return null}
function desiredWorkflowName(role){return role==="progress"?"Andamento":role==="payment"?"Aguardando Pagamento":role==="settlement"?"Aguardando Acerto":role==="return"?"Retorno":""}
function canonicalWorkflowLabel(labs,role){let name=desiredWorkflowName(role);return labs.find(x=>String(x?.name||"")===name)||labs.find(x=>workflowRole(x?.name)===role)}
async function ensureWorkflowLabel(board,labs,role){let x=canonicalWorkflowLabel(labs,role);if(x)return x;if(role!=="return")return null;let c=await req("/labels","POST",{idBoard:board,name:"Retorno",color:"orange"});labs.push(c);return c}
async function syncLiveStatus(board,listName,cs,labs){
 let role=workflowRole(listName);if(!role)return {changed:0,duplicates_removed:0};
 let target=await ensureWorkflowLabel(board,labs,role);if(!target)return {changed:0,duplicates_removed:0};
 let workflow=labs.filter(x=>workflowRole(x?.name));let changed=0;
 for(let c of cs){
  if(derived(c)||!cno(c.name,c.desc))continue;
  let ids=new Set((c.labels||[]).map(x=>x.id)),touched=false;
  for(let x of workflow)if(ids.has(x.id)&&x.id!==target.id){await detach(c.id,x.id);touched=true}
  if(!ids.has(target.id)){await attach(c.id,target.id);touched=true}
  if(touched)changed++;
 }
 let removed=0;
 if(board===BOARD26){
  for(let x of labs){
   if(STALE_STATUS_LABEL_IDS.has(String(x?.id||""))){
    try{await req("/labels/"+x.id,"DELETE");removed++}catch{}
   }
  }
 }
 return {changed,duplicates_removed:removed}
}
async function req(path,method="GET",body=null){
 let key=env("TRELLO_API_KEY"),token=env("TRELLO_API_TOKEN");if(!key||!token)throw new Error("TRELLO_CREDENTIALS");
 let u=new URL(BASE+path);u.searchParams.set("key",key);u.searchParams.set("token",token);
 for(let a=0;a<5;a++){
  let r=await fetch(u.toString(),{method,headers:{"accept":"application/json","content-type":"application/json","x-trello-client-identifier":"CONSTRU-REI-REPAIR-V2"},body:body==null?undefined:JSON.stringify(body)});
  if(r.status===429){let ra=Number(r.headers.get("retry-after")||0);await sleep((ra>0?ra*1000:[5000,10000,20000,40000,60000][a]));continue}
  let t=await r.text(),b=null;try{b=t?JSON.parse(t):null}catch{b=t}
  if(!r.ok)throw new Error("TRELLO_"+r.status+"_"+String(b?.message||b||"").slice(0,100));
  await sleep(method==="GET"?150:350);return b
 }
 throw new Error("TRELLO_429_PERSISTENT")
}
async function cards(list){let x=await req("/lists/"+list+"/cards?filter=open&fields=id,name,desc,labels,pos,idList");return Array.isArray(x)?x:[]}
async function labels(board){let x=await req("/boards/"+board+"/labels?limit=100&fields=id,name,color");return Array.isArray(x)?x:[]}
async function upd(id,b){return req("/cards/"+id,"PUT",b)}
async function attach(card,label){return req("/cards/"+card+"/idLabels","POST",{value:label})}
async function detach(card,label){return req("/cards/"+card+"/idLabels/"+label,"DELETE")}
async function create(list,name,desc){return req("/cards","POST",{idList:list,name,desc,pos:"top"})}
function analyze(c,allowSupport=false){
 let ls=String(c.desc||"").split(/\r?\n/),dg=null,tg=null,k=null,p=null,cap=0;
 for(let l of ls)if(/valor\s+fechado/i.test(l)){dg=lm(l)??cm(l);if(dg!=null)break}
 let mt=String(c.name||"").match(/R\s*\$+\s*:?\s*([\d.,]+)/i)||String(c.name||"").match(/\bRS\s*:?\s*([\d.,]+)/i);if(mt)tg=money(mt[1]);
 let conflict=false,g=dg??tg;if(dg!=null&&tg!=null&&Math.max(dg,tg)/Math.max(1,Math.min(dg,tg))>5){conflict=true;g=null}
 for(let l of ls)if(/total\s+(de\s+)?custos/i.test(l)){k=lm(l)??cm(l);if(k!=null)break}
 if(k==null){let st=ls.findIndex(l=>/^\s*Custos?\s*:?\s*$/i.test(l));if(st>=0){let s=0,f=false;for(let i=st+1;i<ls.length;i++){if(/^\s*(Total\s+Custos|Saldo|Lucro|Rateio\b|Resumo dos C[aá]lculos)/i.test(ls[i]))break;let n=lm(ls[i]);if(n!=null){s+=n;f=true}}if(f)k=Math.round(s*100)/100}}
 for(let re of [/saldo\s*\/\s*lucro\s*l[ií]quido/i,/saldo\s*\/\s*lucro/i,/^\s*saldo\s*:/i,/^\s*lucro\s*l[ií]quido\s*:/i])for(let l of ls)if(re.test(l)){p=lm(l)??cm(l);if(p!=null)break}
 if(p==null&&g!=null&&k!=null)p=Math.round((g-k)*100)/100;
 let rate={"Fabrício":0,"Éder":0,"Rogério":0,"Gabi":0,"Outros":0},sup={"Fabrício":0,"Éder":0};
 // Financeiro V12 CANDIDATE: seções de apoio e capital não são rateios.
 // Recapitulação de apoio já detalhado no bloco de custos NÃO representa outro custo.
 let section="OTHER",capitalRead=false;
 let supportRecap={"Fabrício":null,"Éder":null};
 for(let l of ls){
  let n=norm(l),label=n.replace(/^[^a-z0-9]+/g,"").trim();
  if(/^rateio\s+(?:do\s+|de\s+)?lucro\b/.test(label))section="RATEIO";
  else if(/^apoio\s*\/\s*diarias\b/.test(label))section="SUPPORT";
  else if(/^capital\s+de\s+giro\b/.test(label)){section="CAPITAL";capitalRead=false}
  else if(/^(?:movimentacoes\s+financeiras|fechamento\s+da\s+obra|custos?\s*:)/.test(label))section="OTHER";
  let v=lm(l)??cm(l);
  if(section==="CAPITAL"){
   if(v!=null&&!capitalRead&&(/capital.*giro|giro.*capital|10%\s*sobre\s+o\s+(?:lucro|liquido)/.test(label))){
    cap+=v;capitalRead=true;
   }
  }else if(/capital.*giro|giro.*capital/.test(n)&&v!=null)cap+=v;
  if(section!=="SUPPORT" && !/capital|margem|lucro\s*:/.test(n)
      && !/\bapoio\b|\bdiaria\b/.test(n)
      && /(fabricio|\beder\b|rogerio|\bgabi\b|gabrielly|agata|camila).*:/.test(n)){
   if(v!=null){if(/fabricio/.test(n))rate["Fabrício"]+=v;
   else if(/\beder\b/.test(n))rate["Éder"]+=v;
   else if(/rogerio/.test(n))rate["Rogério"]+=v;
   else if(/\bgabi\b|gabrielly/.test(n))rate["Gabi"]+=v;
   else if(/agata|camila/.test(n))rate["Outros"]+=v}
  }
  if(allowSupport&&v!=null){
   if(section==="SUPPORT"){
    if(/^fabricio\s*:/.test(label))supportRecap["Fabrício"]=v;
    if(/^eder\s*:/.test(label))supportRecap["Éder"]=v;
   }else if(/\bapoio\b|\bdiaria\b/.test(n)){
    if(/fabricio/.test(n))sup["Fabrício"]+=v;
    if(/\beder\b/.test(n))sup["Éder"]+=v;
   }
  }
 }
 if(allowSupport){
  if(sup["Fabrício"]===0&&supportRecap["Fabrício"]!=null)sup["Fabrício"]=supportRecap["Fabrício"];
  if(sup["Éder"]===0&&supportRecap["Éder"]!=null)sup["Éder"]=supportRecap["Éder"];
 }
 return {case:cno(c.name,c.desc),g,k,p,rate,sup,cap,inc:conflict||g==null||k==null||p==null}
}
function agg(cs,allowSupport=false){let a={count:0,g:0,k:0,p:0,rate:{"Fabrício":0,"Éder":0,"Rogério":0,"Gabi":0,"Outros":0},sup:{"Fabrício":0,"Éder":0},cap:0,inc:[]};for(let c of cs){if(derived(c))continue;let x=analyze(c,allowSupport);if(!x.case)continue;a.count++;if(x.g!=null)a.g+=x.g;if(x.k!=null)a.k+=x.k;if(x.p!=null)a.p+=x.p;for(let q of Object.keys(a.rate))a.rate[q]+=x.rate[q];for(let q of Object.keys(a.sup))a.sup[q]+=x.sup[q];a.cap+=x.cap;if(x.inc)a.inc.push(x.case)}a.margin=a.g?Math.round(a.p/a.g*10000)/100:0;a.rateado=Object.values(a.rate).reduce((s,v)=>s+Number(v),0);a.apoios=a.sup["Fabrício"]+a.sup["Éder"];a.equipe=a.rateado+a.apoios;a.rateio_gap_cents=Math.round(a.p*100)-Math.round(a.rateado*100)-Math.round(a.cap*100);return a}
function desc(a){return ["📊 RESUMO DA LISTA","📋 Obras: "+a.count+" | ⚠️ A conferir: "+a.inc.length,"💰 Bruto: "+brl(a.g),"💸 Custos: "+brl(a.k),"💵 Lucro: "+brl(a.p)+" | 📈 Margem: "+String(a.margin.toFixed(2)).replace(".",",")+"%","","👥 RATEIO DO LUCRO","Fabrício: "+brl(a.rate["Fabrício"])+" | Éder: "+brl(a.rate["Éder"]),"Rogério: "+brl(a.rate["Rogério"])+" | Gabi: "+brl(a.rate["Gabi"]),"Outros: "+brl(a.rate["Outros"]),"","🛠️ APOIO / DIÁRIAS","Fabrício: "+brl(a.sup["Fabrício"])+" | Éder: "+brl(a.sup["Éder"]),"","💳 RENDA EFETIVA","Fabrício: "+brl(a.rate["Fabrício"]+a.sup["Fabrício"])+" | Éder: "+brl(a.rate["Éder"]+a.sup["Éder"]),"Rogério: "+brl(a.rate["Rogério"])+" | Gabi: "+brl(a.rate["Gabi"]),"","💰 Rateado: "+brl(a.rateado),"🛠️ Apoios: "+brl(a.apoios),"💰 Destinado à equipe: "+brl(a.equipe),"🏦 Capital de Giro: "+brl(a.cap),"🧮 Diferença lucro versus rateio + CG (sem ajuste automático): "+brl(a.rateio_gap_cents/100),"","⚠️ Conferir: "+(a.inc.slice(0,30).join(", ")||"Nenhum"),MARK].join("\n")}

function round2(n){return Math.round((Number(n)||0)*100)/100}
function settlementClient(c){
 const name=String(c.name||"");
 let m=name.match(/Imobili[aá]ria\s+(Vizia|J20|J8|Raz[aã]o|Galv[aã]o|Arahome|Firenze|Prates|JBA|Gonzaga|Avaliare)/i)
   ||name.match(/Cliente\s*:\s*(Vizia|J20|J8|Raz[aã]o|Galv[aã]o|Arahome|Firenze|Prates|JBA|Gonzaga|Avaliare)/i);
 if(m)return m[1];
 const names=(c.labels||[]).map(x=>String(x?.name||"").trim()).filter(Boolean);
 let v=names.find(x=>/imobili[aá]ria|vizia|j20|\bj8\b|raz[aã]o|galv[aã]o|arahome|firenze|prates|jba|gon[zç]aga|aval/i.test(x));
 if(v)return v.replace(/^imobili[aá]ria\s*/i,"").trim();
 m=name.match(/\b(Vizia|J20|J8|Raz[aã]o|Galv[aã]o|Arahome|Firenze|Prates|JBA|Gonzaga|Avaliare)\b/i);
 return m?m[1]:"—";
}
function settlementProvider(c){
 const names=(c.labels||[]).map(x=>String(x?.name||"").trim()).filter(Boolean);
 const known=names.filter(x=>/(fabricio|fabr[ií]cio|\beder\b|éder|jr rafael|jhefferson|claudio|cl[aá]udio|maicon|andrey|edione|carlos|ferreira|ailton|jhow|leanderson|osmar)/i.test(x));
 if(known.length)return [...new Set(known)].join(" / ");
 const m=String(c.name||"").match(/Prestador\s*:??\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ]{1,50}?)(?=\s+-\s+|\s*\(|$)/i);
 return m?m[1].trim():"—";
}
function settlementAddress(c){
 const n=String(c.name||"").replace(/\s+/g," ").trim();
 const m=n.match(/\b(Rua|R\.|Avenida|Av\.|Alameda|Travessa|Estrada|Rodovia)\s+.+/i);
 if(!m)return "—";
 return m[0]
  .replace(/\s+\((DADOS\s+NF|Recebido|Acerto|Eder|Éder|Fabricio|Fabrício|Relatorio|Relatório).*$/i,"")
  .replace(/\s+-\s+(pagamento|NF\b|Recebido\b|Acerto\b|Eder\b|Éder\b|Fabricio\b|Fabrício\b|OK\b|\d{1,2}\/\d{1,2}).*$/i,"")
  .replace(/\s+(INFILTRA[CÇ][AÃ]O|Prestador\s*:?).*$/i,"")
  .trim()
  .slice(0,240);
}
function settlementSplit(profit){
 const cents=Math.round((Number(profit)||0)*100);
 const f=Math.round(cents*0.20),e=Math.round(cents*0.28),r=Math.round(cents*0.28),g=Math.round(cents*0.14);
 const cg=cents-f-e-r-g;
 return {f:f/100,e:e/100,r:r/100,g:g/100,cg:cg/100,total:cents/100};
}
function settlementMoney(v){
 if(v==null)return null;
 let s=String(v).replace(/[^\d.,-]/g,""); if(!s)return null;
 let c=s.lastIndexOf(","),d=s.lastIndexOf("."),p=Math.max(c,d),tail=p>=0?s.length-p-1:0;
 if(p>=0&&(tail===1||tail===2))s=s.slice(0,p).replace(/[.,]/g,"")+"."+s.slice(p+1);
 else s=s.replace(/[.,]/g,"");
 let n=Number(s); return Number.isFinite(n)?n:null
}
function settlementLm(l){let m=String(l).match(/R\s*\$+\s*:?\s*([\d.,]+)/i)||String(l).match(/\bRS\s*:?\s*([\d.,]+)/i);return m?settlementMoney(m[1]):null}
function settlementCm(l){let m=String(l).match(/:\s*(?:R\s*\$+\s*)?([\d.,]+)/i);return m?settlementMoney(m[1]):null}
function settlementAnalyze(c){
 const lines=String(c.desc||"").split(/\r?\n/);
 let closed=null,received=null,totalCosts=null;
 for(const l of lines){
  if(closed==null&&/valor\s+fechado/i.test(l))closed=settlementLm(l)??settlementCm(l);
  if(received==null&&/valor\s+recebido/i.test(l))received=settlementLm(l)??settlementCm(l);
  if(/total\s+(de\s+)?custos/i.test(l)&&!/(relocad|subtotal|parcial)/i.test(l)){
   const v=settlementLm(l)??settlementCm(l); if(v!=null)totalCosts=v;
  }
 }
 const costLines=[];
 let start=lines.findIndex(l=>/^\s*Custos?\s*:?\s*$/i.test(l));
 if(start>=0){
  for(let i=start+1;i<lines.length;i++){
   const l=String(lines[i]||"").trim();
   if(/(Saldo\s*\/|^\s*Saldo\s*:|Lucro\s*L[ií]quido|^\s*Lucro\s*:|Rateio\b|Resumo dos C[aá]lculos)/i.test(l))break;
   if(/Total\s+(de\s+)?Custos/i.test(l))continue;
   if(l&&settlementLm(l)!=null)costLines.push(l.replace(/\s+/g," ").slice(0,180));
  }
 }
 if(totalCosts==null&&costLines.length){
  totalCosts=round2(costLines.reduce((s,l)=>s+(settlementLm(l)||0),0));
 }
 // Preserve the confirmed gross settlement base only when the net-received gap
 // is exactly a discount/fee already included in the expense ledger.
 // Do not treat partial receipts or reimbursements as fully received income.
 const explicitBaseLine=lines.find(l=>/^\s*[•*-]?\s*Base do Acerto\s*:/i.test(l));
 const explicitBase=explicitBaseLine?settlementLm(explicitBaseLine)??settlementCm(explicitBaseLine):null;
 const gapCents=(closed!=null&&received!=null)?Math.round((closed-received)*100):0;
 const feeAlreadyCosted=gapCents>0&&costLines.some(l=>{
  if(!/\b(taxa|desconto|comiss[aã]o|reten[cç][aã]o)\b/i.test(l))return false;
  const v=settlementLm(l);
  return v!=null&&Math.round(v*100)===gapCents;
 });
 const grossFeeMatched=closed!=null&&received!=null&&explicitBase!=null
  &&Math.round(explicitBase*100)===Math.round(closed*100)&&feeAlreadyCosted;
 const base=grossFeeMatched?closed:(received!=null?received:closed);
 const profit=(base!=null&&totalCosts!=null)?round2(base-totalCosts):null;
 const margin=(base&&profit!=null)?round2(profit/base*100):null;
 const split=profit!=null?settlementSplit(profit):null;
 return {
  no:cno(c.name,c.desc),
  client:settlementClient(c),
  address:settlementAddress(c),
  provider:settlementProvider(c),
  closed,received,base,totalCosts,profit,margin,split,costLines,grossFeeMatched,
  ok:base!=null&&totalCosts!=null&&profit!=null
 };
}
function settlementReport(cs){
 const works=cs.filter(c=>c.id!==SETTLEMENT_CARD&&!derived(c)&&cno(c.name,c.desc));
 const rows=works.map(c=>settlementAnalyze(c));
 let base=0,cost=0,profit=0,F=0,E=0,R=0,G=0,CG=0,checked=0;
 const pending=[];
 const lines=["💰 ACERTOS 2026 — AGUARDANDO ACERTO","🏗️ "+rows.length+" obras",""];
 rows.forEach((x,i)=>{
  lines.push((i+1)+"️⃣ "+(x.no||"SEM Nº")+" | "+x.client);
  lines.push("📍 "+x.address);
  lines.push("👷 Prestador: "+x.provider);
  if(x.closed!=null)lines.push("Valor Fechado: "+brl(x.closed));
  if(x.received!=null)lines.push("Valor Recebido: "+brl(x.received));
  lines.push("Base considerada: "+(x.grossFeeMatched?"Fechado (desconto já consta nos custos) ":(x.received!=null?"Recebido ":"Fechado "))+(x.base!=null?brl(x.base):"—"));
  lines.push("Custos:");
  if(x.costLines.length)for(const c of x.costLines)lines.push("• "+c);
  else lines.push("• Detalhamento não identificado");
  lines.push("Total Custos: "+(x.totalCosts!=null?brl(x.totalCosts):"—"));
  lines.push("Lucro Líquido: "+(x.profit!=null?brl(x.profit):"—")+" | Margem: "+(x.margin!=null?String(x.margin.toFixed(2)).replace(".",",")+"%":"—"));
  if(x.split){
   lines.push("Fabrício 20%: "+brl(x.split.f)+" | Éder 28%: "+brl(x.split.e));
   lines.push("Rogério 28%: "+brl(x.split.r)+" | Gabi 14%: "+brl(x.split.g)+" | Capital de Giro: "+brl(x.split.cg));
  }else lines.push("Rateio: PENDENTE");
  lines.push("");
  if(x.ok&&x.split){
   checked++;base+=x.base;cost+=x.totalCosts;profit+=x.profit;F+=x.split.f;E+=x.split.e;R+=x.split.r;G+=x.split.g;CG+=x.split.cg;
  }else pending.push(x.no||"SEM Nº");
 });
 base=round2(base);cost=round2(cost);profit=round2(profit);F=round2(F);E=round2(E);R=round2(R);G=round2(G);CG=round2(CG);
 const distributed=round2(F+E+R+G+CG),diff=round2(profit-distributed),margin=base?round2(profit/base*100):0;
 lines.push("📋 RESUMO");
 lines.push("Obras: "+rows.length+" | Conferidas: "+checked+" | Pendências: "+pending.length);
 lines.push("Base: "+brl(base)+" | Custos: "+brl(cost)+" | Lucro: "+brl(profit)+" | Margem: "+String(margin.toFixed(2)).replace(".",",")+"%");
 lines.push("Fabrício: "+brl(F)+" | Éder: "+brl(E)+" | Rogério: "+brl(R));
 lines.push("Gabi: "+brl(G)+" | Capital de Giro: "+brl(CG));
 lines.push("✅ Distribuído: "+brl(distributed)+" | Diferença: "+brl(diff));
 lines.push("⚠️ Pendências: "+(pending.length?pending.join(", "):"Nenhuma"));
 lines.push(SETTLEMENT_MARK);
 return {desc:lines.join("\n"),summary:{count:rows.length,checked,pending,base,cost,profit,margin,F,E,R,G,CG,distributed,diff}};
}
async function updateSettlementAcertos(cs){
 const rep=settlementReport(cs);
 if(rep.desc.length>16000)throw new Error("ACERTOS_DESC_TOO_LONG_"+rep.desc.length);
 for(let x of cs){
  if(String(x.id)!==SETTLEMENT_CARD&&(String(x.desc||"").includes(SETTLEMENT_MARK)||norm(x.name).startsWith("💰 acertos 2026"))){
   try{await upd(x.id,{closed:true})}catch{}
  }
 }
 let card=await req("/cards/"+SETTLEMENT_CARD+"?fields=id,name,desc,closed,idList");
 if(card?.closed||String(card?.idList||"")!==SETTLEMENT_LIST){
  card=await upd(SETTLEMENT_CARD,{closed:false,idList:SETTLEMENT_LIST,pos:"top"});
 }
 if(String(card.desc||"")!==rep.desc||String(card.name||"")!=="💰 ACERTOS 2026 — AGUARDANDO ACERTO"){
  await upd(SETTLEMENT_CARD,{name:"💰 ACERTOS 2026 — AGUARDANDO ACERTO",desc:rep.desc});
 }
 return rep.summary;
}

function aggProgress(cs){
 let a={count:0,g:0,inc:[],maxCase:null,maxGross:0};
 for(let c of cs){
  if(derived(c))continue;
  let x=analyze(c,true);
  if(!x.case)continue;
  a.count++;
  if(x.g==null)a.inc.push(x.case);
  else{a.g+=x.g;if(x.g>a.maxGross){a.maxGross=x.g;a.maxCase=x.case}}
 }
 a.ticket=a.count?Math.round(a.g/a.count*100)/100:0;
 return a
}
function descProgress(a){
 return [
  "📊 RESUMO DA LISTA — EM ANDAMENTO",
  "📋 Serviços: "+a.count+" | ⚠️ A conferir: "+a.inc.length,
  "💰 Volume financeiro em execução: "+brl(a.g),
  "📊 Ticket médio: "+brl(a.ticket),
  "🏗️ Maior obra em execução: "+(a.maxCase||"—")+(a.maxCase?" | "+brl(a.maxGross):""),
  "⚠️ Sem valor identificado: "+a.inc.length,
  "",
  "ℹ️ Volume em execução não é faturamento recebido nem lucro final.",
  "ℹ️ Custos e lucro permanecem nos cards operacionais até o fechamento.",
  MARK
 ].join("\n")
}
async function repair(board,list,listName){
 let cs=await cards(list),labs=await labels(board),dup=0,status=0,sorted=0,statusDuplicatesRemoved=0;
 let stale=cs.filter(c=>String(c.desc||"").includes(DUP));
 for(let d of stale){try{await upd(d.id,{closed:true});dup++}catch{}}
 cs=await cards(list);
 let sums=cs.filter(primarySummary);
 if(sums.length>1){
  sums.sort((a,b)=>(a.pos||0)-(b.pos||0));
  for(let d of sums.slice(1)){try{await upd(d.id,{closed:true});dup++}catch{}}
  cs=await cards(list)
 }
 if(live(listName)){let st=await syncLiveStatus(board,listName,cs,labs);status+=st.changed;statusDuplicatesRemoved+=st.duplicates_removed;cs=await cards(list)}
 else{let fin=labs.find(x=>["concluido","finalizado"].includes(norm(x.name))),ands=labs.filter(x=>["andamento","em andamento"].includes(norm(x.name)));if(fin){for(let c of cs){if(!cno(c.name,c.desc))continue;let ids=new Set((c.labels||[]).map(x=>x.id)),rm=ands.filter(x=>ids.has(x.id));if(!rm.length)continue;for(let x of rm)await detach(c.id,x.id);if(!ids.has(fin.id))await attach(c.id,fin.id);status++}}}
 if(!noSummary(listName)){
 cs=await cards(list);
 let prog=norm(listName)==="em andamento",a=prog?aggProgress(cs):agg(cs,board==="6974b24c16d17ca76351a950"),name=("📊 RESUMO DA LISTA — "+a.count+" OBRAS | "+brl(a.g)).slice(0,512),d=prog?descProgress(a):desc(a),s=cs.find(primarySummary);
 if(s)await upd(s.id,{name,desc:d});
 else{
  let all=await req("/lists/"+list+"/cards?filter=all&fields=id,name,desc,closed,pos,idList");
  let archived=Array.isArray(all)?all.find(c=>c.closed&&primarySummary(c)):null;
  if(archived)await upd(archived.id,{closed:false,idList:list,pos:"top",name,desc:d});
  else await create(list,name,d)
 }
 cs=await cards(list)
}
 let settlement=null;if(board===BOARD26&&list===SETTLEMENT_LIST){
 settlement=await updateSettlementAcertos(cs);cs=await cards(list);
 const ps=cs.find(primarySummary);
 if(ps&&settlement){
  const nm=("📊 RESUMO DA LISTA — "+settlement.count+" OBRAS | "+brl(settlement.base)).slice(0,512);
  const dd=[
   "📊 RESUMO DA LISTA — AG. ACERTO",
   "📋 Obras: "+settlement.count+" | ✅ Conferidas: "+settlement.checked+" | ⚠️ Pendências: "+settlement.pending.length,
   "💰 Base considerada: "+brl(settlement.base),
   "💸 Custos: "+brl(settlement.cost),
   "💵 Lucro líquido: "+brl(settlement.profit)+" | 📈 Margem: "+String(settlement.margin.toFixed(2)).replace(".",",")+"%",
   "",
   "👥 RATEIO DO LUCRO",
   "Fabrício: "+brl(settlement.F)+" | Éder: "+brl(settlement.E),
   "Rogério: "+brl(settlement.R)+" | Gabi: "+brl(settlement.G),
   "🏦 Capital de Giro: "+brl(settlement.CG),
   "✅ Distribuído: "+brl(settlement.distributed)+" | Diferença: "+brl(settlement.diff),
   "",
   "📌 Base: recebido líquido; se desconto de repasse já consta como custo e bruto foi confirmado, usar bruto para evitar desconto duplo.",
   "📌 Fonte do acerto: cards reais da lista AG. ACERTO; cards de resumo são derivados.",
   "CR-TRELLO-LIST-SUMMARY-V2",
   "CR-TRELLO-ACERTO-SUMMARY-CANONICAL-V1"
  ].join("\n");
  if(String(ps.name||"")!==nm||String(ps.desc||"")!==dd)await upd(ps.id,{name:nm,desc:dd});
  cs=await cards(list);
 }
}
 let main=cs.filter(c=>!String(c.desc||"").includes(DUP));
 let summaries=main.filter(summary).sort((a,b)=>{
   const rank=x=>String(x?.desc||"").includes(MARK)?0:String(x?.desc||"").includes(SETTLEMENT_MARK)?1:2;
   return rank(a)-rank(b)||(a.pos||0)-(b.pos||0)
  }),controls=main.filter(c=>!summary(c)&&(!cno(c.name,c.desc)||auxiliary(c))),nums=main.filter(c=>!summary(c)&&!auxiliary(c)&&cno(c.name,c.desc)).sort((a,b)=>(cnum(b)||0)-(cnum(a)||0)),dups=cs.filter(c=>String(c.desc||"").includes(DUP));
 let desired=[...summaries,...controls,...nums,...dups];let cur=cs.map(c=>c.id).join(","),des=desired.map(c=>c.id).join(",");
 if(cur!==des){for(let i=desired.length-1;i>=0;i--){await req("/cards/"+desired[i].id,"PUT",{pos:"top"});sorted++}}
 return {ok:true,build:BUILD,list:listName,duplicates_quarantined:dup,status_changed:status,status_label_duplicates_removed:statusDuplicatesRemoved,sort_writes:sorted,summary:noSummary(listName)?null:(norm(listName)==="em andamento"?aggProgress(cs):agg(cs,board==="6974b24c16d17ca76351a950")),settlement}
}

async function listMeta(id){
 const x=await req("/lists/"+id+"?fields=id,name,idBoard");
 return {id:String(x?.id||id),name:String(x?.name||""),board:String(x?.idBoard||"")};
}
async function resolveWebhookLists(payload){
 const a=payload?.action?.data||{};
 let board=String(a?.board?.id||payload?.model?.id||"");
 const ids=new Set();
 for(const v of [a?.list?.id,a?.listAfter?.id,a?.listBefore?.id,a?.card?.idList]) if(v) ids.add(String(v));
 if(!ids.size&&a?.card?.id){
  try{const c=await req("/cards/"+a.card.id+"?fields=id,idList");if(c?.idList)ids.add(String(c.idList))}catch{}
 }
 const lists=[];
 for(const id of ids){
  try{
   const m=await listMeta(id);
   if(!board&&m.board)board=m.board;
   if(BOARDS.includes(m.board))lists.push(m);
  }catch{}
 }
 return {board,lists,cardName:String(a?.card?.name||""),old:a?.old||{}};
}
function annualMoney(v){
 if(v==null)return null;
 let s=String(v).replace(/[^\d.,-]/g,"").replace(/[.,]+$/,"");
 if(!s)return null;
 let c=s.lastIndexOf(","),d=s.lastIndexOf("."),p=Math.max(c,d);
 if(p>=0&&s.length-p-1===2)s=s.slice(0,p).replace(/[.,]/g,"")+"."+s.slice(p+1);
 else s=s.replace(/[.,]/g,"");
 let n=Number(s);return Number.isFinite(n)?n:null
}
function annualGross(c){
 const no=cno(c?.name,c?.desc);
 let dg=null,tg=null;
 for(const l of String(c?.desc||"").split(/\r?\n/)){
  if(!/valor\s+fechado/i.test(l))continue;
  const m=l.match(/valor\s+fechado\s*:?\s*(?:(?:R\s*\$?|RS)\s*:?\s*)?([0-9][\d.,]*)/i);
  if(m){dg=annualMoney(m[1]);if(dg!=null)break}
 }
 const name=String(c?.name||"");
 let m=name.match(/(?:R\s*\$?|RS)\s*:?\s*([0-9][\d.,]*)/i);
 if(m)tg=annualMoney(m[1]);
 if(tg==null){
  m=name.match(/([0-9][\d.]*,\d{2})\s*(?:R\s*\$?|RS)\b/i);
  if(m)tg=annualMoney(m[1]);
 }
 if(tg==null&&no){
  const esc=no.replace("-","\\-");
  m=name.match(new RegExp("\\b"+esc+"\\s*\\)?\\s*([0-9][\\d.]*,\\d{2})\\b","i"));
  if(m)tg=annualMoney(m[1]);
 }
 if(dg!=null&&tg!=null&&Math.max(dg,tg)/Math.max(1,Math.min(dg,tg))>5)return null;
 return dg??tg
}
async function liveAnnual26(){
 let all=await req("/boards/"+BOARD26+"/cards?filter=open&fields=id,name,desc,idList,pos");
 all=Array.isArray(all)?all:[];
 const unique=new Map();
 for(const c of all){
  if(String(c?.idList||"")===ANNUAL_LIST26)continue;
  if(derived(c)||norm(c?.name).startsWith("duplicado — não usar"))continue;
  const no=cno(c?.name,c?.desc);
  if(!no)continue;
  if(!unique.has(no))unique.set(no,c);
 }
 const works=[...unique.values()];
 const byList=new Map();
 let gross=0;
 const grossChecks=[];
 for(const c of works){
  byList.set(String(c.idList),(byList.get(String(c.idList))||0)+1);
  const no=cno(c.name,c.desc);
  const g=annualGross(c);
  if(g==null)grossChecks.push(no);
  else gross+=Number(g);
 }
 gross=Math.round(gross*100)/100;
 const total=works.length;
 const op=works.filter(c=>OP26.includes(String(c.idList))).length;
 const monthly=total-op;
 const archive=byList.get("6ab1a9706a25bdb68823099e")||0;
 const progress=byList.get("665b0fece8104b14ac706e55")||0;
 const waiting=byList.get("6800f431f2eb1415a46a5559")||0;
 const settlement=byList.get("6800f3a6b0c58c0518f249b5")||0;
 const returns=byList.get("67fdb8228578310717c6d65f")||0;

 const c=await req("/cards/"+ANNUAL26+"?fields=id,name,desc");
 const old=String(c?.desc||"");
 const cost=(old.match(/💸[^\n]*/)||["💸 Custos reconciliados nos resumos: —"])[0];
 const profit=(old.match(/💵[^\n]*/)||["💵 Lucro / saldo confirmado: —"])[0];
 let margin=(old.match(/📈[^\n]*/)||["📈 Margem confirmada: —"])[0];
 if(/Margem confirmada:/i.test(margin))margin=margin.replace(/Margem confirmada:/i,"Margem confirmada sobre a base fechada:");
 let tail="";
 const ti=old.indexOf("👥 RATEIO DO LUCRO");
 if(ti>=0)tail=old.slice(ti)
   .replace(/\nCR-TRELLO-ANNUAL[^\n]*/g,"")
   .replace(/\nCR-ANNUAL-CURRENT-LOCATION[^\n]*/g,"")
   .replace(/\nCR-ANNUAL-LIVE-GROSS[^\n]*/g,"")
   .trim();

 const lines=[
  "📊 RESUMO ANUAL 2026 — ATÉ O MOMENTO",
  "📋 Obras: "+total+" | ⚠️ Bruto a conferir: "+grossChecks.length,
  "💰 Bruto vivo identificado: "+brl(gross),
  cost,
  profit,
  margin,
  "",
  "✅ CONTAGEM ATUAL — 2026",
  "Listas mensais Jan–Dez: "+monthly+" obras",
  "Fora das listas mensais: "+op+" obras",
  "TOTAL: "+total+" obras",
  "",
  "Distribuição atual fora dos meses:",
  "• Arquivados: "+archive,
  "• Em Andamento: "+progress,
  "• Aguardando Pagamento: "+waiting,
  "• Aguardando Acerto: "+settlement
 ];
 if(returns)lines.push("• Retornos: "+returns);
 lines.push(
  "",
  "📌 O bruto vivo é recalculado automaticamente a partir dos cards existentes no quadro 2026.",
  "📌 Movimentar um card entre listas não altera o total anual; criar, arquivar ou corrigir valor altera o total quando aplicável.",
  "📌 Custos, lucro, margem e rateios abaixo permanecem valores confirmados/reconciliados até o respectivo fechamento financeiro."
 );
 if(grossChecks.length)lines.push("⚠️ Bruto a conferir: "+grossChecks.slice(0,30).join(", "));
 if(tail)lines.push("",tail);
 lines.push(
  "",
  "CR-TRELLO-ANNUAL-SUMMARY-2026-LIVE-V4",
  "CR-ANNUAL-CURRENT-LOCATION|monthly="+monthly+"|operational="+op+"|total="+total,
  "CR-ANNUAL-LIVE-GROSS|gross="+gross.toFixed(2)+"|checks="+grossChecks.length
 );
 const d=lines.join("\n");
 const name=("📊 RESUMO ANUAL 2026 — "+total+" OBRAS | "+brl(gross)).slice(0,512);
 if(name!==c.name||d!==c.desc)await upd(ANNUAL26,{name,desc:d});
 return {total,monthly,operational:op,gross,bruto_a_conferir:grossChecks,distribution:{archive,progress,waiting,settlement,returns}};
}
async function setupWebhooks(){
 let token=env("TRELLO_API_TOKEN"), base=env("SUPABASE_URL").replace(/\/$/,"");
 if(!token||!base) throw new Error("WEBHOOK_ENV_MISSING");
 let existing=await req("/tokens/"+encodeURIComponent(token)+"/webhooks");
 let out=[];
 for(let board of BOARDS){
  let cb=base+"/functions/v1/cr-trello-gestao-vista-v2?action=webhook&sig="+encodeURIComponent(WH);
  let f=Array.isArray(existing)?existing.find(x=>String(x.idModel)===board&&String(x.callbackURL)===cb&&x.active!==false):null;
  if(f){out.push({board,created:false,id:f.id});continue}
  let q="/webhooks?idModel="+encodeURIComponent(board)+"&callbackURL="+encodeURIComponent(cb)+"&description="+encodeURIComponent("CONSTRU-REI Gestão à Vista V2");
  let w=await req(q,"POST",{});
  out.push({board,created:true,id:w.id});
 }
 return out
}
async function handleWebhook(payload){
 const ctx=await resolveWebhookLists(payload);
 if(!BOARDS.includes(ctx.board))return {ignored:true,reason:"OUTSIDE_SCOPE"};
 if(norm(ctx.cardName).startsWith("📊 resumo")||norm(ctx.cardName).startsWith("💰 acertos 2026")||norm(ctx.cardName).startsWith("duplicado — não usar"))return {ignored:true,reason:"DERIVED_CARD"};
 if(Object.keys(ctx.old).length===1&&Object.prototype.hasOwnProperty.call(ctx.old,"pos"))return {ignored:true,reason:"POSITION_ONLY"};
 await sleep(1200);
 const results=[];
 for(const m of ctx.lists){
  const lk=m.board+":"+m.id;
  if(ACTIVE.has(lk)){results.push({list:m.name,ignored:true,reason:"ALREADY_RUNNING"});continue}
  ACTIVE.add(lk);
  try{results.push(await repair(m.board,m.id,m.name))}
  finally{ACTIVE.delete(lk)}
 }
 const out={ok:true,build:BUILD,board:ctx.board,lists_repaired:results.length,results};
 if(ctx.board===BOARD26)out.annual_live=await liveAnnual26();
 if(!ctx.lists.length)out.warning="NO_LIST_RESOLVED";
 return out;
}
Deno.serve(async(r)=>{
 let u=new URL(r.url),action=u.searchParams.get("action")||"health";
 if(r.method==="HEAD")return new Response(null,{status:200,headers:{"x-construrei-build":BUILD}});
 if(action==="webhook"){
  if(u.searchParams.get("sig")!==WH)return js({ok:false,error:"FORBIDDEN"},403);
  if(r.method!=="POST")return js({ok:false,error:"POST_REQUIRED"},405);
  let p;try{p=await r.json()}catch{return js({ok:false,error:"INVALID_JSON"},400)}
  try{return js(await handleWebhook(p))}catch(e){return js({ok:false,error:String(e?.message||e)},500)}
 }
 if(u.searchParams.get("key")!==KEY)return js({ok:false,error:"FORBIDDEN"},403);
 if(action==="setup-webhooks"){try{return js({ok:true,build:BUILD,webhooks:await setupWebhooks()})}catch(e){return js({ok:false,error:String(e?.message||e)},500)}}
 if(action==="repair-list"){try{return js(await repair(u.searchParams.get("board"),u.searchParams.get("list"),u.searchParams.get("name")||""))}catch(e){return js({ok:false,error:String(e?.message||e)},500)}}
 return js({ok:true,build:BUILD,mode:"incremental-webhook",active:ACTIVE.size})
});