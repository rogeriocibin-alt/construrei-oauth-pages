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
 let code=(meta&&meta.content)||((location.pathname.match(/\/f(0\d)\//i)||location.pathname.match(/\/ui-candidate\/f(0\d)\//i)||[])[1]||"");
 if(code&&code.length===2)code="F"+code;
 if(!/^F0[0-9]$/.test(code))return;
 document.body.dataset.crFlow=code;
 const [title,mission]=missions[code]||[code,""];
 const bar=document.createElement("div");bar.className="cr-shellbar";
 const current=Number(code.slice(1));
 const ROUTER="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento";
 const links=Array.from({length:10},(_,i)=>{
   const c="F"+String(i).padStart(2,"0"),cls=i===current?" current":i<current?" done":"";
   return '<a class="cr-flowlink'+cls+'" href="'+ROUTER+'?mode='+c.toLowerCase()+'">'+c+'</a>'
 }).join("");
 bar.innerHTML='<div class="cr-shelltop"><div class="cr-brand"><span class="constru">CONSTRU</span><span class="rei">REI</span></div><div class="cr-phase"><b>'+code+' — '+title+'</b><span>'+mission+'</span></div></div><nav class="cr-flownav">'+links+'</nav><div class="cr-shell-note">Um chamado • um número • uma fase responsável por vez</div>';
 document.body.prepend(bar);
})();