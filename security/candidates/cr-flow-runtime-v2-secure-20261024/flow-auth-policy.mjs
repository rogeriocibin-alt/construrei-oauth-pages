/** CR APP Secure Candidate R3 — deny-by-default operation policy. */
export const ROLE_DIRECTOR="ADMIN_MASTER_ROGERIO";
export const ROLE_TECH="ADMIN_TECNICO_EDER";
export const ROLE_F00="OPERADOR_F00";
const technicalRead=new Set(["list","get","flow-state","ai-assist","budget-base","budget-audit"]);
export function allowedAction(role,action,body={}){
 const a=String(action||"").trim().toLowerCase();
 if(!a||a==="health")return false;
 if(role===ROLE_DIRECTOR)return true;
 if(role===ROLE_TECH){
   if(technicalRead.has(a))return true;
   if(a==="flow-save"||a==="flow-advance")return /^F0[4-7]$/.test(String(body.flow_code||"").toUpperCase());
   return false;
 }
 if(role===ROLE_F00){
   if(a==="list")return String(body.phase||"").toUpperCase()==="F01";
   // get/route/visit-return remain denied until a validated per-handoff F01 scope check exists
   return false;
 }
 return false;
}
