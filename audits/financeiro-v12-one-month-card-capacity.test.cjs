const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const edge=fs.readFileSync(path.join(__dirname,'../candidates/financeiro-v12-period-close-20261024/index.ts'),'utf8');
test('apenas o cartão mensal existente recebe o corte, sem criação de novos cartões',()=>{
 assert.match(edge,/finCards\.find\(\(x:any\)=>normal\(x\.name\)\.trim\(\)===p\.monthName\+" 2026"\)/);
 assert.match(edge,/if\(!month\|\|!target\|\|!pending\)throw Error\("DESTINO_NAO_ENCONTRADO"\)/);
 assert.doesNotMatch(edge,/trello\(["']\/cards["']\s*,\s*["']POST["']/);
 assert.match(edge,/month:Number\(end\.slice\(5,7\)\)/);
});
test('cartão lotado: salva o corte integral em comentário DO PRÓPRIO MÊS, antes do resumo',()=>{
 assert.match(edge,/if\(next\.length>16384\)\{/);
 assert.match(edge,/await ensureMonthCutComment\(c,full\)/);
 assert.match(edge,/await trello\("\/cards\/"\+c\.month\.id,"PUT",\{desc:next\}\)/);
 assert.ok(edge.indexOf('await ensureMonthCutComment(c,full)')<edge.indexOf('await trello("/cards/"+c.month.id,"PUT"'));
 assert.match(edge,/\/"\+c\.month\.id\+"\/actions\/comments","POST",\{text:full\}/);
 assert.match(edge,/MONTH_COMMENT_SAVE_UNCONFIRMED/);
});
test('comentário idempotente — não repete conteúdo do mesmo período',()=>{
 assert.match(edge,/before\.some\(\(text:string\)=>text\.includes\(marker\(c\.p\)\)\)/);
 assert.match(edge,/marker\(c\.p\)/);
 assert.match(edge,/PERIOD_ALREADY_SENT/);
 assert.match(edge,/MONTH_CARD_CAPACITY_EXCEEDED/);
});
test('resumo compacto inclui todas obras, base, custos, lucro, rateio e chave',()=>{
 const i=edge.indexOf('function compactMonthCut('),j=edge.indexOf('async function ensureMonthCutComment(',i);
 assert.ok(i>=0&&j>i);
 const functionCode=edge.slice(i,j).replace('c:any','c');
 const context={brl:n=>'R$ '+(n/100).toFixed(2),marker:p=>'CR-ACERTO-PERIODO|'+p.start+'_'+p.end+'|'+p.cases.join(',')};
 vm.runInNewContext(functionCode+'\nthis.fn=compactMonthCut',context);
 const cases=['447-26','586-26','615-26','655-26','657-26','666-26','675-26','691-26','694-26','716-26','717-26','725-26'];
 const c={p:{start:'2026-09-17',end:'2026-09-29',cases},totals:{count:12,base_cents:3741848,cost_cents:2627303,profit_cents:1114545,fabricio_cents:222909,eder_cents:312073,rogerio_cents:312073,gabi_cents:156036,capital_cents:111454}};
 const out=context.fn(c);
 assert.ok(out.length<650,'o resumo deve caber nos 654 caracteres livres do setembro');
 for(const id of cases)assert.ok(out.includes(id),id);
 for(const key of ['37418.48','26273.03','11145.45','2229.09','3120.73','1560.36','1114.54'])assert.ok(out.includes(key),key);
 assert.match(out,/CR-ACERTO-PERIODO/);
});

test('indexa também os comentários históricos do cartão mensal antes de autorizar novo corte',()=>{
 assert.match(edge,/monthlyTexts=await readAllMonthCommentTexts\(month\.id\)/);
 assert.match(edge,/MONTH_COMMENTS_PAGINATION_INCOMPLETE/);
 assert.match(edge,/monthlyTexts\.some\(\(t:string\)=>t\.includes\(marker\(p\)\)\)/);
 assert.match(edge,/if\(duplicate\)throw Error\("PERIOD_ALREADY_SENT"\)/);
 assert.match(edge,/monthlyTexts\.some\(\(t:string\)=>hasCase\(t,c\)\)/);
});

test('busca duplicidades também nos comentários de outros meses sem escrever em cartões adicionais',()=>{
 assert.match(edge,/otherMonths=finCards\.filter/);
 assert.match(edge,/Promise\.all\(otherMonths\.map\(\(x:any\)=>readAllMonthCommentTexts\(x\.id\)\)/);
 assert.match(edge,/MONTH_COMMENTS_UNAVAILABLE/);
 assert.match(edge,/historicalTexts\.some\(\(t:string\)=>hasCase\(t,c\)\)/);
 assert.match(edge,/historicalTexts\.some\(\(t:string\)=>t\.includes\(marker\(p\)\)\)/);
});
