const assert=require("node:assert/strict");const {validar,estado,chave,bankId,operationId}=require("./aprovisionamento-core.js");
const m={id:"tx-001",valor:-100};
assert.equal(estado(m,null),"PENDENTE");
assert.equal(chave(m),"cora:tx-001");
assert.equal(validar(m,{destino:"obra",obra:"818-26"}).valorCentavos,10000);
assert.equal(validar(m,{destino:"capital_giro"}).destino,"capital_giro");
assert.equal(validar(m,{destino:"rateio",partes:[{obra:"818-26",valor:60},{obra:"768-26",valor:40}]}).valorCentavos,10000);
assert.throws(()=>validar(m,{destino:"rateio",partes:[{obra:"818-26",valor:99}]}),/não fecha/);
assert.throws(()=>validar(m,{destino:"impostos"}),/Competência/);
assert.equal(estado(m,{chaveIdempotencia:chave(m),persistido:true,exigeTrello:true,trelloConfirmado:false}),"PENDENTE_REPROCESSAMENTO");
assert.equal(estado(m,{chaveIdempotencia:chave(m),persistido:true,exigeTrello:true,trelloConfirmado:true}),"APROVISIONADO");
assert.equal(validar({source_id:"real-789",amount_centavos:4501,direction:"debit"},{destino:"obra",obra:"818-26"}).valorCentavos,4501);
assert.throws(()=>validar({source_id:"real-789",amount_centavos:"errado"},{destino:"obra",obra:"818-26"}),/bancário inválido/);
assert.equal(bankId({source_id:"cora-real-123"}),"cora-real-123");
assert.equal(chave({source_id:"cora-real-123"}),"cora:cora-real-123");
Promise.all([operationId({source_id:"cora-real-123"}),operationId({source_id:"cora-real-123"}),operationId({source_id:"outro-456"})]).then(([id,a,b])=>{
 assert.match(id,/^CORA_[0-9a-f]{64}$/);assert.equal(id,a);assert.notEqual(id,b);
 console.log("Aprovisionamento: verificações de ID bancário e idempotência passaram");
}).catch(e=>{console.error(e);process.exitCode=1});
