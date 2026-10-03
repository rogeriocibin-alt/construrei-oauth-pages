(()=>{'use strict';

const STATUS_LABEL={
  canonical:'Canônico',candidate:'Candidata',homologated:'Homologada',homologation:'Em homologação',
  executing:'Em execução',queue:'Fila',review:'Revisão',archived:'Arquivada',completed:'Concluída',
  live:'Vivo',blocked:'Bloqueada',partial:'Parcial',attention:'Atenção',preserved:'Preservado',
  confirmed:'Confirmada',approved_queue:'Fila aprovada',analysis:'Em análise',archived_safe:'Arquivo seguro',
  superseded:'Substituída',unconfirmed:'Não confirmado'
};
const VIEW_TITLES={
  now:'Cockpit do Projeto',canonical:'Cadeia Canônica',fronts:'Frentes',versions:'Versões',
  decisions:'Decisões',timeline:'Linha do Tempo',products:'Produtos',recoverables:'Recuperáveis',
  governance:'Governança',search:'Busca'
};

const state={data:null,view:'now',versionFilter:'all',search:''};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const arr=v=>Array.isArray(v)?v:[];
const label=s=>STATUS_LABEL[s]||String(s||'').replace(/_/g,' ');
const short=s=>s?String(s).slice(0,8):'—';
const statusClass=s=>['canonical','candidate','homologated','homologation','executing','queue','review','archived','completed','live','blocked','partial','attention'].includes(s)?s:(s==='preserved'?'canonical':s==='confirmed'?'completed':'review');
const badge=s=>`<span class="badge ${statusClass(s)}">${esc(label(s))}</span>`;
const ghCommit=sha=>sha?`https://github.com/rogeriocibin-alt/construrei-oauth-pages/commit/${encodeURIComponent(sha)}`:'';
const ghBranch=br=>br?`https://github.com/rogeriocibin-alt/construrei-oauth-pages/tree/${encodeURIComponent(br)}`:'';

function setView(view){
  state.view=view;
  $$('.view').forEach(x=>x.classList.remove('active'));
  const target=$('#view-'+view);
  if(target) target.classList.add('active');
  $$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  $('#pageTitle').textContent=VIEW_TITLES[view]||'Gestor do Projeto';
  $('#crumbs').textContent='Gestor do Projeto / '+(VIEW_TITLES[view]||view);
  closeSidebar();
  window.scrollTo({top:0,behavior:'smooth'});
}

function openDrawer(title,eyebrow,html){
  $('#drawerTitle').textContent=title||'Detalhe';
  $('#drawerEyebrow').textContent=eyebrow||'Detalhe';
  $('#drawerBody').innerHTML=html;
  $('#drawer').classList.add('open');
  $('#drawerBackdrop').classList.add('open');
  $('#drawer').setAttribute('aria-hidden','false');
}
function closeDrawer(){
  $('#drawer').classList.remove('open');
  $('#drawerBackdrop').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden','true');
}
function openSidebar(){ $('#sidebar').classList.add('open'); $('#drawerBackdrop').classList.add('open'); }
function closeSidebar(){ $('#sidebar').classList.remove('open'); if(!$('#drawer').classList.contains('open')) $('#drawerBackdrop').classList.remove('open'); }

function metric(labelText,value,meta,icon,extra=''){
  return `<article class="metric ${extra}"><div class="metric-top"><span class="metric-label">${esc(labelText)}</span><span class="metric-icon">${esc(icon)}</span></div><div class="metric-value">${esc(value)}</div><small>${esc(meta)}</small></article>`;
}

function renderNow(){
  const d=state.data;
  const active=arr(d.fronts).filter(f=>['executing','homologation'].includes(f.status));
  const queue=arr(d.fronts).filter(f=>f.status==='queue');
  const audit=d.repository_audit||{};
  const canon=arr(d.products).filter(p=>p.status==='canonical').length;
  const checks=arr(d.decision_readiness?.checks);
  const ready=checks.filter(x=>x.done).length;
  const firstRec=arr(d.recommendations)[0];

  $('#view-now').innerHTML=`
    <section class="hero">
      <div class="hero-grid">
        <div>
          <div class="hero-kicker">Governança • memória • entrega</div>
          <h2>Um projeto, uma direção, <span style="color:#55c4ff">sem perder versões boas.</span></h2>
          <p>O Gestor organiza a cadeia canônica, limita trabalho em andamento e torna visíveis versões, decisões, riscos e recuperações antes de qualquer promoção.</p>
        </div>
        <div class="hero-status"><strong>${active.length}/2</strong><span>frentes ativas</span></div>
      </div>
    </section>

    <section class="metrics">
      ${metric('Frentes em execução',active.length,'Limite rígido: 2','⇢')}
      ${metric('Branches auditadas',audit.total_branches??'197','Snapshot do repositório','⑂')}
      ${metric('Checkpoints',audit.checkpoint_branches??'95','Branches de checkpoint identificadas','◇')}
      ${metric('Produtos canônicos',canon,'Baselines preservadas','✓')}
      ${metric('Fila consciente',queue.length,'Demandas não viram frente automaticamente','≡')}
    </section>

    <section class="section-grid">
      <div class="card">
        <div class="card-head">
          <div><h3>Agora na execução</h3><p>Somente o que consome capacidade neste momento.</p></div>
          <div class="spacer"></div><span class="badge executing">${active.length}/2 ocupadas</span>
        </div>
        <div class="front-list">
          ${active.map((f,i)=>frontCard(f,i)).join('')||'<div class="empty">Nenhuma frente ativa.</div>'}
          ${queue.length?`<div class="notice"><b>Fila preservada:</b> ${queue.length} frente(s) aguardam uma vaga. Abrir uma terceira frente violaria a regra aprovada.</div>`:''}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><div><h3>Próxima decisão</h3><p>O que precisa estar claro antes de avançar.</p></div></div>
        <div class="card-pad">
          <h3 style="margin:0 0 8px;color:var(--navy);font-size:15px">${esc(d.decision_readiness?.title||'Prontidão')}</h3>
          ${checks.map(c=>`<div class="rule-row"><span class="rule-state ${c.done?'ok':'partial'}">${c.done?'✓':'!'}</span><div><b>${esc(c.label)}</b><small>${c.done?'Evidência registrada.':'Ainda depende de validação.'}</small></div>${badge(c.done?'completed':'partial')}</div>`).join('')}
        </div>
        ${firstRec?`<div class="recommend"><div class="rec-label">${esc(firstRec.priority)}</div><h4>${esc(firstRec.title)}</h4><p>${esc(firstRec.rationale)}</p></div>`:''}
      </div>
    </section>

    ${audit.warnings?.length?`
    <section class="card" style="margin-top:16px">
      <div class="card-head"><div><h3>Achados da auditoria</h3><p>Inconsistências que não devem ficar escondidas na memória.</p></div></div>
      <div class="card-pad">
        ${audit.warnings.map(w=>`<div class="govern-item"><div class="decision-meta">${badge(w.severity==='high'?'blocked':'attention')}<span class="mono">${esc(w.ref||'auditoria')}</span></div><p><b style="color:var(--navy)">${esc(w.title)}</b></p><p>${esc(w.detail)}</p></div>`).join('')}
      </div>
    </section>`:''}
  `;
  bindDetailButtons();
}

function frontCard(f,index){
  return `<article class="front">
    <div class="front-line">
      <div class="front-no">${index+1}</div>
      <div style="min-width:0;flex:1">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><div class="front-title">${esc(f.name)}</div>${badge(f.status)}<span class="badge review">${esc(f.priority||'')}</span></div>
        <div class="front-meta"><b>Objetivo:</b> ${esc(f.objective)}<br><b>Último avanço:</b> ${esc(f.last_advance)}<br><b>Próxima ação:</b> ${esc(f.next_action)}</div>
        <div class="progress"><i style="width:${Math.max(0,Math.min(100,Number(f.progress)||0))}%"></i></div>
        <div class="front-actions"><button class="soft-btn detail-btn" data-type="front" data-id="${esc(f.id)}">Ver detalhe</button></div>
      </div>
    </div>
  </article>`;
}

function renderCanonical(){
  const d=state.data;
  const chain=arr(d.versions).filter(v=>['central-canonical-20261001','exec-v6','exec-v7','exec-v8','exec-v9','exec-v10','exec-v11'].includes(v.id));
  $('#view-canonical').innerHTML=`
    <div class="page-intro"><div><h2>Cadeia Canônica</h2><p>A numeração não define a verdade do projeto. O que vale é a relação entre baseline, candidata, checkpoint e decisão explícita.</p></div></div>
    <div class="card">
      <div class="card-head"><div><h3>Central → Executiva V6 → V11</h3><p>Genealogia visível, com status e evidência.</p></div></div>
      <div class="chain">
        ${chain.map((v,i)=>`${i?'<div class="chain-arrow">→</div>':''}<button class="chain-node detail-btn" data-type="version" data-id="${esc(v.id)}" style="text-align:left;cursor:pointer"><div style="margin-bottom:8px">${badge(v.status)}</div><strong>${esc(v.name)}</strong><small>${esc(v.date)} • ${esc(short(v.commit))}</small><small>${esc(v.note||'')}</small></button>`).join('')}
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-head"><div><h3>Travas de canonicidade</h3><p>Regras que impedem regressão silenciosa.</p></div></div>
      <div class="card-pad">
        ${arr(d.canonical_rules).map(r=>`<div class="rule-row"><span class="rule-state ${r.status==='preserved'?'ok':'partial'}">${r.status==='preserved'?'✓':'!'}</span><div><b>${esc(r.label)}</b><small>${esc(r.evidence)}</small></div>${badge(r.status)}</div>`).join('')}
      </div>
    </div>
  `;
  bindDetailButtons();
}

function renderFronts(){
  const d=state.data;
  const active=arr(d.fronts).filter(f=>['executing','homologation'].includes(f.status));
  const queued=arr(d.fronts).filter(f=>!['executing','homologation'].includes(f.status));
  $('#view-fronts').innerHTML=`
    <div class="page-intro"><div><h2>Frentes</h2><p>Execução limitada a duas frentes. Ideias, melhorias e demandas ficam em fila até existir capacidade real.</p></div></div>
    <div class="card"><div class="card-head"><div><h3>Em execução</h3><p>${active.length}/2 vagas ocupadas.</p></div></div><div class="front-list">${active.map((f,i)=>frontCard(f,i)).join('')}</div></div>
    <div class="card" style="margin-top:16px"><div class="card-head"><div><h3>Fila / revisão</h3><p>Registradas sem roubar foco do que já está em andamento.</p></div></div><div class="front-list">${queued.map((f,i)=>frontCard(f,i)).join('')}</div></div>
  `;
  bindDetailButtons();
}

function renderVersions(){
  const d=state.data;
  const filters=[
    ['all','Todas'],['canonical','Canônicas'],['candidate','Candidatas'],['executive','Executiva'],['app','APP'],['presentation','Apresentação']
  ];
  const list=arr(d.versions).filter(v=>{
    if(state.versionFilter==='all') return true;
    if(['canonical','candidate'].includes(state.versionFilter)) return v.status===state.versionFilter;
    return v.product===state.versionFilter;
  });
  $('#view-versions').innerHTML=`
    <div class="page-intro"><div><h2>Versões</h2><p>Últimas versões e checkpoints relevantes, do estado aprovado para as evoluções candidatas.</p></div></div>
    <div class="toolbar">${filters.map(([id,t])=>`<button class="filter-btn ${state.versionFilter===id?'active':''}" data-vfilter="${id}">${t}</button>`).join('')}</div>
    <div class="card table-wrap"><table class="data-table">
      <thead><tr><th>Produto / versão</th><th>Status</th><th>Data</th><th>Branch</th><th>Checkpoint</th><th>Commit</th><th></th></tr></thead>
      <tbody>${list.map(v=>`<tr><td><b>${esc(v.name)}</b><br><span class="mono">${esc(v.product)}</span></td><td>${badge(v.status)}</td><td>${esc(v.date)}</td><td class="mono">${esc(v.branch||'—')}</td><td class="mono">${esc(v.checkpoint||'—')}</td><td class="mono">${esc(short(v.commit))}</td><td><button class="soft-btn detail-btn" data-type="version" data-id="${esc(v.id)}">Detalhe</button></td></tr>`).join('')}</tbody>
    </table></div>
  `;
  $$('[data-vfilter]').forEach(b=>b.onclick=()=>{state.versionFilter=b.dataset.vfilter;renderVersions();});
  bindDetailButtons();
}

function renderDecisions(){
  $('#view-decisions').innerHTML=`
    <div class="page-intro"><div><h2>Decisões</h2><p>O que foi decidido deixa de depender de lembrança ou interpretação posterior.</p></div></div>
    <div class="decision-list">${arr(state.data.decisions).slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<article class="decision"><div class="decision-meta">${badge(x.status)}<span class="mono">${esc(x.date)}</span></div><h3>${esc(x.title)}</h3><p><b>Decisão:</b> ${esc(x.decision)}</p><p><b>Motivo:</b> ${esc(x.reason)}</p><p><b>Evidência:</b> ${esc(x.evidence)}</p></article>`).join('')}</div>
  `;
}

function renderTimeline(){
  $('#view-timeline').innerHTML=`
    <div class="page-intro"><div><h2>Linha do Tempo</h2><p>Marcos do projeto organizados em sequência para evitar reconstruções por memória.</p></div></div>
    <div class="card card-pad"><div class="timeline">${arr(state.data.milestones).slice().sort((a,b)=>b.date.localeCompare(a.date)).map(m=>`<article class="timeline-item"><div class="timeline-date">${esc(m.date)} • ${esc(m.type)}</div><h4>${esc(m.title)}</h4><p>${esc(m.detail)}</p><p class="mono">${esc(m.confidence||'')}</p></article>`).join('')}</div></div>
  `;
}

function renderProducts(){
  $('#view-products').innerHTML=`
    <div class="page-intro"><div><h2>Produtos</h2><p>O Gestor governa produtos distintos. Central, APP, Fluxos, Apresentação e integrações não devem ser misturados como se fossem uma única versão.</p></div></div>
    <div class="product-grid">${arr(state.data.products).map(p=>`<article class="card product"><div>${badge(p.status)}</div><h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p><div class="product-current"><b>Atual:</b> ${esc(p.current)}</div></article>`).join('')}</div>
  `;
}

function renderRecoverables(){
  $('#view-recoverables').innerHTML=`
    <div class="page-intro"><div><h2>Recuperáveis</h2><p>Coisas boas que saíram da versão corrente continuam rastreadas. Recuperar não significa promover automaticamente.</p></div></div>
    <div class="recover-list">${arr(state.data.recoverables).map(r=>`<article class="recover"><div class="decision-meta">${badge(r.status)}<span class="mono">${esc(r.risk)}</span></div><h3>${esc(r.title)}</h3><p><b>Onde existia:</b> ${esc(r.existed_in)}</p><p><b>O que aconteceu:</b> ${esc(r.disappeared)}</p><p><b>Valor:</b> ${esc(r.value)}</p><p><b>Direção:</b> ${esc(r.recommendation)}</p></article>`).join('')}</div>
  `;
}

function renderGovernance(){
  const d=state.data,a=d.repository_audit||{};
  $('#view-governance').innerHTML=`
    <div class="page-intro"><div><h2>Governança</h2><p>Regras que fazem o projeto terminar: menos frentes, mais evidência, baseline explícita e histórico preservado.</p></div></div>
    <div class="section-grid">
      <div class="card">
        <div class="card-head"><div><h3>Regras operacionais</h3><p>Guardrails aprovados para condução.</p></div></div>
        <div class="card-pad">${arr(d.governance).map((g,i)=>`<div class="rule-row"><span class="rule-state ok">${i+1}</span><div><b>${esc(g)}</b><small>Aplicação obrigatória na condução das frentes.</small></div><span class="badge canonical">Ativa</span></div>`).join('')}</div>
      </div>
      <div>
        <div class="card">
          <div class="card-head"><div><h3>Snapshot do repositório</h3><p>Levantamento estrutural da V1.</p></div></div>
          <div class="card-pad">
            ${metric('Branches totais',a.total_branches??'197','Levantadas na auditoria','⑂')}
            <div style="height:10px"></div>
            ${metric('Checkpoints',a.checkpoint_branches??'95','Branches identificadas','◇')}
            <div style="height:10px"></div>
            ${metric('Candidatas nomeadas',a.candidate_branches??'43','Não equivalem a canônicas','◌')}
          </div>
        </div>
        <div class="card" style="margin-top:16px">
          <div class="card-head"><div><h3>Não confirmado</h3><p>O Gestor não inventa certeza.</p></div></div>
          <div class="card-pad">${arr(d.unconfirmed).map(x=>`<div class="govern-item"><p>${esc(x)}</p></div>`).join('')}</div>
        </div>
      </div>
    </div>
  `;
}

function renderSearch(q){
  const d=state.data;
  const needle=q.trim().toLowerCase();
  const hits=[];
  if(needle){
    const groups=[
      ['Versão',d.versions,'name',['note','branch','checkpoint','commit','product']],
      ['Frente',d.fronts,'name',['objective','last_advance','next_action','priority']],
      ['Decisão',d.decisions,'title',['decision','reason','evidence']],
      ['Produto',d.products,'name',['summary','current','layer']],
      ['Checkpoint',d.checkpoints,'name',['role','commit']],
      ['Marco',d.milestones,'title',['detail','type']]
    ];
    for(const [kind,list,titleKey,fields] of groups){
      for(const item of arr(list)){
        const hay=[item[titleKey],...fields.map(f=>item[f])].join(' ').toLowerCase();
        if(hay.includes(needle)) hits.push({kind,item,title:item[titleKey],text:fields.map(f=>item[f]).filter(Boolean).join(' • ')});
      }
    }
  }
  $('#view-search').innerHTML=`
    <div class="page-intro"><div><h2>Busca</h2><p>Resultado para <b>${esc(q)}</b>.</p></div></div>
    <div class="search-results">${hits.length?hits.map(h=>`<article class="search-hit"><small>${esc(h.kind)}</small><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></article>`).join(''):'<div class="card empty">Nenhum resultado encontrado.</div>'}</div>
  `;
  setView('search');
}

function detailHtml(type,id){
  const d=state.data;
  if(type==='version'){
    const v=arr(d.versions).find(x=>x.id===id); if(!v)return null;
    const gains=arr(v.gains),losses=arr(v.losses);
    return {title:v.name,eyebrow:'Versão • '+label(v.status),html:`
      <div class="detail-block"><b>Produto / data</b><p>${esc(v.product)} • ${esc(v.date)}</p></div>
      <div class="detail-block"><b>Origem</b><p>${esc(v.parent||'—')}</p></div>
      <div class="detail-block"><b>Branch</b><p class="mono">${esc(v.branch||'—')}</p>${v.branch?`<button class="soft-btn external-btn" data-url="${esc(ghBranch(v.branch))}">Abrir branch</button>`:''}</div>
      <div class="detail-block"><b>Checkpoint</b><p class="mono">${esc(v.checkpoint||'—')}</p></div>
      <div class="detail-block"><b>Commit</b><p class="mono">${esc(v.commit||'—')}</p>${v.commit?`<button class="soft-btn external-btn" data-url="${esc(ghCommit(v.commit))}">Abrir commit</button>`:''}</div>
      <div class="detail-block"><b>Ganhos</b>${gains.length?`<ul>${gains.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>—</p>'}</div>
      <div class="detail-block"><b>Perdas / ressalvas</b>${losses.length?`<ul>${losses.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p>Nenhuma perda registrada.</p>'}</div>
      <div class="detail-block"><b>Nota</b><p>${esc(v.note||'—')}</p></div>
      ${v.url?`<div class="detail-block"><button class="primary-btn external-btn" data-url="${esc(v.url)}">Abrir versão</button></div>`:''}
    `};
  }
  if(type==='front'){
    const f=arr(d.fronts).find(x=>x.id===id); if(!f)return null;
    return {title:f.name,eyebrow:'Frente • '+label(f.status),html:`
      <div class="detail-block"><b>Objetivo</b><p>${esc(f.objective)}</p></div>
      <div class="detail-block"><b>Progresso</b><p>${esc(f.progress)}%</p><div class="progress"><i style="width:${Math.max(0,Math.min(100,Number(f.progress)||0))}%"></i></div></div>
      <div class="detail-block"><b>Responsável</b><p>${esc(f.owner)}</p></div>
      <div class="detail-block"><b>Último avanço</b><p>${esc(f.last_advance)}</p></div>
      <div class="detail-block"><b>Próxima ação</b><p>${esc(f.next_action)}</p></div>
      <div class="detail-block"><b>Dependência</b><p>${esc(f.dependency)}</p></div>
    `};
  }
  return null;
}

function bindDetailButtons(){
  $$('.detail-btn').forEach(b=>b.onclick=()=>{
    const det=detailHtml(b.dataset.type,b.dataset.id);
    if(det){openDrawer(det.title,det.eyebrow,det.html);bindExternalButtons();}
  });
}
function bindExternalButtons(){
  $$('.external-btn').forEach(b=>b.onclick=()=>{ const u=b.dataset.url; if(u) window.open(u,'_blank','noopener'); });
}

function renderAll(){
  renderNow();renderCanonical();renderFronts();renderVersions();renderDecisions();renderTimeline();renderProducts();renderRecoverables();renderGovernance();
}

async function init(){
  try{
    const r=await fetch('./project-data.json?v=20261003b',{cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    state.data=await r.json();
    renderAll();
    setView('now');

    $$('.nav-btn').forEach(b=>b.onclick=()=>setView(b.dataset.view));
    $('#drawerClose').onclick=closeDrawer;
    $('#drawerBackdrop').onclick=()=>{closeDrawer();closeSidebar();};
    $('#mobileMenu').onclick=()=>$('#sidebar').classList.contains('open')?closeSidebar():openSidebar();
    $('#presentationBtn').onclick=()=>{
      document.body.classList.toggle('presentation');
      $('#presentationBtn').textContent=document.body.classList.contains('presentation')?'Sair da apresentação':'Modo apresentação';
    };
    let timer;
    $('#globalSearch').addEventListener('input',e=>{
      clearTimeout(timer);
      const q=e.target.value;
      timer=setTimeout(()=>{ if(q.trim())renderSearch(q); else setView('now'); },160);
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();closeSidebar();}});
  }catch(err){
    $('#view-now').innerHTML=`<div class="card empty"><b>Falha ao carregar o Gestor.</b><br>${esc(err.message||err)}</div>`;
  }
}
init();
})();