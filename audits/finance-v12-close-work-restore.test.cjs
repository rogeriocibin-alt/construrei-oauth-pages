"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const prod=fs.readFileSync("production/dashboard-financeiro-v12-homologada-20261022/index.html","utf8");
const valid=fs.readFileSync("production/dashboard-financeiro-v12-validacao-20261021/index.html","utf8");
test("V12 homologada e V12 validacao usam o mesmo binario",()=>assert.equal(prod,valid));
test("Fechar Obra volta a ser exibido sem remover os demais bloqueios",()=>{
 assert.match(prod,/id="mc_close" class="manualbtn" onclick="manualCloseWork\(\)"/);
 assert.doesNotMatch(prod,/#cora \.manualactions #mc_close\{display:none!important\}/);
 assert.match(prod,/#cora \.manualactions #mc_close\{display:inline-flex!important\}/);
 assert.match(prod,/V12_SOMENTE_LEITURA/);
 assert.match(prod,/const safeClose=method==="POST".*?url\.searchParams\.get\("api"\)==="manual-close-work"/);
 assert.match(prod,/&&!safeClose\)return Promise\.reject/);
});
test("Fechamento exige preview do servidor, confirmacao e estado atual da obra",()=>{
 assert.match(prod,/closurePost\(\{case:caseNo,dry_run:true\}\)/);
 assert.match(prod,/expected_card_id:t\.card_id,expected_fingerprint:pre\.fingerprint,preview_at:pre\.preview_at/);
 assert.match(prod,/require_preview:true/);
 assert.match(prod,/!confirm\(previewText/);
 assert.match(prod,/if\(pre\.duplicate\)\{b\.disabled=true;return\}/);
 assert.match(prod,/if\(b\.disabled\|\|S\.manualCloseInFlight\)return/);
 assert.match(prod,/Não movimenta o saldo Cora nem faz pagamento/);
});
test("JS inline do controlador de fechamento e guarda de rede tem sintaxe valida",()=>{
 const f=prod.match(/async function manualCloseWork\(\)\{[\s\S]*?(?=\nfunction manualClear\(\))/);
 assert.ok(f,"controlador da V12 nao encontrado");
 assert.doesNotThrow(()=>new vm.Script(f[0]));
 const guard=prod.match(/<script id="v12-netguard">([\s\S]*?)<\/script>/);
 assert.ok(guard,"guarda da V12 nao encontrada");
 assert.doesNotThrow(()=>new vm.Script(guard[1]));
});
