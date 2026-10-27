'use strict';
// Audit tool: run only on an authorized local device.
// Does not connect to Supabase/Trello or write any finance records.
// Usage: node audits/financeiro-v12-compare-staging-readonly.cjs <originalEdge.ts> <privateWorkSource.json>
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const baseline=process.argv[2],privateData=process.argv[3];
if(!baseline||!privateData)throw Error('USAGE: originalEdge.ts privateWorkSource.json');
const source=fs.readFileSync(baseline,'utf8');
const candidate=fs.readFileSync(path.resolve(__dirname,'../candidates/financeiro-v12-period-close-20261024/trello-gestao-vista-v2-CANDIDATE.ts'),'utf8');
const records=JSON.parse(fs.readFileSync(privateData,'utf8'));
assert.ok(Array.isArray(records)&&records.length>=278,'HISTORICAL_SOURCE_INCOMPLETE');
function analyzer(s){
 const begin=s.indexOf('function norm('),helperEnd=s.indexOf('function cnum(');
 const a=s.indexOf('function analyze(c,allowSupport=false){'),end=s.indexOf('function agg(',a);
 assert.ok(begin>=0&&helperEnd>begin&&a>=0&&end>a,'PARSER_SOURCE_MISSING');
 const sandbox={};vm.runInNewContext(s.slice(begin,helperEnd)+'\n'+s.slice(a,end)+'\nthis.analyze=analyze',sandbox);
 return sandbox.analyze;
}
const old=analyzer(source),newer=analyzer(candidate);
const cents=v=>v==null?null:Math.round(v*100);
const dollarFields=['g','k','p','cap'];
const diffs=[];
for(const row of records){
 assert.ok(typeof row.name==='string'&&typeof (row.description??row.desc)==='string','INVALID_RECORD');
 const card={name:row.name,desc:row.description??row.desc};
 const a=old(card,true),b=newer(card,true),delta={};
 for(const fld of dollarFields) {
  const x=cents(a[fld]),y=cents(b[fld]);if(x!==y)delta[fld]={old:x,new:y,difference:x==null||y==null?null:y-x};
 }
 for(const fld of ['Fabrício','Éder','Rogério','Gabi','Outros']){
  const x=cents(a.rate[fld]),y=cents(b.rate[fld]);if(x!==y)delta['rate_'+fld]={old:x,new:y,difference:x==null||y==null?null:y-x};
 }
 for(const fld of ['Fabrício','Éder']){
  const x=cents(a.sup[fld]),y=cents(b.sup[fld]);if(x!==y)delta['support_'+fld]={old:x,new:y,difference:x==null||y==null?null:y-x};
 }
 if(Object.keys(delta).length)diffs.push({code:row.work_code,source_list:row.source_list,delta});
}
const expected=[
 {code:'627-26',field:'cap',difference:3258},
 {code:'655-26',field:'cap',difference:7157},
 {code:'649-26',field:'cap',difference:4071},
 {code:'727-26',field:'rate_Éder',difference:-15000}
];
const found=diffs.flatMap(v=>Object.entries(v.delta).map(([field,values])=>({code:v.code,field,difference:values.difference})));
const key=x=>x.code+'/'+x.field+'/'+x.difference;
const verified=expected.every(x=>found.some(y=>key(y)===key(x)))&&found.every(x=>expected.some(y=>key(x)===key(y)));
const unchanged=records.length-diffs.length;
const output={status:verified?'PASS':'FAIL_UNEXPECTED_CHANGE',compared_rows:records.length,unchanged_rows:unchanged,changed_rows:diffs.length,deltas:found,financial_source:'private_text_staging_not_bank'};
process.stdout.write(JSON.stringify(output)+'\n');
if(!verified)process.exitCode=1;
