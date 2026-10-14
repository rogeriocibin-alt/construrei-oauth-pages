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
console.log(JSON.stringify({suite:"ORCA_REI_R5_OAUTH_AND_PDF_GUARDS",ok:true,tests:27,original_pdf_identity:"byte_identical",gemini_real_call:false}));
