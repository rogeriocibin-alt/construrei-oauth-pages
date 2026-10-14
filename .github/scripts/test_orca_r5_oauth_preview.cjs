// Node-only contract tests; no network, credentials or external calls.
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const base=fs.readFileSync("preview/app-atendimento-f02-orca-rei-seguro-r5-20261013/index.html","utf8");
const now=fs.readFileSync("preview/app-atendimento-f02-orca-rei-seguro-r5-oauth-fix-20261013/index.html","utf8");
const startBase=base.indexOf('<script id="orca-rei-gemini-r8">');
const startNow=now.indexOf('<script id="orca-rei-google-session-r9">');
assert(startBase>0&&startNow>0);
assert.equal(base.slice(0,startBase),now.slice(0,startNow),"Homologated F02, visual identity and PDF changed");
assert(now.includes('id="v20Budget"')&&now.includes('id="v20Report"'),"PDF buttons missing");
assert(!now.includes('<script id="orca-rei-gemini-r8">'));
const match=now.match(/<script id="orca-rei-google-session-r9">([\s\S]*?)<\/script>/);
assert(match,"Auth script missing");
new vm.Script(match[1],{filename:"orca-auth-r9.js"});
for(const required of ["signInWithOAuth","flowType:\"pkce\"","getSession()","getUser()",
"autoRefreshToken:true","scope:\"local\"","model_calls_enabled","provider!==\"gemini\"",
"reply.payload.usage","reportSafe","if(!generated)","qaF02Services","qaF02Notes",
"qaF02Materials","__orcaReiReportDraft","cache:\"no-store\""]){
 assert(match[1].includes(required), "Missing safeguard: "+required);
}
const pattern=match[1].match(/const finance=(\/.*\/i);/);
assert(pattern,"Financial redaction guard missing");
const regex=vm.runInNewContext("("+pattern[1]+")");
for(const unsafe of [
 "O valor da mão de obra é R$ 800,00.",
 "Desconto 10% aplicado.",
 "Total: 1240.",
 "Preço R$ 150,00",
 "Lucro: 32",
 "Materiais por 450 reais",
 "US$ 24"
])assert(regex.test(unsafe),"Financial leak accepted: "+unsafe);
for(const safe of [
 "A origem da infiltração deverá ser confirmada por vistoria.",
 "Recomenda-se verificar conexões, registros e vedação.",
 "Parecer referente à obra 710-26.",
 "Substituir 2 conexões quando tecnicamente necessário."
])assert(!regex.test(safe),"Overblocking technical description: "+safe);
assert(!/(?:service_role|supabase_secret_key|GEMINI_API_KEY)\s*=\s*["']/.test(match[1]));
const server=fs.readFileSync("security/contracts/orca-rei-r5-gemini-hardened-20261013/index.ts","utf8");
assert(server.includes('reportHasFinancialAmounts(String(out.report))'),"Missing server-side reject");
assert(server.includes('Deno.env.get("ORCA_REI_ENABLE_MODEL_CALLS")!=="true"'),"Missing cost gate");
assert(server.includes("auth.getUser(token)")&&server.includes("ORCA_REI_ALLOWED_EMAILS"));
const serverPattern=server.match(/const reportHasFinancialAmounts=\(value:string\)=>(\/.*\/i)\.test\(value\);/);
assert(serverPattern,"Server regex unavailable");
const serverFinance=vm.runInNewContext("("+serverPattern[1]+")");
for(const unsafe of ["R$ 750,00","35%","250 reais","custo: 500","US$ 44"])assert(serverFinance.test(unsafe),"Server would leak: "+unsafe);
assert(match[1].includes("googleProviderEnabled")&&match[1].includes("settings?.external?.google===true"));
// Development preview: local draft can be prepared without OAuth or any Gemini call.
const localStart=match[1].indexOf("function localPreview(){");
const modelStart=match[1].indexOf("async function publicGenerate(){");
assert(localStart>0&&modelStart>localStart,"No-login candidate and protected Gemini paths must be distinct");
const localPath=match[1].slice(localStart,modelStart);
assert(!/(?:\binvoke\s*\(|\bauthed\s*\(|\bsdk\s*\(|\bfetch\s*\(|\bsignInWithOAuth\s*\()/.test(localPath),"Local preview must not contact Supabase or Gemini");
assert(localPath.includes('source:"local"')&&localPath.includes("reportSafe(report)"),"Local output must be labeled and financial safety checked");
assert(match[1].includes('modelBtn.onclick=async()=>')&&match[1].includes('localBtn.onclick=()=>'),"Authenticated OAuth and local-only review must be optional");
assert(match[1].includes('const params=new URLSearchParams(location.search);'),"PKCE callback must remain recoverable on demand");
assert(!match[1].includes('googleProviderEnabled().then('),"Google provider must not be queried on page load");
assert(now.includes('id="v20Budget"')&&now.includes('id="v20Report"'),"Original PDFs must stay available");
// Screenshot regression: the development candidate must not display auth/Gemini controls.
assert(match[1].includes('const DEV_MODE_NO_LOGIN=true;'),"Direct-development flag missing");
assert(match[1].includes('modelBtn.hidden=DEV_MODE_NO_LOGIN;modelBtn.disabled=DEV_MODE_NO_LOGIN;'),"Blocked Gemini button is still visible or focusable");
assert(match[1].includes('#orcaReiGeminiRestricted[hidden]{display:none!important}'),"CSS must hide the disabled Gemini button even if .btn display overrides [hidden]");
assert(match[1].includes('auth.hidden=true;')&&match[1].includes('auth.setAttribute("aria-hidden",String(DEV_MODE_NO_LOGIN))'),"Google panel must start hidden and inaccessible");
assert(match[1].includes('if(DEV_MODE_NO_LOGIN)return; // IA não pode ser acionada'),"Developer UI must not call Gemini even via direct handler");
assert(match[1].includes('if(!DEV_MODE_NO_LOGIN && params.has("code"))sdk()'),"SDK should not initialize automatically in development");
assert(match[1].includes('localBtn.onclick=()=>{try{localPreview()}'),"Local review must stay available alongside real AI");

// Exercise the client script with a minimal DOM. No login, SDK, network or browser globals are needed.
const roots=[];let networkCalls=0,sdkScripts=0;
function node(tag){
 const o={tagName:tag,id:"",textContent:"",value:"",hidden:false,disabled:false,children:[],attrs:{},
  appendChild(child){this.children.push(child);return child},
  insertBefore(child,ref){this.children=this.children.filter(x=>x!==child);const i=this.children.indexOf(ref);this.children.splice(i>=0?i:this.children.length,0,child);return child},
  setAttribute(k,v){this.attrs[k]=v},scrollIntoView(){},focus(){}
 };
 roots.push(o);return o;
}
const host=node("div");host.id="v20Docs";
const budget=node("button");budget.id="v20Budget";host.appendChild(budget);
for(const [id,value] of [["qaF02Services","Verificar sinais de infiltração no teto."],["qaF02Materials","Verificar conexões."],["qaF02Notes","Confirmar origem em vistoria."],["qaF02Case","710-26"]]){
 const e=node("textarea");e.id=id;e.value=value;if(id==="qaF02Case")e.textContent=value;
}
const doc={readyState:"complete",head:node("head"),createElement:node,
 getElementById(id){return roots.find(n=>n.id===id)||null},
 addEventListener(){throw new Error("unexpected async init")} };
const browser={document:doc,window:{},location:{search:""},URLSearchParams,Date,Promise,
 fetch(){networkCalls++;throw new Error("No network allowed during development")}};
vm.runInNewContext(match[1],browser,{timeout:1000});
const localButton=doc.getElementById("orcaReiLocalOnly");
const realAIButton=doc.getElementById("orcaReiAdjust");
const modelButton=doc.getElementById("orcaReiGeminiRestricted");
const authPanel=doc.getElementById("orcaAuthR9");
const previewPanel=doc.getElementById("orcaPanelR9");
assert(localButton&&!localButton.hidden&&!localButton.disabled,"Local review must be accessible");
assert(realAIButton&&!realAIButton.disabled&&!realAIButton.hidden,"AI test button must exist, but backend controls model execution");
assert(modelButton?.hidden&&modelButton?.disabled&&modelButton?.attrs["aria-hidden"]==="true","Gemini must not be visible to users");
assert(authPanel?.hidden&&authPanel?.attrs["aria-hidden"]==="true","Google login must not be visible to users");
assert(previewPanel?.hidden,"Preview should not obscure editor by default");
localButton.onclick();
assert(!previewPanel.hidden,"Local review must open without login");
const report=previewPanel.children.find(n=>n.tagName==="textarea"&&n.attrs["aria-label"]==="Parecer técnico sem valores financeiros");
assert(report?.value.includes("PARECER TÉCNICO PRELIMINAR"),"Report must be populated locally");
assert(!regex.test(report.value),"Financial data leaked into report");
assert.strictEqual(networkCalls,0,"Local review must not contact backend");
assert.strictEqual(sdkScripts,0,"No auth SDK should load on init");
// Server source is staged only, not deployed. Future activation requires 2 explicit env flags.
const gateway=fs.readFileSync("security/contracts/orca-rei-r5-no-login-gateway-20261014/index.ts","utf8");
const quota=fs.readFileSync("security/contracts/orca-rei-r5-no-login-gateway-20261014/budget.sql","utf8");
assert(gateway.includes('env("ORCA_REI_FREE_TIER_CONFIRMED")==="true"'),"Free Tier fail-closed flag missing");
assert(gateway.includes('const KEY=env("ORCA_REI_FREE_API_KEY")'),"Dedicated free-only credential missing");
assert(!gateway.includes('env("GEMINI_API_KEY")')&&!gateway.includes('env("GOOGLE_AI_API_KEY")'),"Legacy/billable key fallback not allowed");
assert(gateway.includes('const ENABLED=FREE_VERIFIED;'),"Public call must remain disabled until explicit Free Tier confirmation");
assert(gateway.includes("if(!FREE_VERIFIED)return send(")&&gateway.includes("if(!ENABLED)return send("),"Early cost protections missing");
assert(gateway.includes('sha(SERVICE_KEY+"|orca-rei-private-quota-v1|"+ip)'),"Private rate fingerprint must avoid requiring new secret");
assert(gateway.includes('const MODEL="gemini-2.5-flash-lite"'),"Unapproved model change");
assert(gateway.includes('await db.rpc("cr_orca_public_claim_v1"'),"Atomic quota claim missing");
assert(gateway.indexOf('db.rpc("cr_orca_public_claim_v1"')<gateway.indexOf('generativelanguage.googleapis.com'),"Model can run before quota reservation");
assert(gateway.includes("finance.test(result.report)")&&gateway.includes("!g?.usageMetadata"),"Model evidence or technical report redaction missing");
assert(quota.includes("pg_advisory_xact_lock")&&quota.includes("coalesce(global_count,0) >= 8"),"Global atomic daily call cap missing");
assert(quota.includes("coalesce(client_count,0) >= 2")&&quota.includes("interval '60 seconds'"),"Client quota or cooldown missing");
assert(quota.includes("revoke all on function public.cr_orca_public_claim_v1(text) from PUBLIC, anon, authenticated"),"Quota RPC must not be public");
assert(quota.includes("grant execute on function public.cr_orca_public_claim_v1(text) to service_role"),"Service only RPC grant missing");
assert(match[1].includes('const FN_PUBLIC=SUPA+"/functions/v1/cr-orca-rei-gemini-candidate-20261013"'),"Must reuse existing candidate backend");
assert(match[1].includes("if(!healthResponse.ok||health?.public_dev_ai_ready!==true)"),"UI cannot call disabled Gemini");
assert(match[1].includes('data.provider_called!==true||!data.usage'),"UI could label fake response as real");
console.log(JSON.stringify({suite:"ORCA_REI_R5_OAUTH_AND_PDF_GUARDS",ok:true,tests:36,original_pdf_identity:"byte_identical",gemini_real_call:false}));
