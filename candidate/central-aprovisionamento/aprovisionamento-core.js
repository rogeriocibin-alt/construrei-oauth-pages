/* CONSTRU-REI — motor puro de aprovisionamento, candidato, sem escrita bancária/Trello. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.CRAprovisionamento=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const DESTINOS=new Set(["obra","capital_giro","despesas_gerais","impostos","transferencia_interna","estorno","rateio"]);
function centavos(valor){if(typeof valor!=="number"||!Number.isFinite(valor))throw Error("Valor inválido");return Math.round(valor*100);}
function bankId(m){const id=String(m?.source_id??m?.id??m?.transaction_id??m?.external_id??"").trim();if(!id)throw Error("Identificador bancário obrigatório");return id;}
function chave(m){return "cora:"+bankId(m);}
async function operationId(m){const raw=new TextEncoder().encode("CR-CORA-APROVISIONAMENTO-V1:"+bankId(m));const digest=await globalThis.crypto.subtle.digest("SHA-256",raw);return "CORA_"+Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,"0")).join("");}
function validar(m,operacao){
 const id=chave(m), destino=operacao?.destino;
 const bankCents=m?.amount_centavos;
 const total=bankCents==null?Math.abs(centavos(m.valor)):(Number.isSafeInteger(Number(bankCents))&&Number(bankCents)>0?Number(bankCents):NaN);
 if(!Number.isSafeInteger(total))throw Error("Valor bancário inválido");
 if(!total)throw Error("Movimentação sem valor");
 if(!DESTINOS.has(destino))throw Error("Destino inválido");
 if(destino==="obra"&&!/^\d{1,5}-\d{2}$/.test(operacao.obra||""))throw Error("Obra inválida");
 if(destino==="impostos"&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(operacao.competencia||""))throw Error("Competência obrigatória");
 if(destino==="rateio"){
  if(!Array.isArray(operacao.partes)||!operacao.partes.length)throw Error("Rateio vazio");
  const obras=new Set();
  const soma=operacao.partes.reduce((s,p)=>{if(!/^\d{1,5}-\d{2}$/.test(p.obra||"")||obras.has(p.obra))throw Error("Obra duplicada ou inválida");obras.add(p.obra);const c=centavos(p.valor);if(c<=0)throw Error("Parcela inválida");return s+c;},0);
  if(soma!==total)throw Error("Rateio não fecha com extrato");
 }
 return {id,valorCentavos:total,destino,chaveIdempotencia:id,estado:"PRONTO_PARA_CONFIRMACAO"};
}
function estado(m,registro){const id=chave(m);if(!registro)return "PENDENTE";if(registro.chaveIdempotencia!==id)throw Error("Conciliação inconsistente");return registro.persistido&&(!registro.exigeTrello||registro.trelloConfirmado)?"APROVISIONADO":"PENDENTE_REPROCESSAMENTO";}
return Object.freeze({validar,estado,chave,bankId,operationId,centavos});
});
