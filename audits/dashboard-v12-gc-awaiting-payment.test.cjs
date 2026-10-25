const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
const content=html.match(/<script id="v12-gc-awaiting-payment">([\s\S]*?)<\/script>/)?.[1];
assert.ok(content,'Script comercial não encontrado');
function setup(data,session='director-session-valid-123',status=200){
 const el={textContent:'N/D'}, note={textContent:''};
 let calls=0;
 const context=vm.createContext({
 document:{getElementById:id=>id==='v12ex-receive'?el:id==='v12ex-receive-note'?note:null},
 sessionStorage:{getItem:()=>session},fetch:async()=>{calls++;return {ok:status===200,status,json:async()=>data}},
 AbortSignal:{timeout:()=>undefined},Date,Intl,Number,String,Error
 });
 vm.runInContext(content+'\nthis.call=crGcPaymentRefresh',context);
 return {el,note,run:()=>context.call(),calls:()=>calls};
}
test('KPI usa Gestão Click e exibe valor, quantidade e atualização',async()=>{
 const q=setup({ok:true,complete:true,source:'GESTAOCLICK_ORCAMENTOS_2026',total_cents:123456,count:3,read_at:'2026-10-25T11:00:00Z'});
 await q.run();assert.match(q.el.textContent,/1\.234,56/);assert.match(q.note.textContent,/3 orçamento/);assert.match(q.note.textContent,/Gestão Click/);
});
test('consulta sem sessão não chama API e mantém N/D',async()=>{
 const q=setup({},'');await q.run();assert.equal(q.calls(),0);assert.equal(q.el.textContent,'N/D');
});
test('API falha: mantém N/D e explica erro sem inventar zero',async()=>{
 const q=setup({ok:false,error:'GC_CREDENTIALS_UNAVAILABLE'},'director-session-valid-123',503);await q.run();assert.equal(q.el.textContent,'N/D');assert.match(q.note.textContent,/GC_CREDENTIALS_UNAVAILABLE/);
});
test('resultado sem cobertura ou total inválido não vira KPI',async()=>{
 const q=setup({ok:true,complete:false,source:'GESTAOCLICK_ORCAMENTOS_2026',total_cents:10000,count:2});await q.run();assert.equal(q.el.textContent,'N/D');
});
test('label distingue orçamentos aguardando pagamento de saldo bancário',()=>{
 assert.match(html,/Orçamentos aguardando pagamento · Gestão Click/);
 assert.match(html,/id="v12ex-receive-note"/);
 assert.match(html,/render\(\);if\(wantGc&&typeof crGcPaymentRefresh/);
 assert.ok(!html.includes('<span>A receber confirmado</span>'));
});
test('todos os scripts inline preservam sintaxe JS válida',()=>{
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 for(const [i,s] of scripts.entries()){if(!s[0].includes('src='))assert.doesNotThrow(()=>new vm.Script(s[1]),'script '+i)}
});
