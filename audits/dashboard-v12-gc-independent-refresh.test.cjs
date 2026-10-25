const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
const start=html.indexOf('async function refresh(gc){'),end=html.indexOf('function render(){',start);
assert.ok(start>=0&&end>start,'função refresh encontrada');
const refreshJs=html.slice(start,end);
test('N/D do Gestão Click não depende do sucesso das demais cinco APIs',async()=>{
 let gcCalled=0,live={textContent:''};
 const env={document:{getElementById:()=>live},Date,S:{gcLastAt:0,acertoHistoryLoaded:false},api:async()=>{throw Error('simulated other source outage')},cgapi:async()=>{throw Error('simulated CG outage')},crGcPaymentRefresh:async()=>{gcCalled++},render:()=>{throw Error('must not render failed response')},loadAcertoHistory:()=>{},Promise};
 const ctx=vm.createContext(env);vm.runInContext(refreshJs+'\nthis.callRefresh=refresh',ctx);
 await ctx.callRefresh(true);assert.equal(gcCalled,1);assert.equal(live.textContent,'degradado');
});
test('uma atualização normal não chama Gestão Click duas vezes',async()=>{
 let gcCalled=0,rendered=0;const elements={live:{textContent:''},buildfoot:{textContent:'',title:''}};
 const env={document:{getElementById:id=>elements[id]||(elements[id]={textContent:''})},Date,
 S:{gcLastAt:0,gcLast:null,acertoHistoryLoaded:true},api:async()=>({build:'TEST',gestaoclick:{}}),cgapi:async()=>({ok:true}),
 crGcPaymentRefresh:async()=>{gcCalled++},render:()=>{rendered++},loadAcertoHistory:()=>{},Promise};
 const ctx=vm.createContext(env);vm.runInContext(refreshJs+'\nthis.callRefresh=refresh',ctx);
 await ctx.callRefresh(true);assert.equal(gcCalled,1);assert.equal(rendered,1);assert.equal(elements.live.textContent,'online');
});
test('atualização segura só ocorre com controle de sessão no método de Gestão Click',()=>{
 assert.match(html,/const token=sessionStorage\.getItem\("crv2"\)\|\|""/);
 assert.match(html,/if\(token\.length<12\)\{element\.textContent="N\/D"/);
 assert.match(html,/data\.source!=="GESTAOCLICK_ORCAMENTOS_2026"/);
 assert.match(html,/!Number\.isSafeInteger\(data\.total_cents\)/);
});
test('scripts inline do Dashboard continuam com sintaxe válida',()=>{
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.ok(scripts.length>=10);
 scripts.forEach((s,i)=>{if(!s[0].includes('src='))assert.doesNotThrow(()=>new vm.Script(s[1]),'script '+i)});
});
