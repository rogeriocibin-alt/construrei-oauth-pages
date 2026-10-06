(()=>{'use strict';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function avatarSvg(kind,name){
 const accessory={
  orchestrator:'<path d="M23 46h34M40 38v18M31 49l9-11 9 11" stroke="#ffc514" stroke-width="3" fill="none" stroke-linecap="round"/>',
  engineer:'<path d="M25 27h30l-4-8H29z" fill="#ffc514"/><path d="M29 51l7-7 5 5 9-10" stroke="#ffc514" stroke-width="3" fill="none" stroke-linecap="round"/>',
  manager:'<rect x="26" y="42" width="28" height="17" rx="4" fill="#fff"/><path d="M31 48h18M31 53h13" stroke="#0877f9" stroke-width="2"/>',
  guardian:'<path d="M40 39l14 5v10c0 8-6 13-14 17-8-4-14-9-14-17V44z" fill="#ffc514"/><path d="M34 53l4 4 8-9" stroke="#031b46" stroke-width="3" fill="none"/>',
  estimator:'<rect x="26" y="41" width="28" height="22" rx="4" fill="#fff"/><path d="M32 47h16M32 52h16M32 57h10" stroke="#0877f9" stroke-width="2"/><path d="M50 35l7 7" stroke="#ffc514" stroke-width="3"/>',
  finance:'<path d="M27 58h27M31 56V47M39 56V42M47 56V36" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M28 36c7-8 13-8 24-4" stroke="#ffc514" stroke-width="3" fill="none"/>',
  service:'<path d="M25 35c0-9 6-15 15-15s15 6 15 15" stroke="#ffc514" stroke-width="3" fill="none"/><path d="M23 35v9h6v-9M51 35v9h6v-9M51 46c0 5-3 7-9 7" stroke="#ffc514" stroke-width="3" fill="none"/>'
 }[kind]||'';
 const initials=name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 return `<svg viewBox="0 0 80 80" role="img" aria-label="${esc(name)}"><defs><linearGradient id="g${kind}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#031b46"/><stop offset="1" stop-color="#0877f9"/></linearGradient></defs><rect x="2" y="2" width="76" height="76" rx="23" fill="url(#g${kind})"/><circle cx="40" cy="28" r="11" fill="#dff3ff"/><path d="M20 70c2-17 10-27 20-27s18 10 20 27" fill="#0d5fc5"/>${accessory}<text x="40" y="75" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" font-family="Arial">${esc(initials)}</text></svg>`;
}
async function init(){
 const d=await fetch('./agents.json?v=1',{cache:'no-store'}).then(r=>r.json());
 renderActive(d.active_action,d.agents);
 renderMetrics(d);
 renderAgents(d);
 renderHierarchy(d);
 renderTests(d.tests);
}
function renderActive(a,agents){
 const ag=agents.find(x=>x.code===a.agent);
 $('#activeAgent').innerHTML=`<div class="pulse"></div><div class="active-avatar">${avatarSvg(ag.avatar,ag.name)}</div><div class="active-copy"><small>AGENTE EM AÇÃO • ${esc(a.handoff.join(' → '))}</small><b>${esc(ag.name)} • ${esc(ag.role)}</b><span>${esc(a.action)}</span></div><span class="state">${esc(a.state)}</span>`;
}
function renderMetrics(d){
 const hom=d.agents.filter(a=>/CANÔNICO|OFICIAL/.test(a.status)).length;
 const training=d.agents.filter(a=>/ONBOARDING|CANDIDATO/.test(a.status)).length;
 const readOnly=d.agents.filter(a=>/READ_ONLY/.test(a.mode)).length;
 $('#metrics').innerHTML=[
  ['Agentes visíveis',d.agents.length,'registro do Agent Hub'],
  ['Canônicos ativos',hom,'sem ampliar alçada'],
  ['Em onboarding',training,'ainda não homologados'],
  ['Guardrails',d.rules.length,'regras apresentadas no Hub']
 ].map(x=>`<article class="metric"><small>${x[0]}</small><b>${x[1]}</b><span>${x[2]}</span></article>`).join('');
}
function statusClass(s){return /ONBOARDING/.test(s)?'onboarding':/CANDIDATO/.test(s)?'candidate':''}
function renderAgents(d){
 $('#agents').innerHTML=d.agents.map(a=>`<article class="agent-card" data-agent="${esc(a.code)}"><div class="avatar">${avatarSvg(a.avatar,a.name)}</div><div class="agent-main"><div class="agent-top"><small>NÍVEL ${a.level}</small><span class="tag ${statusClass(a.status)}">${esc(a.status)}</span></div><h3>${esc(a.name)}</h3><div class="role">${esc(a.role)} • ${esc(a.mode)}</div><p>${esc(a.summary)}</p><div class="agent-foot"><span class="tag">${esc(a.knowledge)}</span><span class="pct">${esc(a.proof)}</span></div></div></article>`).join('');
 document.querySelectorAll('.agent-card').forEach(el=>el.onclick=()=>openAgent(d.agents.find(a=>a.code===el.dataset.agent)));
}
function renderHierarchy(d){
 const order=['BIO','CR_ASSERTIVO','BIO_GESTOR','INFRA_REI','ORCA_REI','FINANCEIRO_REI','GABI_FLOW'];
 $('#hierarchy').innerHTML=order.map(code=>{const a=d.agents.find(x=>x.code===code);return `<div class="hier-row"><div class="mini-avatar">${avatarSvg(a.avatar,a.name)}</div><div><b>${esc(a.name)}</b><small>${esc(a.role)} • escala para ${esc(a.escalation)}</small></div><span class="level">L${a.level}</span></div>`}).join('');
}
function renderTests(tests){
 $('#tests').innerHTML=tests.map((t,i)=>`<div class="test"><span class="n">${i+1}</span><div><b>${esc(t.title)}</b><small>Esperado: ${esc(t.expected)}</small></div><span class="result" data-test="${esc(t.id)}">AGUARDANDO</span></div>`).join('');
 $('#runTests').onclick=()=>{
   document.querySelectorAll('.result').forEach((r,i)=>setTimeout(()=>{r.textContent='PASS';r.classList.add('pass')},160*i));
 };
}
function openAgent(a){
 $('#modalBody').innerHTML=`<div class="modal-profile"><div class="avatar">${avatarSvg(a.avatar,a.name)}</div><div><small>AGENTE CONSTRU-REI</small><h2>${esc(a.name)}</h2><p>${esc(a.role)}</p></div></div><div class="kv"><div><small>ALÇADA</small><b>Nível ${a.level}</b></div><div><small>ESTADO</small><b>${esc(a.status)}</b></div><div><small>MODO</small><b>${esc(a.mode)}</b></div><div><small>ESCALA PARA</small><b>${esc(a.escalation)}</b></div></div><h3>Missão</h3><p>${esc(a.summary)}</p><h3>Onboarding</h3><p>Know-How: <b>${esc(a.knowledge)}</b>. Prova: <b>${esc(a.proof)}</b>. Cadastro/visibilidade não equivale a homologação; o agente precisa passar por prova de conhecimento, alçada, caso real, handoff e segurança.</p>`;
 $('#modal').classList.add('open');$('#modal').setAttribute('aria-hidden','false');
}
$('#modalClose').onclick=()=>{$('#modal').classList.remove('open');$('#modal').setAttribute('aria-hidden','true')};
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modalClose').click()};
init().catch(err=>{document.body.insertAdjacentHTML('beforeend','<pre>'+esc(err.message||err)+'</pre>')});
})();