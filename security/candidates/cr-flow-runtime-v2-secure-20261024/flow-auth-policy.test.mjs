import test from 'node:test';
import assert from 'node:assert/strict';
import {allowedAction as allowed,ROLE_DIRECTOR,ROLE_TECH,ROLE_F00} from './flow-auth-policy.mjs';
for(const op of ['list','get','route','visit-return','budget-base','budget-audit','budget-save','budget-release','proposal-save','flow-state','flow-save','flow-advance','ai-assist']){
 test('anonymous cannot '+op,()=>assert.equal(allowed(null,op,{phase:'F01',flow_code:'F04'}),false));
 test('unknown role cannot '+op,()=>assert.equal(allowed('GABRIELLY_CLIENT_CLAIM',op,{phase:'F01',flow_code:'F04'}),false));
}
test('director role can use genuine APP actions',()=>{for(const a of ['list','get','route','flow-save','flow-advance','budget-release'])assert.equal(allowed(ROLE_DIRECTOR,a,{flow_code:'F09'}),true)});
test('technical can edit F04 through F07 but not F08/F09, budgets, route or proposal',()=>{
 for(const i of [4,5,6,7])assert.equal(allowed(ROLE_TECH,'flow-save',{flow_code:'F0'+i}),true);
 for(const i of [8,9])assert.equal(allowed(ROLE_TECH,'flow-save',{flow_code:'F0'+i}),false);
 for(const op of ['route','proposal-save','budget-release','budget-save'])assert.equal(allowed(ROLE_TECH,op,{}),false);
});
test('F00 operator can list only F01; deny per-case operations until server scope checked',()=>{
 assert.equal(allowed(ROLE_F00,'list',{phase:'F01'}),true);
 for(const phase of ['F02','F03','F04',''])assert.equal(allowed(ROLE_F00,'list',{phase}),false);
 for(const a of ['get','route','visit-return','budget-save','budget-release','flow-save','proposal-save'])assert.equal(allowed(ROLE_F00,a,{}),false);
});
test('scope cannot be granted by caller-supplied actor',()=>assert.equal(allowed(null,'route',{actor:'Rogério',phase:'F01'}),false));
test('health never confers action authority',()=>assert.equal(allowed(ROLE_DIRECTOR,'health'),false));
