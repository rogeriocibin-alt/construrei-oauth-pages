// GET-only PWA/APP smoke. No authentication, transitions or data modifications.
const root='https://rogeriocibin-alt.github.io/construrei-oauth-pages/';
const paths=['gestor-projeto/version.json','gestor-projeto/sw.js','gestor-projeto/app.js','gestor-projeto/index.html','preview/app-official-candidate-20261002/index.html'];
const rs=[];for(const path of paths){try{
const r=await fetch(root+path+'?smoke=20261024',{cache:'no-store',signal:AbortSignal.timeout(12000)});
rs.push({path,status:r.status,body:await r.text()});
}catch(e){rs.push({path,error:e.name,body:''})}}
const version=JSON.parse(rs[0].body||'{}'),build=String(version.build||'');
const checks=[
['public resources HTTP 200',rs.every(r=>r.status===200)],
['manifest official 1.2.5.2',version.version==='1.2.5.2'&&version.environment==='canonical'],
['service worker build agrees with manifest',build!==''&&rs[1].body.includes("const BUILD='"+build+"'")],
['APP public candidate HTML exists',/<html/i.test(rs[4].body)&&/CONSTRU-REI|Atendimento/i.test(rs[4].body)],
['Gestor JS exposes CURRENT_RELEASE',rs[2].body.includes('CURRENT_RELEASE')],
];let failures=0;for(const [name,ok] of checks){if(!ok)failures++;console.log(JSON.stringify({name,pass:ok}))}
console.log('PWA_APP_READ_ONLY='+String(checks.length-failures)+'/'+checks.length);if(failures)process.exitCode=1;
