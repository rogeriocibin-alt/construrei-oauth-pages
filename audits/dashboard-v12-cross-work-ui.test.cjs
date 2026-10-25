const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
test('origem e destino separados na conciliação de custo já existente',()=>{
 assert.match(html,/id="cr-ap-cost-case"/);
 assert.match(html,/cost_case:destCost/);
 assert.match(html,/existingDestination\.value\.trim\(\)!==existingCheck\.costCase/);
 assert.match(html,/const cross=existing\.value==="yes"/);
 assert.match(html,/Confirme|Confirmar conciliação sem novo lançamento/);
});
test('novo custo lançado na obra de destino mantém origem identificada',()=>{
 assert.match(html,/id="cr-ap-origin-case"/);
 assert.match(html,/const crossNote=original&&original!==obra/);
 assert.match(html,/Obra de origem: /);
 assert.match(html,/mc_desc:\(String\(m.description/);
});
test('identificador bancário permanece e nenhuma duplicidade automática',()=>{
 assert.match(html,/mc_ref:ref/);
 assert.match(html,/if\(existing\.value!=="no"\)/);
 assert.match(html,/existingRequest\("existing-preview",payload\)/);
 assert.match(html,/existingRequest\("existing-confirm",\{\.\.\.existingCheck\.payload,match_key:key\}\)/);
});
test('sintaxe de todos os scripts do Dashboard é válida',()=>{
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.ok(scripts.length>10);
 scripts.forEach((s,i)=>{if(!s[0].includes('src='))assert.doesNotThrow(()=>new vm.Script(s[1]),'script '+i)});
});
