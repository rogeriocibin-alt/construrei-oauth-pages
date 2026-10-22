import assert from "node:assert/strict";
import {rateioCanonico,conciliarValores,deduplicarMovimentos,rotuloAcerto,centavos,classificarSaldoCora,classificarCompetenciaCora,verificarMargemConsolidada} from "./finance-core.mjs";
const r=rateioCanonico(49800);
assert.deepEqual(r,{fabricio:9960,eder:13944,rogerio:13944,gabrielly:6972,capitalGiro:4980});
assert.equal(Object.values(rateioCanonico(1)).reduce((a,b)=>a+b,0),1);
assert.equal(Object.values(rateioCanonico(184419)).reduce((a,b)=>a+b,0),184419);
assert.equal(conciliarValores({receitaCentavos:120000,custoCentavos:70200}).lucroCentavos,49800);
assert.equal(conciliarValores({receitaCentavos:0,custoCentavos:0}).margemPercentual,null);
assert.equal(centavos(1.23),123);
assert.throws(()=>rateioCanonico(100,{historico:true}));
assert.throws(()=>rateioCanonico(-1));
const d=deduplicarMovimentos([{origem:"CORA",sourceId:"abc"},{origem:"CORA",sourceId:"abc"},{origem:"TRELLO",sourceId:"abc"},{sourceId:""}]);
assert.equal(d.unicos.length,2);assert.equal(d.rejeitados.length,1);assert.equal(d.semId.length,1);
assert.equal(rotuloAcerto({calculado:true}),"CALCULADO_NAO_PAGO");
assert.equal(rotuloAcerto({registrado:true,pago:true}),"PAGO_REGISTRADO");
assert.equal(rotuloAcerto({pago:true}),"DIVERGENTE");
console.log("V12 — 12 verificações financeiras básicas aprovadas (fixtures, não conciliação real).");

const now=new Date("2026-10-22T00:30:00Z");
const oficial={balance_centavos:3027241,updated_at:"2026-10-22T00:25:00Z",source:"CORA_OFFICIAL_API"};
assert.equal(classificarSaldoCora({snapshot:oficial,agora:now}).status,"CONFIRMADO");
assert.equal(classificarSaldoCora({snapshot:oficial,agora:now}).saldoCentavos,3027241);
assert.equal(classificarSaldoCora({snapshot:{...oficial,updated_at:"2026-10-21T22:00:00Z"},agora:now}).status,"DESATUALIZADO");
assert.equal(classificarSaldoCora({monthlySummary:{end_balance_centavos:0},agora:now}).saldoCentavos,null);
assert.equal(classificarSaldoCora({snapshot:{...oficial,source:"MANUAL"},agora:now}).status,"NAO_COMPROVADO");
assert.equal(classificarCompetenciaCora({statusImportacao:"complete",origem:"CORA_STATEMENT_SUM_RECONCILED",saldoInicial:0,saldoFinal:0}),"SEM_COMPROVACAO");
assert.equal(classificarCompetenciaCora({statusImportacao:"complete",origem:"CORA_OFFICIAL_AGGREGATIONS",saldoInicial:100,saldoFinal:200}),"CONCILIADA");
assert.equal(classificarCompetenciaCora({statusImportacao:"complete",origem:"CORA_OFFICIAL_AGGREGATIONS",saldoInicial:100,saldoFinal:200,divergenciaCentavos:1}),"DIVERGENTE");
console.log("V12 — testes adicionais de proveniência Cora (fixtures, não saldo real).");

const consistente=verificarMargemConsolidada({receitaCentavos:100000,custoCentavos:70000,lucroCentavos:30000,coberturaPercentual:100,pendencias:0});
assert.equal(consistente.status,"ARITMETICA_CONSISTENTE_NAO_HOMOLOGADA");
assert.equal(consistente.margemPercentual,30);
assert.equal(verificarMargemConsolidada({receitaCentavos:null,custoCentavos:0,lucroCentavos:0,coberturaPercentual:100}).status,"BASE_INCOMPLETA");
assert.equal(verificarMargemConsolidada({receitaCentavos:10000,custoCentavos:1000,lucroCentavos:8000,coberturaPercentual:100}).status,"BASES_DIVERGENTES");
assert.equal(verificarMargemConsolidada({receitaCentavos:10000,custoCentavos:1000,lucroCentavos:9000,coberturaPercentual:82}).status,"CONCILIACAO_PENDENTE");
assert.equal(verificarMargemConsolidada({receitaCentavos:10000,custoCentavos:1000,lucroCentavos:9000,coberturaPercentual:100,pendencias:1}).margemPercentual,null);
assert.equal(verificarMargemConsolidada({receitaCentavos:10000,custoCentavos:1000,lucroCentavos:9000,coberturaPercentual:100,historicoNaoConciliado:true}).margemPercentual,null);
const ponderada=verificarMargemConsolidada({receitaCentavos:110000,custoCentavos:90000,lucroCentavos:20000,coberturaPercentual:100});
assert.equal(ponderada.margemPercentual,18.18); // não média simples de 50% e 16,67%
console.log("V12 — 8 cenários adicionais de conciliação de margem aprovados (fixtures).");


import {apurarObrasComparaveis} from "./finance-core.mjs";
const comps=apurarObrasComparaveis([
 {case:"1-26",gross_cents:120000,cost_cents:80000,profit_cents:40000},
 {case:"2-26",gross_cents:20000,cost_cents:25000,profit_cents:-5000},
 {case:"3-26",gross_cents:10000,cost_cents:null,profit_cents:3000},
 {case:"4-26",gross_cents:5000,cost_cents:1000,profit_cents:4000},
 {case:"4-26",gross_cents:5000,cost_cents:1000,profit_cents:4000},
 {case:"5-26",gross_cents:10000,cost_cents:2000,profit_cents:7000}
]);
assert.equal(comps.total,5);
assert.equal(comps.elegiveis,2);
assert.equal(comps.receitaCentavos,140000);
assert.equal(comps.custoCentavos,105000);
assert.equal(comps.lucroCentavos,35000);
assert.equal(comps.margemPercentual,25);
assert.equal(comps.status,"SUBCONJUNTO_PARCIAL");
assert.equal(apurarObrasComparaveis([]).status,"SEM_BASE_COMPARAVEL");
assert.equal(apurarObrasComparaveis([{case:"a",gross_cents:100,cost_cents:40,profit_cents:60}]).status,"SUBCONJUNTO_CONSISTENTE");
assert.throws(()=>apurarObrasComparaveis({}));
console.log("V12 — subtotal válido calculado em cenários parciais sem inventar resultado total.");


import {conciliarSerieCora} from "./finance-core.mjs";
const monthsCora=[
 {period_start:"2023-01-01",source:"CORA_OFFICIAL_AGGREGATIONS",status:"complete",credit_centavos:200,debit_centavos:100,observed_credit_centavos:200,observed_debit_centavos:100,start_balance_centavos:1000,end_balance_centavos:1100,last_error:null},
 {period_start:"2023-02-01",source:"CORA_STATEMENT_SUM_RECONCILED",status:"complete",credit_centavos:70,debit_centavos:20,observed_credit_centavos:70,observed_debit_centavos:20,start_balance_centavos:0,end_balance_centavos:0,last_error:null},
 {period_start:"2023-03-01",source:"CORA_OFFICIAL_AGGREGATIONS",status:"complete",credit_centavos:30,debit_centavos:90,observed_credit_centavos:30,observed_debit_centavos:90,start_balance_centavos:1150,end_balance_centavos:1090,last_error:null}
];
const chain=conciliarSerieCora(monthsCora,{amount_centavos:1090,source:"CORA_OFFICIAL_API"});
assert.equal(chain.status,"CONCILIACAO_ARITMETICA_CONFIRMADA");
assert.equal(chain.periodos,3);assert.equal(chain.fluxosConferidos,3);
assert.equal(chain.saldosOficiaisConferidos,2);assert.equal(chain.saldosDerivados,1);
assert.equal(chain.diferencaFinalCentavos,0);assert.equal(chain.rows[1].origemSaldo,"DERIVADO_POR_EXTRATO");
assert.equal(chain.rows[1].fechamentoCentavos,1150);
assert.equal(conciliarSerieCora(monthsCora,{amount_centavos:1091,source:"CORA_OFFICIAL_API"}).status,"DIVERGENCIA_PENDENTE");
assert.equal(conciliarSerieCora(monthsCora.map((m,i)=>i===1?{...m,observed_credit_centavos:71}:m),{amount_centavos:1090}).status,"DIVERGENCIA_PENDENTE");
assert.equal(conciliarSerieCora(monthsCora.filter((m,i)=>i!==1),{amount_centavos:1090}).status,"LACUNA_MENSAL");
assert.equal(conciliarSerieCora(monthsCora.map((m,i)=>i===2?{...m,end_balance_centavos:1091}:m),{amount_centavos:1090}).status,"DIVERGENCIA_PENDENTE");
assert.equal(conciliarSerieCora(monthsCora.map((m,i)=>i===1?{...m,last_error:"timeout"}:m),{amount_centavos:1090}).status,"IMPORTACAO_INCOMPLETA");
assert.equal(conciliarSerieCora(monthsCora,{amount_centavos:1090,source:"MANUAL"}).status,"DIVERGENCIA_PENDENTE");
const legacy=conciliarSerieCora(monthsCora.map((m,i)=>i===1?{...m,start_balance_centavos:1100,end_balance_centavos:1170}:m),{amount_centavos:1090});
assert.equal(legacy.status,"CONCILIACAO_ARITMETICA_CONFIRMADA");
assert.equal(legacy.legadosDivergentes,1); // erro legado NÃO desclassifica soma bancária
console.log("V12 — conciliação UTC com âncoras oficiais, saldos derivados e teste de divergências.");
