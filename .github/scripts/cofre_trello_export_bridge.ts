const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const ID="[0-9a-f]{24}";
const allowed=new RegExp("^(?:/members/me(?:/boards)?|/boards/"+ID+"(?:/(?:cards|lists|labels|actions))?|/cards/"+ID+"/(?:checklists|attachments(?:/"+ID+"/download/[^/]+)?))$");
const queryNames=new Set(["filter","fields","limit","before","attachments","attachment_fields","checklists","customFieldItems"]);
Deno.serve(async(req:Request)=>{
 const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 if(!service||req.headers.get("authorization")!=="Bearer "+service)return json({error:"UNAUTHORIZED"},401);
 if(req.method!=="GET")return json({error:"READ_ONLY"},405);
 const key=Deno.env.get("TRELLO_API_KEY")||"",token=Deno.env.get("TRELLO_API_TOKEN")||"";
 if(!key||!token)return json({error:"TRELLO_SECRETS_MISSING"},412);
 const incoming=new URL(req.url),path=incoming.searchParams.get("path")||"";
 if(path==="/health")return json({ready:true,mode:"GET_ONLY",credentials_exposed:false});
 if(path.length>1024||!allowed.test(path)||path.includes(".."))return json({error:"PATH_NOT_ALLOWED"},400);
 const target=new URL("https://api.trello.com/1"+path);
 for(const [k,v] of incoming.searchParams){
  if(k==="path")continue;
  if(!queryNames.has(k)||v.length>2000)return json({error:"PARAMETER_NOT_ALLOWED"},400);
  target.searchParams.set(k,v);
 }
 const binary=path.includes("/download/");
 try {
  let current=target;
  for(let i=0;i<5;i++){
   const headers:Record<string,string>={accept:binary?"application/octet-stream":"application/json"};
   if(current.hostname==="api.trello.com")headers.Authorization='OAuth oauth_consumer_key="'+key+'", oauth_token="'+token+'"';
   const r=await fetch(current,{method:"GET",headers,redirect:"manual",signal:AbortSignal.timeout(60000)});
   if([301,302,303,307,308].includes(r.status)){
    const location=r.headers.get("location"); if(!location)return json({error:"REDIRECT_INVALID"},502);
    const next=new URL(location,current);
    if(next.protocol!=="https:"||!(next.hostname==="api.trello.com"||next.hostname.endsWith(".trello.com")||next.hostname.endsWith(".amazonaws.com")))return json({error:"REDIRECT_HOST_BLOCKED"},502);
    await r.body?.cancel();current=next;continue;
   }
   if(!r.ok){await r.body?.cancel();return json({error:"TRELLO_UPSTREAM",upstream_status:r.status},r.status);}
   return new Response(r.body,{status:200,headers:{"content-type":binary?"application/octet-stream":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});
  }
  return json({error:"REDIRECT_LIMIT"},502);
 }catch{return json({error:"UPSTREAM_UNAVAILABLE"},502);}
});