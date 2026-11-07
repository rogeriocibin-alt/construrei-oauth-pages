"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");
const path = require("node:path");
const vm = require("node:vm");

const root=path.join(__dirname,"../production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html");
const html=fs.readFileSync(root,"utf8");
for(const m of html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g)){
  assert.doesNotThrow(()=>new vm.Script(m[1]),"dashboard inline scripts must compile");
}
assert.match(html,/const historicalTest=newest\.period_key==="2026-10-24_2026-11-06"/);
assert.match(html,/HISTÓRICO DO TESTE ANTERIOR/);
assert.match(html,/Os números congelados desta tela não são a prévia revisada para aprovação/);
assert.match(html,/Não reenviar nem gerar outro Capital de Giro/);
assert.match(html,/const historicalTest=cut\.period_key==="2026-10-24_2026-11-06"/);
assert.match(html,/HISTÓRICO CONGELADO DO TESTE 24\/10 A 06\/11\/2026 — NÃO UTILIZAR PARA APROVAÇÃO/);
assert.match(html,/function crV12RemoveApoioResumo\(value\)/);
assert.match(html,/id="cr-v12-five-nav-20261107-js"/);
assert.match(html,/function crpRecoveryPreview\(\)/);
assert.match(html,/function crpRecoveryCommit\(\)/);
assert.match(html,/function crpData\(\)/);
const historySection=html.slice(html.indexOf("function render(){",html.indexOf('id="cr2026-history-runtime"')),html.indexOf("function crV12RemoveApoioResumo(value)"));
assert.doesNotMatch(historySection,/\bfetch\s*\(|\bPOST\b|crpApi\s*\(/);
console.log("PASS: historical test snapshot explicitly marked, approved source untouched, no financial write logic");
