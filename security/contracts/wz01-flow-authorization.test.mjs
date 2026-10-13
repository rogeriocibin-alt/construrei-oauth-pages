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


import { verifyServerCaseScope as verifyScope, verifyCaseScopeFromTrustedAdapters as verifyAdapters, verifyScopedListFromTrustedAdapters as verifyList, scopeContractStatus }
  from './wz01-server-scope-planner.mjs';

const SCOPE_U='11111111-1111-4111-8111-111111111111';
const SCOPE_C='22222222-2222-4222-8222-222222222222';
const SCOPE_W='33333333-3333-4333-8333-333333333333';
const SCOPE_OTHER='44444444-4444-4444-8444-444444444444';
const scopeFixture=()=>({
  principal:{serverVerified:true,sessionActive:true,userId:SCOPE_U},
  membership:{serverVerified:true,active:true,humanValidated:true,
    authUserId:SCOPE_U,workspaceId:SCOPE_W},
  handoff:{serverVerified:true,case_id:SCOPE_C},
  caseRecord:{serverVerified:true,case_id:SCOPE_C,workspace_id:SCOPE_W},
  rolePermission:{serverVerified:true,allowed:true,authUserId:SCOPE_U,workspaceId:SCOPE_W,action:'get'},
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
  scopeReject({handoff:{case_id:SCOPE_C}});
  scopeReject({handoff:{...f.handoff,serverVerified:false}});
  scopeReject({caseRecord:{case_id:SCOPE_C,workspace_id:SCOPE_W}});
  scopeReject({caseRecord:{...f.caseRecord,serverVerified:false}});
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
  scopeReject({rolePermission:{...f.rolePermission,workspaceId:SCOPE_OTHER}});
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

test('WZ-01 scope: malformed identities and partial trusted objects fail closed',()=>{
  const f=scopeFixture();
  for (const principal of [
    {...f.principal, userId:'not-a-uuid'},
    {...f.principal, userId:null},
    {...f.principal, serverVerified:'true'},
    {...f.principal, sessionActive:1},
  ]) scopeReject({principal});
  for (const membership of [
    {...f.membership, authUserId:'not-a-uuid'},
    {...f.membership, workspaceId:'not-a-uuid'},
    {...f.membership, serverVerified:1},
    {...f.membership, humanValidated:'true'},
  ]) scopeReject({membership});
  scopeReject({caseRecord:{...f.caseRecord, case_id:'legacy-case-26'}});
  scopeReject({handoff:{...f.handoff, case_id:'legacy-case-26'}});
});

test('WZ-01 scope: wrong grant identity, assignment action and workspace are rejected',()=>{
  const f=scopeFixture();
  scopeReject({rolePermission:{...f.rolePermission, authUserId:SCOPE_OTHER}});
  scopeReject({rolePermission:{...f.rolePermission, serverVerified:'true'}});
  scopeReject({assignment:{...f.assignment, action:'flow-save'}});
  scopeReject({assignment:{...f.assignment, serverVerified:'true'}});
  scopeReject({assignment:{...f.assignment, workspaceId:null}});
  assert.deepEqual(scopeContractStatus,{
    syntheticOnly:true,
    realSessionVerified:false,
    liveAdaptersImplemented:false,
    legacyBackfillApproved:false,
    productionWiringApproved:false,
  });
});


const verifiedLabAdapters=()=>({
  verifySession:async({accessToken})=>({
    userId:SCOPE_U,sessionActive:accessToken==='synthetic-session-token-123',
  }),
  findMembership:async({authUserId})=>({
    authUserId,workspaceId:SCOPE_W,active:true,humanValidated:true,
  }),
  findHandoffByToken:async({token})=>({case_id:SCOPE_C,token}),
  findCaseById:async({caseId})=>({case_id:caseId,workspace_id:SCOPE_W}),
  getActionPermission:async({authUserId,workspaceId,action})=>({
    authUserId,workspaceId,action,allowed:true,
  }),
  getCaseAssignment:async({authUserId,caseId,workspaceId,action})=>({
    authUserId,caseId,workspaceId,action,allowed:true,
  }),
});
const checkAdapter=(changes={})=>verifyAdapters({
  action:'get',authorization:TOKEN,handoffToken:'fictional-unique-handoff',
  adapters:verifiedLabAdapters(),...changes,
});

test('WZ-01 adapter seam: six independent verified lookups scoped to one case',async()=>{
  const calls=[];
  const adapters=verifiedLabAdapters();
  for (const key of Object.keys(adapters)) {
    const original=adapters[key];
    adapters[key]=async (args)=>{
      calls.push({key,args});
      return original(args);
    };
  }
  const result=await checkAdapter({adapters});
  assert.equal(result.ok,true);
  assert.equal(result.approvedForLiveDeployment,false);
  assert.equal(result.actor,SCOPE_U);
  assert.equal(result.caseId,SCOPE_C);
  assert.equal(result.workspaceId,SCOPE_W);
  assert.deepEqual(calls.map(x=>x.key),[
    'verifySession','findMembership','findHandoffByToken',
    'findCaseById','getActionPermission','getCaseAssignment',
  ]);
  assert.deepEqual(calls[2].args,{token:'fictional-unique-handoff'});
  assert.deepEqual(calls[3].args,{caseId:SCOPE_C});
  assert.deepEqual(calls[5].args,{
    authUserId:SCOPE_U,caseId:SCOPE_C,workspaceId:SCOPE_W,action:'get',
  });
  assert.equal(scopeContractStatus.productionWiringApproved,false);
});

test('WZ-01 adapter seam: token is locator, never an authorization grant',async()=>{
  const fixtures=[
    {authorization:null},
    {authorization:'Basic synthetic-session-token-123'},
    {authorization:'Bearer missing'},
    {handoffToken:''},
    {handoffToken:'short'},
    {handoffToken:'unsafe token with spaces'},
    {action:'list'},
    {action:'admin'},
    {action:'health'},
  ];
  for (const fields of fixtures) {
    const response=await checkAdapter(fields);
    assert.equal(response.ok,false,JSON.stringify(fields));
  }
  const adapters=verifiedLabAdapters();
  adapters.findMembership=async()=>null;
  assert.equal((await checkAdapter({adapters})).status,403);
  const wrongCase=verifiedLabAdapters();
  wrongCase.findHandoffByToken=async()=>({case_id:null,case_number:'fictional-26'});
  assert.equal((await checkAdapter({adapters:wrongCase})).status,403);
  const wrongToken=verifiedLabAdapters();
  wrongToken.findHandoffByToken=async()=>({case_id:SCOPE_C,token:'another-handoff'});
  assert.equal((await checkAdapter({adapters:wrongToken})).status,403);
});

test('WZ-01 adapter seam: no cross-tenant read, forged actor or role escalation',async()=>{
  let a=verifiedLabAdapters();
  a.findCaseById=async({caseId})=>({case_id:caseId,workspace_id:SCOPE_OTHER});
  assert.equal((await checkAdapter({adapters:a})).status,403);
  a=verifiedLabAdapters();
  a.getActionPermission=async({action,workspaceId})=>({allowed:true,action,workspaceId,authUserId:SCOPE_OTHER});
  assert.equal((await checkAdapter({adapters:a})).status,403);
  a=verifiedLabAdapters();
  a.getCaseAssignment=async({authUserId,caseId,workspaceId})=>({
    authUserId,caseId,workspaceId,allowed:true,action:'flow-save',
  });
  assert.equal((await checkAdapter({adapters:a})).status,403);
  const otherGrant=verifiedLabAdapters();
  otherGrant.getActionPermission=async({authUserId,action})=>({authUserId,action,workspaceId:SCOPE_OTHER,allowed:true});
  assert.equal((await checkAdapter({adapters:otherGrant})).status,403);
  const authorized=await checkAdapter({
    actor:SCOPE_OTHER,tenantId:SCOPE_OTHER,
    role:'ADMIN',body:{userId:SCOPE_OTHER,tenantId:SCOPE_OTHER,role:'ADMIN'},
  });
  assert.equal(authorized.ok,true);
  assert.equal(authorized.actor,SCOPE_U);
});

test('WZ-01 adapter seam: missing and failing callbacks cannot authorize',async()=>{
  const empty=await checkAdapter({adapters:{}});
  assert.deepEqual(empty,{ok:false,status:503,code:'SERVER_ADAPTERS_UNAVAILABLE'});
  const bad=verifiedLabAdapters();
  bad.findCaseById=async()=>{throw Error('private query text MUST_NOT_LEAK');};
  const denied=await checkAdapter({adapters:bad});
  assert.deepEqual(denied,{ok:false,status:503,code:'SERVER_ADAPTER_ERROR'});
  assert.equal(JSON.stringify(denied).includes('MUST_NOT_LEAK'),false);
  const expired=verifiedLabAdapters();
  expired.verifySession=async()=>({userId:SCOPE_U,sessionActive:false});
  assert.equal((await checkAdapter({adapters:expired})).status,401);
  const nullAssignment=verifiedLabAdapters();
  nullAssignment.getCaseAssignment=async()=>null;
  assert.equal((await checkAdapter({adapters:nullAssignment})).status,403);
});


const listAdapters=()=>({
  verifySession:async({accessToken})=>({
    userId:SCOPE_U,sessionActive:accessToken==='synthetic-session-token-123',
  }),
  findMembership:async({authUserId})=>({
    authUserId,workspaceId:SCOPE_W,active:true,humanValidated:true,
  }),
  getActionPermission:async({authUserId,workspaceId,action})=>({
    allowed:true,authUserId,workspaceId,action,
  }),
  getAuthorizedCaseIds:async({authUserId,workspaceId,action})=>({
    authUserId,workspaceId,action,mode:'assigned-cases-only',caseIds:[SCOPE_C],
  }),
});
const checkList=(patch={})=>verifyList({
  action:'list',authorization:TOKEN,adapters:listAdapters(),...patch,
});
test('WZ-01 list: returns bounded actor/workspace/case predicate, never data',async()=>{
  const a=await checkList();
  assert.equal(a.ok,true);
  assert.equal(a.actor,SCOPE_U);
  assert.equal(a.workspaceId,SCOPE_W);
  assert.deepEqual(a.caseIds,[SCOPE_C]);
  assert.equal(a.mustApplyWorkspaceAndCaseFilter,true);
  assert.equal(a.approvedForLiveDeployment,false);
  assert.equal(a.mayQueryDatabase,true);
  assert.equal(a.emptyResult,false);
  assert.equal(Object.hasOwn(a,'rows'),false);
  assert.equal(Object.isFrozen(a.caseIds),true);
});
test('WZ-01 list: deny anonymous, cross-workspace grant and forged scope',async()=>{
  assert.equal((await checkList({authorization:null})).status,401);
  assert.equal((await checkList({action:'get'})).status,403);
  let x=listAdapters();
  x.getActionPermission=async({authUserId,action})=>({
    allowed:true,authUserId,action,workspaceId:SCOPE_OTHER,
  });
  assert.equal((await checkList({adapters:x})).status,403);
  x=listAdapters();
  x.getAuthorizedCaseIds=async({authUserId,action})=>({
    authUserId,action,workspaceId:SCOPE_OTHER,
    mode:'assigned-cases-only',caseIds:[SCOPE_C],
  });
  assert.equal((await checkList({adapters:x})).status,403);
  x=listAdapters();
  x.getAuthorizedCaseIds=async({authUserId,workspaceId,action})=>({
    authUserId,workspaceId,action,mode:'all-tenants',caseIds:[SCOPE_C],
  });
  assert.equal((await checkList({adapters:x})).status,403);
});
test('WZ-01 list: reject invalid, repeated and unbounded case lists',async()=>{
  const cases=[
    null,
    [SCOPE_C,SCOPE_C],
    [SCOPE_C,'legacy-case-number'],
    Array(501).fill(SCOPE_C),
  ];
  for (const caseIds of cases) {
    const a=listAdapters();
    a.getAuthorizedCaseIds=async({authUserId,workspaceId,action})=>({
      authUserId,workspaceId,action,mode:'assigned-cases-only',caseIds,
    });
    assert.equal((await checkList({adapters:a})).status,403);
  }
  const empty=listAdapters();
  empty.getAuthorizedCaseIds=async({authUserId,workspaceId,action})=>({
    authUserId,workspaceId,action,mode:'assigned-cases-only',caseIds:[],
  });
  const permittedEmpty=await checkList({adapters:empty});
  assert.equal(permittedEmpty.ok,true);
  assert.deepEqual(permittedEmpty.caseIds,[]);
  assert.equal(permittedEmpty.mayQueryDatabase,false);
  assert.equal(permittedEmpty.emptyResult,true);
});
test('WZ-01 list: fail closed on revoked principal and missing/error adapters',async()=>{
  const missing=listAdapters();
  delete missing.getAuthorizedCaseIds;
  assert.equal((await checkList({adapters:missing})).status,503);
  const revoked=listAdapters();
  revoked.verifySession=async()=>({userId:SCOPE_U,sessionActive:false});
  assert.equal((await checkList({adapters:revoked})).status,401);
  const err=listAdapters();
  err.getAuthorizedCaseIds=async()=>{throw Error('secret query MUST_NOT_LEAK');};
  const denied=await checkList({adapters:err});
  assert.deepEqual(denied,{ok:false,status:503,code:'SERVER_ADAPTER_ERROR'});
  assert.equal(JSON.stringify(denied).includes('MUST_NOT_LEAK'),false);
});
