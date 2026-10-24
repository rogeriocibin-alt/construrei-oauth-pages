/**
 * ISOLATED Trello webhook envelope check; not connected to production.
 * Does not persist replay keys or authorize financial actions.
 * Only server-sourced callbackURL, appSecret and approved types may be passed.
 */
import {verifyTrelloWebhookSignature} from './trello-webhook-signature.mjs';
const deny=(status)=>Object.freeze({ok:false,status,reason:'WEBHOOK_REJECTED'});
const HEX_ID=/^[0-9a-fA-F]{24}$/;
const MAX_BYTES=256*1024;

export async function inspectTrelloWebhook({
  rawBody, receivedSignature, callbackURL, appSecret, allowedTypes=[]
}={}) {
  if (!(rawBody instanceof Uint8Array) || rawBody.byteLength > MAX_BYTES ||
      rawBody.byteLength === 0) return deny(413);
  // No JSON parse, database use or callback is allowed before signature check.
  let signed=false;
  try {
    signed=await verifyTrelloWebhookSignature({rawBody,receivedSignature,callbackURL,appSecret});
  } catch {
    signed=false;
  }
  if (!signed) return deny(401);
  let event;
  try {
    event=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(rawBody));
  } catch {
    return deny(422);
  }
  const a=event?.action, model=event?.model;
  if (!a || !HEX_ID.test(a.id||'') ||
      !model || !HEX_ID.test(model.id||'') ||
      typeof a.type!=='string') return deny(422);
  if (!Array.isArray(allowedTypes) || !allowedTypes.includes(a.type)) return deny(403);
  // Stable across retransmissions and changes in body serialization.
  const stableKey='trello-event:v1:'+model.id.toLowerCase()+':'+a.id.toLowerCase();
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stableKey));
  const eventKey=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
  return Object.freeze({
    ok:true,status:200,actionType:a.type,eventKey,
    signatureVerified:true,financialWriteAuthorized:false,
    persistentReplayReservationVerified:false
  });
}
