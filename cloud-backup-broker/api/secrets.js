import { createRemoteJWKSet, jwtVerify } from "jose";

const issuer = "https://token.actions.githubusercontent.com";
const jwks = createRemoteJWKSet(
  new URL("https://token.actions.githubusercontent.com/.well-known/jwks")
);

const repo = "rogeriocibin-alt/construrei-oauth-pages";
const expectedSub = `repo:${repo}:ref:refs/heads/main`;
const audience = "construrei-backup";
const workflowName = "CONSTRU-REI Cloud Backup";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "missing_bearer" });
    }

    const token = auth.slice(7);
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
    });

    const allowedEvent =
      payload.event_name === "workflow_dispatch" ||
      payload.event_name === "schedule";

    if (
      payload.repository !== repo ||
      payload.ref !== "refs/heads/main" ||
      payload.sub !== expectedSub ||
      payload.workflow !== workflowName ||
      !allowedEvent
    ) {
      return res.status(403).json({ error: "claim_mismatch" });
    }

    const supabaseAccessToken = process.env.SUPABASE_ACCESS_TOKEN;
    const rcloneConfigB64 = process.env.RCLONE_CONFIG_B64;

    if (!supabaseAccessToken || !rcloneConfigB64) {
      return res.status(503).json({ error: "broker_not_configured" });
    }

    return res.status(200).json({
      supabaseAccessToken,
      rcloneConfigB64,
    });
  } catch {
    return res.status(401).json({ error: "invalid_oidc_token" });
  }
}
