// 🗺️ 计划板块：P08 整体 / P09 优先级 / P10 三阶段 / P11 里程碑 / P12 日历 / P13 节段 / P14 健康 / P15 家园
import { db } from '../data.js';
import { esc, priorityTags } from '../ui.js';

const TAB = 'plan';

// ---------- P08 整体计划 ----------
function P08() {
  const plan = db().plan;
  const prios = plan.priorities || [];
  const stages = plan.stages || [];

  const prioCards = prios.map(p => `
    <a class="section-card" href="#/priorities#p-${esc(p.id)}" style="display:block;text-decoration:none;color:inherit;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <span class="tag tag--p${p.id === 'L' ? 'l' : p.id.slice(1)}">${esc(p.id)}</span>
        <b style="font-size:var(--fs-h2);">${esc(p.name)}</b>
      </div>
      <p class="muted" style="margin:0;">${esc(p.positioning)}</p>
    </a>`).join('');

  const stageRow = stages.map(s => `
    <div class="timeline__node"><span class="tl-date">${esc(s.time)}</span>${esc(s.coreTask)}</div>`).join('');

  return `
  <h1 class="page-title">整体计划</h1>
  <section class="section-card section-card--primary">
    <h2 class="sec-title" style="margin-top:0;">支撑逻辑链</h2>
    <p>${esc(plan.supportChain)}</p>
  </section>
  <section>
    <h2 class="sec-title">三阶段</h2>
    <div class="timeline">${stageRow}</div>
  </section>
  <h2 class="sec-title">六层优先级</h2>
  ${prioCards}
  <section class="quick-grid" style="margin-top:var(--sp-5);">
    <a class="quick-card" href="#/milestones"><span class="q-icon">🎯</span>里程碑</a>
    <a class="quick-card" href="#/phases"><span class="q-icon">📅</span>节段安排</a>
    <a class="quick-card" href="#/calendar"><span class="q-icon">🗓️</span>日历</a>
    <a class="quick-card" href="#/health"><span class="q-icon">🩺</span>健康</a>
  </section>`;
}

// ---------- P09 优先级 ----------
function P09() {
  const plan = db().plan;
  const prios = plan.priorities || [];
  const anchors = prios.map(p => `<a class="chip" href="#p-${esc(p.id)}">${esc(p.id)} ${esc(p.name)}</a>`).join('');
  const cards = prios.map(p => {
    const cls = p.id === 'L' ? 'tag--pl' : `tag--p${p.id.slice(1)}`;
    const modules = (p.mainModules || []).map(m => `<span class="tag tag--plain">${esc(m)}</span>`).join(' ');
    return `
    <section class="section-card" id="p-${esc(p.id)}">
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="tag ${cls}">${esc(p.id)}</span>
        <h2 class="sec-title" style="margin:0;">${esc(p.name)}</h2>
      </div>
      <p class="muted" style="margin:8px 0;">${esc(p.positioning)}</p>
      <p><b>要解决的问题：</b>${esc(p.problem)}</p>
      <p class="muted">主模块：${modules}</p>
      <div class="alert-card alert-card--info" style="margin:10px 0 0;"><b>为什么值得：</b>${esc(p.benefit)}</div>
    </section>`;
  }).join('');
  return `<div class="anchor-chips no-print">${anchors}</div><h1 class="page-title">六层优先级</h1>${cards}`;
}

// ---------- P10 三阶段 ----------
function P10() {
  const stages = db().plan.stages || [];
  const cards = stages.map(s => `
    <section class="section-card">
      <div style="display:flex;align-items:center;gap:10px;"><span class="tag tag--stage">${esc(s.time)}</span><h2 class="sec-title" style="margin:0;">${esc(s.id)}</h2></div>
      <p style="margin:10px 0;"><b>核心任务：</b>${esc(s.coreTask)}</p>
      <p class="muted">为什么这样安排：${esc(s.reason)}</p>
    </section>`).join('');
  return `<h1 class="page-title">三阶段推进</h1>${cards}`;
}

// ---------- P11 里程碑（双标尺） ----------
function P11() {
  const plan = db().plan;
  const ms = plan.milestones || [];
  const groups = [
    { name: '近期 · 9-10月', phase: '近期' },
    { name: '中期 · 11-1月', phase: '中期' },
    { name: '长期 · 2月起', phase: '长期' },
  ];
  const chips = groups.map(g => `<a class="chip" href="#ms-${esc(g.phase)}">${esc(g.name)}</a>`).join('');
  const blocks = groups.map(g => {
    const list = ms.filter(m => m.phase === g.phase);
    const cards = list.map(m => `
      <div class="ms-card" id="ms-${esc(g.phase)}">
        <div class="ms-card__head"><span class="ms-card__no">#${m.no}</span><span class="ms-card__name">${esc(m.name)}</span>${priorityTags([m.priority])}</div>
        <div class="ms-dual">
          <div class="drill"><b>演练达标</b><span>${esc(m.drill)}</span></div>
          <div class="real"><b>实战泛化</b><span>${esc(m.real)}</span></div>
        </div>
        ${m.note ? `<p class="tiny" style="margin-top:6px;">备注：${esc(m.note)}</p>` : ''}
      </div>`).join('');
    return `<h2 class="sec-title" id="ms-${esc(g.phase)}">${esc(g.name)}（${list.length}）</h2>${cards}`;
  }).join('');
  return `
  <div class="anchor-chips no-print">${chips}</div>
  <h1 class="page-title">里程碑（双标尺）</h1>
  <p class="muted" style="margin-bottom:var(--sp-4);">"演练达标"是家里可控的硬指标；"实战泛化"需经老师确认（启动节点：11月起里程碑外测启用老师确认）。</p>
  ${blocks}`;
}

// ---------- P12 日历时间轴 ----------
function P12() {
  const evs = (db().plan.calendar || []).sort((a, b) => a.date.localeCompare(b.date));
  const typeColor = {
    '入园': 'tag--p0', '关键日': 'tag--p1', '节段': 'tag--p2', '接种': 'tag--pl', '返园': 'tag--p4',
  };
  const rows = evs.map(e => `
    <div class="ms-card" style="display:flex;align-items:flex-start;gap:12px;">
      <div style="flex-shrink:0;text-align:center;min-width:52px;">
        <div style="font-size:var(--fs-h2);font-weight:700;color:var(--color-primary-dark);">${esc(e.date.slice(8))}</div>
        <div class="tiny">${esc(e.date.slice(5, 7))}月</div>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;">${esc(e.title)}</div>
        <div style="margin-top:4px;"><span class="tag ${typeColor[e.type] || 'tag--plain'}">${esc(e.type)}</span></div>
      </div>
    </div>`).join('');
  return `<h1 class="page-title">日历时间轴</h1>${rows || '<div class="empty">暂无日历。</div>'}`;
}

// ---------- P13 节段安排 ----------
function P13() {
  const phases = db().plan.phases || [];
  const cards = phases.map(p => {
    const focus = (p.focus || []).map(f => `<li>${esc(f)}</li>`).join('');
    const specs = (p.specials || []).map(s => `<span class="tag tag--plain">${esc(s)}</span>`).join(' ');
    const range = p.from && p.to ? `${p.from.slice(5).replace('-', '.')}~${p.to.slice(5).replace('-', '.')}` : '';
    const scriptLink = (p.scriptIds && p.scriptIds.length)
      ? `<a class="chip" href="#/scripts?m=${esc(p.scriptIds[0] && db().scripts.find(s => s.id === p.scriptIds[0]) ? (db().scripts.find(s => s.id === p.scriptIds[0]).moduleId) : '')}">看本段剧本</a>`
      : '<span class="tag tag--stage">零训练</span>';
    return `
    <section class="section-card">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <h2 class="sec-title" style="margin:0;">${esc(p.name)}</h2>
        <span class="tag tag--stage">${esc(range)}</span>
      </div>
      <h3 class="sub-title" style="margin-top:10px;">重点</h3>
      <ul>${focus}</ul>
      <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;">${scriptLink}<span class="tiny">特殊节点：</span>${specs}</div>
    </section>`;
  }).join('');
  return `<h1 class="page-title">节段安排</h1>${cards}`;
}

// ---------- P14 健康 ----------
function P14() {
  const items = db().plan.health || [];
  const chips = items.map(h => `<a class="chip" href="#h-${esc(h.id)}">${esc(h.icon)} ${esc(h.name.split('（')[0])}</a>`).join('');
  const cards = items.map(h => `
    <section class="section-card" id="h-${esc(h.id)}">
      <h2 class="sec-title" style="margin-top:0;">${esc(h.icon)} ${esc(h.name)}</h2>
      <ul>${(h.content || []).map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      ${(h.action || []).length ? `<div class="alert-card alert-card--info" style="margin-top:10px;"><b>行动：</b>${(h.action || []).map(a => `· ${esc(a)}`).join('')}</div>` : ''}
    </section>`).join('');
  return `<div class="anchor-chips no-print">${chips}</div><h1 class="page-title">健康与安全</h1>${cards}`;
}

// ---------- P15 家园沟通 ----------
function P15() {
  const hs = db().plan.homeSchool;
  if (!hs) return '<div class="empty">暂无家园沟通数据。</div>';
  const li = (arr) => (arr || []).map(x => `<li>${esc(x)}</li>`).join('');
  return `
  <h1 class="page-title">家园沟通</h1>
  <section class="section-card"><h2 class="sec-title" style="margin-top:0;">① 了解（5 项）</h2><ul>${li(hs.understand)}</ul></section>
  <section class="section-card"><h2 class="sec-title" style="margin-top:0;">② 同步（3 项）</h2><ul>${li(hs.sync)}</ul></section>
  <section class="section-card" style="background:var(--color-accent-soft);"><h2 class="sec-title" style="margin-top:0;color:#b4533d;">③ 红线（2 条）</h2><ul>${li(hs.redlines)}</ul></section>
  <section class="section-card section-card--primary">
    <h2 class="sec-title" style="margin-top:0;">请假报备话术（9.18 前发送）</h2>
    <p style="background:#fff;border-radius:var(--r-btn);padding:14px;border:1px solid var(--border);">${esc(hs.leaveScript)}</p>
    <p class="tiny">沟通节奏：第一个月每周 1 次简短＋每两周 1 次深入；周五下午文字优于面谈。${esc(hs.communicationRhythm || '')}</p>
  </section>`;
}

export default { P08, P09, P10, P11, P12, P13, P14, P15 };
export { TAB };
