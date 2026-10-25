const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');
function helper(name){
 const re=new RegExp('function '+name+'\\([^)]*\\)\\{[\\s\\S]*?\\n\\}');
 const m=html.match(re);assert.ok(m,'função '+name+' presente');
 const ctx=vm.createContext({});
 vm.runInContext(m[0]+';this.helper='+name+';',ctx);
 return ctx.helper;
}
test('todos os scripts inline continuam com sintaxe válida',()=>{
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.ok(scripts.length>=10);
 for(const [i,m] of scripts.entries())if(!m[0].includes('src='))assert.doesNotThrow(()=>new vm.Script(m[1]),'script '+i);
});
test('lista mensal fechada mantém custo pendente e orienta conferência sem nova escrita',()=>{
 const explain=helper('crExistingError');
 const s=explain('EXISTING_WORK_LIST_NOT_ELIGIBLE','791-26');
 assert.match(s,/791-26/);assert.match(s,/outra obra/);assert.match(s,/pendente/);assert.match(s,/Não altere/);
 assert.match(html,/editorStatus\.textContent=crExistingError\(e\?\.message\|\|e,obra\)/);
});
test('exceções de cartão duplicado ou transferido não sugerem gravação',()=>{
 const explain=helper('crExistingError');
 assert.match(explain('EXISTING_DUPLICATE_WORK_CARDS','791-26'),/duplicidade/);
 assert.match(explain('EXISTING_WORK_MOVED_OR_CHANGED','791-26'),/Atualize/);
});
test('falha de autenticação de serviço é distinta de login do diretor',()=>{
 const explain=helper('crpFriendlyError');
 assert.match(explain('ACERTO_LIVE_SERVICE_AUTH_REJECTED'),/autenticação interna/);
 assert.match(explain('ACERTO_LIVE_HTTP_401'),/autenticação interna/);
 assert.match(explain('DIRECTOR_SESSION_REQUIRED'),/Sessão de diretor/);
 assert.match(html,/PRÉVIA BLOQUEADA: "\+crpFriendlyError\(e\.message\)/);
});