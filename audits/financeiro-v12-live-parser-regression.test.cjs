'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const s=fs.readFileSync(path.resolve(__dirname,'../candidates/financeiro-v12-period-close-20261024/trello-gestao-vista-v2-CANDIDATE.ts'),'utf8');
const h=s.slice(s.indexOf('function norm('),s.indexOf('function cnum('));
const a=s.slice(s.indexOf('function analyzeLegacy(c,allowSupport=false){'),s.indexOf('function agg('));
const aggBlock=s.slice(s.indexOf('function agg('),s.indexOf('function desc('));
assert.ok(h.includes('function lm(')&&a.includes('let section="OTHER"'));
const sandbox={derived:()=>false};
vm.runInNewContext(h+'\n'+a+'\n'+aggBlock+'\nthis.analyze=analyze;this.aggregate=agg',sandbox);
const analyze=sandbox.analyze;
const c727={name:'✅ (727-26) R$ 1.902,40',desc:[
'MOVIMENTAÇÕES FINANCEIRAS',
'Valor Fechado: R$ 1.902,40',
'Custos:',
'05/10 - R$ 150,00 Apoio Eder',
'05/10 - R$ 150,00 Apoio Fabrício',
'Total Custos: R$ 1.225,76',
'Saldo / Lucro Líquido: R$ 676,64',
'RATEIO DO LUCRO',
'Fabrício (20%): R$ 135,33',
'Éder (28%): R$ 189,46',
'Rogério (28%): R$ 189,46',
'Gabrielly (14%): R$ 94,73',
'Capital de Giro (10%): R$ 67,66',
'APOIO / DIÁRIAS',
'Éder: R$ 150,00'
].join('\n')};
const c649={name:'✅ (649-26) R$ 970,00',desc:[
'Valor Fechado: R$ 970,00',
'Custos:',
'14/09 - R$150,00 Apoio Éder',
'Total Custos: R$ 562,94',
'Saldo: R$ 407,06',
'Rateio do Lucro:',
'✅ Fabrício 20%: R$ 81,41',
'✅ Éder 28%: R$ 113,98',
'✅ Rogerio 28%: R$ 113,98',
'✅ Gabi 14%: R$ 56,99',
'CAPITAL DE GIRO',
'✅ Capital de Giro',
'10% sobre o lucro: R$ 40,71'
].join('\n')};
test('727: R$150 recap sob APOIO/DIÁRIAS não aumenta rateio',()=>{
 const r=analyze(c727,true);
 assert.equal(r.rate['Éder'],189.46);
 assert.equal(r.sup['Éder'],150);
 assert.equal(r.sup['Fabrício'],150);
 assert.equal(r.cap,67.66);
 assert.equal(r.p,676.64);
});
test('727: resumo não repete apoio como segundo pagamento',()=>{
 const r=analyze(c727,true);
 assert.equal(Math.round((r.rate['Éder']+r.sup['Éder'])*100),33946);
 assert.equal(Math.round((r.rate['Fabrício']+r.sup['Fabrício'])*100),28533);
});
test('649: título CG em uma linha e 10% na seguinte preserva R$40,71',()=>{
 const r=analyze(c649,false);
 assert.equal(r.cap,40.71);
 assert.equal(r.rate['Éder'],113.98);
 assert.equal(r.rate['Fabrício'],81.41);
});
test('CG que aparece no próprio cabeçalho não duplica valor em linha seguinte',()=>{
 const r=analyze({...c649,desc:c649.desc.replace('✅ Capital de Giro\n','✅ Capital de Giro: R$ 40,71\n')});
 assert.equal(r.cap,40.71);
});
test('apoio resumido sem linhas discriminadas só aparece no suporte, não no rateio',()=>{
 const c={...c727,desc:c727.desc.replace('05/10 - R$ 150,00 Apoio Eder\n','')};
 const r=analyze(c,true);
 assert.equal(r.rate['Éder'],189.46);
 assert.equal(r.sup['Éder'],150);
});
test('desligar exibição de apoios não contamina rateio',()=>{
 const r=analyze(c727,false);
 assert.equal(r.rate['Éder'],189.46);
 assert.equal(r.sup['Éder'],0);
});
test('gabarito bruto - custos = lucro permanece independente das notas',()=>{
 for(const c of [c727,c649]) {
  const r=analyze(c,true);
  assert.ok(Math.abs(r.g-r.k-r.p)<0.001);
 }
});
test('código da candidata não é o deploy de produção',()=>{
 assert.match(s,/CANDIDATE: seções de apoio e capital não são rateios/);
 assert.match(s,/section!=="SUPPORT"/);
});

test('711 e 649: R$0,02 de arredondamento são evidenciados, não corrigidos retroativamente',()=>{
 const c711={name:'✅ (711-26) R$ 150,00',desc:[
 'Valor Fechado: R$ 150,00','Custos:','Total Custos: R$ 62,75',
 'Saldo / Lucro Líquido: R$ 87,25','Rateio do Lucro:',
 '✅ Fabrício 20%: R$ 17,45','✅ Éder 28%: R$ 24,43',
 '✅ Rogério 28%: R$ 24,43','✅ Gabi 14%: R$ 12,22',
 'CAPITAL DE GIRO','✅ Capital de Giro 10% sobre o líquido: R$ 8,73'
 ].join('\n')};
 const sum=sandbox.aggregate([c649,c711],false);
 assert.equal(sum.rateio_gap_cents,-2);
 assert.match(s,/Diferença lucro versus rateio \+ CG \(sem ajuste automático\)/);
});

test('cartões 2024 e 2025 seguem exatamente o classificador legado',()=>{
 const oldCase={...c727,name:'✅ (727-25) R$ 1.902,40'};
 const old=sandbox.analyze(oldCase,true);
 assert.equal(Math.round(old.rate['Éder']*100),33946);
 assert.equal(Math.round(old.cap*100),6766);
 assert.match(s,/endsWith\("-26"\)\)return analyzeLegacy\(c,allowSupport\)/);
});

test('627-26 setembro: CG R$32,58 separado em três linhas é recuperado sem alterar lucro',()=>{
 const c={name:'✅ (627-26) R$ 1.320,00',desc:[
  'Valor Fechado: R$ 1.320,00','Custos:','Total Custos: R$ 994,20','Saldo: R$ 325,80',
  'Rateio do Lucro:','Fabrício 20%: R$ 65,16','Éder 28%: R$ 91,22',
  'Rogério 28%: R$ 91,22','Gabi 14%: R$ 45,61',
  'CAPITAL DE GIRO','✅ Capital de Giro','10% sobre o lucro: R$ 32,58'
 ].join('\n')};
 const r=analyze(c,false);
 assert.equal(Math.round(r.cap*100),3258);
 assert.equal(Math.round(r.p*100),32580);
 assert.equal(Math.round(r.rate['Éder']*100),9122);
});
test('655-26 setembro: linha 10% sob cabeçalho capital restitui R$71,57 sem alterar custos',()=>{
 const c={name:'✅ (655-26) R$ 1.765,90',desc:[
  'Valor Fechado: R$ 1.765,90','Custos:','17/09 - R$150,00 Apoio Éder',
  'Total Custos: R$ 1.050,23','💰 LUCRO LÍQUIDO: R$ 715,67',
  'RATEIO DO LUCRO:','Fabrício 20%: R$ 143,13',
  'Éder 28%: R$ 200,39','Rogério 28%: R$ 200,39','Gabi 14%: R$ 100,19',
  '🏦 CAPITAL DE GIRO','✅ 10% sobre o lucro líquido: R$ 71,57'
 ].join('\n')};
 const r=analyze(c,true);
 assert.equal(Math.round(r.cap*100),7157);
 assert.equal(Math.round(r.p*100),71567);
 assert.equal(Math.round(r.k*100),105023);
 assert.equal(Math.round(r.rate['Éder']*100),20039);
});
