const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.resolve(__dirname,'../preview/dashboard-financeiro-v12-envio-acertos-20261024/index.html'),'utf8');

test('estado inicial não é apresentado como consulta ao histórico do Capital',()=>{
  assert.match(html,/Nenhum encerramento foi executado nesta tela/);
  assert.match(html,/A mensagem não representa o histórico/);
  assert.doesNotMatch(html,/Nenhum período encerrado\. Use a prévia/);
});

test('ao alterar datas o autoteste fica pendente sem declarar que não há períodos anteriores',()=>{
  assert.match(html,/AUTOTESTE PENDENTE OU DESATUALIZADO/);
  assert.match(html,/Este aviso não informa se já existem períodos encerrados/);
  assert.match(html,/AUTOTESTE DESATUALIZADO — datas alteradas durante a consulta/);
});

test('botão real de fechamento mantém confirmação inicialmente bloqueada',()=>{
  assert.match(html,/id="cg-close-confirm"[^>]+disabled/);
  assert.match(html,/function invalidate\(\)\{preview=null;by\("cg-close-confirm"\)\.disabled=true;/);
});

test('scripts inline continuam válidos',()=>{
  const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length>0);
  scripts.forEach((s,i)=>{if(!s[0].includes('src='))assert.doesNotThrow(()=>new vm.Script(s[1]),'script '+i)});
});
