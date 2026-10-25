import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BUILD="CR-DASHBOARD-GERENCIAL-V4-CLOSE-WORK-GUARD-20261025-V27";
const SB=(Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co").trim();
const TRELLO_BASE="https://api.trello.com/1";
const GC_BASE="https://api.gestaoclick.com/api";
const BOARD_NAMES=["GESTÃO DE OBRAS 2024","GESTÃO DE OBRAS 2025","GESTÃO DE OBRAS 2026"];
const CURRENT_YEAR="26";

function json(data:any,status=200){
  const raw=Number(status);
  const safeStatus=Number.isInteger(raw)&&raw>=200&&raw<=599?raw:500;
  return new Response(JSON.stringify(data),{status:safeStatus,headers:{
    "content-type":"application/json; charset=utf-8",
    "cache-control":"no-store",
    "x-content-type-options":"nosniff",
    "x-construrei-build":BUILD
  }});
}
function sec(n:string){return (Deno.env.get(n)||"").trim()}
function norm(v:any){
  return String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toUpperCase().replace(/[^A-Z0-9]+/g," ").trim().replace(/\s+/g," ");
}
function safe(v:any,n=240){return v==null?null:String(v).slice(0,n)}
function extractCase(v:any){
  const s=String(v??"");
  let m=s.match(/\b(\d{1,5})\s*-\s*(\d{2})\b/);
  if(m)return m[1]+"-"+m[2];
  m=s.match(/(?:^|\D)(\d{1,5})(\d{2})(?:\D|$)/);
  if(m){
    const yy=Number(m[2]);
    if(yy>=20&&yy<=99)return m[1]+"-"+m[2];
  }
  return null;
}
function centsFromBr(v:any){
  if(v==null)return null;
  let s=String(v).replace(/R\$/gi,"").replace(/\s/g,"").trim();
  if(!s)return null;
  const neg=s.startsWith("-")||s.includes("(-");
  s=s.replace(/[^0-9,.-]/g,"");
  if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");
  else{
    const parts=s.split(".");
    if(parts.length>2)s=parts.join("");
  }
  const n=Number(s.replace(/[()]/g,""));
  if(!Number.isFinite(n))return null;
  return Math.round((neg?-Math.abs(n):n)*100);
}
function pctNum(v:any){
  if(v==null)return null;
  const n=Number(String(v).replace(",",".").replace(/[^0-9.-]/g,""));
  return Number.isFinite(n)?Math.round(n*100)/100:null;
}
function findMoney(text:string,label:RegExp){
  const clean=text.replace(/\*/g,"").replace(/[\u200b-\u200f\u2060\ufeff]/g,"");
  const m=clean.match(label);
  if(!m)return null;
  return centsFromBr(m[1]);
}
function sumCostSection(text:string){
  const clean=text.replace(/\*/g,"").replace(/[\u200b-\u200f\u2060\ufeff]/g,"");
  const start=clean.search(/(?:^|\n)\s*Custos\s*:??/i);
  if(start<0)return null;
  let section=clean.slice(start);
  const cut=section.search(/\n\s*(?:Total\s+(?:de\s+)?Custos(?:\s+at[eé]\s+\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)?|Saldo|Lucro|Rateio|✅\s*Fabr[ií]cio)/i);
  if(cut>0)section=section.slice(0,cut);
  let total=0,count=0;
  for(const line of section.split(/\r?\n/)){
    if(!/\d{1,2}\/\d{1,2}/.test(line))continue;
    let m=line.match(/R\$\s*([-]?[0-9.]+,[0-9]{2})/i);
    if(!m)m=line.match(/\d{1,2}\/\d{1,2}\s*[-:]\s*(?:R\$\s*)?([-]?[0-9.]+,[0-9]{2})/i);
    if(!m)continue;
    const c=centsFromBr(m[1]);
    if(c!=null){total+=c;count++}
  }
  return count?total:null;
}
function parseRateios(text:string){
  const clean=text.replace(/\*/g,"").replace(/[\u200b-\u200f\u2060\ufeff]/g,"");
  const out:Record<string,{percent:number|null,cents:number,source:string}>={};
  let capitalCents:number|null=null, equalShareCents:number|null=null;
  const alias=(raw:string)=>{
    const x=norm(raw).replace(/\s+/g," ");
    const a:Record<string,string>={"FABRICIO":"Fabrício","EDER":"Éder","ROGERIO":"Rogério","GABI":"Gabrielly","GABRIELLY":"Gabrielly","CAMILA":"Camila","AGATA":"Ágata"};
    return a[x]||raw.trim();
  };
  for(const raw of clean.split(/\r?\n/)){
    const line=raw.trim(); if(!line)continue;
    if(/Capital\s+(?:de\s+)?Giro/i.test(line)){
      const mm=line.match(/R\$\s*([-]?[0-9.]+,[0-9]{2})/i); if(mm)capitalCents=centsFromBr(mm[1]); continue;
    }
    if(/Valor\s+pra\s+Cada|Valor\s+para\s+Cada/i.test(line)){
      const mm=line.match(/R\$\s*(?:R\$\s*)?([-]?[0-9.]+,[0-9]{2})/i); if(mm)equalShareCents=centsFromBr(mm[1]); continue;
    }
    let m=line.match(/(?:✅|💲)?\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.-]{1,30}?)\s*\((\d+(?:[.,]\d+)?)%\)\s*:\s*R\$\s*([-]?[0-9.]+,[0-9]{2})/i);
    if(m){const c=centsFromBr(m[3]);if(c!=null)out[alias(m[1])]={percent:pctNum(m[2]),cents:c,source:"EXPLICIT_PERCENT"};continue}
    m=line.match(/(?:✅|💲)?\s*(Fabr[ií]cio|Éder|Eder|Rog[eé]rio|Rogerio|Camila|Gabi|Gabrielly|Ágata|Agata)\s*:\s*R\$\s*([-]?[0-9.]+,[0-9]{2})/i);
    if(m){const c=centsFromBr(m[2]);if(c!=null)out[alias(m[1])]={percent:null,cents:c,source:"EXPLICIT_VALUE"}}
  }
  return {people:out,capital_cents:capitalCents,equal_share_cents:equalShareCents};
}
function statusFromCard(c:any,listName:string){
  const all=norm((c?.name||"")+" "+listName+" "+(c?.labels||[]).map((x:any)=>x?.name||"").join(" "));
  if(all.includes("CANCELADO"))return "CANCELADO";
  if(all.includes("NAO EXECUTADO"))return "NÃO EXECUTADO";
  if(all.includes("PAGAMENTO ATRASADO"))return "PAGAMENTO ATRASADO";
  const l=norm(listName);
  if(l==="RETORNOS"||l==="RETORNO")return "RETORNO";
  if(l==="EM ANDAMENTO")return "EM ANDAMENTO";
  if(l==="AGUARDANDO PAGAMENTO"||l==="AG PAGAMENTO")return "AGUARDANDO PAGAMENTO";
  if(l==="AGUARDANDO ACERTO"||l==="AG ACERTO")return "AGUARDANDO ACERTO";
  if(/^(0?[1-9]|1[0-2])\b/.test(l)||/JANEIRO|FEVEREIRO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO/.test(l))return "FINALIZADO";
  if(l.includes("PAGAMENTO RECEBIDO"))return "FINALIZADO";
  if(l.includes("VISITAS AGENDADAS"))return "VISITA";
  return listName||"OUTRO";
}
function monthFromList(v:any){
  const n=norm(v);
  const numeric=n.match(/^(0?[1-9]|1[0-2])\b/);
  if(numeric)return Number(numeric[1]);
  const map:any={JANEIRO:1,JAN:1,FEVEREIRO:2,FEV:2,MARCO:3,MAR:3,ABRIL:4,ABR:4,MAIO:5,MAI:5,JUNHO:6,JUN:6,JULHO:7,JUL:7,AGOSTO:8,AGO:8,SETEMBRO:9,SET:9,OUTUBRO:10,OUT:10,NOVEMBRO:11,NOV:11,DEZEMBRO:12,DEZ:12};
  for(const[k,m]of Object.entries(map))if(new RegExp("(^|\\s)"+k+"(\\s|$|\\/)").test(n))return m as number;
  return null;
}


function isListSummaryCard(c:any){
  const n=norm(c?.name||"");
  const d=String(c?.desc||"");
  return !c?.closed && (n.startsWith("RESUMO DA LISTA") || /CR-TRELLO-LIST-SUMMARY/i.test(d));
}
function isAnnualSummaryCard(c:any,year:string){
  const n=norm(c?.name||"");
  return !c?.closed && n.includes("RESUMO ANUAL "+year);
}
function isGeneralSummaryCard(c:any){
  const n=norm(c?.name||"");
  return !c?.closed && n.includes("RESUMO GERAL CONSTRU REI 2024 2026");
}
function summaryMoney(text:string,patterns:RegExp[]){
  const clean=String(text||"").replace(/\*/g,"").replace(/[\u200b-\u200f\u2060\ufeff]/g,"");
  for(const re of patterns){
    const m=clean.match(re);
    if(m){const c=centsFromBr(m[1]);if(c!=null)return c}
  }
  return null;
}
function summaryCount(text:string,name:string){
  const m=String(text||"").match(/(?:📋\s*)?Obras(?:\s+finalizadas|\s+consolidadas)?\s*:\s*(\d+)/i)
    ||String(name||"").match(/—\s*(\d+)\s*OBRAS/i);
  return m?Number(m[1]):null;
}
function summaryIssues(text:string){
  const m=String(text||"").match(/A\s+conferir\s*:\s*(\d+)/i);
  return m?Number(m[1]):null;
}
function summaryMargin(text:string){
  const m=String(text||"").match(/Margem(?:\s+confirmada(?:\s+sobre\s+o\s+(?:bruto|faturamento))?|\s+sobre\s+as\s+\d+\s+obras\s+fechadas|\s+confirmada)?\s*:\s*([\d.,]+)%/i);
  return m?pctNum(m[1]):null;
}
function summaryGross(text:string,name:string){
  return summaryMoney(text,[
    /Bruto(?:\s+reconciliado|\s+total\s+identificado|\s+fechado)?\s*:\s*R\$\s*([\d.]+,\d{2})/i,
    /Faturamento(?:\s+anual|\s+finalizado|\s+reconciliado|\s*\/\s*bruto)?(?:\s+reconciliado|\s+consolidado)?\s*:\s*R\$\s*([\d.]+,\d{2})/i
  ]) ?? summaryMoney(name,[/R\$\s*([\d.]+,\d{2})/i]);
}
function summaryCost(text:string){
  return summaryMoney(text,[
    /Custos(?:\s+finais\s+confirmados|\s+registrados(?:\s+no\s+resumo\s+legado)?|\s+reconciliados(?:\s+nos\s+resumos)?)?\s*:\s*R\$\s*([\d.]+,\d{2})/i
  ]);
}
function summaryProfit(text:string){
  return summaryMoney(text,[
    /Lucro\s*\/\s*saldo(?:\s+consolidado|\s+confirmado|\s+registrado)?\s*:\s*R\$\s*([\d.]+,\d{2})/i,
    /Lucro\s*\/\s*rateio\s+confirmado(?:\s+dos\s+cards\s+fechados)?\s*:\s*R\$\s*([\d.]+,\d{2})/i,
    /Lucro\s+l[ií]quido(?:\s+confirmado)?\s*:\s*R\$\s*([\d.]+,\d{2})/i,
    /Lucro(?:\s+confirmado)?\s*:\s*R\$\s*([\d.]+,\d{2})/i
  ]);
}
function parseMonthlySummary(c:any,listName:string){
  const month=monthFromList(listName);
  if(!month||!isListSummaryCard(c))return null;
  const text=String(c?.desc||""),name=String(c?.name||"");
  const gross=summaryGross(text,name),cost=summaryCost(text),profit=summaryProfit(text);
  const margin=summaryMargin(text)??(gross&&profit!=null?Math.round(profit/gross*10000)/100:null);
  return {
    month,cases:summaryCount(text,name),a_conferir:summaryIssues(text),
    gross_cents:gross,cost_cents:cost,profit_cents:profit,margin_pct:margin,
    marker:(text.match(/CR-TRELLO-LIST-SUMMARY[^\n]*/i)||[])[0]||null,
    last_activity:c?.dateLastActivity??null,card_id:c?.id??null
  };
}
function parseAnnualMonthlyBridge(text:string){
  const m=String(text||"").match(/CR-ANNUAL-MONTHLY-BRIDGE\|cases=(\d+)\|gross=([\d.]+)/i);
  if(!m)return null;
  const gross=Number(m[2]);
  return {cases:Number(m[1]),gross_cents:Number.isFinite(gross)?Math.round(gross*100):null};
}
function parseAnnualSummary(c:any,year:string){
  if(!isAnnualSummaryCard(c,year))return null;
  const text=String(c?.desc||""),name=String(c?.name||"");
  const gross=summaryGross(text,name),cost=summaryCost(text),profit=summaryProfit(text);
  return {
    year,cases:summaryCount(text,name),a_conferir:summaryIssues(text),
    gross_cents:gross,cost_cents:cost,profit_cents:profit,
    margin_pct:summaryMargin(text)??(gross&&profit!=null?Math.round(profit/gross*10000)/100:null),
    monthly_bridge:parseAnnualMonthlyBridge(text),
    marker:(text.match(/CR-TRELLO-ANNUAL-SUMMARY[^\n]*/i)||[])[0]||null,
    last_activity:c?.dateLastActivity??null,card_id:c?.id??null
  };
}
function parseGeneralSummary(c:any){
  if(!isGeneralSummaryCard(c))return null;
  const text=String(c?.desc||""),name=String(c?.name||"");
  return {
    cases:summaryCount(text,name),gross_cents:summaryGross(text,name),
    cost_cents:summaryCost(text),profit_cents:summaryProfit(text),margin_pct:summaryMargin(text),
    marker:(text.match(/CR-TRELLO-GENERAL-SUMMARY[^\n]*/i)||[])[0]||null,
    last_activity:c?.dateLastActivity??null,card_id:c?.id??null
  };
}
function chooseLatest<T extends {last_activity?:string|null}>(arr:T[]){
  return [...arr].sort((a,b)=>String(b.last_activity||"").localeCompare(String(a.last_activity||"")))[0]||null;
}
function applyCanonicalSummaries(raw:any,summaryByMonth:any,annualSummary:any=null){
  const months=Array.from({length:12},(_,i)=>{
    const r=raw?.months?.[i]||{month:i+1,gross_cents:0,cost_cents:0,profit_cents:0,cases:0,margin_pct:null,ticket_cents:null};
    const s=summaryByMonth?.[i+1];
    if(!s)return {...r,source:"RAW_CARD_PARSER"};
    const cases=s.cases??r.cases??0,gross=s.gross_cents??r.gross_cents??0,cost=s.cost_cents??r.cost_cents??0,profit=s.profit_cents??r.profit_cents??0;
    return {...r,month:i+1,cases,gross_cents:gross,cost_cents:cost,profit_cents:profit,
      margin_pct:s.margin_pct??(gross?Math.round(profit/gross*10000)/100:null),
      ticket_cents:cases?Math.round(gross/cases):null,a_conferir:s.a_conferir??0,
      source:"TRELLO_RECONCILED_LIST_SUMMARY",summary_marker:s.marker};
  });
  const sum=(k:string)=>months.reduce((a:any,m:any)=>a+Number(m?.[k]||0),0);
  const monthCases=sum("cases"),monthGross=sum("gross_cents"),monthCost=sum("cost_cents"),monthProfit=sum("profit_cents");
  const monthIssues=months.reduce((a:any,m:any)=>a+Number(m?.a_conferir||0),0);
  const reconciledCases=annualSummary?.cases??monthCases;
  const liveCases=Number.isFinite(Number(raw?.cases_total))?Number(raw.cases_total):reconciledCases;
  const cases=liveCases;
  const gross=annualSummary?.gross_cents??monthGross;
  const cost=annualSummary?.cost_cents??monthCost;
  const profit=annualSummary?.profit_cents??monthProfit;
  const annualIssues=annualSummary?.a_conferir;
  const issues=annualIssues??monthIssues;
  const annualDiff={
    cases:annualSummary?.cases!=null?annualSummary.cases-monthCases:null,
    gross_cents:annualSummary?.gross_cents!=null?annualSummary.gross_cents-monthGross:null,
    cost_cents:annualSummary?.cost_cents!=null?annualSummary.cost_cents-monthCost:null,
    profit_cents:annualSummary?.profit_cents!=null?annualSummary.profit_cents-monthProfit:null
  };
  const mergedIssues={...(raw?.issues||{})};
  const bridge=annualSummary?.monthly_bridge||null;
  const bridgeReconciled=!!bridge &&
    annualDiff.cases===bridge.cases &&
    annualDiff.gross_cents===bridge.gross_cents;
  if(annualSummary&&!bridgeReconciled&&(
    (annualDiff.cases!=null&&annualDiff.cases!==0)||
    (annualDiff.gross_cents!=null&&Math.abs(annualDiff.gross_cents)>1)||
    (annualDiff.cost_cents!=null&&Math.abs(annualDiff.cost_cents)>1)||
    (annualDiff.profit_cents!=null&&Math.abs(annualDiff.profit_cents)>1)
  ))mergedIssues.RESUMO_ANUAL_DIVERGE_SOMA_MENSAL=1;
  if(bridgeReconciled)mergedIssues.RESUMO_ANUAL_RECONCILIADO_FORA_DOS_MESES=bridge.cases;
  const summaryCount=Object.keys(summaryByMonth||{}).length;
  if(summaryCount<12)mergedIssues.RESUMOS_MENSAIS_INCOMPLETOS=12-summaryCount;
  return {...raw,issues:mergedIssues,
    cases_total:cases,
    cases_live:liveCases,
    cases_financial_reconciled:reconciledCases,
    cases_classifiable:Math.max(0,cases-issues),
    coverage_pct:cases?Math.round((cases-issues)/cases*10000)/100:100,
    gross_cents:gross,cost_cents:cost,profit_cents:profit,
    margin_pct:annualSummary?.margin_pct??(gross?Math.round(profit/gross*10000)/100:null),
    ticket_cents:cases?Math.round(gross/cases):null,
    months,
    aggregation_source:annualSummary?"TRELLO_RECONCILED_ANNUAL_SUMMARY":"TRELLO_RECONCILED_MONTHLY_SUMMARIES",
    summary_coverage:{months_with_summary:Object.keys(summaryByMonth||{}).length,months_total:12,a_conferir:issues},
    annual_summary:annualSummary,
    monthly_sum_validation:{
      cases:monthCases,gross_cents:monthGross,cost_cents:monthCost,profit_cents:monthProfit,
      annual_minus_months:annualDiff,bridge,reconciled:bridgeReconciled
    },
    raw_parser_metrics:raw
  };
}
function metricsForBundle(b:any,yearSuffix:string,u?:URL){
  const raw=sumMetrics(b.rows,yearSuffix);
  const hasSemanticFilter=!!u&&(!!u.searchParams.get("status")||!!u.searchParams.get("q"));
  if(hasSemanticFilter)return {...raw,aggregation_source:"RAW_CARD_PARSER_FILTERED"};
  const month=u?Number(u.searchParams.get("month")||0):0;
  if(month){
    const s=b.month_summaries?.[month];
    if(!s)return {...raw,aggregation_source:"RAW_CARD_PARSER_NO_MONTH_SUMMARY"};
    const cases=s.cases??raw.cases_total??0,gross=s.gross_cents??raw.gross_cents??0,cost=s.cost_cents??raw.cost_cents??0,profit=s.profit_cents??raw.profit_cents??0;
    const issue=s.a_conferir??0;
    return {...raw,cases_total:cases,cases_classifiable:Math.max(0,cases-issue),coverage_pct:cases?Math.round((cases-issue)/cases*10000)/100:100,
      gross_cents:gross,cost_cents:cost,profit_cents:profit,margin_pct:s.margin_pct??(gross?Math.round(profit/gross*10000)/100:null),
      ticket_cents:cases?Math.round(gross/cases):null,aggregation_source:"TRELLO_RECONCILED_LIST_SUMMARY",
      selected_month_summary:s};
  }
  return applyCanonicalSummaries(raw,b.month_summaries||{},b.annual_summary||null);
}

function canonicalPerson(raw:string){const n=norm(raw);const a:any={"EDER":"Éder","FABRICIO":"Fabrício","ROGERIO":"Rogério","GABI":"Gabrielly","GABRIELLY":"Gabrielly","ANDRE":"André","EDIONE":"Edione","ANDREY":"Andrey","ANDRADE":"Andrade","JR":"JR","MAICON":"Maicon","CARLOS":"Carlos","FERREIRA":"Ferreira","AILTON":"Ailton","JHOW":"Jhow","LEANDERSON":"Leanderson","OSMAR":"Osmar"};return a[n]||raw.trim()}
function classifyCost(desc:string){const n=norm(desc);if(/\b(NF|NOTA FISCAL|IMPOSTO|TRIBUTO)\b/.test(n))return["NOTA FISCAL / TRIBUTOS",null];if(/COMISSAO/.test(n))return["COMISSÕES",null];if(/COMBUSTIVEL|GASOLINA|ETANOL|DIESEL/.test(n))return["COMBUSTÍVEL",null];if(/ALIMENT|ALMOCO|JANTA|LANCHE|CAFE/.test(n))return["ALIMENTAÇÃO",null];if(/FERRAMENT/.test(n))return["FERRAMENTAS",null];if(/MANUTENCAO/.test(n))return["MANUTENÇÃO",null];if(/MATERIAL|PU40|MANTA|TELHA|TINTA|CIMENTO|ARGAMASSA|REJUNTE|PARAFUSO/.test(n))return["MATERIAIS",null];if(/DESCONTO/.test(n))return["DESCONTOS",null];if(/FRETE|TRANSPORTE|UBER/.test(n))return["FRETES / TRANSPORTES",null];if(/LOCACAO|ALUGUEL DE EQUIP|EQUIPAMENTO/.test(n))return["EQUIPAMENTOS / LOCAÇÕES",null];const people=["EDER","FABRICIO","ANDRE","EDIONE","ANDREY","ANDRADE","JR","MAICON","CARLOS","FERREIRA","AILTON","JHOW","LEANDERSON","OSMAR"];const p=people.find(x=>n.includes(x));if(/DIARIA/.test(n))return["DIÁRIAS",p?canonicalPerson(p):null];if(/APOIO/.test(n))return["APOIO",p?canonicalPerson(p):null];if(p)return["MÃO DE OBRA TERCEIRIZADA",canonicalPerson(p)];if(/MAO DE OBRA|PRESTADOR/.test(n))return["MÃO DE OBRA TERCEIRIZADA",null];return["NÃO CLASSIFICADO",null]}
function parseCostItems(text:string,caseNo:string|null,shortUrl:string|null){const clean=text.replace(/\*/g,"").replace(/[\u200b-\u200f\u2060\ufeff]/g,"");const start=clean.search(/(?:^|\n)\s*Custos\s*:??/i);if(start<0)return[];let section=clean.slice(start);const cut=section.search(/\n\s*(?:Total\s+(?:de\s+)?Custos(?:\s+at[eé]\s+\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)?|Saldo|Lucro|Rateio|CAPITAL DE GIRO)/i);if(cut>0)section=section.slice(0,cut);const out:any[]=[];for(const raw of section.split(/\r?\n/)){const line=raw.trim();if(!line||!(/R\$|\d{1,2}\/\d{1,2}/i.test(line)))continue;const mm=line.match(/R\$\s*([-]?[0-9.]+,[0-9]{2})/i);if(!mm)continue;const cents=centsFromBr(mm[1]);if(cents==null)continue;const dm=line.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);const desc=line.replace(/R\$\s*[-]?[0-9.]+,[0-9]{2}/i,"").replace(/^\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s*[-–:]?\s*/,"").trim();const cp:any=classifyCost(desc);out.push({date_raw:dm?.[1]||null,description_original:desc||line,value_cents:cents,category:cp[0],provider:cp[1],confidence:cp[0]==="NÃO CLASSIFICADO"?"BAIXA":"MÉDIA",case:caseNo,trello_url:shortUrl})}return out}
function costIntelligence(rows:any[]){const items=rows.flatMap((r:any)=>r.cost_items||[]);const by_category:any={},by_provider:any={};let classified=0,total=0;for(const i of items){total+=Math.abs(i.value_cents||0);by_category[i.category]=(by_category[i.category]||0)+(i.value_cents||0);if(i.category!=="NÃO CLASSIFICADO")classified+=Math.abs(i.value_cents||0);if(i.provider){by_provider[i.provider]??={cents:0,items:[]};by_provider[i.provider].cents+=i.value_cents||0;by_provider[i.provider].items.push(i)}}return{items_count:items.length,total_itemized_cents:total,classified_cents:classified,coverage_pct:total?Math.round(classified/total*10000)/100:0,by_category,by_provider,items}}


function parseSupportDiarias(text:string){
  const out:Record<string,number>={"Fabrício":0,"Éder":0};
  for(const raw of String(text||"").split(/\r?\n/)){
    if(!/Apoio\s+(?:Éder|Eder|Fabr[ií]cio)/i.test(raw))continue;
    const m=raw.match(/R\$\s*([-]?[0-9.]+,[0-9]{2})/i); if(!m)continue;
    const cents=centsFromBr(m[1]); if(cents==null)continue;
    if(/Apoio\s+(?:Éder|Eder)/i.test(raw))out["Éder"]+=cents;
    if(/Apoio\s+Fabr[ií]cio/i.test(raw))out["Fabrício"]+=cents;
  }
  return out;
}
function isAcertoHelperCard(c:any){
  const n=norm(c?.name||""),d=String(c?.desc||"");
  return /CR-TRELLO-ACERTOS-LIVE/i.test(d)||/CR-TRELLO-CENTRAL-ACERTOS/i.test(d)||n.startsWith("ACERTOS 2026 AGUARDANDO ACERTO");
}
function canonicalAcertoRateio(profit:number|null){
  if(profit==null)return null;
  const fabricio=Math.round(profit*.20),eder=Math.round(profit*.28),rogerio=Math.round(profit*.28),gabi=Math.round(profit*.14);
  const capital=profit-fabricio-eder-rogerio-gabi;
  return {fabricio_cents:fabricio,eder_cents:eder,rogerio_cents:rogerio,gabi_cents:gabi,capital_giro_cents:capital,distributed_cents:fabricio+eder+rogerio+gabi+capital,difference_cents:0};
}
function acertoCustomer(r:any){
  const t=String(r?.title||"");
  let m=t.match(/Imobili[aá]ria\s+(.+?)(?=\s+(?:Rua|Avenida|Av\.?|Alameda|Travessa|Estrada|Rodovia|Endere[cç]o|R\s+[A-ZÀ-Ý]|$))/i);
  if(m&&m[1])return m[1].replace(/\s+/g," ").trim();
  m=t.match(/Cliente\s*:\s*(.+?)(?=\s+(?:Rua|Avenida|Endere[cç]o|$))/i);
  if(m&&m[1])return m[1].replace(/\s+/g," ").trim();
  const ignore=/^(AGUARDANDO ACERTO|FINALIZADO|EXECUCAO|EXECUÇÃO|EDER|ÉDER|FABRICIO|FABRÍCIO|ANDRE|ANDRÉ|ANDREY|JR |JHEFFERSON|WLADIMIR)/i;
  const lab=(r?.labels||[]).find((x:any)=>x&&!ignore.test(String(x)));
  return lab?String(lab).replace(/^IMOBILI[AÁ]RIA\s+/i,"").trim():"Não identificado";
}
function acertoReconciliation(r:any,gcMap:any){
  const g=gcMap?.get?.(r.case);
  if(!g)return {result:"NÃO LOCALIZADO",difference_cents:null,trello_closed_cents:r.closed_cents,gestaoclick_total_cents:null,trello_status:r.status,gestaoclick_status:null};
  const comparable=r.closed_cents!=null&&g.total_cents!=null;
  const diff=comparable?r.closed_cents-g.total_cents:null;
  return {result:comparable&&diff!==0?"DIVERGENTE":"CONCILIADO",difference_cents:diff,trello_closed_cents:r.closed_cents,gestaoclick_total_cents:g.total_cents,trello_status:r.status,gestaoclick_status:g.status,external_id:g.external_id};
}
function buildAcertoLive(rows:any[],gcMap:any=null){
  const source=rows.filter(r=>r.case&&!r.closed&&r.status==="AGUARDANDO ACERTO");
  const items=source.map(r=>{
    const base=r.settlement_base_cents;
    const profit=base!=null&&r.cost_cents!=null?base-r.cost_cents:null;
    const margin=base!=null&&base!==0&&profit!=null?Math.round(profit/base*10000)/100:null;
    const rateio=canonicalAcertoRateio(profit);
    return {
      case:r.case,customer:acertoCustomer(r),title:r.title,meta:r.acerto_meta||{},status:r.status,trello_url:r.short_url,last_activity:r.last_activity,
      closed_cents:r.gross_cents,received_cents:r.received_cents??null,base_cents:base,
      base_source:r.settlement_base_source,
      cost_cents:r.cost_cents,profit_cents:profit,margin_pct:margin,rateio,
      support_cents:r.support_cents||{"Fabrício":0,"Éder":0},
      reconciliation:acertoReconciliation({...r,closed_cents:r.gross_cents},gcMap),
      issues:[...(r.issues||[]),...(base==null?["SEM_BASE_ACERTO"]:[]),...(r.cost_cents==null?["SEM_CUSTOS_ACERTO"]:[])]
    };
  }).sort((a,b)=>String(a.case).localeCompare(String(b.case),undefined,{numeric:true}));
  const valid=items.filter(x=>x.base_cents!=null&&x.cost_cents!=null&&x.profit_cents!=null&&x.rateio);
  const sum=(fn:any)=>valid.reduce((a,x)=>a+Number(fn(x)||0),0);
  const base=sum((x:any)=>x.base_cents),cost=sum((x:any)=>x.cost_cents),profit=sum((x:any)=>x.profit_cents);
  const totals={
    cases:items.length,classifiable_cases:valid.length,base_cents:base,cost_cents:cost,profit_cents:profit,
    margin_pct:base?Math.round(profit/base*10000)/100:null,
    fabricio_cents:sum((x:any)=>x.rateio.fabricio_cents),eder_cents:sum((x:any)=>x.rateio.eder_cents),
    rogerio_cents:sum((x:any)=>x.rateio.rogerio_cents),gabi_cents:sum((x:any)=>x.rateio.gabi_cents),
    capital_giro_cents:sum((x:any)=>x.rateio.capital_giro_cents),
    support_fabricio_cents:items.reduce((a,x)=>a+Number(x.support_cents?.["Fabrício"]||0),0),
    support_eder_cents:items.reduce((a,x)=>a+Number(x.support_cents?.["Éder"]||0),0)
  };
  (totals as any).distributed_cents=totals.fabricio_cents+totals.eder_cents+totals.rogerio_cents+totals.gabi_cents+totals.capital_giro_cents;
  (totals as any).difference_cents=profit-(totals as any).distributed_cents;
  const reconSummary:any={CONCILIADO:0,DIVERGENTE:0,"NÃO LOCALIZADO":0};
  for(const x of items)reconSummary[x.reconciliation.result]=(reconSummary[x.reconciliation.result]||0)+1;
  return {ok:true,generated_at:new Date().toISOString(),source:"TRELLO_AG_ACERTO_LIVE",list:"AG. ACERTO",items,totals,reconciliation_summary:reconSummary,rule:{base:"RECEBIDO_OU_BRUTO_COM_TAXA_COMPROVADA_EM_CUSTOS",rateio:{fabricio:20,eder:28,rogerio:28,gabi:14,capital_giro:10},rounding:"CENTAVOS_AJUSTADOS_EXCLUSIVAMENTE_NO_CAPITAL_DE_GIRO"}};
}
function serviceRoleKey(){
  let k=(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"").trim();
  try{if(!k){const x=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");k=String(x.default||x.service_role||"").trim()}}catch{}
  return k;
}
async function readAcertoSnapshots(){
  const k=serviceRoleKey();if(!k)return {ok:false,error:"SNAPSHOT_SERVICE_KEY_UNAVAILABLE",items:[]};
  const u=SB+"/rest/v1/cc_snapshots?select=id,label,payload,created_by,created_at&order=created_at.desc&limit=100";
  const r=await fetch(u,{headers:{Authorization:"Bearer "+k,apikey:k,accept:"application/json"}});
  const j=await r.json().catch(()=>[]);
  const items=(Array.isArray(j)?j:[]).filter((x:any)=>String(x?.label||"").startsWith("ACERTO_VIVO_")).slice(0,30);
  return {ok:r.ok,items};
}
async function persistAcertoSnapshot(payload:any,actor:string,label:string){
  const k=serviceRoleKey();if(!k)return {ok:false,error:"SNAPSHOT_SERVICE_KEY_UNAVAILABLE"};
  const r=await fetch(SB+"/rest/v1/cc_snapshots",{method:"POST",headers:{Authorization:"Bearer "+k,apikey:k,"content-type":"application/json",Prefer:"return=representation"},body:JSON.stringify({label,payload,created_by:actor||"Diretoria"})});
  const j=await r.json().catch(()=>null);return {ok:r.ok,status:r.status,row:Array.isArray(j)?j[0]:j,error:r.ok?null:"SNAPSHOT_WRITE_FAILED"};
}


function acertoMetaClean(v:any,max=260){
  if(v==null)return null;
  const s=String(v).replace(/\r/g,"").replace(/[ \t]+/g," ").trim().replace(/^[-–—:;,()\[\]\s]+|[-–—:;,()\[\]\s]+$/g,"");
  return s?s.slice(0,max):null;
}
function acertoMetaLine(text:string,label:string){
  const re=new RegExp("(?:^|\\n)\\s*"+label+"\\s*:\\s*([^\\n]+)","i");
  const m=String(text||"").match(re);
  return m?acertoMetaClean(m[1]):null;
}
function acertoMetaStreet(title:string){
  const s=String(title||"").replace(/\s+/g," ").trim();
  const m=s.match(/\b(Rua|Avenida|Av\.?|Alameda|Travessa|Estrada|Rodovia|Praça|Praca)\b/i);
  if(!m||m.index==null)return null;
  let out=s.slice(m.index);
  const markers=[
    out.search(/(?:\s|\(|–|-)+(?:Prestador\b|Recebid[oa]\b|Recebimento\b|Pagamento\b|Pgto\b|DADOS\s+NF\b|NF\b|Comiss[aã]o\b|Acerto\b|Situa[cç][aã]o\b|Refer[eê]ncia\b)/i),
    out.search(/\s+-\s+\d{1,2}\/\d{1,2}(?:\/\d{2,4})?(?:\s+-\s+\d{1,2}:\d{2})?/),
    out.search(/\s+\(\d{2}\)\s*\d{4,5}-\d{4}/)
  ].filter(x=>x>0);
  const cut=markers.length?Math.min(...markers):-1;
  if(cut>0)out=out.slice(0,cut);
  return acertoMetaClean(out,320);
}
function acertoMetaTitleMatch(title:string,re:RegExp){
  const m=String(title||"").match(re);
  return m?acertoMetaClean(m[1]):null;
}
function acertoCardMeta(c:any){
  const title=String(c?.name||"").replace(/\s+/g," ").trim();
  const desc=String(c?.desc||"");
  const both=title+"\n"+desc;
  const address=acertoMetaLine(desc,"Endere[cç]o")||acertoMetaLine(both,"Endere[cç]o")||acertoMetaStreet(title);
  const reference=acertoMetaLine(desc,"Refer[eê]ncia")||acertoMetaLine(desc,"Ref(?:er[eê]ncia)?")||acertoMetaTitleMatch(title,/\bRefer[eê]ncia\s*:?\s*(.+?)(?=\s+(?:Rua|Avenida|Av\.?|Alameda|Travessa|Estrada|Rodovia|Recebid|Pagamento|NF)|$)/i);
  const contract=acertoMetaLine(desc,"Contrato")||acertoMetaTitleMatch(title,/\bContrato\s*:?\s*([A-Za-z0-9./_-]+)/i);
  const property=acertoMetaLine(desc,"Im[oó]vel")||acertoMetaTitleMatch(title,/\bIm[oó]vel\s*:?\s*([A-Za-z0-9./_-]+)/i);
  const vistaCrm=acertoMetaLine(desc,"Vista\\s*CRM")||acertoMetaTitleMatch(title,/\bVista\s*CRM\s*:?\s*([A-Za-z0-9./_-]+)/i);
  const service=acertoMetaLine(desc,"Servi[cç]o")||acertoMetaLine(desc,"Refer[eê]ncia\\s+do\\s+servi[cç]o");
  const provider=acertoMetaLine(desc,"Prestador")||acertoMetaTitleMatch(title,/\bPrestador\s*:?\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'-]{1,45}?)(?=\s+(?:Recebid|Recebimento|Pagamento|Pgto|NF|Comiss|$))/i);
  const receipt=acertoMetaLine(desc,"Recebimento")||acertoMetaLine(desc,"Recebido")||acertoMetaTitleMatch(title,/\bRecebid[oa]\s*:?\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i);
  const paymentRaw=acertoMetaLine(desc,"Pagamento")||acertoMetaTitleMatch(title,/\bPagamento\s*:?\s*(.+?)(?=\s+(?:Recebid|Recebimento|Prestador|NF|Comiss)|$)/i);
  const payment=paymentRaw?acertoMetaClean(String(paymentRaw).replace(/\s+\(.*/,"")):null;
  const situation=acertoMetaLine(desc,"Situa[cç][aã]o");
  return {address,reference,contract,property,vista_crm:vistaCrm,service,provider,receipt,payment,situation};
}

function acertoMoneyCentsFromLine(line:string){
 const m=String(line||"").match(/R\$\s*([-]?[0-9.]+(?:,[0-9]{1,2})?)/i);
 if(!m)return null;
 let s=String(m[1]).trim().replace(/\s/g,"");
 const neg=s.startsWith("-"); s=s.replace(/^-/,"");
 const p=s.lastIndexOf(",");
 if(p>=0){
  const tail=s.length-p-1;
  if(tail===1||tail===2)s=s.slice(0,p).replace(/\./g,"")+"."+s.slice(p+1);
  else s=s.replace(/[.,]/g,"");
 }else{
  const d=s.lastIndexOf(".");
  if(d>=0&&(s.length-d-1===1||s.length-d-1===2))s=s.slice(0,d).replace(/\./g,"")+"."+s.slice(d+1);
  else s=s.replace(/\./g,"");
 }
 const n=Number(s); if(!Number.isFinite(n))return null;
 return Math.round((neg?-Math.abs(n):n)*100);
}
function acertoCostsCanonical(text:string){
 const lines=String(text||"").replace(/\*/g,"").replace(/[\u200b-\u200f\u2060\ufeff]/g,"").split(/\r?\n/);
 let explicit:number|null=null;
 for(const line of lines){
  if(/total\s+(?:de\s+)?custos/i.test(line)&&!/(relocad|subtotal|parcial)/i.test(line)){
   const v=acertoMoneyCentsFromLine(line); if(v!=null)explicit=v;
  }
 }
 if(explicit!=null)return explicit;
 const start=lines.findIndex(l=>/^\s*Custos?\s*:?\s*$/i.test(l));
 if(start<0)return null;
 let total=0,count=0;
 for(let i=start+1;i<lines.length;i++){
  const line=String(lines[i]||"").trim();
  if(/(?:Saldo\s*\/|^\s*Saldo\s*:|Lucro\s*L[ií]quido|^\s*Lucro\s*:|Rateio\b|Resumo dos C[aá]lculos)/i.test(line))break;
  if(/Total\s+(?:de\s+)?Custos/i.test(line))continue;
  if(!/\d{1,2}\/\d{1,2}/.test(line))continue;
  const v=acertoMoneyCentsFromLine(line);
  if(v!=null){total+=v;count++}
 }
 return count?total:null;
}
// Gross was already confirmed as the settlement basis when the exact withheld fee
// is present once in costs. All other cases (partial receipts / reimbursements)
// continue to use net received. Read-only calculation: never modifies Trello.
function acertoApprovedGrossBase(text:string,status:string,gross:number|null,received:number|null){
 if(status!=="AGUARDANDO ACERTO"||gross==null||received==null||gross<=received)return false;
 const agreed=findMoney(text,/Base\s+do\s+Acerto\s*:\s*(?:R\$\s*)?([-]?[0-9.]+,[0-9]{2})/i);
 if(agreed!==gross)return false;
 const gap=gross-received;
 const lines=String(text||"").replace(/\*/g,"").split(/\r?\n/);
 const start=lines.findIndex(l=>/^\s*Custos?\s*:?\s*$/i.test(l));
 if(start<0)return false;
 for(let i=start+1;i<lines.length;i++){
  const line=String(lines[i]||"").trim();
  if(/^(?:Total\s+(?:de\s+)?Custos|Saldo|Lucro|Rateio|Resumo\s+dos\s+C[aá]lculos)/i.test(line))break;
  if(!/\b(?:taxa|desconto|comiss[aã]o|reten[cç][aã]o)\b/i.test(line))continue;
  const amount=acertoMoneyCentsFromLine(line);
  if(amount===gap)return true;
 }
 return false;
}

function financialParse(c:any,listName:string,boardYear:string){
  const text=String(c?.desc||"");
  const gross=findMoney(text,/Valor\s+Fechado\s*:?\s*(?:R\$\s*)?([-]?[0-9.]+,[0-9]{2})/i);
  const received=findMoney(text,/Valor\s+Recebido\s*:?\s*(?:R\$\s*)?([-]?[0-9.]+,[0-9]{2})/i);
  const explicitCosts=findMoney(text,/Total\s+(?:de\s+)?Custos(?:\s+at[eé]\s+\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)?\s*:?\s*(?:R\$\s*)?([-]?[0-9.]+,[0-9]{2})/i);
  const summedCosts=explicitCosts==null?sumCostSection(text):null;
  const status=statusFromCard(c,listName);
  const acertoCosts=status==="AGUARDANDO ACERTO"?acertoCostsCanonical(text):null;
  const costs=acertoCosts??explicitCosts??summedCosts;
  const explicitSaldo=findMoney(text,/Saldo(?:\s*\/\s*Lucro\s+L[ií]quido(?:\s*\([^\n)]*\))?)?\s*:?\s*(?:R\$\s*)?([-]?[0-9.]+,[0-9]{2})/i);
  const grossFeeMatched=acertoApprovedGrossBase(text,status,gross,received);
  const settlementBase=grossFeeMatched?gross:(received??gross);
  const settlementSource=grossFeeMatched?"VALOR_FECHADO_TAXA_JA_NOS_CUSTOS":(received!=null?"VALOR_RECEBIDO":"VALOR_FECHADO");
  const computedProfit=(settlementBase!=null&&costs!=null)?settlementBase-costs:null;
  const profit=computedProfit??explicitSaldo;
  const mPct=text.replace(/\*/g,"").match(/(?:Margem\s+de\s+Lucro|Lucro)\s*:?\s*([0-9.,]+)\s*%/i);
  const explicitMargin=mPct?pctNum(mPct[1]):null;
  const computedMargin=(settlementBase!=null&&settlementBase!==0&&profit!=null)?Math.round((profit/settlementBase*100)*100)/100:null;
  const rr=parseRateios(text);
  const caseNo=extractCase(c?.name||text);const costItems=parseCostItems(text,caseNo,c?.shortUrl??null);
  const issues:string[]=[];
  if(gross==null)issues.push("SEM_VALOR_BRUTO");
  if(costs==null)issues.push("SEM_TOTAL_CUSTOS");
  if(explicitSaldo!=null&&computedProfit!=null&&Math.abs(explicitSaldo-computedProfit)>1)issues.push("BASE_MENOS_CUSTO_DIVERGE_SALDO");
  if(explicitMargin!=null&&computedMargin!=null&&Math.abs(explicitMargin-computedMargin)>0.05)issues.push("MARGEM_DIVERGENTE");
  const peopleSum=Object.values(rr.people).reduce((a:any,x:any)=>a+x.cents,0);
  if(Object.keys(rr.people).length>=2&&profit!=null){
    const combined=peopleSum+(rr.capital_cents??0);
    if(Math.abs(combined-profit)>1)issues.push("RATEIO_NAO_FECHA_LUCRO");
  }
  const confidence=gross!=null&&costs!=null?(explicitCosts!=null?"ALTA":"MÉDIA"):(gross!=null?"MÉDIA":"BAIXA");
  return {
    case:caseNo,board_year:boardYear,list:listName,status,
    title:safe(c?.name,260),acerto_meta:acertoCardMeta(c),closed:!!c?.closed,due:c?.due??null,due_complete:!!c?.dueComplete,
    last_activity:c?.dateLastActivity??null,short_url:c?.shortUrl??null,
    labels:(c?.labels||[]).map((x:any)=>safe(x?.name,120)).filter(Boolean),
    gross_cents:gross,received_cents:received,settlement_base_cents:settlementBase,
    settlement_base_source:settlementSource,
    cost_cents:costs,profit_cents:profit,margin_pct:computedMargin??explicitMargin,
    support_cents:parseSupportDiarias(text),
    financial_source:{
      gross:gross!=null?"TRELLO_DESCRIPTION_VALOR_FECHADO":"NOT_FOUND",
      received:received!=null?"TRELLO_DESCRIPTION_VALOR_RECEBIDO":"NOT_FOUND",
      settlement_base:settlementSource,
      costs:explicitCosts!=null?"TRELLO_DESCRIPTION_TOTAL_CUSTOS":summedCosts!=null?"TRELLO_COST_SECTION_SUM":"NOT_FOUND",
      profit:computedProfit!=null?"DETERMINISTIC_BASE_MINUS_COST":explicitSaldo!=null?"TRELLO_DESCRIPTION_SALDO_FALLBACK":"NOT_FOUND",
      confidence
    },
    rateios:rr.people,capital_giro_cents:rr.capital_cents,equal_share_cents:rr.equal_share_cents,
    rateio_model: Object.keys(rr.people).length ? Object.entries(rr.people).sort().map(([k,v]:any)=>k+":"+(v.percent??"?")).join("|") : (rr.equal_share_cents!=null ? "EQUAL_SHARE_LEGACY" : "NONE"),
    cost_items:costItems,month:monthFromList(listName),period_basis:monthFromList(listName)?"TRELLO_LIST_MONTH":"PERIOD_NOT_IDENTIFIED",issues
  };
}
function primaryDedup(rows:any[]){
  const groups=new Map<string,any[]>();
  const unkeyed:any[]=[];
  for(const r of rows){
    if(!r.case){unkeyed.push(r);continue}
    if(!groups.has(r.case))groups.set(r.case,[]);
    groups.get(r.case)!.push(r);
  }
  const out:any[]=[];const dup:any[]=[];
  for(const[caseNo,arr]of groups){
    arr.sort((a,b)=>Number(a.closed)-Number(b.closed)||String(b.last_activity||"").localeCompare(String(a.last_activity||"")));
    out.push(arr[0]);
    if(arr.length>1)dup.push({case:caseNo,count:arr.length,selected_title:arr[0].title});
  }
  return {rows:out,duplicates:dup,unkeyed_count:unkeyed.length};
}
function sumMetrics(rows:any[],yearSuffix:string){
  const eligible=rows.filter(r=>r.case?.endsWith("-"+yearSuffix)&&!["CANCELADO","NÃO EXECUTADO"].includes(r.status));
  const classifiable=eligible.filter(r=>r.gross_cents!=null&&r.cost_cents!=null&&r.profit_cents!=null);
  const sum=(k:string)=>classifiable.reduce((a,r)=>a+(r[k]??0),0);
  const gross=sum("gross_cents"),cost=sum("cost_cents"),profit=sum("profit_cents");
  const rateios:Record<string,number>={},rateiosTrusted:Record<string,number>={};let capital=0,capitalTrusted=0;
  for(const r of classifiable){
    const rateioOk=!(r.issues||[]).includes("RATEIO_NAO_FECHA_LUCRO");
    const explicitPeople=Object.entries(r.rateios||{});
    if(explicitPeople.length){
      for(const[k,v]of explicitPeople){rateios[k]=(rateios[k]||0)+(v as any).cents;if(rateioOk)rateiosTrusted[k]=(rateiosTrusted[k]||0)+(v as any).cents}
    } else if(r.equal_share_cents!=null && yearSuffix==="24" && r.month && r.month<=8){
      for(const k of ["Rogério","Éder"]){rateios[k]=(rateios[k]||0)+r.equal_share_cents;if(rateioOk)rateiosTrusted[k]=(rateiosTrusted[k]||0)+r.equal_share_cents}
    }
    if(r.capital_giro_cents!=null){
      capital+=r.capital_giro_cents;
      if(rateioOk)capitalTrusted+=r.capital_giro_cents;
    }
  }
  const months=Array.from({length:12},(_,i)=>({month:i+1,gross_cents:0,cost_cents:0,profit_cents:0,cases:0,margin_pct:null as number|null,ticket_cents:null as number|null}));
  for(const r of classifiable){
    if(!r.month)continue;const m=months[r.month-1];m.gross_cents+=r.gross_cents;m.cost_cents+=r.cost_cents;m.profit_cents+=r.profit_cents;m.cases++;
  }
  for(const m of months){m.margin_pct=m.gross_cents?Math.round(m.profit_cents/m.gross_cents*10000)/100:null;m.ticket_cents=m.cases?Math.round(m.gross_cents/m.cases):null}
  const issueCount:Record<string,number>={};
  for(const r of eligible)for(const i of r.issues||[])issueCount[i]=(issueCount[i]||0)+1;
  return {
    cases_total:eligible.length,cases_classifiable:classifiable.length,
    coverage_pct:eligible.length?Math.round(classifiable.length/eligible.length*10000)/100:0,
    gross_cents:gross,cost_cents:cost,profit_cents:profit,
    margin_pct:gross?Math.round(profit/gross*10000)/100:null,
    rateios_cents:rateios,rateios_trusted_cents:rateiosTrusted,
    capital_giro_cents:capital,capital_giro_trusted_cents:capitalTrusted,
    withdrawals_explicit_cents:Object.values(rateios).reduce((a,b)=>a+b,0),
    withdrawals_trusted_cents:Object.values(rateiosTrusted).reduce((a,b)=>a+b,0),
    ticket_cents:classifiable.length?Math.round(gross/classifiable.length):null,
    months,issues:issueCount,period_unidentified_count:eligible.filter(r=>!r.month).length
  };
}
function rateioBreakdown(rows:any[],yearSuffix:string){
  const out:any={people:{},capital_giro_cents:0,difference_unexplained_cents:0,cards:0};
  const classifiable=rows.filter(r=>r.case?.endsWith("-"+yearSuffix)&&!["CANCELADO","NÃO EXECUTADO"].includes(r.status)&&r.gross_cents!=null&&r.cost_cents!=null&&r.profit_cents!=null);
  for(const r of classifiable){
    const entries:any[]=[];
    if(Object.keys(r.rateios||{}).length){for(const [name,v] of Object.entries(r.rateios||{})){const x:any=v;entries.push({name,cents:x.cents,percent:x.percent,source:x.source})}}
    else if(r.equal_share_cents!=null&&yearSuffix==="24"&&r.month&&r.month<=8){for(const name of ["Rogério","Éder"])entries.push({name,cents:r.equal_share_cents,percent:null,source:"LEGACY_EQUAL_SHARE"})}
    if(!entries.length&&r.capital_giro_cents==null)continue;
    out.cards++;
    let distributed=0;
    for(const e of entries){distributed+=e.cents;out.people[e.name]??={cents:0,cards:0,items:[]};out.people[e.name].cents+=e.cents;out.people[e.name].cards++;out.people[e.name].items.push({case:r.case,cents:e.cents,percent:e.percent,source:e.source,trello_url:r.short_url,title:r.title,month:r.month})}
    const cap=r.capital_giro_cents??0;out.capital_giro_cents+=cap;distributed+=cap;
    out.difference_unexplained_cents+=(r.profit_cents??0)-distributed;
  }
  return out;
}
function rateioTimeline(rows:any[],year:string){
  const byMonth:any={};
  for(const r of rows){if(!r.month)continue;const k=String(r.month).padStart(2,"0");byMonth[k]??={month:r.month,cards:0,models:{},people:{},legacy_equal_share_cards:0};byMonth[k].cards++;
    if(r.rateio_model==="EQUAL_SHARE_LEGACY")byMonth[k].legacy_equal_share_cards++;
    else if(r.rateio_model!=="NONE"){byMonth[k].models[r.rateio_model]=(byMonth[k].models[r.rateio_model]||0)+1;for(const[p,v]of Object.entries(r.rateios||{})){const x:any=v;byMonth[k].people[p]??={cards:0,cents:0,percent_samples:{}};byMonth[k].people[p].cards++;byMonth[k].people[p].cents+=x.cents;const pc=String(x.percent??"?");byMonth[k].people[p].percent_samples[pc]=(byMonth[k].people[p].percent_samples[pc]||0)+1}}
  }
  return Object.values(byMonth).sort((a:any,b:any)=>a.month-b.month).map((x:any)=>({...x,confidence:x.cards>=10?"ALTA":x.cards>=4?"MÉDIA":"BAIXA"}));
}
function filterRows(rows:any[],u:URL){
  const month=Number(u.searchParams.get("month")||0),status=norm(u.searchParams.get("status")||""),q=norm(u.searchParams.get("q")||"");
  return rows.filter(r=>(!month||r.month===month)&&(!status||norm(r.status)===status)&&(!q||norm([r.case,r.title,r.status,...(r.labels||[])].join(" ")).includes(q)));
}
async function trelloGet(path:string,p:Record<string,string>={}){
  const key=sec("TRELLO_API_KEY"),token=sec("TRELLO_API_TOKEN");
  if(!key||!token)return{ok:false,status:412,body:null,error:"TRELLO_CREDENTIAL_GATE_REQUIRED"};
  const u=new URL(TRELLO_BASE+path);u.searchParams.set("key",key);u.searchParams.set("token",token);
  for(const[k,v]of Object.entries(p))u.searchParams.set(k,v);
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),15000);
  try{
    const r=await fetch(u,{headers:{accept:"application/json"},signal:ctl.signal});clearTimeout(tm);
    let body:any=null;try{body=await r.json()}catch{}
    return{ok:r.ok,status:r.status,body,error:r.ok?null:"TRELLO_READ_FAILED"};
  }catch(e){clearTimeout(tm);return{ok:false,status:504,body:null,error:"TRELLO_TIMEOUT"}}
}
async function gcGet(path:string,p:Record<string,string>={}){
  const access=sec("GESTAOCLICK_ACCESS_TOKEN"),secret=sec("GESTAOCLICK_SECRET_ACCESS_TOKEN");
  if(!access||!secret)return{ok:false,status:412,body:null,error:"GC_CREDENTIAL_GATE_REQUIRED"};
  const u=new URL(GC_BASE+path);for(const[k,v]of Object.entries(p))u.searchParams.set(k,v);
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),15000);
  try{
    const r=await fetch(u,{headers:{"access-token":access,"secret-access-token":secret,accept:"application/json"},signal:ctl.signal});
    clearTimeout(tm);let body:any=null;try{body=await r.json()}catch{}
    return{ok:r.ok,status:r.status,body,error:r.ok?null:"GC_READ_FAILED"};
  }catch(e){clearTimeout(tm);return{ok:false,status:504,body:null,error:"GC_TIMEOUT"}}
}

function gcArray(body:any){return Array.isArray(body?.data)?body.data:Array.isArray(body)?body:[]}
async function gcPages(path:string,maxPages=3){
  const out:any[]=[];let status=200,ok=true;
  for(let page=1;page<=maxPages;page++){
    if(page>1)await new Promise(r=>setTimeout(r,350));
    const x=await gcGet(path,{pagina:String(page),limite:"100"});
    status=x.status;if(!x.ok){ok=false;break}
    const arr=gcArray(x.body);out.push(...arr);
    const next=x.body?.meta?.proxima_pagina;
    if(!next||arr.length<100)break;
  }
  return{ok,status,rows:out};
}
function coraMovement(x:any,kind:"IN"|"OUT"){
  const value=centsFromBr(x?.valor_total??x?.valor);
  const id=safe(x?.id,100),code=safe(x?.codigo,80);
  const date=safe(x?.data_liquidacao||x?.data_competencia||x?.data_vencimento||x?.modificado_em||x?.cadastrado_em,80);
  const counterparty=kind==="IN"?safe(x?.nome_cliente,180):safe(x?.nome_fornecedor||x?.nome_funcionario,180);
  return{
    movement_id:(kind==="IN"?"GC-REC-":"GC-PAY-")+String(id||code||""),
    source:"CORA_VIA_GESTAOCLICK",
    direction:kind,
    external_id:id,
    external_code:code,
    description:safe(x?.descricao,240),
    counterparty,
    amount_cents:value,
    date,
    settlement_date:safe(x?.data_liquidacao,80),
    payment_method:safe(x?.nome_forma_pagamento,160),
    liquidated:String(x?.liquidado??"")==="1",
    detected_at:new Date().toISOString(),
    click_financial_fields_ignored:true
  };
}
async function coraChannel(){
  const prod={
    clientId:sec("CORA_PROD_CLIENT_ID")||sec("CORA_CLIENT_ID"),
    cert:sec("CORA_PROD_CERT_PEM")||sec("CORA_CERT_PEM"),
    key:sec("CORA_PROD_PRIVATE_KEY")||sec("CORA_PRIVATE_KEY")
  };
  const stage={
    clientId:sec("CORA_STAGE_CLIENT_ID"),
    cert:sec("CORA_STAGE_CERT_PEM"),
    key:sec("CORA_STAGE_PRIVATE_KEY")
  };
  const has=(x:any)=>!!(x.clientId&&x.cert&&x.key);
  const cfg=has(prod)
    ?{...prod,environment:"PRODUCTION",base:"https://matls-clients.api.cora.com.br"}
    :has(stage)
      ?{...stage,environment:"STAGE",base:"https://matls-clients.api.stage.cora.com.br"}
      :null;
  const baseResult:any={
    channel:"CORA_DIRECT_BANK_STATEMENT",
    account_found:true,
    account_name:"Cora",
    movements:[],
    counts:{total:0,in:0,out:0},
    read_at:new Date().toISOString(),
    safeguards:{
      click_financial_authority:false,
      click_sales_ignored:true,
      click_receivables_ignored:true,
      click_payables_ignored:true,
      click_rateios_ignored:true,
      click_cost_centers_ignored:true,
      writes:false
    },
    source_policy:{
      required:"CORA_EXTRATO_BANK_STATEMENT",
      forbidden:["GESTAOCLICK_VENDAS","GESTAOCLICK_RECEBIMENTOS_ERP","GESTAOCLICK_PAGAMENTOS_ERP"],
      ui_path:"/cora/extrato",
      direct_api_target:"/bank-statement/statement",
      balance_api_target:"/third-party/account/balance"
    }
  };
  if(!cfg)return{...baseResult,ok:false,status:503,error:"CORA_DIRECT_CREDENTIALS_MISSING",balance:{available:false,cents:null,reason:"CORA_DIRECT_CREDENTIALS_MISSING"}};
  const cert=cfg.cert.replace(/\\n/g,"\n").replace(/\r\n/g,"\n").trim()+"\n";
  const key=cfg.key.replace(/\\n/g,"\n").replace(/\r\n/g,"\n").trim()+"\n";
  let httpClient:Deno.HttpClient|undefined;
  try{
    httpClient=Deno.createHttpClient({cert,key});
    const tokenRes=await fetch(cfg.base+"/token",{
      method:"POST",
      headers:{"content-type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({grant_type:"client_credentials",client_id:cfg.clientId}),
      client:httpClient
    } as RequestInit & {client:Deno.HttpClient});
    const tokenBody:any=await tokenRes.json().catch(()=>({}));
    const token=String(tokenBody?.access_token||"");
    if(!tokenRes.ok||!token){
      return{...baseResult,ok:false,status:502,error:"CORA_DIRECT_AUTH_FAILED",environment:cfg.environment,
        auth:{http_status:tokenRes.status,error:safe(tokenBody?.error,80),error_description:safe(tokenBody?.error_description,240)},
        balance:{available:false,cents:null,reason:"CORA_DIRECT_AUTH_FAILED"}};
    }
    const endDate=new Date(),startDate=new Date(endDate.getTime()-60*24*60*60*1000);
    const ymd=(d:Date)=>d.toISOString().slice(0,10);
    const statementUrl=new URL(cfg.base+"/bank-statement/statement");
    statementUrl.searchParams.set("start",ymd(startDate));
    statementUrl.searchParams.set("end",ymd(endDate));
    statementUrl.searchParams.set("page","1");
    statementUrl.searchParams.set("perPage","500");
    statementUrl.searchParams.set("aggr","true");
    const headers={Authorization:"Bearer "+token,accept:"application/json"};
    const [stRes,balRes]=await Promise.all([
      fetch(statementUrl.toString(),{headers,client:httpClient} as RequestInit & {client:Deno.HttpClient}),
      fetch(cfg.base+"/third-party/account/balance",{headers,client:httpClient} as RequestInit & {client:Deno.HttpClient})
    ]);
    const st:any=await stRes.json().catch(()=>({}));
    const bal:any=await balRes.json().catch(()=>({}));
    if(!stRes.ok){
      return{...baseResult,ok:false,status:502,error:"CORA_STATEMENT_READ_FAILED",environment:cfg.environment,
        source_health:{statement_status:stRes.status,balance_status:balRes.status},
        balance:{available:false,cents:null,reason:"CORA_STATEMENT_READ_FAILED"}};
    }
    const entries=Array.isArray(st?.entries)?st.entries:[];
    const movements=entries.map((e:any)=>{
      const typ=String(e?.type||"").toUpperCase();
      const direction=(typ==="CREDIT"||typ==="UNBLOCK")?"IN":"OUT";
      const tx=e?.transaction||{},cp=tx?.counterParty||{};
      const id=String(e?.id||tx?.id||[e?.createdAt,tx?.description,e?.amount].join("|"));
      return{
        movement_id:id,
        external_id:String(e?.id||""),
        external_code:String(tx?.id||""),
        direction,
        amount_cents:Math.abs(Number(e?.amount||0)),
        date:String(e?.createdAt||""),
        settlement_date:String(e?.createdAt||""),
        counterparty:safe(cp?.name||tx?.description||"Movimentação Cora",180),
        counterparty_identity:safe(cp?.identity,40),
        description:safe(tx?.description||"",240),
        payment_method:safe(tx?.type||typ,80),
        record_type:typ,
        transaction_type:safe(tx?.type,80),
        source:"CORA_EXTRATO"
      };
    }).filter((x:any)=>x.movement_id&&Number.isFinite(x.amount_cents))
      .sort((a:any,b:any)=>String(b.date||"").localeCompare(String(a.date||"")));
    const ins=movements.filter((x:any)=>x.direction==="IN"),outs=movements.filter((x:any)=>x.direction==="OUT");
    const currentBalance=balRes.ok&&Number.isFinite(Number(bal?.balance))?Number(bal.balance):
      (Number.isFinite(Number(st?.end?.balance))?Number(st.end.balance):null);
    return{
      ...baseResult,ok:true,status:200,environment:cfg.environment,
      balance:{available:currentBalance!=null,cents:currentBalance,source:balRes.ok?"ACCOUNT_BALANCE_API":"STATEMENT_END_BALANCE"},
      movements,
      counts:{total:movements.length,in:ins.length,out:outs.length},
      aggregations:{
        credit_cents:Number.isFinite(Number(st?.aggregations?.creditTotal))?Number(st.aggregations.creditTotal):null,
        debit_cents:Number.isFinite(Number(st?.aggregations?.debitTotal))?Number(st.aggregations.debitTotal):null
      },
      statement_period:{start:ymd(startDate),end:ymd(endDate)},
      account:{business_name:safe(st?.header?.businessName,180),business_document:safe(st?.header?.businessDocument,40)},
      source_health:{statement_status:stRes.status,balance_status:balRes.status}
    };
  }catch(err){
    return{...baseResult,ok:false,status:500,error:"CORA_DIRECT_RUNTIME_ERROR",environment:cfg?.environment||null,
      runtime_error:safe(err instanceof Error?err.message:String(err),300),
      balance:{available:false,cents:null,reason:"CORA_DIRECT_RUNTIME_ERROR"}};
  }finally{try{httpClient?.close()}catch{}}
}
function normalizeCaseInput(v:any){
  const s=String(v??"").trim().replace(/\s+/g,"");
  let m=s.match(/^(\d{1,5})-(\d{2})$/);if(m)return m[1]+"-"+m[2];
  const d=s.replace(/\D/g,"");if(d.length>=3){const yy=d.slice(-2),n=d.slice(0,-2);if(Number(yy)>=20&&Number(yy)<=99)return n+"-"+yy}
  return null;
}
async function coraProvisionPreview(body:any){
  const movementId=String(body?.movement_id||"").trim(),caseNo=normalizeCaseInput(body?.case);
  if(!movementId)return{ok:false,status:400,error:"MOVEMENT_REQUIRED"};
  if(!caseNo)return{ok:false,status:400,error:"INVALID_CASE",expected:"651-26 ou 65126"};
  const channel=await coraChannel(),mv=channel.movements.find((x:any)=>x.movement_id===movementId);
  if(!mv)return{ok:false,status:404,error:"CORA_MOVEMENT_NOT_FOUND"};
  const yy=caseNo.slice(-2),boardName="GESTÃO DE OBRAS 20"+yy;
  if(!BOARD_NAMES.includes(boardName))return{ok:false,status:400,error:"YEAR_OUTSIDE_SCOPE"};
  const b:any=await boardBundle(boardName);if(!b.ok)return{ok:false,status:502,error:b.error};
  const row=b.rows.find((r:any)=>r.case===caseNo);
  if(!row)return{ok:false,status:404,error:"TRELLO_CASE_NOT_FOUND"};
  const st=norm(row.status),normal=st==="EM ANDAMENTO",manual=st==="AGUARDANDO PAGAMENTO";
  if(!normal&&!manual)return{ok:false,status:409,error:"CASE_STATUS_NOT_ALLOWED",case:caseNo,status_current:row.status,allowed:["EM ANDAMENTO","AGUARDANDO PAGAMENTO (manual)"]};
  const nature=mv.direction==="OUT"?"CUSTO":"ENTRADA";
  const date=(mv.settlement_date||mv.date||new Date().toISOString()).slice(0,10);
  const line=(date?date.split("-").reverse().slice(0,2).join("/"):"")+" - R$ "+((Number(mv.amount_cents||0))/100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+" - CORA - "+String(mv.counterparty||mv.description||"Movimentação").slice(0,120)+" - ["+mv.movement_id+"]";
  return{
    ok:true,status:200,preview:true,persisted:false,writes:false,
    movement:mv,
    target:{case:caseNo,status_current:row.status,trello_url:row.short_url||null,selection_mode:normal?"PADRAO_EM_ANDAMENTO":"MANUAL_AGUARDANDO_PAGAMENTO"},
    provisioning:{nature,category:String(body?.category||"A CLASSIFICAR").slice(0,80),trello_line:line,dedup_key:mv.movement_id},
    impact:{amount_cents:mv.amount_cents,current_cost_cents:row.cost_cents,current_profit_cents:row.profit_cents,current_margin_pct:row.margin_pct,
      projected_cost_cents:mv.direction==="OUT"&&row.cost_cents!=null?Number(row.cost_cents)+Number(mv.amount_cents||0):row.cost_cents,
      projected_profit_cents:mv.direction==="OUT"&&row.profit_cents!=null?Number(row.profit_cents)-Number(mv.amount_cents||0):mv.direction==="IN"&&row.profit_cents!=null?Number(row.profit_cents)+Number(mv.amount_cents||0):row.profit_cents}
  };
}
async function boardBundle(name:string){
  const boardsR=await trelloGet("/members/me/boards",{fields:"id,name,closed,dateLastActivity",filter:"open"});
  if(!boardsR.ok)return{ok:false,error:"BOARDS_READ_FAILED",status:boardsR.status};
  const board=(Array.isArray(boardsR.body)?boardsR.body:[]).find((b:any)=>b.name===name);
  if(!board)return{ok:false,error:"BOARD_NOT_FOUND",name};
  const [listsR,cardsR]=await Promise.all([
    trelloGet("/boards/"+board.id+"/lists",{fields:"id,name,closed",filter:"all"}),
    trelloGet("/boards/"+board.id+"/cards",{filter:"all",fields:"id,name,desc,idList,labels,idMembers,due,dueComplete,dateLastActivity,closed,shortUrl",limit:"1000"})
  ]);
  if(!listsR.ok||!cardsR.ok)return{ok:false,error:"BOARD_CONTEXT_FAILED",lists_status:listsR.status,cards_status:cardsR.status};
  const lists=Array.isArray(listsR.body)?listsR.body:[],lm=new Map(lists.map((x:any)=>[x.id,x.name]));
  const yy=name.slice(-2),year="20"+yy;
  const rawCards=Array.isArray(cardsR.body)?cardsR.body:[];
  const monthCandidates=rawCards.map((c:any)=>parseMonthlySummary(c,lm.get(c.idList)||"")).filter(Boolean);
  const month_summaries:any={};
  for(let m=1;m<=12;m++){const pick=chooseLatest(monthCandidates.filter((x:any)=>x.month===m) as any[]);if(pick)month_summaries[m]=pick}
  const annual_summary=chooseLatest(rawCards.map((c:any)=>parseAnnualSummary(c,year)).filter(Boolean) as any[]);
  const general_summary=chooseLatest(rawCards.map((c:any)=>parseGeneralSummary(c)).filter(Boolean) as any[]);
  const operationalCards=rawCards.filter((c:any)=>!isListSummaryCard(c)&&!isAnnualSummaryCard(c,year)&&!isGeneralSummaryCard(c)&&!isAcertoHelperCard(c));
  const parsed=operationalCards.map((c:any)=>financialParse(c,lm.get(c.idList)||"",yy));
  const dedup=primaryDedup(parsed);
  return{ok:true,board:{id:board.id,name:board.name,last_activity:board.dateLastActivity},lists:lists.map((x:any)=>x.name),
    raw_card_count:rawCards.length,operational_card_count:parsed.length,month_summaries,annual_summary,general_summary,...dedup};
}
async function gcCurrentMap(maxPages=3){
  const out:any[]=[];let ok=true;let lastStatus=200;
  for(let page=1;page<=maxPages;page++){
    if(page>1)await new Promise(r=>setTimeout(r,420));
    const r=await gcGet("/orcamentos",{pagina:String(page),limite:"100",ordenacao:"data",direcao:"desc"});
    lastStatus=r.status;if(!r.ok){ok=false;break}
    const arr=Array.isArray(r.body?.data)?r.body.data:[];out.push(...arr);
    if(arr.length<100)break;
  }
  const map=new Map<string,any>();
  for(const q of out){
    const raw=String(q?.codigo??"").replace(/\D/g,"");
    if(raw.length<4)continue;
    const yy=raw.slice(-2),num=raw.slice(0,-2),caseNo=num+"-"+yy;
    if(!map.has(caseNo))map.set(caseNo,{
      case:caseNo,external_id:safe(q?.id,80),customer:safe(q?.nome_cliente,180),
      status:safe(q?.nome_situacao,120),total_cents:centsFromBr(q?.valor_total),
      date:safe(q?.data,40)
    });
  }
  return{ok,status:lastStatus,quotes:out.length,map,read_at:new Date().toISOString(),pages:Math.ceil(out.length/100)};
}
function reconciliation(active:any[],gc:any){
  const rows:any[]=[];const summary:any={CONCILIADO:0,DIVERGENTE:0,PENDENTE_DE_ATUALIZACAO:0,NAO_LOCALIZADO:0,NAO_APLICAVEL:0};
  for(const t of active){
    const g=gc?.map?.get(t.case);
    if(!t.case){summary.NAO_APLICAVEL++;continue}
    if(!g){summary.NAO_LOCALIZADO++;rows.push({case:t.case,result:"NÃO LOCALIZADO",trello:{status:t.status,gross_cents:t.gross_cents},gestaoclick:null});continue}
    const amountComparable=t.gross_cents!=null&&g.total_cents!=null;
    const amountDiff=amountComparable?t.gross_cents-g.total_cents:null;
    const statusSame=norm(t.status)===norm(g.status);
    let result="CONCILIADO";
    if(amountComparable&&amountDiff!==0)result="DIVERGENTE";
    else if(!statusSame)result="PENDENTE DE ATUALIZAÇÃO";
    summary[result.replace(/ /g,"_").replace(/Ç/g,"C").replace(/Ã/g,"A").replace(/Õ/g,"O")] = (summary[result.replace(/ /g,"_").replace(/Ç/g,"C").replace(/Ã/g,"A").replace(/Õ/g,"O")]||0)+1;
    rows.push({case:t.case,result,difference_cents:amountDiff,trello:{status:t.status,gross_cents:t.gross_cents},gestaoclick:g});
  }
  return{summary,rows};
}
function currentOps(rows:any[]){
  const active=rows.filter(r=>["RETORNO","EM ANDAMENTO","AGUARDANDO PAGAMENTO","PAGAMENTO ATRASADO","AGUARDANDO ACERTO"].includes(r.status));
  const byStatus:Record<string,{count:number,gross_cents:number}>={};
  for(const r of active){
    if(!byStatus[r.status])byStatus[r.status]={count:0,gross_cents:0};
    byStatus[r.status].count++;byStatus[r.status].gross_cents+=r.gross_cents??0;
  }
  return{active,by_status:byStatus};
}
async function buildOverview(includeGc=true){
  const bundles=await Promise.all(BOARD_NAMES.map(n=>boardBundle(n)));
  const failures=bundles.filter((x:any)=>!x.ok);
  if(failures.length)return{ok:false,error:"TRELLO_BOARD_BUNDLE_FAILED",failures};
  const byName:any={};for(const b of bundles as any[])byName[b.board.name]=b;
  const years:any={};
  for(const y of ["2024","2025","2026"]){
    const b=byName["GESTÃO DE OBRAS "+y];
    years[y]={board:b.board,raw_card_count:b.raw_card_count,operational_card_count:b.operational_card_count,dedup_case_count:b.rows.length,duplicate_primary_cases:b.duplicates.length,unkeyed_count:b.unkeyed_count,metrics:metricsForBundle(b,y.slice(-2)),summary_coverage:Object.keys(b.month_summaries||{}).length,annual_summary:b.annual_summary};
  }
  const c26=byName["GESTÃO DE OBRAS 2026"],ops=currentOps(c26.rows);
  const gc=includeGc?await gcCurrentMap(1):null;
  const recon=gc&&gc.ok?reconciliation(ops.active,gc):null;
  return{
    ok:true,build:BUILD,mode:"READ_ONLY_LIVE_CANDIDATE",
    source_of_truth:{primary:"TRELLO",complementary:"GESTAOCLICK",mixing_forbidden:true},
    trello:{read_at:new Date().toISOString(),boards:BOARD_NAMES,years,current:{board:c26.board,by_status:ops.by_status,active_cases:ops.active.slice(0,120),quality:{duplicate_primary_cases:c26.duplicates.slice(0,30),unkeyed_count:c26.unkeyed_count}}},
    gestaoclick:gc?{ok:gc.ok,http_status:gc.status,read_at:gc.read_at,quotes_sampled:gc.quotes,pages:gc.pages,reconciliation:recon,fiscal_info:"NOT_VERIFIED_IN_CURRENT_INTEGRATION"}:{skipped:true},
    safeguards:{writes_enabled:false,persisted:false,schema_changes:false,rls_changes:false,auth_changes:false,cron:false,webhook:false},
    update_model:{trello_candidate_refresh_seconds:60,gestaoclick_candidate_refresh_seconds:300,trello_webhook:"DEFERRED_PENDING_PERSISTENCE_ARCHITECTURE_APPROVAL",gestaoclick_webhook:"NOT_CONFIRMED"},
    side_effects:"READ_ONLY"
  };
}

function brlManual(cents:number){
  return (cents/100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
}
function manualCase(v:any){
  const s=String(v??"").trim().replace(/\s+/g,"");
  let m=s.match(/^(\d{1,5})-(\d{2})$/); if(m)return m[1]+"-"+m[2];
  const d=s.replace(/\D/g,""); if(d.length>=3){const yy=d.slice(-2),n=d.slice(0,-2); if(Number(yy)>=24&&Number(yy)<=26)return n+"-"+yy}
  return null;
}
async function trelloWriteCardDesc(cardId:string,desc:string){
  const key=sec("TRELLO_API_KEY"),token=sec("TRELLO_API_TOKEN");
  if(!key||!token)return{ok:false,status:412,error:"TRELLO_CREDENTIAL_GATE_REQUIRED",body:null};
  const u=new URL(TRELLO_BASE+"/cards/"+cardId);u.searchParams.set("key",key);u.searchParams.set("token",token);
  const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),15000);
  try{
    const r=await fetch(u,{method:"PUT",headers:{"content-type":"application/x-www-form-urlencoded",accept:"application/json"},body:new URLSearchParams({desc}),signal:ctl.signal});
    clearTimeout(tm);let body:any=null;try{body=await r.json()}catch{}
    return{ok:r.ok,status:r.status,error:r.ok?null:"TRELLO_WRITE_FAILED",body};
  }catch(e){clearTimeout(tm);return{ok:false,status:504,error:"TRELLO_TIMEOUT",body:null}}
}

function stripLegacyManualMarkers(desc:string){
  return String(desc||"")
    .replace(/^\s*\[CR-MANUAL-CORA:[^\]]+\]\s*$/gmi,"")
    .replace(/^\s*<!--\s*CR-MANUAL-CORA:[^>]+-->\s*$/gmi,"")
    .replace(/\n{3,}/g,"\n\n")
    .trim();
}
function cleanManualText(v:any){return String(v||"").replace(/\s+/g," ").trim()}
function normManualText(v:any){
  return cleanManualText(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().trim();
}
function dedupeManualParts(parts:string[]){
  const out:string[]=[]; const seen=new Set<string>();
  for(const raw of parts){const txt=cleanManualText(raw); if(!txt) continue; const key=normManualText(txt); if(seen.has(key)) continue; seen.add(key); out.push(txt)}
  return out;
}
function removeRepeatedCategory(category:string,note:string){
  const c=cleanManualText(category), n=cleanManualText(note); if(!c||!n) return n;
  const nc=normManualText(c), nn=normManualText(n);
  if(nn===nc) return "";
  if(nn.startsWith(nc+" - ")) return n.slice(c.length+3).trim();
  if(nn.startsWith(nc+":")) return n.slice(c.length+1).trim();
  return n;
}
function normalizeLedgerLine(s:string){
  return cleanManualText(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s*-\s*/g," - ").replace(/\s+/g," ").toUpperCase().trim();
}
function movementAlreadyExists(desc:string,candidateLine:string){
  const cleanDesc=stripLegacyManualMarkers(desc);
  return cleanDesc.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).some(line=>normalizeLedgerLine(line)===normalizeLedgerLine(candidateLine));
}
function insertManualMovement(desc:string,direction:"IN"|"OUT",line:string){
  const d=String(desc||"");
  if(direction==="OUT"){
    const m=d.match(/\n\s*Total\s+Custos\s*:/i);
    if(m&&m.index!=null)return d.slice(0,m.index)+"\n"+line+"\n"+d.slice(m.index);
    const c=d.match(/Custos\s*:?/i);
    if(c&&c.index!=null){const p=c.index+c[0].length;return d.slice(0,p)+"\n\n"+line+d.slice(p)}
    return d+"\n\nCustos:\n"+line+"\n";
  }
  const c=d.match(/\n\s*Custos\s*:?/i);
  if(c&&c.index!=null)return d.slice(0,c.index)+"\n"+line+d.slice(c.index);
  return d+"\n"+line+"\n";
}
async function manualCoraTrello(body:any,commit:boolean){
  const caseNo=manualCase(body?.case);
  const direction=String(body?.direction||"").toUpperCase()==="IN"?"IN":String(body?.direction||"").toUpperCase()==="OUT"?"OUT":null;
  const raw=String(body?.amount||"").trim().replace(/R\$/gi,"").replace(/\s/g,"");
  const n=raw.includes(",")?Number(raw.replace(/\./g,"").replace(",",".")):Number(raw);
  const cents=Number.isFinite(n)?Math.round(Math.abs(n)*100):0;
  const date=String(body?.date||"").trim();
  const counterparty=String(body?.counterparty||"").trim().slice(0,120);
  const category=String(body?.category||"").trim().slice(0,80);
  const note=String(body?.description||"").trim().slice(0,180);
  const ref=String(body?.reference||"").trim().slice(0,100);
  const op=String(body?.operation_id||"").trim().replace(/[^A-Za-z0-9_-]/g,"").slice(0,80);
  if(!caseNo)return{ok:false,status:400,error:"INVALID_CASE",expected:"651-26 ou 65126"};
  if(!direction)return{ok:false,status:400,error:"INVALID_DIRECTION"};
  if(!cents)return{ok:false,status:400,error:"INVALID_AMOUNT"};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return{ok:false,status:400,error:"INVALID_DATE"};
  if(!op)return{ok:false,status:400,error:"OPERATION_ID_REQUIRED"};
  const yy=caseNo.slice(-2),boardName="GESTÃO DE OBRAS 20"+yy;
  if(!BOARD_NAMES.includes(boardName))return{ok:false,status:400,error:"YEAR_OUTSIDE_SCOPE"};
  const boardsR=await trelloGet("/members/me/boards",{fields:"id,name",filter:"open"});
  if(!boardsR.ok)return{ok:false,status:502,error:"BOARDS_READ_FAILED"};
  const board=(Array.isArray(boardsR.body)?boardsR.body:[]).find((b:any)=>b.name===boardName);
  if(!board)return{ok:false,status:404,error:"BOARD_NOT_FOUND"};
  const [listsR,cardsR]=await Promise.all([
    trelloGet("/boards/"+board.id+"/lists",{fields:"id,name,closed",filter:"open"}),
    trelloGet("/boards/"+board.id+"/cards",{filter:"open",fields:"id,name,desc,idList,shortUrl,dateLastActivity",limit:"1000"})
  ]);
  if(!listsR.ok||!cardsR.ok)return{ok:false,status:502,error:"TRELLO_CONTEXT_FAILED"};
  const lists=Array.isArray(listsR.body)?listsR.body:[],lm=new Map(lists.map((x:any)=>[x.id,x.name]));
  const cards=Array.isArray(cardsR.body)?cardsR.body:[];
  const matches=cards.filter((c:any)=>extractCase(c.name)===caseNo&&!isListSummaryCard(c)&&!isAnnualSummaryCard(c,"20"+yy)&&!isGeneralSummaryCard(c));
  if(!matches.length)return{ok:false,status:404,error:"TRELLO_CASE_NOT_FOUND",case:caseNo};
  const card=[...matches].sort((a:any,b:any)=>String(b.dateLastActivity||"").localeCompare(String(a.dateLastActivity||"")))[0];
  const listName=String(lm.get(card.idList)||"");
  const allowed=/EM ANDAMENTO|AGUARDANDO PAGAMENTO|AG PAGAMENTO|AGUARDANDO ACERTO|AG ACERTO|RETORNO/i.test(norm(listName));
  if(!allowed)return{ok:false,status:409,error:"CASE_LIST_NOT_ALLOWED",case:caseNo,list:listName};
  const baseDesc=stripLegacyManualMarkers(String(card.desc||""));
  const ddmm=date.slice(8,10)+"/"+date.slice(5,7);
  const label=direction==="IN"?"Recebido":(category||"Custo");
  const cleanNote=removeRepeatedCategory(category,note);
  const parts=dedupeManualParts([
    counterparty,
    cleanNote,
    ref?("Ref. "+cleanManualText(ref)):""
  ]);
  const line=ddmm+" - R$"+brlManual(cents)+" "+label+(parts.length?" - "+parts.join(" - "):"");
  if(movementAlreadyExists(baseDesc,line)){
    return {ok:true,status:200,duplicate:true,committed:commit,case:caseNo,trello_url:card.shortUrl,list:listName,line,writes:{trello:false,gestaoclick:false,cora:false}};
  }
  const newDesc=insertManualMovement(baseDesc,direction,line);
  const preview={case:caseNo,list:listName,card_name:card.name,trello_url:card.shortUrl,direction,amount_cents:cents,date,counterparty,category:category||null,description:note||null,reference:ref||null,line};
  if(!commit)return{ok:true,status:200,preview:true,committed:false,target:preview};
  const wr=await trelloWriteCardDesc(card.id,newDesc);
  if(!wr.ok)return{ok:false,status:wr.status||502,error:wr.error||"TRELLO_WRITE_FAILED",target:preview};
  return{ok:true,status:200,preview:false,committed:true,target:preview,trello:{id:card.id,url:card.shortUrl},writes:{trello:true,gestaoclick:false,cora:false}};
}

function closeMoney(cents:number|null){
  return cents==null?"N/D":"R$ "+brlManual(cents);
}
function closePct(v:number|null){
  return v==null?"N/D":Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+"%";
}
function buildCloseBlock(x:any){
  const r=x.rateio||{};
  const lines=[
    "FECHAMENTO DA OBRA",
    "",
    "Valor Fechado: "+closeMoney(x.closed_cents),
  ];
  if(x.received_cents!=null)lines.push("Valor Recebido: "+closeMoney(x.received_cents));
  lines.push(
    "Base do Acerto: "+closeMoney(x.base_cents),
    "Total de Custos: "+closeMoney(x.cost_cents),
    "Saldo / Lucro Líquido: "+closeMoney(x.profit_cents),
    "Margem de Lucro: "+closePct(x.margin_pct),
    "",
    "RATEIO DO LUCRO",
    "Fabrício (20%): "+closeMoney(r.fabricio_cents),
    "Éder (28%): "+closeMoney(r.eder_cents),
    "Rogério (28%): "+closeMoney(r.rogerio_cents),
    "Gabrielly (14%): "+closeMoney(r.gabi_cents),
    "Capital de Giro (10%): "+closeMoney(r.capital_giro_cents)
  );
  const sf=Number(x.support_cents?.["Fabrício"]||0),se=Number(x.support_cents?.["Éder"]||0);
  if(sf||se){
    lines.push("","APOIO / DIÁRIAS");
    if(sf)lines.push("Fabrício: "+closeMoney(sf));
    if(se)lines.push("Éder: "+closeMoney(se));
  }
  return lines.join("\n");
}
function replaceCloseBlock(desc:string,block:string){
  const d=String(desc||"").replace(/\n*FECHAMENTO DA OBRA[\s\S]*$/i,"").trimEnd();
  return d+(d?"\n\n":"")+block+"\n";
}
// Fail closed when a line under Custos explicitly names a different obra.
// The textual source remains unchanged: no automatic debit, reversal or reallocation.
function foreignCostCaseRefs(desc:string,ownCase:string){
  const lines=String(desc||"").replace(/\*/g,"").split(/\r?\n/);
  let inCosts=false;const matches:any[]=[];
  for(const line of lines){
    if(/^\s*Custos\s*:/i.test(line)){inCosts=true;continue}
    if(inCosts&&/^\s*(?:FECHAMENTO\s+DA\s+OBRA|Total\s+(?:de\s+)?Custos|Saldo\s*\/|Lucro\s+L[ií]quido|RATEIO\s+DO\s+LUCRO)/i.test(line))break;
    if(!inCosts||!/R\$\s*[-]?[0-9.]+,[0-9]{2}/i.test(line))continue;
    const regex=/\b(?:obra|or[cç]amento)\s*[:#-]?\s*(\d{1,5})\s*-\s*(2[456])\b/gi;
    let m;while((m=regex.exec(line))!==null){
      const ref=m[1]+"-"+m[2];
      if(ref!==ownCase)matches.push({other_case:ref,line:line.trim().slice(0,240)});
    }
  }
  return matches;
}

async function manualCloseWork(body:any){
  const caseNo=manualCase(body?.case);
  if(!caseNo)return{ok:false,status:400,error:"INVALID_CASE",expected:"651-26 ou 65126"};
  const yy=caseNo.slice(-2),boardName="GESTÃO DE OBRAS 20"+yy;
  if(!BOARD_NAMES.includes(boardName))return{ok:false,status:400,error:"YEAR_OUTSIDE_SCOPE"};
  const boardsR=await trelloGet("/members/me/boards",{fields:"id,name",filter:"open"});
  if(!boardsR.ok)return{ok:false,status:502,error:"BOARDS_READ_FAILED"};
  const board=(Array.isArray(boardsR.body)?boardsR.body:[]).find((b:any)=>b.name===boardName);
  if(!board)return{ok:false,status:404,error:"BOARD_NOT_FOUND"};
  const [listsR,cardsR]=await Promise.all([
    trelloGet("/boards/"+board.id+"/lists",{fields:"id,name,closed",filter:"open"}),
    trelloGet("/boards/"+board.id+"/cards",{filter:"open",fields:"id,name,desc,idList,labels,idMembers,due,dueComplete,dateLastActivity,closed,shortUrl",limit:"1000"})
  ]);
  if(!listsR.ok||!cardsR.ok)return{ok:false,status:502,error:"TRELLO_CONTEXT_FAILED"};
  const lists=Array.isArray(listsR.body)?listsR.body:[],lm=new Map(lists.map((x:any)=>[x.id,x.name]));
  const cards=Array.isArray(cardsR.body)?cardsR.body:[];
  const matches=cards.filter((c:any)=>extractCase(c.name)===caseNo&&!isListSummaryCard(c)&&!isAnnualSummaryCard(c,"20"+yy)&&!isGeneralSummaryCard(c)&&!isAcertoHelperCard(c));
  if(!matches.length)return{ok:false,status:404,error:"TRELLO_CASE_NOT_FOUND",case:caseNo};
  if(matches.length!==1&&(body?.dry_run===true||body?.require_preview===true))return{ok:false,status:409,error:"DUPLICATE_CASE_CARDS_REVIEW_REQUIRED",case:caseNo,card_count:matches.length};
  const card=[...matches].sort((a:any,b:any)=>String(b.dateLastActivity||"").localeCompare(String(a.dateLastActivity||"")))[0];
  const listName=String(lm.get(card.idList)||"");
  const st=statusFromCard(card,listName);const allowedClose=["EM ANDAMENTO","RETORNO","AGUARDANDO PAGAMENTO","PAGAMENTO ATRASADO","AGUARDANDO ACERTO"].includes(st);if(!allowedClose)return{ok:false,status:409,error:"CASE_NOT_OPERATIONALLY_OPEN",case:caseNo,list:listName,work_status:st};
  const refs=foreignCostCaseRefs(String(card.desc||""),caseNo);
  if(refs.length)return{ok:false,status:409,error:"CUSTOS_REFERENCIAM_OUTRA_OBRA",case:caseNo,reference_count:refs.length,other_cases:[...new Set(refs.map(x=>x.other_case))],review_required:true,writes:false};
  const row=financialParse(card,listName,yy);
  const base=row.received_cents!=null?row.received_cents:row.gross_cents;
  const profit=base!=null&&row.cost_cents!=null?base-row.cost_cents:null;
  const margin=base!=null&&base!==0&&profit!=null?Math.round(profit/base*10000)/100:null;
  const rateio=canonicalAcertoRateio(profit);
  const item={
    case:caseNo,closed_cents:row.gross_cents,received_cents:row.received_cents??null,
    base_cents:base,cost_cents:row.cost_cents,profit_cents:profit,margin_pct:margin,
    rateio,support_cents:row.support_cents||{"Fabrício":0,"Éder":0}
  };
  const missing=[];
  if(item.base_cents==null)missing.push("BASE_ACERTO");
  if(item.cost_cents==null)missing.push("TOTAL_CUSTOS");
  if(item.profit_cents==null)missing.push("LUCRO");
  if(!item.rateio)missing.push("RATEIO");
  if(missing.length)return{ok:false,status:409,error:"FECHAMENTO_INCOMPLETO",missing,case:caseNo,list:listName};
  const block=buildCloseBlock(item);
  const newDesc=replaceCloseBlock(String(card.desc||""),block);
  // V12: two-step closure; legacy V11 callers remain backwards-compatible.
  if(body?.dry_run===true||body?.require_preview===true){
    if(profit==null||profit<0||base==null||base<=0)return{ok:false,status:409,error:"INVALID_CLOSE_FINANCIAL_BASE",case:caseNo};
    if((row.issues||[]).some((v:string)=>["BASE_MENOS_CUSTO_DIVERGE_SALDO","RATEIO_NAO_FECHA_LUCRO"].includes(v)))return{ok:false,status:409,error:"FINANCIAL_CONFLICT_REVIEW_REQUIRED",case:caseNo,issues:row.issues};
    const bytes=new TextEncoder().encode(JSON.stringify({id:card.id,name:card.name,idList:card.idList,desc:card.desc||"",lastActivity:card.dateLastActivity,block}));
    const signature=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))).map(x=>x.toString(16).padStart(2,"0")).join("");
    if(body?.dry_run===true)return{ok:true,status:200,preview:true,duplicate:newDesc===String(card.desc||""),case:caseNo,target:{trello_url:card.shortUrl,list:listName,card_name:card.name,card_id:card.id},close:item,fingerprint:signature,preview_at:Date.now()};
    if(!/^[a-f0-9]{64}$/.test(String(body?.expected_fingerprint||""))||body.expected_fingerprint!==signature||body.expected_card_id!==card.id)return{ok:false,status:409,error:"PREVIEW_STALE_OR_CHANGED",case:caseNo};
    const age=Date.now()-Number(body?.preview_at);
    if(!Number.isFinite(age)||age<0||age>120000)return{ok:false,status:409,error:"PREVIEW_EXPIRED",case:caseNo};
  }
  if(newDesc===String(card.desc||""))return{ok:true,status:200,duplicate:true,case:caseNo,target:{trello_url:card.shortUrl,list:listName},close:item,block};
  const wr=await trelloWriteCardDesc(card.id,newDesc);
  if(!wr.ok)return{ok:false,status:wr.status||502,error:wr.error||"TRELLO_WRITE_FAILED",case:caseNo};
  return{ok:true,status:200,committed:true,case:caseNo,target:{trello_url:card.shortUrl,list:listName,card_name:card.name},close:item,block,writes:{trello:true,gestaoclick:false,cora:false}};
}

Deno.serve(async(req:Request)=>{
  const internal=(()=>{const k=serviceRoleKey(),bear=req.headers.get("authorization")||"";return !!k&&bear==="Bearer "+k})();

  const u=new URL(req.url),api=(u.searchParams.get("api")||"health").toLowerCase();
  if(req.method==="POST"&&api==="manual-close-work"){
    if(!internal)return json({ok:false,error:"INTERNAL_AUTH_REQUIRED"},401);
    const body=await req.json().catch(()=>({})),p:any=await manualCloseWork(body);
    return json(p,p.status||200);
  }
  if(req.method==="POST"&&api==="manual-cora-preview"){
    if(!internal)return json({ok:false,error:"INTERNAL_AUTH_REQUIRED"},401);
    const body=await req.json().catch(()=>({})),p:any=await manualCoraTrello(body,false);
    return json(p,p.status||200);
  }
  if(req.method==="POST"&&api==="manual-cora-commit"){
    if(!internal)return json({ok:false,error:"INTERNAL_AUTH_REQUIRED"},401);
    const body=await req.json().catch(()=>({})),p:any=await manualCoraTrello(body,true);
    return json(p,p.status||200);
  }
  if(req.method==="POST"&&api==="cora-provision-preview"){
    if(!internal)return json({ok:false,error:"INTERNAL_AUTH_REQUIRED"},401);
    const body=await req.json().catch(()=>({})),p:any=await coraProvisionPreview(body);
    return json(p,p.status||200);
  }
  if(req.method==="POST"&&api==="acerto-snapshot"){
    const k=serviceRoleKey(),bear=req.headers.get("authorization")||"";
    if(!k||bear!=="Bearer "+k)return json({ok:false,error:"INTERNAL_AUTH_REQUIRED"},401);
    const body=await req.json().catch(()=>({})),wanted=Array.isArray(body?.cases)?new Set(body.cases.map((x:any)=>String(x))):null;
    const b:any=await boardBundle("GESTÃO DE OBRAS 2026");if(!b.ok)return json({ok:false,error:b.error},502);
    const g=await gcCurrentMap(3),live=buildAcertoLive(b.rows,g.ok?g.map:null);
    const selected=wanted&&wanted.size?live.items.filter((x:any)=>wanted.has(x.case)):live.items;
    const selectedLive=buildAcertoLive(b.rows.filter((r:any)=>selected.some((x:any)=>x.case===r.case)),g.ok?g.map:null);
    const now=new Date(),labelRaw=String(body?.label||"").trim(),label="ACERTO_VIVO_"+now.toISOString().replace(/[:.]/g,"-")+(labelRaw?"_"+labelRaw.replace(/[^A-Za-z0-9_-]+/g,"_").slice(0,50):"");
    const payload={version:"CR-ACERTO-SNAPSHOT-V1",captured_at:now.toISOString(),source_board:b.board,selection:Array.from(wanted||[]),acerto:selectedLive,historical_references:["06/08","18/09"]};
    const saved=await persistAcertoSnapshot(payload,String(body?.actor||"Diretoria").slice(0,120),label);
    return json(saved,saved.ok?200:500);
  }
  if(req.method!=="GET")return json({ok:false,error:"READ_ONLY_EXCEPT_SNAPSHOT",writes_enabled:false,persisted:false},405);
  if(api==="cora-channel"){
    if(!internal)return json({ok:false,error:"INTERNAL_AUTH_REQUIRED"},401);
    const d=await coraChannel();return json({...d,build:BUILD},d.ok?200:502);
  }
  if(api==="health")return json({ok:true,build:BUILD,status:"CANDIDATE",production:false,verify_jwt_expected:true,secrets:{trello:!!sec("TRELLO_API_KEY")&&!!sec("TRELLO_API_TOKEN"),gestaoclick:!!sec("GESTAOCLICK_ACCESS_TOKEN")&&!!sec("GESTAOCLICK_SECRET_ACCESS_TOKEN")},writes_enabled:false,persisted:false});
  if(api==="overview"){
    const d=await buildOverview(true);return json(d,d.ok?200:502);
  }
  if(api==="year"){
    const year=(u.searchParams.get("year")||"").trim();
    if(!["2024","2025","2026"].includes(year))return json({ok:false,error:"INVALID_YEAR"},400);
    const b:any=await boardBundle("GESTÃO DE OBRAS "+year);
    if(!b.ok)return json({ok:false,error:b.error},502);
    const rows=filterRows(b.rows,u); return json({ok:true,build:BUILD,year,board:b.board,raw_card_count:b.raw_card_count,dedup_case_count:b.rows.length,duplicate_primary_cases:b.duplicates.slice(0,30),unkeyed_count:b.unkeyed_count,metrics:metricsForBundle(b,year.slice(-2),u),cost_intelligence:costIntelligence(rows),rateio_breakdown:rateioBreakdown(rows,year.slice(-2)),rateio_timeline:rateioTimeline(b.rows,year),rows:rows.slice(0,500),writes_enabled:false,persisted:false,side_effects:"READ_ONLY"});
  }
  if(api==="audit"){
    const year=(u.searchParams.get("year")||"2026").trim();if(!["2024","2025","2026"].includes(year))return json({ok:false,error:"INVALID_YEAR"},400);const b:any=await boardBundle("GESTÃO DE OBRAS "+year);if(!b.ok)return json({ok:false,error:b.error},502);const rows=filterRows(b.rows,u);return json({ok:true,build:BUILD,year,metrics:metricsForBundle(b,year.slice(-2),u),cost_intelligence:costIntelligence(rows),rateio_breakdown:rateioBreakdown(rows,year.slice(-2)),rateio_timeline:rateioTimeline(b.rows,year),rows:rows.slice(0,500),quality:{duplicates:b.duplicates,unkeyed_count:b.unkeyed_count},writes_enabled:false,persisted:false});
  }
  if(api==="current"){
    const gc=(u.searchParams.get("gc")||"0")==="1";
    const b:any=await boardBundle("GESTÃO DE OBRAS 2026");
    if(!b.ok)return json({ok:false,error:b.error},502);
    const ops=currentOps(b.rows);
    const g=gc?await gcCurrentMap(1):null;
    const acertos=buildAcertoLive(b.rows,g&&g.ok?g.map:null);
    return json({ok:true,build:BUILD,trello:{read_at:new Date().toISOString(),board:b.board,by_status:ops.by_status,active_cases:ops.active.slice(0,120),metrics:metricsForBundle(b,"26")},acertos,gestaoclick:g&&g.ok?{read_at:g.read_at,quotes_sampled:g.quotes,reconciliation:reconciliation(ops.active,g)}:g?{ok:false,http_status:g.status}:{skipped:true},writes_enabled:false,persisted:false,snapshot_persistence:true,side_effects:"READ_ONLY_EXTERNAL_SOURCES"});
  }
  if(api==="acerto-live"){
    const gc=(u.searchParams.get("gc")||"1")==="1",b:any=await boardBundle("GESTÃO DE OBRAS 2026");
    if(!b.ok)return json({ok:false,error:b.error},502);
    const g=gc?await gcCurrentMap(3):null;
    return json({...buildAcertoLive(b.rows,g&&g.ok?g.map:null),build:BUILD,trello_read_at:new Date().toISOString(),gestaoclick:g?{ok:g.ok,read_at:g.read_at,quotes_sampled:g.quotes}: {skipped:true},writes_to_trello:false,writes_to_gestaoclick:false});
  }
  if(api==="acerto-history"){
    const h=await readAcertoSnapshots();return json({ok:true,build:BUILD,snapshots:h.items||[],persistence_ok:h.ok,historical_references:["06/08","18/09"]});
  }
  if(api==="case"){
    const caseNo=(u.searchParams.get("case")||"").trim();
    if(!/^\d{1,5}-\d{2}$/.test(caseNo))return json({ok:false,error:"INVALID_CASE",expected:"NNN-26"},400);
    const yy=caseNo.slice(-2),name="GESTÃO DE OBRAS 20"+yy;
    if(!BOARD_NAMES.includes(name))return json({ok:false,error:"YEAR_OUTSIDE_CANDIDATE_SCOPE"},400);
    const b:any=await boardBundle(name);if(!b.ok)return json({ok:false,error:b.error},502);
    const row=b.rows.find((r:any)=>r.case===caseNo)||null;
    const g=await gcGet("/orcamentos",{codigo:caseNo.replace("-",""),pagina:"1",limite:"10"});
    const raw=g.ok&&Array.isArray(g.body?.data)?g.body.data:[];
    const gcRows=raw.map((q:any)=>({external_id:safe(q?.id,80),case:caseNo,customer:safe(q?.nome_cliente,180),status:safe(q?.nome_situacao,120),total_cents:centsFromBr(q?.valor_total),date:safe(q?.data,40)}));
    return json({ok:true,build:BUILD,case:caseNo,trello:row,gestaoclick:gcRows,writes_enabled:false,persisted:false,side_effects:"READ_ONLY"});
  }
  if(api==="costs"){const year=(u.searchParams.get("year")||"2026").trim();if(!["2024","2025","2026"].includes(year))return json({ok:false,error:"INVALID_YEAR"},400);const b:any=await boardBundle("GESTÃO DE OBRAS "+year);if(!b.ok)return json({ok:false,error:b.error},502);const rows=filterRows(b.rows,u),ci=costIntelligence(rows),category=u.searchParams.get("category"),provider=u.searchParams.get("provider");return json({ok:true,build:BUILD,year,cost_intelligence:{items_count:ci.items_count,total_itemized_cents:ci.total_itemized_cents,classified_cents:ci.classified_cents,coverage_pct:ci.coverage_pct,by_category:ci.by_category,by_provider:ci.by_provider},filtered_items:ci.items.filter((i:any)=>(!category||i.category===category)&&(!provider||i.provider===provider)),writes_enabled:false,persisted:false})}
  if(api==="contract")return json({ok:true,build:BUILD,routes:["health","overview","year","audit","current","case","costs","acerto-live","acerto-history","acerto-snapshot","contract"],source_policy:{trello:"CANONICAL_MANAGERIAL",aggregation:"RECONCILED_TRELLO_SUMMARIES_WITH_RAW_DRILLDOWN",gestaoclick:"COMPLEMENTARY_RECONCILIATION",acertos:"TRELLO_AG_ACERTO_WORK_CARDS_ONLY"},refresh:{trello_seconds:60,gestaoclick_seconds:300},persistence:{acerto_snapshots:"cc_snapshots"},writes:{trello:false,gestaoclick:false,acerto_snapshot:true}});
  return json({ok:false,error:"NOT_FOUND"},404);
});