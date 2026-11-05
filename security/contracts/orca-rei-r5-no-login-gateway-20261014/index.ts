import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

// ORÇA-REI | Contrato da candidata, NÃO ativar em produção sem auditoria Free Tier.
// Substitui SOMENTE a Edge candidata existente cr-orca-rei-gemini-candidate-20261013
// no momento da homologação. Nenhum segredo pode ir para frontend ou Git.
const SITE="https://rogeriocibin-alt.github.io";
const HEADERS={
  "access-control-allow-origin":SITE,
  "access-control-allow-methods":"GET,POST,OPTIONS",
  "access-control-allow-headers":"content-type,apikey",
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "vary":"Origin"
};
const send=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:HEADERS});
const env=(key:string)=>Deno.env.get(key)||"";
const MODEL="gemini-2.5-flash-lite"; // versão com modalidade Free; NUNCA trocar silenciosamente
// Dedicated key from a separate no-billing Free Tier project; NEVER fall back to existing billed app-construrei credentials.
const KEY=env("ORCA_REI_FREE_API_KEY");
const SUPA_URL=env("SUPABASE_URL");
const secretKeys=(()=>{try{return JSON.parse(env("SUPABASE_SECRET_KEYS"))}catch{return {}}})();
const SERVICE_KEY=secretKeys?.default||env("SUPABASE_SERVICE_ROLE_KEY");
// Explicit independent verification is required; secret presence alone never authorizes spending.
const FREE_VERIFIED=env("ORCA_REI_FREE_TIER_CONFIRMED")==="true";
// Apenas a confirmação explícita Free Tier autoriza uso. Nenhum toggle financeiro adicional.
const ENABLED=FREE_VERIFIED;
const LIMIT=2200;
const finance=/(?:R\s*\$|US\s*\$|€|£|\b(?:BRL|USD)\b|\d[\d.,]*\s*%|\d[\d.,]*\s*(?:reais|real|centavos)\b|(?:pre[çc]o|valor|custo|total|desconto|margem|lucro|comiss[aã]o|tributo|encargo)\s*[:=-]?\s*(?:R\s*\$)?\s*\d)/i;
const instruction=String.raw`Você é o ORÇA-REI, especialista em orçamento técnico CONSTRU-REI. Melhore de modo real e útil a redação técnica, evitando repetições, diagnósticos inventados, quantidades estimadas sem base e citações fictícias. Retorne JSON com services, materials, notes, report, warnings (lista) e research_status. Preserve integralmente os preços/quantidades fornecidos no orçamento, não crie novos valores. Em 'report', não inclua nenhum preço, custo, margem, comissão, valor financeiro, desconto ou percentual; diferencie constatações de hipóteses, indique vistorias necessárias. Não afirme pesquisa externa. Não processe nomes ou dados pessoais desnecessários. Português brasileiro profissional.`;
const sha=async(text:string)=>{
 const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
 return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
};
Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:HEADERS});
 const origin=req.headers.get("origin")||"";
 if(origin!==SITE)return send({error:"origin_not_allowed"},403);
 if(req.method==="GET"){
   // Estado sem segredos, não gera tokens nem chamadas ao Google.
   return send({
    ok:true,provider:"gemini",model:MODEL,provider_called:false,
    public_dev_ai_ready:ENABLED && FREE_VERIFIED && !!KEY && !!SERVICE_KEY && !!SUPA_URL,
    status:!FREE_VERIFIED?"billing_not_verified":(!ENABLED?"administratively_disabled":(!KEY?"key_missing":(!SERVICE_KEY?"private_quota_unavailable":"ready"))),
    max_daily_calls:8,free_tier_requires_manual_verification:true
   });
 }
 if(req.method!=="POST")return send({error:"method_not_allowed"},405);
 // Nunca cobrar acidentalmente: flags são false na ausência de confirmação administrativa.
 if(!FREE_VERIFIED)return send({error:"free_tier_not_verified",provider_called:false},503);
 if(!ENABLED)return send({error:"dev_ai_disabled",provider_called:false},503);
 if(!KEY||!SUPA_URL||!SERVICE_KEY)return send({error:"private_configuration_missing",provider_called:false},503);
 if(!(req.headers.get("content-type")||"").includes("application/json"))return send({error:"json_required"},415);
 const length=Number(req.headers.get("content-length")||0);
 if(length>10000)return send({error:"request_too_large"},413);
 let payload:any;
 try{const raw=await req.text();if(raw.length>10000)return send({error:"request_too_large"},413);payload=JSON.parse(raw)}
 catch{return send({error:"invalid_json"},400)}
 const src=payload?.input;
 if(!src || typeof src!=="object" || Array.isArray(src))return send({error:"missing_input"},400);
 const input:Record<string,string>={};
 for(const field of ["services","materials","notes","case_number"]){
   if(typeof src[field]!=="string" && src[field]!==undefined)return send({error:"invalid_input_type",field},422);
   const value=String(src[field]||"").trim();
   if(value.length>LIMIT)return send({error:"input_too_long",field},413);
   input[field]=value;
 }
 if(!(input.services||input.materials||input.notes))return send({error:"empty_scope"},422);
 // IP não é autenticação. Um cliente malicioso pode falsificar Origin/IP;
 // o teto GLOBAL atômico impede explosão de uso mesmo em caso de spoofing.
 const forwarded=(req.headers.get("x-forwarded-for")||"").split(",")[0].trim();
 const ip=req.headers.get("x-real-ip")||forwarded||"unknown";
 // Hash com segredo privado já existente; evita outra credencial/configuração manual.
 const fingerprint=await sha(SERVICE_KEY+"|orca-rei-private-quota-v1|"+ip);
 // RPC deve ter EXECUTE exclusivamente para service_role, com trava transacional.
 const db=createClient(SUPA_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:claim,error:claimError}=await db.rpc("cr_orca_public_claim_v1",{p_fingerprint:fingerprint});
 if(claimError || claim?.allowed!==true)return send({
    error:claimError?"quota_unavailable":String(claim?.reason||"quota_exhausted"),
    provider_called:false
 },claimError?503:429);
 try{
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),18000);
  let response:Response;
  try{
   response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+MODEL+":generateContent",{
    method:"POST",signal:controller.signal,headers:{"x-goog-api-key":KEY,"content-type":"application/json"},
    body:JSON.stringify({
      systemInstruction:{parts:[{text:instruction}]},
      contents:[{role:"user",parts:[{text:JSON.stringify(input)}]}],
      generationConfig:{temperature:0.2,maxOutputTokens:1200,responseMimeType:"application/json"}
    })
   });
  }finally{clearTimeout(timeout)}
  if(!response.ok)return send({error:"gemini_unavailable",upstream_status:response.status,provider_called:true},502);
  const g=await response.json();
  const raw=(g?.candidates?.[0]?.content?.parts||[]).map((part:any)=>part.text||"").join("");
  let out:any;try{out=JSON.parse(raw)}catch{return send({error:"model_invalid_json",provider_called:true},502)}
  const result:Record<string,string>={
   services:String(out.services||"").slice(0,7000),
   materials:String(out.materials||"").slice(0,7000),
   notes:String(out.notes||"").slice(0,7000),
   report:String(out.report||"").slice(0,7000)
  };
  if(!result.report.trim()||finance.test(result.report))return send({
   error:"report_contains_financial_values",provider_called:true,report_blocked:true
  },422);
  if(!g?.usageMetadata)return send({error:"provider_usage_unverified",provider_called:true},502);
  return send({
   ok:true,provider:"gemini",provider_called:true,model:MODEL,usage:g.usageMetadata,result,
   warnings:Array.isArray(out.warnings)?out.warnings.slice(0,6).map((x:unknown)=>String(x).slice(0,250)):[],
   research_status:"PESQUISA WEB NÃO REALIZADA",
   source:"real_model",requires_human_review:true
  });
 }catch(e){return send({
  error:e instanceof DOMException&&e.name==="AbortError"?"timeout":"model_error",
  provider_called:true
 },502)}
});
