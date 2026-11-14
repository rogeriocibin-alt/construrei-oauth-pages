"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),vm=require("node:vm"),assert=require("node:assert/strict");
const root=__dirname, repo=path.resolve(root,"../..");
const bridge=fs.readFileSync(path.join(root,"bridge.js"),"utf8");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
new vm.Script(bridge,{filename:"bridge.js"});
const frozen="preview/orca-rei-teste-ia-20261015-r15-correcao-precos-pdf";
const pins={ "app.js":"3c612975a3871900a29c2b745bfc914749f0bed3", "index.html":"280e604c4aade4919b913a993eb2f0ed479df1b1", "brand.js":"e5ae2ee493fe73f44e7d3b7462471d05f2b1fae4" };
for(const [file,sha] of Object.entries(pins)){
 const b=fs.readFileSync(path.join(repo,frozen,file));
 assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex"),sha,"R15 source changed unexpectedly: "+file);
}
assert.match(html,/R15 no fluxo F00/);
assert.match(html,/iframe id="orcaFrame"/);
assert.match(html,/f00/);
assert.match(html,/f01/);
assert.match(html,/f03/);
assert.match(html,/f04/);
assert.match(html,/RASCUNHO/ig);
assert.match(bridge,/budget-save/);
assert.match(bridge,/String\(current\.to_flow\)\.toUpperCase\(\)!=="F04"/,"F04 requires approved handoff");
assert.match(bridge,/ROUTES\.f04\+"\?handoff="/,"F04 can receive canonical handoff");
assert.doesNotMatch(bridge,/api\(["']budget-release["']/,"no automatic F02 -> F03");
assert.doesNotMatch(bridge,/api\(["']proposal-save["']/,"no automatic F03 approval");
assert.doesNotMatch(bridge,/localStorage|sessionStorage/,"no locally stored sensitive tokens");
const ids=new Map();
function node(id){if(!ids.has(id))ids.set(id,{id,value:"",textContent:"",dataset:{},checked:false,disabled:false,hidden:false,style:{},addEventListener(){},setAttribute(){},removeAttribute(){},replaceChildren(){},classList:{add(){},remove(){}},contentWindow:null});return ids.get(id)}
const win={confirm:()=>true};
const ctx={window:win,document:{getElementById:node,querySelectorAll:()=>[]},console,URL,Option:function Option(label,value){this.text=label;this.value=value;this.disabled=false},fetch:async()=>{throw Error("No live backend calls allowed in smoke tests")}};
vm.runInNewContext(bridge,ctx);
const B=win.CRBridgeV1;
assert.ok(B);
const caseData={
 token:"synthetic-token",case_number:"520-26",to_flow:"F02",state:{client:"JBA",address:"Rua Yoshiaki Nagano, 500",case_summary:"Revisar vasos sanitários",items:[{subject:"Troca de bacia",environment:"2º pavimento"},{subject:"Revisar vedação",environment:"3º pavimento"}],technical_return:{text:"Conferir dimensões das louças"}}
};
const source=B.importSource(caseData);
assert.match(source,/520-26/);assert.match(source,/JBA/);assert.match(source,/Conferir dimensões/);
const inputs={
 mode:{value:"budget"},
 out:{textContent:"MATERIAIS\n1. REJUNTE PARA BASE\nQTD.: 2 | UN.: KG | VR. UNIT.: R$ 30,77 | VR. TOTAL: R$ 61,54\nSERVIÇOS\n1. REFIXAÇÃO DE VASO\nQTD.: 3 | UN.: UN | VR. UNIT.: R$ 200,00 | VR. TOTAL: R$ 600,00"},
 crq0:{value:"2"},crv0:{value:"30,77"},crq1:{value:"3"},crv1:{value:"200"},marketRun:{disabled:false}
};
const child={document:{getElementById:id=>inputs[id]},crPriceItems:[
 {name:"1. REJUNTE PARA BASE",section:"MATERIAIS",measure:"KG",siteReviewRequired:true},
 {name:"1. REFIXAÇÃO DE VASO",section:"SERVIÇOS",measure:"UN",siteReviewRequired:false}
]};
const result=B.budgetItems(child);
assert.equal(result.labor,600);assert.equal(result.materials,61.54);
assert.equal(result.rows.length,2);
assert.equal(B.showReviewWarnings(result.rows).length,1);
const p=B.makePayload(caseData,result);
assert.equal(p.token,"synthetic-token");
assert.equal(p.budget_ready,false);
assert.equal(p.human_review_required,true);
assert.equal(p.labor_items.length,2);
assert.equal(p.material_items.length,2);
assert.equal(Number(p.labor_items[0].value),600);
assert.equal(Number(p.material_items[0].value),61.54);
assert.equal(Number(p.material_items[1].value),0);
assert.match(p.copy_ready_text,/REJUNTE PARA BASE/);
assert.match(p.copy_ready_text,/REFIXAÇÃO DE VASO/);
assert.match(p.copy_ready_text,/R\$\s*661,54/);
assert.match(p.copy_ready_text,/RASCUNHO COMERCIAL NÃO APROVADO/);
assert.throws(()=>B.budgetItems({...child,crPriceItems:[{...child.crPriceItems[0],assumedQty:true},child.crPriceItems[1]]}),/provisória/);
inputs.crv0.value="";
assert.throws(()=>B.budgetItems(child),/sem quantidade\/preço/);
console.log("PASS APP F00–F04: R15 3 frozen blobs, isolated same-origin engine, handoff source, draft gate, totals, original F02 item counts, no automatic stage transition.");