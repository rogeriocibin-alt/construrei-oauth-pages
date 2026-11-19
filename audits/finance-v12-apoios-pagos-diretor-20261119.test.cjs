"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html"),"utf8");

test("support payments are a dated Director attestation, not assumed bank matches",()=>{
  assert.match(html,/CONFIRMAÇÃO DO DIRETOR 19\/11\/2026/);
  assert.match(html,/foram pagos, conforme declaração expressa de Rogério Cibin/);
  assert.match(html,/vinculação bancária por destinatário e ID permanece parcial/);
  assert.match(html,/Apoios de R\$ 150 PAGOS · confirmação Diretor 19\/11/);
  assert.match(html,/Não são dívidas em aberto/);
});

test("summary derives both paid amounts and counts from authenticated audit rows",()=>{
  assert.match(html,/id="cr-v12-paid-fabricio"/);
  assert.match(html,/id="cr-v12-paid-eder"/);
  assert.match(html,/id="cr-v12-paid-total"/);
  assert.match(html,/confirmed\.reduce\(\(n,x\)=>n\+x\.eligible_150_count,0\)/);
  assert.match(html,/confirmed\.reduce\(\(n,x\)=>n\+x\.eligible_150_cents,0\)/);
  assert.match(html,/\.filter\(x=>!x\.exact_duplicate\)/);
  assert.doesNotMatch(html,/R\$\s?27\.900,00|R\$\s?14\.100,00|R\$\s?13\.800,00/);
});

test("bank reconciliation, historical profit and support costs remain three distinct sources",()=>{
  assert.match(html,/três informações distintas/);
  assert.match(html,/PIX de apoios identificados no Cora · parcial/);
  assert.match(html,/não somar pagamentos duas vezes/);
  assert.match(html,/sem soma ou baixa automática/);
  assert.doesNotMatch(html,/half_150_cents|50% dos apoios|Parcela Fabrício de 50%/i);
});

test("paid-support overview fits the existing mobile navigation",()=>{
  assert.match(html,/\.v12-paid-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(html,/@media\(max-width:650px\)[^{]*\{[^}]*\.v12fin-nav/);
  assert.match(html,/\.v12-paid-total\{grid-column:1\/-1\}/);
  assert.match(html,/href="#cr-v12-director-supports"/);
});
