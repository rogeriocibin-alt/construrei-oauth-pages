/**
 * CONSTRU-REI WZ-01 — authenticated identity adapter for the EXISTING Supabase Auth.
 *
 * Candidate-only, no new OAuth provider, users, secrets, database schema,
 * Edge deployment, or network action on import. The injected auth client
 * MUST be instantiated server-side. Caller accessToken is untrusted input.
 * The only authenticated identity accepted is the ID returned by
 * Supabase Auth getUser(accessToken), never actor/role/tenant from JSON or
 * editable user_metadata. Session verification does NOT grant case access.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9._~-]{8,8192}$/;

export function makeSupabaseAuthSessionVerifier({authClient} = {}) {
  if (!authClient || typeof authClient.auth?.getUser !== 'function')
    throw new TypeError('Trusted server-side Supabase Auth client required');
  return async function verifySession({accessToken} = {}) {
    if (typeof accessToken !== 'string' || !TOKEN.test(accessToken))
      return {sessionActive:false};
    try {
      // Supabase Auth verifies the user and token server-side.
      // Never use getSession() or decode a JWT without validation here.
      const {data,error} = await authClient.auth.getUser(accessToken);
      const userId = data?.user?.id;
      if (error || typeof userId !== 'string' || !UUID.test(userId))
        return {sessionActive:false};
      return Object.freeze({userId,sessionActive:true});
    } catch {
      // Fail closed without leaking token, provider errors or account data.
      return {sessionActive:false};
    }
  };
}

export const authBridgeReadiness = Object.freeze({
  authProvider:'EXISTING_SUPABASE_AUTH',
  createsOrLinksUsers:false,
  provesWorkspaceMembership:false,
  provesCaseAssignment:false,
  productionWiringApproved:false,
});
