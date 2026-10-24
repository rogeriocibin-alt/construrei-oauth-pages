// CONSTRU-REI: PUBLIC, GET-only F00-F09 routing smoke. No session, no data mutation.
const base='https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/flow-canonical-20261001/';
const expected={
  f00:['cr-f00-intake'], f01:['cr-flow-runtime-v2'],
  f02:['cr-flow-runtime-v2'], f03:['cr-flow-runtime-v2']
};
for (let i=4; i<=9; i++) expected['f'+String(i).padStart(2,'0')]=['cr-flow-runtime-v2','central-atendimento'];
let passed=0;
for (let i=0; i<=9; i++) {
  const module='f'+String(i).padStart(2,'0');
  try {
    const response=await fetch(base+module+'/index.html?audit=20261024',{
      cache:'no-store',signal:AbortSignal.timeout(15000)
    });
    const html=await response.text();
    const missing=expected[module].filter(slug=>!html.includes('/functions/v1/'+slug));
    const ok=response.status===200&&missing.length===0;
    if(ok)passed++;
    console.log(JSON.stringify({module,http:response.status,expected_routes:expected[module].length,missing_routes:missing,pass:ok}));
  } catch(err) {
    console.log(JSON.stringify({module,pass:false,error_name:err.name}));
  }
}
console.log('APP_F00_F09_STATIC='+passed+'/10');
if(passed!==10)process.exitCode=1;
