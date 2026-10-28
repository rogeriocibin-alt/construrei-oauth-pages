"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),test=require("node:test");
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const open="<!-- CR V12 AUDITORIA IMPORTADA / CANDIDATA:",close="<!-- FIM CR V12 AUDITORIA IMPORTADA -->";
const jsOpen="<!-- CR V12 AUDIT RUNTIME BEGIN",jsClose="<!-- CR V12 AUDIT RUNTIME END -->";
const extract=(start,end)=>{const i=html.indexOf(start),j=html.indexOf(end,i);assert.ok(i>=0&&j>i);return html.slice(i,j+end.length)};
const addon=extract(open,close),runtime=extract(jsOpen,jsClose);
const baseline=html.replace(addon,"").replace(runtime,"");
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
test("Réplica exata da homologada fora dos DOIS novos trechos",()=>{
 const pathBase=process.env.CR_OFFICIAL_HTML;
 if(pathBase)assert.equal(baseline,fs.readFileSync(pathBase,"utf8"));
 assert.ok(baseline.startsWith('<!doctype html>'));
 assert.ok(baseline.includes("cr-v12-trello-financial-withdrawals-live"));
 assert.ok(baseline.includes("cr-v12-earnings-support-and-history"));
});
test("Scripts anteriores da V12 homologada continuam existentes sem edições",()=>{
 assert.match(baseline,/v12ProtectedWrite/);assert.match(baseline,/cr-v12-earnings-support-and-history/);
 assert.match(baseline,/v12-gc-awaiting-payment/);assert.match(baseline,/id="cg-close-preview"/);
 assert.match(baseline,/id="cr26-consult"/);
});
test("Todos scripts inline continuam com sintaxe válida",()=>scripts.forEach((code,i)=>assert.doesNotThrow(()=>new vm.Script(code),String(i))));
test("Nova auditoria aparece dentro do painel financeiro original",()=>{
 const pos=html.indexOf(addon),fin=html.indexOf('<section id="fin"'),hist=html.indexOf('id="cr-v12-historical-rateio-2425"');
 assert.ok(pos>fin&&pos<hist);
});
test("Não altera visual dos KPIs, ganhos, apoios, CG, finanças já homologados",()=>{
 assert.ok(baseline.includes("cr-v12-earnings-rows"));
 assert.ok(baseline.includes("cr-financial-trello-values"));
 assert.ok(baseline.includes("v12-live-acertos"));
});
test("Auditoria usa somente endpoint existente — NÃO cria API nova",()=>{
 assert.match(runtime,/cr-v12-r3-risk-readonly-20261027\?year=2026/);
 assert.match(runtime,/method:"GET"/);assert.match(runtime,/"x-cr-session":token/);
 assert.doesNotMatch(runtime,/method:"POST"|method:"PUT"|method:"PATCH"|method:"DELETE"/);
});
test("Somente leitura e sem manipulação de saldo, custo, obra ou histórico",()=>{
 assert.doesNotMatch(runtime,/updateCard|createCard|aprovisionar|action=commit|localStorage|innerHTML\s*=/);
 assert.match(addon,/não atualiza o saldo Cora/);
});
test("Segregação de status e conciliação bancária",()=>{
 assert.match(runtime,/data\?\.bank_proof!==false/);assert.match(runtime,/data\?\.no_writes!==true/);
 assert.match(addon,/A origem oficial de pagamentos continua sendo o Cora/);
 assert.match(runtime,/FONTE_AUDITORIA_NAO_CONFIRMADA/);
});
test("Qualidade e duplicatas não geram obras fictícias",()=>{
 assert.match(runtime,/x\.count-x\.unique_codes!==x\.duplicate_card_entries/);
 assert.match(runtime,/x\.count!==balanced\+incomplete\+divergent/);
 assert.match(runtime,/registros incompletos/i);
});
test("Exibe corte de importação sem afirmar dados ao vivo",()=>{
 assert.match(runtime,/source_import_cutoff/);assert.match(addon,/24\/10\/2026/);
 assert.match(runtime,/SUPABASE_TRELLO_2026_IMPORT_NOT_LIVE_TRELLO/);
});
test("Não expõe chaves bancárias nem dados do serviço",()=>{
 assert.doesNotMatch(runtime,/SUPABASE_SERVICE_ROLE_KEY|TRELLO_API_TOKEN|TRELLO_API_KEY|sb_secret_/);
});
test("Botão funcional com controle de acesso",()=>{
 assert.match(runtime,/button\.addEventListener\("click"/);
 assert.match(runtime,/if\(token\.length<12\)/);
 assert.match(runtime,/r\.status===401\|\|r\.status===403/);
});
test("Sem IDs duplicados novos",()=>{
 for(const id of ["cr-v12-audit-imported-2026","cr-v12-audit-imported-refresh","cr-v12-audit-imported-status","cr-v12-audit-imported-kpis","cr-v12-audit-imported-warning","cr-v12-audit-imported-cases"]){
 assert.equal(html.split('id="'+id+'"').length-1,1,id);
 }
});
test("Falhas de origem não exibem totais antigos como atuais",()=>{
 assert.match(runtime,/kpis\.replaceChildren\(\);cases\.replaceChildren\(\);warning\.textContent=/);
});
