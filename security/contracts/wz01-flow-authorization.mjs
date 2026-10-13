/**
 * CONSTRU-REI WZ-01: ISOLATED authorization contract for F00-F09.
 * This module has no network, database, environment, storage or deployment access.
 * NOT integrated into the live Edge Functions and NOT a production security fix.
 *
 * Caller must provide server-side adapters which validate/revoke an Auth session,
 * resolve ACTIVE membership/role from trusted storage, and authorize the specific
 * case/handoff from trusted storage. Never pass browser-provided actor/role/tenant
 * as adapter results. Prefer RLS-scoped queries wherever possible.
 */
const PUBLIC = new Set(['health']);
const PRIVATE = new Set([
  'list','get','route','visit-return','budget-base','return-previous',
  'budget-audit','budget-save','budget-release','proposal-save',
  'flow-state','flow-save','flow-advance','ai-assist',
]);
const READ_LIST = new Set(['list']);
const DENIED = Object.freeze({ ok:false, status:403, reason:'ACCESS_DENIED' });
const NO_AUTH = Object.freeze({ ok:false, status:401, reason:'UNAUTHENTICATED' });
const NOT_FOUND = Object.freeze({ ok:false, status:404, reason:'NOT_FOUND' });
const UNAVAILABLE = Object.freeze({ ok:false, status:503, reason:'AUTH_UNAVAILABLE' });
const nonEmpty = (x) => typeof x === 'string' && x.length > 0 && x.length <= 250;
const bearerPattern = /^Bearer ([A-Za-z0-9._~-]{8,8192})$/;

export async function authorizeFlowRequest({
  action, authorization, caseId, verifySession, lookupMembership,
  authorizeCase, roleGrants, nowMs = Date.now()
} = {}) {
  if (typeof action !== 'string') return NOT_FOUND;
  if (PUBLIC.has(action)) return Object.freeze({ok:true, public:true, action});
  if (!PRIVATE.has(action)) return NOT_FOUND;
  // A valid JWT is not sufficient: active membership, role and case authorization are mandatory.
  if (typeof verifySession !== 'function' ||
      typeof lookupMembership !== 'function' ||
      typeof authorizeCase !== 'function' ||
      !roleGrants || typeof roleGrants !== 'object') return UNAVAILABLE;
  const match = typeof authorization === 'string' ? bearerPattern.exec(authorization) : null;
  if (!match) return NO_AUTH;
  try {
    const id = await verifySession(match[1]);
    if (!id || !nonEmpty(id.subject) || id.valid !== true ||
        id.revoked !== false || typeof id.expiresAtMs !== 'number' ||
        !Number.isFinite(id.expiresAtMs) || id.expiresAtMs <= nowMs) return NO_AUTH;
    const membership = await lookupMembership(id.subject);
    if (!membership || membership.active !== true ||
        !nonEmpty(membership.tenantId) || !nonEmpty(membership.role)) return DENIED;
    // Ignore any role, tenant or actor offered in the request body.
    if (!Object.hasOwn(roleGrants, membership.role) ||
        !Array.isArray(roleGrants[membership.role]) ||
        !roleGrants[membership.role].includes(action)) return DENIED;
    const context = {
      ok: true, public: false, action,
      actor: id.subject,
      tenantId: membership.tenantId,
      role: membership.role,
      mustScopeDatabaseQuery: true,
    };
    if (READ_LIST.has(action)) {
      // Caller MUST constrain SQL by this tenant and any per-case ACL BEFORE returning rows.
      // A list cannot be issued via an unscoped service-role select("*").
      return Object.freeze(context);
    }
    if (!nonEmpty(caseId)) return NOT_FOUND;
    const permitted = await authorizeCase({
      actor: id.subject,
      tenantId: membership.tenantId,
      caseId,
      action,
    });
    // The case adapter must check BOTH tenant ownership and per-case permission.
    if (!permitted || permitted.allowed !== true ||
        permitted.tenantId !== membership.tenantId ||
        permitted.caseId !== caseId) return NOT_FOUND;
    return Object.freeze({...context, caseId});
  } catch {
    // Fail closed with no stack traces, auth metadata, customer records or SQL errors.
    return UNAVAILABLE;
  }
}

export const flowAuthorizationOperations = Object.freeze({
  public: Object.freeze([...PUBLIC]),
  private: Object.freeze([...PRIVATE]),
  productionWiringApproved: false,
});
