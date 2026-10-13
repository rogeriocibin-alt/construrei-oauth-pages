import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeFlowRequest as authorize, flowAuthorizationOperations as ops } from './wz01-flow-authorization.mjs';

// All fixtures are invented and isolated. No network, secrets, Supabase or real case IDs.
const NOW = 100000;
const CASE = 'fixture-case-001';
const TOKEN = 'Bearer synthetic-session-token-123';
const defaults = {
  action:'get', authorization:TOKEN, caseId:CASE, nowMs:NOW,
  verifySession:async()=>({subject:'fixture-user-1',valid:true,revoked:false,expiresAtMs:NOW+60000}),
  lookupMembership:async()=>({tenantId:'fixture-org-a',role:'OPERATOR',active:true}),
  authorizeCase:async({tenantId,caseId})=>({allowed:true,tenantId,caseId}),
  roleGrants:{OPERATOR:['list','get','route','flow-state','flow-save'],VIEWER:['list','get']},
};
const check = (changes={})=>authorize({...defaults,...changes});
const deny = async (changes,status)=>assert.equal((await check(changes)).status,status);

test('health is the only currently permitted anonymous operation',async()=>{
  assert.deepEqual(ops.public,['health']);
  assert.equal((await authorize({action:'health'})).ok,true);
  assert.equal((await authorize({action:'public-create'})).status,404);
  assert.equal((await authorize({action:'admin-bypass'})).status,404);
});
test('no session or malformed bearer cannot read or write',async()=>{
  await deny({authorization:null},401);
  await deny({authorization:'Bearer '},401);
  await deny({authorization:'Basic fake-header'},401);
  await deny({authorization:'Bearer synthetic token with spaces'},401);
  await deny({action:'flow-save',authorization:null},401);
});
test('expired, revoked and unverified sessions are rejected',async()=>{
  await deny({verifySession:async()=>({subject:'fixture-user-1',valid:true,revoked:false,expiresAtMs:NOW})},401);
  await deny({verifySession:async()=>({subject:'fixture-user-1',valid:true,revoked:true,expiresAtMs:NOW+100})},401);
  await deny({verifySession:async()=>({subject:'fixture-user-1',valid:false,revoked:false,expiresAtMs:NOW+100})},401);
  await deny({verifySession:async()=>null},401);
});
test('inactive or incomplete membership cannot operate',async()=>{
  await deny({lookupMembership:async()=>({tenantId:'fixture-org-a',role:'OPERATOR',active:false})},403);
  await deny({lookupMembership:async()=>({tenantId:'fixture-org-a',role:'OPERATOR'})},403);
  await deny({lookupMembership:async()=>({role:'OPERATOR',active:true})},403);
});
test('unapproved action/role is denied even when the user is valid',async()=>{
  await deny({action:'budget-release'},403);
  await deny({roleGrants:{OTHER:['get']}},403);
  await deny({lookupMembership:async()=>({tenantId:'fixture-org-a',role:'VIEWER',active:true}),action:'flow-save'},403);
});
test('tenant mismatch is denied even with valid role and JWT',async()=>{
  await deny({authorizeCase:async()=>({allowed:true,tenantId:'fixture-org-b',caseId:CASE})},404);
  await deny({authorizeCase:async()=>({allowed:true,tenantId:'fixture-org-a',caseId:'different-case'})},404);
});
test('unauthorized case/assignment is denied',async()=>{
  await deny({authorizeCase:async()=>({allowed:false,tenantId:'fixture-org-a',caseId:CASE})},404);
  await deny({authorizeCase:async()=>null},404);
  await deny({caseId:null},404);
});
test('case adapter receives trusted server principal and tenant',async()=>{
  let observed;
  const result=await check({authorizeCase:async x=>(observed=x,{allowed:true,tenantId:x.tenantId,caseId:x.caseId})});
  assert.equal(result.ok,true);
  assert.deepEqual(observed,{actor:'fixture-user-1',tenantId:'fixture-org-a',caseId:CASE,action:'get'});
  assert.equal(result.actor,'fixture-user-1');
});
test('forged actor, tenant and role in caller body have no authority',async()=>{
  const result=await check({actor:'CEO',tenantId:'fixture-org-b',role:'ADMIN',body:{actor:'CEO',role:'ADMIN',tenantId:'fixture-org-b'}});
  assert.equal(result.ok,true);
  assert.equal(result.role,'OPERATOR');
  assert.equal(result.actor,'fixture-user-1');
  assert.equal(result.tenantId,'fixture-org-a');
});
test('unscoped list cannot return records or a broad global query',async()=>{
  let caseCalled=false;
  const result=await check({action:'list',caseId:undefined,authorizeCase:async()=>{caseCalled=true;return {allowed:true}}});
  assert.equal(result.ok,true);
  assert.equal(result.mustScopeDatabaseQuery,true);
  assert.equal(result.tenantId,'fixture-org-a');
  assert.equal(Object.hasOwn(result,'rows'),false);
  assert.equal(caseCalled,false);
});
test('list still requires server-side role and valid identity',async()=>{
  await deny({action:'list',authorization:null},401);
  await deny({action:'list',roleGrants:{VIEWER:['list']}},403);
});
test('missing adapters or policy fails closed, never bypasses auth',async()=>{
  await deny({verifySession:null},503);
  await deny({lookupMembership:null},503);
  await deny({authorizeCase:null},503);
  await deny({roleGrants:null},503);
});
test('adapter errors deny access and do not expose sensitive error',async()=>{
  const result=await check({authorizeCase:async()=>{throw Error('fixture-only-secret SHOULD_NOT_LEAK')}});
  assert.equal(result.status,503);
  assert.equal(JSON.stringify(result).includes('SHOULD_NOT_LEAK'),false);
  await deny({verifySession:async()=>{throw Error('simulated upstream outage')}},503);
});
test('known transitions pass only when authorized and scoped',async()=>{
  for (const action of ['route','flow-state','flow-save']) {
    const result=await check({action});
    assert.equal(result.ok,true,action);
    assert.equal(result.caseId,CASE);
  }
});
