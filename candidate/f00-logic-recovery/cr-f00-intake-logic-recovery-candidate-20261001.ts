
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";
const SB=Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co";
let K="";try{const x=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");K=x.default||x.service_role||""}catch{}if(!K)K=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const db=createClient(SB,K,{auth:{persistSession:false,autoRefreshToken:false}});
const BUILD="CR-F00-LOGIC-RECOVERY-CANDIDATE-V10-20261001",SEM=SB+"/functions/v1/triagem-atendimento-browser",F01=SB+"/functions/v1/triagem-atendimento-api",F01URL=SB+"/functions/v1/central-atendimento?mode=f01",BUCKET="triagem-anexos";
const H={"cache-control":"no-store","access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type","x-content-type-options":"nosniff","x-construrei-build":BUILD};
const J=(d:any,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{...H,"content-type":"application/json; charset=utf-8"}});
const T=(v:any,n=5000)=>String(v??"").trim().slice(0,n);
async function sha(s:string){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function auth(req:Request){const k=T(req.headers.get("x-f00-key"),300);if(!k)return null;const q=await db.from("cr_f00_operators").select("display_name,role").eq("key_hash",await sha(k)).eq("active",true).maybeSingle();return q.data||null}

function fold(v:any){return T(v,120000).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function clean(v:any,n=500){return T(v,n).replace(/\s+/g," ").trim()}
const ITEM_RULES:any[]=[
  ["interfone",/\binterfone\b/i,"Interfone"],
  ["torneira",/\btorneira\b/i,"Torneira"],
  ["tomada",/\btomad[ao]s?\b/i,"Tomada"],
  ["porta",/\bporta\b/i,"Porta"],
  ["chuveiro",/\bchuveiro\b|\bducha\b/i,"Chuveiro / ducha"],
  ["descarga",/\bdescarga\b|\bcaixa acoplada\b|\bvaso\b/i,"Descarga / vaso sanitário"],
  ["registro",/\bregistro\b/i,"Registro hidráulico"],
  ["interrup_eletrica",/\bdisjuntor\b|\bcurto\b|\bfiação\b|\bfiacao\b|\blumin[aá]ria\b|\bspot\b/i,"Elétrica"],
  ["telhado",/\btelhado\b|\bcalha\b|\brufo\b|\bcobertura\b/i,"Cobertura / telhado"],
  ["pintura",/\bpintura\b|\btinta\b|\bparede\b.*\bmancha/i,"Pintura"],
  ["trinca",/\btrinca\b|\bfissura\b/i,"Trinca / fissura"],
  ["infiltracao",/\binfiltra|\bvazamento\b|\bumidade\b/i,"Possível vazamento / infiltração"],
  ["aquecedor",/\baquecedor\b|\bágua quente\b|\bagua quente\b/i,"Aquecedor"],
  ["ar_condicionado",/\bar[- ]?condicionado\b/i,"Ar-condicionado"],
  ["box",/\bbox\b/i,"Box / vedação"],
  ["rejunte",/\brejunte\b/i,"Rejunte"],
  ["piso",/\bpiso\b|\bporcelanato\b|\bcer[aâ]mica\b|\blascad/i,"Piso / revestimento"],
  ["entupimento",/\bentup|\bdesentup/i,"Entupimento / desentupimento"],
  ["forro",/\bforro\b|\bgesso\b/i,"Forro / gesso"],
  ["drywall",/\bdrywall\b/i,"Drywall"],
  ["janela",/\bjanela\b|\besquadria\b/i,"Janela / esquadria"],
  ["armario",/\barm[aá]rio\b|\bm[oó]vel\b/i,"Armário / móvel"]
];
function envOf(line:string){
  const l=fold(line);
  const envs:any[]=[
    ["banheiro",/\bbanheiro\b|\bwc\b/],["cozinha",/\bcozinha\b/],["quarto",/\bquarto\b|\bdormit[oó]rio\b/],
    ["suíte",/\bsuite\b|\bsu[ií]te\b/],["sala",/\bsala\b/],["sacada",/\bsacada\b|\bvaranda\b/],
    ["área de serviço",/\barea de servico\b|\blavanderia\b/],["hall",/\bhall\b|\bcircula[cç][aã]o\b/],
    ["garagem",/\bgaragem\b/],["fachada",/\bfac?hada\b/],["cobertura",/\bcobertura\b|\btelhado\b/],
    ["área externa",/\barea externa\b|\bquintal\b|\bcal[cç]ada\b/]
  ];
  for(const [name,re] of envs)if(re.test(l))return name;
  return "";
}

function phoneDigits(v:any){let d=String(v||"").replace(/\D/g,"");if(d.startsWith("55")&&d.length>=12)d=d.slice(2);return d}
function phoneFmt(v:any){const d=phoneDigits(v);if(d.length===11)return"("+d.slice(0,2)+") "+d.slice(2,7)+"-"+d.slice(7);if(d.length===10)return"("+d.slice(0,2)+") "+d.slice(2,6)+"-"+d.slice(6);return clean(v,40)}
function operationalLine(v:any){
  const f=fold(v);
  return /ja esta no texto|esta no texto original|texto inicial|procure no texto|ja foi informado|ja mandei|ja tem o telefone|ja tem o contato|veja a mensagem inicial|responsavel pelo pagamento.*nome do contato|telefone do contato.*ja esta/.test(f);
}
function badPersonName(v:any){
  const f=fold(v);
  return !f||/responsavel pelo pagamento|nome do contato|telefone do contato|ja esta|procure|texto inicial|texto original|informacoes visita|problema\/escopo|objetivo da visita|horario comercial/.test(f);
}
function paymentFromHistory(raw:string){
  const lines=String(raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  let candidate="";
  for(const line of lines){
    const f=fold(line);
    let m=line.match(/respons[aá]vel\s+(?:pelo|por)\s+pagamento\s*[:\-]\s*([^,;|]{2,100})/i);
    if(m){candidate=clean(m[1],100);continue}
    m=line.match(/pagamento\s+(?:por\s+conta\s+da?|pela?|ser[aá]\s+(?:feito\s+)?pela?)\s*[:\-]?\s*([^,;|.]{2,100})/i);
    if(m){candidate=clean(m[1],100);continue}
    m=line.match(/faturar\s+(?:para|em nome de)\s*[:\-]?\s*([^,;|.]{2,100})/i);
    if(m){candidate=clean(m[1],100);continue}
    m=line.match(/\b(propriet[aá]rio|propriet[aá]ria|inquilino|inquilina|imobili[aá]ria|administradora)\s+(?:paga|pagar[aá]|ser[aá]\s+respons[aá]vel\s+pelo\s+pagamento)/i);
    if(m)candidate=clean(m[1],100);
  }
  return candidate;
}
function paymentConflict(raw:string){
  const f=fold(raw);
  if(/propriet[aá]ri[oa].{0,80}autoriz/.test(f)&&/faturar.{0,80}imobili[aá]ria|faturamento.{0,80}imobili[aá]ria/.test(f))
    return"Encontrei que o proprietário autorizou e o faturamento está indicado para a imobiliária. Confirme quem será responsável pelo pagamento.";
  if(/inquilin[oa].{0,80}autoriz/.test(f)&&/faturar.{0,80}propriet[aá]ri[oa]|faturamento.{0,80}propriet[aá]ri[oa]/.test(f))
    return"Encontrei autorização do inquilino e faturamento indicado para o proprietário. Confirme quem será responsável pelo pagamento.";
  return"";
}
function extractDirectPeople(raw:string){
  const out:any[]=[];
  const push=(name:string,phone:string,role="contato",context="")=>{
    name=clean(name,100).replace(/^[•\-–—: ]+|[•\-–—: ]+$/g,"");phone=phoneFmt(phone);
    if(!name||badPersonName(name)||operationalLine(context||name))return;
    const pd=phoneDigits(phone);
    const hit=out.find((p:any)=>(pd&&phoneDigits(p.phone)===pd)||fold(p.name)===fold(name));
    if(hit){if(!hit.phone&&phone)hit.phone=phone;if(hit.role==="contato"&&role!=="contato")hit.role=role;return}
    out.push({name,phone,role,context});
  };
  const lines=String(raw||"").split(/\r?\n/);
  let inContact=false;
  for(const rawLine of lines){
    const line=rawLine.replace(/^\s*[•▪◦*\-]\s*/,"").trim();
    if(!line)continue;
    if(/CONTATO\s*:/i.test(line)){inContact=true;continue}
    if(/PROBLEMA\/ESCOPO|OBJETIVO DA VISITA|OBSERVA[CÇ][AÃ]O|ENDERE[CÇ]O\s*:|CLIENTE\/ORIGEM/i.test(line))inContact=false;
    if(operationalLine(line))continue;
    let m=line.match(/^([A-ZÀ-Ý][A-Za-zÀ-ÿ' .-]{1,80}?)\s*[-–—:]\s*(?:\+?55[\s.-]*)?(\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]*[-.]?\d{4})\b/);
    if(m){push(m[1],m[2],inContact?"contato":"papel a confirmar",line);continue}
    m=line.match(/^([A-ZÀ-Ý][A-Za-zÀ-ÿ' .-]{1,80}?)\s+(?:\+?55[\s.-]*)?(\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]*[-.]?\d{4})\b/);
    if(m){push(m[1],m[2],inContact?"contato":"papel a confirmar",line);continue}
    m=line.match(/^(?:contato|morador(?:a)?|inquilin[oa]|locat[aá]ri[oa]|propriet[aá]ri[oa]|zelador(?:a)?|s[ií]ndic[oa])\s*[:\-]\s*([A-ZÀ-Ý][A-Za-zÀ-ÿ' .-]{1,80})(?:\s*[-–—,]\s*(?:\+?55[\s.-]*)?(\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]*[-.]?\d{4}))?/i);
    if(m)push(m[1],m[2]||"",roleName(line.split(/[:\-]/)[0]),line);
  }
  return out.slice(0,30);
}
function reconciliationRequested(raw:string){return /ja esta no texto|texto original|texto inicial|procure no texto|ja foi informado|ja mandei|ja tem o telefone|ja tem o contato|veja a mensagem inicial/i.test(fold(raw))}
function resolveValue(manual:any,extracted:any,confirmed:any,existing:any){
  if(T(manual,300))return{value:T(manual,300),source:"correcao_manual",confidence:"CONFIRMED"};
  if(confirmed&&T(confirmed.value,300)&&(confirmed.source==="correcao_manual"||confirmed.confidence==="CONFIRMED"))return{value:T(confirmed.value,300),source:confirmed.source||"confirmado",confidence:"CONFIRMED"};
  if(T(extracted,300))return{value:T(extracted,300),source:"historico",confidence:"HIGH"};
  if(confirmed&&T(confirmed.value,300))return{value:T(confirmed.value,300),source:confirmed.source||"confirmado",confidence:confirmed.confidence||"HIGH"};
  if(T(existing,300))return{value:T(existing,300),source:"estado_anterior",confidence:"MEDIUM"};
  return{value:"",source:"",confidence:"LOW"};
}

function statements(raw:string){
  const out:string[]=[];
  for(const line0 of String(raw||"").replace(/--- COMPLEMENTO ---/g,"\n").split(/\r?\n/)){
    const line=line0.replace(/^\s*(?:[-•▪◦*]|\d{1,3}[.)-])\s*/,"").trim();
    if(!line||operationalLine(line))continue;
    const parts=line.split(/\s*;\s*|\s+\|\s+/).map(x=>x.trim()).filter(Boolean);
    for(const p of parts)if(p.length>=3)out.push(p.slice(0,700));
  }
  return out.slice(0,500);
}
function detectCaseType(raw:string,items:any[]){
  const f=fold(raw);
  if(/vistoria de saida|revistoria|rescis[aã]o|apontamentos? de vistoria/.test(f))return"VISTORIA_SAIDA";
  const units=[...new Set([...f.matchAll(/\b(?:apto|apartamento|unidade|bloco|sala|loja)\s*(?:n[ºo.]?\s*)?([a-z0-9-]{1,10})/g)].map(m=>m[1]))];
  if(/infiltra|vazamento|umidade/.test(f)&&(units.length>=2||/apartamento de cima|unidade superior|unidade inferior|\bem cima\b|\babaixo\b|vizinho/.test(f)))return"INFILTRACAO_ENTRE_UNIDADES";
  if(/infiltra|vazamento|umidade|geofone/.test(f))return"INFILTRACAO_VAZAMENTO";
  if(/vistoria tecnica|visita tecnica|realizar vistoria|levantamento tecnico|levantar mao de obra|levantar materiais/.test(f))return"VISTORIA_TECNICA";
  if(/aquecedor|ar-condicionado|ar condicionado|pressurizador|bomba|central/.test(f))return"EQUIPAMENTO";
  if(items.length>1)return"MULTIPLOS_REPAROS";
  return"ITEM_UNICO";
}
function itemSummary(rule:string,line:string){
  const l=clean(line,280);
  if(rule==="infiltracao")return /infiltra/i.test(l)?"Possível infiltração":/vazamento/i.test(l)?"Possível vazamento":"Umidade / possível infiltração";
  if(rule==="porta")return /fech|trinco|ma[cç]aneta|fechadura/i.test(l)?"Porta / fechadura":"Porta";
  if(rule==="chuveiro")return /press[aã]o|aquec/i.test(l)?"Chuveiro — pressão/aquecimento":"Chuveiro / ducha";
  if(rule==="tomada")return /solta|fora do lugar|danific/i.test(l)?"Tomada solta/danificada":"Tomada";
  if(rule==="torneira")return /vaz|ping/i.test(l)?"Torneira com vazamento":"Torneira";
  return "";
}
function detectItems(raw:string,problem:string){
  const lines=statements(raw),typeHint=fold(raw);
  const items:any[]=[];
  const push=(key:string,label:string,line:string,env:string,confidence="HIGH")=>{
    const subject=itemSummary(key,line)||label;
    const sig=fold(key+"|"+env+"|"+subject).replace(/\s+/g," ").slice(0,180);
    if(items.some(x=>x.signature===sig))return;
    items.push({id:"ITEM-"+String(items.length+1).padStart(2,"0"),key,subject,environment:env||"",source:clean(line,420),status:"IDENTIFICADO",confidence,missing:[],signature:sig});
  };
  const isInspection=/vistoria de saida|revistoria|rescis[aã]o|apontamentos? de vistoria/.test(typeHint);
  for(const line of lines){
    if(isInspection){
      const m=line.match(/^([^:–—-]{2,80})\s*[-–—:]\s*(.{3,500})$/);
      if(m){
        const env=clean(m[1],80),desc=clean(m[2],260);
        const sig=fold("vistoria|"+env+"|"+desc).replace(/\s+/g," ").slice(0,180);
        if(!items.some(x=>x.signature===sig))items.push({id:"ITEM-"+String(items.length+1).padStart(2,"0"),key:"vistoria",subject:desc,environment:env,status:"IDENTIFICADO",confidence:"HIGH",missing:[],source:line,signature:sig});
        continue;
      }
    }
    const matched=ITEM_RULES.filter((x:any)=>x[1].test(line));const specific=matched.some((x:any)=>x[0]!=="infiltracao");for(const [key,re,label] of matched){if(key==="infiltracao"&&specific&&!/infiltra|umidade/i.test(line))continue;push(key,label,line,envOf(line))}
  }
  if(!items.length&&problem)push("geral",clean(problem,120),problem,envOf(problem),"MEDIUM");
  return items.slice(0,120).map((x,i)=>({...x,id:"ITEM-"+String(i+1).padStart(2,"0")}));
}
function detectUnits(raw:string){
  const out:any[]=[];
  for(const line of statements(raw)){
    const f=fold(line);
    const re=/\b(?:apto|apartamento|unidade|sala|loja)\s*(?:n[ºo.]?\s*)?([a-z0-9-]{1,10})/gi;
    let m;while((m=re.exec(line))){
      const unit=String(m[1]).toUpperCase();
      let role="unidade envolvida";
      if(/afetad|onde aparece|recebe.*infiltra|inferior|embaixo|abaixo/.test(f))role="unidade afetada";
      else if(/poss[ií]vel origem|origem|superior|em cima|acima/.test(f))role="possível unidade de origem";
      const hit=out.find(x=>x.unit===unit);
      if(hit){if(hit.role==="unidade envolvida"&&role!=="unidade envolvida")hit.role=role}
      else out.push({id:"UNIT-"+String(out.length+1).padStart(2,"0"),unit,role,source:clean(line,300)});
    }
  }
  return out.slice(0,30);
}
function addressContext(raw:string){
  const lines=String(raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const chosen=lines.filter(x=>/ENDERE[CÇ]O\s*:|\b(?:Rua|R\.|Avenida|Av\.|Alameda|Travessa|Estrada|Rodovia)\b/i.test(x));
  return chosen.join(" | ")||String(raw||"");
}
function addressComplements(raw:string){
  const src=addressContext(raw),out:string[]=[];
  const re=/\b(apartamento|ap(?:to)?\.?|bloco|torre|sobrado|casa|fundos|unidade|sala|loja|conjunto)\s*(?:n[ºo.]?\s*)?([A-Za-z0-9À-ÿ-]{0,24})/gi;
  let m;while((m=re.exec(src))){
    const kind=clean(m[1],30),val=clean(m[2],30);
    let phrase=kind+(val?" "+val:"");
    phrase=phrase.replace(/\s+/g," ").trim();
    if(phrase&&!out.some(x=>fold(x)===fold(phrase)))out.push(phrase);
  }
  return out.slice(0,8);
}
function trimAddressCandidate(v:string){
  let s=clean(v,420);
  s=s.replace(/\s+(?=(?:Estou|Segue|Encaminh|Contato|Telefone|Problema|Disponibilidade|Respons[aá]vel|Observa[cç][aã]o)\b)[\s\S]*$/i,"").trim();
  const uf=s.match(/^([\s\S]*?\b[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'-]*\/[A-Z]{2})(?:[.,;]|\s+(?=[A-ZÀ-Ý][a-zà-ÿ]+\s))?[\s\S]*$/);
  if(uf&&uf[1]&&/\d/.test(uf[1]))s=uf[1].trim();
  return s.replace(/[.;]+$/,"").trim();
}
function fullAddress(raw:string,base:string){
  const lines=String(raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const explicit=lines.find(x=>/ENDERE[CÇ]O\s*:/i.test(x));
  if(explicit){
    const v=trimAddressCandidate(explicit.replace(/^.*?ENDERE[CÇ]O\s*:\s*/i,""));
    if(/Rua|R\.|Avenida|Av\.|Alameda|Travessa|Estrada|Rodovia/i.test(v))return v;
  }
  let b=trimAddressCandidate(base||"");
  if(!b){
    const line=lines.find(x=>/\b(?:Rua|R\.|Avenida|Av\.|Alameda|Travessa|Estrada|Rodovia)\b/i.test(x));
    if(line)b=trimAddressCandidate(line.replace(/^.*?(?=(?:Rua|R\.|Avenida|Av\.|Alameda|Travessa|Estrada|Rodovia)\b)/i,""));
  }
  const comps=addressComplements(raw);
  for(const cp of comps)if(b&&!fold(b).includes(fold(cp)))b+=" – "+cp;
  return b;
}
function addressComplementMissing(raw:string,address:string){
  const comps=addressComplements(raw),a=fold(address);
  return comps.some(cp=>!a.includes(fold(cp)));
}
function clientFromHistory(raw:string){
  for(const line of statements(raw)){
    let m=line.match(/^(?:cliente(?:\s*\/\s*origem)?|imobili[aá]ria|origem)\s*[:\-]\s*([^,;|]{2,100})/i);
    if(m)return clean(m[1],100);
    m=line.match(/\b(?:pedido|solicita[cç][aã]o|chamado)\s+(?:da|do)\s+([A-Z0-9][A-Za-z0-9À-ÿ .&_-]{1,60})/i);
    if(m)return clean(m[1],100);
  }
  return "";
}
function availabilityFromHistory(raw:string){
  for(const line of statements(raw)){
    const f=fold(line);
    if(/dispon[ií]vel|disponibilidade|hor[aá]rio|depois das?\s*\d|antes das?\s*\d|\bmanha\b|\bmanh[aã]\b|\btarde\b|hor[aá]rio comercial|segunda|terça|terca|quarta|quinta|sexta/.test(f)){
      return clean(line.replace(/^(?:disponibilidade|hor[aá]rio(?:s)?(?: dispon[ií]veis?)?)\s*[:\-]\s*/i,""),180);
    }
  }
  return "";
}
function roleName(v:string){const f=fold(v);return /inquil|locat/.test(f)?"inquilino":/propriet/.test(f)?"proprietário":/sind/.test(f)?"síndico":/zelad/.test(f)?"zelador":/porteir/.test(f)?"porteiro":"contato"}
function enrichInvolved(raw:string,base:any[],units:any[]){
  const people:any[]=[];
  const add=(p:any)=>{
    const name=clean(p?.name,100),phone=phoneFmt(p?.phone||""),role=clean(p?.role,80)||"contato";
    if((!name&&!phone)||badPersonName(name)||operationalLine(p?.context||name))return;
    const pd=phoneDigits(phone),hit=people.find((x:any)=>(pd&&phoneDigits(x.phone)===pd)||(name&&fold(x.name)===fold(name)));
    if(hit){if(!hit.phone&&phone)hit.phone=phone;if((!hit.role||hit.role==="papel a confirmar")&&role)hit.role=role;return}
    people.push({id:"P-"+String(people.length+1).padStart(2,"0"),type:"pessoa",name,phone,role,unit:clean(p?.unit,20),context:clean(p?.context,220)});
  };
  for(const p of extractDirectPeople(raw))add(p);
  for(const p of (Array.isArray(base)?base:[]))add(p);
  const lines=statements(raw);
  for(const line of lines){
    let m=line.match(/^([A-ZÀ-Ý][A-Za-zÀ-ÿ' .-]{2,70})\s*[-–—]\s*(?:nova?\s+)?(inquilina|inquilino|propriet[aá]ria|propriet[aá]rio|moradora|morador|zeladora|zelador|s[ií]ndica|s[ií]ndico)/i);
    if(m)add({name:m[1],phone:"",role:roleName(m[2]),context:line});
    m=line.match(/([A-ZÀ-Ý][A-Za-zÀ-ÿ' .-]{2,60})\s+(?:do|da)\s+(?:apto|apartamento|unidade)\s*([A-Za-z0-9-]{1,10})/i);
    if(m)add({name:m[1],phone:"",role:"morador",unit:String(m[2]).toUpperCase(),context:line});
  }
  for(const p of people){
    const first=fold(p.name).split(" ")[0];if(!first||p.unit)continue;
    const line=lines.find(l=>fold(l).includes(first)&&/\b(?:apto|apartamento|unidade|sala|loja)\b/i.test(l));
    if(line){const m=line.match(/\b(?:apto|apartamento|unidade|sala|loja)\s*(?:n[ºo.]?\s*)?([A-Za-z0-9-]{1,10})/i);if(m)p.unit=String(m[1]).toUpperCase()}
  }
  const unitActors=units.map((u:any)=>({id:u.id,type:"unidade",name:"",phone:"",role:u.role,unit:u.unit,context:u.source}));
  return [...people,...unitActors].slice(0,50);
}
function detectConflicts(raw:string,caseType:string){
  const conflicts:any[]=[];
  const addressLines=statements(raw).filter(x=>/^end(?:ere[cç]o)?\s*[:\-]/i.test(x));
  const addresses=[...new Set(addressLines.map(x=>fold(x.replace(/^end(?:ere[cç]o)?\s*[:\-]\s*/i,""))).filter(Boolean))];
  if(addresses.length>1)conflicts.push({type:"ADDRESS",message:"Encontrei mais de um endereço informado. Confirme qual é o correto."});
  if(caseType!=="INFILTRACAO_ENTRE_UNIDADES"){
    const explicit=[...String(raw).matchAll(/\b(?:apto|apartamento)\s*(?:n[ºo.]?\s*)?([A-Za-z0-9-]{1,10})/gi)].map(m=>String(m[1]).toUpperCase());
    const uniq=[...new Set(explicit)];
    if(uniq.length>1)conflicts.push({type:"UNIT",message:"Encontrei mais de um número de apartamento ("+uniq.join(" e ")+"). Confirme qual pertence a este chamado."});
  }
  return conflicts.slice(0,8);
}
function engineTitle(type:string,items:any[],fallback:string){
  if(type==="VISTORIA_SAIDA")return"Vistoria de saída — múltiplos apontamentos";
  if(type==="VISTORIA_TECNICA")return items.length>1?"Vistoria técnica — múltiplos itens":"Vistoria técnica";
  if(type==="INFILTRACAO_ENTRE_UNIDADES")return"Vistoria de possível infiltração entre unidades";
  if(type==="INFILTRACAO_VAZAMENTO")return"Vistoria de vazamento/infiltração";
  if(items.length>1)return"Atendimento com "+items.length+" itens";
  return items[0]?.subject||T(fallback,90)||"Atendimento técnico";
}
function engineSummary(type:string,items:any[],fallback:string){
  if(type==="VISTORIA_SAIDA")return"Vistoria de saída com "+items.length+" apontamento"+(items.length===1?"":"s")+".";
  if(type==="VISTORIA_TECNICA")return"Vistoria técnica"+(items.length>1?" com "+items.length+" itens identificados":"")+".";
  if(type==="MULTIPLOS_REPAROS")return"Múltiplos reparos: "+items.slice(0,8).map(x=>x.subject).join("; ")+(items.length>8?"; +"+(items.length-8)+" item(ns)":"")+".";
  if(type==="INFILTRACAO_ENTRE_UNIDADES")return"Verificação de possível vazamento/infiltração envolvendo mais de uma unidade.";
  if(type==="ITEM_UNICO"&&items[0]?.subject)return items[0].subject+".";
  return T(fallback,600)||items[0]?.subject||"Atendimento técnico.";
}

function stripPendingPrefix(v:any){
  return clean(v,900).replace(/^[\s⚠✅☑️▪•*#\-–—]+/u,"").replace(/^CONFIRMAR:\s*/i,"").trim();
}
function parsePendingAnswers(raw:string){
  const out:any={};
  const set=(key:string,line:string,re:RegExp)=>{const m=line.match(re);if(m&&T(m[1],700))out[key]=clean(m[1],700)};
  for(const rawLine of String(raw||"").split(/\r?\n/)){
    let line=stripPendingPrefix(rawLine);
    if(!line||/^INFORMAÇÕES?\s+PENDENTES?$/i.test(line))continue;
    set("client",line,/^(?:cliente(?:\s*\/\s*(?:imobili[aá]ria|origem))?|imobili[aá]ria|origem)\s*(?:-|–|—|:)\s*(.+)$/i);
    set("address",line,/^endere[cç]o(?:\s+completo)?\s*(?:-|–|—|:)\s*(.+)$/i);
    set("payment",line,/^(?:respons[aá]vel\s+(?:pelo\s+)?pagamento(?:\s*\/\s*autoriza[cç][aã]o)?|pagamento|autoriza[cç][aã]o)\s*(?:-|–|—|:)\s*(.+)$/i);
    set("availability",line,/^(?:disponibilidade(?:\s+para\s+atendimento)?|hor[aá]rios?(?:\s+dispon[ií]veis?)?)\s*(?:-|–|—|:)\s*(.+)$/i);
    set("evidence_justification",line,/^(?:fotos?(?:,\s*v[ií]deos?)?(?:\s+ou\s+justificativa\s+de\s+aus[eê]ncia)?|v[ií]deos?|evid[eê]ncias?|justificativa\s+de\s+aus[eê]ncia)\s*(?:-|–|—|:)\s*(.+)$/i);
    set("access",line,/^(?:orienta[cç][aã]o\s+de\s+acesso|acesso)\s*(?:-|–|—|:)\s*(.+)$/i);
    set("contact",line,/^(?:nome\s+do\s+contato|contato)\s*(?:-|–|—|:)\s*(.+)$/i);
    set("phone",line,/^(?:telefone\s+do\s+contato|telefone)\s*(?:-|–|—|:)\s*(.+)$/i);
  }
  return out;
}
function evidenceFromHistory(raw:string){
  const lines=String(raw||"").split(/\r?\n/).map(x=>stripPendingPrefix(x)).filter(Boolean);
  for(const line of lines){
    const f=fold(line);
    if(/nao (?:recebemos|recebemos|teremos|temos|foram enviadas?|foi enviada?) fotos|sem fotos|sem imagens|(?:evidencias?|fotos?) (?:serao|será|serao) (?:levantadas?|coletadas?) na visita|fotos.*(?:nao disponiveis|ausentes)/.test(f)) return clean(line,500);
  }
  return "";
}
function findAddressF00(raw:string){
  const answers=parsePendingAnswers(raw);
  if(T(answers.address,500))return clean(answers.address,420);
  const lines=String(raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const logradouro=/\b(?:Rua|R\.|Avenida|Av\.|Alameda|Travessa|Estrada|Rodovia|Rod\.|Praça|Pça\.|Largo|Condom[ií]nio|Residencial|BR[-\s]?\d{1,4}|PR[-\s]?\d{1,4})\b/i;
  for(const line0 of lines){
    let line=line0.replace(/^[\s⚠✅☑️▪•*#]+/u,"").trim();
    line=line.replace(/^.*?ENDERE[CÇ]O\s*:\s*/i,"");
    const m=logradouro.exec(line);
    if(!m)continue;
    let v=trimAddressCandidate(line.slice(m.index));
    if(/\d/.test(v))return v;
  }
  return "";
}
function mainUnitFromAddress(address:string){
  const m=String(address||"").match(/\b(?:apartamento|ap(?:to)?\.?|unidade|sala|loja|conjunto)\s*(?:n[ºo.]?\s*)?([A-Za-z0-9-]{1,12})/i);
  return m&&/\d/.test(m[1])?String(m[1]).toUpperCase():"";
}
function badPersonNameF00(v:any){
  const s=clean(v,120),f=fold(s);
  if(!s||s.split(/\s+/).length>6)return true;
  return /^(apartamento|apto|unidade|endereco|cliente|origem|solicitacao|objetivo|problema|informacoes?|pendentes?|novo chamado)$/i.test(f)
    || /endere[cç]o|solicita[cç][aã]o|objetivo da visita|informa[cç][oõ]es pendentes|apartamento de (?:cima|baixo)|unidade (?:superior|inferior)|vistoria tecnica|origem de vazamento/.test(f);
}
function contextOfLine(line:string){
  const f=fold(line);
  if(/apartamento de cima|unidade superior|apartamento superior|\bsuperior\b/.test(f))return"SUPERIOR";
  if(/apartamento de baixo|unidade inferior|apartamento inferior|\binferior\b/.test(f))return"INFERIOR";
  return"";
}
function extractPeopleF00(raw:string,mainUnit:string){
  const people:any[]=[];
  const add=(name:string,phone:string,role:string,unit:string,context:string)=>{
    name=clean(name,100).replace(/^[•*\-–—: ]+|[•*\-–—: ]+$/g,"");
    phone=phoneFmt(phone);
    if((name&&badPersonNameF00(name))||(!name&&!phone))return;
    const pd=phoneDigits(phone);
    const hit=people.find((p:any)=>(pd&&phoneDigits(p.phone)===pd)||(name&&fold(p.name)===fold(name)&&(!phone||!p.phone)));
    if(hit){if(!hit.phone&&phone)hit.phone=phone;if(!hit.unit&&unit)hit.unit=unit;if(hit.role==="papel a confirmar"&&role)hit.role=role;return}
    people.push({id:"P-"+String(people.length+1).padStart(2,"0"),type:"pessoa",name,phone,role:role||"papel a confirmar",unit:unit||"",context:clean(context,260)});
  };
  for(const rawLine of String(raw||"").split(/\r?\n/)){
    const line=rawLine.replace(/^\s*[•▪◦*]\s*/,"").trim();
    if(!line)continue;
    const ctx=contextOfLine(line);
    const explicitUnit=(()=>{const m=line.match(/\b(?:apartamento|ap(?:to)?\.?|unidade|sala|loja)\s*(?:n[ºo.]?\s*)?([A-Za-z0-9-]{1,12})/i);return m&&/\d/.test(m[1])?String(m[1]).toUpperCase():""})();
    const unit=explicitUnit||(ctx==="SUPERIOR"&&mainUnit?mainUnit:"");
    const re=/\b((?:Sr\.?|Sra\.?)?\s*[A-ZÀ-Ý][A-Za-zÀ-ÿ'’.-]*(?:\s+(?:(?:da|de|do|dos|das|e)|[A-ZÀ-Ý][A-Za-zÀ-ÿ'’.-]*)){0,6})\s*(?:[-–—,:]?\s*)?(?:\+?55[\s.-]*)?(\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]*[-.]?\d{4})\b/g;
    let m;while((m=re.exec(line)))add(m[1],m[2],"papel a confirmar",unit,line);
    const phoneRe=/(?:\+?55[\s.-]*)?(\(?\d{2}\)?[\s.-]*9?\d{4}[\s.-]*[-.]?\d{4})\b/g;
    let pm;while((pm=phoneRe.exec(line)))add("",pm[1],"contato a identificar",unit,line);
    const roleMatch=line.match(/\b(inquilina|inquilino|moradora|morador|propriet[aá]ria|propriet[aá]rio|s[ií]ndica|s[ií]ndico|zeladora|zelador)\s*[:\-]\s*([A-ZÀ-Ý][A-Za-zÀ-ÿ'’ .-]{1,80})/i);
    if(roleMatch){
      const role=roleName(roleMatch[1]);
      const name=clean(roleMatch[2].split(/\(?\d{2}\)?/)[0],100);
      add(name,"",role,unit,line);
    }
  }
  return people.slice(0,40).map((p:any,i:number)=>({...p,id:"P-"+String(i+1).padStart(2,"0")}));
}
function detectUnitsF00(raw:string,address:string){
  const out:any[]=[];
  const push=(unit:string,role:string,source:string,context:string)=>{
    unit=clean(unit,20).toUpperCase();
    if(unit&&!/\d/.test(unit))unit="";
    const sig=fold(unit+"|"+role+"|"+context);
    if(unit){
      const hit=out.find((x:any)=>x.unit===unit);
      if(hit){
        const rank=(r:string)=>/possível unidade de origem|unidade afetada/.test(r)?3:/unidade principal/.test(r)?2:1;
        if(rank(role)>rank(hit.role)){hit.role=role;hit.context=context;hit.source=clean(source,300);hit.signature=sig}
        return;
      }
    }else if(out.some((x:any)=>x.signature===sig))return;
    out.push({id:"UNIT-"+String(out.length+1).padStart(2,"0"),unit,role,source:clean(source,300),context,signature:sig});
  };
  const main=mainUnitFromAddress(address);
  if(main)push(main,"unidade principal",address,"IMOVEL_PRINCIPAL");
  for(const line of String(raw||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean)){
    const f=fold(line),ctx=contextOfLine(line);
    const re=/\b(?:apartamento|ap(?:to)?\.?|unidade|sala|loja)\s*(?:n[ºo.]?\s*)?([A-Za-z0-9-]{1,12})/gi;
    let m;while((m=re.exec(line))){if(/\d/.test(m[1]))push(m[1],ctx==="INFERIOR"?"unidade afetada":ctx==="SUPERIOR"?"possível unidade de origem":"unidade envolvida",line,ctx||"EXPLICITA")}
    if(ctx==="SUPERIOR")push(main,"possível unidade de origem",line,"SUPERIOR");
    if(ctx==="INFERIOR")push("","unidade afetada",line,"INFERIOR");
  }
  return out.slice(0,30).map((u:any,i:number)=>({...u,id:"UNIT-"+String(i+1).padStart(2,"0")}));
}

function detectCaseTypeF00(raw:string,items:any[]){
  const f=fold(raw),keys=new Set((items||[]).map((x:any)=>x.key));
  if(/vistoria de saida|revistoria|rescis[aã]o|apontamentos? de vistoria/.test(f))return"VISTORIA_SAIDA";
  if(/apartamento de cima|apartamento de baixo|unidade superior|unidade inferior|\bembaixo\b|\babaixo\b|\bem cima\b|\bacima\b/.test(f)&&/infiltra|vazamento|umidade/.test(f))return"INFILTRACAO_ENTRE_UNIDADES";
  const explicitUnits=[...String(raw).matchAll(/\b(?:apartamento|ap(?:to)?\.?|unidade)\s*(?:n[ºo.]?\s*)?([A-Za-z0-9-]{1,12})/gi)].map(m=>m[1]).filter(x=>/\d/.test(x));
  if(explicitUnits.length>=2&&/infiltra|vazamento|umidade/.test(f))return"INFILTRACAO_ENTRE_UNIDADES";
  if(/vistoria tecnica|visita tecnica|realizar vistoria|levantamento tecnico|levantar mao de obra|levantar materiais/.test(f))return"VISTORIA_TECNICA";
  if(/aquecedor|ar-condicionado|ar condicionado|pressurizador|bomba|central/.test(f))return"EQUIPAMENTO";
  if(items.length>1)return"MULTIPLOS_REPAROS";
  if(keys.has("infiltracao"))return"INFILTRACAO_VAZAMENTO";
  return"ITEM_UNICO";
}
function mergeRawHistory(existingRaw:string,newRaw:string){
  const base=String(existingRaw||""),add=T(newRaw,120000);
  if(!add)return base;
  const canon=(v:string)=>fold(v).replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
  const cadd=canon(add),cbase=canon(base);
  if(cadd&&cbase.includes(cadd))return base;
  return [base,add].filter(Boolean).join("\n\n--- COMPLEMENTO ---\n");
}
function chooseF00(key:string,manual:any,answers:any,extracted:any,confirmed:any,existing:any){
  const mv=T(manual?.[key],700);if(mv)return{value:mv,source:"correcao_manual",confidence:"CONFIRMED"};
  const av=T(answers?.[key],700);if(av)return{value:av,source:"user_confirmation",confidence:"CONFIRMED"};
  if(confirmed&&T(confirmed.value,700)&&confirmed.confidence==="CONFIRMED")return{value:T(confirmed.value,700),source:confirmed.source||"confirmado",confidence:"CONFIRMED"};
  const ev=T(extracted,700);if(ev)return{value:ev,source:"historico",confidence:"HIGH"};
  if(confirmed&&T(confirmed.value,700))return{value:T(confirmed.value,700),source:confirmed.source||"confirmado",confidence:confirmed.confidence||"HIGH"};
  const xv=T(existing,700);if(xv)return{value:xv,source:"estado_anterior",confidence:"MEDIUM"};
  return{value:"",source:"",confidence:"LOW"};
}
async function sem(raw:string,o:any={}){
  let r:any={};
  try{
    const x=await fetch(SEM,{method:"POST",headers:{"content-type":"application/json","origin":SB,"x-release-id":"CR-F01-CLEAN-1"},body:JSON.stringify({api:"semantic-organize",body:{raw_message:raw}})}),
          d=await x.json();
    if(x.ok)r=d.result||{};
  }catch{}
  const c=r.property_contact||{},manual=o.manual||{},existing=o.existing||{},confirmed=o.confirmed||{},answers=parsePendingAnswers(raw);
  const address=findAddressF00(raw)||fullAddress(raw,r.address||"");
  const mainUnit=mainUnitFromAddress(address);
  const baseProblem=T(manual.problem||r.problem_summary||existing.problem,600);
  const items=detectItems(raw,baseProblem);
  const caseType=detectCaseTypeF00(raw,items);
  const units=detectUnitsF00(raw,address);
  const people=extractPeopleF00(raw,mainUnit);
  const involved=[...people,...units.map((u:any)=>({id:u.id,type:"unidade",name:"",phone:"",role:u.role,unit:u.unit,context:u.context||u.source}))].slice(0,60);
  const withPhone=people.filter((x:any)=>x.phone);
  const primary=withPhone[0]||people[0]||{};
  const conflicts=detectConflicts(raw,caseType).filter((x:any)=>x.type!=="PHONE");
  const pc=paymentConflict(raw);if(pc)conflicts.push({type:"PAYMENT",message:pc});
  const extractedPayment=paymentFromHistory(raw)||r.payment||r.authorization||"";
  const evidenceAnswer=T(answers.evidence_justification,700)||evidenceFromHistory(raw);
  const rv:any={
    client:chooseF00("client",manual,answers,clientFromHistory(raw)||r.origin_company,confirmed.client,existing.client),
    address:chooseF00("address",manual,answers,address,confirmed.address,existing.address),
    contact:chooseF00("contact",manual,answers,primary.name||c.name,confirmed.contact_name,existing.contact_name),
    phone:chooseF00("phone",manual,answers,primary.phone||r.phone||c.phone,confirmed.contact_phone,existing.contact_phone),
    payment:chooseF00("payment",manual,answers,extractedPayment,confirmed.payment,existing.payment),
    availability:chooseF00("availability",manual,answers,availabilityFromHistory(raw)||r.availability,confirmed.availability,existing.availability),
    access:chooseF00("access",manual,answers,r.access,confirmed.access,existing.access_note),
    evidence:chooseF00("evidence_justification",manual,answers,evidenceAnswer,confirmed.evidence,existing.evidence_justification)
  };
  const confirmed_fields:any={};
  for(const [k,v] of Object.entries(rv))if((v as any).value)confirmed_fields[k==="contact"?"contact_name":k==="phone"?"contact_phone":k==="evidence"?"evidence":k]={value:(v as any).value,source:(v as any).source,confidence:(v as any).confidence};
  const directPhones=[...new Set(withPhone.map((x:any)=>phoneFmt(x.phone)).filter(Boolean))];
  const p:any={
    raw,client:rv.client.value,address:rv.address.value,contact:rv.contact.value,phone:rv.phone.value,
    problem:engineSummary(caseType,items,baseProblem),payment:rv.payment.value,availability:rv.availability.value,access:rv.access.value,evidence:rv.evidence.value,
    involved,units,items,conflicts,case_type:caseType,case_summary:engineSummary(caseType,items,baseProblem),
    questions:Array.isArray(r.questions)?r.questions:[],
    confidence:{...(r.confidence||{}),engine:items.length?"HIGH":"MEDIUM",contact_phone:rv.phone.confidence,payment:rv.payment.confidence,address:rv.address.confidence},
    confirmed_fields,
    history_resolution:{requested:reconciliationRequested(raw),reconciled:true,phones_found:directPhones,people_found:people.map((x:any)=>({name:x.name,phone:x.phone,role:x.role,unit:x.unit,context:x.context}))},
    evidence_analysis:rv.evidence.value?"JUSTIFIED_OR_DECLARED":"NOT_AVAILABLE",
    engine_version:"F00_INTELLIGENCE_V8_CANDIDATE"
  };
  p.title=engineTitle(caseType,items,baseProblem);
  return p;
}

function gate(c:any,n=0){
  const s=c.structured||{},m:string[]=[],advisory:string[]=[];
  const items=Array.isArray(s.items)?s.items:[],involved=Array.isArray(s.involved)?s.involved:[],units=Array.isArray(s.units)?s.units:[],conflicts=Array.isArray(s.conflicts)?s.conflicts:[];
  const raw=fold(c.raw_text||s.raw||""),type=s.case_type||"";
  const people=involved.filter((x:any)=>x.type==="pessoa"&&!badPersonName(x.name));
  if(!c.case_number)m.push("número do orçamento");
  if(!c.client)m.push("cliente / imobiliária");
  if(!c.address)m.push("endereço completo");
  else if(addressComplementMissing(c.raw_text||s.raw||"",c.address))m.push("complemento do endereço informado no chamado");
  if(!items.length&&!c.problem)m.push("descrição do problema ou itens do atendimento");
  if(!c.contact_name&&!people.some((x:any)=>x.name))m.push("nome do contato no imóvel");
  if(!c.contact_phone&&!people.some((x:any)=>x.phone))m.push("telefone do contato");
  if(!c.payment&&!paymentFromHistory(c.raw_text||s.raw||""))m.push("responsável pelo pagamento / autorização");
  if(!c.availability&&!/dispon[ií]vel|hor[aá]rio|manha|manh[aã]|tarde|comercial|agendar/.test(raw))m.push("disponibilidade para atendimento");
  if(!c.access&&!/portaria|chave|acesso|zelador|zeladora|síndico|sindico/.test(raw))advisory.push("orientação de acesso ao imóvel");
  if(type==="INFILTRACAO_ENTRE_UNIDADES"){
    if(units.length<1)m.push("número da unidade afetada");
    if(units.length<2)advisory.push("unidade de possível origem, se já conhecida");
    for(const u of units){const linked=people.some((x:any)=>x.unit===u.unit&&x.phone);if(units.length>=2&&!linked)advisory.push("telefone do contato da unidade "+u.unit)}
  }
  for(const cf of conflicts)m.push("CONFIRMAR: "+cf.message);
  if(!n&&!c.evidence_justification){
    if(/vistoria|visita tecnica|registrar fotos|levantar.*materiais/.test(raw))advisory.push("evidências serão levantadas na visita");
    else m.push("fotos, vídeos ou justificativa de ausência");
  }
  return{ready:m.length===0,missing:[...new Set(m)].slice(0,20),advisory:[...new Set(advisory)].slice(0,20)};
}
function status(c:any,n=0){if(c.released_f01)return"LIBERADO_F01";if(gate(c,n).ready)return"PRONTO_F01";if(c.awaiting_response)return"AGUARDANDO_RESPOSTA";return c.raw_text?"EM_COLETA":"INCOMPLETO"}
function questionsFor(c:any,n=0){
  return gate(c,n).missing.map((x:string)=>{
    if(x.startsWith("CONFIRMAR:"))return x.replace(/^CONFIRMAR:\s*/,"");
    if(x==="endereço completo")return"Confirmar o endereço completo do imóvel.";
    if(x==="complemento do endereço informado no chamado")return"Confirmar e preservar o complemento do endereço (apartamento, bloco, torre, sobrado, casa, fundos, unidade ou equivalente).";
    if(x==="telefone do contato")return"Confirmar o telefone do contato no imóvel.";
    if(x==="nome do contato no imóvel")return"Confirmar o nome da pessoa de contato no imóvel.";
    if(x==="responsável pelo pagamento / autorização")return"Confirmar quem autorizou o atendimento ou será responsável pelo pagamento.";
    if(x==="disponibilidade para atendimento")return"Confirmar dias e horários disponíveis para visita ou atendimento.";
    if(x==="orientação de acesso ao imóvel")return"Confirmar orientação de acesso ao imóvel: portaria, chave ou responsável pela liberação.";
    if(x==="número da unidade afetada")return"Confirmar o número do apartamento ou unidade afetada.";
    if(x==="unidade de possível origem, se já conhecida")return"Confirmar a unidade de possível origem, se já conhecida.";
    if(x.startsWith("telefone do contato da unidade "))return"Confirmar o telefone do contato da "+x.replace("telefone do contato da ","")+".";
    if(x==="descrição do problema ou itens do atendimento")return"Confirmar quais problemas ou reparos precisam ser verificados.";
    if(x==="fotos, vídeos ou justificativa de ausência")return"Anexar fotos/vídeos ou registrar que a evidência será levantada na visita.";
    return"Confirmar: "+x+".";
  });
}
function msg(c:any,n=0){
  const q=questionsFor(c,n).slice(0,10);
  if(!q.length)return"Coleta completa. Nenhuma informação pendente.";
  return"PENDÊNCIAS INTERNAS PARA COMPLETAR O F00:\\n• "+q.join("\\n• ");
}

function gc(c:any){return["Número do orçamento: "+c.case_number,"Título sugerido: "+c.title,"Cliente: "+(c.client||"—"),"Endereço: "+(c.address||"—"),"Observação inicial: "+(c.client||"Cliente")+" — atendimento referente ao imóvel situado em "+(c.address||"endereço a confirmar")+"."].join("\n")}
async function evt(id:string,t:string,text:string,a:any){
  const last=await db.from("cr_f00_events").select("event_type,event_text,created_at").eq("case_id",id).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(last.data&&last.data.event_type===t&&last.data.event_text===text&&Date.now()-new Date(last.data.created_at).getTime()<5000)return;
  await db.from("cr_f00_events").insert({case_id:id,event_type:t,event_text:text,actor:a.display_name})
}
function recognizedChanges(before:any,after:any){
  const defs:any=[["client","cliente"],["address","endereço"],["contact_name","contato"],["contact_phone","telefone"],["problem","problema"],["payment","pagamento/autorização"],["availability","disponibilidade"],["access_note","acesso"]];
  return defs.filter(([k])=>T(after?.[k],800)&&fold(after?.[k])!==fold(before?.[k])).map(([,label])=>label);
}
async function files(id:string,signed=true){const q=await db.from("cr_f00_files").select("*").eq("case_id",id).is("removed_at",null).order("created_at");const out=[];for(const f of q.data||[]){let url="";if(signed){const z=await db.storage.from(BUCKET).createSignedUrl(f.storage_path,900);url=z.data?.signedUrl||""}out.push({...f,signed_url:url})}return out}
async function one(id:string){return(await db.from("cr_f00_cases").select("*").eq("id",id).maybeSingle()).data}
async function alloc(){throw Error("Geração automática desativada no F00 V4")}
function manualNumber(v:any){const no=T(v,20).replace(/\s/g,"");const m=no.match(/^(\d{1,5})-(\d{2})$/);if(!m)return null;return{no,y:2000+Number(m[2]),n:Number(m[1])}}
async function f01token(){return await sha(K+"|CR-F01-CLEAN-1|browser-api")}


async function ensureFlowHandoff(c:any,fs:any[],slot:number){
  const idem="F00_F01_V6:"+c.case_number;
  const existing=await db.from("cr_flow_handoffs").select("token,case_number,from_flow,to_flow,status,journey_status,revision,state").eq("idempotency_key",idem).maybeSingle();
  if(existing.error)throw Error(existing.error.message);
  if(existing.data){
    const ex=existing.data,phase=String(ex.to_flow||"").toUpperCase();
    if(phase==="F01")return{token:ex.token,idempotent:true,to_flow:"F01",revision:Number(ex.revision||1)};
    if(phase==="F00"){
      const now=new Date().toISOString(),st=c.structured||{},prev=ex.state||{};
      const state={...prev,
        schema:"CR-FLOW-2",case_number:c.case_number,f00_case_id:c.id,handoff_contract:"F00_F01_HANDOFF_V6",source:"F00",
        current_phase:"F01",current_owner:"ATENDIMENTO",queue_status:"EM_QUALIFICACAO",handoff_status:"RECEIVED",
        client:c.client||"",address:c.address||"",contact:{name:c.contact_name||"",phone:c.contact_phone||""},
        payment:c.payment||"",availability:c.availability||"",access:c.access_note||"",
        case_type:st.case_type||"",case_summary:st.case_summary||c.problem||"",
        items:Array.isArray(st.items)?st.items:[],involved:Array.isArray(st.involved)?st.involved:[],units:Array.isArray(st.units)?st.units:[],
        evidence:fs.map((x:any)=>({id:x.id,filename:x.filename,content_type:x.content_type,size_bytes:x.size_bytes,storage_path:x.storage_path||""})),
        confirmed_fields:st.confirmed_fields||{},conflicts:st.conflicts||[],confidence:st.confidence||{},
        history_reference:{f00_case_id:c.id,case_number:c.case_number},
        f01:{...(prev.f01||{}),status:"PENDING_ROUTE",decision:"",returned_from_f00_at:now},
        completed_flows:[...new Set([...(Array.isArray(prev.completed_flows)?prev.completed_flows:[]),"F00"])],
        legacy:{...(prev.legacy||{}),f01_slot_index:slot},transferred_at:now
      };
      const rev=Number(ex.revision||1)+1;
      const up=await db.from("cr_flow_handoffs").update({
        from_flow:"F00",to_flow:"F01",state,status:"READY",journey_status:"EM_ANDAMENTO",revision:rev,updated_by:"Gabrielly",received_at:now,updated_at:now
      }).eq("idempotency_key",idem).select("token,to_flow,revision").single();
      if(up.error)throw Error(up.error.message);
      await db.from("cr_flow_events").insert({token:ex.token,case_number:c.case_number,flow_code:"F00",event_type:"F00_RE_RELEASED_F01",actor:"Gabrielly",payload:{to_flow:"F01",handoff_contract:"F00_F01_HANDOFF_V6",revision:rev}});
      return{token:up.data.token,idempotent:false,to_flow:"F01",revision:rev,reused:true};
    }
    throw Error("A jornada "+c.case_number+" está sob responsabilidade de "+phase+" e não pode ser liberada pelo F00.");
  }
  const st=c.structured||{},token=await sha("CRFLOW|"+c.id+"|"+c.case_number+"|"+K);
  const state={
    schema:"CR-FLOW-2",
    case_number:c.case_number,
    f00_case_id:c.id,
    handoff_contract:"F00_F01_HANDOFF_V6",
    source:"F00",
    current_phase:"F01",
    current_owner:"ATENDIMENTO",
    queue_status:"EM_QUALIFICACAO",
    handoff_status:"RECEIVED",
    client:c.client||"",
    address:c.address||"",
    contact:{name:c.contact_name||"",phone:c.contact_phone||""},
    payment:c.payment||"",
    availability:c.availability||"",
    access:c.access_note||"",
    case_type:st.case_type||"",
    case_summary:st.case_summary||c.problem||"",
    items:Array.isArray(st.items)?st.items:[],
    involved:Array.isArray(st.involved)?st.involved:[],
    units:Array.isArray(st.units)?st.units:[],
    evidence:fs.map((x:any)=>({id:x.id,filename:x.filename,content_type:x.content_type,size_bytes:x.size_bytes,storage_path:x.storage_path||""})),
    confirmed_fields:st.confirmed_fields||{},
    conflicts:st.conflicts||[],
    confidence:st.confidence||{},
    history_reference:{f00_case_id:c.id,case_number:c.case_number},
    f01:{status:"PENDING_ROUTE",decision:""},
    completed_flows:["F00"],
    legacy:{f01_slot_index:slot},
    transferred_at:new Date().toISOString()
  };
  const ins=await db.from("cr_flow_handoffs").insert({
    token,case_number:c.case_number,from_flow:"F00",to_flow:"F01",state,status:"READY",
    journey_status:"EM_ANDAMENTO",revision:1,updated_by:"Gabrielly",
    idempotency_key:idem,received_at:new Date().toISOString()
  }).select("token,to_flow").single();
  if(ins.error){
    if(ins.error.code==="23505"){
      const ex=await db.from("cr_flow_handoffs").select("token,to_flow").eq("idempotency_key",idem).maybeSingle();
      if(ex.data)return{token:ex.data.token,idempotent:true,to_flow:ex.data.to_flow};
    }
    throw Error(ins.error.message);
  }
  await db.from("cr_flow_events").insert({token,case_number:c.case_number,flow_code:"F00",event_type:"F00_RELEASED_F01",actor:"Gabrielly",payload:{to_flow:"F01",handoff_contract:"F00_F01_HANDOFF_V6"}});
  return{token:ins.data.token,idempotent:false,to_flow:"F01"};
}
async function handoff(c:any,fs:any[]){
  const h={"content-type":"application/json","x-cr-internal-token":await f01token()},
        r=await fetch(F01,{method:"POST",headers:h,body:JSON.stringify({api:"state",body:{},workspace_mode:"prod"})}),
        d=await r.json();
  if(!r.ok)throw Error(d.error||"F01");
  const ex=(d.slots||[]).find((x:any)=>String(x.snapshot?.attendanceId||x.snapshot?.cardId||"")===c.case_number);
  let slot:number,idempotent=false;
  if(ex){slot=Number(ex.slot_index);idempotent=true}
  else{
    const used=new Set((d.slots||[]).map((x:any)=>Number(x.slot_index)));slot=0;while(used.has(slot))slot++;
    const st=c.structured||{};
    const compact={
      engine_version:st.engine_version||"F00_INTELLIGENCE_V6",case_type:st.case_type||"",case_summary:st.case_summary||c.problem||"",
      items:st.items||[],involved:st.involved||[],units:st.units||[],conflicts:st.conflicts||[],confidence:st.confidence||{},
      confirmed_fields:st.confirmed_fields||{},missing:gate(c,fs.length).missing,
      evidence:fs.map((x:any)=>({id:x.id,filename:x.filename,content_type:x.content_type,size_bytes:x.size_bytes,storage_path:x.storage_path||""}))
    };
    const snap={
      attendanceId:c.case_number,cardId:c.case_number,
      data:{budget:c.case_number,callNumber:c.case_number,client:c.client,phone:c.contact_phone,address:c.address,problem:c.problem,payment:c.payment,availability:c.availability,access:c.access_note,notes:"Origem F00 "+c.id,raw:c.raw_text,attendant:"Gabrielly"},
      opening:{source:c.client,address:c.address,problem:c.problem,subject:st.case_summary||c.problem,involved:st.involved||[],items:st.items||[],caseType:st.case_type||""},
      communication:{externalName:c.contact_name,internalRecipient:"Gabrielly",welcomeMessage:msg(c,fs.length)},
      integration:{caseNumber:c.case_number,handoffStatus:"recebido_f00",handoffContract:"F00_F01_HANDOFF_V6",f00CaseId:c.id,f00Files:compact.evidence,f00Structured:compact},
      flow:{F00:{status:"CONCLUIDO"},F01:{status:"EM_TRIAGEM"}},
      nextAction:"F01 • Qualificar rota",finalized:false
    };
    const x=await fetch(F01,{method:"POST",headers:h,body:JSON.stringify({api:"save",mutation_id:"f00-"+c.case_number,body:{slot_index:slot,expected_revision:0,editor:"Gabrielly",snapshot:snap},workspace_mode:"prod"})}),jj=await x.json();
    if(!x.ok)throw Error(jj.error||"F01");
  }
  const flow=await ensureFlowHandoff(c,fs,slot);
  return{slot,idempotent,flow};
}

const PAGE="<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>CONSTRU-REI • F00</title><style>\nbody{margin:0;background:#061524;color:#fff;font:14px Arial}.w{max-width:1100px;margin:auto;padding:14px}.c{background:#0b2237;border:1px solid #294b65;border-radius:14px;padding:11px}.stats,.grid,.row{display:grid;gap:9px}.stats{grid-template-columns:repeat(4,1fr);margin:12px 0}.grid{grid-template-columns:340px 1fr}.row{grid-template-columns:1fr 1fr}.n{font-size:24px;font-weight:800}.mut{color:#abc0cf}.btn{border:1px solid #39617c;background:#0b3a61;color:#fff;border-radius:10px;padding:10px;font-weight:800}.gold{background:#d6a51b;color:#231700}.okbtn{background:#1d6b4f}.in,textarea{width:100%;box-sizing:border-box;background:#061929;border:1px solid #31536d;color:#fff;border-radius:9px;padding:9px;margin:4px 0 8px}.case,.box{border:1px solid #31536d;border-radius:10px;padding:8px;margin:6px 0}.case{cursor:pointer}.hidden{display:none}.ok{color:#51d59d}.warn{color:#f0bd4b}pre{font:inherit;white-space:pre-wrap}@media(max-width:760px){.grid,.row{grid-template-columns:1fr}.stats{grid-template-columns:1fr 1fr}.btn{min-height:44px}}</style></head><body><main class=\"w\">\n<h2>CONSTRU-REI • F00 — Recebimento de Chamados</h2><div class=\"mut\">Acesso simples neste piloto. Cole a mensagem como ela chegou e o F00 organiza.</div><p><button class=\"btn gold\" id=\"new\">+ Novo chamado</button></p>\n<div class=\"stats\"><div class=\"c\"><div class=\"n\" id=\"s1\">0</div>EM COLETA</div><div class=\"c\"><div class=\"n\" id=\"s2\">0</div>AGUARDANDO</div><div class=\"c\"><div class=\"n\" id=\"s3\">0</div>PRONTO F01</div><div class=\"c\"><div class=\"n\" id=\"s4\">0</div>TOTAL</div></div>\n<div class=\"grid\"><section class=\"c\"><input id=\"q\" class=\"in\" placeholder=\"Buscar nº, cliente, endereço ou contato\"><div id=\"list\"></div></section><section class=\"c\">\n<div id=\"intro\"><h3>Jogue a bagunça aqui.</h3><p class=\"mut\">Texto, contato e depois fotos. O sistema mostra o que falta.</p></div>\n<div id=\"ed\" class=\"hidden\"><div class=\"row\"><div>Número<input id=\"no\" class=\"in\" readonly></div><div>Cliente<input id=\"cl\" class=\"in\"></div></div>Endereço<input id=\"ad\" class=\"in\"><div class=\"row\"><div>Contato<input id=\"ct\" class=\"in\"></div><div>Telefone<input id=\"ph\" class=\"in\"></div></div>Chamado bruto / nova informação<textarea id=\"raw\" rows=\"7\"></textarea>Problema<textarea id=\"pr\" rows=\"3\"></textarea><div class=\"row\"><div>Pagamento/autorização<input id=\"py\" class=\"in\"></div><div>Disponibilidade<input id=\"av\" class=\"in\"></div></div>Acesso<input id=\"ac\" class=\"in\">Justificativa sem foto<input id=\"ev\" class=\"in\">\n<button class=\"btn\" id=\"process\">Processar</button> <button class=\"btn gold\" id=\"save\">Criar chamado</button> <button class=\"btn hidden\" id=\"wait\">Aguardando resposta</button>\n<div id=\"ana\" class=\"box hidden\"></div>\n<div id=\"detail\" class=\"hidden\"><div class=\"box\">Fotos/arquivos<input id=\"fi\" type=\"file\" class=\"in\" multiple accept=\"image/*,video/*,application/pdf,audio/*\"><button class=\"btn\" id=\"upload\">Adicionar ao mesmo chamado</button><div id=\"fl\" class=\"mut\"></div></div><div class=\"box\"><b>Mensagem WhatsApp</b><pre id=\"ms\"></pre><button class=\"btn cp\" data-id=\"ms\">Copiar</button></div><div class=\"box\"><b>GestãoClick</b><pre id=\"gc\"></pre><button class=\"btn cp\" data-id=\"gc\">Copiar</button></div><div class=\"box\"><b>F00 → F01</b><div id=\"gt\"></div><button class=\"btn okbtn\" id=\"rel\">Liberar para F01</button> <a id=\"f1\" class=\"btn hidden\" target=\"_blank\">Abrir F01</a></div><div class=\"box\"><b>Linha do tempo</b><div id=\"tl\" class=\"mut\"></div></div></div></div></section></div></main>\n<script>\nconst API=location.href.split(\"?\")[0];let R=[],C=null;const e=id=>document.getElementById(id);\nasync function call(api,b){const r=await fetch(API+\"?api=\"+encodeURIComponent(api),{method:\"POST\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify(b||{})}),d=await r.json();if(!r.ok)throw Error(d.error||\"Falha\");return d}\nfunction h(s){return String(s==null?\"\":s).replace(/[&<>\"]/g,c=>({\"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\",'\"':\"&quot;\"}[c]))}\nasync function load(){try{R=(await call(\"list\",{})).cases||[];render()}catch(x){e(\"list\").innerHTML='<div class=\"warn\">'+h(x.message)+'</div>'}}\nfunction render(){const q=(e(\"q\").value||\"\").toLowerCase(),a=R.filter(x=>JSON.stringify(x).toLowerCase().includes(q));e(\"s1\").textContent=R.filter(x=>x.status===\"EM_COLETA\").length;e(\"s2\").textContent=R.filter(x=>x.status===\"AGUARDANDO_RESPOSTA\").length;e(\"s3\").textContent=R.filter(x=>x.status===\"PRONTO_F01\").length;e(\"s4\").textContent=R.length;const host=e(\"list\");host.innerHTML=\"\";a.forEach(x=>{const d=document.createElement(\"div\");d.className=\"case\";d.innerHTML=\"<b>\"+h(x.case_number)+\"</b><div>\"+h(x.client||\"Cliente a confirmar\")+\"</div><small class='mut'>\"+h(x.status)+\"</small>\";d.onclick=()=>openC(x.id);host.appendChild(d)});if(!a.length)host.innerHTML='<div class=\"mut\">Nenhum chamado.</div>'}\nfunction fresh(){C=null;[\"no\",\"cl\",\"ad\",\"ct\",\"ph\",\"raw\",\"pr\",\"py\",\"av\",\"ac\",\"ev\"].forEach(i=>e(i).value=\"\");e(\"intro\").classList.add(\"hidden\");e(\"ed\").classList.remove(\"hidden\");e(\"detail\").classList.add(\"hidden\");e(\"wait\").classList.add(\"hidden\");e(\"save\").textContent=\"Criar chamado\"}\nfunction data(){return{raw:e(\"raw\").value,client:e(\"cl\").value,address:e(\"ad\").value,contact:e(\"ct\").value,phone:e(\"ph\").value,problem:e(\"pr\").value,payment:e(\"py\").value,availability:e(\"av\").value,access:e(\"ac\").value,evidence_justification:e(\"ev\").value}}\nfunction fill(c){[[\"no\",\"case_number\"],[\"cl\",\"client\"],[\"ad\",\"address\"],[\"ct\",\"contact_name\"],[\"ph\",\"contact_phone\"],[\"pr\",\"problem\"],[\"py\",\"payment\"],[\"av\",\"availability\"],[\"ac\",\"access_note\"],[\"ev\",\"evidence_justification\"]].forEach(x=>{if(c[x[1]]!=null)e(x[0]).value=c[x[1]]})}\nasync function processNow(){try{const d=await call(\"process\",{data:data()}),p=d.preview;[[\"cl\",\"client\"],[\"ad\",\"address\"],[\"ct\",\"contact\"],[\"ph\",\"phone\"],[\"pr\",\"problem\"],[\"py\",\"payment\"],[\"av\",\"availability\"],[\"ac\",\"access\"],[\"ev\",\"evidence\"]].forEach(x=>{if(p[x[1]]!=null)e(x[0]).value=p[x[1]]});e(\"ana\").classList.remove(\"hidden\");e(\"ana\").innerHTML=d.ready?'<span class=\"ok\">✓ Dados mínimos suficientes.</span>':'<span class=\"warn\">Faltam: '+h(d.missing.join(\", \"))+\"</span>\"}catch(x){alert(x.message)}}\nasync function saveNow(){try{if(!C){const d=await call(\"create\",{data:data()});await openC(d.case.id)}else{await call(\"update\",{id:C.id,data:data()});await openC(C.id)}await load()}catch(x){alert(x.message)}}\nasync function openC(id){try{const d=await call(\"get\",{id});C=d.case;fill(C);e(\"raw\").value=\"\";e(\"intro\").classList.add(\"hidden\");e(\"ed\").classList.remove(\"hidden\");e(\"detail\").classList.remove(\"hidden\");e(\"wait\").classList.remove(\"hidden\");e(\"save\").textContent=\"Salvar / adicionar informação\";e(\"ms\").textContent=d.message;e(\"gc\").textContent=d.gestaoclick;e(\"fl\").innerHTML=(d.files||[]).map(f=>\"• \"+h(f.filename)).join(\"<br>\")||\"Nenhum arquivo.\";e(\"gt\").innerHTML=d.ready?'<span class=\"ok\">✓ Pronto para F01</span>':'<span class=\"warn\">Faltam: '+h(d.missing.join(\", \"))+\"</span>\";e(\"rel\").disabled=!d.ready||C.released_f01;e(\"f1\").href=d.f01_url||\"#\";e(\"f1\").classList.toggle(\"hidden\",!C.released_f01);e(\"tl\").innerHTML=(d.events||[]).map(x=>\"• \"+new Date(x.created_at).toLocaleString(\"pt-BR\")+\" — \"+h(x.event_text)).join(\"<br>\")}catch(x){alert(x.message)}}\nasync function waiting(){await call(\"update\",{id:C.id,data:Object.assign(data(),{awaiting_response:true})});await openC(C.id);await load()}\nasync function upload(){for(const f of e(\"fi\").files){const fd=new FormData();fd.append(\"file\",f);const r=await fetch(API+\"?api=upload&id=\"+encodeURIComponent(C.id),{method:\"POST\",body:fd}),d=await r.json();if(!r.ok)return alert(d.error)}e(\"fi\").value=\"\";await openC(C.id);await load()}\nasync function release(){if(!confirm(\"Liberar para F01?\"))return;await call(\"release\",{id:C.id});await openC(C.id);await load()}\ne(\"new\").onclick=fresh;e(\"q\").oninput=render;e(\"process\").onclick=processNow;e(\"save\").onclick=saveNow;e(\"wait\").onclick=waiting;e(\"upload\").onclick=upload;e(\"rel\").onclick=release;document.querySelectorAll(\".cp\").forEach(b=>b.onclick=()=>navigator.clipboard.writeText(e(b.dataset.id).textContent||\"\"));load();\n</script></body></html>";

Deno.serve(async req=>{if(req.method==="OPTIONS")return new Response("ok",{headers:H});const u=new URL(req.url),api=(u.searchParams.get("api")||"").toLowerCase();try{if(req.method==="GET"&&!api)return Response.redirect("https://construrei-dashboard.netlify.app/f00/",302);if(req.method==="GET"&&api==="health")return J({ok:true,build:BUILD,persistence:"SUPABASE",f01:F01URL,engine:"F00_INTELLIGENCE_V8_CANDIDATE"});

if(req.method==="GET"&&api==="matrix-test"){
  const mk=async(raw:string,manual:any={})=>await sem(raw,{manual});
  const tests:any[]=[];
  const add=(name:string,pass:boolean,detail:any={})=>tests.push({name,pass:!!pass,detail});
  const a1=await mk("Cliente: JBA\nRua das Flores, 123, Apto 12\nMorador: João da Silva (41) 99999-1111\nTorneira com vazamento na cozinha\nPagamento: proprietário\nDisponibilidade amanhã às 10:00\nSem fotos disponíveis.");
  add("simple_complete",/Rua das Flores, 123/i.test(a1.address)&&a1.involved.some((p:any)=>/João/i.test(p.name))&&/Torneira/i.test(a1.problem)&&!!a1.evidence);
  const a2=await mk("Torneira pingando.");
  const g2=gate({case_number:"101-26",client:a2.client,address:a2.address,contact_name:a2.contact,contact_phone:a2.phone,problem:a2.problem,payment:a2.payment,availability:a2.availability,access_note:a2.access,evidence_justification:a2.evidence,raw_text:a2.raw,structured:a2},0);
  add("incomplete_detected",!g2.ready&&g2.missing.length>0,{missing:g2.missing});
  const a3=await mk("Av. República Argentina, 2500, apto 34\nContato: Maria (41) 98888-7777\nChuveiro sem aquecer.");
  add("address_avenue",/República Argentina, 2500/i.test(a3.address));
  const a4=await mk("Praça Osório, 100, sala 12\nContato: Carlos (41) 97777-6666\nPintura.");
  add("address_square",/Praça Osório, 100/i.test(a4.address));
  const a5=await mk("Residencial Mônaco, Rua Exemplo, 80, Bloco B, Apto 302\nMoradora: Ana (41) 96666-5555\nInfiltração.");
  add("condo_block_apartment",/Apto 302/i.test(a5.address)||mainUnitFromAddress(a5.address)==="302",{address:a5.address});
  const a6=await mk("Rua Teste, 10\nContato: Pedro (41) 95555-4444\nChuveiro queimado; tomada solta; registro vazando.");
  add("multi_problem",(a6.items||[]).length>=3,{items:(a6.items||[]).map((x:any)=>x.subject)});
  const a7=await mk("Rua Teste, 10\nLudmila (41) 91111-1111\nYana (41) 92222-2222\nElton (41) 93333-3333\nVazamento.");
  add("contacts_separate_lines",(a7.involved||[]).filter((x:any)=>x.type==="pessoa"&&x.phone).length>=3);
  const a8=await mk("Rua Teste, 10\nApartamento de cima - Ludmila (41) 91111-1111 ou Yana (41) 92222-2222 ou Elton (41) 93333-3333\nVazamento.");
  add("contacts_same_line",(a8.involved||[]).filter((x:any)=>x.type==="pessoa"&&x.phone).length>=3);
  const a9=await mk("Rua Teste, 10\nMoradora: Ana\nPorta quebrada.");
  add("contact_without_phone",(a9.involved||[]).some((x:any)=>x.type==="pessoa"&&/Ana/i.test(x.name)&&!x.phone));
  const a10=await mk("Rua Teste, 10\nContato telefone (41) 94444-3333\nPorta quebrada.");
  add("phone_without_name",(a10.involved||[]).some((x:any)=>x.type==="pessoa"&&!x.name&&x.phone));
  const a11=await mk("Rua Teste, 10, Apto 1201\nApartamento 1201 com vazamento para apartamento 1101.");
  const u11=(a11.units||[]).filter((u:any)=>u.unit);
  add("two_numbered_units",u11.some((u:any)=>u.unit==="1201")&&u11.some((u:any)=>u.unit==="1101"),{units:u11});
  const a12=await mk("Praça Teste, 20, AP 506\nApartamento de cima com vazamento para apartamento de baixo.");
  add("relation_without_false_unit",!(a12.units||[]).some((u:any)=>["DE","PARA","CIMA","BAIXO"].includes(String(u.unit||"").toUpperCase())));
  const a13=await mk("Rua Teste, 10\nNão teremos fotos desse chamado.\nRegistro vazando.");
  add("evidence_justification",/Não teremos fotos/i.test(a13.evidence||""));
  const base="Rua Teste, 10\nRegistro vazando.",comp="disponibilidade para atendimento - 14:00";
  const m1=mergeRawHistory(base,comp),m2=mergeRawHistory(m1,comp);
  add("duplicate_complement_idempotent",m1===m2);
  const a14=await sem("Rua Antiga, 1\nRegistro vazando.",{manual:{address:"Rua Corrigida, 99"}});
  add("manual_override",a14.address==="Rua Corrigida, 99");
  const a15=await mk("Praça Teste, 20, AP 506\nApartamento de cima - Ana (41) 91111-1111 ou Bia (41) 92222-2222\nApartamento de baixo: Carlos (41) 93333-3333\nVazamento.");
  add("multiple_phones_not_conflict",!(a15.conflicts||[]).some((x:any)=>x.type==="PHONE"));
  const a16=await mk("Rua Teste, 10\nFotos serão coletadas na visita.\nTrinca na parede.");
  add("visit_evidence_statement",/coletadas na visita/i.test(a16.evidence||""));
  const a17=await mk("Rua Teste, 10\nContato: João (41) 99999-1111\nAcesso pela portaria.\nDisponibilidade: amanhã de manhã.\nPagamento: proprietário.\nPorta quebrada.");
  add("access_availability_payment",!!a17.access&&!!a17.availability&&!!a17.payment,{access:a17.access,availability:a17.availability,payment:a17.payment});
  const all=tests.every(x=>x.pass);
  return J({ok:all,build:BUILD,total:tests.length,passed:tests.filter(x=>x.pass).length,failed:tests.filter(x=>!x.pass).length,tests});
}
if(req.method==="GET"&&api==="self-test"){
  const raw="08621.006 - Praça Senador Correia, 62, AP 506\n\nApartamento de cima (nosso) - Ludmila +55 99 98432-8836 ou Yana +55 41 99898-2992 ou Elton +55 99 98425-1048\n\nApartamento de baixo: Sr Ormindo (11) 98788-2600\n\nVazamento de um apartamento para o outro. Sindico informou que está infiltrando muito, não recebemos fotos para mensurar.\n\nChamado nível priorizado.";
  const comp="cliente / imobiliária - Gabi / Galvão\nendereço completo - Praça Senador Correia, 62 AP 506\nresponsável pelo pagamento / autorização - Gabi / Galvão\ndisponibilidade para atendimento - 10:00\nÉ um caso de múltiplos contatos.\nfotos, vídeos ou justificativa de ausência - Não teremos fotos desse chamado.";
  const s1=await sem(raw,{});
  const merged=mergeRawHistory(raw,comp),s2=await sem(merged,{existing:{},confirmed:s1.confirmed_fields||{}});
  const merged2=mergeRawHistory(merged,comp),s3=await sem(merged2,{existing:{},confirmed:s2.confirmed_fields||{}});
  const people=(s1.involved||[]).filter((x:any)=>x.type==="pessoa");
  const units=(s1.units||[]);
  const checks:any={
    address:/Praça Senador Correia,\s*62/i.test(s1.address||""),
    four_contacts:["Ludmila","Yana","Elton","Ormindo"].every(n=>people.some((p:any)=>fold(p.name).includes(fold(n))))&&people.filter((p:any)=>p.phone).length>=4,
    no_false_people:!people.some((p:any)=>/apartamento de baixo|endere[cç]o|solicita[cç][aã]o|objetivo/i.test(fold(p.name))),
    no_false_units:!units.some((u:any)=>["DE","PARA"].includes(String(u.unit||"").toUpperCase())),
    ap506:units.some((u:any)=>String(u.unit||"").toUpperCase()==="506"),
    multi_context:people.some((p:any)=>p.name==="Ludmila"&&p.unit==="506")&&people.some((p:any)=>/Ormindo/i.test(p.name)),
    no_phone_conflict:!(s1.conflicts||[]).some((x:any)=>x.type==="PHONE"),
    evidence_initial:!!s1.evidence,
    client_confirmed:s2.client==="Gabi / Galvão",
    address_confirmed:/Praça Senador Correia,\s*62\s*AP\s*506/i.test((s2.address||"").replace(/,/g,",")),
    payment_clean:s2.payment==="Gabi / Galvão",
    availability_clean:s2.availability==="10:00",
    evidence_confirmed:/Não teremos fotos/i.test(s2.evidence||""),
    idempotent_history:merged2===merged,
    no_pending_prefix_values:![s2.client,s2.address,s2.payment,s2.availability,s2.evidence].some((v:any)=>/^[⚠]|CONFIRMAR:|INFORMAÇÕES PENDENTES/i.test(String(v||"")))
  };
  return J({ok:Object.values(checks).every(Boolean),build:BUILD,checks,summary:{address:s1.address,people:people.map((p:any)=>({name:p.name,phone:p.phone,unit:p.unit,context:p.context})),units:units.map((u:any)=>({unit:u.unit,role:u.role,context:u.context})),confirmed:{client:s2.client,address:s2.address,payment:s2.payment,availability:s2.availability,evidence:s2.evidence},engine:s2.engine_version}});
}
const id={display_name:"Gabrielly / F00",role:"OPERADOR_F00"};if(api==="me")return J({ok:true,profile:id.display_name,role:id.role});if(api==="list"){const q=await db.from("cr_f00_cases").select("id,case_number,status,title,client,address,contact_name,contact_phone,problem,missing_fields,awaiting_response,released_f01,updated_at,structured").order("updated_at",{ascending:false}).limit(250);const cases=(q.data||[]).map((x:any)=>({...x,structured:{case_type:x.structured?.case_type||"",items:(x.structured?.items||[]).map((i:any)=>({id:i.id,subject:i.subject,environment:i.environment})),involved:(x.structured?.involved||[]).map((p:any)=>({name:p.name,phone:p.phone,role:p.role,unit:p.unit,type:p.type}))}}));return J({ok:true,cases})}if(api==="process"){const b=await req.json(),num=manualNumber(b.case_number),s=await sem(T(b.data?.raw,120000),{manual:b.data||{}}),p={case_number:num?.no||"",client:s.client,address:s.address,contact_name:s.contact,contact_phone:s.phone,problem:s.problem,payment:s.payment,availability:s.availability,access_note:s.access,raw_text:s.raw,evidence_justification:s.evidence,structured:s},g=gate(p,Number(b.file_count||0));return J({ok:true,preview:s,case_number:num?.no||"",number_valid:!!num,ready:g.ready,missing:g.missing})}if(api==="create"){const b=await req.json(),a=manualNumber(b.case_number);if(!a)return J({ok:false,error:"Digite o número do orçamento no formato 731-26."},400);const ex=await db.from("cr_f00_cases").select("id,case_number,status").eq("case_number",a.no).maybeSingle();if(ex.error)throw Error(ex.error.message);if(ex.data)return J({ok:false,error:"Este chamado já existe no F00.",code:"DUPLICATE_CASE",existing:ex.data},409);const s=await sem(T(b.data?.raw,120000),{manual:b.data||{}}),row:any={case_number:a.no,case_year:a.y,case_seq:a.n,title:s.title,client:s.client,address:s.address,contact_name:s.contact,contact_phone:s.phone,problem:s.problem,payment:s.payment,availability:s.availability,access_note:s.access,evidence_justification:s.evidence,raw_text:s.raw,structured:s,created_by:id.display_name,updated_by:id.display_name,trello_status:"NAO_CRIAR_CARD_NO_F00"};const q=await db.from("cr_f00_cases").insert(row).select("*").single();if(q.error){if(q.error.code==="23505"){const dup=await db.from("cr_f00_cases").select("id,case_number,status").eq("case_number",a.no).maybeSingle();return J({ok:false,error:"Este chamado já existe no F00.",code:"DUPLICATE_CASE",existing:dup.data},409)}throw Error(q.error.message)}const g=gate(q.data,0),st=status(q.data,0);await db.from("cr_f00_cases").update({status:st,missing_fields:g.missing}).eq("id",q.data.id);await evt(q.data.id,"CREATE","Chamado "+a.no+" criado no F00.",id);return J({ok:true,case:{...q.data,status:st,missing_fields:g.missing}},201)}if(api==="get"){const b=await req.json(),c=await one(T(b.id,80));if(!c)return J({ok:false,error:"Não encontrado."},404);const fs=await files(c.id,true),g=gate(c,fs.length),ev=await db.from("cr_f00_events").select("*").eq("case_id",c.id).order("created_at",{ascending:false}).limit(100);return J({ok:true,case:{...c,status:status(c,fs.length)},files:fs,events:ev.data||[],ready:g.ready,missing:g.missing,advisory:g.advisory||[],message:msg(c,fs.length),gestaoclick:gc(c),f01_url:F01URL})}if(api==="wait"){const b=await req.json(),c=await one(T(b.id,80));if(!c)return J({ok:false,error:"Não encontrado."},404);if(c.released_f01)return J({ok:false,error:"Chamado já foi liberado para F01."},409);const fs=await files(c.id,false),g=gate(c,fs.length);if(g.ready)return J({ok:false,error:"Este chamado não possui pendência crítica para aguardar resposta."},409);const structured={...(c.structured||{}),lifecycle:{...((c.structured||{}).lifecycle||{}),current_phase:"F00",current_owner:"TERCEIRO",queue_status:"AGUARDANDO_RESPOSTA",waiting_since:new Date().toISOString(),last_action_at:new Date().toISOString()}};const q=await db.from("cr_f00_cases").update({awaiting_response:true,status:"AGUARDANDO_RESPOSTA",structured,updated_by:id.display_name,updated_at:new Date().toISOString()}).eq("id",c.id).select("*").single();if(q.error)throw Error(q.error.message);await evt(c.id,"F00_WAITING_RESPONSE","Mensagem de coleta preparada; aguardando resposta externa.",id);return J({ok:true,case:q.data})}if(api==="update"){const b=await req.json(),c=await one(T(b.id,80));if(!c)return J({ok:false,error:"Não encontrado."},404);const x=b.data||{},raw=mergeRawHistory(c.raw_text,T(x.raw,120000)),manual:any={};for(const k of ["client","address","contact","phone","problem","payment","availability","access","evidence_justification"])if(Object.prototype.hasOwnProperty.call(x,k)&&T(x[k],500))manual[k]=x[k];const s=await sem(raw,{manual,existing:c,confirmed:c.structured?.confirmed_fields||{}}),fs=await files(c.id,false),tmp={...c,client:s.client,address:s.address,contact_name:s.contact,contact_phone:s.phone,problem:s.problem,payment:s.payment,availability:s.availability,access_note:s.access,evidence_justification:s.evidence,structured:s,awaiting_response:!!x.awaiting_response},g=gate(tmp,fs.length),st=status(tmp,fs.length);s.lifecycle={...((c.structured||{}).lifecycle||{}),current_phase:"F00",current_owner:st==="AGUARDANDO_RESPOSTA"?"TERCEIRO":"GABRIELLY",queue_status:st,last_action_at:new Date().toISOString(),waiting_since:st==="AGUARDANDO_RESPOSTA"?(((c.structured||{}).lifecycle||{}).waiting_since||new Date().toISOString()):null};const q=await db.from("cr_f00_cases").update({title:s.title,client:s.client,address:s.address,contact_name:s.contact,contact_phone:s.phone,problem:s.problem,payment:s.payment,availability:s.availability,access_note:s.access,evidence_justification:s.evidence,raw_text:raw,structured:s,awaiting_response:!!x.awaiting_response,status:st,missing_fields:g.missing,updated_by:id.display_name,updated_at:new Date().toISOString()}).eq("id",c.id).select("*").single();if(q.error)throw Error(q.error.message);const ev=(c.awaiting_response&&!x.awaiting_response)?"F00_RESPONSE_RECEIVED":(x.awaiting_response?"F00_WAITING_RESPONSE":"F00_REPROCESSED");await evt(c.id,ev,x.awaiting_response?"Aguardando resposta do contato.":(c.awaiting_response?"Resposta recebida e chamado reprocessado.":"Nova informação adicionada e reprocessada."),id);return J({ok:true,case:q.data,recognized_changes:recognizedChanges(c,q.data),missing:g.missing})}if(api==="upload"){const c=await one(T(u.searchParams.get("id"),80));if(!c)return J({ok:false,error:"Não encontrado."},404);const fd=await req.formData(),f=fd.get("file");if(!(f instanceof File))return J({ok:false,error:"Arquivo obrigatório."},400);if(f.size>50*1024*1024)return J({ok:false,error:"Arquivo acima de 50 MB."},413);const path="f00/"+c.case_number+"/"+Date.now()+"-"+crypto.randomUUID()+"-"+f.name.replace(/[^\w.\-]+/g,"_");const z=await db.storage.from(BUCKET).upload(path,f,{contentType:f.type||"application/octet-stream"});if(z.error)throw Error(z.error.message);const m=await db.from("cr_f00_files").insert({case_id:c.id,filename:f.name,content_type:f.type,size_bytes:f.size,storage_path:path,uploaded_by:id.display_name}).select("*").single();if(m.error)throw Error(m.error.message);await evt(c.id,"FILE","Arquivo recebido: "+f.name,id);const allFiles=await files(c.id,false),g=gate(c,allFiles.length),st=status(c,allFiles.length);await db.from("cr_f00_cases").update({status:st,missing_fields:g.missing,updated_at:new Date().toISOString()}).eq("id",c.id);return J({ok:true,file:m.data,status:st,missing:g.missing})}if(api==="release"){const b=await req.json(),c=await one(T(b.id,80));if(!c)return J({ok:false,error:"Não encontrado."},404);const fs=await files(c.id,false),g=gate(c,fs.length);if(!g.ready)return J({ok:false,error:"Chamado incompleto.",missing:g.missing},422);const h=await handoff(c,fs);if(String(h.flow?.to_flow||"").toUpperCase()!=="F01")throw Error("Transferência F00→F01 não confirmada; o chamado permanecerá no F00.");const structured={...(c.structured||{}),lifecycle:{...((c.structured||{}).lifecycle||{}),current_phase:"F01",current_owner:"ATENDIMENTO",queue_status:"TRANSFERIDO_F01",handoff_status:"CONFIRMED",transferred_at:new Date().toISOString(),last_action_at:new Date().toISOString(),flow_token:h.flow?.token||""}},q=await db.from("cr_f00_cases").update({released_f01:true,f01_slot_index:h.slot,status:"LIBERADO_F01",awaiting_response:false,structured,updated_by:id.display_name,updated_at:new Date().toISOString()}).eq("id",c.id);if(q.error)throw Error(q.error.message);await evt(c.id,"F00_RELEASED_F01","F00 concluído e transferência para F01 confirmada.",id);return J({ok:true,f01:h,url:F01URL})}return J({ok:false,error:"Rota não encontrada."},404)}catch(e){return J({ok:false,error:e instanceof Error?e.message:String(e),build:BUILD},500)}});
