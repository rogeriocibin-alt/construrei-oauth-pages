import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {inspectTrelloCaller as gate} from './trello-webhook-caller-gate.mjs';

const cb='https://invalid.example.test/trello-callback?tenant=fictional';
const secret='SYNTHETIC_TEST_ONLY_NOT_PRODUCTION';
const event={
 model:{id:'bbbbbbbbbbbbbbbbbbbbbbbb'},
 action:{id:'aaaaaaaaaaaaaaaaaaaaaaaa',type:'updateCard',data:{text:'fixture'}}
};
const bytes=new TextEncoder().encode(JSON.stringify(event));
const sign=(input=bytes,url=cb,s=secret)=>createHmac('sha1',s).update(Buffer.from(input)).update(url).digest('base64');
const req=(action,method='POST',headers={},body='{}')=>new Request(
 'https://invalid.example.test/?action='+action,
 {method,headers, ...(method==='POST'?{body}:{} )});
const webhook=(headers={'x-trello-webhook':sign()},body=bytes)=>gate({
 request:req('webhook','POST',headers,body),action:'webhook',
 registeredCallbackURL:cb,appSecret:secret,webhookAllowedTypes:['updateCard']
});

test('valid signed webhook is eligible to queue but cannot directly authorize write',async()=>{
 const r=await webhook();
 assert.equal(r.ok,true);
 assert.equal(r.kind,'verified-webhook');
 assert.match(r.eventKey,/^[0-9a-f]{64}$/);
 assert.equal(r.writeAuthorized,false);
 assert.equal(r.replayReservationVerified,false);
});
test('signed event with mismatched callback, missing HMAC or wrong secret fails closed',async()=>{
 assert.equal((await webhook({'x-trello-webhook':''})).ok,false);
 const altered=await gate({request:req('webhook','POST',{'x-trello-webhook':sign(bytes,cb+'x')},bytes),action:'webhook',registeredCallbackURL:cb,appSecret:secret,webhookAllowedTypes:['updateCard']});
 assert.equal(altered.ok,false);
 assert.equal((await gate({request:req('webhook','POST',{'x-trello-webhook':sign()},bytes),action:'webhook',registeredCallbackURL:cb,appSecret:'invalid',webhookAllowedTypes:['updateCard']})).ok,false);
});
test('caller-provided sig or key in query string does not authorize manual sync',async()=>{
 const request=new Request('https://invalid.example.test/?action=sync&sig=guess&key=guess',{method:'POST',body:'{}'});
 const r=await gate({request,action:'sync'});
 assert.equal(r.status,403);
});
test('manual privileged routes fail closed unless server verifier authenticates exact action',async()=>{
 assert.equal((await gate({request:req('sync'),action:'sync'})).status,403);
 assert.equal((await gate({request:req('sync'),action:'sync',authorizeCaller:async()=>({ok:true,caller:'user',actions:['repair-list']})})).status,403);
 assert.equal((await gate({request:req('sync'),action:'sync',authorizeCaller:async()=>({ok:true,caller:'anonymous',actions:['sync']})})).status,403);
});
test('approved human scoped action only passes caller gate, not financial write gate',async()=>{
 const r=await gate({request:req('sync'),action:'sync',authorizeCaller:async()=>({ok:true,caller:'user',actions:['sync']})});
 assert.equal(r.ok,true);
 assert.equal(r.caller,'user');
 assert.equal(r.writeAuthorized,false);
 assert.equal(r.requiresDomainScopeAuthorization,true);
});
test('approved workload can perform only server-declared operation',async()=>{
 const auth=async()=>({ok:true,caller:'workload',actions:['reconcile']});
 assert.equal((await gate({request:req('reconcile'),action:'reconcile',authorizeCaller:auth})).ok,true);
 assert.equal((await gate({request:req('install-webhook'),action:'install-webhook',authorizeCaller:auth})).status,403);
});
test('invalid action/method and forged caller verifier fail closed',async()=>{
 assert.equal((await gate({request:req('other'),action:'other'})).status,404);
 assert.equal((await gate({request:req('sync','GET'),action:'sync'})).status,405);
 assert.equal((await gate({request:req('sync'),action:'sync',authorizeCaller:()=>{throw Error('fail')}})).status,403);
 assert.equal((await gate({request:req('sync'),action:'sync',authorizeCaller:async()=>true})).status,403);
});
test('read-only health remains available without creating authority',async()=>{
 for(const m of ['GET','HEAD']){
  const r=await gate({request:req('health',m),action:'health'});
  assert.equal(r.ok,true);assert.equal(r.writeAuthorized,false);assert.equal(r.action,'health');
 }
});
test('invalid content-length before read is denied',async()=>{
 const r=await webhook({'content-length':'99999999','x-trello-webhook':sign()});
 assert.equal(r.status,413);
});
