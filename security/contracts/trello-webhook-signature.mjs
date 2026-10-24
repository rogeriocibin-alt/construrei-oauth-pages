/**
 * Trello webhook signature contract, standalone and side-effect free.
 *
 * Trello signs HMAC-SHA1(raw request bytes + the EXACT registered callback URL)
 * using the Trello application/OAuth client secret; X-Trello-Webhook is base64.
 * This helper does not fetch, log, deploy or mutate external resources.
 *
 * IMPORTANT: it is a candidate building block, not active authentication.
 * Caller MUST reject unsigned/invalid requests before any database/Trello writes.
 */
export async function verifyTrelloWebhookSignature({
  rawBody,
  receivedSignature,
  callbackURL,
  appSecret,
}) {
  if (!(rawBody instanceof Uint8Array)) return false;
  if (typeof receivedSignature !== 'string' || !/^[A-Za-z0-9+/]{27}=$/.test(receivedSignature)) return false;
  if (typeof callbackURL !== 'string' || !/^https:\/\//.test(callbackURL)) return false;
  if (typeof appSecret !== 'string' || appSecret.length === 0) return false;

  let received;
  try {
    received = Uint8Array.from(atob(receivedSignature), (char) => char.charCodeAt(0));
  } catch {
    return false;
  }
  if (received.byteLength !== 20) return false;

  const urlBytes = new TextEncoder().encode(callbackURL);
  const content = new Uint8Array(rawBody.byteLength + urlBytes.byteLength);
  content.set(rawBody, 0);
  content.set(urlBytes, rawBody.byteLength);

  const hmacKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-1' }, false, ['verify'],
  );
  return crypto.subtle.verify('HMAC', hmacKey, received, content);
}
