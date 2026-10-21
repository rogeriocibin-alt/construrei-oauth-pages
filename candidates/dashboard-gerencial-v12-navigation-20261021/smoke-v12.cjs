// CONSTRU-REI V12 — teste estático sem rede e sem dados financeiros reais
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const p=path.join(__dirname,'index.html');
const s=readFileSync(p,'utf8');
let checks=0;
function check(condition,description){assert.ok(condition,description);checks++;}
const sections=[...s.matchAll(/<section id="([^"]+)" class="section(?: on)?"/g)].map(x=>x[1]);
check(sections.length===8,'Oito seções operacionais da V11 preservadas');
check(new Set(sections).size===8,'Sem seções repetidas');
for(const id of ['agora','corapro','cora','fin','hist','conc','cost','qual'])check(sections.includes(id),'Seção '+id+' preservada');
const nav=[...s.matchAll(/class="tab(?: on)?" data-t="([^"]+)"/g)].map(x=>x[1]);
check(nav.join('|')==='agora|corapro|cora|fin|hist|conc','Seis ambientes primários na ordem aprovada');
check(s.includes('const parent=id==="cost"?"fin":id==="qual"?"conc":id'),'Subabas associadas ao ambiente pai');
check(s.includes('V12_SOMENTE_LEITURA'),'Gravações bloqueadas na candidata');
check(s.indexOf('id="v12-netguard"')<s.indexOf('async function api('),'Bloqueio presente antes do runtime de API');
check(s.includes('allowedLogin')||s.includes('const login=method==="POST"'),'Login autorizado sem liberar lançamentos');
check(s.includes('cr-cora-pro-v2-frame'),'Cora Pro V2 integrado');
check(s.includes('gestao-cora-pro-v2-20261020'),'Mesmo Cora Pro V2 homologado');
check(s.includes('v12-bank-audit'),'Quadros de auditoria bancária');
check(s.includes('37 com zeros substitutos'),'Saldo ausente não confundido com zero');
check(s.includes('Agosto/2023: R$ 300,00'),'Divergência histórica sinalizada');
check(s.includes('Dezembro/2023: R$ 200,00'),'Segunda divergência histórica sinalizada');
check(s.includes('R$ 385,11'),'Reconciliação capital de giro registrada');
check(s.includes('N/D · bases distintas'),'Margem de bases divergentes não é apresentada');
check(s.includes('N/D · parcial'),'Histórico parcial explicitado');
check(s.includes('V12 · VALIDAÇÃO'),'Candidata claramente identificada');
check(s.includes('background:#f5f9fc')&&s.includes('#16975e')&&s.includes('#d64c59'),'Semântica cromática aplicada');
check(s.includes('max-width:550px'),'Regras responsivas móveis');
check(!/BEGIN (RSA )?PRIVATE KEY|client_secret\s*[:=]/i.test(s),'Sem segredo bancário embutido');
const scripts=[...s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
check(scripts.length>=3,'Scripts inline presentes');
for(const [i,m] of scripts.entries()){new vm.Script(m[1],{filename:'candidate-inline-'+i+'.js'});checks++;}
const selectors=[...s.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
const unique=new Set(selectors);
check(unique.size===selectors.length,'Todos os IDs únicos no DOM');
console.log('V12 smoke aprovado:',checks,'verificações offline e',scripts.length,'scripts válidos');
