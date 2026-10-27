'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {classifyDuplicateGroups,normalizeWorkCode}=require('../candidates/financeiro-v12-period-close-20261024/financial-2026-dedup-CANDIDATE.cjs');
let counter=0;
const make=(code,rest={})=>({source_card_id:'s'+(++counter),work_code:code,
 card_state:'OPEN',source_list:'01. JANEIRO 26',card_title:'Obra '+code,
 raw_description:'Fechado / custos / lucro',validation_state:'BALANCED',
 closed_cents:10000,cost_cents:4000,declared_profit_cents:6000,
 received_claim_cents:null,...rest});
const one=x=>classifyDuplicateGroups(x).decisions[0];
test('normalizes leading zero in exact work code',()=>assert.equal(normalizeWorkCode('0013-26'),'13-26'));
test('archived identical text and numbers is excluded, active is preserved',()=>{
 const a=make('13-26'), b=make('0013-26',{card_state:'ARCHIVED',card_title:'Obra 13-26',source_list:'02. FEVEREIRO 26'});
 const res=one([a,b]);
 assert.equal(res.kind,'EXACT_ARCHIVED_COPY');
 assert.deepEqual(res.keep,[a.source_card_id]);assert.deepEqual(res.exclude,[b.source_card_id]);
 assert.equal(res.excluded_duplicate_gross_cents,10000);
});
test('two open records do not automatically collapse',()=>{
 const a=make('19-26'),b=make('19-26');assert.equal(one([a,b]).kind,'REVIEW_REQUIRED');
});
test('archived partial compatible entry is only mirror when provenance is provisional',()=>{
 const a=make('290-26',{source_list:'05. MAIO 26'});
 const b=make('290-26',{card_state:'ARCHIVED',source_list:'EM ANDAMENTO',
  card_title:'Gabrielly Criar Card',validation_state:'INCOMPLETE',
  raw_description:'Provisório',closed_cents:null,cost_cents:null,declared_profit_cents:null});
 assert.equal(one([a,b]).kind,'PROVISIONAL_ARCHIVED_MIRROR');
});
test('archived incomplete with contradictory gross stays review',()=>{
 const a=make('675-26',{closed_cents:80000}),b=make('675-26',{card_state:'ARCHIVED',source_list:'AG. ACERTO',
  validation_state:'INCOMPLETE',closed_cents:70000,cost_cents:null,declared_profit_cents:null});
 assert.equal(one([a,b]).kind,'REVIEW_REQUIRED');
});
test('archived acerto recap matching gross and profit is mirror, not new revenue',()=>{
 const a=make('675-26',{closed_cents:80000,declared_profit_cents:20200});
 const b=make('675-26',{card_state:'ARCHIVED',source_list:'AG. ACERTO',
  validation_state:'INCOMPLETE',closed_cents:80000,cost_cents:null,declared_profit_cents:20200});
 assert.equal(one([a,b]).kind,'PROVISIONAL_ARCHIVED_MIRROR');
});
test('distinct real aditivo must be reviewed without erasure',()=>{
 const a=make('411-26',{card_title:'Orçamento 411-26',closed_cents:179160});
 const b=make('411-26',{card_title:'Orçamento 436-26 - Aditivo do 411-26',closed_cents:45000});
 const res=one([a,b]);assert.equal(res.kind,'REVIEW_DISTINCT_ADDITIVE');
 assert.equal(res.keep.length,0);assert.equal(res.review.length,2);
});
test('QA pair is excluded only with explicit test marker',()=>{
 const a=make('9999-26',{card_title:'TESTE CR HOMOLOGAÇÃO',card_state:'ARCHIVED'});
 const b=make('9999-26',{card_title:'CR-QA TESTE',card_state:'OPEN'});
 assert.equal(one([a,b]).kind,'TEST_ONLY_EXCLUDED');
});
test('non-test code 9999 is not silently dropped',()=>{
 const a=make('9999-26'),b=make('9999-26',{card_state:'ARCHIVED'});
 assert.notEqual(one([a,b]).kind,'TEST_ONLY_EXCLUDED');
});
test('does not exclude financial records with different values',()=>{
 const a=make('44-26'),b=make('44-26',{card_state:'ARCHIVED',closed_cents:10001});
 assert.equal(one([a,b]).kind,'REVIEW_REQUIRED');
});
test('does not change user source objects',()=>{
 const a=make('51-26'),b=make('51-26',{card_state:'ARCHIVED'});
 const before=JSON.stringify([a,b]);classifyDuplicateGroups([a,b]);assert.equal(JSON.stringify([a,b]),before);
});
test('does not classify single cards as duplicate',()=>{
 const a=make('5-26');assert.equal(classifyDuplicateGroups([a]).totals.group_count,0);
});
test('rejects duplicated source identities to avoid double-counting from import',()=>{
 const a=make('7-26'),b={...a};assert.throws(()=>classifyDuplicateGroups([a,b]),/REPEATED_SOURCE_CARD_ID/);
});
test('historical 2024 and 2025 cards with unique codes are unaffected',()=>{
 const a=make('10-24'),b=make('10-25');assert.equal(classifyDuplicateGroups([a,b]).decisions.length,0);
});
test('11 known exact archived pairs sum R$13.630,18 once only',()=>{
 const amounts=[42000,121000,74000,66500,300000,111530,212200,56508,276880,39500,62900];
 const rows=amounts.flatMap((n,i)=>{const a=make(String(i+1)+'-26',{closed_cents:n});return [a,{...a,source_card_id:'arch'+a.source_card_id,card_state:'ARCHIVED'}];});
 const r=classifyDuplicateGroups(rows);
 assert.equal(r.totals.exact_pairs,11);assert.equal(r.totals.potential_duplicate_gross_cents,1363018);
});
test('fail closed for groups with three cards',()=>{
 const rows=[make('90-26'),make('90-26',{card_state:'ARCHIVED'}),make('90-26',{card_state:'ARCHIVED'})];
 assert.equal(one(rows).kind,'REVIEW_REQUIRED');
});
