/** CR APP Secure Candidate R3 — deny-by-default operation policy. */
export const ROLE_DIRECTOR="ADMIN_MASTER_ROGERIO";
export const ROLE_TECH="ADMIN_TECNICO_EDER";
export const ROLE_F00="OPERADOR_F00";
const technicalRead=new Set(["list","get","flow-state","ai-assist","budget-base","budget-audit"]);
const gabiActions=new Set(["get","route","visit-return"]);
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
   if(gabiActions.has(a))return true; // caller must ALSO pass post-lookup F01 scope check
   return false;
 }
 return false;
}
