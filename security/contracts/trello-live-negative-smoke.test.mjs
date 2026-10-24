/** Live, NO-CREDENTIAL, NO-WRITE regression checks. This is not an E2E authorization signoff.
 * These intentionally unauthenticated requests MUST NOT reach mutation handlers.
 * In case of changed external behavior, fail CI rather than silently green-light.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
const root='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/';
const checks=[
 ['candidate public health','cr-finance-v12-safe-trello-candidate-20261021?action=health','GET',200],
 ['V12 commit without director session','cr-finance-v12-safe-trello-candidate-20261021?action=commit','POST',401],
 ['V12 status without director session','cr-finance-v12-safe-trello-candidate-20261021?action=status','POST',401],
 ['legacy Trello repair without key','cr-trello-gestao-vista-v2?action=repair-list','GET',403],
 ['capital giro sync without sig','cr-trello-capital-giro-v1?action=sync','POST',403],
 ['capital giro summary without session','cr-trello-capital-giro-v1?action=summary','GET',401],
];
for(const [name,path,method,expected] of checks){
 test(name, {timeout:15000}, async()=>{
   const r=await fetch(root+path,{method,headers:{'content-type':'application/json'},...(method==='POST'?{body:'{}'}:{}),signal:AbortSignal.timeout(12000)});
   assert.equal(r.status,expected,name+': HTTP '+r.status);
 });
}
