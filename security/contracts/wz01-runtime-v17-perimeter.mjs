/**
 * WZ-01 / CONSTRU-REI: isolated compatibility perimeter for the observed
 * cr-flow-runtime-v2 v17 route contract (read-only inspection 2026-10-13).
 *
 * This is a pure planner, NOT middleware and NOT a production change.
 * It never reads a database or uses an API/network connection.
 *
 * Verified server adapters MUST be injected by the server. Access to a handoff
 * token alone is never permission. Returning a plan does not execute SQL.
 * All database reads/writes must be scoped again by workspace_id + case_id.
 */
import {
  verifyCaseScopeFromTrustedAdapters,
  verifyScopedListFromTrustedAdapters,
} from './wz01-server-scope-planner.mjs';
import {flowAuthorizationOperations} from './wz01-flow-authorization.mjs';

const deny=(status,code)=>Object.freeze({ok:false,status,code});
const CASE_ACTIONS=Object.freeze([
  'get','route','visit-return','budget-base','return-previous',
  'budget-save','budget-release','proposal-save','flow-state',
  'flow-save','flow-advance',
]);
const SPECIAL_CASE_ACTIONS=Object.freeze(['budget-audit','ai-assist']);
const EXPECTED_PRIVATE=Object.freeze(['list',...CASE_ACTIONS,...SPECIAL_CASE_ACTIONS]);
const actionSet=new Set(EXPECTED_PRIVATE);
const caseSet=new Set(CASE_ACTIONS);
const phases=new Set(['F01','F02','F03']);
const f04to09=/^F0[4-9]$/;

// Failing this explicit reconciliation means future live routes must be reviewed.
// The operation catalogue comes from the existing laboratory contract and the
// 14 exact api==="..." branches inspected in function v17.
if (EXPECTED_PRIVATE.length!==14 ||
    actionSet.size!==14 ||
    actionSet.size!==flowAuthorizationOperations.private.length ||
    flowAuthorizationOperations.private.some(x=>!actionSet.has(x))) {
  throw new Error('WZ-01 runtime route manifest requires manual reconciliation');
}

export const runtimeV17Manifest=Object.freeze({
  inspectedFunction:'cr-flow-runtime-v2',
  inspectedVersion:17,
  verifyJwtAtInspection:false,
  observedPrivateOperations:Object.freeze([...EXPECTED_PRIVATE]),
  caseScopedOperations:CASE_ACTIONS,
  exceptionalOperations:SPECIAL_CASE_ACTIONS,
  listScope:'workspace_id AND case_id IN assigned_case_ids',
  legacyTokenlessBudgetAuditSupported:false,
  legacyAiAssistSupported:false,
  productionWiringApproved:false,
});

const str=(x)=>typeof x==='string'?x:'';
function getToken(action,body) {
  // Match current function's field precedence; never authorize by case_number.
  if (action==='flow-state' || action==='flow-save' || action==='flow-advance') {
    return str(body?.handoff_token || body?.token);
  }
  return str(body?.token);
}

export async function planRuntimeV17Request({
  method,api,body,authorization,adapters,
}={}) {
  if (method==='OPTIONS') return Object.freeze({
    ok:true,public:true,preflightOnly:true,approvedForLiveDeployment:false,
  });
  // The active v17 permits only GET health and POST business operations.
  if (method==='GET' && api==='health') return Object.freeze({
    ok:true,public:true,healthOnly:true,approvedForLiveDeployment:false,
  });
  if (method!=='POST') return deny(405,'METHOD_NOT_ALLOWED');
  if (!actionSet.has(api)) return deny(403,'UNKNOWN_OR_UNMAPPED_ACTION');
  if (!body || typeof body!=='object' || Array.isArray(body))
    return deny(400,'INVALID_REQUEST_BODY');

  if (api==='list') {
    const phase=str(body.phase).toUpperCase();
    if (!phases.has(phase)) return deny(400,'INVALID_PHASE');
    const result=await verifyScopedListFromTrustedAdapters({
      action:'list',authorization,adapters,
    });
    if (!result.ok) return result;
    return Object.freeze({...result,phase,queryMode:'SCOPED_LIST_PLAN_ONLY',
      approvedForLiveDeployment:false});
  }

  // Existing v17 budget-audit optionally has no handoff token.
  // Its unscoped form cannot be authorized under a per-case ACL.
  // Existing v17 ai-assist reads catalogue without a case token.
  // Both need a separately reviewed, human-compatible access policy.
  if (SPECIAL_CASE_ACTIONS.includes(api))
    return deny(403,'EXCEPTIONAL_ROUTE_REQUIRES_REDESIGN');

  if (!caseSet.has(api)) return deny(403,'ACTION_NOT_MAPPED');
  if ((api==='flow-save'||api==='flow-advance') &&
      !f04to09.test(str(body.flow_code).toUpperCase()))
    return deny(400,'INVALID_FLOW_CODE');
  const token=getToken(api,body);
  if (!token) return deny(403,'MISSING_CASE_HANDOFF');
  const result=await verifyCaseScopeFromTrustedAdapters({
    action:api,authorization,handoffToken:token,adapters,
  });
  if (!result.ok) return result;
  return Object.freeze({...result,queryMode:'SCOPED_CASE_PLAN_ONLY',
    approvedForLiveDeployment:false});
}
