"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm"),test=require("node:test"),assert=require("node:assert/strict");
const dir=__dirname;
const p=fs.readFileSync(path.join(dir,"index.html"),"utf8");
const prod=fs.readFileSync(path.join(dir,"production.html"),"utf8");
const scripts=s=>[...s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(x=>({id:(x[1].match(/id="([^"]+)"/)||[])[1]||"(inline)",source:x[2]}));
const original=scripts(prod),candidate=scripts(p);
test("Candidata usa a EXATA base homologada, salvo banner, painel e leitura de auditoria",()=>{
 const withoutBanner=p.replace(/<div id="cr-period-candidate-banner"[\s\S]*?<\/div>/,"");
 const withoutPanel=withoutBanner.replace(/<section class="panel" id="cr-v12-auditoria-importada-2026"[\s\S]*?<\/section>\n/,"");
 const restored=withoutPanel.replace(/\n<script id="cr-v12-auditoria-importada-runtime">[\s\S]*?<\/script>\n/,"");
 assert.equal(restored.replace(/\n{3,}/g,"\n\n").trim(),prod.replace(/\n{3,}/g,"\n\n").trim());
});
test("Todos os scripts originais homologados persistem sem mutação",()=>{
 for(let i=0;i<original.length;i++){const a=original[i],current=candidate[i];assert.ok(current,"missing script "+a.id);assert.equal(current.id,a.id);assert.equal(current.source,a.source,a.id+" @ "+i)}
});
test("Scripts compilam e nenhum ID HTML duplica",()=>{
 for(const x of candidate)assert.doesNotThrow(()=>new vm.Script(x.source),x.id);
 const ids=[...p.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
});
test("Módulos homologados de apoio, diárias e rateio pessoal presentes",()=>{
 for(const id of ["cr-financial-trello-declared-2026","cr-v12-earnings-composition","cr-v12-earnings-rows","cr-v12-historical-rateio-2425","cr-financial-trello-refresh","cr-v12-earnings-refresh","cr-v12-historical-refresh"])
 assert.ok(p.includes('id="'+id+'"'),"missing "+id);
});
test("Cora, Central, Gestão de Obras, Capital de Giro e acertos preservados",()=>{
 for(const id of ["v12-capital-workspace","cr-period-send","v12-close-period","cr-ap-note-only","cr-v12-trello-financial-withdrawals-live","cr-v12-withdraw-history-runtime","v12-gc-awaiting-payment"])
 assert.ok(p.includes(id),"missing "+id);
});
test("Auditoria apenas GET, com sessão de diretor, sem lançamento",()=>{
 const runtime=candidate.find(x=>x.id==="cr-v12-auditoria-importada-runtime")?.source||"";
 assert.match(runtime,/method:"GET"/);assert.match(runtime,/x-cr-session/);
 for(const term of ['method:"POST"','method:"PUT"','method:"DELETE"',"action=commit","addCard","createCard"])assert.ok(!runtime.includes(term),"unexpected write "+term);
 assert.match(runtime,/d\.no_writes!==true/);
});
test("Auditoria diferencia cartões, obras, importação e Cora",()=>{
 for(const term of ["Cartões importados","Códigos distintos","Registros adicionais","Incompletos","Divergentes","Trello importado até","Cora"])assert.ok(p.includes(term),term);
 assert.ok(p.includes("A versão oficial")||p.includes("PRODUÇÃO PRESERVADA"));
});
test("Consulta rejeita fonte com identidades e contagens inconsistentes",()=>{
 const runtime=candidate.find(x=>x.id==="cr-v12-auditoria-importada-runtime").source;
 assert.match(runtime,/FONTE_NAO_CONFIRMADA/);assert.match(runtime,/TOTAL_INCONSISTENTE/);
 assert.match(runtime,/w\.count-w\.unique_codes!==w\.duplicate_card_entries/);
});
test("Somente 1 banner de candidata, preview mantido",()=>{assert.equal(p.split('id="cr-period-candidate-banner"').length-1,1);assert.ok(p.includes('id="crp-period-send-v2"')||p.includes('id="cr-period-send"'))});
