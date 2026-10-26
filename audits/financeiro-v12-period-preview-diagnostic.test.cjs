const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=fs.readFileSync(path.join(__dirname,'../candidates/financeiro-v12-period-close-20261024/index.ts'),'utf8');
const a=ts.indexOf('async function diagnosticPreview('),b=ts.indexOf('// Reuse the existing, guarded Capital de Giro',a);
assert.ok(a>=0&&b>a);
const block=ts.slice(a,b);
test('consulta diagnóstica só lê acertos reais, sem usar Trello PUT ou confirmar lançamento',()=>{
 assert.match(block,/const live=await acertos\(\)/);
 assert.match(block,/const p=input\(body\)/);
 assert.doesNotMatch(block,/trello\(|"PUT"|claim|rpc\(/);
 assert.match(block,/writes:false,preview_validated:false,can_commit:false/);
});
test('retorna apenas números íntegros, mantendo lista de questões truncada',()=>{
 assert.match(block,/Number\.isSafeInteger\(x\)/);
 assert.match(block,/r\.base_cents-r\.cost_cents===r\.profit_cents/);
 assert.match(block,/base_cents:valid\?r\.base_cents:null/);
 assert.match(block,/Array\.isArray\(r\?\.issues\)/);
});
test('somente diretor chama a rota; commit permanece fail closed',()=>{
 const serve=ts.slice(ts.indexOf('Deno.serve('));
 assert.ok(serve.indexOf('if(!await director(req))')<serve.indexOf('if(action==="preview-diagnostic")'));
 assert.match(serve,/if\(action==="preview-diagnostic"\)return ans\(await diagnosticPreview\(b\)\)/);
 assert.match(serve,/!c\.capital_validation\.ok&&!c\.capital_validation\.accepted_exception&&!c\.capital_validation\.can_create/);
 assert.match(serve,/if\(b\.fingerprint!==c\.fingerprint\)/);
 assert.match(serve,/if\(action==="preview"\)return ans/);
});
