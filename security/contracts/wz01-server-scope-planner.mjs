/**
 * CONSTRU-REI WZ-01 — OFFLINE, server-trust-only scope contract.
 * NO network, SQL, secrets or side effects. NOT connected to live Edge.
 *
 * A successful result REQUIRES all inputs originate from independent
 * verified server-side adapters. This function does not validate their
 * provenance and therefore is NOT itself an authorization middleware.
 * Never populate inputs directly from browser JSON or handoff tokens.
 *
 * Known DB topology:
 *   cr_flow_handoffs.case_id -> cr_cases_v1.case_id
 *   cr_cases_v1.workspace_id
 *   cr_rbac_expected_human_users.auth_user_id
 *
 * Existing tables do NOT yet prove a validated auth-user/workspace/case
 * membership/assignment link for all legacy cases; DO NOT infer one.
 */
import { flowAuthorizationOperations } from './wz01-flow-authorization.mjs';

const DENY = Object.freeze({
  ok: false, status: 403, code: 'SCOPE_NOT_VERIFIED',
});
const PRIVATE = new Set(flowAuthorizationOperations.private);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const uuid = (value) => typeof value === 'string' && UUID.test(value);
const safeAction = (value) => typeof value === 'string' && PRIVATE.has(value);

export function verifyServerCaseScope({
  // These objects MUST come from verified server adapters, not request body:
  principal,
  membership,
  handoff,
  caseRecord,
  assignment,
  rolePermission,
  action,
} = {}) {
  // Private list needs a separately verified SQL/RLS row-by-row mechanism.
  // Never grant a tenant-wide wildcard list from an unscoped service-role query.
  if (!safeAction(action) || action === 'list') return DENY;

  if (!principal || principal.serverVerified !== true ||
      principal.sessionActive !== true || !uuid(principal.userId)) return DENY;

  // Crucially, neither an RBAC role label nor expected-human presence alone
  // supplies workspace membership; that relationship must be proven.
  if (!membership || membership.serverVerified !== true ||
      membership.active !== true || membership.humanValidated !== true ||
      !uuid(membership.authUserId) || !uuid(membership.workspaceId) ||
      membership.authUserId !== principal.userId) return DENY;

  // caseNumber, free text, phone, customer name and token alone are never
  // acceptable legacy join keys or authorization evidence.
  if (!handoff || handoff.serverVerified !== true || !uuid(handoff.case_id) ||
      !caseRecord || caseRecord.serverVerified !== true || !uuid(caseRecord.case_id) ||
      !uuid(caseRecord.workspace_id) ||
      handoff.case_id !== caseRecord.case_id ||
      membership.workspaceId !== caseRecord.workspace_id) return DENY;

  // Existing role/permission tables require a truthful action mapping, and
  // per-case assignment must be checked independently by trusted storage.
  if (!rolePermission || rolePermission.serverVerified !== true ||
      rolePermission.allowed !== true ||
      rolePermission.action !== action ||
      rolePermission.authUserId !== principal.userId) return DENY;

  if (!assignment || assignment.serverVerified !== true ||
      assignment.allowed !== true ||
      assignment.authUserId !== principal.userId ||
      assignment.caseId !== caseRecord.case_id ||
      assignment.workspaceId !== caseRecord.workspace_id ||
      assignment.action !== action) return DENY;

  return Object.freeze({
    ok: true,
    action,
    actor: principal.userId,
    caseId: caseRecord.case_id,
    workspaceId: caseRecord.workspace_id,
    mustScopeEveryReadAndWrite: true,
    approvedForLiveDeployment: false,
  });
}

/**
 * Candidate-only adapter seam. This is executable orchestration of the six
 * required independent, *server-injected* verifications, not live middleware.
 * Never obtain the "adapters" object from JSON, a browser, or request fields.
 * The handoff token is a LOOKUP key only: possession never grants access.
 *
 * Each adapter must return its result from verified server-side Auth/RBAC/DB.
 * The wrapper itself does not validate callback provenance or SQL/RLS.
 */
const ADAPTER_UNAVAILABLE = Object.freeze({
  ok:false, status:503, code:'SERVER_ADAPTERS_UNAVAILABLE',
});
const ADAPTER_ERROR = Object.freeze({
  ok:false, status:503, code:'SERVER_ADAPTER_ERROR',
});
const INVALID_SESSION = Object.freeze({
  ok:false, status:401, code:'AUTH_SESSION_INVALID',
});
const BEARER = /^Bearer ([A-Za-z0-9._~-]{8,8192})$/;
const REQUIRED_ADAPTERS = Object.freeze([
  'verifySession', 'findMembership', 'findHandoffByToken',
  'findCaseById', 'getActionPermission', 'getCaseAssignment',
]);

export async function verifyCaseScopeFromTrustedAdapters({
  action, authorization, handoffToken, adapters,
} = {}) {
  // A list operation needs a separate row-scoped policy and is *never*
  // authorized through a single-case handoff.
  if (!safeAction(action) || action === 'list') return DENY;
  const match = typeof authorization === 'string'
    ? BEARER.exec(authorization) : null;
  if (!match) return INVALID_SESSION;
  if (typeof handoffToken !== 'string' ||
      handoffToken.length < 8 || handoffToken.length > 250 ||
      /\s/.test(handoffToken)) return DENY;
  if (!adapters || typeof adapters !== 'object' ||
      REQUIRED_ADAPTERS.some(name => typeof adapters[name] !== 'function')) {
    return ADAPTER_UNAVAILABLE;
  }
  try {
    // Caller supplies only the authorization header, action and lookup token;
    // principal, membership, permission and assignment are loaded by the server.
    const principal = await adapters.verifySession({accessToken:match[1]});
    if (!principal || !uuid(principal.userId) ||
        principal.sessionActive !== true) return INVALID_SESSION;

    const membership = await adapters.findMembership({
      authUserId:principal.userId,
    });
    if (!membership || membership.active !== true ||
        membership.humanValidated !== true ||
        membership.authUserId !== principal.userId ||
        !uuid(membership.workspaceId)) return DENY;

    const handoff = await adapters.findHandoffByToken({
      token:handoffToken,
    });
    if (!handoff || handoff.token !== handoffToken || !uuid(handoff.case_id)) return DENY;
    const caseRecord = await adapters.findCaseById({
      caseId:handoff.case_id,
    });
    if (!caseRecord || !uuid(caseRecord.case_id) ||
        caseRecord.case_id !== handoff.case_id ||
        caseRecord.workspace_id !== membership.workspaceId) return DENY;

    const rolePermission = await adapters.getActionPermission({
      authUserId:principal.userId, action,
    });
    const assignment = await adapters.getCaseAssignment({
      authUserId:principal.userId, caseId:caseRecord.case_id,
      workspaceId:caseRecord.workspace_id, action,
    });
    return verifyServerCaseScope({
      action,
      principal:{serverVerified:true,sessionActive:true,userId:principal.userId},
      membership:{serverVerified:true,active:membership.active,
        humanValidated:membership.humanValidated,
        authUserId:membership.authUserId,workspaceId:membership.workspaceId},
      handoff:{serverVerified:true,case_id:handoff.case_id},
      caseRecord:{serverVerified:true,case_id:caseRecord.case_id,
        workspace_id:caseRecord.workspace_id},
      rolePermission:{serverVerified:true,allowed:rolePermission?.allowed,
        action:rolePermission?.action,authUserId:rolePermission?.authUserId},
      assignment:{serverVerified:true,allowed:assignment?.allowed,
        action:assignment?.action,authUserId:assignment?.authUserId,
        workspaceId:assignment?.workspaceId,caseId:assignment?.caseId},
    });
  } catch {
    // No stack, token, account data, SQL or adapter error is reflected.
    return ADAPTER_ERROR;
  }
}

// Auth/role/assignment adapters and legacy backfill are NOT implemented.
// This signal is designed to prevent an accidental deployment signoff.
export const scopeContractStatus = Object.freeze({
  syntheticOnly: true,
  realSessionVerified: false,
  liveAdaptersImplemented: false,
  legacyBackfillApproved: false,
  productionWiringApproved: false,
});
