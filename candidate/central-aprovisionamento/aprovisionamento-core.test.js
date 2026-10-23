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

/* Existing Trello reconciliation: date/amount/work verified, no writes, no second link. */
const backend=fs.readFileSync(path.resolve(__dirname,"backend-cr-cora-aprovisionamento-v12-candidate.ts"),"utf8");
const matchBlock=backend.slice(backend.indexOf("async function existingMatchCandidates("),backend.indexOf("async function existingLinksForCard("));
assert.ok(matchBlock.startsWith("async function existingMatchCandidates("));
const jsMatchBlock=matchBlock.replace("p:ReturnType<typeof clean>","p").replace("k:string","k")
 .replace("const matches:{match_key:string;line:string}[]=[];","const matches=[];");
const trelloMatchTest=new Function("legacy","withMarker","shortLink","card","amount","sha256",jsMatchBlock+";return existingMatchCandidates;")(
 async()=>({target:{case:"799-26",trello_url:"https://trello.com/c/CJ27HA7S"}}),
 p=>p,()=> "CJ27HA7S",
 async()=>({id:"6ad2ac38d0717aaacc307c3c",shortUrl:"https://trello.com/c/CJ27HA7S",desc: [
  "MOVIMENTAÇÕES FINANCEIRAS:","Valor Fechado: R$ 2.830,22","Custos:",
  "23/10 - R$100,00 Materiais - EXECUTIVE MOVEIS - Ref. PIX",
  "23/10 - R$150,00 Combustível - Ref. Cora",
  "23/10 - R$105,70 Alimentação - MEMPHIS - Ref. Cora",
  "22/10 - R$100,00 Materiais - MATERIAL ANTIGO - Ref. PIX",
  "Total Custos: R$ 455,70"].join("\n")}),
 v=>Math.round(Number(String(v).replace(/\./g,"").replace(",","."))*100),
 async x=>"hash_"+x.slice(-20)
);
Promise.all([
 trelloMatchTest({date:"2026-10-23",amount_cents:10000,direction:"OUT",operation_id:"CORA_"+"a".repeat(64)},"test"),
 trelloMatchTest({date:"2026-10-23",amount_cents:15000,direction:"OUT",operation_id:"CORA_"+"a".repeat(64)},"test"),
 trelloMatchTest({date:"2026-10-22",amount_cents:15000,direction:"OUT",operation_id:"CORA_"+"a".repeat(64)},"test")
]).then(([unique,alreadyCora,noMatch])=>{
 assert.equal(unique.matches.length,1,"Prior PIX matching date and amount should be found");
 assert.ok(unique.matches[0].line.includes("Ref. PIX"));
 assert.equal(alreadyCora.matches.length,0,"Existing Cora entry must never be reused");
 assert.equal(noMatch.matches.length,0,"Wrong-date cost must not match");
 assert.ok(backend.includes('p_payload:payload'),"Existing link must persist source, case and line in ledger");
 assert.ok(!backend.slice(backend.indexOf("async function reconcileExisting("),
  backend.indexOf("async function existingLinksForCardIdByOperation")).includes('manual-cora-commit'),
  "Existing reconciliation must not write to Trello");
 console.log("Existing Trello reconciliation: date/amount, source reuse, and no-write tests passed");
}).catch(e=>{console.error(e);process.exitCode=1});

/* Unified Cora operations regression: 2026 open-card rules, exact cent
 * allocation, receipt summary, bank-linked idempotency markers and manual UI. */
const workListCode=backend.slice(backend.indexOf("function allowedList("),backend.indexOf("async function liveCases("))
 .replace("direction:string,name:string","direction,name");
const listAllowed=new Function(workListCode+";return allowedList")();
assert.equal(listAllowed("IN","EM ANDAMENTO"),true);
assert.equal(listAllowed("IN","AGUARDANDO PAGAMENTO"),true);
assert.equal(listAllowed("IN","AG. ACERTO"),false);
assert.equal(listAllowed("IN","FINALIZADO"),false);
assert.equal(listAllowed("OUT","AG. ACERTO"),true);
const splitCode=backend.slice(backend.indexOf("function splitValidate("),backend.indexOf("async function bankAlreadyUsed("))
 .replace("raw:any,total:number","raw,total").replace("(r:any)","(r)");
const validateSplit=new Function(splitCode+";return splitValidate")();
const allocations=[{case:"799-26",cents:10000},{case:"800-26",cents:21025},{case:"801-26",cents:1775}];
assert.equal(validateSplit({allocations},32800).reduce((v,a)=>v+a.cents,0),32800);
assert.throws(()=>validateSplit({allocations},32801),/ALLOCATIONS_DO_NOT_SUM_TO_BANK_AMOUNT/);
assert.throws(()=>validateSplit({allocations:[allocations[0],allocations[0]]},20000),/DUPLICATED_CASE_IN_SPLIT/);
assert.throws(()=>validateSplit({allocations:[{case:"799-26",cents:32800}]},32800),/SPLIT_REQUIRES_2_TO_10_TARGETS/);
const centsCode=ui.slice(ui.indexOf("function moneyCentavos(v){"),ui.indexOf("function selectedBankPayload(){"));
const centsParser=new Function(centsCode+";return moneyCentavos")();
for(const [a,b] of [["1.250,50",125050],["3.000",300000],["109,90",10990],["55.000,30",5500030],["1,234",null]])
 assert.equal(centsParser(a),b,"Money parser failed "+a);
assert.ok(ui.includes('<option>Recebimento</option>'),"Receipt select option not installed");
assert.ok(ui.includes('id="cr-ap-kind"'),"Unified operations selector missing");
assert.ok(ui.includes('id="cr-ap-preview-parts"'),"Server-verified split preview missing");
const receiptCode=backend.slice(backend.indexOf("async function receiptPlan("),backend.indexOf("async function writeReceipt("))
 .replace("p:ReturnType<typeof clean>,verifiedCase?:{case:string;id:string;url:string;list:string;name:string}","p,verifiedCase");
const testReceipt=new Function("liveCases","shortLink","card","amount",receiptCode+";return receiptPlan")(
 async()=>[{case:"800-26",id:"0123456789abcdef01234567",url:"https://trello.com/c/ABCD1234",list:"EM ANDAMENTO",name:"800-26 TESTE"}],
 ()=> "ABCD1234",
 async()=>({id:"0123456789abcdef01234567",shortUrl:"https://trello.com/c/ABCD1234",
  desc:"MOVIMENTAÇÕES FINANCEIRAS:\nValor Fechado: R$ 2.000,00\nValor Recebido: R$ 0,00\nCustos:\n23/10 - R$100,00 Materiais - Ref. PIX"}),
 x=>{const cents=Math.round(Number(String(x).replace(/\./g,"").replace(",","."))*100);return cents>0?cents:null}
);
Promise.all([
 testReceipt({case:"800-26",date:"2026-10-23",direction:"IN",amount_cents:75000,operation_id:"CORA_"+"a".repeat(64),counterparty:"IMOBILIARIA"}),
 testReceipt({case:"800-26",date:"2026-10-23",direction:"IN",amount_cents:300000,operation_id:"CORA_"+"a".repeat(64)}).then(()=>null,e=>String(e.message))
]).then(([valid,excess])=>{
 assert.equal(valid.received_cents,75000);
 assert.ok(valid.updated.includes("Valor Recebido: R$ 750,00"));
 assert.ok(valid.updated.includes("23/10 - R$750,00 Recebido"));
 assert.ok(valid.updated.includes("CRV12OP_CORA_"));
 assert.equal(excess,"RECEIPT_EXCEEDS_CONTRACT_AMOUNT");
 assert.ok(backend.includes('if(p.direction==="IN"&&(action==="preview"||action==="commit"))'));
 assert.ok(backend.includes("CAPITAL_REVIEW_REQUIRED")&&backend.includes("PARTIAL_MULTI_REVIEW_REQUIRED"));
 console.log("Unified operations: split, dates, receipt totals and revision gates passed");
}).catch(e=>{console.error(e);process.exitCode=1});

/* Receipt already paid in AG. ACERTO: reconcile only, no Trello mutation. */
const paidMatch=backend.slice(backend.indexOf("async function existingReceiptCandidate("),
 backend.indexOf("async function existingReceiptFlow("))
 .replace("p:ReturnType<typeof clean>,k:string","p,k").replace(/\((\w+):any\)/g,"($1)");
assert.ok(paidMatch.startsWith("async function existingReceiptCandidate("));
const testPaid=(list,linked=[])=>new Function(
 "trelloApiRead","BOARD_2026","caseInName","allowedList","shortLink","card","amount","existingLinksForCard","sha256",
 paidMatch+";return existingReceiptCandidate;")(
 async path=>path.includes("/lists?")?[{id:"6800f3a6b0c58c0518f249b5",name:list}]:[
  {id:"6ad2ac38d0717aaacc307c3c",idList:"6800f3a6b0c58c0518f249b5",
   name:"✅ (799-26) R$ 2.830,22 Orçamento",shortUrl:"https://trello.com/c/CJ27HA7S"}],
 "6974b24c16d17ca76351a950",
 n=>{const m=String(n).match(/\((\d+)-26\)/);return m?m[1]+"-26":null},
 (direction,name)=>/EM ANDAMENTO|AGUARDANDO PAGAMENTO/.test(name),
 url=>(String(url).match(/trello\.com\/c\/([a-zA-Z0-9]{6,12})/)||[])[1]||null,
 async()=>({id:"6ad2ac38d0717aaacc307c3c",idList:"6800f3a6b0c58c0518f249b5",
  desc:"MOVIMENTAÇOES FINANCEIRAS:\nValor Fechado: R$ 2.830,22\nCustos:\n23/10 - R$ 150,00 Combustível - Ref. Cora",
  shortUrl:"https://trello.com/c/CJ27HA7S"}),
 v=>{const amount=Math.round(Number(String(v).replace(/\./g,"").replace(",","."))*100);return amount>0?amount:null},
 async()=>linked,
 async value=>"hash_"+String(value).length
);
const paidPayload=cents=>({operation_id:"CORA_"+"f".repeat(64),
 case:"799-26",direction:"IN",date:"2026-10-23",amount_cents:cents});
Promise.all([
 testPaid("AG. ACERTO")({...paidPayload(283022)},"test"),
 testPaid("AG. ACERTO")({...paidPayload(200000)},"test").then(()=>null,e=>e.message),
 testPaid("AGUARDANDO PAGAMENTO")({...paidPayload(283022)},"test").then(()=>null,e=>e.message),
 testPaid("AG. ACERTO",[{status:"COMMITTED",payload:{
   case:"799-26",direction:"IN",reconciliation_kind:"RECEIPT_TRELLO"}}])({...paidPayload(283022)},"test").then(()=>null,e=>e.message)
]).then(([match,wrongAmount,unpaid,linked])=>{
 assert.equal(match.amount_cents,283022);
 assert.equal(match.target.list,"AG. ACERTO");
 assert.equal(wrongAmount,"RECEIPT_AMOUNT_DIFFERS_FROM_PREVIOUSLY_PAID_WORK");
 assert.equal(unpaid,"RECEIPT_NOT_ALREADY_PAID");
 assert.equal(linked,"RECEIPT_ALREADY_LINKED_TO_THIS_WORK");
 const block=backend.slice(backend.indexOf("async function existingReceiptFlow("),
  backend.indexOf("async function singleReceipt("));
 assert.ok(block.includes("cr_finance_v12_claim")&&block.includes("cr_finance_v12_finish"));
 assert.ok(!block.includes("writeReceipt("));
 assert.ok(ui.includes('id="cr-ap-receipt-agree"')&&ui.includes('"receipt-existing-confirm",receiptCheck.payload'));
 console.log("Receipt AG. ACERTO: explicit confirmation, no Trello writes, status and mismatch tests passed");
}).catch(e=>{console.error(e);process.exitCode=1});


/* Receipt ledger-only end-to-end stub: preview/commit must NEVER call Trello writer. */
const receiptFlow=backend.slice(backend.indexOf("async function existingReceiptFlow("),
 backend.indexOf("async function singleReceipt("))
 .replace("action:string,p:ReturnType<typeof clean>,raw:any,k:string","action,p,raw,k")
 .replaceAll("(e as Error)","e");
const receiptCalls=[];
const receiptFn=new Function("bankAlreadyUsed","existingReceiptCandidate","reply","rpc","fingerprint","card",
 receiptFlow+";return existingReceiptFlow")(
 async()=>null,
 async p=>({fingerprint:"receipt-checkpoint-123",card:{id:"0123456789abcdef01234567",idList:"ag_acerto",desc:"unchanged"},
  short:"CJ27HA7S",target:{case:p.case,trello_url:"https://trello.com/c/CJ27HA7S"}}),
 (data,status)=>({body:data,httpStatus:status||200}),
 async(name,args)=>{receiptCalls.push(name);return name==="cr_finance_v12_claim"?{ok:true,claimed:true,status:"PENDING"}:{ok:true}},
 async()=> "bank-fingerprint",async()=>({id:"0123456789abcdef01234567",idList:"ag_acerto",desc:"unchanged"})
);
const receiptBank={operation_id:"CORA_"+"c".repeat(64),case:"799-26",direction:"IN",
 date:"2026-10-23",amount_cents:283022,reference:"ent_existing_receipt"};
Promise.resolve().then(async()=>{
 const preview=await receiptFn("receipt-existing-preview",receiptBank,{},"test");
 assert.equal(preview.body.preview,true);
 assert.equal(preview.body.requires_explicit_confirmation,true);
 assert.equal(preview.body.trello_write,false);
 assert.equal(receiptCalls.length,0,"Preview must not claim or write anything");
 const ok=await receiptFn("receipt-existing-confirm",receiptBank,{expected_fingerprint:"receipt-checkpoint-123"},"test");
 assert.equal(ok.body.committed,true);
 assert.equal(ok.body.trello_write,false);
 assert.deepEqual(receiptCalls,["cr_finance_v12_claim","cr_finance_v12_finish"]);
 console.log("Receipt ledger-only flow: preview safe, explicit confirm, no Trello writer passed");
}).catch(e=>{console.error(e);process.exitCode=1});
