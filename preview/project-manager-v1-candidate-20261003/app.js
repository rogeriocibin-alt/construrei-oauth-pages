(()=>{'use strict';

const STATUS_LABEL={
  canonical:'Canônico',candidate:'Candidata',homologated:'Homologada',homologation:'Em homologação',
  executing:'Em execução',queue:'Fila',review:'Revisão',archived:'Arquivada',completed:'Concluída',
  live:'Vivo',blocked:'Bloqueada',partial:'Parcial',attention:'Atenção',preserved:'Preservado',
  confirmed:'Confirmada',approved_queue:'Fila aprovada',analysis:'Em análise',archived_safe:'Arquivo seguro',
  superseded:'Substituída',unconfirmed:'Não confirmado',in_progress:'Em execução',in_progress_support:'Apoio ativo'
};
const VIEW_TITLES={
  now:'Cockpit do Projeto',pending:'Pendências do Projeto',history:'Histórico Vivo',canonical:'Cadeia Canônica',fronts:'Frentes',versions:'Versões',
  decisions:'Decisões',timeline:'Linha do Tempo',products:'Produtos',infrastructure:'Infraestrutura & TI',recoverables:'Recuperáveis',
  audits:'Auditorias',governance:'Governança',search:'Busca'
};

const CURRENT_RELEASE={version:'1.1.0',build:'CR-PM-V1.1.0-C0-20261003',environment:'candidate'};
const state={data:null,view:'now',versionFilter:'all',pendingFilter:'all',historyFilter:'all',search:'',liveBranches:null,liveSync:null,remoteRelease:null};
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const arr=v=>Array.isArray(v)?v:[];
const label=s=>STATUS_LABEL[s]||String(s||'').replace(/_/g,' ');
const short=s=>s?String(s).slice(0,8):'—';
const statusClass=s=>['canonical','candidate','homologated','homologation','executing','queue','review','archived','completed','live','blocked','partial','attention'].includes(s)?s:(s==='preserved'?'canonical':s==='confirmed'?'completed':s==='in_progress'?'executing':s==='in_progress_support'?'homologation':s==='unconfirmed'?'attention':'review');
const badge=s=>`<span class="badge ${statusClass(s)}">${esc(label(s))}</span>`;
const ghCommit=sha=>sha?`https://github.com/rogeriocibin-alt/construrei-oauth-pages/commit/${encodeURIComponent(sha)}`:'';
const ghBranch=br=>br?`https://github.com/rogeriocibin-alt/construrei-oauth-pages/tree/${encodeURIComponent(br)}`:'';
const today=()=>new Date(new Date().toLocaleString('en-US',{timeZone:'America/Sao_Paulo'}));
const ageDays=dateStr=>{
  if(!dateStr) return null;
  const d=new Date(dateStr+'T12:00:00-03:00');
  return Math.max(0,Math.floor((today()-d)/86400000));
};
const ageBand=days=>days==null?'Sem data':days===0?'Hoje':days<=2?'Recente':days<=5?'Envelhecendo':'Antiga';
const priWeight=p=>({P0:0,P1:1,P2:2,P3:3}[p]??9);
const histDate=name=>{
  let m=String(name||'').match(/(2026)(\d{2})(\d{2})/);
  if(m) return `${m[1]}-${m[2]}-${m[3]}`;
  m=String(name||'').match(/(2026)-(\d{2})-(\d{2})/);
  return m?`${m[1]}-${m[2]}-${m[3]}`:'';
};
const histKind=name=>{
  const u=String(name||'').toUpperCase();
  if(u.includes('CHECKPOINT')) return 'checkpoint';
  if(/(^|\/)BACKUP|PRE-|BEFORE|FREEZE/.test(u)) return 'safety';
  if(u.includes('CANONICAL')||u.includes('HOMOLOG')) return 'canonical';
  if(u.includes('CANDIDATE')) return 'candidate';
  if(u.includes('RECOVERY')||u.includes('RESTORE')) return 'recovery';
  if(name==='main') return 'main';
  return 'development';
};
const histProduct=name=>{
  const l=String(name||'').toLowerCase();
  if(l.includes('project-manager')) return 'gestor';
  if(l.includes('presentation')) return 'presentation';
  if(l.includes('app')) return 'app';
  if(l.includes('f00')||l.includes('f01')||l.includes('flow')) return 'flows';
  if(l.includes('dashboard')||l.includes('executive')||l.includes('v9')||l.includes('v10')||l.includes('v11')) return 'executive';
  if(l.includes('central')||l.includes('home')||l.includes('sidebar')||l.includes('identity')) return 'central';
  return 'project';
};

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


function renderOwnerHub(){
  const items=arr(state.data.owner_access);
  const central=items.find(x=>x.id==='central');
  const rest=items.filter(x=>x.id!=='central');
  return `
    <section class="owner-hub card">
      <div class="card-head"><div><h3>Seu acesso único ao CONSTRU-REI</h3><p>Camada do proprietário/desenvolvedor. A equipe continua operando diretamente pela Central.</p></div><div class="spacer"></div><span class="badge live">PWA do proprietário</span></div>
      ${central?`<button class="central-gateway external-btn" data-url="${esc(central.url)}">
        <div class="gateway-mark"><img src="./pwa-icon.svg?v=20261003applogo2" alt="APP CONSTRU-REI"></div>
        <div class="gateway-copy"><small>CENTRAL CONSTRU-REI</small><strong>Operação viva</strong><span>${esc(central.source)} • ${esc(central.access)}</span></div>
        <div class="gateway-state"><span class="live-dot"></span><b>Entrar na Central</b><em>→</em></div>
      </button>`:''}
      <div class="owner-links">
        ${rest.map(x=>`<button class="owner-link external-btn" data-url="${esc(x.url)}"><span class="owner-link-kind">${esc(x.kind)}</span><b>${esc(x.name)}</b><small>${esc(x.description)}</small><span class="owner-link-foot">${badge(x.status)}<em>Abrir ↗</em></span></button>`).join('')}
      </div>
      <div class="notice owner-rule"><b>Regra de sincronismo:</b> se APP, Central, Dashboard ou qualquer módulo evoluir e o Gestor não refletir essa evolução, a entrega ainda não está concluída.</div>
    </section>`;
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
  const pp=arr(d.project_pending);
  const pActive=pp.filter(x=>['in_progress','in_progress_support'].includes(x.state));
  const pBlocked=pp.filter(x=>x.state==='blocked');
  const pHuman=pp.filter(x=>x.human_action&&x.state!=='completed');
  const pOld=pp.filter(x=>(ageDays(x.last_movement)||0)>=3&&x.state!=='completed');
  const hist=(state.liveBranches||d.history_catalog?.branches||[]);

  $('#view-now').innerHTML=`
    ${renderOwnerHub()}
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
      ${metric('Pendências do projeto',pp.length,`${pActive.length} ativas • ${pBlocked.length} bloqueada(s)`,'!')}
      ${metric('Ação do Rogério',pHuman.length,pHuman.length?'Somente decisões realmente humanas':'Nenhuma ação humana pendente','◎')}
      ${metric('Sem avanço ≥3d',pOld.length,'Envelhecimento calculado automaticamente','◷')}
      ${metric('Referências históricas',hist.length,state.liveSync?.ok?'GitHub atualizado ao vivo':'Snapshot com atualização automática','↺')}
      ${metric('Branches auditadas',audit.total_branches??hist.length,'Snapshot do repositório','⑂')}
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

    <section class="card" style="margin-top:16px">
      <div class="card-head"><div><h3>Radar de Pendências do Projeto</h3><p>O que exige atenção agora — separado das pendências operacionais da Central/APP.</p></div><div class="spacer"></div><button class="soft-btn jump-view" data-target="pending">Abrir gestão completa</button></div>
      <div class="pending-radar">
        ${pp.slice().sort((a,b)=>priWeight(a.priority)-priWeight(b.priority)||(ageDays(b.last_movement)||0)-(ageDays(a.last_movement)||0)).slice(0,6).map(p=>`
          <button class="pending-mini detail-btn" data-type="pending" data-id="${esc(p.id)}">
            <span class="pending-id">${esc(p.id)}</span><span class="pending-mini-title">${esc(p.title)}</span>
            <span class="badge ${statusClass(p.state)}">${esc(label(p.state))}</span>
            <span class="age-pill">${esc(ageBand(ageDays(p.last_movement)))} • ${esc(ageDays(p.last_movement))}d</span>
          </button>`).join('')}
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
  bindExternalButtons();
  $$('.jump-view').forEach(b=>b.onclick=()=>setView(b.dataset.target));
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


function pendingCard(p){
  const age=ageDays(p.last_movement);
  const action=p.human_action?'<span class="owner-action">AÇÃO DO ROGÉRIO</span>':'<span class="auto-action">GESTÃO AUTOMÁTICA</span>';
  return `<article class="pending-card ${p.state==='blocked'?'is-blocked':''}">
    <div class="pending-head">
      <div><span class="pending-code">${esc(p.id)}</span><h3>${esc(p.title)}</h3></div>
      <div class="decision-meta">${action}${badge(p.state)}<span class="badge review">${esc(p.priority)}</span></div>
    </div>
    <div class="pending-grid">
      <div><small>Área</small><b>${esc(p.domain)}</b></div>
      <div><small>Responsável</small><b>${esc(p.owner)}</b></div>
      <div><small>Última movimentação</small><b>${esc(p.last_movement||'—')}</b></div>
      <div><small>Idade</small><b>${esc(ageBand(age))} • ${esc(age??'—')}d</b></div>
    </div>
    <div class="pending-next"><small>Próxima ação</small><p>${esc(p.next_action)}</p></div>
    <div class="pending-foot"><span class="source-chip">${esc(p.source||'Sem fonte')}</span><button class="soft-btn detail-btn" data-type="pending" data-id="${esc(p.id)}">Abrir contexto</button></div>
  </article>`;
}

function renderPending(){
  const d=state.data;
  const all=arr(d.project_pending);
  const legacy=all.filter(x=>x.provenance==='legacy_recovered').length;
  const list=all.filter(p=>{
    if(state.pendingFilter==='all') return true;
    if(state.pendingFilter==='human') return p.human_action&&p.state!=='completed';
    if(state.pendingFilter==='blocked') return p.state==='blocked';
    if(state.pendingFilter==='aging') return (ageDays(p.last_movement)||0)>=3&&p.state!=='completed';
    if(state.pendingFilter==='active') return ['in_progress','in_progress_support'].includes(p.state);
    if(state.pendingFilter==='unconfirmed') return p.state==='unconfirmed';
    return true;
  }).sort((a,b)=>priWeight(a.priority)-priWeight(b.priority)||(ageDays(b.last_movement)||0)-(ageDays(a.last_movement)||0));

  const active=all.filter(x=>['in_progress','in_progress_support'].includes(x.state)).length;
  const human=all.filter(x=>x.human_action&&x.state!=='completed').length;
  const blocked=all.filter(x=>x.state==='blocked').length;
  const old=all.filter(x=>(ageDays(x.last_movement)||0)>=3&&x.state!=='completed').length;

  $('#view-pending').innerHTML=`
    <div class="page-intro"><div><h2>Pendências do Projeto</h2><p>Banco Mestre vivo do projeto inteiro. Não confundir com pendências operacionais do APP/Central. A idade é calculada automaticamente e ação humana só aparece quando realmente depende do Owner.</p></div></div>
    <section class="metrics pending-metrics">
      ${metric('Itens visíveis',all.length,'Banco Mestre atual','!')}
      ${metric('Em execução',active,'Limite geral: 2 frentes','⇢')}
      ${metric('Ação do Rogério',human,'Decisões humanas explícitas','◎')}
      ${metric('Bloqueadas',blocked,'Precisam destravar dependência','×')}
      ${metric('Sem avanço ≥3d',old,'Envelhecimento automático','◷')}
      ${metric('Legado nominal',legacy+'/15','Restante não será inventado','◇')}
    </section>
    <div class="toolbar">
      ${[['all','Todas'],['active','Ativas'],['human','Ação do Rogério'],['blocked','Bloqueadas'],['aging','Envelhecendo'],['unconfirmed','Não confirmado']].map(([id,t])=>`<button class="filter-btn ${state.pendingFilter===id?'active':''}" data-pfilter="${id}">${t}</button>`).join('')}
    </div>
    <div class="pending-board">${list.map(p=>pendingCard(p)).join('')}</div>
    <div class="notice" style="margin-top:14px"><b>Regra-mãe:</b> se a informação depende de você lembrar, cobrar ou editar manualmente para continuar existindo, a gestão ainda não está pronta. O Gestor deve detectar, medir, propor, acompanhar e fechar com evidência.</div>
  `;
  $$('[data-pfilter]').forEach(b=>b.onclick=()=>{state.pendingFilter=b.dataset.pfilter;renderPending();});
  bindDetailButtons();
}

function historyRows(){
  const fallback=arr(state.data.history_catalog?.branches);
  return state.liveBranches||fallback;
}

function renderHistory(){
  const d=state.data;
  const all=historyRows();
  const list=all.filter(x=>state.historyFilter==='all'||x.product===state.historyFilter||x.kind===state.historyFilter)
    .slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')||a.name.localeCompare(b.name));
  const hc=d.history_catalog||{};
  const dates=all.map(x=>x.date).filter(Boolean).sort();
  const live=state.liveSync;
  const counts={}; all.forEach(x=>counts[x.kind]=(counts[x.kind]||0)+1);
  $('#view-history').innerHTML=`
    <div class="page-intro"><div><h2>Histórico Vivo</h2><p>Memória navegável do desenvolvimento: referências leves para versões, checkpoints, recuperações e candidatas. Nada de duplicar arquivos pesados.</p></div></div>
    <section class="history-status card">
      <div class="history-live ${live?.ok?'ok':'fallback'}"><span class="live-dot"></span><div><b>${live?.ok?'GitHub sincronizado ao abrir':'Usando snapshot versionado'}</b><small>${live?.at?('Atualizado '+live.at):esc(hc.coverage_note||'')}</small></div></div>
      <div class="history-kpis">
        <div><small>Referências</small><strong>${all.length}</strong></div>
        <div><small>Checkpoints</small><strong>${counts.checkpoint||0}</strong></div>
        <div><small>Canônicas/homologadas</small><strong>${counts.canonical||0}</strong></div>
        <div><small>Candidatas</small><strong>${counts.candidate||0}</strong></div>
        <div><small>Período indexado</small><strong class="range">${esc(dates[0]||hc.earliest_date||'—')} → ${esc(dates[dates.length-1]||hc.latest_date||'—')}</strong></div>
      </div>
    </section>
    <div class="toolbar">
      ${[['all','Tudo'],['central','Central'],['app','APP'],['flows','F00→F09'],['executive','Executiva'],['presentation','Apresentação'],['gestor','Gestor'],['checkpoint','Checkpoints'],['recovery','Recuperações']].map(([id,t])=>`<button class="filter-btn ${state.historyFilter===id?'active':''}" data-hfilter="${id}">${t}</button>`).join('')}
    </div>
    <div class="card table-wrap"><table class="data-table history-table">
      <thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Referência</th><th></th></tr></thead>
      <tbody>${list.map(x=>`<tr><td class="mono">${esc(x.date||'—')}</td><td>${esc(x.product)}</td><td><span class="badge review">${esc(x.kind)}</span></td><td><b>${esc(x.name)}</b></td><td><button class="soft-btn external-btn" data-url="${esc(ghBranch(x.name))}">Abrir</button></td></tr>`).join('')}</tbody>
    </table></div>
  `;
  $$('[data-hfilter]').forEach(b=>b.onclick=()=>{state.historyFilter=b.dataset.hfilter;renderHistory();});
  bindExternalButtons();
}

async function refreshLiveRepository(){
  const base='https://api.github.com/repos/rogeriocibin-alt/construrei-oauth-pages';
  try{
    const out=[];
    for(let page=1;page<=5;page++){
      const r=await fetch(`${base}/branches?per_page=100&page=${page}`,{headers:{Accept:'application/vnd.github+json'}});
      if(!r.ok) throw new Error('GitHub '+r.status);
      const rows=await r.json();
      out.push(...rows.map(x=>x.name));
      if(rows.length<100) break;
    }
    if(out.length){
      state.liveBranches=[...new Set(out)].map(name=>({name,date:histDate(name),kind:histKind(name),product:histProduct(name)}));
      state.liveSync={ok:true,at:new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}).format(new Date())};
      if(state.view==='history') renderHistory();
      renderNow();
      renderGovernance();
    }
  }catch(err){
    state.liveSync={ok:false,error:String(err?.message||err)};
    if(state.view==='history') renderHistory();
  }
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
  const live=arr(state.data.owner_access);
  $('#view-products').innerHTML=`
    <div class="page-intro"><div><h2>Produtos</h2><p>Mapa do proprietário. Produtos, módulos e acessos operacionais ficam reunidos aqui; a equipe continua usando a Central.</p></div></div>
    <div class="product-grid">${arr(state.data.products).map(p=>{const a=live.find(x=>x.id===p.id);return `<article class="card product"><div>${badge(p.status)}</div><h3>${esc(p.name)}</h3><p>${esc(p.summary)}</p><div class="product-current"><b>Atual:</b> ${esc(p.current)}</div>${a?`<button class="soft-btn external-btn" data-url="${esc(a.url)}" style="margin-top:12px">Abrir produto ↗</button>`:''}</article>`}).join('')}</div>
  `;
  bindExternalButtons();
}

function renderRecoverables(){
  $('#view-recoverables').innerHTML=`
    <div class="page-intro"><div><h2>Recuperáveis</h2><p>Coisas boas que saíram da versão corrente continuam rastreadas. Recuperar não significa promover automaticamente.</p></div></div>
    <div class="recover-list">${arr(state.data.recoverables).map(r=>`<article class="recover"><div class="decision-meta">${badge(r.status)}<span class="mono">${esc(r.risk)}</span></div><h3>${esc(r.title)}</h3><p><b>Onde existia:</b> ${esc(r.existed_in)}</p><p><b>O que aconteceu:</b> ${esc(r.disappeared)}</p><p><b>Valor:</b> ${esc(r.value)}</p><p><b>Direção:</b> ${esc(r.recommendation)}</p></article>`).join('')}</div>
  `;
}


function severityBadge(level){
  const cls=level==='high'?'attention':level==='medium'?'review':'archived';
  return `<span class="badge ${cls}">${esc(String(level||'info').toUpperCase())}</span>`;
}

function renderAudits(){
  const d=state.data||{}, audits=arr(d.audits), findings=arr(d.audit_findings), sources=arr(d.source_matrix), recs=arr(d.reconciliations);
  const a=audits[0];
  const target=$('#view-audits'); if(!target)return;
  target.innerHTML=`
    <div class="page-intro"><div><h2>Auditorias</h2><p>Auditorias viram objetos de gestão: original preservado, achados rastreáveis, tratamento, rechecagem e evidência.</p></div></div>
    ${a?`<section class="card audit-hero">
      <div class="card-head"><div><small class="mono">AUD-001 • ${esc(a.date)}</small><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p></div><span class="badge review">Implementação planejada</span></div>
      <div class="audit-kpis">
        <div><small>Achados</small><b>${esc(a.findings_total)}</b></div>
        <div><small>Original</small><b>Preservado</b></div>
        <div><small>SHA-256</small><b class="mono">${esc(short(a.original_evidence?.sha256))}…</b></div>
        <div><small>Persistência</small><b>Supabase interno</b></div>
      </div>
      <div class="card-pad"><p><b>Escopo:</b> ${esc(a.scope)}</p><p class="mono">Evidência: ${esc(a.original_evidence?.file)} • ${esc(a.original_evidence?.sha256)}</p></div>
    </section>`:''}
    <div class="section-grid audit-grid">
      <section class="card">
        <div class="card-head"><div><h3>Achados e tratamento</h3><p>P0/P1/P2 + controles estruturais, sem “dar baixa” por aparência.</p></div><span class="badge candidate">${findings.length} itens</span></div>
        <div class="audit-findings">${findings.map(x=>`<div class="audit-row"><div>${severityBadge(x.severity)} <span class="mono">${esc(x.code)}</span><b>${esc(x.title)}</b><small>${esc(x.implementation_item)} • ${esc(label(x.status))}</small></div></div>`).join('')}</div>
      </section>
      <section class="card">
        <div class="card-head"><div><h3>Matriz de fontes</h3><p>Saúde, confiança e idade do dado — sem transformar “conhecido” em “vivo”.</p></div></div>
        <div class="source-grid">${sources.map(s=>`<div class="source-row"><div><b>${esc(s.name)}</b><small>${esc(s.note||'')}</small></div><div class="source-state">${badge(s.status==='healthy'?'live':s.status==='error'?'blocked':s.status==='stale'?'attention':'unconfirmed')}<small>${esc(s.last_read||'—')} • ${esc(s.confidence)}</small></div></div>`).join('')}</div>
      </section>
    </div>
    <section class="card" style="margin-top:16px">
      <div class="card-head"><div><h3>Reconciliações abertas</h3><p>Divergência vira objeto; fontes não são somadas nem “ajustadas” por conveniência.</p></div></div>
      <div class="card-pad">${recs.map(r=>`<div class="rule-row"><span class="rule-state partial">!</span><div><b>${esc(r.title)}</b><small>${esc(r.difference)} • ${esc(r.next_action)}</small></div>${badge(r.status==='open'?'blocked':'review')}</div>`).join('')}</div>
    </section>
  `;
}

function syncReleaseUi(meta=CURRENT_RELEASE){
  const chip=$('#versionChip');
  if(chip) chip.textContent=`V${meta.version||CURRENT_RELEASE.version} • ${short(meta.build||CURRENT_RELEASE.build)}`;
}

function releaseNotesHtml(meta){
  const notes=arr(meta?.changes||meta?.release_notes);
  return `<div class="detail-block"><b>Versão</b><p>V${esc(meta?.version||CURRENT_RELEASE.version)} • <span class="mono">${esc(meta?.build||CURRENT_RELEASE.build)}</span></p></div>
    <div class="detail-block"><b>Ambiente</b><p>${esc(meta?.environment||CURRENT_RELEASE.environment)}</p></div>
    <div class="detail-block"><b>Mudanças</b>${notes.length?`<ul>${notes.map(n=>`<li>${esc(typeof n==='string'?n:(n.title||JSON.stringify(n)))}</li>`).join('')}</ul>`:'<p>Sem changelog adicional.</p>'}</div>
    <div class="detail-block"><b>Regra</b><p>Atualização ocorre neste mesmo PWA. A instalação não é recriada e a canônica não é promovida por atualização de cache.</p></div>`;
}

function hideUpdateBanner(){ const b=$('#updateBanner'); if(b)b.hidden=true; }
function showUpdateBanner(remote){
  const b=$('#updateBanner'); if(!b)return;
  b.hidden=false;
  const t=$('#updateBannerText');
  if(t)t.textContent=`V${remote.version||'?'} • ${remote.build||'novo build'} está disponível. O pacote só é ativado por inteiro.`;
}
async function activateWaitingWorker(reg){
  if(reg?.waiting){reg.waiting.postMessage({type:'SKIP_WAITING'});return true;}
  const worker=reg?.installing;
  if(worker){
    await new Promise(resolve=>{
      const done=()=>{if(worker.state==='installed'||worker.state==='redundant')resolve();};
      worker.addEventListener('statechange',done); done();
    });
    if(reg.waiting){reg.waiting.postMessage({type:'SKIP_WAITING'});return true;}
  }
  return false;
}
async function updatePwaNow(){
  if(!('serviceWorker' in navigator)){location.reload();return;}
  const btn=$('#updateNowBtn'); if(btn){btn.disabled=true;btn.textContent='Atualizando…';}
  try{
    const reg=await navigator.serviceWorker.getRegistration();
    if(reg) await reg.update();
    const activated=await activateWaitingWorker(reg);
    if(!activated) location.reload();
  }catch(err){
    openDrawer('Atualização do Gestor','PWA',`<div class="detail-block"><b>Falha ao atualizar</b><p>${esc(err?.message||err)}</p><p>Nenhuma versão canônica foi alterada. Tente novamente quando houver conexão.</p></div>`);
  }finally{
    if(btn){btn.disabled=false;btn.textContent='Atualizar agora';}
  }
}
async function checkReleaseUpdate(){
  try{
    const r=await fetch(`./version.json?ts=${Date.now()}`,{cache:'no-store'});
    if(!r.ok) throw new Error('version HTTP '+r.status);
    const remote=await r.json();
    state.remoteRelease=remote;
    syncReleaseUi(CURRENT_RELEASE);
    localStorage.setItem('cr-pm-last-seen-build',CURRENT_RELEASE.build);
    if(remote.build && remote.build!==CURRENT_RELEASE.build) showUpdateBanner(remote);
    return remote;
  }catch(err){
    state.remoteRelease={...CURRENT_RELEASE,version_check_error:String(err?.message||err)};
    syncReleaseUi(CURRENT_RELEASE);
    return state.remoteRelease;
  }
}
function bindReleaseUi(){
  const chip=$('#versionChip');
  if(chip) chip.onclick=()=>openDrawer('Versão do Gestor','Release',releaseNotesHtml(state.remoteRelease||CURRENT_RELEASE));
  const notes=$('#updateNotesBtn');
  if(notes) notes.onclick=()=>openDrawer('O que muda','Atualização disponível',releaseNotesHtml(state.remoteRelease||CURRENT_RELEASE));
  const later=$('#updateLaterBtn'); if(later) later.onclick=hideUpdateBanner;
  const now=$('#updateNowBtn'); if(now) now.onclick=updatePwaNow;
  if('serviceWorker' in navigator){
    let reloading=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload();});
  }
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
      ['Marco',d.milestones,'title',['detail','type']],
      ['Pendência',d.project_pending,'title',['id','domain','priority','state','owner','next_action','dependency','source','close_when']]
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
  if(type==='pending'){
    const p=arr(d.project_pending).find(x=>x.id===id); if(!p)return null;
    const age=ageDays(p.last_movement);
    return {title:p.title,eyebrow:p.id+' • '+p.priority,html:`
      <div class="detail-block"><b>Estado</b><p>${label(p.state)} • ${ageBand(age)} (${age??'—'} dias)</p></div>
      <div class="detail-block"><b>Responsável</b><p>${esc(p.owner)}</p></div>
      <div class="detail-block"><b>Próxima ação</b><p>${esc(p.next_action)}</p></div>
      <div class="detail-block"><b>Dependência</b><p>${esc(p.dependency)}</p></div>
      <div class="detail-block"><b>Fonte / evidência</b><p class="mono">${esc(p.source||'—')}</p></div>
      <div class="detail-block"><b>Critério de conclusão</b><p>${esc(p.close_when)}</p></div>
      <div class="detail-block"><b>Alçada</b><p>${p.human_action?'Depende de decisão humana do Rogério.':'Deve ser acompanhada/medida pelo sistema e pelos agentes, sem cobrança manual do Rogério.'}</p></div>
      <div class="detail-block"><b>Origem</b><p>${esc(p.provenance||'—')}</p></div>
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
  renderNow();renderPending();renderHistory();renderCanonical();renderFronts();renderVersions();renderDecisions();renderTimeline();renderProducts();renderRecoverables();renderAudits();renderGovernance();
}

let deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  const b=$('#installPwaBtn'); if(b)b.hidden=false;
});
window.addEventListener('appinstalled',()=>{const b=$('#installPwaBtn'); if(b)b.hidden=true; deferredInstallPrompt=null;});

async function init(){
  try{
    const r=await fetch('./project-data.json?v=20261003v110c0',{cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    state.data=await r.json();
    renderAll();
    bindReleaseUi();
    syncReleaseUi(CURRENT_RELEASE);
    setView('now');
    refreshLiveRepository();
    setInterval(refreshLiveRepository,300000);

    $$('.nav-btn').forEach(b=>b.onclick=()=>setView(b.dataset.view));
    $('#drawerClose').onclick=closeDrawer;
    $('#drawerBackdrop').onclick=()=>{closeDrawer();closeSidebar();};
    $('#mobileMenu').onclick=()=>$('#sidebar').classList.contains('open')?closeSidebar():openSidebar();
    const installBtn=$('#installPwaBtn');
    if(installBtn) installBtn.onclick=async()=>{
      if(deferredInstallPrompt){
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt=null;
        installBtn.hidden=true;
      }else{
        openDrawer('Instalar Gestor','PWA','<div class="detail-block"><b>Instalação</b><p>Use o menu do navegador e escolha “Adicionar à tela inicial” ou “Instalar app”. O Gestor usa este mesmo endereço.</p></div>');
      }
    };
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('./sw.js?v=20261003v110c0',{updateViaCache:'none'}).then(async reg=>{await reg.update().catch(()=>{});await checkReleaseUpdate();}).catch(()=>checkReleaseUpdate());
    }

    if(!('serviceWorker' in navigator)) checkReleaseUpdate();

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