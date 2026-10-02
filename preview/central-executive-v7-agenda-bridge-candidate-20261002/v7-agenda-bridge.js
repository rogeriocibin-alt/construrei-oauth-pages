(()=>{'use strict';
if(window.__CR_V7_GC_AGENDA_BRIDGE)return;window.__CR_V7_GC_AGENDA_BRIDGE=true;
const GC_AGENDA='https://gestaoclick.com/agenda/agendamentos';
const GC_SYNC='https://gestaoclick.com/agenda/agendamentos/sincronizar_google_agenda';
const q=id=>document.getElementById(id);
function installStyle(){
 if(q('crV7GcAgendaStyle'))return;
 const s=document.createElement('style');s.id='crV7GcAgendaStyle';s.textContent=
 '#crV7GcAgendaModal{position:fixed;inset:0;z-index:99999;background:rgba(2,9,18,.92);display:none;padding:12px}'+
 '#crV7GcAgendaModal.on{display:grid;grid-template-rows:auto 1fr}'+
 '#crV7GcAgendaBar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:#071a2d;color:#fff;border:1px solid #234761;border-radius:14px 14px 0 0;padding:10px 12px}'+
 '#crV7GcAgendaBar b{margin-right:auto}#crV7GcAgendaBar .cr-v7-btn{border:1px solid #335a74;background:#0c3153;color:#fff;border-radius:9px;padding:8px 10px;text-decoration:none;font-weight:700;cursor:pointer}'+
 '#crV7GcAgendaBar .cr-v7-btn.gold{background:#c59b39;color:#211600;border-color:#e0bd68}'+
 '#crV7GcAgendaFrame{width:100%;height:100%;border:1px solid #234761;border-top:0;border-radius:0 0 14px 14px;background:#fff}'+
 '#crV7GcAgendaHint{font-size:10px;color:#a9c1d2}'+
 '@media(max-width:700px){#crV7GcAgendaModal{padding:0}#crV7GcAgendaBar{border-radius:0;padding:8px}#crV7GcAgendaFrame{border-radius:0}.cr-v7-hide-mobile{display:none!important}}';
 document.head.appendChild(s);
}
function installModal(){
 if(q('crV7GcAgendaModal'))return;
 const m=document.createElement('div');m.id='crV7GcAgendaModal';
 m.innerHTML='<div id="crV7GcAgendaBar"><b>Agenda GestãoClick • fonte operacional</b><span id="crV7GcAgendaHint">Usa sua sessão normal do GestãoClick; a Central não armazena credenciais.</span><a class="cr-v7-btn cr-v7-hide-mobile" target="_blank" rel="noopener" href="'+GC_AGENDA+'">Abrir fora</a><a class="cr-v7-btn gold cr-v7-hide-mobile" target="_blank" rel="noopener" href="'+GC_SYNC+'">Sincronizar Google</a><button id="crV7GcAgendaClose" class="cr-v7-btn" type="button">Fechar</button></div><iframe id="crV7GcAgendaFrame" title="Agenda GestãoClick" referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>';
 document.body.appendChild(m);
 q('crV7GcAgendaClose').onclick=close;
 q('crV7GcAgendaFrame').addEventListener('load',()=>{const h=q('crV7GcAgendaHint');if(h)h.textContent='Agenda carregada no ambiente do GestãoClick. Se aparecer login, autentique-se normalmente no próprio GestãoClick.'});
}
function open(){
 installStyle();installModal();
 const f=q('crV7GcAgendaFrame');if(f&&!f.getAttribute('src'))f.setAttribute('src',GC_AGENDA);
 q('crV7GcAgendaModal').classList.add('on');
 document.body.style.overflow='hidden';
}
function close(){
 q('crV7GcAgendaModal')?.classList.remove('on');document.body.style.overflow='';
}
function installButton(){
 const old=q('crV5AgendaOpen');if(!old||q('crV7GcAgendaOpen'))return;
 const b=document.createElement('button');b.id='crV7GcAgendaOpen';b.type='button';b.className=old.className||'cr-v5-btn';
 b.textContent='Abrir Agenda GestãoClick';b.title='Abre a agenda operacional real do GestãoClick dentro da candidata V7.';
 old.insertAdjacentElement('afterend',b);b.onclick=open;
 const note=q('crV5AgendaNote');
 if(note&&!q('crV7GcAgendaSource')){
   const x=document.createElement('div');x.id='crV7GcAgendaSource';x.className='cr-v5-warn';x.style.marginTop='8px';
   x.innerHTML='<b>Fonte GestãoClick:</b> a API pública de integração não expõe compromissos. A V7 abre o módulo oficial <code>/agenda/agendamentos</code> pela sua própria sessão, sem copiar token. Os KPIs continuam sem número falso enquanto não houver uma fonte de dados automatizável.';
   note.insertAdjacentElement('afterend',x);
 }
}
function init(){installStyle();installModal();installButton();new MutationObserver(installButton).observe(document.documentElement,{childList:true,subtree:true});setInterval(installButton,1800)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();