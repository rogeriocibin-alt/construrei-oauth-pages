(function(){
'use strict';

var API='https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-project-manager-v1-api-candidate-20261003';
var ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InlzcHVhYW1va2picm9zeXRxanBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4ODIwODEsImV4cCI6MjEwMzQ1ODA4MX0.flOLkvsLqDicDUgXaD3qIfwS8XtP8FNMKUMUF6XOCEc';
var lastPayload=null;
var lastVisit=null;
try{ lastVisit=localStorage.getItem('cr_pm_exec_last_visit'); }catch(e){}

function arr(v){return Array.isArray(v)?v:[];}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m];});}
function label(v){return String(v||'').replace(/_/g,' ');}
function pct(a,b){a=Number(a)||0;b=Number(b)||0;return b?Math.max(0,Math.min(100,Math.round(a*100/b))):0;}
function ageDays(dateStr){
  if(!dateStr)return 0;
  var d=new Date(String(dateStr).slice(0,10)+'T12:00:00-03:00');
  return Math.max(0,Math.floor((Date.now()-d.getTime())/86400000));
}
function fmt(v){
  if(!v)return '—';
  try{return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v));}
  catch(e){return String(v);}
}
function toneForSource(s){
  if(s==='healthy')return 'green';
  if(s==='error'||s==='blocked'||s==='degraded')return 'red';
  if(s==='stale'||s==='not_confirmed'||s==='unconfirmed')return 'amber';
  return 'blue';
}
function metric(title,value,meta,icon,view,tone,filter){
  return '<button class="xd-metric tone-'+esc(tone||'blue')+'" data-view="'+esc(view||'')+'" data-filter="'+esc(filter||'')+'">'+
    '<span class="xd-icon">'+esc(icon)+'</span><span class="xd-copy"><small>'+esc(title)+'</small><strong>'+esc(value)+'</strong><em>'+esc(meta)+'</em></span><span class="xd-arrow">→</span></button>';
}
function progress(labelText,part,total,meta,tone){
  var value=pct(part,total);
  return '<div class="xd-progress-row"><div><b>'+esc(labelText)+'</b><span>'+esc(part)+'/'+esc(total)+' • '+value+'%</span></div>'+
    '<div class="xd-progress-track"><i class="tone-'+esc(tone||'blue')+'" style="width:'+value+'%"></i></div><small>'+esc(meta)+'</small></div>';
}
function go(view,filter){
  if(!view)return;
  var btn=document.querySelector('.nav-btn[data-view="'+view+'"]');
  if(btn)btn.click();
  if(view==='pending'&&filter){
    setTimeout(function(){
      var f=document.querySelector('[data-pfilter="'+filter+'"]');
      if(f)f.click();
    },40);
  }
}
function normalize(data,live){
  data=data||{};live=live||{};
  var rows=arr(live.sources&&live.sources.sources);
  if(!rows.length)rows=arr(data.source_matrix).map(function(s){return {
    source_id:s.id,source_name:s.name,status:s.status,confidence:s.confidence,last_read_at:s.last_read,notes:s.note
  };});
  var stats=live.sources||{};
  var total=Number(stats.count!=null?stats.count:rows.length);
  var healthy=Number(stats.healthy!=null?stats.healthy:rows.filter(function(s){return s.status==='healthy';}).length);
  var degraded=Number(stats.degraded_or_error!=null?stats.degraded_or_error:rows.filter(function(s){return ['error','degraded','blocked'].indexOf(s.status)>=0;}).length);
  var stale=Number(stats.stale!=null?stats.stale:rows.filter(function(s){return s.status==='stale';}).length);
  var notConfirmed=Number(stats.not_confirmed!=null?stats.not_confirmed:rows.filter(function(s){return ['not_confirmed','unconfirmed'].indexOf(s.status)>=0;}).length);
  var findings=arr(live.findings).length?arr(live.findings):arr(data.audit_findings);
  var openFindings=findings.filter(function(x){return ['closed','not_applicable','accepted_risk'].indexOf(x.status)<0;});
  var severe=openFindings.filter(function(x){return ['critical','high'].indexOf(x.severity)>=0;});
  var recs=arr(live.reconciliations&&live.reconciliations.items).length?arr(live.reconciliations.items):arr(data.reconciliations);
  var openRecs=recs.filter(function(x){return ['closed','reconciled','resolved'].indexOf(x.status)<0;});
  var pending=arr(data.project_pending);
  var human=pending.filter(function(x){return x.human_action&&x.state!=='completed';});
  var blocked=pending.filter(function(x){return x.state==='blocked';});
  var old=pending.filter(function(x){return x.state!=='completed'&&ageDays(x.last_movement)>=3;});
  var fronts=arr(data.fronts);
  var active=fronts.filter(function(x){return ['executing','homologation'].indexOf(x.status)>=0;});
  var queue=fronts.filter(function(x){return x.status==='queue';});
  var tests=arr(data.cycle0&&data.cycle0.validation&&data.cycle0.validation.automated);
  var gates=arr(data.cycle0&&data.cycle0.validation&&data.cycle0.validation.pending);
  var testsPass=tests.filter(function(x){return x.status==='PASS';}).length;
  var gatesPass=gates.filter(function(x){return x.status==='PASS'||x.status==='PASS_STALE';}).length;
  return {data:data,live:live,rows:rows,total:total,healthy:healthy,degraded:degraded,stale:stale,notConfirmed:notConfirmed,
    findings:findings,openFindings:openFindings,severe:severe,recs:recs,openRecs:openRecs,pending:pending,human:human,blocked:blocked,old:old,
    active:active,queue:queue,tests:tests,gates:gates,testsPass:testsPass,gatesPass:gatesPass};
}
function changes(data){
  var rows=[];
  arr(data.milestones).forEach(function(x){rows.push({date:x.date,title:x.title,detail:x.detail,view:'timeline'});});
  arr(data.decisions).forEach(function(x){rows.push({date:x.date,title:x.title,detail:x.decision,view:'decisions'});});
  rows=rows.filter(function(x){return x.date;}).sort(function(a,b){return String(b.date).localeCompare(String(a.date));}).slice(0,5);
  var prev=lastVisit?String(lastVisit).slice(0,10):'';
  rows.forEach(function(x){x.isNew=!!prev&&String(x.date)>=prev;});
  return rows;
}
function attention(x){
  var d=x.data||{}, list=[];
  var gate=(d.cycle0&&d.cycle0.promotion_gate&&d.cycle0.promotion_gate.decision)||'BLOCKED';
  var backup=x.rows.find(function(s){return /backup/i.test(String(s.source_id||s.source_name||''));});
  if(String(gate).toUpperCase()==='BLOCKED')list.push({tone:'red',icon:'⛔',title:'Homologada com P0 aberto',summary:'A versão foi homologada pelo proprietário, mas continuidade/backup e validações de instalação permanecem abertas como P0.',meta:'Homologação explícita • continuidade ainda aberta',view:'governance'});
  if(backup&&backup.status!=='healthy')list.push({tone:'red',icon:'↺',title:'Continuidade / backup exige ação',summary:backup.notes||'A rotina de continuidade ainda não está saudável.',meta:(backup.source_name||'Backup')+' • '+label(backup.status),view:'infrastructure'});
  x.human.slice(0,2).forEach(function(p){list.push({tone:'amber',icon:'◎',title:p.title,summary:p.next_action||'Decisão humana pendente.',meta:(p.priority||'—')+' • proprietário',view:'pending',filter:'human'});});
  x.severe.slice(0,2).forEach(function(f){list.push({tone:'orange',icon:'!',title:f.title,summary:'Achado '+(f.finding_code||f.code||'')+' permanece '+label(f.status)+'.',meta:'Auditoria • '+String(f.severity||'').toUpperCase(),view:'audits'});});
  x.openRecs.slice(0,1).forEach(function(r){list.push({tone:'amber',icon:'⇄',title:r.title,summary:r.difference_text||r.difference||'Divergência em reconciliação.',meta:'Reconciliação aberta',view:'audits'});});
  return list.filter(function(v,i,a){return a.findIndex(function(z){return z.title===v.title;})===i;}).slice(0,6);
}
function render(payload){
  var host=document.getElementById('view-now');
  if(!host||!payload)return;
  var existing=document.getElementById('executiveDashboard');
  if(existing)existing.remove();

  var x=normalize(payload.data,payload.live);
  var d=x.data;
  var gate=(d.cycle0&&d.cycle0.promotion_gate&&d.cycle0.promotion_gate.decision)||'BLOCKED';
  var totalValidation=x.tests.length+x.gates.length;
  var passedValidation=x.testsPass+x.gatesPass;
  var sourceAttention=x.degraded+x.stale+x.notConfirmed;
  var backup=x.rows.find(function(s){return /backup/i.test(String(s.source_id||s.source_name||''));});
  var sourceTone=x.healthy===x.total?'green':x.degraded>0?'red':'amber';
  var continuityTone=backup&&backup.status==='healthy'?'green':'red';
  var readinessTone=(passedValidation===totalValidation&&String(gate).toUpperCase()!=='BLOCKED')?'green':'amber';
  var canons=arr(d.products).filter(function(p){return p.status==='canonical';}).length;
  var att=attention(x);
  var recent=changes(d);
  var central=arr(d.owner_access).find(function(a){return a.id==='central';});
  var app=arr(d.owner_access).find(function(a){return a.id==='app';});
  var html=[];

  html.push('<section id="executiveDashboard" class="xd-root">');
  html.push('<section class="xd-hero"><div class="xd-hero-main"><div class="xd-kicker">GESTÃO EXECUTIVA • CANÔNICA HOMOLOGADA</div><h2>O projeto inteiro em uma tela.<br><span>Veja, decida e entre na ação.</span></h2><p>Estado, risco, capacidade, decisões e avanço comprovado primeiro. A camada técnica continua preservada nos níveis seguintes.</p><div class="xd-actions">');
  if(central)html.push('<button class="primary-btn xd-url" data-url="'+esc(central.url)+'">Abrir Central ↗</button>');
  if(app)html.push('<button class="soft-btn xd-url" data-url="'+esc(app.url)+'">Abrir APP ↗</button>');
  html.push('<button class="soft-btn" data-view="pending">Pendências</button><button class="soft-btn" data-view="audits">Auditorias</button></div></div>');
  html.push('<div class="xd-state"><small>ESTADO GERAL</small><div><span>Versão</span><b>V1.1.2 • CANÔNICA</b></div><div><span>Ambiente</span><b>Canônica homologada</b></div><div><span>Dados</span><b>'+(payload.liveOk?'LIVE • persistente':'FALLBACK • versionado')+'</b></div><div><span>Última leitura</span><b>'+esc(fmt(payload.generatedAt))+'</b></div><div class="xd-gate '+(String(gate).toUpperCase()==='BLOCKED'?'blocked':'ok')+'"><span>'+(String(gate).toUpperCase()==='BLOCKED'?'⛔':'✓')+'</span><p><small>GATE DE PROMOÇÃO</small><strong>'+esc(label(gate))+'</strong></p></div></div></section>');

  html.push('<div class="xd-section-head"><div><small>PROJETO EM NÚMEROS</small><h3>Tamanho, pressão e capacidade</h3></div><span>Clique para chegar ao detalhe.</span></div><section class="xd-metrics">');
  html.push(metric('Frentes ativas',x.active.length+'/2',x.queue.length+' na fila','▦','fronts',x.active.length>=2?'amber':'green'));
  html.push(metric('Pendências',x.pending.length,x.blocked.length+' bloqueada(s) • '+x.old.length+' envelhecendo','!','pending',x.blocked.length?'red':'blue'));
  html.push(metric('Ação do proprietário',x.human.length,x.human.length?'Itens que realmente dependem de você':'Nenhuma decisão imediata','◎','pending',x.human.length?'amber':'green','human'));
  html.push(metric('Fontes saudáveis',x.healthy+'/'+x.total,sourceAttention+' atenção/revalidação','⌁','audits',sourceTone));
  html.push(metric('Achados abertos',x.openFindings.length,x.severe.length+' alta/crítica','⚑','audits',x.severe.length?'orange':'green'));
  html.push(metric('Critérios comprovados',passedValidation+'/'+totalValidation,'Automação + gates objetivos','✓','governance',readinessTone));
  html.push(metric('Checkpoints',arr(d.checkpoints).length,arr(d.versions).length+' versões catalogadas','◇','versions','blue'));
  html.push(metric('Produtos canônicos',canons,arr(d.products).length+' produtos mapeados','▣','products','green'));
  html.push('</section>');

  html.push('<section class="xd-grid"><article class="card"><div class="card-head"><div><small class="xd-overline">MINHA ATENÇÃO AGORA</small><h3>O que merece ação</h3><p>Bloqueios, riscos, decisões e divergências.</p></div><span class="xd-count">'+att.length+'</span></div><div class="xd-attention">');
  if(att.length)att.forEach(function(a){html.push('<button class="xd-att-item tone-'+esc(a.tone)+'" data-view="'+esc(a.view)+'" data-filter="'+esc(a.filter||'')+'"><span class="xd-att-icon">'+esc(a.icon)+'</span><span><b>'+esc(a.title)+'</b><small>'+esc(a.summary)+'</small><em>'+esc(a.meta)+'</em></span><span class="xd-arrow">→</span></button>');});
  else html.push('<div class="xd-good"><b>Sem alerta executivo novo.</b><span>O projeto pode seguir pela fila normal.</span></div>');
  html.push('</div></article>');

  html.push('<article class="card"><div class="card-head"><div><small class="xd-overline">LEITURA QUALITATIVA</small><h3>Por que o painel está desta cor?</h3><p>Indicadores derivados de evidência, não opinião.</p></div></div><div class="xd-quality">');
  html.push('<button class="tone-'+sourceTone+'" data-view="audits"><span>Confiabilidade dos dados</span><strong>'+x.healthy+'/'+x.total+' fontes saudáveis</strong><small>'+sourceAttention+' pedem atenção/revalidação.</small></button>');
  html.push('<button class="tone-'+continuityTone+'" data-view="infrastructure"><span>Continuidade</span><strong>'+(backup&&backup.status==='healthy'?'Backup saudável':'Continuidade degradada')+'</strong><small>'+esc((backup&&backup.notes)||'Backup/restauração continua sendo gate de promoção.')+'</small></button>');
  html.push('<button class="tone-blue" data-view="versions"><span>Rastreabilidade</span><strong>'+arr(d.checkpoints).length+' checkpoints</strong><small>Versões, rollback e evidências preservados.</small></button>');
  html.push('<button class="tone-'+readinessTone+'" data-view="governance"><span>Prontidão de homologação</span><strong>'+passedValidation+'/'+totalValidation+' critérios comprovados</strong><small>'+(String(gate).toUpperCase()==='BLOCKED'?'Promoção objetivamente bloqueada.':'Gate sem bloqueio registrado.')+'</small></button>');
  html.push('</div></article></section>');

  html.push('<div class="xd-section-head"><div><small>EXECUÇÃO</small><h3>Frentes e capacidade</h3></div><button class="soft-btn" data-view="fronts">Abrir gestão de frentes →</button></div><section class="xd-fronts">');
  x.active.forEach(function(f,i){html.push('<article class="card xd-front"><div class="xd-front-num">'+(i+1)+'</div><div><span class="xd-front-state">'+esc(label(f.status))+' • '+esc(f.priority||'')+'</span><h3>'+esc(f.name)+'</h3><p>'+esc(f.objective||'')+'</p><div class="xd-front-bar"><i style="width:'+Math.max(0,Math.min(100,Number(f.progress)||0))+'%"></i></div><small><b>Próxima ação:</b> '+esc(f.next_action||'—')+'</small></div></article>');});
  html.push('<article class="card xd-capacity '+(x.active.length>=2?'at-limit':'has-space')+'"><small>CAPACIDADE</small><strong>'+x.active.length+'/2</strong><p>'+(x.active.length>=2?'Capacidade ocupada. Uma frente precisa sair antes de abrir outra.':'Existe capacidade para mais uma frente.')+'</p><span>'+x.queue.length+' item(ns) na fila</span></article></section>');

  html.push('<section class="xd-grid"><article class="card"><div class="card-head"><div><small class="xd-overline">PROGRESSO POR EVIDÊNCIA</small><h3>Sem porcentagem inventada</h3><p>Numerador e denominador verificáveis.</p></div></div><div class="xd-progress">');
  html.push(progress('Testes automatizados',x.testsPass,x.tests.length,'Validações técnicas registradas no Ciclo 0','green'));
  html.push(progress('Saúde das fontes',x.healthy,x.total,'Fontes saudáveis no snapshot atual',sourceTone));
  html.push(progress('Critérios totais comprovados',passedValidation,totalValidation,'Testes + gates de continuidade/humanos',readinessTone));
  html.push(progress('Achados encerrados',x.findings.filter(function(f){return f.status==='closed';}).length,x.findings.length,'Somente closed conta como encerrado','blue'));
  html.push('</div></article>');

  html.push('<article class="card"><div class="card-head"><div><small class="xd-overline">O QUE EU PRECISO DECIDIR</small><h3>'+(x.human.length?'Há decisão humana pendente':'Nenhuma decisão imediata')+'</h3><p>'+(x.human.length?'Somente itens que dependem do proprietário aparecem aqui.':'Os bloqueios atuais são técnicos/validação; trabalho técnico não vira decisão do proprietário.')+'</p></div></div>');
  if(!x.human.length)html.push('<div class="xd-good"><b>Você não precisa decidir nada agora.</b><span>Primeiro resolva os gates destacados em “Minha atenção agora”.</span></div>');
  else x.human.slice(0,4).forEach(function(p){html.push('<button class="xd-decision" data-view="pending" data-filter="human"><span><b>'+esc(p.title)+'</b><small>'+esc(p.next_action||'Abrir para contexto e decisão.')+'</small></span><span>→</span></button>');});
  html.push('<button class="soft-btn xd-full" data-view="decisions">Ver registro de decisões</button></article></section>');

  html.push('<section class="xd-grid"><article class="card"><div class="card-head"><div><small class="xd-overline">O QUE AVANÇOU</small><h3>Últimos avanços materiais</h3><p>Decisão, implementação, checkpoint e mudança relevante.</p></div><button class="soft-btn" data-view="timeline">Linha do tempo</button></div><div class="xd-changes">');
  recent.forEach(function(ch){html.push('<button data-view="'+esc(ch.view)+'"><span class="xd-date">'+esc(ch.date)+'</span><span><b>'+esc(ch.title)+'</b><small>'+esc(ch.detail)+'</small></span>'+(ch.isNew?'<em>NOVO</em>':'')+'</button>');});
  html.push('</div><div class="xd-last">'+(lastVisit?'Última visita desta instalação: <b>'+esc(fmt(lastVisit))+'</b>':'Primeira leitura desta instalação. Nas próximas visitas, mudanças materiais ficam destacadas.')+'</div></article>');

  html.push('<article class="card"><div class="card-head"><div><small class="xd-overline">GOVERNANÇA</small><h3>Auditoria, fontes e reconciliação</h3><p>Segundo nível sem transformar a Home em relatório técnico.</p></div></div><div class="xd-govern">');
  html.push('<button data-view="audits"><span><b>AUD-001</b><small>'+x.openFindings.length+' achados abertos • '+x.severe.length+' alta/crítica</small></span><span>→</span></button>');
  html.push('<button data-view="audits"><span><b>Matriz de fontes</b><small>'+x.healthy+'/'+x.total+' saudáveis • '+sourceAttention+' atenção/revalidação</small></span><span>→</span></button>');
  html.push('<button data-view="audits"><span><b>Reconciliações</b><small>'+x.openRecs.length+' abertas • sem correção silenciosa</small></span><span>→</span></button>');
  html.push('<button data-view="versions"><span><b>Versões & rollback</b><small>'+arr(d.versions).length+' versões • '+arr(d.checkpoints).length+' checkpoints</small></span><span>→</span></button>');
  html.push('</div></article></section>');

  html.push('<details class="card xd-access"><summary><span><b>Acessos do ecossistema</b><small>Central, APP e produtos ficam no segundo nível para não competir com a decisão.</small></span><span>expandir</span></summary><div class="xd-access-grid">');
  arr(d.owner_access).slice(0,8).forEach(function(a){html.push('<button class="xd-url" data-url="'+esc(a.url||'')+'"><small>'+esc(a.kind||'ACESSO')+'</small><b>'+esc(a.name)+'</b><span>'+esc(a.description||'')+'</span><em>Abrir ↗</em></button>');});
  html.push('</div></details></section>');

  var ribbon=host.querySelector('.live-ribbon');
  if(ribbon)ribbon.insertAdjacentHTML('afterend',html.join('')); else host.insertAdjacentHTML('afterbegin',html.join(''));
  var root=document.getElementById('executiveDashboard');
  if(!root)return;
  root.addEventListener('click',function(e){
    var urlBtn=e.target.closest('.xd-url');
    if(urlBtn){var u=urlBtn.getAttribute('data-url');if(u)window.open(u,'_blank','noopener');return;}
    var target=e.target.closest('[data-view]');
    if(target)go(target.getAttribute('data-view'),target.getAttribute('data-filter')||'');
  });
}
async function load(){
  try{
    var dataResp=await fetch('./project-data.json?v=20261005v112h3',{cache:'no-store'});
    var data=await dataResp.json();
    var live=null,ok=false,generatedAt=data.meta&&data.meta.generated_at;
    try{
      var lr=await fetch(API+'?api=snapshot',{cache:'no-store',headers:{Authorization:'Bearer '+ANON,apikey:ANON,Accept:'application/json'}});
      if(lr.ok){live=await lr.json();ok=!!(live&&live.ok);generatedAt=(live&&live.generated_at)||generatedAt;}
    }catch(e){}
    lastPayload={data:data,live:live||{},liveOk:ok,generatedAt:generatedAt};
    render(lastPayload);
    try{localStorage.setItem('cr_pm_exec_last_visit',new Date().toISOString());}catch(e){}
  }catch(e){}
}
var observer=new MutationObserver(function(){
  var host=document.getElementById('view-now');
  if(host&&!document.getElementById('executiveDashboard')&&lastPayload)setTimeout(function(){render(lastPayload);},0);
});
function start(){
  var host=document.getElementById('view-now');
  if(host)observer.observe(host,{childList:true});
  load();
  setInterval(load,300000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start); else start();
})();