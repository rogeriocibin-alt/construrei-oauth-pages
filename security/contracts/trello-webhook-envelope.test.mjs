import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {inspectTrelloWebhook as inspect} from './trello-webhook-envelope.mjs';

const url='https://fixture.invalid.example.test/trello';
const secret='SYNTHETIC_NON_PRODUCTION_SECRET';
const model='bbbbbbbbbbbbbbbbbbbbbbbb',action='aaaaaaaaaaaaaaaaaaaaaaaa';
const source={model:{id:model},action:{id:action,type:'updateCard',data:{text:'synthetic'}}};
const encode=(x)=>new TextEncoder().encode(typeof x==='string'?x:JSON.stringify(x));
const sign=(bytes)=>createHmac('sha1',secret).update(Buffer.from(bytes)).update(url).digest('base64');
const call=(rawBody=encode(source),extra={})=>inspect({
 rawBody,receivedSignature:sign(rawBody),callbackURL:url,appSecret:secret,
 allowedTypes:['updateCard'],...extra
});
test('valid signed synthetic Trello event yields a non-executable replay identity',async()=>{
 const x=await call();
 assert.equal(x.ok,true);
 assert.equal(x.actionType,'updateCard');
 assert.match(x.eventKey,/^[a-f0-9]{64}$/);
 assert.equal(x.signatureVerified,true);
 assert.equal(x.financialWriteAuthorized,false);
 assert.equal(x.persistentReplayReservationVerified,false);
});
test('unsigned, altered or wrong-key events never become eligible for processing',async()=>{
 const bytes=encode(source);
 assert.equal((await call(bytes,{receivedSignature:''})).status,401);
 assert.equal((await call(bytes,{appSecret:'wrong-secret'})).status,401);
 assert.equal((await call(bytes,{rawBody:encode({...source,action:{...source.action,id:'cccccccccccccccccccccccc'}})})).status,401);
});
test('invalid JSON, malformed UTF-8 and missing action/model identifiers are rejected',async()=>{
 const broken=encode('{malformed');
 assert.equal((await call(broken)).status,422);
 const utf8=new Uint8Array([0xff]);
 assert.equal((await call(utf8)).status,422);
 assert.equal((await call(encode({model:source.model,action:{type:'updateCard'}}))).status,422);
 assert.equal((await call(encode({model:{},action:source.action}))).status,422);
});
test('reject oversized and empty bodies before parsing or invoking crypto',async()=>{
 assert.equal((await call(new Uint8Array(0))).status,413);
 assert.equal((await call(new Uint8Array(256*1024+1))).status,413);
});
test('fail closed on unapproved action types and missing policy',async()=>{
 assert.equal((await call(encode({...source,action:{...source.action,type:'deleteCard'}}))).status,403);
 assert.equal((await call(encode(source),{allowedTypes:[]})).status,403);
 assert.equal((await call(encode(source),{allowedTypes:'updateCard'})).status,403);
});
test('same event ID and model ID always map to same replay key despite JSON order',async()=>{
 const a=await call();
 const reordered={action:{data:{text:'changed but signed'},type:'updateCard',id:action},model:{id:model}};
 const b=await call(encode(reordered));
 assert.equal(b.ok,true);
 assert.equal(a.eventKey,b.eventKey);
 const c=await call(encode({...source,action:{...source.action,id:'cccccccccccccccccccccccc'}}));
 assert.notEqual(a.eventKey,c.eventKey);
});
test('replay identifier is not evidence of persistent idempotency or authorization',async()=>{
 const x=await call();
 assert.equal(x.financialWriteAuthorized,false);
 assert.equal(x.persistentReplayReservationVerified,false);
 assert.equal(Object.hasOwn(x,'payload'),false);
});
