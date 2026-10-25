const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const edge=fs.readFileSync(path.join(__dirname,'..','candidates/financeiro-v12-fechar-obra-guard-20261025/index.ts'),'utf8');
function extract(name,next){const i=edge.indexOf('function '+name+'('),j=edge.indexOf(next,i);assert.ok(i>=0&&j>i,name+' missing');return edge.slice(i,j)}
const costSrc=extract('foreignCostCaseRefs','async function manualCloseWork(').replace('desc:string,ownCase:string','desc,ownCase').replace('const matches:any[]=[]','const matches=[]');
const foreignCostCaseRefs=vm.runInNewContext(costSrc+';foreignCostCaseRefs',{});
const jsonSrc=extract('json','function sec(').replace('data:any,status=200','data,status=200');
const json=vm.runInNewContext(jsonSrc+';json',{Response,BUILD:"UNIT_TEST_BUILD"});
const sample=['MOVIMENTAÇOES FINANCEIRAS:','Valor Fechado: R$ 6.980,00','Custos:','23/10 - R$150,00 Diária - JOÃO VICTOR CIBIN - Obra 799-26 - Ref. PIX','23/10 - R$150,00 Apoio - FABRICIO LUCAS BERTO - Obra 799-26 - Ref. PIX','23/10 - R$150,00 Apoio - EDER CIBIN - Obra 799-26 - Ref. PIX','21/10 - R$89,96 Materiais - CASA CASTRO','FECHAMENTO DA OBRA','Valor Fechado: R$ 6.980,00'].join('\n');
test('HTTP status literal de obra não derruba resposta em 500 sem corpo',async()=>{
 assert.equal(json({ok:false,error:'CASE_NOT_OPERATIONALLY_OPEN'},'FINALIZADO').status,500);
 assert.equal(json({ok:false,error:'CASE_NOT_OPERATIONALLY_OPEN'},409).status,409);
 assert.equal(json({ok:false,error:'ANY'},'0').status,500);
 assert.equal((await json({ok:false,error:'ANY'},'0').json()).error,'ANY');
});
test('atribuição cruzada 755/799 identifica precisamente três linhas',()=>{
 const found=foreignCostCaseRefs(sample,'755-26');
 assert.equal(found.length,3);
 assert.deepEqual(Array.from(found,x=>String(x.other_case)),['799-26','799-26','799-26']);
 assert.ok(found.every(x=>x.line.includes('R$150,00')));
});
test('costos da própria obra não disparam bloqueio',()=>{
 const own=sample.replaceAll('799-26','755-26');
 assert.equal(foreignCostCaseRefs(own,'755-26').length,0);
});
test('menção histórica fora de Custos ou sem valor não bloqueia',()=>{
 const x=['Observação obra 799-26','Custos:','Nota obra 799-26','25/10 - R$12,50 Tinta - Ref. PIX','Total de Custos: R$12,50','FECHAMENTO DA OBRA','799-26'].join('\n');
 assert.equal(foreignCostCaseRefs(x,'755-26').length,0);
});
test('prévia e commit fecham na divergência sem escrita',()=>{
 assert.match(edge,/CUSTOS_REFERENCIAM_OUTRA_OBRA/);
 assert.match(edge,/review_required:true,writes:false/);
 assert.match(edge,/work_status:st/);
 assert.doesNotMatch(edge,/CASE_NOT_OPERATIONALLY_OPEN",case:caseNo,list:listName,status:st/);
 const guard=edge.indexOf('const refs=foreignCostCaseRefs('),write=edge.indexOf('const wr=await trelloWriteCardDesc(',guard);
 assert.ok(guard>=0&&write>guard,'guard must run before closing card write');
});
test('backup de v26 e contrato de produção preservados',()=>{
 const backup=fs.readFileSync(path.join(__dirname,'..','candidates/financeiro-v12-fechar-obra-guard-20261025/backups/edge-v26-antes-guard.ts'),'utf8');
 assert.match(backup,/GROSSNET-20261023/);
 assert.equal(backup.includes('CUSTOS_REFERENCIAM_OUTRA_OBRA'),false);
});
