import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BASE="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1";
const RUNTIME=BASE+"/centro-operacoes-runtime-canonico-20261001";
const HOME="https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/central-homologada-exec-r9-20261004/?v=0e13035fb93813834a7c98021eeafa8ab4cec81a";
const BUILD="CR-CENTRAL-EXEC-R9-HOMOLOGADA-20261004";
const H={
  "cache-control":"no-store, no-cache, must-revalidate, max-age=0",
  "pragma":"no-cache",
  "access-control-allow-origin":"*",
  "access-control-allow-headers":"content-type,x-cr-session,x-cr-context-key,x-cr-key,authorization",
  "access-control-allow-methods":"GET,POST,OPTIONS",
  "x-content-type-options":"nosniff",
  "x-construrei-build":BUILD,
  "x-construrei-baseline":"0e13035fb93813834a7c98021eeafa8ab4cec81a",
  "x-construrei-policy":"FORWARD_ONLY_NO_LEGACY_FALLBACK"
};

function redirectHome(u:URL, open?:string){
  const loc=new URL(HOME);
  if(open) loc.searchParams.set("open",open);
  u.searchParams.forEach((v,k)=>{
    if(k!=="open"&&k!=="api"&&!loc.searchParams.has(k)) loc.searchParams.set(k,v);
  });
  return new Response(null,{status:302,headers:{...H,location:loc.toString()}});
}

async function proxy(req:Request,u:URL){
  const target=new URL(RUNTIME);
  target.search=u.search;
  const headers=new Headers(req.headers);
  headers.delete("host");
  let body:BodyInit|undefined;
  if(!["GET","HEAD"].includes(req.method)) body=await req.arrayBuffer();
  const r=await fetch(target,{method:req.method,headers,body,cache:"no-store",redirect:"manual"});
  const out=new Headers(H);
  for(const [k,v] of r.headers){
    const key=k.toLowerCase();
    if(["content-type","content-disposition","location","x-document-code","x-construrei-build","x-construrei-release","x-construrei-auth-lock","x-construrei-route-class"].includes(key)) out.set(k,v);
  }
  const buf=await r.arrayBuffer();
  return new Response(buf,{status:r.status,headers:out});
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:{...H,"content-type":"text/plain"}});
  const u=new URL(req.url);
  const api=(u.searchParams.get("api")||"").toLowerCase();
  if(api) return proxy(req,u);

  const op=(u.searchParams.get("open")||"").toLowerCase();
  const localPages=new Set([
    "dashboard","flows","health","admin","rogerio","technical","eder","acervo",
    "os","apis","presentation","academy","docs","documentation","knowledge",
    "htmls","grc","audit","releases","gaps"
  ]);
  if(!op) return redirectHome(u);
  if(localPages.has(op)) return redirectHome(u,op);
  return proxy(req,u);
});