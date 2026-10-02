import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const BUILD="CR-CENTRAL-PENDENCIAS-VIVAS-UI-V5-CANDIDATE-20261002";
const PAGE=await Deno.readTextFile(new URL("./page.html",import.meta.url));
Deno.serve((req:Request)=>{
  if(req.method!=="GET"&&req.method!=="HEAD")return new Response("Method not allowed",{status:405});
  return new Response(req.method==="HEAD"?null:PAGE,{
    status:200,
    headers:{
      "Content-Type":"text/html; charset=utf-8",
      "Cache-Control":"no-store, no-cache, must-revalidate, max-age=0",
      "Pragma":"no-cache",
      "X-Content-Type-Options":"nosniff",
      "X-Construrei-Build":BUILD,
      "X-Construrei-Candidate":"true",
      "X-Construrei-Source-Branch":"cr-pendencias-vivas-candidate-20261002"
    }
  });
});