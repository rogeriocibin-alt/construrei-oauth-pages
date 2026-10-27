"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm"),test=require("node:test"),assert=require("node:assert/strict");
const ROOT=path.join(__dirname,".."),HTML=fs.readFileSync(path.join(ROOT,"preview/financeiro-v12-diretoria-r2-20261027/index.html"),"utf8");
const JS=(HTML.match(/<script>([\s\S]*?)<\/script>/)||[])[1];
test("standalone candidate has parseable browser JavaScript",()=>{assert.ok(JS);assert.doesNotThrow(()=>new vm.Script(JS))});
test("five independent navigation panes, responsive and screen-reader labels",()=>{
for(const id of ["summary","people","costs","issues","close"])assert.match(HTML,new RegExp('id="'+id+'" class="pane'));
assert.match(HTML,/@media\(max-width:620px\)/);
assert.match(HTML,/aria-label="Seções da diretoria"/);
});
test("does not mutate bank or Trello; only POST is login",()=>{
assert.equal((JS.match(/method:"POST"/g)||[]).length,1);
assert.match(JS,/api=login/);
assert.doesNotMatch(JS,/\bmethod:"(?:PUT|PATCH|DELETE)"/);
assert.doesNotMatch(JS,/crpSend\(|snapshotAcerto\(|updateCard\(/);
});
test("2023 remains Cora banking only and no operative KPI",()=>{
assert.match(JS,/if\(selectedYear==="2023"\)/);
assert.match(JS,/2023 não possui indicadores operacionais de obras/);
assert.match(HTML,/2023 · Cora apenas/);
});
test("2024 2025 2026 annual source scopes prevent misleading totals",()=>{
assert.match(JS,/TRELLO_HISTORICAL_ALLOCATION_PARTIAL/);
assert.match(JS,/TRELLO_GROSS_RECONCILED_PROFIT_PARTIAL/);
assert.match(JS,/TRELLO_DECLARED_UNRECONCILED/);
assert.match(JS,/Bruto das obras operacionais/);
assert.match(JS,/Bruto do resumo canônico para acertos/);
});
test("unavailable values are not converted to zero reais",()=>{
assert.match(JS,/const mny=c=>c!==null&&c!==undefined&&c!==""/);
const slice=JS.slice(JS.indexOf("const mny="),JS.indexOf("const pc="));
const obj=vm.runInNewContext(slice+"\n({mny,num})",{Intl,Number});
assert.equal(obj.mny(null),"Não confirmado");
assert.equal(obj.mny(undefined),"Não confirmado");
assert.equal(obj.mny(0),"R$ 0,00");
assert.equal(obj.mny(4246287),"R$ 42.462,87");
assert.equal(obj.num(null),"—");
});
test("person earnings have separately labeled Trello, support and bank components",()=>{
for(const phrase of ["RATEIO DO TRELLO","APOIO / DIÁRIA DE OBRA","SAQUE COMPROVADO NO CORA","João/João Victor","Gabrielly"])assert.ok(JS.includes(phrase)||HTML.includes(phrase),phrase);
assert.doesNotMatch(JS,/rateio\+apoio\+banco/);
});
test("raw cost intelligence has coverage and unclassified queue",()=>{
for(const phrase of ["api=costs","by_category","NÃO CLASSIFICADO","costlines","Cobertura da classificação","viewunknown"])assert.ok(HTML.includes(phrase),phrase);
});
test("issues list is filterable with Trello evidence links",()=>{
for(const phrase of ["issuefilter","issueRows","difference","r.short_url","BASE_MENOS_CUSTO","Ver obra"])assert.ok(HTML.includes(phrase),phrase);
});
test("closing wizard never submits anything",()=>{
assert.match(JS,/closeCheck\(\)/);
assert.match(JS,/days>90/);
assert.match(HTML,/NÃO envia cartões/);
assert.match(HTML,/proteção contra duplicidade/);
assert.match(JS,/window\.open\(OFFICIAL/);
assert.doesNotMatch(JS,/\bcrpSend\(/);
});
test("year and month filters, timestamps and auth safety exist",()=>{
assert.match(JS,/selectedMonth\?"&month="/);
assert.match(JS,/data\.loadedAt/);
assert.match(JS,/sessionStorage\.getItem\("crv2"\)/);
assert.match(JS,/SESSÃO_EXPIRADA/);
assert.doesNotMatch(HTML,/SUPABASE_SERVICE_ROLE_KEY|TRELLO_API_TOKEN|TRELLO_API_KEY/);
});
test("HTML id tokens unique",()=>{
const ids=[...HTML.matchAll(/<[^>]*\bid="([^"]+)"/g)].map(m=>m[1]);
const seen=new Set(),dups=[];
for(const id of ids){if(seen.has(id))dups.push(id);seen.add(id)}
assert.deepEqual(dups,[]);
});

test("month filter cannot silently compare annual financial total with one operating month",()=>{
assert.match(JS,/if\(month>0\)\{accepted=\{gross:m\.gross_cents/);
assert.match(JS,/const difference=month>0\?null/);
assert.match(JS,/shares=month>0\?\{\}/);
assert.match(JS,/Filtro mensal mostra apenas rateios identificados nas obras/);
});
test("health status separates online/auth from accounting reconciliation",()=>{
assert.match(JS,/Conexão autenticada — dado ≠ conciliado/);
assert.match(JS,/Classificabilidade, conciliação Cora e fechamento financeiro são indicadores DIFERENTES/);
});
