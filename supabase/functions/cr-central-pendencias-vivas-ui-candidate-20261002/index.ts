import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BUILD="CR-CENTRAL-PENDENCIAS-VIVAS-UI-V3-CANDIDATE-20261002";
const SOURCE="https://raw.githubusercontent.com/rogeriocibin-alt/construrei-oauth-pages/cr-pendencias-vivas-candidate-20261002/preview/central-pendencias-vivas-candidate-20261002/index.html";

Deno.serve(async(req:Request)=>{
  if(req.method!=="GET"&&req.method!=="HEAD")return new Response("Method not allowed",{status:405});
  try{
    const r=await fetch(SOURCE+"?t="+Date.now(),{cache:"no-store"});
    if(!r.ok)return new Response("Candidate source unavailable: HTTP "+r.status,{status:502});
    const html=await r.text();
    return new Response(req.method==="HEAD"?null:html,{
      status:200,
      headers:{
        "content-type":"text/html; charset=utf-8",
        "cache-control":"no-store, no-cache, must-revalidate, max-age=0",
        "pragma":"no-cache",
        "x-construrei-build":BUILD,
        "x-construrei-candidate":"true",
        "x-construrei-source-branch":"cr-pendencias-vivas-candidate-20261002"
      }
    });
  }catch(e){
    return new Response("Candidate source error: "+(e instanceof Error?e.message:String(e)),{status:502});
  }
});