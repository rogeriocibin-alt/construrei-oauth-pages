// CONSTRU-REI V12 — teste estático sem rede e sem dados financeiros reais
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const p=path.join(__dirname,'index.html');
const s=readFileSync(p,'utf8');
let checks=0;
function check(condition,description){assert.ok(condition,description);checks++;}
const sections=[...s.matchAll(/<section id="([^"]+)" class="section(?: on)?"/g)].map(x=>x[1]);
check(sections.length===8,'Oito seções operacionais da V11 preservadas');
check(new Set(sections).size===8,'Sem seções repetidas');
for(const id of ['agora','corapro','cora','fin','hist','conc','cost','qual'])check(sections.includes(id),'Seção '+id+' preservada');
const nav=[...s.matchAll(/class="tab(?: on)?" data-t="([^"]+)"/g)].map(x=>x[1]);
check(nav.join('|')==='agora|corapro|cora|fin|hist|conc','Seis ambientes primários na ordem aprovada');
check(s.includes('const parent=id==="cost"?"fin":id==="qual"?"conc":id'),'Subabas associadas ao ambiente pai');
check(s.includes('V12_SOMENTE_LEITURA'),'Escritas fora dos canais restritos bloqueadas');
check(s.indexOf('id="v12-netguard"')<s.indexOf('async function api('),'Bloqueio presente antes do runtime de API');
check(s.includes('allowedLogin')||s.includes('const login=method==="POST"'),'Login autorizado sem liberar lançamentos');
check(s.includes('cr-cora-pro-v2-frame'),'Cora Pro V2 integrado');
check(s.includes('gestao-cora-pro-v2-20261020'),'Mesmo Cora Pro V2 homologado');
check(s.includes('v12-bank-audit'),'Quadros de auditoria bancária');
check(s.includes('37 com zeros substitutos'),'Saldo ausente não confundido com zero');
check(s.includes('Agosto/2023: R$ 300,00'),'Divergência histórica sinalizada');
check(s.includes('Dezembro/2023: R$ 200,00'),'Segunda divergência histórica sinalizada');
check(s.includes('04/06–12/06')&&s.includes('Conferência operacional por período'),'Auditoria histórica do capital preservada sem duplicar montantes');
check(s.includes('N/D · bases distintas'),'Margem de bases divergentes não é apresentada');
check(s.includes('N/D · parcial'),'Histórico parcial explicitado');
check(s.includes('V12 · VALIDAÇÃO'),'Candidata claramente identificada');
check(s.includes('background:#f5f9fc')&&s.includes('#16975e')&&s.includes('#d64c59'),'Semântica cromática aplicada');
check(s.includes('max-width:550px'),'Regras responsivas móveis');
for(const id of ['v12-exec-cockpit','v12ex-gross','v12ex-cost','v12ex-profit','v12ex-margin','v12ex-bank-balance','v12ex-receive','v12ex-ops-chart','v12ex-margin-chart'])check(s.includes('id="'+id+'"'),'Painel executivo preserva '+id);
for(const id of ['v12ex-year','v12ex-month','v12ex-status','v12ex-find','v12ex-reset'])check(s.includes('id="'+id+'"'),'Filtro executivo '+id);
check(s.includes('window.v12ExecRender()'),'KPIs executivos atualizados após leitura Trello');
check(s.includes('candidate?.valid?[candidate.gross,candidate.cost,candidate.profit]:null'),'Gráficos apresentam somente agregados consistentes ou subconjuntos rastreáveis');
check(s.includes('limited.eligible>0')&&s.includes('Receita do subconjunto comparável'),'Cálculo parcial somente de obras com bases comparáveis');
check(s.includes('v12ComparableRows(year,month)'),'Regra de subtotais nos acertos');
check(s.includes('typeof n!=="boolean"'),'Números ausentes ou inválidos não são convertidos em zero');
check(s.includes('v12ex-semantic-palette-20261021'),'Paleta semântica CONSTRU-REI');
check(s.includes('cr-finance-v12-safe-trello-candidate-20261021'),'Canal de escrita em obra com idempotência preservado');
check(s.includes('const capitalV11=method===\"POST\"')&&s.includes('url.searchParams.get(\"action\")===\"debit\"'),'Capital libera somente ação de débito legado autenticado');
check(s.includes('id=\"v12ex-capital-shortcut\"')&&s.includes('#fin #v11cap{display:block!important;'),'Capital de Giro V11 navegável e visível');
check(s.includes('window.v12CapitalGo'),'Atalho executivo ao capital de giro');
check((s.match(/id="v12-capital-workspace"/g)||[]).length===1,'Um só espaço operacional Capital de Giro');
check(s.indexOf('id="v12-capital-workspace"')<s.indexOf('id="v12-live-acertos"')&&s.indexOf('id="v12-live-acertos"')<s.indexOf('id="finperiod"'),'Capital de Giro vem primeiro, antes de acertos vivos e rateios históricos');
for(const anchor of ['#v12-capital-workspace','#v12-live-acertos','#finperiod'])check(s.includes('href="'+anchor+'"'),'Navegação por âncora '+anchor);
check((s.match(/<nav class="v12fin-nav"/g)||[]).length===1,'Navegação financeira única');

check((s.match(/id="cap"/g)||[]).length===1,'Resumo único do capital');
check((s.match(/id="v11cap-slot"/g)||[]).length===1,'Único formulário V11 acoplado à central');
check(s.includes("let cap=q('v11cap-slot')")&&s.includes("cap.insertAdjacentHTML('beforeend'"),'Rotina V11 renderizada dentro da central, não nos rateios');
check(!s.includes('<h3>Capital de Giro / Auditoria</h3>'),'Sem segunda área de capital dentro dos rateios');
check(s.includes('v12cap-hero')&&s.includes('v12cap-stat')&&s.includes('v12cap-pending'),'Saldo, gerado, consumido e pendência apresentados com hierarquia');
check(s.includes('window.v12CapitalAuditGo')&&s.includes('window.v12CapitalGo'),'Navegação unificada, sem módulo operacional paralelo');
const qual=s.slice(s.indexOf('<section id="qual"'),s.indexOf('<section id="corapro"'));
check(!qual.includes('v12-bank-audit'),'Quadro Cora não duplicado na subaba de qualidade');
check(s.includes('max-width:650px')&&s.includes('v12cap-workspace'),'Central do capital adaptada a celular');

check(s.includes('await v12ProtectedWrite("preview",p)'),'Preview utiliza o canal idempotente');
check(s.includes('await v12ProtectedWrite("commit",p)'),'Commit utiliza o canal idempotente');
const commitHandler=s.slice(s.indexOf('async function manualCommit(){'),s.indexOf('async function manualCheckStatus(){'));
check(commitHandler.includes('S.manualLastPayload=p'),'Operação é mantida para consulta após falhas ambíguas');
check(commitHandler.includes('b.disabled=true}}')&&!commitHandler.includes('b.disabled=false'),'Não permite reenvio imediato após falha');
check(s.includes('Não foi possível comprovar se houve gravação. Confira o Trello antes de qualquer repetição.'),'Consulta inconclusiva não afirma falsamente que nada foi lançado');
check(s.includes('V12_SOMENTE_LEITURA'),'Canal legado geral e fechamento permanecem bloqueados; exceção restrita ao capital V11');
check(s.includes('#cora .manualactions #mc_close{display:none!important}'),'Fechamento de obras não liberado sem homologação');
check(!s.includes('registro gravado e saldo projetado atualizado.'),'Escrita no Trello não afirma alterar saldo Cora');
const fs=require('node:fs');
const edge=fs.readFileSync(path.join(__dirname,'finance-v12-safe-trello-edge.ts'),'utf8');
for(const x of ['ADMIN_MASTER_ROGERIO','cr_finance_v12_claim','cr_finance_v12_finish','REVIEW_REQUIRED','TRELLO_MARKER_NOT_CONFIRMED','CRV12OP_','OPERATION_NOT_RETRYABLE'])
 check(edge.includes(x),'Endpoint seguro inclui '+x);

check(s.includes('q(\'v11commit\').disabled=true}finally{pending=false}'),'Falha ambígua no capital bloqueia repetição imediata');

check(!/BEGIN (RSA )?PRIVATE KEY|client_secret\s*[:=]/i.test(s),'Sem segredo bancário embutido');
const scripts=[...s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
check(scripts.length>=3,'Scripts inline presentes');
for(const [i,m] of scripts.entries()){new vm.Script(m[1],{filename:'candidate-inline-'+i+'.js'});checks++;}
const selectors=[...s.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
const unique=new Set(selectors);
check(unique.size===selectors.length,'Todos os IDs únicos no DOM');
console.log('V12 smoke aprovado:',checks,'verificações offline e',scripts.length,'scripts válidos');
