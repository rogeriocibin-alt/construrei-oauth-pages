const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../candidates/financeiro-v12-period-close-20261024/cora-aprovisionamento-backend/index.ts'),'utf8');
const head=src.indexOf('async function existingMatchCandidates('),end=src.indexOf('async function existingLinksForCard(',head);
assert.ok(head>=0&&end>head);
const code=src.slice(head,end).replace('p:ReturnType<typeof clean>,k:string,costCase:string=p.case','p,k,costCase=p.case').replace('const matches:{match_key:string;line:string}[]=[];','const matches=[];').replaceAll('(c:any)','(c)').replaceAll('(x:any)','(x)');
const data={lists:[{id:'monthly',name:'10. OUTUBRO 26'},{id:'open',name:'AG. PAGAMENTO'}],cards:[{id:'id791',name:'✅ (791-26) Encerrada',idList:'monthly',shortUrl:'https://trello.com/c/vQ91NeQg'},{id:'id809',name:'✅ (809-26) Aberta',idList:'open',shortUrl:'https://trello.com/c/5JGXbMJw'}]};
const baseLine='23/10 - R$41,90 Materiais - ANDREY JOHNNY - Reembolso 791-26 - Ref. PIX';
function run(desc){
const context=vm.createContext({
BOARD_2026:'6974b24c16d17ca76351a950',
trelloApiRead:async url=>url.includes('/lists?')?data.lists:data.cards,
caseInName:s=>(String(s).match(/(\d{1,5}-26)/)||[])[1]||null,
allowedList:(dir,name)=>/AG\.? PAGAMENTO|EM ANDAMENTO|AG\.? ACERTO/.test(name),
shortLink:s=>s,
card:async()=>({id:'id809',idList:'open',name:data.cards[1].name,shortUrl:data.cards[1].shortUrl,desc}),
amount:s=>Math.round(Number(String(s).replace('.','').replace(',','.'))*100),
sha256:async s=>'key_'+s,
});
vm.runInContext(code+'\nthis.match=existingMatchCandidates',context);
const p={operation_id:'CORA_abc',case:'791-26',date:'2026-10-23',amount_cents:4190,direction:'OUT'};
return {ctx:context,p};
}
test('cruzada 791 origem e 809 destino aceita vínculo de linha exata',async()=>{const x=run('Custos:\n'+baseLine+'\nTotal Custos: R$ 41,90');const v=await x.ctx.match(x.p,'mock','809-26');assert.equal(v.matches.length,1);assert.equal(v.origin_case,'791-26');assert.equal(v.cost_case,'809-26');});
test('obra 791 encerrada continua bloqueada se operador não informou destino',async()=>{const x=run('Custos:\n'+baseLine);await assert.rejects(x.ctx.match(x.p,'mock'),/EXISTING_WORK_LIST_NOT_ELIGIBLE/);});
test('não permite conciliar despesa cruzada que não referencia a origem',async()=>{const x=run('Custos:\n23/10 - R$41,90 Materiais - ANDREY - Ref. PIX');const v=await x.ctx.match(x.p,'mock','809-26');assert.equal(v.matches.length,0);});
test('linha duplicada no destino não pode ser vinculada',async()=>{const x=run('Custos:\n'+baseLine+'\n'+baseLine);const v=await x.ctx.match(x.p,'mock','809-26');assert.equal(v.matches.length,0);});
test('destino inválido bloqueado antes de consultar cartões',async()=>{const x=run('Custos:\n'+baseLine);await assert.rejects(x.ctx.match(x.p,'mock','1-25'),/COST_DESTINATION_CASE_INVALID/);});
