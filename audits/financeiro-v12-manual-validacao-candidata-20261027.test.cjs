"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const candidate=fs.readFileSync(__dirname+"/index.html","utf8");
const base=fs.readFileSync(__dirname+"/production.html","utf8");
const scripts=s=>[...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(x=>({name:x[1].match(/id="([^"]+)"/)?.[1]||"inline",source:x[2]}));
const a=scripts(candidate),b=scripts(base);
test("candidata preserva todos os scripts e modulos da V12 homologada",()=>{
 assert.equal(a.length,b.length);
 for(let i=0;i<b.length;i++)assert.equal(a[i].name,b[i].name,"script order "+i);
});
test("scripts da candidata compilam no JavaScript",()=>{for(const s of a)assert.doesNotThrow(()=>new vm.Script(s.source),s.name)});
test("nao altera o codigo dos modulos de Cora/Trello/rateios/CG",()=>{
 const changed=a.map((x,i)=>x.source===b[i].source?null:i).filter(x=>x!==null);
 assert.equal(changed.length,1,"apenas runtime da operação manual deve mudar");
});
test("mensagens de orientacao e prevalidacao antes de qualquer POST",()=>{
 assert.match(candidate,/id="mc-required-help"/);
 assert.match(candidate,/manualFieldsCheck\(\)/);
 assert.match(candidate,/if\(!manualRequiredHelp\(\)\)return;manualMsg\("Validando obra/);
 assert.match(candidate,/Nenhum registro foi gravado/);
});
test("campos do back-end contemplados, sem exigir referencia bancaria",()=>{
 for(const name of ["mc_case","mc_date","mc_amount","mc_category","mc_dir","mc_party","mc_desc","mc_ref"])assert.match(candidate,new RegExp('id="'+name+'"'));
 assert.match(candidate,/!value\("mc_party"\)&&!value\("mc_desc"\)&&!value\("mc_ref"\)/);
 assert.match(candidate,/Favorecido OU descrição OU referência/);
});
test("falha MISSING_FINANCIAL_DETAILS traduzida e sem mentir sucesso",()=>{
 assert.match(candidate,/raw\.includes\("MISSING_FINANCIAL_DETAILS"\)/);
 assert.match(candidate,/Não foi possível conferir o lançamento/);
 assert.match(candidate,/Nenhum lançamento foi gravado nesta etapa/);
});
test("previa nao registra e commit so habilita apos retorno autenticado",()=>{
 assert.match(candidate,/const p=manualPayload\(\),r=await v12ProtectedWrite\("preview",p\)/);
 assert.match(candidate,/document\.getElementById\("mc_commit"\)\.disabled=false/);
 assert.match(candidate,/if\(!S\.manualPreview\)/);
 assert.match(candidate,/v12ProtectedWrite\("commit",p\)/);
});
test("consulta de registro captura erro mesmo se manualPayload falhar",()=>{
 assert.match(candidate,/async function manualCheckStatus\(\)\{\s*try\{\s*const payload=S\.manualLastPayload\|\|manualPayload\(\)/);
});
test("Nf, fechamento de obra e anotacao Cora preservados",()=>{
 for(const str of ["manualNfUpdate()","manualCloseWork()","manualClear()","manualCheckStatus()","cr-ap-note-only","cr-ap-note-preview","cr-ap-note-confirm","crp-period-send-v2"])assert.ok(candidate.includes(str),str);
});
test("rotas limitadas por netguard e somente a candidata modificada",()=>{
 for(const str of ['id="v12-netguard"',"V12_SOMENTE_LEITURA","cr-finance-v12-safe-trello-candidate-20261021","cr-cora-aprovisionamento-v12-candidate-20261023"])assert.ok(candidate.includes(str),str);
 assert.ok(candidate.includes("V12 · CANDIDATA (BASE HOMOLOGADA)"));
});
test("não duplica IDs de elementos",()=>{const ids=[...candidate.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length)});
test("origem de auditoria permanece read-only",()=>{assert.match(candidate,/cr-v12-audit-imported-readonly-runtime/);assert.match(candidate,/cr-v12-r3-risk-readonly-20261027/);});
