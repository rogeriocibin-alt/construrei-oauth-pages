/* CR APP Checklist Native Capability Layer — candidate 2026-10-04
   Structural contract only. No production promotion. */
(function(){
"use strict";
const MAP={
 F00:["case.identity","evidence.attachments","service.problem"],
 F01:["customer","property","contact.collection","availability","evidence.attachments","responsibility","prebudget.context"],
 F02:["budget.pdf.import","budget.extract","budget.items","labor","quotes","discount","pricing.margin_markup","budget.version","budget.snapshot","ai.refine"],
 F03:["proposal","approval","work_order","document.pdf","communication.whatsapp"],
 F04:["agenda","appointment","time","assignees.multiple","provider.services","confirmation"],
 F05:["materials","provider","provider.specialty","labor.mode","material.receipt","material.usage","material.leftover","material.return"],
 F06:["execution.checklist","execution.service","task","team","execution.time","observation","summary","evidence.photo_video","signature","acceptance","report"],
 F07:["pending","alert","task.result","nonconformity","rework","return"],
 F08:["finance.entry","installment","payment","bank","receipt","divergence","partners","profit_distribution","working_capital","closing","invoice.contract"],
 F09:["delivery.acceptance","final.report","return","cancellation","warranty","history"]
};
const CORE=["case360","customer","property","service","item","evidence","attachment","assignee","provider","agenda","material","task","document","payment","event","approval","warranty"];
function phase(){return (document.querySelector('meta[name="cr-flow-code"]')||{}).content||""}
function emit(type,detail){try{window.dispatchEvent(new CustomEvent("cr:checklist-native:"+type,{detail}))}catch(_){}}
window.CRChecklistNative=Object.freeze({
 version:"CR-CHECKLIST-NATIVE-CANDIDATE-20261004",
 status:"CANDIDATE_NOT_HOMOLOGATED",
 phaseCapabilities:MAP,core:CORE,
 capabilities:(p)=>[...(MAP[p||phase()]||[])],
 classify:(name)=>({capability:name,decision:"REUSE_OR_ADAPT_FIRST",createNewRequiresEvidence:true}),
 context:(seed={})=>Object.assign({schema:"CR_CASE360_V1",case_id:null,phase:phase(),attachments:[],events:[],assignees:[],services:[]},seed),
 emit
});
document.documentElement.dataset.crChecklistNative="candidate-20261004";
emit("ready",{phase:phase(),capabilities:window.CRChecklistNative.capabilities()});
})();