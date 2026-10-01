// CONSTRU-REI — F00 candidate navigation bridge — 2026-10-01
// Keeps the F00 candidate inside the approved Central candidate universe.
(()=>{
  const CENTRAL="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-f00-integration-candidate-20261001";
  const fix=()=>{
    document.querySelectorAll("a.cr-brand-home,a.cr-journey-btn.central").forEach(a=>a.href=CENTRAL);
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(fix,60));
  else setTimeout(fix,60);
  setTimeout(fix,500);
})();
