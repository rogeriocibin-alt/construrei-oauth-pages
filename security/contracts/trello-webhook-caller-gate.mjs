/**
 * Candidate-only transport boundary for Trello integration.
 * NO production hook, no secrets, no effects, no DB; server-owned authorizers required.
 * This gate alone does not reserve event IDs, guarantee idempotency, or authorize writes.
 */
import {inspectTrelloWebhook} from './trello-webhook-envelope.mjs';

const MAX_BODY = 256*1024;
const deny = (status=403) => Object.freeze({ok:false,status,reason:'CALLER_NOT_AUTHORIZED'});

/** Streaming, bounded read: do not allocate an unbounded webhook body. */
async function readBounded(request) {
  if (!request.body || !request.body.getReader) return new Uint8Array();
  const reader = request.body.getReader();
  const parts=[];
  let count=0;
  try {
    while(true) {
      const {done,value} = await reader.read();
      if(done)break;
      if (!(value instanceof Uint8Array)) return null;
      count+=value.byteLength;
      if(count>MAX_BODY){await reader.cancel().catch(()=>{});return null;}
      parts.push(value);
    }
  } finally {
    try{reader.releaseLock();}catch{}
  }
  const bytes=new Uint8Array(count);
  let pos=0;
  for(const part of parts){bytes.set(part,pos);pos+=part.byteLength;}
  return bytes;
}
const DEFAULT_PRIVILEGED=Object.freeze(['sync','reconcile','install-webhook','setup-webhooks','repair-list']);

/**
 * Caller explicitly supplies a server-side verifier. Never derive authorizeCaller
 * from request query parameters or browser-supplied flags.
 */
export async function inspectTrelloCaller({
  request,
  action,
  registeredCallbackURL,
  appSecret,
  webhookAllowedTypes=[],
  privilegedActions=DEFAULT_PRIVILEGED,
  authorizeCaller
}={}) {
  if (!(request instanceof Request) || typeof action!=='string')return deny(400);
  if(action==='health'&&['GET','HEAD'].includes(request.method)) {
    return Object.freeze({ok:true,kind:'public-health',action:'health',writeAuthorized:false});
  }
  if(action==='webhook') {
    if(request.method!=='POST')return deny(405);
    const cl=request.headers.get('content-length');
    if(cl!==null&&(!/^\d+$/.test(cl)||Number(cl)>MAX_BODY))return deny(413);
    let rawBody;
    try{rawBody=await readBounded(request);}catch{return deny(422);}
    if(!rawBody)return deny(413);
    const inspected=await inspectTrelloWebhook({
      rawBody,
      receivedSignature:request.headers.get('x-trello-webhook')||'',
      callbackURL:registeredCallbackURL,
      appSecret,
      allowedTypes:webhookAllowedTypes
    });
    if(!inspected.ok)return deny(inspected.status||401);
    return Object.freeze({
      ok:true,kind:'verified-webhook',action:'webhook',
      eventKey:inspected.eventKey,actionType:inspected.actionType,
      writeAuthorized:false,replayReservationVerified:false
    });
  }
  if(!Array.isArray(privilegedActions)||!privilegedActions.includes(action))return deny(404);
  if(request.method!=='POST')return deny(405);
  if(typeof authorizeCaller!=='function')return deny();
  let granted;
  try{granted=await authorizeCaller({request,action});}catch{return deny();}
  if(granted?.ok!==true || !['user','workload'].includes(granted?.caller) ||
     !Array.isArray(granted?.actions) || !granted.actions.includes(action))return deny();
  // This is only a caller authorization gate, not transaction or scope authorization.
  return Object.freeze({ok:true,kind:'verified-privileged-caller',
    action,caller:granted.caller,writeAuthorized:false,
    requiresDomainScopeAuthorization:true});
}
