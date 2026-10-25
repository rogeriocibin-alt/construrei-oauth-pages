const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
test('diagnóstico de acertos fica no mesmo URL e mantém sessão do diretor',()=>{
 assert.match(html,/\["preview","commit","gc-awaiting-payment","preview-diagnostic"\]/);
 assert.match(html,/const token=sessionStorage\.getItem\("crv2"\)/);
 assert.match(html,/crpApi\("preview-diagnostic",crpData\(\)\)/);
});
test('prévia com inconsistência mostra dados sem liberar gravação',()=>{
 const a=html.indexOf('async function crpPreview()'),b=html.indexOf('async function crpSend()',a);
 const block=html.slice(a,b);
 assert.match(block,/CRP_LAST=null;document\.getElementById\("crp-send"\)\.disabled=true/);
 assert.match(block,/PRÉVIA DIAGNÓSTICA SOMENTE LEITURA/);
 assert.match(block,/ENVIO DESABILITADO/);
 assert.match(block,/if\(!cv\.ok&&!cv\.accepted_exception\)/);
 assert.match(block,/PRÉVIA CONSULTIVA SEM ESCRITA/);
});
test('confirmar envio preserva fingerprint e confirmação explícita',()=>{
 const a=html.indexOf('async function crpSend()'),b=html.indexOf('</script>',a),block=html.slice(a,b);
 assert.match(block,/if\(!CRP_LAST\)return/);
 assert.match(block,/confirm\("Confirma/);
 assert.match(block,/crpApi\("commit",CRP_LAST\)/);
});
test('HTML preserva scripts válidos e produção fora do escopo',()=>{
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.ok(scripts.length>10);
 scripts.forEach((s,i)=>{if(!s[0].includes('src='))assert.doesNotThrow(()=>new vm.Script(s[1]),'script '+i)});
 assert.match(html,/CANDIDATA DE TESTE/);
});
