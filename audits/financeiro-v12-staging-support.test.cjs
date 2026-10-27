'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../candidates/financeiro-v12-period-close-20261024');
const sql=fs.readFileSync(path.join(dir,'staging-support-classification-CANDIDATE.sql'),'utf8');
const {classifyLine}=require(path.join(dir,'support-line-classifier-CANDIDATE.cjs'));
function apply(s){return classifyLine({lineKind:'RATEIO_OR_ACERTO',...s});}
test('apoio já incluso nos custos não é rateio de lucro',()=>{
 assert.equal(apply({lineText:'05/10 - R$150,00 Apoio Eder'}).reason,'SUPPORT_TEXT_UNVERIFIED_NO_NEW_COST');
 assert.equal(apply({lineText:'14/09 - R$150,00 Apoio Éder'}).kind,'COST_NOTE');
});
test('diárias João Victor e Fabrício nunca são rateio pelo simples nome',()=>{
 assert.equal(apply({lineText:'15/10 R$150,00 Diária João Victor'}).kind,'COST_NOTE');
 assert.equal(apply({lineText:'Apoio Fabrício R$150,00'}).kind,'COST_NOTE');
});
test('linha recap de Éder em 727-26 exige seção e linha original de apoio',()=>{
 const prior=[{lineText:'05/10 - R$150,00 Apoio Eder',amountCents:15000}];
 const r=apply({lineText:'Éder: R$ 150,00',section:'APOIO / DIÁRIAS',earlierLines:prior});
 assert.equal(r.reason,'SUPPORT_RECAP_UNVERIFIED_NO_NEW_COST');
 assert.equal(apply({lineText:'Éder: R$ 150,00',section:'RATEIO DO LUCRO',earlierLines:prior}).kind,'RATEIO_OR_ACERTO');
 assert.equal(apply({lineText:'Éder: R$ 150,00',section:'APOIO / DIÁRIAS',earlierLines:[]}).kind,'RATEIO_OR_ACERTO');
});
test('rateios e retiradas verdadeiros continuam separados',()=>{
 for(const t of ['Éder (28%): R$ 189,46','✅ Capital de Giro 10% sobre o lucro: R$ 40,71',
 'Rateio Éder 28% com apoio','Retirada Éder R$ 150,00']) {
  assert.equal(apply({lineText:t}).kind,'RATEIO_OR_ACERTO',t);
 }
});
test('não reclassifica o que já foi classificado',()=>{
 assert.equal(classifyLine({lineKind:'COST_NOTE',lineText:'05/10 - Apoio Éder'}).kind,'COST_NOTE');
});
test('SQL restringe mudanças ao staging e nunca altera valores, CG, Trello ou Cora',()=>{
 assert.match(sql,/UPDATE public\.cr_finance_2026_acerto_lines_v1/g);
 assert.doesNotMatch(sql,/\b(?:UPDATE|DELETE|INSERT INTO)\s+public\.(?!cr_finance_2026_acerto_lines_v1)/i);
 assert.doesNotMatch(sql,/SET\s+(?:amount_cents|cost_cents|declared_profit_cents)/i);
 assert.match(sql,/prior\.amount_cents=l\.amount_cents/);
 assert.match(sql,/classification='SUPPORT_RECAP_UNVERIFIED_NO_NEW_COST'/);
});
test('script idempotente: somente linhas ainda marcadas RATEIO_OR_ACERTO',()=>{
 assert.ok((sql.match(/line_kind='RATEIO_OR_ACERTO'/g)||[]).length>=3);
 assert.match(sql,/APOIO\[\[:space:\]\]\*\/\[\[:space:\]\]\*DI\[AÁ\]RIAS/);
 assert.match(sql,/COMMIT;/);
});
