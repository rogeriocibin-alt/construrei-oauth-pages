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

// Auth/role/assignment adapters and legacy backfill are NOT implemented.
// This signal is designed to prevent an accidental deployment signoff.
export const scopeContractStatus = Object.freeze({
  syntheticOnly: true,
  realSessionVerified: false,
  liveAdaptersImplemented: false,
  legacyBackfillApproved: false,
  productionWiringApproved: false,
});
