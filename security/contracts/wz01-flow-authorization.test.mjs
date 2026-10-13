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


import { verifyServerCaseScope as verifyScope, scopeContractStatus }
  from './wz01-server-scope-planner.mjs';

const SCOPE_U='11111111-1111-4111-8111-111111111111';
const SCOPE_C='22222222-2222-4222-8222-222222222222';
const SCOPE_W='33333333-3333-4333-8333-333333333333';
const SCOPE_OTHER='44444444-4444-4444-8444-444444444444';
const scopeFixture=()=>({
  principal:{serverVerified:true,sessionActive:true,userId:SCOPE_U},
  membership:{serverVerified:true,active:true,humanValidated:true,
    authUserId:SCOPE_U,workspaceId:SCOPE_W},
  handoff:{case_id:SCOPE_C},
  caseRecord:{case_id:SCOPE_C,workspace_id:SCOPE_W},
  rolePermission:{serverVerified:true,allowed:true,authUserId:SCOPE_U,action:'get'},
  assignment:{serverVerified:true,allowed:true,authUserId:SCOPE_U,
    caseId:SCOPE_C,workspaceId:SCOPE_W,action:'get'},
  action:'get',
});
const scopeReject=(patch)=>{
  const input=scopeFixture();
  for(const [key, value] of Object.entries(patch)) input[key]=value;
  const out=verifyScope(input);
  assert.deepEqual(out,{ok:false,status:403,code:'SCOPE_NOT_VERIFIED'});
};

test('WZ-01 scope: verified workspace case is permitted for this synthetic contract only',()=>{
  const result=verifyScope(scopeFixture());
  assert.equal(result.ok,true);
  assert.equal(result.actor,SCOPE_U);
  assert.equal(result.caseId,SCOPE_C);
  assert.equal(result.workspaceId,SCOPE_W);
  assert.equal(result.mustScopeEveryReadAndWrite,true);
  assert.equal(result.approvedForLiveDeployment,false);
  assert.equal(scopeContractStatus.productionWiringApproved,false);
});

test('WZ-01 scope: missing/revoked principal or human membership never passes',()=>{
  const f=scopeFixture();
  scopeReject({principal:null});
  scopeReject({principal:{...f.principal,sessionActive:false}});
  scopeReject({principal:{...f.principal,serverVerified:false}});
  scopeReject({membership:null});
  scopeReject({membership:{...f.membership,humanValidated:false}});
  scopeReject({membership:{...f.membership,active:false}});
  scopeReject({membership:{...f.membership,authUserId:SCOPE_OTHER}});
  scopeReject({membership:{...f.membership,serverVerified:false}});
});

test('WZ-01 scope: missing FK, legacy case number, wrong case or tenant fails closed',()=>{
  const f=scopeFixture();
  scopeReject({handoff:{case_id:null,case_number:'fictional-26'}});
  scopeReject({handoff:{case_id:undefined,case_number:'fictional-26'}});
  scopeReject({handoff:{case_id:SCOPE_OTHER}});
  scopeReject({caseRecord:{...f.caseRecord,workspace_id:null}});
  scopeReject({caseRecord:{...f.caseRecord,workspace_id:SCOPE_OTHER}});
  scopeReject({membership:{...f.membership,workspaceId:SCOPE_OTHER}});
});

test('WZ-01 scope: assignment and action grant are independently required',()=>{
  const f=scopeFixture();
  scopeReject({assignment:null});
  scopeReject({assignment:{...f.assignment,serverVerified:false}});
  scopeReject({assignment:{...f.assignment,allowed:false}});
  scopeReject({assignment:{...f.assignment,authUserId:SCOPE_OTHER}});
  scopeReject({assignment:{...f.assignment,workspaceId:SCOPE_OTHER}});
  scopeReject({assignment:{...f.assignment,caseId:SCOPE_OTHER}});
  scopeReject({rolePermission:null});
  scopeReject({rolePermission:{...f.rolePermission,allowed:false}});
  scopeReject({rolePermission:{...f.rolePermission,action:'route'}});
  scopeReject({action:'flow-save'});
});

test('WZ-01 scope: unscoped list, health and unknown action cannot use case grant',()=>{
  scopeReject({action:'list'});
  scopeReject({action:'health'});
  scopeReject({action:'get-everything'});
  scopeReject({action:'admin'});
});

test('WZ-01 scope: caller-submitted actor/tenant cannot override trusted identifiers',()=>{
  const fixture=scopeFixture();
  const result=verifyScope({...fixture,
    actor:SCOPE_OTHER,tenantId:SCOPE_OTHER,
    body:{userId:SCOPE_OTHER,workspaceId:SCOPE_OTHER,caseId:SCOPE_OTHER}});
  assert.equal(result.ok,true);
  assert.equal(result.actor,SCOPE_U);
  assert.equal(result.workspaceId,SCOPE_W);
});
