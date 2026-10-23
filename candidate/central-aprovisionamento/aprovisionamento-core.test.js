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

// Regression from Android test 23/10/2026: valid 799-26 was rejected due to
// mistakenly escaped \\d inside a JavaScript regex literal in the UI.
const fs=require("node:fs");
const path=require("node:path");
const ui=fs.readFileSync(path.resolve(__dirname,"../../candidates/central-operacoes-unificada-v12-20261023/index.html"),"utf8");
const match=ui.match(/const obra=caseField\.value\.trim\(\);if\(!(\S+)\.test\(obra\)\)/);
assert.ok(match,"Aprovisionamento: case validation not found in candidate UI");
const validCase=new Function("obra","return "+match[1]+".test(obra)");
for(const work of ["799-26","818-26","1-26","12345-26"])assert.equal(validCase(work),true,"Valid case was rejected: "+work);
for(const work of ["79926","799-2","ABC-26","799-260","799-26e"])assert.equal(validCase(work),false,"Invalid case was accepted: "+work);
console.log("Aprovisionamento: validacao de obra no formulario passou");

/* Regression 23/10: after a Cora COMMITTED movement, the next distinct bank
 * cost must not inherit the prior reference/operation. Cora NF must preserve
 * the actual debited amount; only non-bank NF uses estimated 8.5% calculation. */
const input=ui.slice(ui.indexOf("function manualNfUpdate(){"),ui.indexOf("function manualPayload(){"));
assert.ok(input.startsWith("function manualNfUpdate(){"),"NF function not found");
const v=(bankMode,category)=>{
 const S={manualBankMovement:bankMode?{id:"ent_new",amount:15000}:null,manualNf:null};
 const nodes={mc_category:{value:category},mc_dir:{value:"OUT"},mc_amount:{value:"150,00",readOnly:false},mc_nf_note:{style:{display:"none"},textContent:""}};
 const document={getElementById:id=>nodes[id]};
 const manualNfInvalidate=()=>{};
 const fn=new Function("S","document","manualNfInvalidate","manualNfAmount","brl",input+";return manualNfUpdate;")(S,document,manualNfInvalidate,()=>({tax:850,gross:10000}),v=>String(v));
 fn();return {amount:nodes.mc_amount.value,readOnly:nodes.mc_amount.readOnly,nf:S.manualNf,note:nodes.mc_nf_note.textContent};
};
assert.equal(v(true,"NF").amount,"150,00");
assert.equal(v(true,"NF").readOnly,true);
assert.equal(v(true,"Materiais").readOnly,true);
assert.equal(v(false,"NF").amount,"8,50");
assert.equal(v(false,"Materiais").readOnly,false);
assert.ok(ui.includes("manualClear();S.manualOp=opId;S.manualBankMovement="),"New bank transaction must clear previous operation first");
assert.ok(ui.includes("if(!S.manualBankMovement&&!S.manualNf)"),"Bank NF preview must skip estimate requirement");
console.log("Aprovisionamento: new operation reset and bank-NF amount guards passed");
