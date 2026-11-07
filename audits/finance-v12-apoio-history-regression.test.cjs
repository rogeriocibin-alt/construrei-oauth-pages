"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const file=path.join(__dirname,"../production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html");
const html=fs.readFileSync(file,"utf8");
const between=(a,b)=>{const from=html.indexOf(a),to=html.indexOf(b,from+a.length);assert.ok(from!==-1&&to!==-1,"marcadores de código não localizados");return html.slice(from,to)};
const full=between("function acertoCompleteText(rows,period)","async function copyAcerto()");
const summary=between("function acertoSummaryText(rows,period)","function acertoWhatsApp(rows)");
assert.doesNotMatch(full,/🛠️ APOIO\s*\/\s*DI[ÁA]RIAS/u);
assert.doesNotMatch(summary,/🛠️ APOIO\s*\/\s*DI[ÁA]RIAS/u);
const helper=between("function crV12RemoveApoioResumo(value){","function showHistoryText(title,contents,sourceUrl,note){");
const sandbox={};
vm.runInNewContext("function crV12RemoveApoioResumo(value){"+helper+"\nthis.clean=crV12RemoveApoioResumo;",sandbox);
const before=[
"✅ Capital de Giro — ajuste: R$ 86,21",
"",
"🛠️ APOIO / DIÁRIAS",
"",
"Éder: R$ 150,00",
"",
"━━━━━━━━━━━━━━━━━━━━━━",
"1️⃣0️⃣ OBRA 812-26",
"CUSTO REAL: Apoio Éder R$ 150,00",
"",
"━━━━━━━━━━━━━━━━━━━━━━",
"🛠️ APOIO / DIÁRIAS",
"━━━━━━━━━━━━━━━━━━━━━━",
"",
"Fabrício: R$ 150,00",
"",
"Éder: R$ 150,00",
"",
"━━━━━━━━━━━━━━━━━━━━━━",
"✅ TOTAL DISTRIBUÍDO",
"R$ 4.661,03"
].join("\n");
const after=sandbox.clean(before);
assert.doesNotMatch(after,/APOIO\s*\/\s*DI[ÁA]RIAS/u);
assert.doesNotMatch(after,/^Fabrício: R\$ 150,00/mu);
assert.doesNotMatch(after,/^Éder: R\$ 150,00/mu);
assert.match(after,/CUSTO REAL: Apoio Éder R\$ 150,00/u);
assert.match(after,/R\$ 4\.661,03/u);
assert.match(after,/1️⃣0️⃣ OBRA 812-26/u);
assert.equal(after,sandbox.clean(after),"sanitização idempotente");
assert.equal(sandbox.clean("CUSTO REAL: Apoio Éder R$ 150,00"),"CUSTO REAL: Apoio Éder R$ 150,00","custo isolado não deve ser removido");
assert.ok(html.includes('copy.textContent="COPIAR TEXTO";'),"botão histórico sem etiqueta de cópia integral");
assert.ok(html.includes("const text=crV12RemoveApoioResumo(String(contents||\"\").trim());"),"visualização e cópia utilizam saneamento");
console.log("PASS: novos acertos e histórico sem resumos redundantes, mantendo custos, totais e fonte original");
