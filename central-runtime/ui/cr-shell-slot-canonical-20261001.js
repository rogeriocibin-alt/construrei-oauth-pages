(()=>{
 const missions={
  F00:["Captador Inteligente","Captar, organizar e completar"],
  F01:["Atendimento & Qualificação","Qualificar e definir rota"],
  F02:["Cotação & Orçamento","Orçar"],
  F03:["Proposta & Decisão","Formalizar proposta e decisão"],
  F04:["Agenda & Mobilização","Programar execução"],
  F05:["Materiais & Terceiros","Garantir suprimentos"],
  F06:["Campo & Evidências","Executar e registrar"],
  F07:["Qualidade & Aceite","Conferir e fechar tecnicamente"],
  F08:["NF, Cobrança & Resultado","Fechar financeiro"],
  F09:["Pós-venda & Garantia","Acompanhar e garantir"]
 };
 const meta=document.querySelector('meta[name="cr-flow-code"]');
 let code=(meta&&meta.content)||((location.pathname.match(/\/f(0\d)(?:\/|$)/i)||[])[1]||"");
 if(code&&code.length===2)code="F"+code;
 if(!/^F0[0-9]$/.test(code))return;

 document.body.dataset.crFlow=code;
 document.body.dataset.crRouteEnv="canonical-slot-candidate";

 const current=Number(code.slice(1));
 const [title,mission]=missions[code]||[code,""];
 const CENTRAL="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes";
 const FLOW="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento";

 const carry=()=>{
   const p=new URLSearchParams(location.search);
   ["mode","host","_cr","v","rev"].forEach(k=>p.delete(k));
   return p;
 };
 const route=(i)=>{
   const u=new URL(FLOW);
   u.searchParams.set("mode","f"+String(i).padStart(2,"0"));
   carry().forEach((v,k)=>{if(!u.searchParams.has(k))u.searchParams.set(k,v)});
   return u.toString();
 };
 const central=()=>{
   const u=new URL(CENTRAL);
   return u.toString();
 };

 const links=Array.from({length:10},(_,i)=>{
   const c="F"+String(i).padStart(2,"0");
   const cls=i===current?" current":i<current?" done":"";
   return '<a class="cr-flowlink'+cls+'" data-cr-flow-target="'+c+'" href="'+route(i)+'">'+c+'</a>';
 }).join("");

 const bar=document.createElement("div");
 bar.className="cr-shellbar";
 bar.innerHTML='<div class="cr-shelltop"><a class="cr-brand cr-brand-home" href="'+central()+'" aria-label="Voltar à Central"><img class="cr-brand-logo" src="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/construrei-logo?asset=app&rev=app-identity-canonical-20260930" alt="CONSTRU-REI"><span class="constru">CONSTRU</span><span class="rei">REI</span></a><div class="cr-phase"><b>'+code+' — '+title+'</b><span>'+mission+'</span></div></div><nav class="cr-flownav" aria-label="Fluxos F00 a F09">'+links+'</nav><div class="cr-shell-note">Um chamado • um número • uma fase responsável por vez</div>';
 document.body.prepend(bar);

 // Normalize any legacy/runtime handoff links into the already-homologated Central router.
 document.querySelectorAll('a[href*="/central-runtime/f0"],a[href*="central-atendimento?mode=f0"],a[href*="/preview/f0"]').forEach(a=>{
   const href=a.getAttribute("href")||"";
   const m=href.match(/(?:\/f|mode=f)(0\d)/i);
   if(m){
     a.href=route(Number(m[1]));
     a.removeAttribute("target");
     if(/^F0[0-9] atual$/i.test((a.textContent||"").trim())) a.style.display="none";
   }
 });

 const nav=document.createElement("nav");
 nav.className="cr-journey-nav";
 nav.setAttribute("aria-label","Navegação da jornada");
 const prev=current>0?'<a class="cr-journey-btn prev" href="'+route(current-1)+'">← F'+String(current-1).padStart(2,"0")+' Anterior</a>':'<span class="cr-journey-spacer"></span>';
 const next=current<9?'<a class="cr-journey-btn next" href="'+route(current+1)+'">F'+String(current+1).padStart(2,"0")+' Próximo →</a>':'<span class="cr-journey-spacer"></span>';
 nav.innerHTML=prev+'<a class="cr-journey-btn central" href="'+central()+'">← Central</a>'+next;
 const main=document.querySelector("main");
 if(main) main.insertAdjacentElement("afterend",nav); else document.body.appendChild(nav);

 requestAnimationFrame(()=>{
   const cur=bar.querySelector(".cr-flowlink.current");
   if(cur&&cur.scrollIntoView)cur.scrollIntoView({block:"nearest",inline:"center"});
 });
})();