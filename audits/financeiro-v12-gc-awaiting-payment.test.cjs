const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ts=fs.readFileSync(path.join(__dirname,'../candidates/financeiro-v12-period-close-20261024/index.ts'),'utf8');
const a=ts.indexOf('async function gcAwaitingPayment(){'),b=ts.indexOf('Deno.serve(',a);
assert.ok(a>=0&&b>a);
const code=ts.slice(a,b).replace('new Set<string>()','new Set()');
function setup(rows,cred=true,code=200){
 const calls=[];
 const context=vm.createContext({Deno:{env:{get:k=>!cred?'':k==='GESTAOCLICK_ACCESS_TOKEN'?'fake-access':k==='GESTAOCLICK_SECRET_ACCESS_TOKEN'?'fake-secret':''}},URL,Date,AbortSignal:{timeout:()=>undefined},fetch:async(url,opts)=>{calls.push({url:String(url),opts});return {ok:code===200,status:code,json:async()=>({data:rows})}}});
 vm.runInContext(codeSource+'\nthis.get=gcAwaitingPayment',context);
 return {get:context.get,calls};
}
const codeSource=code;
test('Gestão Click: sumariza somente AGUARDANDO PAGAMENTO de 2026 e preserva centavos',async()=>{
 const sample=[{id:'1',codigo:'79026',nome_situacao:'Aguardando Pagamento',valor_total:'1.234,56'},{id:'2',codigo:'79126',nome_situacao:'Finalizado',valor_total:'1000,00'},{id:'3',codigo:'79025',nome_situacao:'Aguardando Pagamento',valor_total:'10,00'},{id:'4',codigo:'80026',nome_situacao:'AGUARDANDO PAGAMENTO',valor_total:'25,44'},{id:'1',codigo:'79026',nome_situacao:'Aguardando Pagamento',valor_total:'1.234,56'}];
 const t=setup(sample),v=await t.get();assert.equal(v.total_cents,126000);assert.equal(v.count,2);assert.equal(v.quotes_2026_seen,3);assert.equal(v.complete,true);assert.equal(t.calls.length,1);assert.equal(t.calls[0].opts.headers['access-token'],'fake-access');
});
test('erro sem credencial de Gestão Click impede valor artificial',async()=>{await assert.rejects(setup([],false).get(),/GC_CREDENTIALS_UNAVAILABLE/);});
test('falha HTTP não retorna zero fictício',async()=>{await assert.rejects(setup([],true,403).get(),/GC_ORCAMENTOS_HTTP_403/);});
