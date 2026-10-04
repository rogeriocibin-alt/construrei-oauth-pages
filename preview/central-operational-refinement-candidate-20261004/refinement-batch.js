(function(){
'use strict';
if(window.__CR_REFINEMENT_BATCH_20261004)return;window.__CR_REFINEMENT_BATCH_20261004=true;
document.body.classList.add('cr-refinement-batch');
const CORE='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes';
const GEST='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-gestao-api';
const DOC_DRAFT='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-docs-workspace-candidate-20261004';
const MEET_FALLBACK='https://meet.google.com/xtw-rihq-jwi';
const CALL='./call/';
const PRESENTATION='./presentation/';
const SK='crGestaoSession';
let DOCS=[],DOC_FILTER={q:'',cat:'TODOS'},PROFILE=null,lastSession='';
const q=s=>document.querySelector(s),qa=s=>Array.from(document.querySelectorAll(s));
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function session(){return sessionStorage.getItem(SK)||''}
function localShow(id){qa('.page').forEach(x=>x.classList.toggle('on',x.id===id));qa('.nav').forEach(x=>x.classList.toggle('on',x.getAttribute('data-page')===id));const n=q('.nav[data-page="'+id+'"]'),c=q('#crumb');if(c)c.textContent=n?n.textContent.trim():id;const s=q('#side');if(s)s.classList.remove('open');scrollTo(0,0)}
const oldGo=window.go;
window.go=function(id){if(id==='status')id='health';if(['docs','admin','technical','health','meeting','context','presentation'].includes(id)){localShow(id);if(id==='docs')loadDocs();if(id==='health')loadHealth();return}return typeof oldGo==='function'?oldGo(id):localShow(id)};
function patchMenu(){
 const st=q('.nav[data-page="status"]');if(st)st.remove();
 const h=q('.nav[data-page="health"]');if(h)h.innerHTML='<i></i>Saúde e Desenvolvimento'; const dnav=q('.nav[data-page="docs"]');if(dnav)dnav.innerHTML='<i></i>Documentação Viva'; const mnav=q('.nav[data-page="meeting"]');if(mnav)mnav.innerHTML='<i></i>Sala da Equipe'; const pnav=q('.nav[data-page="presentation"]');if(pnav)pnav.innerHTML='<i></i>Apresentação Viva';
 const grp=h&&h.closest('.grp');if(grp){const gt=grp.querySelector('.gt');if(gt)gt.textContent='Sistema'}
 const hp=q('#health');if(hp&&!hp.dataset.crr){hp.dataset.crr='1';hp.innerHTML='<div class="crr-head"><div class="crr-kicker">SISTEMA • EVIDÊNCIAS REAIS</div><h1>Saúde e Desenvolvimento</h1><p class="crr-sub">Estado operacional, versão, fontes e sinais técnicos úteis. Sem percentuais artificiais ou contadores decorativos.</p></div><div id="crrHealthGrid" class="crr-grid"><div class="crr-card"><div class="lab">Carregando</div><div class="val">…</div><div class="meta">Consultando fontes reais</div></div></div><section class="crr-section"><h2>Fontes verificadas</h2><div id="crrHealthSources" class="crr-card"></div></section>'}
}
function card(l,v,m,t){return '<div class="crr-card '+(t||'info')+'"><div class="lab">'+esc(l)+'</div><div class="val">'+esc(v)+'</div><div class="meta">'+esc(m||'')+'</div></div>'}
async function fetchTimed(url,opt){const t=performance.now(),r=await fetch(url,Object.assign({cache:'no-store'},opt||{})),ms=Math.round(performance.now()-t),d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||('HTTP '+r.status));return {d,ms}}
async function loadHealth(){
 patchMenu();const grid=q('#crrHealthGrid'),src=q('#crrHealthSources');if(!grid||!src)return;
 grid.innerHTML=card('Verificação','…','Consultando APIs','info');
 const [pub,dev,gest,ver]=await Promise.allSettled([
   fetchTimed(CORE+'?api=public-summary&t='+Date.now()),
   fetchTimed(CORE+'?api=development-summary&t='+Date.now(),null),
   fetchTimed(GEST+'?api=health&t='+Date.now()),
   fetchTimed('./version.json?t='+Date.now())
 ]);
 const P=pub.status==='fulfilled'?pub.value:null,D=dev.status==='fulfilled'?dev.value:null,G=gest.status==='fulfilled'?gest.value:null,V=ver.status==='fulfilled'?ver.value:null;
 const metrics=P?.d?.metrics||{},docs=Array.isArray(D?.d?.docs)?D.d.docs.length:(Number.isFinite(+metrics.documents)?+metrics.documents:null),gaps=Array.isArray(D?.d?.gaps)?D.d.gaps.filter(x=>!/resolvido|fechado|closed|done/i.test(String(x.status||''))).length:(metrics.gaps_blocking??null);
 const tracker=metrics.tracker_active??metrics.tracker_total??null,release=V?.d?.release||V?.d?.version||G?.d?.release||'Candidata 2026-10-04',lat=P?P.ms:null;
 grid.innerHTML=
   card('Central',P?'ONLINE':'INDISPONÍVEL',P?'public-summary respondeu':'Falha na consulta',P?'ok':'warn')+
   card('API Gestão',G?'ONLINE':'INDISPONÍVEL',G?(G.d.build||'central-gestao-api'):'Sem resposta',G?'ok':'warn')+
   card('Release',release,'Base oficial ccc8e8a4 + refinamento isolado','info')+
   card('Latência Central',lat!=null?lat+' ms':'—','Medição desta abertura',lat!=null&&lat<1500?'ok':'info')+
   card('Documentos',docs!=null?docs:'—','Registros atuais retornados pela fonte técnica','info')+
   card('Gaps abertos',gaps!=null?gaps:'—','Contagem de gaps técnicos não encerrados','info')+
   (tracker!=null?card('Itens ativos',tracker,'Tracker informado pela fonte pública','info'):'');
 const rows=[
   ['Central / public-summary',P?'Respondendo':'Falhou',P?P.ms+' ms':'consulta sem resposta'],
   ['development-summary',D?'Respondendo':'Falhou',D?D.ms+' ms':'consulta sem resposta'],
   ['central-gestao-api',G?'Respondendo':'Falhou',G?G.ms+' ms':'consulta sem resposta'],
   ['GestãoClick','Monitorado no Dashboard Executivo','sem inventar contagem neste painel'],
   ['Trello / automações','Sem telemetria pública dedicada','não inferido'],
   ['Última verificação',new Date().toLocaleString('pt-BR'),'executada no aparelho atual']
 ];
 src.innerHTML=rows.map(r=>'<div class="crr-source"><div><b>'+esc(r[0])+'</b><div class="meta">'+esc(r[2])+'</div></div><span class="crr-state '+(/Falhou|Sem telemetria/.test(r[1])?'muted':'')+'">'+esc(r[1])+'</span></div>').join('');
}
function friendlyContext(raw){
 const s=String(raw||'').toUpperCase();
 if(s.includes('ATENDIMENTO'))return'Atendimento';
 if(s.includes('DIRETORIA'))return'Diretoria';
 if(s.includes('OPERACIONAL')||s.includes('OPERACAO'))return'Operação';
 if(s.includes('FINANCE'))return'Financeiro';
 if(s.includes('TECN'))return'Técnico';
 return raw.replace(/^CR\.AGENT\./i,'').replace(/_/g,' ');
}
function patchContext(){
 const p=q('#context');if(!p)return;
 if(!p.querySelector('.crr-head')){const h=p.querySelector('h1');if(h){const wrap=document.createElement('div');wrap.className='crr-head';wrap.innerHTML='<div class="crr-kicker">INTELIGÊNCIA • CONTEXTO DE DOMÍNIO</div><h1>IA & Context Gateway</h1><p class="crr-sub">Agentes apresentados pela função operacional; identificadores técnicos permanecem disponíveis como referência.</p>';h.replaceWith(wrap)}}
 p.querySelectorAll('#contextCards .card').forEach(c=>{if(c.dataset.crr)return;const h=c.querySelector('h3');if(!h)return;const raw=h.textContent.trim();h.textContent=friendlyContext(raw);const id=document.createElement('small');id.className='crr-tech-id';id.textContent=raw;c.appendChild(id);c.dataset.crr='1'});
}
function patchMeeting(){
 const p=q('#meeting');if(!p||p.dataset.crr)return;p.dataset.crr='1';
 const media=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia),share=!!(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia);
 p.innerHTML='<div class="crr-head"><div class="crr-kicker">EQUIPE • COMUNICAÇÃO INTERNA</div><h1>Sala da Equipe</h1><p class="crr-sub">Central Call é a experiência principal desta candidata. Google Meet permanece como contingência.</p></div><div class="crr-meet-grid"><div class="crr-meet-main"><div><div class="crr-kicker">CENTRAL CALL • WEBRTC + REALTIME</div><h2>Reunião dentro da própria Central</h2><p>Áudio, vídeo, participantes e compartilhamento de tela permanecem no workspace da CONSTRU-REI, sem obrigar a troca de aplicativo.</p></div><div class="crr-actions"><button class="crr-btn gold" onclick="window.crOpenInternalMeeting()">Entrar na sala interna</button><button class="crr-btn light" onclick="window.open(MEET_FALLBACK,\'_blank\',\'noopener,noreferrer\')">Google Meet • contingência</button></div></div><div class="crr-meet-side"><h3>Compatibilidade deste aparelho</h3><div class="crr-cap"><span><b>Contexto seguro</b><em>'+(window.isSecureContext?'disponível':'indisponível')+'</em></span><span><b>Câmera / microfone</b><em>'+(media?'disponível':'indisponível')+'</em></span><span><b>Compartilhar tela</b><em>'+(share?'disponível':'dependente do navegador')+'</em></span></div><p class="mut">O diagnóstico final de mídia acontece ao entrar na sala e depende das permissões do navegador.</p></div></div>';
}
window.MEET_FALLBACK=MEET_FALLBACK;
window.crOpenInternalMeeting=function(){const f=q('#workspaceFrame'),t=q('#workspaceTitle'),a=q('#workspaceExternal');if(t)t.textContent='Central Call • Sala da Equipe';if(f){f.setAttribute('allow','camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write');f.setAttribute('allowfullscreen','');f.src=CALL}if(a){a.href=CALL;a.rel='noopener'}localShow('workspace')};
function patchQuickMeeting(){
 qa('.cr-quick-card').forEach(c=>{if(!/Google Meet|Sala da Equipe/i.test(c.textContent))return;const h=c.querySelector('h3');if(h)h.textContent='Sala da Equipe';const p=c.querySelector('p');if(p)p.textContent='Reunião interna • câmera, áudio e tela.';c.dataset.crrMeeting='1'});
}
function patchQuickPresentation(){
 qa('.cr-quick-card').forEach(c=>{if(!/^Apresentação$/i.test((c.querySelector('h3')?.textContent||'').trim()))return;const p=c.querySelector('p');if(p)p.textContent='Apresentação executiva viva • PDF e PowerPoint.';c.dataset.crrPresentation='1'});
}
document.addEventListener('click',function(e){const c=e.target.closest('.cr-quick-card[data-crr-meeting="1"]');if(c){e.preventDefault();e.stopImmediatePropagation();window.crOpenInternalMeeting();return}const p=e.target.closest('.cr-quick-card[data-crr-presentation="1"]');if(p){e.preventDefault();e.stopImmediatePropagation();window.crOpenPresentation()}},true);
function classify(d){
 const s=[d.category,d.doc_type,d.title,(d.tags||[]).join(' ')].join(' ').toLowerCase();
 if(/release|homolog|checkpoint|decis/.test(s))return'Homologações & Releases';
 if(/api|schema|arquitet|infra/.test(s))return'APIs & Arquitetura';
 if(/app/.test(s))return'Aplicativo';
 if(/f0[0-9]|operação|operacao|campo|atendimento|orçamento|orcamento/.test(s))return'Operação';
 if(/hist|snapshot|acervo/.test(s))return'Histórico & Acervo';
 if(/central|dashboard/.test(s))return'Central';
 return'Desenvolvimento';
}
async function me(){
 const s=session();if(!s)return null;
 try{const r=await fetch(GEST+'?api=me',{headers:{'x-cr-session':s},cache:'no-store'});const d=await r.json();return r.ok&&d.ok?d:null}catch{return null}
}
function docsShell(){
 const p=q('#docs');if(!p)return;
 if(p.dataset.crr)return;p.dataset.crr='1';
 p.innerHTML='<div class="crr-head"><div class="crr-kicker">BASE TÉCNICA • BIBLIOTECA VIVA</div><h1>Documentação CONSTRU-REI</h1><p class="crr-sub">Central, Aplicativo, Operação, Desenvolvimento, arquitetura, homologações e histórico em uma única biblioteca.</p></div><div id="crrDocAccess" class="crr-access"><div><strong>Verificando acesso…</strong><small>Rogério e Éder usam uma sessão administrativa única, sem travas repetidas.</small></div></div><div class="crr-doc-toolbar"><input id="crrDocSearch" class="crr-input" placeholder="Buscar documento, código, resumo ou tag…"><select id="crrDocCategory" class="crr-input"><option value="TODOS">Todas as áreas</option></select></div><div id="crrDocCats" class="crr-doc-cats"></div><div id="crrDocCount" class="mut" style="margin:4px 0 9px"></div><div id="crrDocGrid" class="crr-doc-grid"><div class="crr-card">Carregando documentação…</div></div><div id="crrDocModal" class="crr-modal" onclick="if(event.target===this)this.classList.remove(\'on\')"><div class="crr-modalbox"><div id="crrDocModalBody"></div></div></div>';
 q('#crrDocSearch').addEventListener('input',e=>{DOC_FILTER.q=e.target.value;renderDocs()});q('#crrDocCategory').addEventListener('change',e=>{DOC_FILTER.cat=e.target.value;renderDocs()});
}
function accessBox(){
 const h=q('#crrDocAccess');if(!h)return;
 if(PROFILE){h.innerHTML='<div><strong>'+esc(PROFILE.profile||PROFILE.role)+'</strong><small>Acesso administrativo ativo • visualizar, pesquisar, baixar e editar em rascunho versionado.</small></div><span class="crr-state">ACESSO TOTAL ATIVO</span>';return}
 h.innerHTML='<div><strong>Catálogo visível • ações administrativas aguardam sua sessão</strong><small>Faça um único acesso como Rogério ou Éder; a biblioteca não pedirá nova chave a cada documento.</small></div><div class="crr-actions"><button class="crr-btn gold" onclick="window.go(\'admin\')">Rogério</button><button class="crr-btn" onclick="window.go(\'technical\')">Éder</button></div>';
}
async function loadDocs(){
 docsShell();PROFILE=await me();accessBox();
 try{
   if(PROFILE){const r=await fetch(GEST+'?api=docs-full',{headers:{'x-cr-session':session()},cache:'no-store'}),d=await r.json();if(!r.ok)throw new Error(d.error||'Falha ao carregar');DOCS=d.docs||[]}
   else {const r=await fetch(CORE+'?api=development-summary&t='+Date.now(),{cache:'no-store'}),d=await r.json();DOCS=d.docs||[]}
 }catch(e){const g=q('#crrDocGrid');if(g)g.innerHTML='<div class="crr-card warn"><b>Documentação temporariamente indisponível</b><p>'+esc(e.message)+'</p></div>';return}
 const cats=['TODOS',...Array.from(new Set(DOCS.map(classify))).sort()];const sel=q('#crrDocCategory'),chips=q('#crrDocCats');if(sel)sel.innerHTML=cats.map(x=>'<option value="'+esc(x)+'">'+(x==='TODOS'?'Todas as áreas':esc(x))+'</option>').join('');if(chips)chips.innerHTML=cats.map(x=>'<button class="crr-chip '+(x===DOC_FILTER.cat?'on':'')+'" data-cat="'+esc(x)+'">'+(x==='TODOS'?'Tudo':esc(x))+'</button>').join('');chips?.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{DOC_FILTER.cat=b.dataset.cat;sel.value=DOC_FILTER.cat;renderDocs()});renderDocs()
}
function renderDocs(){
 const grid=q('#crrDocGrid');if(!grid)return;const z=DOC_FILTER.q.trim().toLowerCase();const a=DOCS.filter(d=>(DOC_FILTER.cat==='TODOS'||classify(d)===DOC_FILTER.cat)&&(!z||JSON.stringify([d.code,d.title,d.summary,d.category,d.tags]).toLowerCase().includes(z)));q('#crrDocCount').textContent=a.length+' documento(s) exibido(s) • '+DOCS.length+' no catálogo carregado';qa('#crrDocCats .crr-chip').forEach(b=>b.classList.toggle('on',b.dataset.cat===DOC_FILTER.cat));
 grid.innerHTML=a.map(d=>'<article class="crr-doc"><div class="crr-kicker">'+esc(classify(d))+'</div><h3>'+esc(d.title||d.code)+'</h3><div class="meta">'+esc(d.code||'')+' • '+esc(d.version_label||d.status||'')+'</div><p>'+esc(d.summary||'Sem resumo cadastrado.')+'</p><div class="crr-doc-actions"><button class="crr-btn light" data-doc-open="'+esc(d.code)+'">Visualizar</button>'+(PROFILE?'<button class="crr-btn" data-doc-down="'+esc(d.code)+'">Baixar</button><button class="crr-btn gold" data-doc-edit="'+esc(d.code)+'">Editar</button>':'')+'</div></article>').join('')||'<div class="crr-card">Nenhum documento corresponde aos filtros.</div>';
 grid.querySelectorAll('[data-doc-open]').forEach(b=>b.onclick=()=>openDoc(b.dataset.docOpen,false));grid.querySelectorAll('[data-doc-edit]').forEach(b=>b.onclick=()=>openDoc(b.dataset.docEdit,true));grid.querySelectorAll('[data-doc-down]').forEach(b=>b.onclick=()=>downloadDoc(b.dataset.docDown));
}
function docBy(code){return DOCS.find(d=>String(d.code)===String(code))}
function openDoc(code,edit){const d=docBy(code),m=q('#crrDocModal'),b=q('#crrDocModalBody');if(!d||!m||!b)return;const content=d.content_text||d.summary||'Sem conteúdo textual indexado.';if(!edit){b.innerHTML='<h2>'+esc(d.title||d.code)+'</h2><p class="mut">'+esc(d.code)+' • '+esc(d.category||'')+'</p><pre style="white-space:pre-wrap;word-break:break-word;color:#17315d;line-height:1.5">'+esc(content)+'</pre><div class="crr-actions"><button class="crr-btn light" onclick="this.closest(\'.crr-modal\').classList.remove(\'on\')">Fechar</button></div>'}else{b.innerHTML='<h2>Editar • '+esc(d.code)+'</h2><p class="mut">Nesta candidata, a edição é salva como <b>rascunho versionado</b>. O documento canônico permanece intacto até homologação.</p><input id="crrEditTitle" class="crr-input" value="'+esc(d.title||'')+'"><textarea id="crrEditContent">'+esc(content)+'</textarea><input id="crrEditReason" class="crr-input" placeholder="Motivo da alteração" value="Revisão pela Central"><div class="crr-actions"><button class="crr-btn gold" id="crrSaveDraft">Salvar rascunho</button><button class="crr-btn light" onclick="this.closest(\'.crr-modal\').classList.remove(\'on\')">Cancelar</button></div><div id="crrEditMsg" class="mut" style="margin-top:8px"></div>';q('#crrSaveDraft').onclick=()=>saveDraft(d.code)}m.classList.add('on')}
async function downloadDoc(code){try{const r=await fetch(GEST+'?api=doc-download&code='+encodeURIComponent(code),{headers:{'x-cr-session':session()},cache:'no-store'});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||'Falha no download');const blob=await r.blob(),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='CONSTRU-REI-'+code+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}catch(e){alert(e.message)}}
async function saveDraft(code){const msg=q('#crrEditMsg'),btn=q('#crrSaveDraft');if(btn)btn.disabled=true;if(msg)msg.textContent='Salvando rascunho versionado…';try{const r=await fetch(DOC_DRAFT+'?api=draft',{method:'POST',headers:{'content-type':'application/json','x-cr-session':session()},body:JSON.stringify({code,title:q('#crrEditTitle').value,content_text:q('#crrEditContent').value,reason:q('#crrEditReason').value})}),d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Edição candidata ainda não disponível');if(msg)msg.innerHTML='<b style="color:#07814b">Rascunho salvo.</b> Documento canônico não foi alterado.'}catch(e){if(msg)msg.innerHTML='<b style="color:#b22">Não foi possível salvar:</b> '+esc(e.message)}finally{if(btn)btn.disabled=false}}
function patchPresentation(){const p=q('#presentationCard');if(!p)return;p.innerHTML='<div class="tag">APRESENTAÇÃO VIVA • CANDIDATA REFINADA</div><h2>CONSTRU-REI • Apresentação Executiva Viva</h2><p class="mut">Layout responsivo revisado para celular e desktop, preservando atualização, PDF e PowerPoint.</p><div class="actions"><button class="btn primary" onclick="window.crOpenPresentation()">Abrir aqui</button><button class="btn" onclick="window.open(PRESENTATION,\'_blank\')">Nova aba</button></div>'}
window.crOpenPresentation=function(){const f=q('#workspaceFrame'),t=q('#workspaceTitle'),a=q('#workspaceExternal');if(t)t.textContent='Apresentação Executiva Viva';if(f){f.setAttribute('allow','clipboard-read; clipboard-write; fullscreen');f.src=PRESENTATION}if(a)a.href=PRESENTATION;localShow('workspace')};
function applyOpen(){let id=new URLSearchParams(location.search).get('open')||String(location.hash||'').replace(/^#/,'');if(!id)return;if(id==='status')id='health';if(['health','meeting','docs','context','presentation','admin','technical'].includes(id))window.go(id)}
function tick(){patchMenu();patchContext();patchMeeting();patchQuickMeeting();patchQuickPresentation();patchPresentation();const s=session();if(s!==lastSession){lastSession=s;if(q('#docs.page.on'))loadDocs()}}
document.addEventListener('click',function(e){const n=e.target.closest('[data-page],[data-page-target]');if(!n)return;let id=n.getAttribute('data-page')||n.getAttribute('data-page-target');if(id==='status')id='health';if(id==='health')setTimeout(loadHealth,30);if(id==='docs')setTimeout(loadDocs,30);if(id==='context')setTimeout(patchContext,60);if(id==='meeting')setTimeout(patchMeeting,30);if(id==='presentation')setTimeout(patchPresentation,30)},true);
document.addEventListener('DOMContentLoaded',()=>{tick();applyOpen();setTimeout(tick,250);setTimeout(()=>{if(q('#health.page.on'))loadHealth();if(q('#docs.page.on'))loadDocs()},500)});setInterval(tick,1200);
(function loadNavStability(){if(document.querySelector('script[data-cr-nav-stability]'))return;const s=document.createElement('script');s.src='./navigation-stability.js?v=20261004-r2';s.defer=true;s.dataset.crNavStability='r2';document.head.appendChild(s)})();
(function loadAgendaSmartText(){if(document.querySelector('script[data-cr-agenda-smart-text]'))return;const s=document.createElement('script');s.src='./agenda-smart-text.js?v=20261004-r4';s.defer=true;s.dataset.crAgendaSmartText='r1';document.head.appendChild(s)})();
})();