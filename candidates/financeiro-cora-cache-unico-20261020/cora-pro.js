(async function(){"use strict";
const root=document.getElementById("cora-pro-module");if(!root)return;
try{const r=await fetch("./cora-pro-panel.html",{cache:"no-store"});if(!r.ok)throw Error("Painel não publicado");root.innerHTML=await r.text()}catch(e){root.textContent="Módulo Cora Pro indisponível: "+e.message;return}
const e=id=>document.getElementById(id),brl=c=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format((Number(c)||0)/100),iso=d=>d.toISOString().slice(0,10),now=new Date();
const colors=["#e4ab31","#dc4380","#2aabdf","#3272a3","#4cbe99","#807bd5","#8c98a4","#52677d"];
const labels={PIX:"Pix",TRANSFER:"Transferência / TED",PAYMENT:"Pagamento",FEE:"Tarifa",BANK_DOMICILE:"Recebíveis de cartão",CARD:"Cartão",JUD_BLOCKER:"Bloqueio judicial",LIMIT_RESERVATION:"Reserva de limite",NOT_CLASSIFIED:"Ainda sem identificação"};
let active="finance",grain="month",mode="past",catType="credit",categoryData=null,seq=0,logged=false;
const services=[["Pix","Transferências instantâneas"],["Cobrar","Boletos e cobranças"],["Pagar","Contas e pagamentos"],["Transferir","TED e transferências"],["Depositar","Créditos na conta"],["Cartão","Faturas e limites"],["Tap to Pay","Pagamento no celular"],["Link de pagamento","Cobrança por link"],["Boletos DDA","Gestão de boletos"],["Minhas Finanças","Categoria e projeção"],["API e integrações","Conexões autorizadas"]];
for(const [name,desc] of services){const a=document.createElement("a");a.href="https://app.cora.com.br/";a.target="_blank";a.rel="noopener noreferrer";a.className="cpro-service";const title=document.createElement("strong"),sub=document.createElement("small");title.textContent=name+" ↗";sub.textContent=desc+" · abrir Cora";a.append(title,sub);e("cpro-service-list").append(a)}
const signed=()=>!!sessionStorage.getItem("crGestaoSession")&&!e("app").hidden;
async function request(path,timeout=28000){
 const res=await fetch("https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-cora-cache-gateway-20261020"+path,
 {headers:{"x-cr-session":sessionStorage.getItem("crGestaoSession")||""},cache:"no-store",signal:AbortSignal.timeout(timeout)});
 const d=await res.json().catch(()=>({error:"INVALID_JSON"}));if(!res.ok||!d.ok)throw Error(d.error||("HTTP "+res.status));return d;
}
function span(g){
 const end=iso(new Date()),t=new Date();let start;
 if(g==="day")start=iso(new Date(Date.now()-13*86400000));
 else if(g==="week")start=iso(new Date(Date.now()-55*86400000));
 else if(g==="month")start=iso(new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth()-5,1)));
 else start="2023-01-01";
 return {start,end};
}
function view(tab){
 active=tab;root.querySelectorAll("[data-cpro-tab]").forEach(x=>x.setAttribute("aria-selected",String(x.dataset.cproTab===tab)));
 root.querySelectorAll("[data-cpro-screen]").forEach(x=>x.hidden=x.dataset.cproScreen!==tab);
 if(tab==="finance"&&mode==="past")loadFinance();
 if(tab==="categories")loadCategories();
}
root.querySelectorAll("[data-cpro-tab]").forEach(x=>x.addEventListener("click",()=>view(x.dataset.cproTab)));
root.querySelectorAll("[data-cpro-time]").forEach(x=>x.addEventListener("click",()=>{
 mode=x.dataset.cproTime;
 root.querySelectorAll("[data-cpro-time]").forEach(b=>b.setAttribute("aria-pressed",String(b===x)));
 e("cpro-past").hidden=mode!=="past";e("cpro-future").hidden=mode!=="future";if(mode==="past")loadFinance();
}));
root.querySelectorAll("[data-cpro-grain]").forEach(x=>x.addEventListener("click",()=>{
 grain=x.dataset.cproGrain;root.querySelectorAll("[data-cpro-grain]").forEach(b=>b.setAttribute("aria-pressed",String(b===x)));
 if(mode==="past")loadFinance();
}));
root.querySelectorAll("[data-cpro-cat]").forEach(x=>x.addEventListener("click",()=>{
 catType=x.dataset.cproCat;root.querySelectorAll("[data-cpro-cat]").forEach(b=>b.setAttribute("aria-pressed",String(b===x)));paintCategories();
}));
let catMonth=now.getUTCMonth()+1;
const catMonths=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function drawCategoryMonthButtons(){const zone=e("cpro-cat-months");zone.replaceChildren();const y=Number(e("cpro-cat-year").value);
 for(let m=1;m<=(y===now.getUTCFullYear()?now.getUTCMonth()+1:12);m++){
  const b=document.createElement("button");b.type="button";b.textContent=catMonths[m-1];b.setAttribute("aria-pressed",String(catMonth===m));
  b.addEventListener("click",()=>{catMonth=m;drawCategoryMonthButtons();loadCategories()});zone.append(b);
 }
}
e("cpro-cat-year").onchange=()=>{if(Number(e("cpro-cat-year").value)===now.getUTCFullYear()&&catMonth>now.getUTCMonth()+1)catMonth=now.getUTCMonth()+1;drawCategoryMonthButtons();loadCategories()};
drawCategoryMonthButtons();
e("cpro-open-invoices").onclick=()=>view("invoices");
e("cpro-see-bank").onclick=()=>e("rows")?.closest(".panel")?.scrollIntoView({behavior:"smooth",block:"start"});
e("cpro-invoice-start").value=iso(new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)));
e("cpro-invoice-end").value=iso(now);e("cpro-load-invoices").onclick=loadInvoices;
const ns="http://www.w3.org/2000/svg";
function drawGraph(d){
 const box=e("cpro-graph");box.replaceChildren();const rows=(d.timeline||[]).slice(-18);
 if(!rows.length){box.textContent="Nenhuma movimentação no intervalo.";return}
 const svg=document.createElementNS(ns,"svg");svg.setAttribute("viewBox","0 0 880 300");svg.setAttribute("role","img");svg.setAttribute("aria-label","Gráfico de entradas e saídas com variação acumulada");
 const add=(tag,attrs)=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));svg.append(n);return n};
 const zero=193,max=Math.max(1,...rows.flatMap(v=>[Number(v.credits||0),Number(v.debits||0)])),space=810/rows.length,w=Math.min(42,space*.34);
 add("line",{x1:20,y1:zero,x2:860,y2:zero,stroke:"#bacddd"});
 const diffs=rows.map(v=>Number(v.credits||0)-Number(v.debits||0));let acc=0;const cum=diffs.map(v=>acc+=v);
 const lo=Math.min(0,...cum),hi=Math.max(0,...cum),rng=Math.max(1,hi-lo);
 const coords=[];
 rows.forEach((r,i)=>{
  const center=26+space*(i+.5),incoming=Number(r.credits||0),outgoing=Number(r.debits||0),inH=incoming/max*116,outH=outgoing/max*80;
  const a=add("rect",{x:center-w-2,y:zero-inH,width:w,height:Math.max(1,inH),fill:"#288fd0",rx:2});
  const b=add("rect",{x:center+2,y:zero,width:w,height:Math.max(1,outH),fill:"#e85d71",rx:2});
  for(const item of [a,b]){const tt=document.createElementNS(ns,"title");tt.textContent=r.label+" · entradas "+brl(incoming)+" · saídas "+brl(outgoing);item.append(tt)}
  const txt=add("text",{x:center,y:286,"text-anchor":"middle","font-size":11,fill:"#69829a"});
  txt.textContent=grain==="year"?r.label.slice(0,4):grain==="month"?r.label.slice(5,7)+"/"+r.label.slice(2,4):r.label.slice(5);
  coords.push(center+","+(90-(cum[i]-lo)/rng*59));
 });
 add("polyline",{points:coords.join(" "),stroke:"#3f536b","stroke-width":3,fill:"none","stroke-linecap":"round","stroke-linejoin":"round"});
 cum.forEach((v,i)=>{const xy=coords[i].split(",");add("circle",{cx:xy[0],cy:xy[1],r:3,fill:"#3f536b"})});
 box.append(svg);
}
async function loadFinance(){
 if(!signed()||mode==="future")return;
 const ticket=++seq,q=span(grain);e("cpro-status").textContent="Lendo histórico no Supabase...";
 try{const d=await request("?api=insights&start="+q.start+"&end="+q.end+"&grain="+grain);if(ticket!==seq)return;
  const total=d.totals||{},coverage=d.coverage||[],complete=coverage.length>0&&coverage.every(x=>x.status==="complete"),qual=complete?"Período conferido":"PARCIAL — meses ainda em importação";
  e("cpro-in").textContent=brl(total.credits);e("cpro-out").textContent=brl(total.debits);
  e("cpro-net").textContent=brl((Number(total.credits)||0)-(Number(total.debits)||0));
  e("cpro-in-note").textContent=qual;e("cpro-out-note").textContent=qual;
  e("cpro-balance").textContent=e("balance")?.textContent||"—";
  e("cpro-balance-note").textContent=e("balanceAge")?.textContent||"";
  drawGraph(d);e("cpro-status").textContent=(total.count||0)+" lançamentos · "+q.start+" a "+q.end+" · "+qual+" · extrato armazenado.";
 }catch(err){if(ticket===seq)e("cpro-status").textContent="Consulta indisponível: "+err.message}
}
function categoryPeriod(){
 const year=Number(e("cpro-cat-year").value)||now.getUTCFullYear(),month=catMonth;
 const start=iso(new Date(Date.UTC(year,month-1,1))),end=iso(new Date(Math.min(Date.UTC(year,month,0),Date.now())));return {start,end};
}
async function loadCategories(){
 if(!signed())return;const q=categoryPeriod();e("cpro-cat-status").textContent="Lendo modalidades...";
 try{categoryData=await request("?api=insights&start="+q.start+"&end="+q.end+"&grain=month");paintCategories();
 const complete=(categoryData.coverage||[]).every(v=>v.status==="complete");
 e("cpro-cat-status").textContent=(complete?"Extrato concluído. ":"Mês em importação. ")+"As modalidades exibidas dependem do tipo informado no extrato.";
 }catch(err){e("cpro-cat-status").textContent="Não foi possível consultar as modalidades: "+err.message}
}
function paintCategories(){
 if(!categoryData)return;
 const c=(categoryData.categories||[]).filter(x=>x.direction===catType).sort((a,b)=>Number(b.cents)-Number(a.cents)),
 total=c.reduce((s,x)=>s+Number(x.cents||0),0),period=categoryPeriod(),list=e("cpro-cat-list");list.replaceChildren();
 let pct=0;const stops=c.map((v,i)=>{const vpc=total?Number(v.cents)/total*100:0,start=pct;pct+=vpc;return colors[i%colors.length]+" "+start.toFixed(2)+"% "+pct.toFixed(2)+"%"});
 e("cpro-donut").style.background=stops.length?"conic-gradient("+stops.join(",")+")":"#e1e7ec";
 e("cpro-donut-total").textContent=brl(total);e("cpro-donut-period").textContent=period.start.slice(5,7)+"/"+period.start.slice(0,4);
 if(!c.length){const msg=document.createElement("div");msg.className="cpro-empty";msg.textContent="Nenhum lançamento de "+(catType==="credit"?"entrada":"saída")+" no período.";list.append(msg)}
 for(const [i,v] of c.entries()){
  const r=document.createElement("div");r.className="cpro-category-row";
  const dot=document.createElement("span");dot.className="cpro-legend-dot";dot.style.background=colors[i%colors.length];
  const name=document.createElement("span");name.textContent=(labels[v.category]||"Outro: "+v.category)+" · "+(total?(Number(v.cents)/total*100).toFixed(1):"0")+"%";
  const value=document.createElement("span");value.textContent=brl(v.cents);r.append(dot,name,value);list.append(r);
 }
 const ref=e("cpro-legacy");ref.hidden=period.start!=="2026-10-01";if(!ref.hidden)ref.textContent="Referência do vídeo de 20/10/2026: Cora Pro mostra Pix/TED R$ 38.417,32 e Outros R$ 0,06, somando R$ 38.417,38. O extrato bancário importado não contém a rubrica de seis centavos; ela não foi adicionada artificialmente.";
}
async function loadInvoices(){
 if(!signed())return;const state=e("cpro-invoice-state").value,start=e("cpro-invoice-start").value,end=e("cpro-invoice-end").value,b=e("cpro-load-invoices");
 if(!start||!end||start>end){e("cpro-invoice-status").textContent="Informe um período válido.";return}
 b.disabled=true;e("cpro-invoice-status").textContent="Consultando API de cobranças Cora (somente leitura)...";e("cpro-invoice-rows").replaceChildren();
 try{const d=await request("?api=invoices&start="+start+"&end="+end+"&state="+state,48000);
  e("cpro-invoice-status").textContent="API Cora: "+d.total_items+" cobranças encontradas. Exibindo até 20.";
  for(const x of d.items||[]){const tr=document.createElement("tr");for(const val of [x.id||"—",x.due_date||"—",x.state||"—",x.amount_centavos===null?"Consultar na Cora":brl(x.amount_centavos)]){const td=document.createElement("td");td.textContent=String(val);tr.append(td)}e("cpro-invoice-rows").append(tr)}
  if(!(d.items||[]).length)e("cpro-invoice-status").textContent="Nenhuma cobrança retornada para este filtro. A API pode não representar todas as cobranças do aplicativo.";
 }catch(err){e("cpro-invoice-status").textContent="Consulta de cobranças não disponível nessa integração: "+err.message+". Utilize o aplicativo Cora."}
 finally{b.disabled=false}
}
let hasLoaded=false;const app=e("app");
const observer=new MutationObserver(()=>{if(signed()&&!hasLoaded){hasLoaded=true;loadFinance()}else if(!signed())hasLoaded=false});
observer.observe(app,{attributes:true,attributeFilter:["hidden"]});
if(signed()){hasLoaded=true;loadFinance()}
e("refresh")?.addEventListener("click",()=>{setTimeout(()=>{if(active==="finance")loadFinance();if(active==="categories")loadCategories()},750)});
for(const id of ["year","month"])e(id)?.addEventListener("change",()=>{if(active==="categories")loadCategories()});
})();