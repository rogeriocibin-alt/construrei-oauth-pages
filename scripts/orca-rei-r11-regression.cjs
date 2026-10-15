'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=process.cwd();
const base='preview/orca-rei-teste-ia-20261015-r11';
const refined='preview/orca-rei-teste-ia-20261015-r11-refino-pdf1';
const oldApp=fs.readFileSync(base+'/app.js','utf8');
const oldIndex=fs.readFileSync(base+'/index.html','utf8');
const app=fs.readFileSync(refined+'/app.js','utf8');
const index=fs.readFileSync(refined+'/index.html','utf8');
const brand=fs.readFileSync(refined+'/brand.js','utf8');
const brandOriginal=fs.readFileSync('preview/orca-rei-teste-ia-20261014-r9/brand.js','utf8');
function blob(text){const payload=Buffer.from(text,'utf8');return crypto.createHash('sha1').update('blob '+payload.length+'\0').update(payload).digest('hex');}
assert.equal(blob(oldApp),'09cd5a5e348e52fe9d6446b472617a374c775093','R11 base app.js foi alterado: use cópia isolada e restaure do checkpoint');
assert.equal(blob(oldIndex),'75611c9d380b9246a027b58c6ceeaf4d2c801d7e','R11 base index.html foi alterado: use cópia isolada e restaure do checkpoint');
assert.equal(blob(brandOriginal),'e5ae2ee493fe73f44e7d3b7462471d05f2b1fae4','Identidade de marca original mudou');
assert.equal(brand,brandOriginal,'Logo da candidata deve ser idêntica à logo homologada da R11');
new Function(app);
function between(s,start,end){const a=s.indexOf(start),b=s.indexOf(end,a+start.length);assert(a>=0&&b>a,'Seção ausente: '+start);return s.slice(a,b);}
for(const [a,b] of [
 ['async function send(action){',"fetch(endpoint+'?status=1')"],
 ['var crPriceItems=[]','// CR_LOGO_DATA'],
 ['function orcaCanonicalUnit(', 'function orcaInferSubject('],
 ['function orcaBudgetPdfBody(', '\n'] // this last pair intentionally omitted from actual contract below
].slice(0,3)){
 assert.equal(between(app,a,b),between(oldApp,a,b),'Motor/orquestração de preços alterado sem homologação: '+a);
}
assert.match(index,/<script src="\.\/brand\.js"><\/script>/,'Logo deve acompanhar a candidata, sem depender da R9');
assert.match(index,/<script src="\.\/app\.js\?v=/,'Cache-busting obrigatório');
assert.match(index,/Gerar com IA \+ precificar automaticamente/,'Botão automático preservado');
assert.match(app,/cr-orca-rei-context-prices-r11-20261015/,'Endpoint de preços preservado');
assert.match(app,/offset\+=12/,'Processamento em lotes preservado');
assert.match(app,/function orcaParsePriceRow/,'Leitor robusto de composições preservado');
assert.match(app,/position:static!important;bottom:auto!important/,'Rodapé deve fluir após o conteúdo');
assert.doesNotMatch(app,/\.footer\{position:fixed;bottom:0;left:0;right:0;margin:0;min-height:12mm/,'Footer fixo volta a sobrepor conteúdo');
assert.match(app,/Fotografias não comprovam causas/,'Nota de fotos não deve presumir infiltração');
const infer=between(app,'function orcaInferSubject(src){','function orcaBudgetPdfBody(');
const subject=new Function(infer+'return orcaInferSubject;')();
assert.equal(subject('Substituição de vaso sanitário com caixa acoplada; vedação de 3 bacias sanitárias'),'MANUTENÇÃO HIDROSSANITÁRIA');
assert.equal(subject('Vedação de janela e revisão de esquadrias'),'MANUTENÇÃO DE ESQUADRIAS');
assert.equal(subject('Substituir bacia sanitária e revisar janela'),'MANUTENÇÃO PREDIAL • SERVIÇOS DIVERSOS');
function fixture(n){
 let parts=['SERVIÇOS (MÃO DE OBRA)'];
 for(let i=0;i<n;i++){
  if(i===n-3)parts.push('MATERIAIS');
  parts.push((i+1)+'. ITEM '+(i+1));
  parts.push('('+ 'Procedimento técnico compacto.' +')');
  parts.push(i%2?'QTD. / UN. / VR. UNIT. / VR. TOTAL: 2 / UND / A DEFINIR / A DEFINIR':'QTD.: 1 | UN.: UN | VR. UNIT.: A DEFINIR');
 }
 parts.push('RESUMO','TOTAL SERVIÇOS: A DEFINIR','TOTAL MATERIAIS: A DEFINIR','TOTAL GERAL: A DEFINIR');
 return parts.join('\n');
}
function element(tag,refs){
 return {tag,style:{},children:[],value:'',textContent:'',appendChild(child){child.parentElement=this;this.children.push(child);if(child.id)refs[child.id]=child;return child},replaceChildren(){this.children=[]},addEventListener(){},setAttribute(){},remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this)},closest(selector){let p=this;while(p){if(selector==='.crprice-row'&&p.className==='crprice-row')return p;p=p.parentElement}return null},querySelector(selector){return this.children.find(x=>selector==='.crprice-proof'&&x.className==='crprice-proof')||null}};
}
async function smoke(n,failSecond){
 const src=fixture(n);
 const fields={src:{value:src},mode:{value:'budget'},provider:{value:'auto'},pdffiles:{files:[]},out:{textContent:''},label:{textContent:''},status:{textContent:''},ai:{disabled:false},priceStatus:{textContent:''},marketRun:{disabled:false}};
 fields.priceRows=element('div',fields);
 fields.marketProof=element('div',fields);
 const doc={addEventListener(){},getElementById(id){return fields[id]||null},createElement(tag){return element(tag,fields)}};
 let calls=[];
 const fetch=async(uri,opts)=>{
  if(uri.includes('?status=1'))return {status:200,ok:true,json:async()=>({model_available:true})};
  if(uri.includes('test-bench'))return {status:200,ok:true,json:async()=>({ok:true,provider:'Groq gerador (simulado)',output:src})};
  if(uri.includes('context-prices')){
   const batch=JSON.parse(opts.body).items;calls.push(batch.length);
   if(failSecond&&calls.length===2)return {status:422,ok:false,json:async()=>({error:'Erro de teste',invalid_indices:[0]})};
   return {status:200,ok:true,json:async()=>({ok:true,provider:'Motor simulado',items:batch.map(it=>({id:it.id,price:100,status:'estimativa_revisar',unit:it.unit,source_title:'Fixture'}))})};
  }
  throw Error('URI inesperada');
 };
 const run=new Function('document','fetch','window',app+';return send("ai").then(()=>({prices:crPriceItems.map((x,i)=>document.getElementById("crv"+i).value),label:document.getElementById("priceStatus").textContent,text:document.getElementById("out").textContent,diagnostics:document.getElementById("marketProof").children.map(x=>x.textContent)}));');
 const x=await run(doc,fetch,{confirm:()=>true});
 assert.equal(x.prices.length,n);
 assert.deepEqual(calls,n>12?[12,n-12]:[n],'Lotes precisam preservar TODOS os itens');
 assert.equal(x.prices.filter(Boolean).length,failSecond?12:n);
 if(failSecond){assert.match(x.label,/PARCIAL/);assert.match(x.text,/TOTAL GERAL: A DEFINIR/);assert.match(x.diagnostics.join(' '),/422/);}
 else{assert.match(x.label,/CALCULADA/);assert.doesNotMatch(x.text,/TOTAL GERAL: A DEFINIR/);assert.doesNotMatch(x.text,/UN\.: VR\./);}
}
(async()=>{
 await smoke(8,false);
 await smoke(15,false);
 await smoke(15,true);
 console.log('PASS: R11 imutável, logo, identidade, assunto, footer, precificação, lotes 8/15 e erros.');
})().catch(e=>{console.error(e);process.exitCode=1;});
