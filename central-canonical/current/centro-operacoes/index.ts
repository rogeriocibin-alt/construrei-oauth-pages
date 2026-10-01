import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BASE="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1";
const RUNTIME=BASE+"/centro-operacoes-runtime-canonico-20261001";
const HOME="https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/central-homologada-20261001/";
const BUILD="CR-CENTRAL-HOMOLOGADA-LOCKED-20261001";
const H={
  "cache-control":"no-store, no-cache, must-revalidate, max-age=0",
  "pragma":"no-cache",
  "access-control-allow-origin":"*",
  "access-control-allow-headers":"content-type,x-cr-session,x-cr-context-key,x-cr-key,authorization",
  "access-control-allow-methods":"GET,POST,OPTIONS",
  "x-content-type-options":"nosniff",
  "x-construrei-build":BUILD,
  "x-construrei-baseline":"92ef8f27d71ac176abc6452df165a048c4405d60",
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

  // Páginas que pertencem à HOME aprovada
  const localPages=new Set([
    "dashboard","flows","health","admin","rogerio","technical","eder","acervo",
    "os","apis","presentation","academy","docs","documentation","knowledge",
    "htmls","grc","audit","releases","gaps"
  ]);
  if(!op) return redirectHome(u);
  if(localPages.has(op)) return redirectHome(u,op);

  // Rotas operacionais diretas preservadas pelo runtime canônico homologado
  return proxy(req,u);
});