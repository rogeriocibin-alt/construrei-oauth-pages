"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=__dirname;
const production=fs.readFileSync(path.join(root,"production.html"),"utf8");
const candidate=fs.readFileSync(path.join(root,"candidate.html"),"utf8");
const backup=fs.readFileSync(path.join(root,"backup.html"),"utf8");
const scripts=src=>[...src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(([,,js])=>js);
test("old homologated HTML is preserved and not overwritten by fixture",()=>{assert.ok(backup.length>300000);assert.match(backup,/CR-V12-OPERACAO-HOMOLOGADA-ACERTOS-BRUTO-TAXA-20261023/)});
test("promoted HTML matches exact tested candidate except build label",()=>{
 assert.equal(production.replace("CR-V12-OPERACAO-HOMOLOGADA-MANUAL-AUDITORIA-20261028","CR-V12-OPERACAO-HOMOLOGADA-ACERTOS-BRUTO-TAXA-20261023"),candidate)
});
test("every script parses, with same script count as candidate",()=>{
 const a=scripts(production),b=scripts(candidate);
 assert.equal(a.length,b.length);for(const js of a)assert.doesNotThrow(()=>new vm.Script(js));
});
test("audited imported works available, never treated as real-time Cora",()=>{
 assert.match(production,/cr-v12-audit-imported-readonly-runtime/);
 assert.match(production,/SUPABASE_TRELLO_2026_IMPORT_NOT_LIVE_TRELLO/);
 assert.match(production,/source_import_cutoff/);
});
test("manual preflight validation is present in the official HTML",()=>{
 assert.match(production,/manualValidateFields/);
 assert.match(production,/if\(!manualValidateFields\(\)\)return/);
 assert.match(production,/MISSING_FINANCIAL_DETAILS/);
 assert.match(production,/mc-required-help/);
});
test("manual writes require preview and explicit commit",()=>{
 assert.match(production,/v12ProtectedWrite\("preview",p\)/);
 assert.match(production,/v12ProtectedWrite\("commit",p\)/);
 assert.match(production,/JSON\.stringify\(p\)!==S\.manualPreviewPayload/);
});
test("operational finance modules persist",()=>{
 for(const str of ["cr-v12-earnings-support-and-history","cr-v12-trello-financial-withdrawals-live","crp-period-send-v2","cr-v12-withdraw-history-runtime","v12-capital-workspace","cr-ap-note-only"])assert.ok(production.includes(str),str);
});
test("expenses, payments and notes remain separate",()=>{
 assert.match(production,/Anotação informativa no Extrato Cora/);
 assert.match(production,/para não duplicar despesas/);
});
test("no leaked privileged credentials",()=>{assert.doesNotMatch(production,/SUPABASE_SERVICE_ROLE_KEY|sb_secret_[A-Za-z0-9]{16}|TRELLO_API_TOKEN|TRELLO_API_KEY/);});
test("release document identifies rollback and limitations",()=>{
 const doc=fs.readFileSync(path.join(root,"release.md"),"utf8");
 assert.match(doc,/rollback|reversão/i);assert.match(doc,/sem E2E|não foi executado E2E|E2E bancário não executado/i);
});
