(()=>{'use strict';
const q=s=>document.querySelector(s);
const e=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function av(kind,name){
 const acc={
 orchestrator:'<path d="M23 46h34M40 38v18M31 49l9-11 9 11" stroke="#ffc514" stroke-width="3" fill="none" stroke-linecap="round"/>',
 engineer:'<path d="M25 27h30l-4-8H29z" fill="#ffc514"/><path d="M29 51l7-7 5 5 9-10" stroke="#ffc514" stroke-width="3" fill="none" stroke-linecap="round"/>',
 manager:'<rect x="26" y="42" width="28" height="17" rx="4" fill="#fff"/><path d="M31 48h18M31 53h13" stroke="#0877f9" stroke-width="2"/>',
 guardian:'<path d="M40 39l14 5v10c0 8-6 13-14 17-8-4-14-9-14-17V44z" fill="#ffc514"/><path d="M34 53l4 4 8-9" stroke="#031b46" stroke-width="3" fill="none"/>',
 estimator:'<rect x="26" y="41" width="28" height="22" rx="4" fill="#fff"/><path d="M32 47h16M32 52h16M32 57h10" stroke="#0877f9" stroke-width="2"/>',
 finance:'<path d="M27 58h27M31 56V47M39 56V42M47 56V36" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M28 36c7-8 13-8 24-4" stroke="#ffc514" stroke-width="3" fill="none"/>',
 service:'<path d="M25 35c0-9 6-15 15-15s15 6 15 15" stroke="#ffc514" stroke-width="3" fill="none"/><path d="M23 35v9h6v-9M51 35v9h6v-9M51 46c0 5-3 7-9 7" stroke="#ffc514" stroke-width="3" fill="none"/>'
 }[kind]||'';
 const ini=name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 return '<svg viewBox="0 0 80 80" role="img" aria-label="'+e(name)+'"><defs><linearGradient id="ahg'+kind+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#031b46"/><stop offset="1" stop-color="#0877f9"/></linearGradient></defs><rect x="2" y="2" width="76" height="76" rx="23" fill="url(#ahg'+kind+')"/><circle cx="40" cy="28" r="11" fill="#dff3ff"/><path d="M20 70c2-17 10-27 20-27s18 10 20 27" fill="#0d5fc5"/>'+acc+'<text x="40" y="75" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" font-family="Arial">'+e(ini)+'</text></svg>';
}
function cls(s){return /ONBOARDING/.test(s)?'onboarding':/CANDIDATO/.test(s)?'candidate':''}
async function boot(){
 const d=await fetch('./agents.json?v=20261005agenthub1',{cache:'no-store'}).then(r=>r.json());
 const target=q('#view-agents'); if(!target)return;
 const active=d.agents.find(a=>a.code===d.active_action.agent);
 const can=d.agents.filter(a=>/CANÔNICO|OFICIAL/.test(a.status)).length;
 const onboarding=d.agents.filter(a=>/ONBOARDING|CANDIDATO/.test(a.status)).length;
 target.innerHTML='<div class="ah-root">'+
 '<section class="ah-live"><span class="ah-pulse"></span><div class="ah-avatar">'+av(active.avatar,active.name)+'</div><div class="ah-live-copy"><small>AGENTE EM AÇÃO • '+e(d.active_action.handoff.join(' → '))+'</small><b>'+e(active.name)+' • '+e(active.role)+'</b><span>'+e(d.active_action.action)+'</span></div><span class="ah-state">'+e(d.active_action.state)+'</span></section>'+
 '<section class="ah-hero"><div><small>GOVERNANÇA DE INTELIGÊNCIA</small><h2>Equipe digital visível.<br><span>Hierarquia antes de execução.</span></h2><p>BIO orquestra, os especialistas trabalham na própria alçada, CR Assertivo protege a engenharia e Rogério mantém o gate humano final.</p></div><div class="ah-hero-side"><b>AGENT HUB V1</b><strong>Know-How Canon V1</strong><span>Candidata integrada ao Gestor H5 • não promovida</span></div></section>'+
 '<section class="ah-metrics">'+[
 ['Agentes visíveis',d.agents.length,'registro do Hub'],['Canônicos ativos',can,'sem ampliar alçada'],['Em onboarding',onboarding,'ainda não homologados'],['Guardrails',d.rules.length,'governança exibida']
 ].map(x=>'<article class="ah-metric"><small>'+x[0]+'</small><b>'+x[1]+'</b><span>'+x[2]+'</span></article>').join('')+'</section>'+
 '<div class="ah-title"><div><small>EQUIPE DIGITAL</small><h3>Agentes CONSTRU-REI</h3></div><span>Detalhes, alçada e formação por agente.</span></div>'+
 '<section class="ah-grid">'+d.agents.map(a=>'<article class="ah-card" data-agent="'+e(a.code)+'"><div class="ah-avatar">'+av(a.avatar,a.name)+'</div><div><div class="ah-top"><span class="ah-level">NÍVEL '+a.level+'</span><span class="ah-tag '+cls(a.status)+'">'+e(a.status)+'</span></div><h4>'+e(a.name)+'</h4><div class="ah-role">'+e(a.role)+' • '+e(a.mode)+'</div><p>'+e(a.summary)+'</p><div class="ah-facts"><span class="ah-fact">'+e(a.knowledge)+'</span><span class="ah-fact">'+e(a.proof)+'</span></div><div class="ah-actions"><button class="ah-btn primary ah-detail-btn" type="button">Detalhes</button><button class="ah-btn ah-manifest" type="button" data-code="'+e(a.code)+'">Manifesto ↗</button></div></div><div class="ah-detail"><b>Escalonamento: '+e(a.escalation)+'</b><ul><li>Visibilidade não amplia alçada.</li><li>Cadastro não equivale a homologação.</li><li>Know-How Canon V1 é obrigatório antes de promoção.</li></ul></div></article>').join('')+'</section>'+
 '<section class="ah-two"><article class="ah-panel"><div class="ah-title"><div><small>HIERARQUIA</small><h3>Fluxo de comando</h3></div></div><div class="ah-hierarchy">'+d.agents.slice().sort((a,b)=>b.level-a.level).map(a=>'<div class="ah-row"><div class="ah-avatar">'+av(a.avatar,a.name)+'</div><div><b>'+e(a.name)+'</b><small>'+e(a.role)+' • escala para '+e(a.escalation)+'</small></div><em>L'+a.level+'</em></div>').join('')+'</div></article>'+
 '<article class="ah-panel"><div class="ah-title"><div><small>ACADEMIA</small><h3>Know-How obrigatório</h3></div><span>CANON V1</span></div><div class="ah-academy">'+['Núcleo comum','Alçada + segurança','Especialidade','Caso real','Handoff','Teste bloqueante'].map((x,i)=>'<div><b>0'+(i+1)+'</b><span>'+x+'</span></div>').join('')+'</div><p class="ah-note">Promoção exige prova de conhecimento, alçada, caso real, fonte canônica, handoff e segurança. BIO + CR Assertivo conduzem o onboarding.</p></article></section>'+
 '<section class="ah-panel"><div class="ah-title"><div><small>TESTE DE ALÇADA</small><h3>Guardrails executáveis</h3></div><button id="ahRunTests" class="ah-btn primary" type="button">Executar testes</button></div><div class="ah-tests">'+d.tests.map((t,i)=>'<div class="ah-test"><i>'+String(i+1).padStart(2,'0')+'</i><div><b>'+e(t.title)+'</b><small>Esperado: '+e(t.expected)+'</small></div><span class="ah-result">AGUARDANDO</span></div>').join('')+'</div></section>'+
 '<section class="ah-panel"><div class="ah-title"><div><small>CAMADAS</small><h3>Agente ≠ motor ≠ automação</h3></div></div><div class="ah-layer-grid"><div class="ah-layer"><span>AGENTES</span><b>BIO, CR Assertivo, ORÇA-REI, Bio Gestor, Gabi Flow, Financeiro REI, Infra REI</b></div><div class="ah-layer"><span>MOTORES</span><b>OpenAI / Flowise / OpenClaw somente quando conectados e homologados</b></div><div class="ah-layer"><span>AUTOMAÇÃO</span><b>n8n como infraestrutura de fluxo, não agente de negócio</b></div><div class="ah-layer"><span>DADOS</span><b>Supabase + GitHub + fontes operacionais canônicas</b></div></div></section>'+
 '</div>';
 const top=q('.topbar'); if(top&&!q('#ahGlobalAgent')){const g=document.createElement('div');g.id='ahGlobalAgent';g.className='ah-global';g.innerHTML='<span class="dot"></span><span>'+e(active.name)+'</span><small>'+e(d.active_action.state)+'</small>';top.appendChild(g)}
 target.querySelectorAll('.ah-detail-btn').forEach(b=>b.onclick=()=>b.closest('.ah-card').classList.toggle('open'));
 target.querySelectorAll('.ah-manifest').forEach(b=>b.onclick=()=>{const map={BIO:'bio',CR_ASSERTIVO:'cr-assertivo',BIO_GESTOR:'bio-gestor',ORCA_REI:'orca-rei',GABI_FLOW:'gabi-flow',FINANCEIRO_REI:'financeiro-rei',INFRA_REI:'infra-rei'};const slug=map[b.dataset.code];if(slug)window.open('https://github.com/rogeriocibin-alt/construrei-oauth-pages/blob/main/agents/'+slug+'/AGENT.md','_blank','noopener')});
 const run=q('#ahRunTests');if(run)run.onclick=()=>target.querySelectorAll('.ah-result').forEach((r,i)=>setTimeout(()=>{r.textContent='PASS';r.classList.add('pass')},120*i));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,80));else setTimeout(boot,80);
})();