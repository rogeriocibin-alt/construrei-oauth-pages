"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const {parseLine,splitFinancialLines,referencesOtherWork,hasExactBankId,reconcile}=require("./finance-v12-reconcile-readonly.cjs");
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

test("PIX colado a datas preserva três despesas distintas — obra 735-26",()=>{
 const desc="17/10 - R$49,26 Combustível - Ref. PIX17/10 - R$87,20 Alimentação - Ref. PIX17/10 - R$55,64 Materiais - Ref. PIX";
 const lines=splitFinancialLines(desc);
 const values=lines.map(line=>parseLine(line,2026)).filter(Boolean).map(x=>x.cents);
 assert.deepEqual(values,[4926,8720,5564]);
 assert.equal(values.reduce((a,b)=>a+b,0),19210);
});
test("Despesa histórica com prefixo monetário duplicado não desaparece",()=>{
 assert.deepEqual(parseLine("24/08 - R$R$850,00 OSIEL",2026),{day:"2026-08-24",cents:85000});
});
test("Reconciliador mantém bloqueio de confirmação com PIX colado sem comprovante",()=>{
 const match=[{sourceId:"b-735",caseCodes:["735-26"],day:"2026-10-17",cents:8720,direction:"debit"}];
 const cards=[{id:"c-735",name:"Obra 735-26",desc:"17/10 - R$49,26 - Ref. PIX17/10 - R$87,20 - Ref. PIX17/10 - R$55,64"}];
 const r=reconcile(match,cards,2026);
 assert.equal(r.counts.EVIDENCIA_BILATERAL_COMPATIVEL,1);
 assert.equal(r.counts.CONFIRMADO_COM_EVIDENCIA,undefined);
});

test("Não conciliar despesa referenciada a outra obra, mesmo coincidindo data e centavos",()=>{
 const candidate=[{sourceId:"ent_768",caseCodes:["768-26"],day:"2026-10-15",cents:15000,direction:"debit"}];
 const cards=[{id:"card-768",name:"768-26",desc:"15/10 - R$150,00 Apoio - REF OBRA 748-26"}];
 const r=reconcile(candidate,cards,2026);
 assert.equal(r.counts.REFERENCIA_CRUZADA_A_VERIFICAR,1);
 assert.equal(r.uniqueMatchedBank,0);
 assert.equal(referencesOtherWork("15/10 - R$150,00 REF OBRA 768-26","768-26"),false);
});
test("Referência bancária deve ser token exato: prefixo não é prova",()=>{
 assert.equal(hasExactBankId("07/10 - 100,00 Ref ent_123Z","ent_123"),false);
 assert.equal(hasExactBankId("07/10 - 100,00 Ref ent_123","ent_123"),true);
 const r=reconcile([{sourceId:"ent_123",caseCodes:["775-26"],day:"2026-10-07",cents:10000,direction:"debit",receiptVerified:true}],
 [{id:"card",name:"Obra 775-26",desc:"07/10 - R$100,00 Ref ent_123Z"}],2026);
 assert.equal(r.counts.CONFIRMADO_COM_EVIDENCIA,undefined);
 assert.equal(r.counts.EVIDENCIA_BILATERAL_COMPATIVEL,1);
});
