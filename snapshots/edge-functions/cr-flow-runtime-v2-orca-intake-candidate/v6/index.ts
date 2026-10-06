
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";

const SB=Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co";
let K="";try{const x=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");K=x.default||x.service_role||""}catch{}if(!K)K=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(SB,K,{auth:{persistSession:false,autoRefreshToken:false}});
const BUILD="CR-FLOW-RUNTIME-V2-ORCA-REI-V1-INTAKE-CANDIDATE-R6-AUTOLEARNING-20261005";
const LEGACY={F01:"https://pearl-cinder-fog.pagey.site/",F02:"https://sparrow-timber-sand.pagey.site/",F03:"https://cliff-iris-fern.pagey.site/"};
const H={"cache-control":"no-store","access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type","x-content-type-options":"nosniff","x-construrei-build":BUILD};
const J=(d:any,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{...H,"content-type":"application/json; charset=utf-8"}});
const T=(v:any,n=5000)=>String(v??"").trim().slice(0,n);
const fold=(v:any)=>T(v,500).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function norm(v:any){const f=fold(v);if(/\bf00\b/.test(f))return"F00";if(/\bf01\b|triagem/.test(f))return"F01";if(/\bf02\b|preparar|orcamento|orçamento/.test(f))return"F02";if(/\bf03\b|aprovar|proposta/.test(f))return"F03";if(/\bf04\b|programar|schedule/.test(f))return"F04";if(/\bf05\b|suprir|supply/.test(f))return"F05";if(/\bf06\b|executar|execute/.test(f))return"F06";if(/\bf07\b|conferir|verify/.test(f))return"F07";if(/\bf08\b|faturar|finance/.test(f))return"F08";if(/\bf09\b|garantir|aftercare|pos-venda|pós-venda/.test(f))return"F09";return T(v,30).toUpperCase()}
function num(v:any){if(typeof v==="number")return Number.isFinite(v)?v:0;let s=String(v??"").trim().replace(/[^\d,.-]/g,"");if(!s)return 0;if(s.includes(",")&&s.includes("."))s=s.replace(/\./g,"").replace(",",".");else if(s.includes(","))s=s.replace(",",".");const n=Number(s);return Number.isFinite(n)?n:0}
const pct=(v:any,d=0)=>{const n=num(v);if(!Number.isFinite(n))return d;return Math.max(0,Math.min(0.95,n>1?n/100:n))};
function orcaAudit(b:any){
  const labor=Array.isArray(b.labor_items)?b.labor_items:[],materials=Array.isArray(b.material_items)?b.material_items:[];
  const saleLabor=labor.reduce((a:number,x:any)=>a+num(x.value??(num(x.quantity)*num(x.unit_value))),0);
  const saleMaterial=materials.reduce((a:number,x:any)=>a+num(x.value??(num(x.quantity)*num(x.unit_value))),0);
  const sale=num(b.sale_total)||saleLabor+saleMaterial;
  const chargesRate=pct(b.charges_rate,0.185),targetMargin=pct(b.target_margin,0.30);
  const costLabor=Math.max(0,num(b.cost_labor)),costMaterial=Math.max(0,num(b.cost_material)),costThird=Math.max(0,num(b.cost_third_party)),otherCosts=Math.max(0,num(b.other_direct_costs));
  const directCost=costLabor+costMaterial+costThird+otherCosts;
  const charges=sale*chargesRate,profit=sale-charges-directCost,margin=sale>0?profit/sale:0;
  const denom=1-chargesRate-targetMargin,maxDirectCost=sale*Math.max(0,denom),minPrice=denom>0?directCost/denom:null;
  let confidence=100;
  const measures=T(b.measures_status,30).toUpperCase(),materialQuote=T(b.material_quote_status,30).toUpperCase(),thirdQuote=T(b.third_quote_status,30).toUpperCase(),scope=T(b.scope_status,30).toUpperCase(),diagnosis=T(b.diagnosis_status,30).toUpperCase();
  if(measures&&measures!=="CONFIRMADO")confidence-=20;
  if(saleMaterial>0&&materialQuote&&materialQuote!=="COTADO")confidence-=20;
  if(costThird>0&&thirdQuote&&thirdQuote!=="COTADO")confidence-=20;
  if(scope&&scope!=="FECHADO")confidence-=20;
  if(diagnosis==="HIPOTESE"||diagnosis==="HIPÓTESE")confidence-=10;
  if(!b.costs_confirmed)confidence-=20;
  confidence=Math.max(0,Math.min(100,confidence));
  const confidenceLabel=confidence>=90?"MUITO ALTA":confidence>=70?"BOA":confidence>=50?"MÉDIA":"BAIXA";
  let decision="MANTER";
  if(!b.costs_confirmed)decision="COTAR";
  else if(sale<=0)decision="REESTRUTURAR CUSTO";
  else if(margin<0)decision="AUMENTAR";
  else if(margin+0.0001<targetMargin)decision="AUMENTAR";

  let risk="BAIXO";
  if(margin<0||confidence<50)risk="CRÍTICO";
  else if(margin<targetMargin||confidence<70)risk="ALTO";
  else if(confidence<90)risk="MÉDIO";
  if(confidence<50)decision=(measures!=="CONFIRMADO"||scope!=="FECHADO")?"VISTORIAR":"COTAR";
  const human=!!b.human_review_approved,commercialOverride=!!b.commercial_override;
  const financialPass=sale>0&&margin+0.0001>=targetMargin;
  const gateReady=!!(sale>0&&b.costs_confirmed&&confidence>=50&&human&&(financialPass||commercialOverride));
  return {
    agent:"ORCA_REI_V1",sale_labor:saleLabor,sale_material:saleMaterial,sale_total:sale,
    charges_rate:chargesRate,charges_value:charges,target_margin:targetMargin,
    cost_labor:costLabor,cost_material:costMaterial,cost_third_party:costThird,other_direct_costs:otherCosts,
    direct_cost:directCost,max_direct_cost:maxDirectCost,min_price:minPrice,projected_profit:profit,projected_margin:margin,
    confidence,confidence_label:confidenceLabel,risk,decision,gate_ready:gateReady,
    human_review_approved:human,commercial_override:commercialOverride,financial_pass:financialPass,costs_confirmed:!!b.costs_confirmed,
    assumptions:{measures_status:measures||"A_CONFERIR",material_quote_status:materialQuote||"A_CONFERIR",third_quote_status:thirdQuote||"NAO_APLICAVEL",scope_status:scope||"PRELIMINAR",diagnosis_status:diagnosis||"NAO_APLICAVEL"},
    formula:"preco_minimo = custo_direto / (1 - encargos - margem_alvo)",
    warnings:[
      !b.costs_confirmed?"Custos internos ainda não confirmados.":null,
      confidence<50?"Confiança insuficiente para orçamento executivo.":null,
      sale>0&&margin<targetMargin?"Margem projetada abaixo da meta informada.":null,
      !human?"Revisão humana ainda não aprovada.":null,
      !financialPass&&!commercialOverride?"Preço atual não preserva a margem alvo; ajuste o preço ou registre override comercial explícito.":null
    ].filter(Boolean)
  };
}

function parseMoneyToken(v:any){
  const s=T(v,100);
  const m=s.match(/(?:R\$\s*)?(-?\d{1,3}(?:\.\d{3})*(?:,\d{1,2})|-?\d+(?:[.,]\d{1,2})?)/);
  return m?num(m[1]):0;
}
function intakeSection(line:string,current:string){
  const f=fold(line);
  if(/^(servicos?|mao de obra|m\.?o\.?)\b/.test(f))return "SERVICE";
  if(/^(produtos?|materiais?|insumos?)\b/.test(f))return "PRODUCT";
  if(/^(observacoes?|observacoes tecnicas|ressalvas?|notas?)\b/.test(f))return "NOTES";
  return current;
}
function parseBudgetLine(line:string,section:string){
  const original=T(line,1200),f=fold(original);
  if(!original||/^(total|subtotal)\b/.test(f))return null;
  let quantity=1,unit="";
  const lead=original.match(/^\s*(\d+(?:[.,]\d+)?)\s+(?=[A-Za-zÀ-ÿ])/);
  let qm=lead || original.match(/\b(?:qtd\.?|quantidade)\s*[:=-]?\s*(\d+(?:[.,]\d+)?)\s*([a-zA-Z²³]+)?/i)
    || original.match(/\b(\d+(?:[.,]\d+)?)\s*(un|und|unid|unidade|m2|m²|m3|m³|m|kg|l|lt|h|hora|dia)s?\b/i)
    || original.match(/\b(\d+(?:[.,]\d+)?)\s*[xX]\b/);
  if(qm){quantity=Math.max(0.0001,num(qm[1])||1);unit=lead?"":T(qm[2]||"",20)}
  const vals=[...original.matchAll(/R\$\s*([\d.]+(?:,\d{1,2})?)/gi)].map(m=>num(m[1]));
  let unitValue=0,subtotal=0;
  const uv=original.match(/(?:vr\.?\s*unit\.?|valor\s*unit[aá]rio|unit[aá]rio)\s*[:=-]?\s*R?\$?\s*([\d.]+(?:,\d{1,2})?)/i);
  const st=original.match(/subtotal\s*[:=-]?\s*R?\$?\s*([\d.]+(?:,\d{1,2})?)/i);
  if(uv)unitValue=num(uv[1]); if(st)subtotal=num(st[1]);
  if(!unitValue&&vals.length===1)unitValue=vals[0];
  if(!unitValue&&vals.length>=2)unitValue=vals[vals.length-2];
  if(!subtotal&&vals.length>=2)subtotal=vals[vals.length-1];
  if(!subtotal&&unitValue)subtotal=quantity*unitValue;
  if(!unitValue&&subtotal&&quantity)unitValue=subtotal/quantity;
  let name=original
    .replace(/^\s*[-•*#]+\s*/,"")
    .replace(/^\s*\d+[.)-]\s*/,"")
    .replace(/^\s*\d+(?:[.,]\d+)?\s+(?=[A-Za-zÀ-ÿ])/,"")
    .replace(/\b(?:qtd\.?|quantidade)\s*[:=-]?\s*\d+(?:[.,]\d+)?\s*[a-zA-Z²³]*/ig,"")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:un|und|unid|unidade|m2|m²|m3|m³|m|kg|l|lt|h|hora|dia)s?\b/ig,"")
    .replace(/\b\d+(?:[.,]\d+)?\s*[xX]\b/g,"")
    .replace(/(?:vr\.?\s*unit\.?|valor\s*unit[aá]rio|unit[aá]rio|subtotal)\s*[:=-]?\s*R?\$?\s*[\d.]+(?:,\d{1,2})?/ig,"")
    .replace(/R\$\s*[\d.]+(?:,\d{1,2})?/ig,"").replace(/R\$\s*/ig,"")
    .replace(/\s{2,}/g," ").replace(/^[\s:;|–—-]+|[\s:;|–—-]+$/g,"").trim();
  if(name.length<3)return null;
  const type=section==="PRODUCT"?"PRODUCT":"SERVICE";
  let nature="A_CONFERIR";
  if(/\b(custo|compra|fornecedor|pago)\b/.test(f))nature="CUSTO";
  else if(/\b(venda|preco final|cliente|orcado)\b/.test(f))nature="VENDA";
  else if(/\b(estimad|aprox|previsao|referencia)\b/.test(f))nature=/referencia/.test(f)?"REFERENCIA":"ESTIMADO";
  return {type,name,description:name,detail:"",quantity,unit,unit_value:unitValue,value:subtotal||quantity*unitValue,nature_value:nature,origin:"ENTRADA_INTELIGENTE",confidence:unitValue?75:55,raw:original};
}
function normalizeComparable(v:any){return fold(v).replace(/\W+/g," ").trim()}
function stripDecor(v:any){
  return T(v,2000).replace(/^[\s📋📝🏢📍📅🕒👷🔧📌⚠️📸•\-–—*#]+/u,"").trim();
}
function intelligentBudgetIntake(raw:any,state:any,caseNumber:any=""){
  const text=T(raw,30000),s=state||{};
  if(text.length<3)return {ok:false,error:"Cole algum conteúdo para estruturar."};
  const lines=text.replace(/\r/g,"").split("\n").map(x=>x.trim()).filter(Boolean);
  let section="SERVICE",visitBlock=false,recordBlock=false,captureReferenceNext=false; 
  const services:any[]=[],products:any[]=[],notes:string[]=[],warnings:string[]=[],conflicts:any[]=[];
  const checklist:string[]=[]; const header:any={};
  let incomingCase="";
  const fullFold=fold(text);
  const visitIntent=/visita|vistoria|verificar no local|registro da visita|levantar separadamente mao de obra|avaliar.*telhado|informar se sera necessario/.test(fullFold);
  const hasExplicitPricing=/R\$\s*\d|valor\s*unit|vr\.?\s*unit|subtotal|total\s+geral/.test(fullFold);
  for(const rawLine of lines){
    const line=stripDecor(rawLine),f=fold(line);
    if(!line)continue;
    let m=line.match(/^(?:fluxo|or[cç]amento|n[ºo°.]?)\s*[:#-]?\s*(\d{2,4}-\d{2})$/i);if(m){incomingCase=T(m[1],40);continue}
    m=line.match(/^(?:cliente\/origem|cliente|morador|propriet[aá]rio)\s*[:=-]\s*(.+)$/i);if(m){header.client=T(m[1],300);continue}
    m=line.match(/^endere[cç]o\s*[:=-]\s*(.+)$/i);if(m){header.address=T(m[1],500);continue}
    if(/^solicita[cç][aã]o\s*[:=-]?\s*$/i.test(line)){captureReferenceNext=true;continue}
    m=line.match(/^(?:refer[eê]ncia|escopo|objeto|solicita[cç][aã]o)\s*[:=-]\s*(.{3,})$/i);if(m&&m[1]){header.reference=T(m[1],800);continue}
    if(captureReferenceNext&&line.length>=8&&!/^(data|hor[aá]rio|prestador|prioridade)\b/i.test(line)){header.reference=T(line,800);captureReferenceNext=false;if(visitIntent&&!hasExplicitPricing)continue}
    if(/^data\s*[:=-]/i.test(line)||/^hor[aá]rio\s*[:=-]/i.test(line)||/^prestador\s*[:=-]/i.test(line)||/^prioridade\s*[:=-]/i.test(line)) {notes.push(rawLine);continue}
    if(/^verificar no local\b/i.test(line)){visitBlock=true;recordBlock=false;continue}
    if(/^registro da visita\b/i.test(line)){recordBlock=true;visitBlock=false;continue}
    if(/^solicita[cç][aã]o\b/i.test(line)){continue}
    const sectionHeader=/^(servicos?|mao de obra|m\.?o\.?|produtos?|materiais?|insumos?|observacoes?|observacoes tecnicas|ressalvas?|notas?)\b/.test(f);
    if(sectionHeader){section=intakeSection(line,section);visitBlock=false;recordBlock=false;continue}
    if(visitBlock||recordBlock){
      checklist.push(rawLine.replace(/^[•\-–—]\s*/,"").trim());
      continue;
    }
    if(visitIntent&&!hasExplicitPricing){
      // A request for inspection without pricing is technical context, not a budget row.
      notes.push(rawLine);
      continue;
    }
    let mm=line.match(/^(?:qtd\.?|quantidade)\s*[:=-]?\s*(\d+(?:[.,]\d+)?)\s*([a-zA-Z²³]+)?$/i);
    const lastItem=(section==="PRODUCT"?products:services).slice(-1)[0]||null;
    if(mm&&lastItem){lastItem.quantity=Math.max(.0001,num(mm[1])||1);if(mm[2])lastItem.unit=T(mm[2],20);if(lastItem.unit_value)lastItem.value=lastItem.quantity*lastItem.unit_value;continue}
    mm=line.match(/^(?:vr\.?\s*unit\.?|valor\s*unit[aá]rio|unit[aá]rio)\s*[:=-]?\s*R?\$?\s*([\d.]+(?:,\d{1,2})?)$/i);
    if(mm&&lastItem){lastItem.unit_value=num(mm[1]);lastItem.value=lastItem.quantity*lastItem.unit_value;lastItem.confidence=75;continue}
    mm=line.match(/^subtotal\s*[:=-]?\s*R?\$?\s*([\d.]+(?:,\d{1,2})?)$/i);
    if(mm&&lastItem){lastItem.value=num(mm[1]);if(!lastItem.unit_value&&lastItem.quantity)lastItem.unit_value=lastItem.value/lastItem.quantity;continue}
    if(/^(total|validade|garantia)\b/.test(f))continue;
    const item=parseBudgetLine(line,section);
    if(item){(item.type==="PRODUCT"?products:services).push(item)}
  }

  const knownCase=T(caseNumber||s.case_number||"",40);
  const knownClient=T(s.client,300),knownAddress=T(s.address,500),knownRef=T(s.reference||s.contract||s.case_summary,800);
  if(knownCase&&incomingCase&&fold(knownCase)!==fold(incomingCase)){
    conflicts.push({field:"case_number",confirmed:knownCase,incoming:incomingCase,status:"CRITICO",action:"BLOQUEAR_APLICACAO"});
  }
  const checks=[["client",knownClient,header.client],["address",knownAddress,header.address],["reference",knownRef,header.reference]];
  for(const [field,known,incoming] of checks as any){
    if(known&&incoming&&normalizeComparable(known)!==normalizeComparable(incoming)){
      conflicts.push({field,confirmed:known,incoming,status:"DIVERGENTE",action:"PRESERVAR_CONFIRMADO"});
    }
  }

  const knownItems=Array.isArray(s.items)?s.items:(Array.isArray(s.services)?s.services:[]);
  for(const item of [...services,...products]){
    const ni=normalizeComparable(item.name);
    const similar=knownItems.find((x:any)=>{
      const k=normalizeComparable(x.subject||x.description||x.type||"");
      return k&&(ni.includes(k)||k.includes(ni));
    });
    if(similar)item.context_match={status:"COMPATIVEL",source:T(similar.source||similar.context||"F00/F01",1200)};
  }

  let mode="ORCA_REI_V1_INTELLIGENT_INTAKE";
  let budgetStatus="EM_ELABORACAO";
  let applyAllowed=true;
  if(visitIntent&&!hasExplicitPricing){
    mode="VISIT_REQUEST_PRE_BUDGET";
    budgetStatus="PRELIMINAR_A_CONFERIR";
    warnings.push("Texto reconhecido como SOLICITAÇÃO DE VISITA/VISTORIA, não como orçamento.");
    warnings.push("Não há preços/quantitativos suficientes para gerar orçamento. Aguardar retorno técnico da vistoria.");
  }
  if(!services.length&&!products.length&&!visitIntent)warnings.push("Nenhum item orçamentário foi reconhecido automaticamente; revisar texto.");
  if([...services,...products].some((x:any)=>x.unit_value>0&&x.nature_value==="A_CONFERIR"))warnings.push("Há valores sem natureza comprovada (custo ou venda); mantidos como A_CONFERIR.");
  if([...services,...products].some((x:any)=>!x.unit_value))warnings.push("Há itens sem preço unitário; preencher antes do fechamento.");
  if(conflicts.some((x:any)=>x.field==="case_number")){warnings.push("O número do fluxo colado não corresponde ao caso aberto. Aplicação bloqueada para evitar misturar atendimentos.");applyAllowed=false}
  else if(conflicts.length)warnings.push("Há divergência entre o conteúdo colado e dados confirmados do F00/F01; o confirmado deve prevalecer.");
  const confidence=visitIntent&&!hasExplicitPricing?90:Math.max(20,Math.min(95,55+(services.length+products.length?15:0)+(header.client||header.address?10:0)-(conflicts.length?20:0)-([...services,...products].some((x:any)=>!x.unit_value)?10:0)));
  return {ok:true,mode,budget_status:budgetStatus,apply_allowed:applyAllowed,incoming_case_number:incomingCase||null,header,services,products,technical_notes:notes,visit_checklist:checklist,warnings,conflicts,confidence,source:{kind:"PASTED_RAW_TEXT",chars:text.length,lines:lines.length},policy:{f00_f01_preserved:true,third_party_ai_auxiliary:true,no_silent_overwrite:true,math_recalculated:true,visit_text_not_budget:true,case_mismatch_blocked:true}};
}

// ORCA_LEARNING_V1_BEGIN
function learningSubjectKey(v:any){
  return fold(v)
    .replace(/\b(de|da|do|das|dos|e|para|com|em|no|na|nos|nas|um|uma)\b/g," ")
    .replace(/[^a-z0-9]+/g," ")
    .replace(/\s+/g," ")
    .trim()
    .slice(0,180);
}
async function orcaLearningSettings(){
  const q=await db.from("cr_orca_learning_settings_v1")
    .select("learning_enabled,mode,max_context_items,min_human_samples,min_client_approved_samples")
    .eq("settings_key","default").maybeSingle();
  if(q.error)return {learning_enabled:false,mode:"paused",max_context_items:8,error:q.error.message};
  return q.data||{learning_enabled:false,mode:"paused",max_context_items:8};
}
async function learnBudgetItems(caseNumber:string,token:string,budget:any,stage:string,actor:string){
  const cfg:any=await orcaLearningSettings();
  if(!cfg.learning_enabled||cfg.mode==="paused")return {enabled:false,stage,learned:0,skipped:0};
  const labor=Array.isArray(budget?.labor_items)?budget.labor_items:[];
  const materials=Array.isArray(budget?.material_items)?budget.material_items:[];
  const all=[
    ...labor.map((x:any,i:number)=>({x,i,type:"SERVICE"})),
    ...materials.map((x:any,i:number)=>({x,i,type:"PRODUCT"}))
  ];
  let learned=0,skipped=0; const errors:string[]=[];
  for(const row of all){
    const x=row.x||{},name=T(x.name||x.description,300),key=learningSubjectKey(name);
    const unitValue=num(x.unit_value),quantity=num(x.quantity)||1,total=num(x.value)||(quantity*unitValue);
    if(!key||unitValue<=0){skipped++;continue}
    const unit=T(x.unit||"un",30);
    const idem=[stage,caseNumber,row.type,key,String(row.i),String(unitValue)].join(":");
    const q=await db.rpc("cr_orca_record_learning_item_v1",{
      p_idempotency_key:idem,
      p_case_number:caseNumber,
      p_token:token||null,
      p_stage:stage,
      p_subject_type:row.type,
      p_subject_key:key,
      p_display_name:name,
      p_unit:unit,
      p_quantity:quantity,
      p_unit_value:unitValue,
      p_total_value:total,
      p_source:"ORCA_REI_V1_AUTOMATIC",
      p_actor:actor||"Sistema",
      p_payload:{budget_version:budget?.version||1,budget_total:budget?.total_general||null}
    });
    if(q.error){errors.push(q.error.message);continue}
    if(q.data?.learned)learned++; else skipped++;
  }
  return {enabled:true,mode:cfg.mode,stage,learned,skipped,errors:errors.slice(0,3)};
}
async function applyLearningContext(items:any[]){
  const cfg:any=await orcaLearningSettings();
  if(!cfg.learning_enabled||cfg.mode==="paused"||!Array.isArray(items)||!items.length){
    return {enabled:!!cfg.learning_enabled,mode:cfg.mode||"paused",matches:0,items:[]};
  }
  const keys=[...new Set(items.map((x:any)=>learningSubjectKey(x?.name||x?.description)).filter(Boolean))];
  if(!keys.length)return {enabled:true,mode:cfg.mode,matches:0,items:[]};
  const q=await db.from("cr_orca_learning_patterns_v1")
    .select("subject_type,subject_key,display_name,unit,human_reviewed_samples,client_approved_samples,avg_human_reviewed_unit_value,avg_client_approved_unit_value,min_client_approved_unit_value,max_client_approved_unit_value,last_human_reviewed_unit_value,last_client_approved_unit_value,last_case_number,confidence,updated_at")
    .in("subject_key",keys)
    .order("confidence",{ascending:false})
    .limit(Number(cfg.max_context_items||8));
  if(q.error)return {enabled:true,mode:cfg.mode,matches:0,items:[],error:q.error.message};
  const rows=Array.isArray(q.data)?q.data:[];
  const byKey=new Map(rows.map((r:any)=>[r.subject_key,r]));
  for(const item of items){
    const r:any=byKey.get(learningSubjectKey(item?.name||item?.description));
    if(!r)continue;
    item.learning_reference={
      source:"HISTORICO_VALIDADO_CONSTRUREI",
      human_reviewed_samples:r.human_reviewed_samples||0,
      client_approved_samples:r.client_approved_samples||0,
      avg_human_reviewed_unit_value:r.avg_human_reviewed_unit_value,
      avg_client_approved_unit_value:r.avg_client_approved_unit_value,
      min_client_approved_unit_value:r.min_client_approved_unit_value,
      max_client_approved_unit_value:r.max_client_approved_unit_value,
      last_case_number:r.last_case_number,
      confidence:r.confidence,
      advisory_only:true
    };
  }
  return {enabled:true,mode:cfg.mode,matches:rows.length,items:rows,policy:"SUGGEST_ONLY_NO_SILENT_OVERRIDE"};
}
// ORCA_LEARNING_V1_END

function activeFor(phase:string,state:any){
  const q=String(state?.queue_status||"").toUpperCase();
  if(phase==="F03")return !["APROVADA","RECUSADA","TRANSFERIDO_F04","HISTORICO"].includes(q);
  if(phase==="F02")return !["TRANSFERIDO_F03","HISTORICO"].includes(q);
  if(phase==="F01")return !["TRANSFERIDO_F02","COMPLEMENTO_F00","HISTORICO"].includes(q);
  return true;
}
async function one(token:string){const q=await db.from("cr_flow_handoffs").select("*").eq("token",token).maybeSingle();if(q.error)throw Error(q.error.message);return q.data}
async function event(token:string,caseNumber:string,flow:string,type:string,actor:string,payload:any,key:string){
  if(key){const ex=await db.from("cr_flow_events").select("id").eq("token",token).eq("event_type",type).contains("payload",{idempotency_key:key}).maybeSingle();if(ex.data)return ex.data}
  const q=await db.from("cr_flow_events").insert({token,case_number:caseNumber,flow_code:flow,event_type:type,actor,payload:{...(payload||{}),idempotency_key:key||undefined}}).select("id").single();
  if(q.error)throw Error(q.error.message);return q.data
}
async function saveHandoff(h:any,patch:any,actor:string){
  const q=await db.from("cr_flow_handoffs").update({...patch,revision:Number(h.revision||0)+1,updated_by:actor,updated_at:new Date().toISOString()}).eq("token",h.token).eq("revision",h.revision).select("*").single();
  if(q.error)throw Error(q.error.code==="PGRST116"?"O chamado foi alterado por outra ação. Atualize e tente novamente.":q.error.message);
  return q.data
}
function listItem(h:any){const s=h.state||{};return{token:h.token,case_number:h.case_number,from_flow:h.from_flow,to_flow:h.to_flow,phase:norm(h.to_flow),status:h.status,journey_status:h.journey_status,revision:h.revision,updated_at:h.updated_at,legacy:s.schema!=="CR-FLOW-2",queue_status:s.queue_status||"",client:s.client||"",address:s.address||"",case_summary:s.case_summary||s.scope||s.problem||"",items_count:Array.isArray(s.items)?s.items.length:(Array.isArray(s.services)?s.services.length:0),state:s}}
function visitPackage(h:any){
  const s=h.state||{},items=Array.isArray(s.items)?s.items:[],inv=Array.isArray(s.involved)?s.involved:[],ev=Array.isArray(s.evidence)?s.evidence:[];
  const lines=[
    "🏗️ CONSTRUREI | SOLICITAÇÃO DE ATENDIMENTO "+h.case_number,
    "",
    "INFORMAÇÕES DO CHAMADO",
    "IMOBILIÁRIA / CLIENTE: "+(s.client||"A confirmar"),
    "ENDEREÇO: "+(s.address||"A confirmar"),
    "CONTATO: "+(s.contact?.name||"A confirmar"),
    "TELEFONE: "+(s.contact?.phone||"A confirmar"),
    "DISPONIBILIDADE: "+(s.availability||"A confirmar"),
    "",
    "PROBLEMA / ESCOPO:",
    s.case_summary||"Atendimento técnico.",
  ];
  if(items.length){lines.push("","ITENS IDENTIFICADOS:");items.forEach((x:any,i:number)=>lines.push((i+1)+". "+(x.subject||x.description||"Item")+" "+(x.environment?"— "+x.environment:"")))}
  if(inv.length){lines.push("","ENVOLVIDOS:");inv.slice(0,12).forEach((x:any)=>lines.push("• "+([x.name,x.role,x.unit?("Un. "+x.unit):"",x.phone].filter(Boolean).join(" — "))))}
  lines.push("","EVIDÊNCIAS: "+(ev.length?ev.length+" arquivo(s) já recebido(s)":"sem arquivo registrado"));
  lines.push("","OBJETIVO DA VISITA: Confirmar tecnicamente os itens relatados, registrar evidências, medidas, testes e informações necessárias para definir o escopo.");
  lines.push("","O QUE PRECISA SER LEVANTADO: causa quando tecnicamente verificável, medidas/quantitativos, materiais, mão de obra, condições de acesso e qualquer ressalva necessária.");
  return lines.join("\n");
}
Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers:H});
  const u=new URL(req.url),api=(u.searchParams.get("api")||"health").toLowerCase();
  if(req.method==="GET"&&api==="health")return J({ok:true,build:BUILD,legacy:LEGACY,contracts:{f00_f01:"F00_F01_HANDOFF_V6",f01_f02:"F01_F02_HANDOFF_V2",f02_f03:"F02_F03_HANDOFF_V2"},stage_runtime:{flows:["F04","F05","F06","F07","F08","F09"],mode:"RPC_CANONICAL",functions:["cr_flow_case_state","cr_flow_stage_save","cr_flow_transition"]}});
  if(req.method!=="POST")return J({ok:false,error:"Method not allowed"},405);
  try{
    const b=await req.json().catch(()=>({})),actor=T(b.actor||"Equipe",100)||"Equipe";
    if(api==="list"){
      const phase=T(b.phase,10).toUpperCase(),includeHistory=!!b.include_history;
      if(!["F01","F02","F03"].includes(phase))return J({ok:false,error:"Fase inválida."},400);
      const q=await db.from("cr_flow_handoffs").select("*").order("updated_at",{ascending:false}).limit(500);if(q.error)throw Error(q.error.message);
      const cases=(q.data||[]).filter((h:any)=>norm(h.to_flow)===phase).map(listItem).filter((x:any)=>includeHistory||activeFor(phase,x.state));
      return J({ok:true,phase,cases,legacy_url:(LEGACY as any)[phase]});
    }
    if(api==="get"){
      const h=await one(T(b.token,200));if(!h)return J({ok:false,error:"Chamado não encontrado."},404);
      const ev=await db.from("cr_flow_events").select("*").eq("token",h.token).order("created_at",{ascending:false}).limit(100);
      return J({ok:true,handoff:h,item:listItem(h),events:ev.data||[],visit_package:visitPackage(h),legacy_url:(LEGACY as any)[norm(h.to_flow)]});
    }
    if(api==="route"){
      const h=await one(T(b.token,200));if(!h)return J({ok:false,error:"Chamado não encontrado."},404);
      const decision=T(b.decision,30).toUpperCase(),key="F01_ROUTE:"+h.case_number+":"+decision;
      const s=h.state||{},now=new Date().toISOString(),phase=norm(h.to_flow);
      if(decision==="COMPLEMENT_F00"&&phase==="F00"&&s.f01?.decision==="COMPLEMENT_F00"){
        const f00id=T(s.f00_case_id,80);
        if(f00id){
          const fq=await db.from("cr_f00_cases").select("id,structured,released_f01,status").eq("id",f00id).maybeSingle();
          if(fq.data){
            const fst=fq.data.structured||{},fstruct={...fst,lifecycle:{...(fst.lifecycle||{}),current_phase:"F00",current_owner:"GABRIELLY",queue_status:"EM_COLETA",handoff_status:"RETURNED_FOR_COMPLEMENT",last_action_at:now}};
            await db.from("cr_f00_cases").update({released_f01:false,awaiting_response:false,status:"EM_COLETA",structured:fstruct,updated_at:now,updated_by:actor}).eq("id",f00id);
          }
        }
        return J({ok:true,idempotent:true,handoff:h,f00_url:"https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f00"});
      }
      if(phase!=="F01")return J({ok:false,error:"Este chamado não está sob responsabilidade do F01."},409);
      if(decision==="DIRECT_BUDGET"){
        const ns={...s,current_phase:"F02",current_owner:"COMERCIAL",queue_status:"EM_ORCAMENTO",handoff_status:"CONFIRMED",f01:{...(s.f01||{}),status:"TRANSFERRED_F02",decision:"DIRECT_BUDGET",decided_by:actor,decided_at:now},f01_decision:"DIRECT_BUDGET",f01_decided_by:actor,f01_decided_at:now};
        const out=await saveHandoff(h,{from_flow:"F01",to_flow:"F02",state:ns,status:"READY",received_at:now},actor);await event(h.token,h.case_number,"F01","F01_RELEASED_F02",actor,{to_flow:"F02",contract:"F01_F02_HANDOFF_V2"},key);return J({ok:true,handoff:out});
      }
      if(decision==="VISIT"){
        const ns={...s,current_phase:"F01",current_owner:"ATENDIMENTO",queue_status:"AGUARDANDO_VISITA",f01:{...(s.f01||{}),status:"WAITING_VISIT",decision:"VISIT",decided_by:actor,decided_at:now},f01_decision:"VISIT",f01_decided_by:actor,f01_decided_at:now};
        const out=await saveHandoff(h,{from_flow:"F01",to_flow:"F01",state:ns,status:"READY"},actor);await event(h.token,h.case_number,"F01","F01_WAITING_VISIT",actor,{},key);return J({ok:true,handoff:out,visit_package:visitPackage(out)});
      }
      if(decision==="COMPLEMENT_F00"){
        const f00id=T(s.f00_case_id,80);if(!f00id)return J({ok:false,error:"Este caso não possui vínculo F00 para reabrir."},422);
        const fq=await db.from("cr_f00_cases").select("id,structured").eq("id",f00id).maybeSingle();if(!fq.data)return J({ok:false,error:"Chamado F00 não encontrado."},404);
        const fst=fq.data.structured||{},fstruct={...fst,lifecycle:{...(fst.lifecycle||{}),current_phase:"F00",current_owner:"GABRIELLY",queue_status:"EM_COLETA",handoff_status:"RETURNED_FOR_COMPLEMENT",last_action_at:now}};
        const fu=await db.from("cr_f00_cases").update({released_f01:false,awaiting_response:false,status:"EM_COLETA",structured:fstruct,updated_at:now,updated_by:actor}).eq("id",f00id);if(fu.error)throw Error(fu.error.message);
        await db.from("cr_f00_events").insert({case_id:f00id,event_type:"F01_RETURNED_TO_F00_COMPLEMENT",event_text:"Retornado pelo F01 para complementação.",actor});
        const ns={...s,current_phase:"F00",current_owner:"GABRIELLY",queue_status:"COMPLEMENTO_F00",handoff_status:"RETURNED",f01:{...(s.f01||{}),status:"RETURNED_F00",decision:"COMPLEMENT_F00",decided_by:actor,decided_at:now}};
        const out=await saveHandoff(h,{from_flow:"F01",to_flow:"F00",state:ns,status:"READY"},actor);await event(h.token,h.case_number,"F01","F01_RETURNED_TO_F00_COMPLEMENT",actor,{},key);return J({ok:true,handoff:out,f00_url:"https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=f00"});
      }
      if(decision==="ESCALATE"){
        const ns={...s,current_phase:"F01",current_owner:"DIRETORIA",queue_status:"ESCALONADO",f01:{...(s.f01||{}),status:"ESCALATED",decision:"ESCALATE",decided_by:actor,decided_at:now}};
        const out=await saveHandoff(h,{state:ns},actor);await event(h.token,h.case_number,"F01","F01_ESCALATED",actor,{reason:T(b.reason,1000)},key);return J({ok:true,handoff:out});
      }
      return J({ok:false,error:"Decisão inválida."},400);
    }
    if(api==="visit-return"){
      const h=await one(T(b.token,200));if(!h)return J({ok:false,error:"Chamado não encontrado."},404);
      if(norm(h.to_flow)!=="F01")return J({ok:false,error:"Chamado fora do F01."},409);
      const ret=T(b.technical_return,12000);if(!ret)return J({ok:false,error:"Informe o retorno técnico."},400);
      const now=new Date().toISOString(),s=h.state||{},ns={...s,current_phase:"F01",current_owner:"ATENDIMENTO",queue_status:"EM_QUALIFICACAO",technical_return:{text:ret,by:actor,at:now},f01:{...(s.f01||{}),status:"READY_TO_ROUTE",visit_returned_at:now}};
      const out=await saveHandoff(h,{state:ns},actor);await event(h.token,h.case_number,"F01","F01_VISIT_RETURNED",actor,{technical_return:ret},"VISIT_RETURN:"+h.case_number+":"+String(h.revision));return J({ok:true,handoff:out});
    }
    if(api==="budget-base"){
      const h=await one(T(b.token,200));if(!h)return J({ok:false,error:"Chamado não encontrado."},404);
      if(norm(h.to_flow)!=="F02")return J({ok:false,error:"Chamado fora do F02."},409);
      const s=h.state||{},src=Array.isArray(s.items)?s.items:(Array.isArray(s.services)?s.services:[]);
      const actionable=src.filter((x:any)=>{
        const subject=fold(x?.subject||x?.description||x?.type||""),source=fold(x?.source||x?.context||"");
        if(/nao (?:estao )?contemplad|nao contempla|fora do escopo|salvo contratacao/.test(source))return false;
        if(subject.includes("pintura")&&/nao .*pintura|pintura interna/.test(source))return false;
        if(subject.includes("registro")&&/registro fotografico|registro de evidenc/.test(source))return false;
        return true;
      });
      const base=(actionable.length?actionable:[{subject:s.case_summary||"Serviço"}]).map((x:any,i:number)=>({
        item:i+1,
        subject:T(x.subject||x.description||x.type||"Serviço",300),
        labor_description:"Executar "+T(x.subject||x.description||"serviço previsto",500),
        labor_value:"",
        material_description:"",
        material_value:"",
        source:T(x.source||"",1200)
      }));
      const notes:string[]=[];
      if(T(s.technical_return?.text,20000))notes.push("Basear quantitativos e escopo no retorno técnico validado.");
      if(Array.isArray(s.conflicts)&&s.conflicts.length)notes.push("Revisar divergências antes de fechar o orçamento.");
      return J({ok:true,items:base,technical_notes:notes,filtered_count:Math.max(0,src.length-actionable.length),mode:"DETERMINISTIC_BUDGET_BASE"});
    }
    if(api==="return-previous"){
      const h=await one(T(b.token,200));if(!h)return J({ok:false,error:"Chamado não encontrado."},404);
      const phase=norm(h.to_flow),s=h.state||{},now=new Date().toISOString();
      const map:any={F03:{to:"F02",owner:"COMERCIAL",queue:"EM_ORCAMENTO",event:"F03_RETURNED_F02"},F02:{to:"F01",owner:"ATENDIMENTO",queue:"EM_QUALIFICACAO",event:"F02_RETURNED_F01"}};
      const cfg=map[phase];if(!cfg)return J({ok:false,error:"Retorno não disponível a partir de "+phase+"."},409);
      const ns={...s,current_phase:cfg.to,current_owner:cfg.owner,queue_status:cfg.queue,handoff_status:"RETURNED",last_return:{from:phase,to:cfg.to,reason:T(b.reason,1000),by:actor,at:now}};
      const out=await saveHandoff(h,{from_flow:phase,to_flow:cfg.to,state:ns,status:"READY",received_at:now},actor);
      await event(h.token,h.case_number,phase,cfg.event,actor,{to_flow:cfg.to,reason:T(b.reason,1000)},"RETURN:"+h.case_number+":"+phase+":"+String(out.revision));
      return J({ok:true,handoff:out,to_flow:cfg.to});
    }

    if(api==="budget-intake"){
      const h=b.token?await one(T(b.token,200)):null;
      if(h&&norm(h.to_flow)!=="F02")return J({ok:false,error:"Chamado fora do F02."},409);
      const state=h?.state||b.context||{};
      const out=intelligentBudgetIntake(b.raw_text,state,h?.case_number||b.case_number||"");
      if(!out.ok)return J(out,400);
      const learning=await applyLearningContext([...(out.services||[]),...(out.products||[])]);
      if(h){
        await event(h.token,h.case_number,"F02","F02_INTELLIGENT_INTAKE_PARSED",actor,{source:out.source,confidence:out.confidence,conflicts:out.conflicts?.length||0,warnings:out.warnings?.length||0,learning_matches:learning.matches||0},"INTAKE:"+h.case_number+":"+String(h.revision)+":"+String(out.source?.chars||0));
      }
      return J({...out,learning,build:BUILD});
    }

    if(api==="learning-status"){
      const settings=await orcaLearningSettings();
      const ev=await db.from("cr_orca_learning_events_v1").select("*",{count:"exact",head:true});
      const pt=await db.from("cr_orca_learning_patterns_v1").select("*",{count:"exact",head:true});
      return J({ok:true,build:BUILD,agent:"ORCA_REI_V1",learning:{enabled:!!settings.learning_enabled,mode:settings.mode||"paused",events:ev.count||0,patterns:pt.count||0,policy:"VALIDATED_ONLY_NO_SELF_MODIFYING_CODE"}});
    }

    if(api==="budget-audit"){
      const h=b.token?await one(T(b.token,200)):null;
      if(h&&norm(h.to_flow)!=="F02")return J({ok:false,error:"Chamado fora do F02."},409);
      const audit=orcaAudit(b);
      return J({ok:true,build:BUILD,mode:"ORCA_REI_V1_DETERMINISTIC_AUDIT",audit});
    }
    if(api==="budget-save"){
      const h=await one(T(b.token,200));if(!h)return J({ok:false,error:"Chamado não encontrado."},404);
      if(norm(h.to_flow)!=="F02")return J({ok:false,error:"Chamado fora do F02."},409);
      const labor=Array.isArray(b.labor_items)?b.labor_items:[],materials=Array.isArray(b.material_items)?b.material_items:[],notes=Array.isArray(b.technical_notes)?b.technical_notes:[],third=Array.isArray(b.third_party_quotes)?b.third_party_quotes:[],unc=Array.isArray(b.uncertainties)?b.uncertainties:[];
      const totalLabor=labor.reduce((a:any,x:any)=>a+num(x.value??(num(x.quantity)*num(x.unit_value))),0),totalMaterial=materials.reduce((a:any,x:any)=>a+num(x.value??(num(x.quantity)*num(x.unit_value))),0),totalGeneral=totalLabor+totalMaterial;
      const s=h.state||{},prev=Number(s.budget?.version||0),version=Math.max(1,prev+(b.new_version?1:0)),ready=!!b.budget_ready,orca=!!b.orca_rei_v1;
      const audit=orca?orcaAudit({...b,sale_total:totalGeneral,labor_items:labor,material_items:materials}):null;
      if(orca&&ready&&!audit?.gate_ready)return J({ok:false,error:"ORÇA-REI: gate F02 não concluído. Confirme custos e revisão humana antes de marcar PRONTO F03.",audit},422);
      const budget={status:ready?"PRONTO_F03":T(b.budget_status,40)||"EM_ELABORACAO",version,labor_items:labor,material_items:materials,technical_notes:notes,third_party_quotes:third,uncertainties:unc,total_labor:totalLabor,total_material:totalMaterial,total_general:totalGeneral,human_review_required:b.human_review_required!==false,human_review_approved:orca?!!b.human_review_approved:undefined,commercial_override:orca?!!b.commercial_override:undefined,copy_ready_text:T(b.copy_ready_text,30000),budget_ready:ready,agent:orca?{code:"ORCA_REI_V1",mode:"F02_PREPARAR",canonical:true}:s.budget?.agent,pricing_params:orca?{charges_rate:audit?.charges_rate,target_margin:audit?.target_margin}:s.budget?.pricing_params,internal_analysis:orca?audit:s.budget?.internal_analysis,updated_by:actor,updated_at:new Date().toISOString()};
      const ns={...s,current_phase:"F02",current_owner:"COMERCIAL",queue_status:ready?"PRONTO_F03":"EM_ORCAMENTO",budget};
      const out=await saveHandoff(h,{state:ns},actor);await event(h.token,h.case_number,"F02",ready?"F02_BUDGET_READY":"F02_BUDGET_SAVED",actor,{version,total_general:totalGeneral},"BUDGET_SAVE:"+h.case_number+":"+String(out.revision));return J({ok:true,handoff:out,budget});
    }
    if(api==="budget-release"){
      const h=await one(T(b.token,200));if(!h)return J({ok:false,error:"Chamado não encontrado."},404);
      if(norm(h.to_flow)!=="F02")return J({ok:false,error:"Chamado fora do F02."},409);
      const s=h.state||{};if(!s.budget?.budget_ready)return J({ok:false,error:"Orçamento ainda não está marcado como pronto."},422);if(s.budget?.agent?.code==="ORCA_REI_V1"&&!s.budget?.internal_analysis?.gate_ready)return J({ok:false,error:"ORÇA-REI: gate interno não aprovado para F03."},422);
      const now=new Date().toISOString(),ns={...s,current_phase:"F03",current_owner:"DIRETORIA",queue_status:"PREPARANDO",handoff_status:"CONFIRMED",f02:{status:"TRANSFERRED_F03",transferred_at:now},proposal:{...(s.proposal||{}),status:"PREPARANDO"}};
      const out=await saveHandoff(h,{from_flow:"F02",to_flow:"F03",state:ns,status:"READY",received_at:now},actor);
      const learning=await learnBudgetItems(h.case_number,h.token,s.budget,"F02_HUMAN_APPROVED",actor);
      await event(h.token,h.case_number,"F02","F02_RELEASED_F03",actor,{to_flow:"F03",contract:"F02_F03_HANDOFF_V2",learning},"F02_RELEASE:"+h.case_number+":"+String(s.budget.version||1));
      return J({ok:true,handoff:out,learning});
    }
    if(api==="proposal-save"){
      const h=await one(T(b.token,200));if(!h)return J({ok:false,error:"Chamado não encontrado."},404);
      if(norm(h.to_flow)!=="F03")return J({ok:false,error:"Chamado fora do F03."},409);
      const allowed=["PREPARANDO","ENVIADA","EM NEGOCIACAO","EM_NEGOCIACAO","APROVADA","RECUSADA"],raw=T(b.status,40).toUpperCase(),status=raw==="EM_NEGOCIACAO"?"EM NEGOCIACAO":raw;
      if(!allowed.includes(raw)&&status!=="EM NEGOCIACAO")return J({ok:false,error:"Status inválido."},400);
      if(status!=="APROVADA"&&T(b.os_number,100))return J({ok:false,error:"OS só pode ser registrada após aprovação."},422);
      const now=new Date().toISOString(),s=h.state||{},proposal={...(s.proposal||{}),status,approved_value:num(b.approved_value)||null,approval_channel:T(b.approval_channel,100),approved_by:T(b.approved_by,160),conditions:T(b.conditions,4000),os_number:status==="APROVADA"?T(b.os_number,100):"",os_ready:status==="APROVADA",updated_by:actor,updated_at:now};
      const approved=status==="APROVADA";
      const queue=approved?"TRANSFERIDO_F04":status==="RECUSADA"?"RECUSADA":status.replace(/ /g,"_");
      const ns={...s,current_phase:approved?"F04":"F03",current_owner:"DIRETORIA",queue_status:queue,proposal};
      if(approved){
        const tr=await db.rpc("cr_flow_transition",{p_token:h.token,p_flow_code:"F03",p_state:ns,p_actor:actor});
        if(tr.error)throw Error(tr.error.message);
        const moved=await one(h.token);
        const learning=await learnBudgetItems(h.case_number,h.token,s.budget,"F03_CLIENT_APPROVED",actor);
        await event(h.token,h.case_number,"F03","F03_APPROVED",actor,{status,os_ready:proposal.os_ready,to_flow:"F04",learning},"F03_APPROVED:"+h.case_number+":"+String(moved?.revision||""));
        return J({ok:true,handoff:moved,proposal,transition:tr.data,learning});
      }
      const out=await saveHandoff(h,{state:ns,status:"READY"},actor);
      const et=status==="RECUSADA"?"F03_REJECTED":status==="ENVIADA"?"F03_SENT":status==="EM NEGOCIACAO"?"F03_NEGOTIATION":"F03_SAVED";
      await event(h.token,h.case_number,"F03",et,actor,{status,os_ready:proposal.os_ready},"F03:"+h.case_number+":"+status+":"+String(out.revision));
      return J({ok:true,handoff:out,proposal});
    }
    if(api==="flow-state"){
      const token=T(b.handoff_token||b.token,200);if(!token)return J({ok:false,error:"handoff_token obrigatório."},400);
      const q=await db.rpc("cr_flow_case_state",{p_token:token});if(q.error)throw Error(q.error.message);
      return J(q.data||{ok:false,error:"Estado não encontrado."},q.data?.ok===false?404:200);
    }
    if(api==="flow-save"){
      const token=T(b.handoff_token||b.token,200),flow=norm(b.flow_code),st=b.state||{},who=T(b.actor,120)||actor;
      if(!token||!/^F0[4-9]$/.test(flow))return J({ok:false,error:"handoff_token/flow_code inválidos."},400);
      const current=await one(token);if(!current)return J({ok:false,error:"Handoff não encontrado."},404);
      const cur=norm(current.to_flow);if(cur!==flow)return J({ok:false,error:"Este chamado está sob responsabilidade de "+cur+", não "+flow+"."},409);
      const q=await db.rpc("cr_flow_stage_save",{p_token:token,p_flow_code:flow,p_state:st,p_actor:who});if(q.error)throw Error(q.error.message);
      return J(q.data||{ok:false,error:"Falha ao salvar."});
    }
    if(api==="flow-advance"){
      const token=T(b.handoff_token||b.token,200),flow=norm(b.flow_code),st=b.state||{},who=T(b.actor,120)||actor;
      if(!token||!/^F0[4-9]$/.test(flow))return J({ok:false,error:"handoff_token/flow_code inválidos."},400);
      const current=await one(token);if(!current)return J({ok:false,error:"Handoff não encontrado."},404);
      const cur=norm(current.to_flow);if(cur!==flow)return J({ok:false,error:"Este chamado está sob responsabilidade de "+cur+", não "+flow+"."},409);
      const q=await db.rpc("cr_flow_transition",{p_token:token,p_flow_code:flow,p_state:st,p_actor:who});if(q.error)throw Error(q.error.message);
      return J(q.data||{ok:false,error:"Falha ao avançar."});
    }
    if(api==="ai-assist"){
      const flow=norm(b.flow_code||b.flow||"");let ctx:any={};try{ctx=typeof b.context==="string"?JSON.parse(b.context):b.context||{}}catch{}
      const st=ctx?.state||ctx||{},fd=st?.flow_data?.[flow]||{};
      const c=await db.from("cr_flow_catalog").select("title,fields,checklist").eq("code",flow).maybeSingle();if(c.error)throw Error(c.error.message);
      const fields=Array.isArray(c.data?.fields)?c.data.fields:[],checks=Array.isArray(c.data?.checklist)?c.data.checklist:[];
      const missing=fields.filter((f:any)=>!T(fd?.[f.key],200)).map((f:any)=>f.label);
      const checkState=fd?._checks||{},unchecked=checks.filter((_:any,i:number)=>!checkState[i]);
      const lines:string[]=[];lines.push((c.data?.title||flow)+" — conferência operacional");
      if(missing.length)lines.push("Campos ainda sem informação: "+missing.join("; ")+"." );else lines.push("Campos principais preenchidos.");
      if(unchecked.length)lines.push("Checklist ainda pendente: "+unchecked.join("; ")+"." );else lines.push("Checklist marcado como concluído.");
      lines.push("A decisão final continua com o responsável da fase.");
      return J({ok:true,text:lines.join("\n"),mode:"DETERMINISTIC_OPERATIONAL_ASSIST"});
    }
    return J({ok:false,error:"Rota não encontrada."},404);
  }catch(e){return J({ok:false,error:e instanceof Error?e.message:String(e),build:BUILD},500)}
});
