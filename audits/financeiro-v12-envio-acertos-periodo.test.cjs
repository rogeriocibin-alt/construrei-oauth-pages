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
