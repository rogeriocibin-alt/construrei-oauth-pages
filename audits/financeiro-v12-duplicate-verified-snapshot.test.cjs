'use strict';
/* Contrato anonimo derivado de consulta REAL somente-leitura de 26/10/2026.
 * Reexecutar SQL de auditoria para novos cortes; nao e prova Cora/Trello E2E.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {classifyDuplicateGroups}=require('../candidates/financeiro-v12-period-close-20261024/financial-2026-dedup-CANDIDATE.cjs');
let seq=0;
const row=(work_code,overrides={})=>({
 source_card_id:'audit-fixture-'+(++seq),work_code,
 card_state:'OPEN',source_list:'01. JANEIRO 26',
 card_title:'OBRA '+work_code,raw_description:'Fechado / custos / lucro',
 validation_state:'BALANCED',closed_cents:10000,cost_cents:4000,
 declared_profit_cents:6000,received_claim_cents:null,...overrides});
function snapshot(){
 const rows=[];
 const exact=[
  ['13-26',42000],['19-26',121000],['20-26',74000],
  ['22-26',66500],['28-26',300000],['32-26',111530],
  ['4-26',212200],['44-26',56508],['51-26',276880],
  ['53-26',39500],['7-26',62900]];
 for(const [c,gross] of exact){
  const active=row(c,{closed_cents:gross});
  rows.push(active,{...active,source_card_id:'arch-'+active.source_card_id,
   card_state:'ARCHIVED',source_list:'02. FEVEREIRO 26'});
 }
 for(const [c,gross,cost,profit] of [
  ['290-26',79850,56772,23078],['320-26',297000,215267,81733]]){
  rows.push(row(c,{closed_cents:gross,cost_cents:cost,declared_profit_cents:profit}));
  rows.push(row(c,{card_state:'ARCHIVED',source_list:'EM ANDAMENTO',
   card_title:'Gabrielly Criar Card',raw_description:'preliminar',
   validation_state:'INCOMPLETE',closed_cents:null,cost_cents:null,
   declared_profit_cents:null,received_claim_cents:null}));
 }
 rows.push(row('675-26',{closed_cents:80000,cost_cents:59800,
  declared_profit_cents:20200,received_claim_cents:80000}));
 rows.push(row('675-26',{card_state:'ARCHIVED',source_list:'AG. ACERTO',
  raw_description:'resumo parcial',validation_state:'INCOMPLETE',
  closed_cents:80000,cost_cents:null,declared_profit_cents:20200,
  received_claim_cents:null}));
 rows.push(row('411-26',{card_title:'OBRA 411-26',closed_cents:179160}));
 rows.push(row('411-26',{card_title:'Aditivo do 411-26',closed_cents:45000}));
 rows.push(row('9999-26',{card_title:'CR-QA TESTE',card_state:'ARCHIVED'}));
 rows.push(row('9999-26',{card_title:'TESTE HOMOLOGAÇÃO'}));
 return rows;
}
test('LIVE-SQL-derived contract: all 16 groups reconcile without an unexpected classification',()=>{
 const result=classifyDuplicateGroups(snapshot());
 assert.equal(result.totals.group_count,16);
 assert.equal(result.totals.exact_pairs,11);
 assert.equal(result.totals.provisional_pairs,3);
 assert.equal(result.totals.test_only,1);
 assert.equal(result.totals.review_groups,1);
 assert.equal(result.totals.potential_duplicate_gross_cents,1363018);
 const map=Object.fromEntries(result.decisions.map(x=>[x.work_code,x]));
 for(const c of ['290-26','320-26','675-26'])
  assert.equal(map[c].kind,'PROVISIONAL_ARCHIVED_MIRROR');
 assert.equal(map['411-26'].kind,'REVIEW_DISTINCT_ADDITIVE');
 assert.equal(map['411-26'].exclude.length,0);
 assert.equal(map['9999-26'].kind,'TEST_ONLY_EXCLUDED');
 assert.equal(result.safe_for_live_write,false);
});
test('live SQL evidence script is SELECT-only and refers to both verified registry sources',()=>{
 const sql=fs.readFileSync(path.join(__dirname,'financeiro-v12-2026-duplicate-live-readonly.sql'),'utf8');
 assert.match(sql,/FROM public\.cr_finance_2026_work_card_source_v1/);
 assert.match(sql,/JOIN public\.cr_finance_2026_work_extract_v1/);
 const statements=sql.replace(/\/\*[\s\S]*?\*\//g,'').replace(/--.*$/gm,'');
 assert.doesNotMatch(statements,/\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE|CALL)\b/i);
 assert.match(statements,/SELECT work_code,classification/);
});
test('audit fixture does not contain source descriptions, IDs, contacts or bank extracts',()=>{
 const s=fs.readFileSync(__filename,'utf8');
 assert.doesNotMatch(s,/https?:\/\/trello\.com\/c\//i);
 assert.doesNotMatch(s,/\b(?:CPF|CNPJ)\s*[:=]\s*\d/i);
});
