import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const TARGET="https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/central-pendencias-vivas-v3-agent-access-candidate-20261002/";
const BUILD="CR-CENTRAL-PENDENCIAS-VIVAS-UI-V6-REDIRECT-CANDIDATE-20261002";
const H={
  "cache-control":"no-store, no-cache, must-revalidate, max-age=0",
  "pragma":"no-cache",
  "access-control-allow-origin":"*",
  "access-control-allow-methods":"GET,OPTIONS",
  "x-construrei-build":BUILD,
  "x-construrei-candidate":"true"
};
Deno.serve((req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:{...H,"content-type":"text/plain; charset=utf-8"}});
  if(req.method!=="GET"&&req.method!=="HEAD")return new Response("Method not allowed",{status:405,headers:H});
  const incoming=new URL(req.url),loc=new URL(TARGET);
  incoming.searchParams.forEach((v,k)=>loc.searchParams.set(k,v));
  loc.hash=incoming.hash;
  return new Response(null,{status:302,headers:{...H,location:loc.toString()}});
});