/* CONSTRU-REI V12 — funções puras de conferência, SEM acesso a produção. */
export const PERCENTUAIS = Object.freeze({fabricio:20,eder:28,rogerio:28,gabrielly:14,capitalGiro:10});
export function centavos(valor){
  if(typeof valor!=="number"||!Number.isFinite(valor))throw new Error("Valor inválido");
  const c=Math.round(valor*100);
  if(!Number.isSafeInteger(c))throw new Error("Fora da faixa segura");
  return c;
}
export function rateioCanonico(lucroCentavos,{historico=false}={}){
  if(historico)throw new Error("Acerto histórico exige regra vigente à época; não recalcular.");
  if(!Number.isSafeInteger(lucroCentavos)||lucroCentavos<0)throw new Error("Lucro inválido");
  const nomes=Object.keys(PERCENTUAIS);
  const base=nomes.map(nome=>({nome,p: PERCENTUAIS[nome], exato:lucroCentavos*PERCENTUAIS[nome]/100}));
  let sobra=lucroCentavos;
  for(const o of base){o.c=Math.floor(o.exato);sobra-=o.c}
  base.sort((a,b)=>(b.exato-b.c)-(a.exato-a.c)||nomes.indexOf(a.nome)-nomes.indexOf(b.nome));
  for(let i=0;i<sobra;i++)base[i].c++;
  return Object.fromEntries(base.map(o=>[o.nome,o.c]));
}
export function conciliarValores({receitaCentavos,custoCentavos}){
  if(!Number.isSafeInteger(receitaCentavos)||!Number.isSafeInteger(custoCentavos)||receitaCentavos<0||custoCentavos<0)throw new Error("Valores inválidos");
  const lucro=receitaCentavos-custoCentavos;
  return {lucroCentavos:lucro,margemPercentual:receitaCentavos?Math.round(lucro/receitaCentavos*10000)/100:null};
}
export function deduplicarMovimentos(movimentos){
  const vistos=new Set(),unicos=[],rejeitados=[],semId=[];
  for(const m of movimentos){
    const id=String(m?.sourceId??"").trim();
    if(!id){semId.push(m);continue}
    const key=String(m.origem??"")+"|"+id;
    if(vistos.has(key))rejeitados.push(m);
    else{vistos.add(key);unicos.push(m)}
  }
  return {unicos,rejeitados,semId};
}
export function rotuloAcerto({calculado=false,registrado=false,pago=false}={}){
  if(pago&&!registrado)return "DIVERGENTE";
  if(pago)return "PAGO_REGISTRADO";
  if(registrado)return "REGISTRADO_NAO_COMPROVADO";
  return calculado?"CALCULADO_NAO_PAGO":"NAO_APURADO";
}

/**
 * Reconcilia a origem do saldo bancário sem confundir resumo mensal com saldo atual.
 * Valores são sempre em centavos; um zero em resumo mensal NÃO é saldo oficial.
 */
export function classificarSaldoCora({snapshot=null,monthlySummary=null,agora=new Date()}={}){
  const valor=snapshot?.balance_centavos;
  const data=snapshot?.updated_at;
  const origem=String(snapshot?.source??"");
  const timestamp=typeof data==="string"?Date.parse(data):NaN;
  const idade=Number.isFinite(timestamp)?new Date(agora).getTime()-timestamp:NaN;
  if(!Number.isSafeInteger(valor)||valor<0||!Number.isFinite(idade)||idade<0||origem!=="CORA_OFFICIAL_API"){
    return {status:"NAO_COMPROVADO",saldoCentavos:null,atualizadoEm:null,
      aviso:"Saldo bancário oficial indisponível; resumo mensal não substitui saldo atual."};
  }
  return {status:idade<=12*60*1000?"CONFIRMADO":"DESATUALIZADO",
    saldoCentavos:valor,atualizadoEm:data,
    aviso:idade<=12*60*1000?null:"Último saldo oficial em cache; consulta bancária atrasada."};
}
/** Rotula competências sem converter saldo ausente em saldo zero. */
export function classificarCompetenciaCora({statusImportacao,origem,saldoInicial,saldoFinal,divergenciaCentavos=null}={}){
  if(statusImportacao!=="complete")return "PARCIAL";
  if(divergenciaCentavos!==null&&divergenciaCentavos!==0)return "DIVERGENTE";
  if(!Number.isSafeInteger(saldoInicial)||!Number.isSafeInteger(saldoFinal))return "SEM_COMPROVACAO";
  if(origem!=="CORA_OFFICIAL_AGGREGATIONS")return "SEM_COMPROVACAO";
  return "CONCILIADA";
}

/**
 * Verifica qualidade contábil da margem consolidada (soma de receitas e custos,
 * NUNCA a média simples das margens das obras).
 * A aprovação matemática NÃO comprova pagamentos, impostos ou recebimentos:
 * por isso o estado resultante jamais é denominado "LUCRO_REAL_HOMOLOGADO".
 */
export function verificarMargemConsolidada({receitaCentavos,custoCentavos,lucroCentavos,coberturaPercentual,pendencias=0,historicoNaoConciliado=false}={}){
  const integers=[receitaCentavos,custoCentavos,lucroCentavos];
  if(integers.some(v=>!Number.isSafeInteger(v))||receitaCentavos<=0||custoCentavos<0){
    return {status:"BASE_INCOMPLETA",margemPercentual:null,diferencaCentavos:null};
  }
  const diferenca=receitaCentavos-custoCentavos-lucroCentavos;
  if(Math.abs(diferenca)>1){
    return {status:"BASES_DIVERGENTES",margemPercentual:null,diferencaCentavos:diferenca};
  }
  if(historicoNaoConciliado||!Number.isFinite(coberturaPercentual)||coberturaPercentual<99.999||!Number.isSafeInteger(pendencias)||pendencias>0){
    return {status:"CONCILIACAO_PENDENTE",margemPercentual:null,diferencaCentavos:diferenca};
  }
  return {status:"ARITMETICA_CONSISTENTE_NAO_HOMOLOGADA",margemPercentual:Math.round(lucroCentavos/receitaCentavos*10000)/100,diferencaCentavos:diferenca};
}


/**
 * Apura apenas obras com trio receita/custo/lucro aritmeticamente verificável,
 * mantendo fora do subtotal entradas incompletas e casos duplicados.
 * Não é comprovante de recebimento/pagamento Cora.
 */
export function apurarObrasComparaveis(rows=[]){
 if(!Array.isArray(rows))throw Error("Linhas inválidas");
 const groups=new Map(),excluidas=[];
 for(const r of rows){
  const key=String(r?.case??r?.case_no??"").trim();
  if(!key){excluidas.push({case:null,motivo:"SEM_IDENTIFICADOR"});continue}
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(r);
 }
 let receitaCentavos=0,custoCentavos=0,lucroCentavos=0,elegiveis=0;
 for(const [key,g] of groups){
  if(g.length!==1){excluidas.push({case:key,motivo:"CASO_REPETIDO"});continue}
  const r=g[0],a=[r?.gross_cents,r?.cost_cents,r?.profit_cents];
  const v=a.map(x=>typeof x==="number"&&Number.isSafeInteger(x)?x:null);
  if(v.some(x=>x===null)||v[0]<=0||v[1]<0||Math.abs(v[0]-v[1]-v[2])>1){
   excluidas.push({case:key,motivo:"BASE_INCOMPLETA_OU_DIVERGENTE"});continue
  }
  elegiveis++;receitaCentavos+=v[0];custoCentavos+=v[1];lucroCentavos+=v[2];
 }
 const total=groups.size+excluidas.filter(x=>x.motivo==="SEM_IDENTIFICADOR").length;
 return {total,elegiveis,excluidas,receitaCentavos,custoCentavos,lucroCentavos,
  margemPercentual:receitaCentavos>0?Math.round(lucroCentavos/receitaCentavos*10000)/100:null,
  status:elegiveis===0?"SEM_BASE_COMPARAVEL":excluidas.length>0?"SUBCONJUNTO_PARCIAL":"SUBCONJUNTO_CONSISTENTE"};
}


/**
 * Cora 2023→hoje: reconciliação aritmética dos movimentos por COMPETÊNCIA UTC,
 * baseada em extratos integralmente paginados e âncoras oficiais do banco.
 * NÃO converte saldos derivados em saldos oficiais de cada mês.
 * Não escreve nem altera dados bancários, Trello ou obras.
 */
export function conciliarSerieCora(months,bankSnapshot=null){
 if(!Array.isArray(months)||!months.length)return {status:"SEM_DADOS",periodos:0,rows:[]};
 const rows=[...months].sort((a,b)=>String(a.period_start).localeCompare(String(b.period_start)));
 const safe=n=>n!==null&&n!==undefined&&n!==""&&typeof n!=="boolean"&&Number.isSafeInteger(Number(n))?Number(n):null;
 const earliest=rows[0],open=safe(earliest.start_balance_centavos);
 const anchored=earliest.source==="CORA_OFFICIAL_AGGREGATIONS"&&open!==null;
 if(!anchored)return {status:"SEM_ANCORA_INICIAL",periodos:rows.length,rows:[]};
 let running=open,previous=null,flowIssues=0,checkIssues=0,legacyIssues=0,verified=0,derived=0,notVerified=0;
 const output=[];
 for(const m of rows){
  const date=String(m.period_start||"");
  if(!/^20\d{2}-\d{2}-01$/.test(date))return {status:"PERIODO_INVALIDO",periodos:rows.length,rows:output};
  if(previous){
   const next=new Date(previous+"T00:00:00.000Z");next.setUTCMonth(next.getUTCMonth()+1);
   if(next.toISOString().slice(0,10)!==date)return {status:"LACUNA_MENSAL",periodos:rows.length,rows:output};
  }
  const c=safe(m.credit_centavos),d=safe(m.debit_centavos),oc=safe(m.observed_credit_centavos),od=safe(m.observed_debit_centavos);
  if(c===null||d===null||oc===null||od===null||c<0||d<0||m.status!=="complete"||m.last_error!=null)
   return {status:"IMPORTACAO_INCOMPLETA",periodos:rows.length,rows:output};
  const matching=c===oc&&d===od;if(!matching)flowIssues++;
  const begin=running;running+=c-d;
  if(!Number.isSafeInteger(running))return {status:"VALOR_INSEGURO",periodos:rows.length,rows:output};
  const official=m.source==="CORA_OFFICIAL_AGGREGATIONS";
  const officialMatch=official&&safe(m.start_balance_centavos)===begin&&safe(m.end_balance_centavos)===running;
  if(official){verified++;if(!officialMatch)checkIssues++}
  else{derived++;const bs=safe(m.start_balance_centavos),es=safe(m.end_balance_centavos);
   if(bs!==null&&es!==null&&(bs!==0||es!==0)&&(bs!==begin||es!==running))legacyIssues++;
  }
  output.push({periodo:date,aberturaCentavos:begin,creditoCentavos:c,debitoCentavos:d,fechamentoCentavos:running,
   origemSaldo:official?"OFICIAL_CORA":"DERIVADO_POR_EXTRATO",fluxoConfere:matching,ancoraOficialConfere:official?officialMatch:null,
   legadoComDiferenca:!official&&(safe(m.start_balance_centavos)!==null||safe(m.end_balance_centavos)!==null)&&
     !(safe(m.start_balance_centavos)===0&&safe(m.end_balance_centavos)===0)&&
     (safe(m.start_balance_centavos)!==begin||safe(m.end_balance_centavos)!==running)});
  previous=date;
 }
 const bank=safe(bankSnapshot?.amount_centavos??bankSnapshot?.balance_centavos);
 const officialSource=bankSnapshot?.source==null||bankSnapshot.source==="CORA_OFFICIAL_API";
 const finalMatch=bank!==null&&officialSource&&bank===running;
 const status=flowIssues||checkIssues||!finalMatch?"DIVERGENCIA_PENDENTE":"CONCILIACAO_ARITMETICA_CONFIRMADA";
 return {status,periodos:rows.length,fluxosConferidos:rows.length-flowIssues,saldosOficiaisConferidos:verified-checkIssues,
 saldosDerivados:derived,legadosDivergentes:legacyIssues,aberturaCentavos:open,fechamentoCentavos:running,
 saldoBancarioCentavos:bank,diferencaFinalCentavos:bank===null?null:running-bank,rows:output};
}
