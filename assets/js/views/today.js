// P01 今天·首页 —— 打开即见"今天演什么"
import { db } from '../data.js';
import { esc, priorityTags, moduleColor, phaseBadge } from '../ui.js';
import { getTodayModel, prettyDate, localISO } from '../today.js';

const TAB = 'today';

function todayCard(m) {
  const primary = m.scripts[0];
  const btn = primary
    ? `<a class="btn btn--primary btn--block" href="#/script?id=${esc(primary.id)}" style="margin-top:12px;">查看今日剧本 →</a>`
    : `<a class="btn btn--primary btn--block" href="#/scripts" style="margin-top:12px;">去剧本库看看 →</a>`;
  const items = (m.focus || []).map(f => `<li>${esc(f)}</li>`).join('');
  return `
  <section class="section-card section-card--accent">
    <h2 class="sec-title" style="margin-top:0;">今日重点</h2>
    <ul>${items}</ul>
    ${btn}
  </section>`;
}

function weekList(m) {
  if (!m.scripts || !m.scripts.length) {
    return `<div class="section-card"><p class="muted">本节段暂无安排剧本（例如送别·收心零训练日）。可查看 <a href="#/scripts">剧本库</a>。</p></div>`;
  }
  const cards = m.scripts.map(s => {
    const color = moduleColor(s.moduleId);
    return `
    <a class="script-card" href="#/script?id=${esc(s.id)}" style="border-left-color:${color};">
      <span class="script-card__badge">${esc(s.id)}</span>
      <span class="script-card__body">
        <span class="script-card__title">${esc(s.name)}</span>
        <span class="script-card__tags">${priorityTags(s.priority)}<span class="tag tag--mode">${esc(s.execMode)}</span></span>
      </span>
      <span class="script-card__arrow">›</span>
    </a>`;
  }).join('');
  return `<section><h2 class="sec-title">本节段剧本${m.week ? `（${esc(m.week.dateRange)}）` : ''}</h2>${cards}</section>`;
}

function calendarTimeline() {
  const plan = db().plan;
  const evs = (plan.calendar || []).sort((a, b) => a.date.localeCompare(b.date));
  if (!evs.length) return '';
  // 取今天前后的关键节点（约 6 个）
  const today = localISO();
  const idx = evs.findIndex(e => e.date >= today);
  const start = Math.max(0, idx - 1);
  const slice = evs.slice(start, start + 6);
  const nodes = slice.map(e => {
    const isNow = e.date === today;
    return `
    <div class="timeline__node ${isNow ? 'now' : ''}">
      <span class="tl-date">${esc(e.date.slice(5).replace('-', '.'))}</span>
      ${esc(e.title)}
    </div>`;
  }).join('');
  return `
  <section>
    <h2 class="sec-title">关键日历</h2>
    <div class="timeline">${nodes}</div>
    <p class="tiny">当前高亮为今天。完整计划见 <a href="#/calendar">日历时间轴</a>。</p>
  </section>`;
}

function quickEntries(m) {
  return `
  <section class="quick-grid" style="margin-top:var(--sp-5);">
    <a class="quick-card" href="#/safety"><span class="q-icon">💬</span>话术卡</a>
    <a class="quick-card" href="#/safety"><span class="q-icon">🛡️</span>安全监测</a>
    <a class="quick-card" href="#/calendar"><span class="q-icon">🗓️</span>本周计划</a>
  </section>`;
}

function P01() {
  const plan = db().plan;
  const scripts = db().scripts;
  const m = getTodayModel(plan, scripts);
  const badge = phaseBadge(m.phase.name, m.phase.from ? `${m.phase.from.slice(5).replace('-', '.')}~${m.phase.to.slice(5).replace('-', '.')}` : '');
  const restNote = m.restDef && m.restDef.length
    ? `<p class="tiny" style="margin-top:6px;">（另有 ${m.restDef.length} 个防御类剧本按"当日≤1"规则顺延至其他日期，避免给孩子制造"幼儿园很危险"的氛围。）</p>` : '';

  return `
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:var(--sp-4);">${badge}
    <span class="tag tag--plain">今天 ${esc(prettyDate(m.today))}</span>
  </div>
  ${todayCard(m)}
  ${weekList(m)}
  ${restNote}
  ${calendarTimeline()}
  ${quickEntries(m)}
  <section class="section-card" style="background:var(--color-primary-soft);">
    <p class="muted">孩子主权优先：孩子手比"T"字随时收戏；退出即成功，贴纸照给。<br>安全底线见 <a href="#/safety">安全话术底座</a>。</p>
  </section>`;
}

export default { P01 };
export { TAB };
