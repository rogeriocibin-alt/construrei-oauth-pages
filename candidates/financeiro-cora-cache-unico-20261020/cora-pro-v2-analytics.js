
(function(){"use strict";
const app=document.getElementById("app"), original=document.getElementById("cora-pro-module");
if(!app||!original||document.getElementById("crv2"))return;
const root=document.createElement("section");root.id="crv2";
root.innerHTML='<div class="crv2-heading"><h2>Gestão Cora Pro V2 · Central Analítica</h2><span id="crv2-coverage" class="pill">Validando histórico</span></div>'+
'<p class="crv2-sub">Análises bancárias por período. Fonte única dos números bancários: extrato Cora armazenado no Supabase. Trello e Gestão Click não são somados às entradas bancárias.</p>'+
'<div class="crv2-controls"><label>Período<select id="crv2-preset"><option value="year2026">2026 (até hoje)</option><option value="year2025">2025</option><option value="year2024">2024</option><option value="year2023">2023</option><option value="all">Todo o histórico</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="custom">Personalizado</option></select></label>'+
'<label>De<input type="date" id="crv2-from" min="2023-01-01"></label><label>Até<input type="date" id="crv2-to" min="2023-01-01"></label>'+
'<label>Agrupar<select id="crv2-grain"><option value="month">Mensal</option><option value="day">Diário</option><option value="week">Semanal</option><option value="year">Anual</option></select></label><button type="button" id="crv2-run">Consultar</button></div>'+
'<div class="crv2-boxes"><div class="crv2-box"><small>ENTRADAS BANCÁRIAS</small><strong id="crv2-credit">—</strong><small>No período selecionado</small></div>'+
'<div class="crv2-box"><small>SAÍDAS BANCÁRIAS</small><strong id="crv2-debit">—</strong><small>No período selecionado</small></div>'+
'<div class="crv2-box"><small>VARIAÇÃO DE CAIXA</small><strong id="crv2-net">—</strong><small>Não é lucro contábil</small></div>'+
'<div class="crv2-box"><small>MOVIMENTAÇÕES</small><strong id="crv2-count">—</strong><small id="crv2-countNote">Lançamentos distintos</small></div></div>'+
'<div class="crv2-chartgrid"><div class="crv2-chpanel"><h3>Evolução do fluxo de caixa</h3>'+
'<div class="crv2-legend"><span><i class="crv2-dot" style="background:#288fd0"></i>Entradas</span><span><i class="crv2-dot" style="background:#d68b42"></i>Saídas</span><span><i class="crv2-dot" style="background:#3e627b"></i>Acumulado líquido</span></div>'+
'<div id="crv2-chart">Escolha um período</div><p class="crv2-sub" id="crv2-chartNote"></p></div>'+
'<div class="crv2-chpanel"><h3>Composição das movimentações</h3>'+
'<div class="crv2-controls"><label>Natureza<select id="crv2-direction"><option value="debit">Saídas</option><option value="credit">Entradas</option></select></label>'+
'<label>Classificação<select id="crv2-class"><option value="bank">Modalidade bancária</option><option value="estimated">Categoria gerencial estimada</option></select></label></div>'+
'<div id="crv2-pie"><div id="crv2-pie-inner"><strong id="crv2-pieTotal">—</strong><small>no período</small></div></div><div id="crv2-cats"></div></div></div>'+
'<div class="crv2-actions"><button type="button" id="crv2-export">Exportar resumo CSV</button><button type="button" id="crv2-rerun">Atualizar consulta</button></div>'+
'<div class="crv2-status" id="crv2-status" role="status" aria-live="polite">Aguardando acesso à Diretoria.</div>'+
'<div class="crv2-actions"><button type="button" id="crv2-connectors">Consultar Trello e Gestão Click (ao vivo)</button></div>'+ 
'<h3 style="margin:12px 0 7px">Conciliação de fontes · sem duplicações</h3><div class="crv2-sources">'+
'<div class="crv2-source"><strong>Cora · fonte bancária</strong><small id="crv2-coraSource">Aguardando confirmação de cobertura e divergências.</small></div>'+
'<div class="crv2-source"><strong>Trello · gestão das obras</strong><small id="crv2-trelloSource">Obras, custos, repasses e recebimentos por card. É uma fonte operacional, não deve ser somada ao extrato como novo dinheiro.</small></div>'+
'<div class="crv2-source"><strong>Gestão Click · comercial</strong><small id="crv2-clickSource">Orçamentos, propostas e cobranças. Não representa automaticamente receita recebida nem substitui a conciliação bancária.</small></div></div>'+
'<div class="crv2-actions" style="margin-top:16px"><label>Conferir obra específica <input id="crv2-case" placeholder="Ex.: 645-26" maxlength="8" pattern="[0-9]{1,5}-(24|25|26)"></label><button type="button" id="crv2-case-search">Cruzar Cora × Trello × Click</button></div><div class="crv2-status" id="crv2-case-result">Informe o número da obra para identificar movimentos bancários que mencionam explicitamente essa obra. Nenhuma baixa será automática.</div>'+
'<div id="crv2-op-years" class="crv2-status">Indicadores de obras e propostas aparecem após consulta às fontes complementares.</div>'+ 
'<p class="crv2-alert">Integração de fontes: a leitura bancária da Cora está ativa. A conciliação automática linha a linha entre Cora, Trello e Gestão Click requer chaves comuns (obra, comprovante, valor/data), validação de vinculações e conectores ativos. Os dados não são artificialmente fundidos.</p>';
original.parentNode.insertBefore(root,original);
const $=id=>document.getElementById(id),money=n=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format((Number(n)||0)/100);
const today=()=>new Date().toISOString().slice(0,10),utc=d=>new Date(d+"T12:00:00Z");
const dayMinus=n=>{const d=utc(today());d.setUTCDate(d.getUTCDate()-n);return d.toISOString().slice(0,10)};
const colors=["#288fd0","#d8ac45","#e57469","#5eaf95","#7e7bcc","#9f84a1","#788da0","#4b6980"];
const catNames={PIX:"Pix",TRANSFER:"Transferência / TED",PAYMENT:"Pagamento",FEE:"Tarifas",BANK_DOMICILE:"Recebíveis de cartão",CARD:"Cartão",JUD_BLOCKER:"Bloqueio judicial",LIMIT_RESERVATION:"Reserva de limite",NOT_CLASSIFIED:"Tipo pendente de classificação"};
let current=null,estimated=null,years=null,serial=0,active=false;
function setPreset(){const v=$("crv2-preset").value,now=today(),year=/^year(\d{4})$/.exec(v);let a,b;
if(year){a=year[1]+"-01-01";b=year[1]===now.slice(0,4)?now:year[1]+"-12-31"}
else if(v==="all"){a="2023-01-01";b=now}
else if(/^\d+$/.test(v)){a=dayMinus(Number(v)-1);b=now}
else return;
$("crv2-from").value=a;$("crv2-to").value=b;$("crv2-grain").value=v==="all"?"year":/^\d+$/.test(v)?"day":"month";
}
for(const id of ["crv2-from","crv2-to"])$(id).addEventListener("change",()=>{$("crv2-preset").value="custom"});
$("crv2-preset").addEventListener("change",()=>{setPreset();run()});
$("crv2-grain").addEventListener("change",run);
$("crv2-direction").addEventListener("change",drawCategories);
$("crv2-class").addEventListener("change",()=>{if($("crv2-class").value==="estimated"&&!estimated)loadEstimated();else drawCategories()});
$("crv2-run").addEventListener("click",run);
$("crv2-rerun").addEventListener("click",run);
setPreset();
async function query(api,dates,timeout=30000){const url="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-cora-cache-gateway-20261020?api="+api+dates;
const resp=await fetch(url,{headers:{"x-cr-session":sessionStorage.getItem("crGestaoSession")||""},cache:"no-store",signal:AbortSignal.timeout(timeout)});
const d=await resp.json();if(!resp.ok||!d.ok)throw Error(d.error||"Erro HTTP "+resp.status);return d}
function valid(){const a=$("crv2-from").value,b=$("crv2-to").value;
if(!a||!b||a<"2023-01-01"||b>today()||a>b||Math.floor((utc(b)-utc(a))/864e5)>1465){$("crv2-status").textContent="Intervalo inválido. Consulte de 01/01/2023 até hoje, limitado a quatro anos.";return null}return {a,b}}
function renderChart(d){const host=$("crv2-chart");host.replaceChildren();const all=d.timeline||[],lim=24,items=all.slice(-lim);
$("crv2-chartNote").textContent=all.length>lim?"Exibindo as últimas "+lim+" faixas no gráfico, de "+all.length+" consultadas. Indicadores e CSV abrangem o período completo.":"Gráfico de "+all.length+" faixas no período selecionado.";
if(!items.length){host.textContent="Não há movimentações nesse intervalo.";return}
const ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg");svg.setAttribute("id","crv2-timeline");svg.setAttribute("viewBox","0 0 980 300");svg.setAttribute("role","img");svg.setAttribute("aria-label","Gráfico bancário de entradas, saídas e variação acumulada");
const add=(tag,attrs,parent=svg)=>{const node=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));parent.append(node);return node};
const max=Math.max(1,...items.flatMap(x=>[Number(x.credits)||0,Number(x.debits)||0])),step=918/items.length,w=Math.min(21,step*.3),base=186;
add("line",{x1:34,x2:957,y1:base,y2:base,stroke:"#b9cbd9"});
let acc=0;const cumul=items.map(x=>{acc+=(Number(x.credits)||0)-(Number(x.debits)||0);return acc}),lo=Math.min(0,...cumul),hi=Math.max(0,...cumul),range=Math.max(1,hi-lo),points=[];
items.forEach((x,i)=>{const c=40+(i+.5)*step,credit=Number(x.credits)||0,debit=Number(x.debits)||0,
a=add("rect",{x:c-w-2,y:base-127*credit/max,width:w,height:Math.max(.5,127*credit/max),fill:"#288fd0",rx:2}),
b=add("rect",{x:c+2,y:base,width:w,height:Math.max(.5,87*debit/max),fill:"#d68b42",rx:2});
for(const e of [a,b]){const title=add("title",{},e);title.textContent=x.label+": entradas "+money(credit)+", saídas "+money(debit)}
const tx=add("text",{x:c,y:292,"text-anchor":"middle",fill:"#667c91","font-size":items.length>18?10:12});
const grain=$("crv2-grain").value,stamp=String(x.label);tx.textContent=grain==="year"?stamp.slice(0,4):grain==="month"?stamp.slice(5,7)+"/"+stamp.slice(2,4):stamp.slice(5,10);
points.push(c+","+(117-(cumul[i]-lo)/range*73));
});
add("polyline",{points:points.join(" "),stroke:"#3e627b","stroke-width":3,fill:"none","stroke-linecap":"round","stroke-linejoin":"round"});
host.append(svg)}
function drawCategories(){const data=$("crv2-class").value==="estimated"?estimated:current;if(!data)return;
const dir=$("crv2-direction").value,rows=(data.categories||[]).filter(x=>x.direction===dir&&Number(x.cents)>0).sort((a,b)=>Number(b.cents)-Number(a.cents)),
total=rows.reduce((sum,r)=>sum+Number(r.cents),0),top=rows.length>8?[...rows.slice(0,7),{category:"Demais categorias",cents:rows.slice(7).reduce((s,r)=>s+Number(r.cents),0),direction:dir}]:rows;
let p=0;const seg=top.map((r,i)=>{const q=total?Number(r.cents)*100/total:0,start=p;p+=q;return colors[i%colors.length]+" "+start.toFixed(3)+"% "+p.toFixed(3)+"%"}).join(",");
$("crv2-pie").style.background=total?"conic-gradient("+seg+")":"#dce6ee";$("crv2-pieTotal").textContent=money(total);
const list=$("crv2-cats");list.replaceChildren();
if(!rows.length){list.textContent="Sem movimentações nesta natureza.";return}
for(const [i,r] of top.entries()){const tr=document.createElement("div");tr.className="crv2-cat";
const label=document.createElement("span"),amount=document.createElement("strong"),dot=document.createElement("i");dot.className="crv2-dot";dot.style.background=colors[i%colors.length];
label.append(dot,document.createTextNode(($("crv2-class").value==="bank"?catNames[r.category]||r.category:r.category)+" ("+((Number(r.cents)/total)*100).toFixed(1)+"%)"));amount.textContent=money(r.cents);tr.append(label,amount);list.append(tr)}
}
async function loadEstimated(){const r=valid();if(!r||!active)return;try{estimated=await query("categories","&start="+r.a+"&end="+r.b);drawCategories()}catch(err){$("crv2-status").textContent="Categorias sugeridas indisponíveis: "+err.message}}
async function run(){const v=valid();if(!v||!active)return;
const id=++serial;const button=$("crv2-run");button.disabled=true;$("crv2-status").textContent="Calculando indicadores do histórico já armazenado...";
try{const grain=$("crv2-grain").value,d=await query("insights","&start="+v.a+"&end="+v.b+"&grain="+grain);
if(id!==serial)return;current=d;estimated=null;const t=d.totals||{},credit=Number(t.credits)||0,debit=Number(t.debits)||0;
$("crv2-credit").textContent=money(credit);$("crv2-debit").textContent=money(debit);$("crv2-net").textContent=money(credit-debit);
$("crv2-count").textContent=new Intl.NumberFormat("pt-BR").format(Number(t.count)||0);$("crv2-countNote").textContent=(Number(t.unclassified)||0)+" sem modalidade detalhada";
renderChart(d);drawCategories();
const c=d.coverage||[],completed=c.filter(x=>x.status==="complete").length;
$("crv2-coverage").textContent=completed+"/"+c.length+" competências importadas";
$("crv2-coverage").className="pill "+(completed===c.length?"good":"warn");
$("crv2-coraSource").textContent=completed+" de "+c.length+" competências importadas neste recorte. Entradas/saídas calculadas das movimentações bancárias, sem somar outros sistemas.";
$("crv2-status").textContent="Extrato Cora · "+v.a+" até "+v.b+" · "+grain+" · "+(Number(t.count)||0)+" movimentações · "+completed+"/"+c.length+" períodos. Classificações gerenciais são estimadas e não substituem as categorias personalizadas do Cora Pro.";
if($("crv2-class").value==="estimated")loadEstimated();
}catch(err){$("crv2-status").textContent="Consulta não concluída: "+err.message}
finally{button.disabled=false}}


$("crv2-case-search").addEventListener("click",async()=>{
 const num=$("crv2-case").value.trim(),dest=$("crv2-case-result");
 if(!/^[0-9]{1,5}-(24|25|26)$/.test(num)){dest.textContent="Informe o número NNN-24, NNN-25 ou NNN-26.";return}
 if(!active){dest.textContent="Faça login para consultar as fontes.";return}
 const b=$("crv2-case-search");b.disabled=true;dest.textContent="Buscando referências documentadas nas três fontes...";
 try{const d=await query("case-match","&case="+encodeURIComponent(num),55000),bank=d.bank||{};
  dest.replaceChildren();
  const p1=document.createElement("p");p1.textContent="Cora · "+(bank.count||0)+" transações com referência textual à obra "+num+
   " · entradas "+money(bank.credits)+" · saídas "+money(bank.debits)+
   ". Essas transações ainda não foram confirmadas como liquidação de parcelas.";dest.append(p1);
  const p2=document.createElement("p"),t=d.trello;
  p2.textContent="Trello · "+(t?"card encontrado"+(t.status?" · "+t.status:"")+(t.gross_cents!==null&&t.gross_cents!==undefined?" · valor registrado "+money(t.gross_cents):""):"sem card confirmado nesta consulta")+
    " | Gestão Click · "+(d.gestaoclick||[]).length+" orçamento(s) localizado(s).";dest.append(p2);
  const p3=document.createElement("p");p3.textContent="Resultado: indícios por número da obra, somente consulta. Conferir comprovante, cliente, data, parcelas e descontos antes de conciliar.";dest.append(p3);
 }catch(e){dest.textContent="Não foi possível concluir a conferência: "+e.message}
 finally{b.disabled=false}
});

$("crv2-connectors").addEventListener("click",async()=>{
 if(!active){$("crv2-status").textContent="Entre na sessão protegida antes de consultar as fontes.";return}
 const btn=$("crv2-connectors");btn.disabled=true;
 $("crv2-trelloSource").textContent="Consultando as três bases de obras...";
 $("crv2-clickSource").textContent="Consultando orçamentos no Gestão Click...";
 try{
  const d=await query("sources","",55000),years=d.trello?.years||{};
  const all=Object.values(years),cases=all.reduce((s,v)=>s+(Number(v.operational_cases)||0),0),
  dup=all.reduce((s,v)=>s+(Number(v.duplicate_case_numbers)||0),0);
  $("crv2-trelloSource").textContent="Leitura direta: "+Object.keys(years).join(", ")+
    " · "+cases+" registros operacionais distintos por número de obra · "+
    dup+" casos de numeração duplicada identificados. Consulta: "+(d.trello?.read_at?new Date(d.trello.read_at).toLocaleString("pt-BR"):"agora")+
    ". Sem movimentação bancária duplicada.";

  const operational=$("crv2-op-years");
  operational.replaceChildren();
  const heading=document.createElement("h3");heading.textContent="Trello · resultado gerencial anual (separado do banco)";operational.append(heading);
  const table=document.createElement("table");table.style.minWidth="580px";
  const head=document.createElement("tr");
  for(const label of ["Ano","Obras","Fechado","Custos","Lucro","Margem"]){const th=document.createElement("th");th.textContent=label;head.append(th)}
  table.append(head);
  for(const year of ["2024","2025","2026"]){const x=years[year],m=x?.metrics||{};
   const tr=document.createElement("tr");const cols=[year,m.cases_total??x?.operational_cases??"—",
    m.gross_cents==null?"—":money(m.gross_cents),m.cost_cents==null?"—":money(m.cost_cents),
    m.profit_cents==null?"—":money(m.profit_cents),
    m.margin_pct==null?"—":Number(m.margin_pct).toFixed(2)+"%"];
   for(const val of cols){const td=document.createElement("td");td.textContent=String(val);tr.append(td)}
   table.append(tr);
  }
  const wrap=document.createElement("div");wrap.style.overflowX="auto";wrap.append(table);operational.append(wrap);
  const warning=document.createElement("p");warning.textContent="Fonte: Trello, totalização conforme cards e sumários canônicos; receitas por competência/obra não são entradas financeiras adicionais à Cora.";operational.append(warning);
  const gc=d.gestaoclick||{};
  $("crv2-clickSource").textContent=gc.ok?
    "Conexão de consulta operacional ativa. "+(gc.quotes_sampled??"Quantidade não informada")+
    " orçamentos analisados na amostra. Última leitura: "+(gc.read_at?new Date(gc.read_at).toLocaleString("pt-BR"):"agora")+
    ". Não são recebimentos bancários.":
    "Sem leitura confirmada do Gestão Click. Código HTTP: "+(gc.http_status||"não informado")+
    ". Não considerar esta fonte sincronizada.";
  $("crv2-status").textContent="Situação operacional consultada. Vinculação individual de lançamentos Cora ↔ obra Trello ↔ orçamento Click continua exigindo referência verificável, não cruzamento por valor isoladamente.";
 }catch(err){
   $("crv2-trelloSource").textContent="Consulta externa não confirmada: "+err.message;
   $("crv2-clickSource").textContent="Sem sincronização confirmada nesta tentativa.";
   $("crv2-status").textContent="Fontes complementares temporariamente indisponíveis. Gráficos bancários preservados.";
 }finally{btn.disabled=false}
});

$("crv2-export").addEventListener("click",()=>{if(!current)return;
const rows=[["Periodo","Entradas_R$","Saidas_R$","Variacao_R$","Qtd"]];
for(const r of current.timeline||[]){const c=Number(r.credits)||0,d=Number(r.debits)||0;rows.push([r.label,(c/100).toFixed(2),(d/100).toFixed(2),((c-d)/100).toFixed(2),Number(r.count)||0])}
const esc=v=>'"'+String(v).replace(/"/g,'""')+'"',csv="\ufeff"+rows.map(x=>x.map(esc).join(";")).join("\r\n");
const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="construrei-cora-pro-v2-"+$("crv2-from").value+"-"+$("crv2-to").value+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)
});
const auth=()=>!!sessionStorage.getItem("crGestaoSession")&&!app.hidden;
function gate(){if(auth()&&!active){active=true;run()}else if(!auth())active=false}
new MutationObserver(gate).observe(app,{attributes:true,attributeFilter:["hidden"]});
$("refresh")?.addEventListener("click",()=>{if(active)run()});
gate();
setInterval(()=>{
 if(!active||document.hidden)return;
 const period=$("crv2-preset").value;
 const currentNow=today(),from=$("crv2-from").value,to=$("crv2-to").value;
 if(to!==currentNow && period!=="all" && period!=="year"+currentNow.slice(0,4))return;
 run();
},120000);
document.addEventListener("visibilitychange",()=>{
 if(!document.hidden&&active)run();
});
})();
