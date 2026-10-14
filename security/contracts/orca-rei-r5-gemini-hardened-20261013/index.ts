import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.57.4";
const cors={"access-control-allow-origin":"https://rogeriocibin-alt.github.io","access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"authorization,content-type,apikey,x-orca-diagnostic","content-type":"application/json; charset=utf-8","cache-control":"no-store"};
const respond=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:cors});
const URL=Deno.env.get("SUPABASE_URL")||"";
const ANON=Deno.env.get("SUPABASE_ANON_KEY")||"";
const KEY=Deno.env.get("GEMINI_API_KEY")||Deno.env.get("GOOGLE_AI_API_KEY")||"";
const MODEL=Deno.env.get("ORCA_REI_GEMINI_MODEL")||"gemini-2.5-flash";
const MAX_INPUT=4000;
const reportHasFinancialAmounts=(value:string)=>/(?:R\s*\$|US\s*\$|€|£|\b(?:BRL|USD)\b|\d[\d.,]*\s*%|\d[\d.,]*\s*(?:reais|real|centavos)\b|(?:pre[çc]o|valor|custo|total|desconto|margem|lucro|comiss[aã]o|tributo|encargo)\s*[:=-]?\s*(?:R\s*\$)?\s*\d)/i.test(value);
const instruction=`Você é ORÇA-REI, consultor técnico-orçamentista da CONSTRU-REI. Melhore substancialmente o texto enviado, sem repetir mecanicamente, sem inventar vistorias, medições, normas, preços ou diagnósticos. Entregue texto profissional, conciso e técnico em português brasileiro. Separe serviço, materiais, observações e parecer. Parecer técnico: nunca coloque preços, totais, custos, valores, margens ou tributos, nem dados fictícios; fundamente observações pelo que é comprovado versus hipótese. Parecer no DNA técnico do 710-26, sem alegar que reproduziu o template PDF. Orçamento deve preservar preços fornecidos e não criar números. Não altere silenciosamente conteúdo confirmado, pontue lacunas e ressalvas. Retorne EXCLUSIVAMENTE objeto JSON com campos services, materials, notes, report, warnings (array de strings), research_status (string). Não afirme pesquisa web: não há ferramenta de pesquisa conectada aqui.`;
Deno.serve(async(req)=>{
if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
if(req.method!=="POST")return respond({error:"method_not_allowed"},405);
if(!URL||!ANON)return respond({error:"auth_configuration_missing"},503);
const bearer=req.headers.get("authorization")||"";
if(!/^Bearer\s+[\w.-]+$/.test(bearer))return respond({error:"authentication_required"},401);
const authClient=createClient(URL,ANON,{global:{headers:{Authorization:bearer}},auth:{persistSession:false,autoRefreshToken:false}});
const token=bearer.replace(/^Bearer\s+/,"");
const {data,error}=await authClient.auth.getUser(token);
if(error||!data.user)return respond({error:"invalid_session"},401);
const allow=(Deno.env.get("ORCA_REI_ALLOWED_EMAILS")||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
if(!allow.length||!data.user.email||!allow.includes(data.user.email.toLowerCase()))return respond({error:"not_authorized_for_orca_rei"},403);
if(req.headers.get("x-orca-diagnostic")==="status")return respond({ok:true,diagnostic:true,authenticated:true,authorized:true,model_calls_enabled:Deno.env.get("ORCA_REI_ENABLE_MODEL_CALLS")==="true",key_configured:!!KEY,model:MODEL,research_enabled:false,provider_called:false});
if(Deno.env.get("ORCA_REI_ENABLE_MODEL_CALLS")!=="true")return respond({error:"model_calls_disabled_pending_free_tier_verification",cost_policy:"zero_external_model_calls_by_default"},503);
if(!KEY)return respond({error:"gemini_not_configured"},503);
let body:any;
try{body=await req.json()}catch{return respond({error:"invalid_json"},400)}
const src=body?.input||{};
const fields=["services","materials","notes","case_number","client","address","problem"];
const input:Record<string,string>={};
for(const f of fields){const x=String(src[f]??"").trim();if(x.length>MAX_INPUT)return respond({error:"input_too_long",field:f},413);input[f]=x}
if(!(input.services||input.materials||input.notes))return respond({error:"empty_scope"},422);
const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),18000);
try{
const response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(MODEL)+":generateContent",{
method:"POST",signal:ctrl.signal,headers:{"content-type":"application/json","x-goog-api-key":KEY},
body:JSON.stringify({systemInstruction:{parts:[{text:instruction}]},contents:[{role:"user",parts:[{text:JSON.stringify(input)}]}],
generationConfig:{temperature:0.25,maxOutputTokens:1200,responseMimeType:"application/json"}})
});
if(!response.ok)return respond({error:"model_unavailable",http_status:response.status},502);
const payload=await response.json();
const raw=payload?.candidates?.[0]?.content?.parts?.map((x:any)=>x.text||"").join("")||"";
let parsed:any;try{parsed=JSON.parse(raw)}catch{return respond({error:"model_invalid_json"},502)}
const out:Record<string,unknown>={};
for(const field of ["services","materials","notes","report"]){out[field]=String(parsed[field]??"").slice(0,12000)}
out.warnings=Array.isArray(parsed.warnings)?parsed.warnings.slice(0,12).map((x:any)=>String(x).slice(0,500)):[];
out.research_status="PESQUISA WEB NÃO REALIZADA";
if(!String(out.report||"").trim()||reportHasFinancialAmounts(String(out.report)))return respond({error:"report_contains_financial_values",provider_called:true,report_blocked:true},422);
return respond({ok:true,provider:"gemini",provider_called:true,model:MODEL,prompt_version:"ORCA-REI-20261013-R4-REPORT-SAFE",result:out,usage:payload.usageMetadata||null});
}catch(e){return respond({error:e instanceof DOMException&&e.name==="AbortError"?"timeout":"provider_error"},502)}finally{clearTimeout(timer)}
});
