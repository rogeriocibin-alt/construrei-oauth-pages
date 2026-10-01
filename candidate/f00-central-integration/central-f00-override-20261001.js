// CONSTRU-REI — F00 → Central integration candidate — 2026-10-01
// Scope: candidate-only. Does not mutate canonical Central or production F00.
const CR_F00_INTEGRATION_URL="https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-f00-central-integration-ui-candidate-20261001";
function crApplyF00Integration(DATA){
  if(!DATA)return DATA;
  DATA.links=DATA.links||{};
  DATA.links.f00=CR_F00_INTEGRATION_URL;
  DATA.links.novo_chamado=CR_F00_INTEGRATION_URL;
  if(Array.isArray(DATA.flows)){
    DATA.flows.forEach(function(flow){
      if(String(flow.code||"").toUpperCase()==="F00") flow.url=CR_F00_INTEGRATION_URL;
    });
  }
  return DATA;
}
