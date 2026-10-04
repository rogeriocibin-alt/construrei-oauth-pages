(function(){
'use strict';
if(window.__CR_NAV_STABILITY_20261004_R2)return;
window.__CR_NAV_STABILITY_20261004_R2=true;

const CORE='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes';
const GEST='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-gestao-api';
const APP='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento?mode=app';
const FIN='https://rogeriocibin-alt.github.io/construrei-oauth-pages/central-runtime/dashboard/?rev=dashboard-v14-protected-20260929-2258';
const FLOWS='https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/flow-canonical-20261001/f00/';
const STACK_KEY='crCentralNavStackR2';
const LAST_KEY='crCentralLastPageR2';
const q=s=>document.querySelector(s);
const qa=s=>Array.from(document.querySelectorAll(s));
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function currentPage(){
  const x=q('.page.on');
  return x?x.id:'dashboard';
}
function readStack(){
  try{const x=JSON.parse(sessionStorage.getItem(STACK_KEY)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}
}
function writeStack(a){
  try{sessionStorage.setItem(STACK_KEY,JSON.stringify(a.slice(-40)))}catch(_){}
}
function pushPage(id){
  if(!id||id==='workspace')return;
  const a=readStack();
  if(a[a.length-1]!==id)a.push(id);
  writeStack(a);
}
function closeMenu(){
  const s=q('#side');if(s)s.classList.remove('open');
  const shade=q('#crMenuShade');if(shade)shade.classList.remove('on');
  document.body.classList.remove('cr-menu-open');
}
function updateCrumb(id){
  const c=q('#crumb');
  const n=q('.nav[data-page="'+id+'"]');
  if(c)c.textContent=n?n.textContent.trim():(id==='workspace'?'Workspace':id);
}
function showLocal(id,remember=true){
  if(id==='status')id='health';
  const target=document.getElementById(id);
  if(!target||!target.classList.contains('page'))return false;
  const now=currentPage();
  if(remember&&now!==id&&now!=='workspace')pushPage(now);
  qa('.page').forEach(x=>x.classList.toggle('on',x.id===id));
  qa('.nav[data-page]').forEach(x=>x.classList.toggle('on',x.getAttribute('data-page')===id));
  updateCrumb(id);
  closeMenu();
  try{sessionStorage.setItem(LAST_KEY,id)}catch(_){}
  window.scrollTo({top:0,left:0,behavior:'auto'});
  if(id==='health')setTimeout(loadHealthSafe,25);
  return true;
}
function setWorkspace(title,url,origin){
  const now=currentPage();
  if(now!=='workspace')pushPage(now);
  const frame=q('#workspaceFrame'),ttl=q('#workspaceTitle'),ext=q('#workspaceExternal');
  if(ttl)ttl.textContent=title||'Workspace';
  if(frame){
    frame.setAttribute('allow','clipboard-read; clipboard-write; camera; microphone; display-capture; fullscreen');
    frame.setAttribute('allowfullscreen','');
    frame.src=url;
  }
  if(ext){ext.href=url;ext.rel='noopener noreferrer'}
  window.WORKURL=url;
  try{sessionStorage.setItem('crCentralWorkspaceUrlR2',url);sessionStorage.setItem('crCentralWorkspaceTitleR2',title||'Workspace')}catch(_){}
  showLocal('workspace',false);
  updateCrumb('workspace');
}
function isInternalUrl(url){
  try{
    const u=new URL(url,location.href);
    if(u.hostname==='rogeriocibin-alt.github.io'&&u.pathname.includes('/construrei-oauth-pages/'))return true;
    if(u.hostname==='yspuaamokjbrosytqjpg.supabase.co'&&u.pathname.includes('/functions/v1/'))return true;
    return false;
  }catch(_){return false}
}
function route(id){
  id=String(id||'').trim();
  if(!id)return;
  if(id==='status')id='health';
  if(id==='flows'){setWorkspace('Esteira F00 → F09',FLOWS,'flows');return}
  if(id==='app'){setWorkspace('APP CONSTRU-REI',APP,'app');return}
  if(id==='finance'){setWorkspace('Dashboard Financeiro V4',FIN,'dashboard');return}
  if(showLocal(id,true))return;
}
function goBack(){
  closeMenu();
  if(currentPage()==='workspace'){
    const f=q('#workspaceFrame');if(f)f.src='about:blank';
  }
  const a=readStack();
  let target=a.pop()||'dashboard';
  writeStack(a);
  if(target==='workspace'||!document.getElementById(target))target='dashboard';
  showLocal(target,false);
}
function goHome(){
  writeStack([]);
  const f=q('#workspaceFrame');if(f&&currentPage()==='workspace')f.src='about:blank';
  showLocal('dashboard',false);
}
function openInternalResource(title,url,origin){
  if(!url)return;
  if(isInternalUrl(url)){setWorkspace(title||'Workspace',url,origin);return}
  // External services remain explicit; internal CONSTRU-REI never abandons the shell.
  window.open(url,'_blank','noopener,noreferrer');
}
function toggleMenu(){
  const s=q('#side');if(!s)return;
  s.classList.toggle('open');
  const open=s.classList.contains('open');
  let shade=q('#crMenuShade');
  if(!shade){shade=document.createElement('div');shade.id='crMenuShade';shade.className='cr-menu-shade';document.body.appendChild(shade);shade.addEventListener('click',closeMenu)}
  shade.classList.toggle('on',open);
  document.body.classList.toggle('cr-menu-open',open);
}

async function fetchJsonTimed(url,timeoutMs=5000,headers){
  const ac=new AbortController();
  const tm=setTimeout(()=>ac.abort(),timeoutMs);
  const t=performance.now();
  try{
    const r=await fetch(url,{cache:'no-store',headers:headers||{},signal:ac.signal});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.error||('HTTP '+r.status));
    return {ok:true,d,ms:Math.round(performance.now()-t)};
  }finally{clearTimeout(tm)}
}
function healthCard(label,value,meta,tone){
  return '<div class="crr-card '+(tone||'info')+'"><div class="lab">'+esc(label)+'</div><div class="val">'+esc(value)+'</div><div class="meta">'+esc(meta||'')+'</div></div>';
}
async function loadHealthSafe(){
  const grid=q('#crrHealthGrid'),src=q('#crrHealthSources');
  if(!grid||!src)return;
  grid.innerHTML=healthCard('Verificação','EM ANDAMENTO','Consultas protegidas por timeout; a tela não fica mais travada.','info');
  src.innerHTML='<div class="crr-source"><div><b>Inicializando</b><div class="meta">Leitura fail-safe</div></div><span class="crr-state">consultando</span></div>';
  const urls=[
    ['Central / public-summary',CORE+'?api=public-summary&t='+Date.now(),5000],
    ['Development summary',CORE+'?api=development-summary&t='+Date.now(),5000],
    ['API Gestão',GEST+'?api=health&t='+Date.now(),5000],
    ['Release local',new URL('./version.json?t='+Date.now(),location.href).toString(),3500]
  ];
  const settled=await Promise.allSettled(urls.map(x=>fetchJsonTimed(x[1],x[2])));
  const vals=settled.map((s,i)=>s.status==='fulfilled'?s.value:{ok:false,error:(s.reason&&s.reason.name==='AbortError')?'timeout':(s.reason?.message||'falha')});
  const P=vals[0].ok?vals[0]:null,D=vals[1].ok?vals[1]:null,G=vals[2].ok?vals[2]:null,V=vals[3].ok?vals[3]:null;
  const metrics=P?.d?.metrics||{};
  const docs=Array.isArray(D?.d?.docs)?D.d.docs.length:(Number.isFinite(+metrics.documents)?+metrics.documents:null);
  const gaps=Array.isArray(D?.d?.gaps)?D.d.gaps.filter(x=>!/resolvido|fechado|closed|done/i.test(String(x.status||''))).length:(metrics.gaps_blocking??null);
  const tracker=metrics.tracker_active??metrics.tracker_total??null;
  const release=V?.d?.release||V?.d?.version||G?.d?.release||'Candidata 2026-10-04';
  const anyOk=!!(P||D||G||V);
  grid.innerHTML=
    healthCard('Central',P?'ONLINE':'ATENÇÃO',P?('public-summary • '+P.ms+' ms'):'Sem resposta dentro do limite',P?'ok':'warn')+
    healthCard('API Gestão',G?'ONLINE':'ATENÇÃO',G?((G.d.build||'central-gestao-api')+' • '+G.ms+' ms'):'Sem resposta dentro do limite',G?'ok':'warn')+
    healthCard('Release',release,'Candidata isolada • navegação R2','info')+
    healthCard('Latência Central',P?(P.ms+' ms'):'—','Medição desta abertura',P&&P.ms<1500?'ok':'info')+
    healthCard('Documentos',docs!=null?docs:'—','Registros retornados pela fonte técnica','info')+
    healthCard('Gaps abertos',gaps!=null?gaps:'—','Sem inventar valor quando a fonte falha','info')+
    (tracker!=null?healthCard('Itens ativos',tracker,'Tracker informado pela fonte pública','info'):'')+
    healthCard('Leitura',anyOk?'PARCIAL/OK':'DEGRADADA','Mesmo com falha de API a navegação permanece utilizável',anyOk?'ok':'warn');
  src.innerHTML=urls.map((x,i)=>{
    const v=vals[i],ok=!!v.ok;
    return '<div class="crr-source"><div><b>'+esc(x[0])+'</b><div class="meta">'+esc(ok?(v.ms+' ms'):(v.error||'sem resposta'))+'</div></div><span class="crr-state '+(ok?'':'muted')+'">'+(ok?'Respondendo':'Indisponível')+'</span></div>';
  }).join('')+
  '<div class="crr-source"><div><b>Última verificação</b><div class="meta">executada neste aparelho</div></div><span class="crr-state">'+esc(new Date().toLocaleString('pt-BR'))+'</span></div>';
}

function intercept(e){
  const t=e.target.closest('#crBackBtn,#crHomeBtn,#crMenuBtn,#crTopBack,#crAppCanonicalNav,#crFinanceDashNav,.nav[data-page],[data-action="go"],[data-action="resource"],a[href]');
  if(!t)return;
  if(t.id==='crBackBtn'||t.id==='crTopBack'){e.preventDefault();e.stopImmediatePropagation();goBack();return}
  if(t.id==='crHomeBtn'){e.preventDefault();e.stopImmediatePropagation();goHome();return}
  if(t.id==='crMenuBtn'){e.preventDefault();e.stopImmediatePropagation();toggleMenu();return}
  if(t.id==='crAppCanonicalNav'){e.preventDefault();e.stopImmediatePropagation();setWorkspace('APP CONSTRU-REI',APP,'app');return}
  if(t.id==='crFinanceDashNav'){e.preventDefault();e.stopImmediatePropagation();setWorkspace('Dashboard Financeiro V4',FIN,'dashboard');return}
  if(t.matches('.nav[data-page]')){e.preventDefault();e.stopImmediatePropagation();route(t.getAttribute('data-page'));return}
  if(t.matches('[data-action="go"]')){e.preventDefault();e.stopImmediatePropagation();route(t.getAttribute('data-page-target'));return}
  if(t.matches('[data-action="resource"]')){
    const url=t.getAttribute('data-url')||'';
    if(isInternalUrl(url)){e.preventDefault();e.stopImmediatePropagation();openInternalResource(t.getAttribute('data-title'),url,t.getAttribute('data-origin'));return}
    return;
  }
  if(t.matches('a[href]')){
    const href=t.getAttribute('href')||'';
    if(!href||href.startsWith('#')||t.hasAttribute('download'))return;
    const abs=new URL(href,location.href).toString();
    if(isInternalUrl(abs)&&!t.closest('#workspaceExternal')){
      e.preventDefault();e.stopImmediatePropagation();setWorkspace((t.textContent||'Workspace').trim(),abs,'link');
    }
  }
}

document.addEventListener('click',intercept,true);
window.go=route;
window.openResource=openInternalResource;
window.backWorkspace=goBack;
window.crCanonicalBack=goBack;
window.toggleSide=toggleMenu;
window.crLoadHealthSafe=loadHealthSafe;

function init(){
  const dock=q('#crMobileDock');
  if(dock){
    dock.setAttribute('aria-label','Navegação persistente da Central');
    dock.dataset.navStability='r2';
  }
  const app=q('#crAppCanonicalNav');if(app){app.removeAttribute('onclick');app.setAttribute('data-cr-route','app')}
  const fin=q('#crFinanceDashNav');if(fin){fin.removeAttribute('onclick');fin.setAttribute('data-cr-route','finance')}
  const ws=q('#workspace .notice.section');if(ws)ws.textContent='A Central permanece aberta durante a navegação. Use Voltar, Início ou Menu a qualquer momento.';
  const ext=q('#workspaceExternal');if(ext)ext.title='Abrir fora da Central somente quando necessário';
  if(currentPage()==='health')loadHealthSafe();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();