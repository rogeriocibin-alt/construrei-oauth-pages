const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const html=fs.readFileSync(path.resolve(__dirname,"../production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html"),"utf8");
const start=html.indexOf("function renderCapitalBalance(){");
const end=html.indexOf("\nfunction fy(",start);
function capitalHtml(capital){
  assert.ok(start>=0&&end>start,"renderCapitalBalance encontrado");
  const host={innerHTML:""};
  const context={
    S:{capital},
    document:{getElementById(id){assert.equal(id,"cap");return host}},
    brl:cents=>"R$ "+(Number(cents)/100).toFixed(2),
    esc:value=>String(value??"")
  };
  vm.runInNewContext(html.slice(start,end)+"\nrenderCapitalBalance();",context);
  return host.innerHTML;
}
test("saldo do Capital de Giro está visível no KPI executivo",()=>{
  assert.equal((html.match(/id="v12ex-capital-balance"/g)||[]).length,1);
  assert.equal((html.match(/id="v12ex-capital-note"/g)||[]).length,1);
  assert.match(html,/data-go="capital"/);
});
test("consulta Capital independente de anos, Cora e GestãoClick",()=>{
  assert.match(html,/void refreshCapital\(\);try\{const nowTs/);
  assert.doesNotMatch(html,/S\.capital=e;/);
  assert.match(html,/cache:"no-store",signal:AbortSignal\.timeout\(25000\)/);
  assert.match(html,/id="v12cap-update" onclick="refreshCapital\(\)"/);
});
test("saldo conciliado do Trello é exibido sem substituir saldo Cora",()=>{
  const htmlSaldo=capitalHtml({ok:true,capital_generated:22187.79,net_consumed:21038.54,real_balance:1149.25,pending_current_acerto:232.74,periods:28});
  assert.match(htmlSaldo,/R\$ 1149\.25/);
  assert.match(htmlSaldo,/Gerado − consumido = disponível/);
  assert.match(htmlSaldo,/não é saldo bancário Cora/);
});
test("erro de consulta nunca é transformado em saldo zero",()=>{
  const absent=capitalHtml(null);
  assert.match(absent,/Não foi possível confirmar os saldos/);
  assert.doesNotMatch(absent,/R\$ 0\.00/);
});
test("saldo divergente não recebe selo de conferência",()=>{
  const mismatch=capitalHtml({ok:true,capital_generated:22187.79,net_consumed:21038.54,real_balance:1300,pending_current_acerto:232.74,periods:28});
  assert.match(mismatch,/Conferência matemática pendente/);
});
test("todos os scripts inline mantêm sintaxe válida",()=>{
  const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length>0);
  for(const [index,match] of scripts.entries())assert.doesNotThrow(()=>new vm.Script(match[1]),"script "+index);
});
