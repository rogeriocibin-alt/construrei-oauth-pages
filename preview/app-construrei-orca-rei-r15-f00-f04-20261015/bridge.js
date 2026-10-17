/* CONSTRU-REI • bridge candidata F00-F04. R15 original runs unmodified, same-origin iframe. */
(function(){
"use strict";
const BASE="https://rogeriocibin-alt.github.io/construrei-oauth-pages/";
const FLOW="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-flow-runtime-v2";
const ROUTES=Object.freeze({app:"app-construrei/",f00:"production/flow-canonical-20261001/f00/",f01:"production/flow-canonical-20261001/f01/",f02:"production/flow-canonical-20261001/f02/",f03:"production/flow-canonical-20261001/f03/",f04:"production/flow-canonical-20261001/f04/"});
const $=id=>document.getElementById(id);
const runtime={case:null,budgetRevision:null,lastTab:"orca",history:[],loaded:false,saving:false,f02Dirty:false};
const fmt=n=>Number(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
function money(v){
 let t=String(v??"").replace(/R\$/gi,"").replace(/\s/g,"");
 if(!t)return NaN;
 if(t.includes(","))t=t.replace(/\./g,"").replace(",",".");
 const n=Number(t);return Number.isFinite(n)?n:NaN;
}
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
function notice(text,fail=false){const el=$("bridgeStatus");el.textContent=text;el.style.borderLeft=fail?"3px solid #ee9a75":"3px solid #d7b02d";}
async function api(method,data){
 const response=await fetch(FLOW+"?api="+encodeURIComponent(method),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data),cache:"no-store"});
 const body=await response.json().catch(()=>({}));
 if(!response.ok||body.ok===false)throw Error(body.error||"Falha na conexão com o fluxo oficial (HTTP "+response.status+").");
 return body;
}
function setTab(tab,store=true){
 if(tab!=="orca"&&!Object.hasOwn(ROUTES,tab))return;
 if(store&&runtime.lastTab!==tab){runtime.history.push(runtime.lastTab);if(runtime.history.length>16)runtime.history.shift();}
 runtime.lastTab=tab;
 document.querySelectorAll("[data-tab]").forEach(b=>{if(b.dataset.tab===tab)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
 $("orcaPanel").hidden=tab!=="orca";
 $("flowPanel").hidden=tab==="orca";
 if(tab==="orca"&&store)refreshEligibleCases();
 if(tab!=="orca"){
  const frame=$("flowFrame"),url=BASE+ROUTES[tab];
  if(frame.dataset.current!==url||(tab==="f02"&&runtime.f02Dirty)){frame.src=url;frame.dataset.current=url;runtime.f02Dirty=false;}
  const titles={app:"APP oficial",f00:"F00 • Captura",f01:"F01 • Qualificação",f02:"F02 • Orçamento oficial",f03:"F03 • Proposta e decisão",f04:"F04 • Agenda e mobilização"};
  $("pageDesc").textContent=titles[tab]+" • módulo canônico embutido sem alterações.";
 }
}
async function loadLinkedF04(){
 if(runtime.lastTab!=="f04"||!runtime.case)return;
 try{
  const current=(await api("get",{token:runtime.case.token})).handoff;
  if(!current||current.token!==runtime.case.token||String(current.to_flow).toUpperCase()!=="F04"){
   $("pageDesc").textContent="F04 • módulo oficial. O chamado vinculado ainda não foi aprovado e transferido para F04; a tela está em modo isolado.";
   return;
  }
  const url=BASE+ROUTES.f04+"?handoff="+encodeURIComponent(current.token);
  const frame=$("flowFrame");
  if(frame.dataset.current!==url){frame.src=url;frame.dataset.current=url;}
  $("pageDesc").textContent="F04 • chamado "+current.case_number+" autorizado pelo fluxo canônico. Agenda e mobilização disponíveis no próprio APP.";
 }catch(e){$("pageDesc").textContent="F04 • não foi possível confirmar a fase: "+String(e.message||e)+". Nenhuma transição executada.";}
}
function normalizeCase(x){return String(x||"").trim().toUpperCase().replace(/\s+/g,"");}
function budgetItems(win){
 if(!win||!win.document||!Array.isArray(win.crPriceItems))throw Error("O motor R15 ainda não está pronto. Aguarde o carregamento ou gere o orçamento.");
 if(win.document.getElementById("mode")?.value!=="budget")throw Error("Alterne a R15 para Orçamento antes de salvar no F02.");
 if(win.document.getElementById('marketRun')?.disabled)throw Error("A precificação ainda está em andamento.");
 const text=String(win.document.getElementById("out")?.textContent||"").trim();
 if(text.length<45||/Provedores indisponíveis/i.test(text))throw Error("Gere primeiro um orçamento real no ORÇA-REI R15.");
 const rows=win.crPriceItems.map((it,i)=>{
  const quantity=money(win.document.getElementById("crq"+i)?.value);
  const unitPrice=money(win.document.getElementById("crv"+i)?.value);
  const section=it.section,unit=String(it.measure||"UN").trim();
  const name=String(it.name||"").replace(/^\d+[.)]\s*/,"").trim();
  if(!["SERVIÇOS","MATERIAIS"].includes(section)||!name||!Number.isFinite(quantity)||quantity<=0||!Number.isFinite(unitPrice)||unitPrice<=0)throw Error("Item "+(i+1)+" sem quantidade/preço válido. Complete e recalcule antes de salvar.");
  if(it.assumedQty)throw Error("Quantidade provisória no item "+(i+1)+". Confira e edite antes de salvar.");
  if(!Number.isFinite(quantity*unitPrice)||quantity*unitPrice>1e9)throw Error("Valor inválido no item "+(i+1)+".");
  return {name,section,quantity,unit,unitPrice,total:round(quantity*unitPrice),review:!!it.siteReviewRequired,origin:it.priceReference?.kind||"informado_revisar"};
 });
 if(!rows.length)throw Error("Nenhum serviço ou material estruturado disponível.");
 return {rows,text,labor:round(rows.filter(x=>x.section==="SERVIÇOS").reduce((s,x)=>s+x.total,0)),materials:round(rows.filter(x=>x.section==="MATERIAIS").reduce((s,x)=>s+x.total,0))};
}
function showCaseEvidence(h){
 const box=$("caseEvidence");if(!box)return;
 const state=h.state||{}, sources=[state.evidence,state.f00?.files,state.f00Files,state.integration?.f00Files,state.f00?.evidence];
 const files=sources.find(x=>Array.isArray(x))||[];
 const safe=files.filter(x=>x&&typeof x==="object");
 box.replaceChildren();
 const title=document.createElement("strong");title.textContent="Evidências vinculadas: "+safe.length;box.append(title);
 if(!safe.length){box.append(document.createTextNode(" • Sem metadados de anexos nesta transferência. Conferir F00/F01."));return;}
 const list=document.createElement("ul");
 for(const f of safe.slice(0,30)){
  const li=document.createElement("li");
  li.textContent=String(f.filename||f.name||"Arquivo").slice(0,110)+" • "+String(f.content_type||f.mime_type||"tipo não informado").slice(0,70);
  list.append(li);
 }
 box.append(list);
 box.append(document.createTextNode("Arquivos associados ao chamado; visualização e inclusão no PDF ainda exigem transferência autorizada. Nenhum arquivo foi copiado."));
}
function importSource(h){
 const state=h.state||{},items=Array.isArray(state.items)?state.items:Array.isArray(state.services)?state.services:[];
 const segments=[
 "FLUXO CONSTRU-REI • "+String(h.case_number||""),
 "CLIENTE: "+String(state.client||""),
 "ENDEREÇO: "+String(state.address||""),
 "ESCOPO / RELATO: "+String(state.case_summary||state.scope||""),
 "CONTEXTO DE F00/F01: "+String(state.f00?.summary||state.f01?.notes||""),
 ...items.slice(0,20).map((x,i)=>"ITEM "+(i+1)+": "+String(x.subject||x.description||x.type||"")+" — "+String(x.environment||"")),
 "RETORNO TÉCNICO: "+String(state.technical_return?.text||""),
 "REGRA: levantar apenas materiais, quantidades e serviços do escopo. Distinguir fato observado, relato e hipótese. Não inventar medidas, preços publicados ou condições de acesso."
 ];
 const full=segments.filter(x=>x.trim().length>9).join("\n");if(full.length>3300)throw Error("O contexto ultrapassa o limite de entrada da R15. Resuma o relato técnico conscientemente antes de importar: transferência automática parcial foi bloqueada.");return full;
}
async function refreshEligibleCases(){
 const select=$("eligibleCases");
 if(!select)return;
 select.replaceChildren(new Option("Consultando fila F02...",""));
 try{
  const list=await api("list",{phase:"F02"});
  const cases=(list.cases||[]).filter(x=>x.token&&x.case_number);
  select.replaceChildren(new Option(cases.length?"Selecione um chamado qualificado":"Nenhum chamado qualificado no F02",""));
  const seen=new Set();
  for(const c of cases){
   const key=normalizeCase(c.case_number);
   if(seen.has(key)){
    // Duplicate case numbers must remain blocked, never silently select one.
    for(const opt of select.options){if(normalizeCase(opt.value)===key)opt.disabled=true;}
    continue;
   }
   seen.add(key);
   select.add(new Option(c.case_number+" • "+String(c.client||"Cliente"),c.case_number));
  }
  notice(cases.length?"Fila F02 sincronizada: "+cases.length+" chamado(s) elegível(is).":"Nenhum chamado chegou à fase F02. Conclua a passagem pelo F00 e F01 sem ignorar pendências.");
  // Autoload only when exactly one distinct valid handoff is present and no
  // other case or draft is open; never pick an arbitrary case from a busy queue.
  if(cases.length===1&&!runtime.case&&runtime.loaded&&!$("caseNumber").value.trim()){
    $("caseNumber").value=cases[0].case_number;
    await loadCase();
  }
 }catch(e){select.replaceChildren(new Option("Fila indisponível; tente novamente",""));notice("Falha ao consultar fila F02: "+String(e.message||e),true)}
}
async function loadCase(){
 if(runtime.saving){notice("Aguarde o salvamento terminar.",true);return}
 const query=normalizeCase($("caseNumber").value);
 if(!/^[A-Z0-9][A-Z0-9-]{2,44}$/.test(query)){notice("Digite o número exato do chamado, por exemplo 520-26.",true);return}
 const button=$("loadCase");button.disabled=true;
 notice("Localizando o chamado na fila oficial F02. Nenhum registro será modificado.");
 try{
  const list=await api("list",{phase:"F02"});
  const matches=(list.cases||[]).filter(x=>normalizeCase(x.case_number)===query);
  if(matches.length!==1)throw Error(matches.length?"Número duplicado no F02; bloqueado por segurança.":"Não há chamado ativo "+query+" no F02. Conclua a transferência F00 → F01 → F02 primeiro.");
  const result=await api("get",{token:matches[0].token});
  const h=result.handoff;
  if(!h||String(h.to_flow).toUpperCase()!=="F02"||normalizeCase(h.case_number)!==query)throw Error("O chamado não está sob responsabilidade do F02.");
  const frame=$("orcaFrame"),win=frame.contentWindow;
  if(!win||!win.document||!win.document.getElementById("src"))throw Error("Motor R15 ainda carregando. Tente novamente em instantes.");
  const src=win.document.getElementById("src");
  if(src.value.trim()&&!window.confirm("Substituir o texto atualmente aberto na R15 pelo contexto desse chamado?"))return;
  src.value=importSource(h);
  win.document.getElementById("pdfnumber").value=String(h.case_number||"");
  win.document.getElementById("pdfclient").value=String(h.state?.client||"");
  win.document.getElementById("pdfaddress").value=String(h.state?.address||"");
  win.document.getElementById("pdfperson").value="CONSTRU-REI";
  win.document.getElementById("pdftitle").value="";
  win.document.getElementById("mode").value="budget";
  if(typeof win.orcaSetMode==="function")win.orcaSetMode();
  const photoInput=win.document.getElementById("pdffiles");if(photoInput)photoInput.value="";
  if(typeof win.orcaPhotoReset==="function")win.orcaPhotoReset();
  if(typeof win.orcaClosePdfPreview==="function")win.orcaClosePdfPreview();
  win.orcaR12Html="";
  // A new case must not inherit the previous generated prices or PDFs.
  win.document.getElementById("out").textContent="";
  if(Array.isArray(win.crPriceItems))win.crPriceItems.length=0;
  win.document.getElementById("priceRows").replaceChildren();
  win.document.getElementById("marketProof").replaceChildren();
  win.document.getElementById("priceStatus").textContent="Contexto carregado. Gere com IA e precifique antes de salvar.";
  $("confirmReview").checked=false;$("confirmReplace").checked=false;
  runtime.case=h;runtime.budgetRevision=h.revision??null;
  showCaseEvidence(h);
  $("selectedCase").textContent="F02 conectado • "+h.case_number+" • "+String(h.state?.client||"Cliente");
  notice("Contexto F00/F01/F02 carregado na R15. Agora gere com IA e revise quantidades, preços, escopo, fotos e PDFs. Nenhum rascunho foi gravado.");
 }catch(e){notice("Não foi possível carregar: "+String(e.message||e),true)}
 finally{button.disabled=false}
}
function showReviewWarnings(rows){return rows.filter(x=>x.review||/^(PCT|CX|EMB|PACOTE|KG)$/i.test(x.unit)).map(x=>x.name+" ("+x.unit+")").slice(0,9)}
function makePayload(h,budget){
 const original=h.state?.items||h.state?.services||[],count=Math.max(1,Array.isArray(original)?original.length:1);
 const details=budget.rows.map(x=>x.section+" • "+x.name+" | "+x.quantity+" "+x.unit+" × "+fmt(x.unitPrice)+" = "+fmt(x.total)+(x.review?" | CONFERÊNCIA PENDENTE":"")).join("\n");
 const copy="ORÇA-REI R15 HOMOLOGADA • RASCUNHO COMERCIAL NÃO APROVADO\n"+
  "FLUXO "+h.case_number+" • "+String(h.state?.client||"")+"\n"+
  "MÃO DE OBRA "+fmt(budget.labor)+" | MATERIAIS "+fmt(budget.materials)+" | TOTAL "+fmt(round(budget.labor+budget.materials))+
  "\n\nDISCRIMINAÇÃO COMPLETA (FONTE DE VERDADE DO DETALHAMENTO R15):\n"+details+
  "\n\nTEXTO TÉCNICO R15:\n"+budget.text+"\n\nATENÇÃO: anexos PDF e fotos permanecem no navegador; revisão humana e confirmação comercial obrigatórias.";
 if(copy.length>30000)throw Error("Texto ultrapassou limite de transferência. Reduza o relato sem eliminar itens antes de salvar.");
 const labor=Array.from({length:count},(_,i)=>({item:i+1,description:i===0?"ORÇA-REI R15 • MÃO DE OBRA TOTAL — discriminação em TEXTO PRONTO":"Componente do mesmo orçamento • detalhamento em TEXTO PRONTO",value:i===0?String(budget.labor):"0"}));
 const material=Array.from({length:count},(_,i)=>({item:i+1,description:i===0?"ORÇA-REI R15 • MATERIAIS TOTAL — discriminação em TEXTO PRONTO":"Componente do mesmo orçamento • detalhamento em TEXTO PRONTO",value:i===0?String(budget.materials):"0"}));
 return {token:h.token,actor:"Rogério",new_version:true,budget_ready:false,human_review_required:true,orcamento_origem:"ORCA_REI_R15_HOMOLOGADA",labor_items:labor,material_items:material,technical_notes:Array.from({length:count},()=> "Composição detalhada no campo TEXTO PRONTO. Não reescrever sem preservar os itens R15."),uncertainties:showReviewWarnings(budget.rows),copy_ready_text:copy};
}
async function saveDraft(){
 if(runtime.saving)return;
 if(!runtime.case){notice("Carregue primeiro um chamado real do F02.",true);return}
 if(!$("confirmReview").checked){notice("Confirme a revisão humana antes de salvar. Não há aprovação automática.",true);return}
 const btn=$("saveDraft");btn.disabled=true;runtime.saving=true;
 try{
  const w=$("orcaFrame").contentWindow;if(w&&typeof w.applyPriceItems==='function')w.applyPriceItems(false);const result=budgetItems(w);
  const warnings=showReviewWarnings(result.rows);
  if(warnings.length&&!window.confirm("Itens ainda sujeitos a conferência: "+warnings.join("; ")+". Salvar SOMENTE rascunho não aprovado?"))return;
  const latest=(await api("get",{token:runtime.case.token})).handoff;
  if(!latest||String(latest.to_flow).toUpperCase()!=="F02")throw Error("Chamado mudou de fase; nada foi gravado.");
  if((latest.revision??null)!==runtime.budgetRevision)throw Error("O chamado foi atualizado em outra tela. Recarregue-o antes de gravar, para não sobrescrever dados.");
  if((latest.state?.budget?.copy_ready_text||latest.state?.budget?.labor_items?.length||latest.state?.budget?.material_items?.length)&&!$("confirmReplace").checked)throw Error("Já existe orçamento no F02. Marque a confirmação de substituição após conferir o histórico.");
  const payload=makePayload(latest,result);
  notice("Salvando SOMENTE rascunho no F02 oficial. Não é aprovação nem transferência de fase.");
  const saved=await api("budget-save",payload);
  if(!saved.handoff||saved.budget?.budget_ready||saved.handoff.to_flow!=="F02")throw Error("Resposta de salvamento não comprovou permanência no F02. Verifique o caso oficial.");
  if(Math.abs(Number(saved.budget.total_labor)-result.labor)>0.01||Math.abs(Number(saved.budget.total_material)-result.materials)>0.01)throw Error("Divergência dos totais retornados pelo servidor. Conferir no F02.");
  runtime.case=saved.handoff;runtime.budgetRevision=saved.handoff.revision??null;runtime.f02Dirty=true;
  notice("RASCUNHO SALVO NO F02: "+saved.handoff.case_number+" • mão de obra "+fmt(result.labor)+" • materiais "+fmt(result.materials)+" • total "+fmt(round(result.labor+result.materials))+". Itens e descrição completa preservados em TEXTO PRONTO. F03/F04 não foram acionados.");
 }catch(e){notice("Rascunho NÃO confirmado: "+String(e.message||e),true)}
 finally{runtime.saving=false;btn.disabled=false}
}
function reset(){
 runtime.case=null;runtime.budgetRevision=null;$("selectedCase").textContent="Nenhum caso vinculado";
 $("caseEvidence").textContent="Anexos: aguardando chamado qualificado.";
 $("confirmReview").checked=false;$("confirmReplace").checked=false;
 notice("Vínculo local desligado. Nenhuma ação foi aplicada ao banco.");
}
$("navigation").addEventListener("click",e=>{const tab=e.target.closest("[data-tab]")?.dataset.tab;if(tab){setTab(tab);if(tab==="f04")loadLinkedF04();}});
$("goBack").addEventListener("click",()=>setTab(runtime.history.pop()||"app",false));
$("loadCase").addEventListener("click",loadCase);
$("refreshCases").addEventListener("click",refreshEligibleCases);
$("eligibleCases").addEventListener("change",()=>{const v=$("eligibleCases").value;if(v){$("caseNumber").value=v;loadCase();}});
$("resetCase").addEventListener("click",reset);
$("saveDraft").addEventListener("click",saveDraft);
$("openOfficialF02").addEventListener("click",()=>setTab("f02"));
$("caseNumber").addEventListener("keydown",e=>{if(e.key==="Enter")loadCase()});
$("orcaFrame").addEventListener("load",()=>{runtime.loaded=true;notice("Motor R15 carregado. Consultando a fila F02.");refreshEligibleCases();});
setTab("orca",false);
refreshEligibleCases();
window.CRBridgeV1={money,round,makePayload,importSource,showReviewWarnings,budgetItems}; // Testes puros, sem token/cache.
})();