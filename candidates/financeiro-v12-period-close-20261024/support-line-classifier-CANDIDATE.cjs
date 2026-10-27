'use strict';
// CANDIDATE: referência determinística do classificador de staging.
// Este módulo NÃO está ligado ao importador atualmente em produção.
function classifyLine({lineKind,lineText,section='',earlierLines=[]}={}){
  const original=String(lineKind||'');
  const txt=String(lineText||'').trim();
  if(original!=='RATEIO_OR_ACERTO') return {kind:original,reason:'UNCHANGED'};
  if (/(?:apoio|di[aá]ria)/i.test(txt) && !/(?:rateio|lucro|retirada)/i.test(txt)) {
    return {kind:'COST_NOTE',reason:'SUPPORT_TEXT_UNVERIFIED_NO_NEW_COST'};
  }
  const inSupport=/^apoio\s*\/\s*di[aá]rias/i.test(String(section).trim());
  const recap=/^(?:éder|eder)\s*:\s*R\$\s*150,00$/i.test(txt);
  const repeated=inSupport && recap && earlierLines.some(x =>
    /(?:apoio\s+(?:éder|eder)|(?:éder|eder)\s+apoio)/i.test(String(x.lineText||'')) &&
    Number(x.amountCents)===15000);
  return repeated
    ? {kind:'COST_NOTE',reason:'SUPPORT_RECAP_UNVERIFIED_NO_NEW_COST'}
    : {kind:original,reason:'UNCHANGED'};
}
module.exports={classifyLine};
