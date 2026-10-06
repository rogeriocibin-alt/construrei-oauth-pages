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
 let code=(meta&&meta.content)||((location.pathname.match(/\/f(0\d)-canonical-ui-20261001\//i)||[])[1]||"");
 if(code&&code.length===2)code="F"+code;
 if(!/^F0[0-9]$/.test(code))return;
 document.body.dataset.crFlow=code;
 document.body.dataset.crRouteEnv="canonical";
 if(!document.getElementById("crBrandHeadV1")){
   const marker=document.createElement("meta");marker.id="crBrandHeadV1";marker.name="cr-brand";marker.content="CR-BRAND-CANONICAL-V1-20261006";document.head.appendChild(marker);
   const f32=document.createElement("link");f32.rel="icon";f32.type="image/png";f32.sizes="32x32";f32.href="https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/brand/construrei-app-v2/favicon-32.png?v=brand-v2";document.head.appendChild(f32);
   const apple=document.createElement("link");apple.rel="apple-touch-icon";apple.sizes="180x180";apple.href="https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/brand/construrei-app-v2/apple-touch-icon.png?v=brand-v2";document.head.appendChild(apple);
 }

 const current=Number(code.slice(1));
 const [title,mission]=missions[code]||[code,""];
 const base="/construrei-oauth-pages/production/flow-canonical-20261001";
 const central="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes";

 const carry=()=>{
   const p=new URLSearchParams(location.search);
   p.delete("v");
   return p.toString();
 };
 const route=(i)=>{
   const c="f"+String(i).padStart(2,"0");
   const q=carry();
   return base+"/"+c+"/"+(q?"?"+q:"");
 };
 const links=Array.from({length:10},(_,i)=>{
   const c="F"+String(i).padStart(2,"0");
   const cls=i===current?" current":i<current?" done":"";
   return '<a class="cr-flowlink'+cls+'" data-cr-flow-target="'+c+'" href="'+route(i)+'">'+c+'</a>';
 }).join("");

 const bar=document.createElement("div");
 bar.className="cr-shellbar";
 bar.innerHTML='<div class="cr-shelltop"><a class="cr-brand cr-brand-home" href="'+central+'" aria-label="Voltar à Central"><img class="cr-brand-logo" src="https://rogeriocibin-alt.github.io/construrei-oauth-pages/assets/brand/construrei-app-v2/logo-horizontal.webp?v=brand-v2" alt="CONSTRU-REI"></a><div class="cr-phase"><b>'+code+' — '+title+'</b><span>'+mission+'</span></div></div><nav class="cr-flownav" aria-label="Fluxos F00 a F09">'+links+'</nav><div class="cr-shell-note">Um chamado • um número • uma fase responsável por vez</div>';
 document.body.prepend(bar);

 // Keep all visible flow links inside the canonical production universe.
 document.querySelectorAll('a[href*="/central-runtime/f0"],a[href*="central-atendimento?mode=f0"]').forEach(a=>{
   const m=(a.getAttribute("href")||"").match(/(?:\/f|mode=f)(0\d)/i);
   if(m){
     a.href=route(Number(m[1]));
     if(/^F0[0-9] atual$/i.test((a.textContent||"").trim())) a.style.display="none";
   }
 });

 const nav=document.createElement("nav");
 nav.className="cr-journey-nav";
 nav.setAttribute("aria-label","Navegação da jornada");
 const prev=current>0?'<a class="cr-journey-btn prev" href="'+route(current-1)+'">← F'+String(current-1).padStart(2,"0")+' Anterior</a>':'<span class="cr-journey-spacer"></span>';
 const next=current<9?'<a class="cr-journey-btn next" href="'+route(current+1)+'">F'+String(current+1).padStart(2,"0")+' Próximo →</a>':'<span class="cr-journey-spacer"></span>';
 nav.innerHTML=prev+'<a class="cr-journey-btn central" href="'+central+'">← Central</a>'+next;
 const main=document.querySelector("main");
 if(main) main.insertAdjacentElement("afterend",nav); else document.body.appendChild(nav);

 // On mobile, bring current phase into view without changing route.
 requestAnimationFrame(()=>{
   const cur=bar.querySelector(".cr-flowlink.current");
   if(cur&&cur.scrollIntoView)cur.scrollIntoView({block:"nearest",inline:"center"});
 });
})();