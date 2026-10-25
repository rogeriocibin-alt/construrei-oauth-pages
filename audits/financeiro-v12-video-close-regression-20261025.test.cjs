const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
test('scripts inline da candidata compilam normalmente',()=>{let n=0;for(const s of scripts){if(!/\bsrc=/.test(s[1])){assert.doesNotThrow(()=>new vm.Script(s[2]));n++}}assert.ok(n>=10)});
const js=scripts.map(m=>m[2]).join('\n');
function part(from,to){const i=js.indexOf(from),j=js.indexOf(to,i+from.length);assert.ok(i>=0&&j>i,from);return js.slice(i,j)}
const apiSrc=part('async function api(q,opt={})','async function cgapi(');
function apiFor(response){
 const sandbox={fetch:async()=>response,CR_API_BASE:'https://unit.invalid',S:{session:'TEST_ONLY'},logout:()=>{throw Error('logout')},Error};return vm.runInNewContext(apiSrc+';api',sandbox);
}
test('erro HTTP com corpo null retorna erro conhecido e não TypeError',async()=>{
 const api=apiFor({status:500,ok:false,json:async()=>null});
 await assert.rejects(api('api=manual-close-work'),/RESPOSTA_SERVIDOR_NULA/);
});
test('bloqueio 755/799 mostra mensagem clara ao usuário sem repetir gravação',async()=>{
 const api=apiFor({status:409,ok:false,json:async()=>({ok:false,error:'CUSTOS_REFERENCIAM_OUTRA_OBRA',reference_count:3,other_cases:['799-26']})});
 await assert.rejects(api('api=manual-close-work',{method:'POST'}),/3 despesa\(s\) citam outra obra \(799-26\)/);
});
test('estado operacional responde com nome legível e erro válido',async()=>{
 const api=apiFor({status:409,ok:false,json:async()=>({ok:false,error:'CASE_NOT_OPERATIONALLY_OPEN',work_status:'FINALIZADO'})});
 await assert.rejects(api('api=manual-close-work'),/obra no estado FINALIZADO/);
});
const dataSrc=part('function crpData()','function crpShow(');
function dateReader(items,selected){
 const sb={document:{getElementById:id=>({value:id==='crp-start'?'2026-10-10':'2026-10-23'})},S:{current:{acertos:{items}}},acertoPeriodFromSelection:()=>{},acertoSelectedRows:()=>selected};
 return vm.runInNewContext(dataSrc+';crpData',sb);
}
test('lista Trello AG. ACERTO vazia não é confundida com checkbox desmarcado',()=>{
 assert.throws(()=>dateReader([],[])(),/Lista AG\. ACERTO do Trello está vazia/);
});
test('quando carregamento pendente não inventa total zero',()=>{
 assert.throws(()=>dateReader(undefined,[])(),/ainda não carregados/);
});
test('seleção de obra válida usa período independente de capital de giro',()=>{
 const v=dateReader([{case:'579-26'}],[{case:'579-26'}])();
 assert.equal(v.start,'2026-10-10');assert.equal(v.end,'2026-10-23');assert.equal(v.cases[0],'579-26');
});
test('fechamento requer retorno ok:true antes de acessar prévia',()=>{
 assert.match(html,/if\(!pre\|\|pre\.ok!==true\)throw Error/);
 assert.match(html,/if\(!result\?\.ok\|\|!\(result\.committed\|\|result\.duplicate\)\)/);
});
