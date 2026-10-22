"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const {centavos,parseCostLine,analyzeCard}=require("./finance-v12-cost-integrity-readonly.cjs");
test("Centavos exatos e formato brasileiro",()=>{
 assert.equal(centavos("1.785,22"),178522);
 assert.equal(centavos("850,00"),85000);
 assert.equal(centavos("R$850,00"),null);
});
test("Formatos de extrato histórico sem alterar fonte",()=>{
 const inputs=["24/08 - R$R$850,00 OSIEL","14/09 - R$ NF131,57 NF","17/03 - R$NF404,31 sobre o Bruto","15/08 - JR 450,00","25/05 - R$150 Éder Apoio","16/04 - R$65,64Taxa Maquininha"];
 assert.deepEqual(inputs.map(x=>parseCostLine(x,2026).cents),[85000,13157,40431,45000,15000,6564]);
});
test("Valores ambíguos ou datas impossíveis bloqueados",()=>{
 assert.equal(parseCostLine("31/02 - R$100,00",2026).kind,"INVALID_DATE");
 assert.equal(parseCostLine("07/10 - R$100,00 mais R$50,00",2026).kind,"AMBIGUOUS_AMOUNT");
});
test("735-26: leitura dos PIX colados detecta R$142,84 de diferença",()=>{
 const desc="Custos\n17/10 - R$49,26 Combustível Ref. PIX17/10 - R$87,20 Alimentação Ref. PIX17/10 - R$55,64 Materiais Ref. PIX\n17/10 - R$90,00\n17/10 - R$100,00\n17/10 - R$150,00\n17/10 - R$150,00\n17/10 - R$175,15\nFECHAMENTO DA OBRA\nTotal de Custos: R$714,41";
 const r=analyzeCard({name:"Orçamento 735-26",desc});
 assert.equal(r.status,"DIVERGENCIA_A_VERIFICAR");
 assert.equal(r.parsedCostCount,8);
 assert.equal(r.sum,85725);
 assert.equal(r.difference,14284);
});
test("607-26: valor de prestador antes do preço confirma soma do cartão",()=>{
 const desc="Custos:\n15/08 - R$68,00 NF\n15/08 - JR 450,00\nTotal Custos: R$518,00";
 const r=analyzeCard({name:"Orçamento 607-26",desc});
 assert.equal(r.status,"SOMA_TEXTUAL_COMPATIVEL");
 assert.equal(r.difference,0);
});
test("694-26: duas fases nunca promovidas a erro contábil confirmado",()=>{
 const desc="Custos:\n16/10 - R$150,00\nPRIMEIRA PARTE EXECUTADA E ACERTADA\n21/09 - R$104,77\nTotal de Custos: R$104,77";
 const r=analyzeCard({name:"Obra 694-26",desc});
 assert.equal(r.status,"MULTIPLAS_ETAPAS_A_VERIFICAR");
});
test("Card sem total ou com linhas ilegíveis permanece pendente",()=>{
 assert.equal(analyzeCard({name:"Obra 775-26",desc:"Custos\n07/10 - R$105,00"}).status,"SEM_TOTAL_REGISTRADO");
 assert.equal(analyzeCard({name:"Obra 775-26",desc:"Custos\n07/10 - R$105,00 + R$50,00\nTotal Custos: R$155,00"}).status,"SEM_LINHAS_VALIDAS");
});
test("Nunca deduzir margem, confirmar Cora ou inserir lançamento",()=>{
 const r=analyzeCard({name:"Obra 799-26",desc:"Custos:\n22/10 - R$100,70\nTotal Custos: R$100,70"});
 assert.equal(r.status,"SOMA_TEXTUAL_COMPATIVEL");
 assert.equal("confirmed" in r,false);
 assert.equal("margin" in r,false);
});
