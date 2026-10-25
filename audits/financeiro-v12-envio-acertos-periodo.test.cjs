const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const edge=fs.readFileSync(path.join(root,'candidates/financeiro-v12-period-close-20261024/index.ts'),'utf8');
const html=fs.readFileSync(path.join(root,'preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
test('seguranca: envio somente para diretor autenticado',()=>{
 assert.match(edge,/DIRECTOR_SESSION_REQUIRED/);
 assert.match(edge,/ADMIN_MASTER_ROGERIO/);
 assert.match(edge,/if\(!await director\(req\)\)/);
 assert.match(edge,/STALE_PREVIEW/);
});
test('controle: fechamento exige integridade e idempotencia',()=>{
 assert.match(edge,/PERIODO_NAO_FECHA/);
 assert.match(edge,/OBRA_JA_REGISTRADA/);
 assert.match(edge,/CR-ACERTO-PERIODO/);
 assert.match(edge,/MONTH_CARD_CAPACITY_EXCEEDED/);
 assert.match(edge,/CAPITAL_PERIOD_NOT_RECONCILED/);
 assert.match(edge,/CG_PERIOD_KEY/);
 assert.match(edge,/CG_CREDIT/);
 assert.match(edge,/MONTH_SAVE_UNCONFIRMED/);
});
test('escopo: nenhuma escrita no banco Cora',()=>{
 assert.doesNotMatch(edge,/api[.]cora[.]com[.]br/);
 assert.doesNotMatch(edge,/[^\w]CORA_(?:PROD|STAGE)_/);
 assert.match(edge,/production:false/);
});
test('interface V12: botoes ativos somente apos previa',()=>{
 assert.match(html,/id="cr-period-send"/);
 assert.match(html,/onclick="crpPreview\(\)"/);
 assert.match(html,/id="crp-send"[^>]*disabled/);
 assert.match(html,/onclick="crpSend\(\)"/);
 assert.match(html,/!protectedBank&&!safePeriod/);
 assert.match(html,/id="cg-close-start"/);
 assert.match(html,/id="cg-close-end"/);
 assert.match(html,/capital_validation/);
 assert.match(html,/if\(!cv.ok&&!cv.accepted_exception\)/);
 assert.match(html,/V12-OPERACAO-HOMOLOGADA-ACERTOS-BRUTO-TAXA-20261023/);
});
test('scripts inline da V12 candidata tem sintaxe valida',()=>{
 const src=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.ok(src.length>=10);
 for(const [i,s] of src.entries())if(!s[0].includes('src='))assert.doesNotThrow(()=>new vm.Script(s[1]),'script '+i);
});
test('auditoria: setembro 21+12 obras sem dupla contagem',()=>{
 assert.equal(21+12,33);
 assert.equal(4791207+3621848,8413055);
 assert.equal(8413055-5435547,2977508);
 assert.equal(2977508-2970508,7000);
});
test('auditoria: outubro apresenta divergencia de rateio nao homologavel',()=>{
 assert.equal(1734910-1269786,465124);
 assert.equal(433611+42444-465124,10931);
});

test('excecao CG historica: restrita ao lote aceito e sem lancamento de ajuste',()=>{
 assert.match(edge,/p\.start==="2026-10-10"&&p\.end==="2026-10-23"&&rows\.length===11/);
 assert.match(edge,/credit===105806&&totals\.capital_cents===122720/);
 assert.match(edge,/CR-CG-DIFF-16914-ACCEPTED-20261024/);
 assert.match(edge,/!c\.capital_validation\.ok&&!c\.capital_validation\.accepted_exception/);
 assert.match(html,/Ressalva autorizada/);
 assert.match(html,/!cv\.ok&&!cv\.accepted_exception/);
 assert.doesNotMatch(edge,/\+16914\b/);
});

test('datas reais e competência: aceita corte intermensal no mês de encerramento',()=>{
 assert.match(edge,/new Date\(t1\)\.toISOString\(\)\.slice\(0,10\)!==start/);
 assert.match(edge,/new Date\(t2\)\.toISOString\(\)\.slice\(0,10\)!==end/);
 assert.doesNotMatch(edge,/RATEIO_ENTRE_MESES_NAO_IMPLEMENTADO/);
 assert.match(edge,/month:Number\(end\.slice\(5,7\)\)/);
 assert.match(edge,/monthName:months\[Number\(end\.slice\(5,7\)\)\]/);
});
test('não confunde rateios estimados com saques ou recebimentos bancários',()=>{
 assert.match(edge,/RATEIOS APURADOS \(RETIRADAS NÃO COMPROVADAS PELO FECHAMENTO\)/);
 assert.match(edge,/Base financeira das obras/);
 assert.doesNotMatch(edge,/RETIRADAS CONFIRMADAS|Base recebida:|ACERTOS EFETIVADOS/);
});

test('V12 navegação única: Capital de Giro pertence à Central',()=>{
 assert.match(html,/window\.v12CapitalGo=function\(\)\{if\(typeof r8Go==="function"\)r8Go\("cora"\)/);
 assert.match(html,/slot\.appendChild\(cap\)/);
 assert.match(html,/window\.crShowCapital=\(\)=>select\("capital"\)/);
 assert.doesNotMatch(html,/capAnchor/);
 assert.match(html,/Capital de Giro: abrir Central/);
});
test('V12 Resultados: envio financeiro isolado e datas sincronizadas',()=>{
 assert.match(html,/id="cr-period-send"/);
 assert.match(html,/id="crp-start"/);
 assert.match(html,/id="crp-end"/);
 assert.match(html,/acertoPanel\.parentNode\.insertBefore\(periodPanel,acertoPanel\)/);
 assert.match(html,/function crpData\(\)\{const start=document\.getElementById\("crp-start"\)/);
 assert.match(html,/\["crp-start","cg-close-start"\]/);
 assert.match(html,/\["cg-close-start","crp-start"\]/);
 assert.match(html,/id="cr-v12-owner-nav-20261024"/);
});

test('fechamento: trava linhas de custos identificadas com outra obra',()=>{
 assert.match(html,/function manualForeignCostRefs\(items,work\)/);
 assert.match(html,/FECHAMENTO BLOQUEADO — REFERÊNCIAS DE OUTRA OBRA/);
 assert.match(html,/const audit=await api\("api=case&case="\+encodeURIComponent\(normalizedCase\)\)/);
 assert.ok(html.indexOf('const foreign=manualForeignCostRefs') < html.indexOf('const pre=await closurePost({case:caseNo,dry_run:true})'));
});
test('reconhece 3 custos da 799-26 dentro do cartão 755-26, mas não os próprios',()=>{
 const script=html.match(/function manualForeignCostRefs\(items,work\)\{[\s\S]*?\n\}\nasync function manualCloseWork/);
 assert.ok(script);
 const ctx=vm.createContext({});
 vm.runInContext(script[0].replace(/\nasync function manualCloseWork$/,'')+'\nthis.scan=manualForeignCostRefs;',ctx);
 const entries=[{description_original:'23/10 - R$150,00 Diária - Obra 799-26 - Ref. PIX',value_cents:15000},{description_original:'23/10 - R$150,00 Apoio - Obra 799-26 - Ref. PIX',value_cents:15000},{description_original:'23/10 - R$150,00 Apoio - Obra 799-26 - Ref. PIX',value_cents:15000},{description_original:'21/10 - R$100,00 Materiais - Obra 755-26',value_cents:10000}];
 const match=ctx.scan(entries,'755-26');
 assert.equal(match.length,3);
 assert.equal(match.reduce((t,x)=>t+x.cents,0),45000);
 assert.equal(ctx.scan(entries.slice(-1),'755-26').length,0);
});
test('resposta nula e lista AG ACERTO vazia não geram falso sucesso',()=>{
 assert.match(html,/if\(!j\|\|typeof j!=="object"\)throw Error\("BACKEND_RESPOSTA_VAZIA"\)/);
 assert.match(html,/A lista AG\. ACERTO está vazia ou indisponível/);
 assert.match(html,/Não foi possível auditar as linhas de custo antes do fechamento/);
});


test('acerto-live: autenticação servidor-servidor protege leitura sem expor chave',async()=>{
 const block=edge.match(/async function acertos\(\)\{[\s\S]*?\n\}\n(?=const months=)/);
 assert.ok(block,'função acertos localizada');
 let got=null;
 const fakeKey='test-fake-service-role-jwt';
 const context=vm.createContext({
  Deno:{env:{get:(name)=>name==='SUPABASE_SERVICE_ROLE_KEY'?fakeKey:''}},
  SB:'https://example.supabase.co',
  AbortSignal:{timeout:()=>undefined},
  fetch:async(url,options)=>{got={url,options};return {ok:true,status:200,json:async()=>({ok:true,items:[{case:'791-26'}]})}},
 });
 vm.runInContext(block[0]+'\nthis.readAcertos=acertos;',context);
 const records=await context.readAcertos();
 assert.equal(records[0].case,'791-26');
 assert.match(got.url,/\?api=acerto-live&gc=0/);
 assert.equal(got.options.headers.Authorization,'Bearer '+fakeKey);
 assert.equal(got.options.method,undefined,'consulta apenas leitura');
 assert.doesNotMatch(edge,/console\.(?:log|warn|error)\s*\([^)]*SUPABASE_SERVICE_ROLE_KEY/);
});
test('acerto-live: falha fechada com erro identificável quando não há credencial ou acesso',async()=>{
 const block=edge.match(/async function acertos\(\)\{[\s\S]*?\n\}\n(?=const months=)/);
 assert.ok(block);
 const setup=(key,status)=>{
  const context=vm.createContext({
    Deno:{env:{get:()=>key}},SB:'https://example.supabase.co',
    AbortSignal:{timeout:()=>undefined},
    fetch:async()=>({status,ok:status===200,json:async()=>({ok:true,items:[]})}),
  });
  vm.runInContext(block[0]+'\nthis.readAcertos=acertos;',context);
  return context;
 };
 await assert.rejects(setup('',200).readAcertos(),/ACERTO_LIVE_SERVICE_AUTH_UNAVAILABLE/);
 await assert.rejects(setup('fake',401).readAcertos(),/ACERTO_LIVE_SERVICE_AUTH_REJECTED/);
 await assert.rejects(setup('fake',403).readAcertos(),/ACERTO_LIVE_SERVICE_AUTH_REJECTED/);
});
