const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function run(source){
 let writes=0,pending=false,callback,callbacks=0;
 function el(id){let html='',txt='';return {id,dataset:{},value:'',options:[{outerHTML:'<option value="">Todos</option>'}],addEventListener(){},querySelector(){return html.includes('<th>Ação</th>')?{}:null},get innerHTML(){return html},set innerHTML(v){html=v;writes++;pending=true},get textContent(){return txt},set textContent(v){txt=v;writes++;pending=true}}}
 const ids=['crDocQ','crDocCategory','crDocStatus','crDocImportance','crDocFlow','crDocOwner','crDocClear','crDocCount','docsTable','crDocsHeroBtn','crDocsDashCard'];
 let nodes=Object.fromEntries(ids.map(id=>[id,el(id)]));
 let win={__CR_DEV:{docs:[{code:'DEMO-001',title:'Teste sintético',category:'SPEC',status:'VALIDADO',importance:'P1',visibility:'public'},{code:'PRIVATE',title:'Não exibir',visibility:'restricted'}]}};
 const ctx={window:win,document:{getElementById:id=>nodes[id]||null,querySelector:()=>null,addEventListener(){},documentElement:{}},setTimeout(){},setInterval(){return 1},clearInterval(){},MutationObserver:class{constructor(cb){callback=cb}observe(){}}};
 vm.runInNewContext(source,ctx);win.crDocsInit();
 while(pending&&callbacks<100){pending=false;callbacks++;callback()}
 const first={writes,callbacks,settled:!pending};
 assert(!nodes.docsTable.innerHTML.includes('PRIVATE'));
 if(first.settled){
  const prev=writes;win.crDocsInit();assert.equal(writes,prev,'identical data must not mutate DOM');
  nodes.crDocQ.value='does-not-match';win.crDocsInit();assert(!nodes.docsTable.innerHTML.includes('DEMO-001'));
  nodes.crDocQ.value='';win.__CR_DEV.docs[0].title='Updated';win.crDocsInit();assert(nodes.docsTable.innerHTML.includes('Updated'));
  nodes.docsTable.innerHTML='<table><thead><tr><th>Old renderer</th></tr></thead></table>';win.crDocsInit();assert(nodes.docsTable.innerHTML.includes('Updated'));
 }
 return first;
}
const extract=html=>[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function detailHtml(d)'));
const baseline=require('node:child_process').execFileSync('git',['show','b7a5790836ea15aa8b1d8c257db8255e6296aab3:central/index.html'],{encoding:'utf8'});
const before=run(extract(baseline)),after=run(extract(fs.readFileSync('central/index.html','utf8')));
assert.equal(before.settled,false);assert.equal(after.settled,true);
const result={fixture:'2 synthetic documents; simulated DOM MutationObserver queue; not browser timing',before,after,filter_and_update_and_restricted_visibility:'PASS'};
console.log(JSON.stringify(result,null,2));
