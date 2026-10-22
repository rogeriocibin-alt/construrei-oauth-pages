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
