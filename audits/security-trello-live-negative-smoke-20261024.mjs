// Re-run only without credentials; these expected rejects cannot authorize a write.
const base='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/';
const cases=[
['V12 health','cr-finance-v12-safe-trello-candidate-20261021?action=health','GET',200],
['V12 commit denied','cr-finance-v12-safe-trello-candidate-20261021?action=commit','POST',401],
['V12 status denied','cr-finance-v12-safe-trello-candidate-20261021?action=status','POST',401],
['legacy repair denied','cr-trello-gestao-vista-v2?action=repair-list','GET',403],
['capital sync denied','cr-trello-capital-giro-v1?action=sync','POST',403],
['capital summary denied','cr-trello-capital-giro-v1?action=summary','GET',401],
];let failures=0;
for(const [name,path,method,expected] of cases){try{
const r=await fetch(base+path,{method,headers:{'content-type':'application/json'},...(method==='POST'?{body:'{}'}:{}),signal:AbortSignal.timeout(12000)});
const ok=r.status===expected;if(!ok)failures++;console.log(JSON.stringify({name,status:r.status,expected,ok}));
}catch(e){failures++;console.log(JSON.stringify({name,network_error:e.name}))}}
console.log('LIVE_NEGATIVE_SMOKE='+String(cases.length-failures)+'/'+cases.length);
if(failures)process.exitCode=1;
