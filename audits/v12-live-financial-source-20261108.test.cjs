'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.resolve(__dirname,'../production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html'),'utf8');

test('scripts do Dashboard V12 continuam sintaticamente válidos', ()=>{
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(x=>x.trim());
  assert.ok(scripts.length>=18,'Scripts V12 não encontrados');
  for(const source of scripts)assert.doesNotThrow(()=>new vm.Script(source));
});

test('não há lucro antigo de novembro como título inicial de resultado atual',()=>{
  assert.doesNotMatch(html,/Último corte confirmado no Trello:[\s\S]{0,170}R\$ 4\.681,03/);
  assert.match(html,/GESTÃO FINANCEIRA · NOVEMBRO 2026 · DADO DECLARADO NO TRELLO/);
  assert.match(html,/currentNovember\.source_status==="DECLARED_UNRECONCILED"/);
  assert.match(html,/Number\.isSafeInteger/);
  assert.match(html,/Não somar os dois nem usar o snapshot como total atual/);
});

test('novembro declarado é distinto do snapshot congelado, sem recontagem',()=>{
  const month={gross_cents:1290205,costs_cents:809102,declared_profit_cents:481103};
  const prior={profit_cents:468103};
  assert.equal(month.gross_cents-month.costs_cents,month.declared_profit_cents);
  assert.equal(month.declared_profit_cents-prior.profit_cents,13000);
  assert.match(html,/Não reenviar nem gerar outro Capital de Giro/);
});

test('saldo manual/projeção não se fazem passar por saldo bancário atual',()=>{
  assert.match(html,/SALDO MANUAL INFORMADO · NÃO OFICIAL/);
  assert.match(html,/PROJEÇÃO MANUAL · NÃO OFICIAL/);
  assert.doesNotMatch(html,/SALDO PROJETADO<\/span><b id="mc_balance_projected">R\$ 30\.272,41/);
  assert.match(html,/não é o saldo oficial do Banco Cora/);
});

test('histórico mantém fonte Trello e preserva integração existente',()=>{
  assert.match(html,/Janeiro a novembro: valores declarados nos cartões mensais Trello/);
  assert.match(html,/cr-finance-v12-period-close-candidate-20261024/);
  assert.match(html,/cr-dashboard-gerencial-v4-manual-cora-ui-candidate-20261007/);
  assert.match(html,/cr-trello-capital-giro-v1/);
});

test('Bruto operacional e acertos são fontes distintas e rotuladas',()=>{
  assert.match(html,/BRUTO OPERACIONAL · LISTAS MENSAIS/);
  assert.match(html,/ACERTOS FINANCEIROS DECLARADOS · JAN–NOV\/2026/);
  assert.match(html,/Bruto de obras Jan–Dez/);
  assert.match(html,/não equivale a extrato bancário conciliado/);
  assert.match(html,/monthlySettlementVerified/);
  assert.match(html,/new Set\(receivedMonths\.map\(x=>x\.year_month\)\)\.size===11/);
});
