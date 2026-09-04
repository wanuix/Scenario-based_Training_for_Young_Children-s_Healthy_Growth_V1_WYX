// 🎭 剧本板块：P02 剧本库 / P03 剧本详情 / P04 大字卡
import { db } from '../data.js';
import { esc, priorityTags, stageTag, modeTag, moduleColor, filterScripts } from '../ui.js';

const TAB = 'scripts';

// ---------- P02 剧本库（四维筛选） ----------
function filterBar(args) {
  const modules = db().modules;
  const plan = db().plan;
  const prios = (plan.priorities || []).map(p => p.id);
  const stages = ['近期', '中期', '长期'];
  const modes = ['正式演练', '日常渗透', '户外实战', '每日仪式'];

  const chipRow = (label, options, key, activeVal) => {
    const chips = options.map(o => {
      const on = activeVal === o ? 'on' : '';
      const next = { ...args, [key]: activeVal === o ? '' : o };
      const qs = Object.entries(next).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
      return `<a class="chip ${on}" href="#/scripts${qs ? '?' + qs : ''}">${esc(o)}</a>`;
    }).join('');
    return `<div class="filter-bar"><span class="chip" style="cursor:default;color:var(--text-3);flex-shrink:0;">${label}</span>${chips}</div>`;
  };

  return `
  <div class="no-print">
    ${chipRow('模块', modules.map(m => m.id), 'm', args.m)}
    ${chipRow('优先级', prios, 'p', args.p)}
    ${chipRow('阶段', stages, 's', args.s)}
    ${chipRow('方式', modes, 'e', args.e)}
  </div>`;
}

function P02(args) {
  const scripts = db().scripts;
  const list = filterScripts(scripts, { moduleId: args.m, priority: args.p, stage: args.s, mode: args.e });
  const cards = list.map(s => {
    const color = moduleColor(s.moduleId);
    return `
    <a class="script-card" href="#/script?id=${esc(s.id)}" style="border-left-color:${color};">
      <span class="script-card__badge">${esc(s.id)}</span>
      <span class="script-card__body">
        <span class="script-card__title">${esc(s.name)}</span>
        <span class="script-card__tags">${priorityTags(s.priority)}${stageTag(s.stage)}${modeTag(s.execMode)}</span>
      </span>
      <span class="script-card__arrow">›</span>
    </a>`;
  }).join('');

  return `
  ${filterBar(args || {})}
  <div style="display:flex;align-items:baseline;justify-content:space-between;margin:var(--sp-3) 0;">
    <h2 class="sec-title" style="margin:0;">全部剧本</h2>
    <span class="tag tag--plain">${list.length} 个</span>
  </div>
  ${list.length ? cards : `<div class="empty">没有符合条件的剧本，换个筛选试试。</div>`}`;
}

// ---------- P03 剧本详情 ----------
function dialogLines(lines) {
  if (!lines || !lines.length) return '<p class="muted">台词以训练要点为准（见下）——家庭按角色分工即兴发挥，遵循关键原则即可。</p>';
  const rows = lines.map((l, i) => {
    const isChild = /孩子|宝宝/.test(l.role);
    return `
    <div class="dialog__row ${isChild ? 'dialog__row--child' : ''}">
      <span class="dialog__who">${esc(l.role)}</span>
      <span class="dialog__bubble">${esc(l.content)}</span>
    </div>`;
  }).join('');
  return `<div class="dialog">${rows}</div>`;
}

function P03(args) {
  const id = (args && args.id) || '';
  const s = db().scripts.find(x => x.id === id);
  if (!s) return `<div class="empty">未找到剧本 ${esc(id)}。请返回<a href="#/scripts">剧本库</a>。</div>`;

  const mod = db().modules.find(m => m.id === s.moduleId);
  const milestones = db().plan.milestones;
  const color = moduleColor(s.moduleId);

  const anchors = [
    ['台词', 'lines'], ['角色', 'roles'], ['流程', 'steps'], ['原则', 'principles'],
    ['红线', 'redlines'], ['对孩子的好处', 'benefit'], ['里程碑', 'milestones'],
  ].filter(([, key]) => {
    if (key === 'redlines') return s.redlines && s.redlines.length;
    if (key === 'lines') return s.lines && s.lines.length;
    if (key === 'milestones') return s.milestoneRefs && s.milestoneRefs.length;
    return true;
  }).map(([label, key]) => `<a class="chip" href="#anchor-${key}">${label}</a>`).join('');

  const rolesHtml = Object.keys(s.roles || {}).length ? Object.entries(s.roles).map(([r, d]) =>
    `<li><b>${esc(r)}</b>：${esc(d)}</li>`).join('') : '<p class="muted">参与人：' + (s.participants || []).join('、') + '。</p>';

  const stepsHtml = (s.steps || []).map((st, i) => `
    <div class="step-item">
      <span class="step-item__no">${i + 1}</span>
      <span class="step-item__body"><span class="step-item__title">${esc(st)}</span></span>
    </div>`).join('');

  const principlesHtml = (s.principles || []).map(p => `<li>${esc(p)}</li>`).join('');
  const redlinesHtml = s.redlines && s.redlines.length
    ? `<div class="alert-card alert-card--warn" id="anchor-redlines"><div class="alert-card__title">⚠️ 操作红线</div><ul>${s.redlines.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>`
    : '';

  const benefitHtml = `<div class="section-card section-card--accent" id="anchor-benefit" style="background:var(--color-accent-soft);">
    <h2 class="sec-title" style="margin-top:0;color:#b4533d;">💡 对孩子的好处</h2>
    <p style="font-size:var(--fs-h2);font-weight:600;">${esc(s.benefit)}</p>
  </div>`;

  const msHtml = (s.milestoneRefs || []).length ? (() => {
    const items = s.milestoneRefs.map(no => {
      const m = milestones.find(x => x.no === Number(no));
      return m ? `<li><b>#${m.no} ${esc(m.name)}</b>：演练达标——${esc(m.drill)}；实战泛化——${esc(m.real)}</li>` : '';
    }).join('');
    return `<section class="section-card" id="anchor-milestones"><h2 class="sec-title" style="margin-top:0;">🎯 关联里程碑</h2><ul>${items}</ul></section>`;
  })() : '';

  const largeBtn = s.largeCard
    ? `<a class="btn btn--outline" href="#/large?id=${esc(s.id)}" style="flex:1;">📄 看大字卡</a>` : '';

  return `
  <div class="anchor-chips no-print">${anchors}</div>

  <section class="section-card" style="border-top:4px solid ${color};">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <span class="script-card__badge" style="font-size:var(--fs-h2);">${esc(s.id)}</span>
      <h1 class="page-title" style="margin:0;flex:1;">${esc(s.name)}</h1>
    </div>
    <div class="script-card__tags">
      ${priorityTags(s.priority)}${stageTag(s.stage)}${modeTag(s.execMode)}
      ${mod ? `<span class="tag tag--plain">${esc(mod.icon)} ${esc(mod.name)}</span>` : ''}
    </div>
    <p class="muted" style="margin-top:10px;">${esc(s.corePoint)}</p>
  </section>

  ${benefitHtml}

  <section class="section-card" id="anchor-lines"><h2 class="sec-title" style="margin-top:0;">🎭 台词</h2>${dialogLines(s.lines)}</section>
  <section class="section-card" id="anchor-roles"><h2 class="sec-title" style="margin-top:0;">👨‍👩‍👧 参与人·角色</h2><ul>${rolesHtml}</ul></section>
  <section class="section-card" id="anchor-steps"><h2 class="sec-title" style="margin-top:0;">🪜 五步流程</h2>${stepsHtml}</section>
  <section class="section-card" id="anchor-principles"><h2 class="sec-title" style="margin-top:0;">📌 关键原则</h2><ul>${principlesHtml}</ul></section>
  ${redlinesHtml}
  ${msHtml}

  <div class="fab-bar no-print">
    ${largeBtn}
    <a class="btn btn--primary" href="#/roles">👨‍👩‍👧 看角色分工</a>
    <a class="btn btn--outline" href="#/benefit-layers">💡 看收益</a>
  </div>`;
}

// ---------- P04 大字卡（老人友好，可打印） ----------
function P04(args) {
  const id = (args && args.id) || '';
  const s = db().scripts.find(x => x.id === id);
  if (!s) return `<div class="empty">未找到剧本 ${esc(id)}。</div>`;
  const lines = (s.largeCard && s.largeCard.lines) || (s.lines || []).map(l => l.content) || ['（本剧本无固定台词，见详情页关键原则）'];
  const action = (s.largeCard && s.largeCard.action) || '';
  const cardHtml = lines.map(l => `<div class="large-card__line">“${esc(l)}”</div>`).join('');
  return `
  <div class="large-mode">
    <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:var(--sp-4);">
      <span class="tag tag--plain">${esc(s.id)} · ${esc(s.name)}</span>
      <span class="tiny">第 1/1 屏</span>
    </div>
    <div class="large-card">
      ${cardHtml}
      ${action ? `<div class="large-card__action">👉 ${esc(action)}</div>` : ''}
    </div>
    <button class="btn btn--primary btn--block" onclick="window.print()">🖨️ 打印上墙</button>
    <p class="print-only">打印提示：只印台词+动作+编号，黑白高对比，A4 居中，可贴冰箱/玄关。</p>
  </div>`;
}

export default { P02, P03, P04 };
export { TAB };
