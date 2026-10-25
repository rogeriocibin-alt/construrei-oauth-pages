const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
test('gateway libera apenas ação comercial read-only, prévia e confirmação protegida',()=>{
 const x=html.match(/const safePeriod=([\s\S]*?);const safeClose=/);
 assert.ok(x,'gateway safety not found');
 assert.match(x[1],/method==="POST"/);
 assert.match(x[1],/yspuaamokjbrosytqjpg.supabase.co/);
 assert.match(x[1],/\["preview","commit","gc-awaiting-payment","preview-diagnostic"\]/);
 assert.doesNotMatch(x[1],/delete|admin|service-role/);
});
test('filtro deny-by-default continua bloqueando escritas não mapeadas',()=>{
 assert.match(html,/!safePeriod\)return Promise.reject\(new Error\("V12_SOMENTE_LEITURA/);
});
test('endpoint comercial exige sessão no header e resposta da Gestão Click válida',()=>{
 assert.match(html,/cr-finance-v12-period-close-candidate-20261024\?action=gc-awaiting-payment/);
 assert.match(html,/"x-cr-session":token/);
 assert.match(html,/data.complete!==true/);
 assert.match(html,/data.source!=="GESTAOCLICK_ORCAMENTOS_2026"/);
});
test('JS inline da V12 compilável',()=>{
 for(const s of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){if(!s[0].includes('src='))assert.doesNotThrow(()=>new vm.Script(s[1]))}
});
