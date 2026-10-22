"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const {parseLine,reconcile}=require("./finance-v12-reconcile-readonly.cjs");
const b=[{sourceId:"bank-a",caseCodes:["775-26"],day:"2026-10-07",cents:178522,direction:"debit"},
 {sourceId:"bank-b",caseCodes:["775-26"],day:"2026-10-08",cents:10500,direction:"debit"}];
const c={id:"card-775",name:"Orçamento 775-26",desc:"07/10 - R$1.785,22 Material Piso\n08/10 - 105,00 Almoço"};
test("Formatos históricos e novo formato",()=>{
 assert.deepEqual(parseLine("07/10 - R$1.785,22",2026),{day:"2026-10-07",cents:178522});
 assert.deepEqual(parseLine("08/10 - 105,00",2026),{day:"2026-10-08",cents:10500});
 assert.equal(parseLine("31/02 - 10,00",2026),null);
});
test("Duas evidências compatíveis, sem confirmação automática",()=>{
 const r=reconcile(b,[c],2026);assert.equal(r.counts.EVIDENCIA_BILATERAL_COMPATIVEL,2);
 assert.equal(r.counts.CONFIRMADO_COM_EVIDENCIA,undefined);
});
test("Mesmo banco em dois cards impede confirmação",()=>{
 const x={id:"card-another",name:"775-26",desc:"07/10 - 1785,22 despesa"};
 const r=reconcile(b,[c,x],2026);assert.equal(r.counts.DUPLICIDADE_PARA_REVISAO,2);
});
test("Dois bancos na mesma chave impedem vinculação automática",()=>{
 const r=reconcile([...b,{...b[0],sourceId:"bank-2"}],[c],2026);
 assert.equal(r.counts.BANCO_AMBIGUO,1);
});
test("Multiobra nunca pode ser integralmente atribuída a obra única",()=>{
 const r=reconcile([...b,{sourceId:"multi",caseCodes:["775-26","726-26"],day:"2026-10-07",cents:178522,direction:"debit"}],[c],2026);
 assert.equal(r.uniqueMatchedBank,2);
});
test("IDs duplicados impedem contagem",()=>{
 assert.throws(()=>reconcile([...b,b[0]],[c],2026));
 assert.throws(()=>reconcile(b,[c,c],2026));
});
test("Confirmação requer ID bancário na linha e comprovante verificado",()=>{
 const v={...b[0],receiptVerified:true};
 const r=reconcile([v],[{id:"proof",name:"Obra 775-26",desc:"07/10 - 1785,22 referência bank-a verificada"}],2026);
 assert.equal(r.counts.CONFIRMADO_COM_EVIDENCIA,1);
});
test("Outra obra com mesmo valor continua sem vínculo",()=>{
 const r=reconcile(b,[{id:"not-a",name:"Obra 799-26",desc:"07/10 - 1785,22"}],2026);
 assert.equal(r.counts.SEM_VINCULO,1);
});
