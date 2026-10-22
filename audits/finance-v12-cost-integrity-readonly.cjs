"use strict";
/* Triagem de integridade aritmética: SEM escritas em Trello, Cora ou Supabase. */
const {splitFinancialLines}=require("./finance-v12-reconcile-readonly.cjs");
const money=/^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{2}))?$/;
function centavos(value){
 const m=String(value||"").match(money);
 if(!m)return null;
 const integer=Number(m[1].replace(/\./g,""));
 const n=integer*100+Number(m[2]||"00");
 return Number.isSafeInteger(n)&&n>=0?n:null;
}
function parseCostLine(raw,defaultYear){
 const line=String(raw||"").replace(/^[\u200B\u200C\u200D\uFEFF]+/g,"");
 const header=line.match(/^\s*(?:[•*+-]\s*)?(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*[-–—]\s*(.*)$/);
 if(!header)return {kind:"NOT_DATED"};
 let year=header[3]?Number(header[3]):Number(defaultYear);
 if(year<100)year+=2000;
 const dd=Number(header[1]),mm=Number(header[2]),dt=new Date(Date.UTC(year,mm-1,dd));
 if(dt.getUTCFullYear()!==year||dt.getUTCMonth()+1!==mm||dt.getUTCDate()!==dd)return {kind:"INVALID_DATE"};
 const description=header[4];
 // Falha fechada para quantia inválida com três ou mais dígitos após a vírgula.
 if(/(?:R\$\s*){1,2}(?:NF\s*)?\d[\d.]*,\d{3,}/i.test(description))return {kind:"AMBIGUOUS_AMOUNT",values:[]};
 // Prefixos históricos: R$R$850,00 / R$NF131,57 / R$150 / R$65,64Taxa.
 const explicit=[...description.matchAll(/(?:R\$\s*){1,2}(?:NF\s*)?((?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{2})?)/gi)].map(x=>x[1]);
 // Ex.: 15/08 - JR 450,00; sem prefixo monetário, exigir um único valor com vírgula.
 const implicit=explicit.length?[]:[...description.matchAll(/(?<![\d,.])((?:\d{1,3}(?:\.\d{3})+|\d+),\d{2})(?![\d,.])/g)].map(x=>x[1]);
 const matches=explicit.length?explicit:implicit;
 if(matches.length!==1)return {kind:"AMBIGUOUS_AMOUNT",values:matches};
 const cents=centavos(matches[0]);
 if(cents===null||cents===0)return {kind:"AMBIGUOUS_AMOUNT",values:matches};
 return {kind:"COST",day:[year,String(mm).padStart(2,"0"),String(dd).padStart(2,"0")].join("-"),cents,method:explicit.length?"explicit_currency":"label_then_amount"};
}
function analyzeCard(card,defaultYear=2026){
 const desc=String(card&&card.desc||""),name=String(card&&card.name||"");
 const code=name.match(/(?<!\d)(\d{2,5}-(?:24|25|26))(?!\d)/)?.[1]||null;
 if(!code||/RESUMO|ACERTOS 2026/i.test(name))return {status:"IGNORAR_CARD_GERENCIAL"};
 const totalMatch=desc.match(/Total\s+(?:de\s+)?Custos\s*:\s*R\$\s*((?:\d{1,3}(?:\.\d{3})+|\d+),\d{2})/i);
 if(!totalMatch)return {caseNo:code,status:"SEM_TOTAL_REGISTRADO"};
 const declared=centavos(totalMatch[1]);
 const start=desc.search(/(?:^|\n)\s*Custos\s*(?:\n|:)/im);
 if(start<0)return {caseNo:code,declared,status:"SEM_SECAO_CUSTOS"};
 const stop=desc.search(/(?:^|\n)\s*(?:FECHAMENTO DA OBRA|Total\s+(?:de\s+)?Custos|Saldo\s*\/|Lucro Líquido|RATEIO DO LUCRO)/im);
 const chunk=desc.slice(start,stop>start?stop:undefined);
 const parsed=splitFinancialLines(chunk).map(line=>parseCostLine(line,defaultYear));
 const ok=parsed.filter(x=>x.kind==="COST"),unreadable=parsed.filter(x=>x.kind==="AMBIGUOUS_AMOUNT"||x.kind==="INVALID_DATE");
 const sum=ok.reduce((total,cost)=>total+cost.cents,0);
 if(!ok.length)return {caseNo:code,declared,status:"SEM_LINHAS_VALIDAS"};
 const phase=/PRIMEIRA PARTE|SEGUNDA PARTE|PRIMEIRA ETAPA|SEGUNDA ETAPA/i.test(desc);
 const cg=desc.match(/Capital de Giro\s*10%(?:\s*do Bruto|\s*=)?\s*(?:=)?\s*R\\$\s*((?:\d{1,3}(?:\.\d{3})+|\d+),\d{2})/i);
 const cgCents=cg?centavos(cg[1]):null;
 const legacyCG=declared>sum&&cgCents===declared-sum;
 const result={caseNo:code,declared,sum,difference:sum-declared,parsedCostCount:ok.length,unreadableCount:unreadable.length,
  status:unreadable.length?"LEITURA_INCOMPLETA":(sum===declared?"SOMA_TEXTUAL_COMPATIVEL":(phase?"MULTIPLAS_ETAPAS_A_VERIFICAR":(legacyCG?"REGRA_HISTORICA_CAPITAL_GIRO_A_VERIFICAR":"DIVERGENCIA_A_VERIFICAR")))};
 if(legacyCG)result.capitalLabelCents=cgCents;
 // Nunca corrigir fechamento automaticamente. Mesmo SOMA_TEXTUAL_COMPATIVEL não é conciliação Cora.
 return result;
}
module.exports={centavos,parseCostLine,analyzeCard};
