import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const TRELLO="https://api.trello.com/1";
const GC="https://api.gestaoclick.com/api";
const GOOGLE_TOKEN="https://oauth2.googleapis.com/token";
const GOOGLE_CAL="https://www.googleapis.com/calendar/v3";
const CALENDAR_ID="contatoconstrurei@gmail.com";
const SB=Deno.env.get("SUPABASE_URL")||"https://yspuaamokjbrosytqjpg.supabase.co";
const AUTH=SB+"/functions/v1/central-gestao-api";
const BUILD="CR-AGENDA-EXECUTIVE-V9-GOOGLE-CALENDAR-CANDIDATE-20261002";
const H={"content-type":"application/json; charset=utf-8","cache-control":"no-store","access-control-allow-origin":"*","access-control-allow-headers":"content-type,x-cr-session,x-cr-key,authorization","access-control-allow-methods":"GET,OPTIONS","x-content-type-options":"nosniff","x-construrei-build":BUILD,"x-construrei-candidate":"true"};
const J=(d:any,s=200)=>new Response(JSON.stringify(d),{status:s,headers:H});
const sec=(n:string)=>(Deno.env.get(n)||"").trim();
const safe=(v:any,n=300)=>String(v??"").trim().slice(0,n);
const b64url=(bytes:Uint8Array)=>{let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")};
const str64url=(s:string)=>b64url(new TextEncoder().encode(s));
function pemToBytes(pem:string){const raw=pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g,"");const bin=atob(raw);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out}
async function googleAccessToken(){
  const raw=sec("GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON");
  if(!raw)throw Error("GOOGLE_SERVICE_ACCOUNT_SECRET_MISSING");
  let sa:any;try{sa=JSON.parse(raw)}catch{throw Error("GOOGLE_SERVICE_ACCOUNT_SECRET_INVALID_JSON")}
  if(!sa?.client_email||!sa?.private_key)throw Error("GOOGLE_SERVICE_ACCOUNT_FIELDS_MISSING");
  const now=Math.floor(Date.now()/1000),header=str64url(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const payload=str64url(JSON.stringify({iss:sa.client_email,scope:"https://www.googleapis.com/auth/calendar.readonly",aud:sa.token_uri||GOOGLE_TOKEN,iat:now,exp:now+3600}));
  const input=header+"."+payload,key=await crypto.subtle.importKey("pkcs8",pemToBytes(sa.private_key),{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
  const sig=new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,new TextEncoder().encode(input)));
  const body=new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:input+"."+b64url(sig)});
  const r=await fetch(sa.token_uri||GOOGLE_TOKEN,{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body});
  const d=await r.json().catch(()=>({}));if(!r.ok||!d.access_token)throw Error("GOOGLE_TOKEN_FAILED_"+r.status);return d.access_token as string;
}
function spDay(v:any){const d=v instanceof Date?v:new Date(v);if(!Number.isFinite(d.getTime()))return null;return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).format(d)}
function off(day:string,n:number){const d=new Date(day+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function bounds(day:string){return{from:new Date(day+"T00:00:00-03:00").toISOString(),to:new Date(off(day,1)+"T00:00:00-03:00").toISOString()}}
function caseNo(s:any){const x=safe(s,900);let m=x.match(/(?:^|[^0-9])(\d{1,5})\s*-\s*(\d{2})(?:[^0-9]|$)/);if(m)return m[1]+"-"+m[2];m=x.match(/(?:^|[^0-9])(\d{3,5})(\d{2})(?:[^0-9]|$)/);return m?m[1]+"-"+m[2]:null}
function gcCase(v:any){const raw=String(v??"").replace(/\D/g,"");return raw.length>=3?raw.slice(0,-2)+"-"+raw.slice(-2):null}
function classify(e:any){const t=(e.title+" "+(e.description||"")).toUpperCase();if(/GARANTIA/.test(t))return"GARANTIA";if(/RETORNO/.test(t))return"RETORNO";if(/VISTORIA/.test(t))return"VISTORIA";if(/VISITA/.test(t))return"VISITA";if(/EXECU|SERVIÇO|SERVICO|OBRA/.test(t))return"EXECUÇÃO";if(/REUNI|MEET|ALINHAMENTO/.test(t))return"REUNIÃO";return"COMPROMISSO"}
async function googleEvents(day:string){
 const token=await googleAccessToken(),b=bounds(day),u=new URL(GOOGLE_CAL+"/calendars/"+encodeURIComponent(CALENDAR_ID)+"/events"),t=Date.now();
 for(const[k,v]of Object.entries({timeMin:b.from,timeMax:b.to,singleEvents:"true",orderBy:"startTime",maxResults:"250",timeZone:"America/Sao_Paulo"}))u.searchParams.set(k,v);
 const r=await fetch(u,{headers:{authorization:"Bearer "+token,accept:"application/json"},cache:"no-store"}),d=await r.json().catch(()=>({}));
 if(!r.ok)throw Error("GOOGLE_CALENDAR_READ_FAILED_"+r.status);
 const items=(Array.isArray(d.items)?d.items:[]).filter((x:any)=>x.status!=="cancelled").map((x:any)=>{const starts=x.start?.dateTime||(x.start?.date?x.start.date+"T00:00:00-03:00":null),ends=x.end?.dateTime||(x.end?.date?x.end.date+"T00:00:00-03:00":null),text=[x.summary,x.description,x.location].filter(Boolean).join(" ");const base:any={id:x.id,source:"GOOGLE_CALENDAR",case:caseNo(text),title:safe(x.summary||"Compromisso",500),description:safe(x.description,1600)||null,location:safe(x.location,500)||null,starts_at:starts,ends_at:ends,all_day:!!x.start?.date,status:x.status||null,html_link:x.htmlLink||null,organizer:x.organizer?.email||null,transparency:x.transparency||"opaque",visibility:x.visibility||"default",updated:x.updated||null};base.type=classify(base);return base});
 return{ok:true,items,latency_ms:Date.now()-t};
}
async function trelloGet(path:string,p:Record<string,string>={}){const key=sec("TRELLO_API_KEY"),token=sec("TRELLO_API_TOKEN");if(!key||!token)return{ok:false,status:412,body:null,latency_ms:0};const u=new URL(TRELLO+path);u.searchParams.set("key",key);u.searchParams.set("token",token);for(const[k,v]of Object.entries(p))u.searchParams.set(k,v);const t=Date.now();try{const r=await fetch(u,{headers:{accept:"application/json"},cache:"no-store"});return{ok:r.ok,status:r.status,body:await r.json().catch(()=>null),latency_ms:Date.now()-t}}catch{return{ok:false,status:504,body:null,latency_ms:Date.now()-t}}}
async function gcGet(path:string,p:Record<string,string>={}){const access=sec("GESTAOCLICK_ACCESS_TOKEN"),secret=sec("GESTAOCLICK_SECRET_ACCESS_TOKEN");if(!access||!secret)return{ok:false,status:412,body:null,latency_ms:0};const u=new URL(GC+path);for(const[k,v]of Object.entries(p))u.searchParams.set(k,v);const t=Date.now();try{const r=await fetch(u,{headers:{"access-token":access,"secret-access-token":secret,accept:"application/json"},cache:"no-store"});return{ok:r.ok,status:r.status,body:await r.json().catch(()=>null),latency_ms:Date.now()-t}}catch{return{ok:false,status:504,body:null,latency_ms:Date.now()-t}}}
async function gcRows(path:string){const rows:any[]=[];let latency=0;for(let page=1;page<=5;page++){const r=await gcGet(path,{pagina:String(page),limite:"100",ordenacao:"data",direcao:"desc"});latency+=r.latency_ms||0;if(!r.ok)return{ok:false,rows:[],latency_ms:latency};const a=Array.isArray(r.body?.data)?r.body.data:[];rows.push(...a);if(a.length<100)break}return{ok:true,rows,latency_ms:latency}}
async function context(){
 const boards=await trelloGet("/members/me/boards",{fields:"id,name,closed",filter:"open"});let tev:any[]=[];let tmeta:any={ok:false,latency_ms:boards.latency_ms||0};
 if(boards.ok){const board=(Array.isArray(boards.body)?boards.body:[]).find((b:any)=>String(b.name).trim()==="GESTÃO DE OBRAS 2026");if(board){const [lists,cards]=await Promise.all([trelloGet("/boards/"+board.id+"/lists",{fields:"id,name",filter:"open"}),trelloGet("/boards/"+board.id+"/cards",{filter:"open",fields:"id,name,desc,idList,labels,due,start,dateLastActivity,shortUrl",limit:"1000"})]);if(lists.ok&&cards.ok){const lm=new Map((lists.body||[]).map((x:any)=>[x.id,x.name]));tev=(cards.body||[]).map((c:any)=>({case:caseNo(c.name+" "+c.desc),title:c.name,list:lm.get(c.idList)||"",trello_url:c.shortUrl||null,last_activity:c.dateLastActivity||null})).filter((x:any)=>x.case);tmeta={ok:true,board:board.name,latency_ms:(boards.latency_ms||0)+(lists.latency_ms||0)+(cards.latency_ms||0)}}}}
 const[qR,oR]=await Promise.all([gcRows("/orcamentos"),gcRows("/ordens_servicos")]),qmap=new Map<string,any[]>(),omap=new Map<string,any[]>();
 if(qR.ok)for(const x of qR.rows){const k=gcCase(x?.codigo);if(k){if(!qmap.has(k))qmap.set(k,[]);qmap.get(k)!.push(x)}}
 if(oR.ok)for(const x of oR.rows){const k=gcCase(x?.codigo);if(k){if(!omap.has(k))omap.set(k,[]);omap.get(k)!.push(x)}}
 return{tev,tmeta,qR,oR,qmap,omap};
}
function incomplete(e:any){return !e.title||((["VISITA","VISTORIA","EXECUÇÃO","RETORNO","GARANTIA"].includes(e.type))&&!e.location)}
async function assemble(day:string,details:boolean){
 const t=Date.now(),[g,c]=await Promise.all([googleEvents(day),context()]);
 const items=g.items.map((e:any)=>{const tm=e.case?c.tev.find((x:any)=>x.case===e.case):null,q=e.case?(c.qmap.get(e.case)||[]):[],o=e.case?(c.omap.get(e.case)||[]):[];return{...e,trello:tm?{matched:true,list:tm.list,url:tm.trello_url,last_activity:tm.last_activity}:{matched:false},gestaoclick:{matched:!!(q.length||o.length),quote_count:q.length,order_count:o.length,customer:safe(q[0]?.nome_cliente||o[0]?.nome_cliente,220)||null,technician:safe(o[0]?.nome_tecnico||o[0]?.tecnico,180)||null},incomplete:incomplete(e)}}); 
 const times=new Map<string,number>();for(const e of items){const k=e.starts_at+"|"+e.ends_at;times.set(k,(times.get(k)||0)+1)}for(const e of items)e.simultaneous=(times.get(e.starts_at+"|"+e.ends_at)||0)>1;
 const counts:any={events_total:items.length,visits:0,executions:0,returns:0,warranties:0,meetings:0,commitments:0,simultaneous:items.filter((x:any)=>x.simultaneous).length,incomplete:items.filter((x:any)=>x.incomplete).length,without_case:items.filter((x:any)=>!x.case).length,trello_matched:items.filter((x:any)=>x.trello.matched).length,gestaoclick_matched:items.filter((x:any)=>x.gestaoclick.matched).length};
 for(const e of items){if(["VISITA","VISTORIA"].includes(e.type))counts.visits++;else if(e.type==="EXECUÇÃO")counts.executions++;else if(e.type==="RETORNO")counts.returns++;else if(e.type==="GARANTIA")counts.warranties++;else if(e.type==="REUNIÃO")counts.meetings++;else counts.commitments++}
 const base:any={ok:true,build:BUILD,mode:details?"AUTHENTICATED_DETAILS":"PUBLIC_AGGREGATE",date:day,source_policy:{primary_schedule:"GOOGLE_CALENDAR_CONSTRUREI",enrichment:["TRELLO_GESTAO_DE_OBRAS_2026","GESTAOCLICK"],writes_enabled:false},kpis:counts,sources:{google_calendar:{ok:true,calendar_id:CALENDAR_ID,latency_ms:g.latency_ms},trello:c.tmeta,gestaoclick:{ok:c.qR.ok||c.oR.ok,quotes_ok:c.qR.ok,orders_ok:c.oR.ok,latency_ms:(c.qR.latency_ms||0)+(c.oR.latency_ms||0)}},safeguards:{production_untouched:true,candidate_isolated:true,no_fake_zero:true,calendar_read_only:true},checked_at:new Date().toISOString(),latency_ms:Date.now()-t};if(details)base.items=items;return base;
}
async function who(req:Request){const h=new Headers();for(const k of["x-cr-session","x-cr-key","authorization"]){const v=req.headers.get(k);if(v)h.set(k,v)}const r=await fetch(AUTH+"?api=me",{headers:h,cache:"no-store"});const d=await r.json().catch(()=>({}));return r.ok?d:null}
Deno.serve(async(req:Request)=>{if(req.method==="OPTIONS")return new Response("ok",{headers:H});if(req.method!=="GET")return J({ok:false,error:"READ_ONLY_GET_ONLY"},405);const u=new URL(req.url),view=(u.searchParams.get("view")||"public").toLowerCase(),day=u.searchParams.get("date")||spDay(new Date())!;try{if(view==="health"){const g=await googleEvents(day);return J({ok:true,build:BUILD,calendar_id:CALENDAR_ID,google_events:g.items.length,writes_enabled:false})}if(view==="public")return J(await assemble(day,false));if(view==="details"){const actor=await who(req);if(!actor?.role)return J({ok:false,error:"Autenticação necessária para detalhes da agenda.",build:BUILD},401);return J({...await assemble(day,true),profile:actor.profile,role:actor.role})}return J({ok:false,error:"VIEW_NOT_FOUND"},404)}catch(e){return J({ok:false,error:"AGENDA_SOURCE_UNAVAILABLE",detail:e instanceof Error?e.message:String(e),build:BUILD},503)}});