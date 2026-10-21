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
