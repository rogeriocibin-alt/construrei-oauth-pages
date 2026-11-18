"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html"),"utf8");

test("2026: no 50 percent support rule or double-counted earnings",()=>{
  assert.doesNotMatch(html,/50% dos apoios|Parcela Fabrício de 50%|half_150_cents/i);
  assert.doesNotMatch(html,/Rateio \+ parcela dos apoios/i);
});

test("2026: both partners show full R$ 150 support lines separately",()=>{
  assert.match(html,/key==="Fabricio"\|\|key==="Eder"/);
  assert.match(html,/eligible_150_cents\+=15000/);
  assert.match(html,/Apoios de R\$ 150 · auditoria 18\/11/);
  assert.match(html,/Valores integrais da auditoria|Valores integrais\./);
});

test("2026: rates remain distinct from Cora payments",()=>{
  assert.match(html,/Rateio declarado no Trello JAN–NOV\/2026/);
  assert.match(html,/PIX Cora identificado\(s\)/);
  assert.match(html,/cr-v12-annual-2026-data/);
});
