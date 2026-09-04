// 👨‍👩‍👧 角色板块：P05 角色总览 / P06 成员详情 / P07 姥姥姥爷21天专项
import { db } from '../data.js';
import { esc, priorityTags, moduleColor } from '../ui.js';

const TAB = 'roles';

const TIER_STYLE = {
  '总执行': 'layer-block--total',
  '主执行': 'layer-block--main',
  '日常渗透': 'layer-block--daily',
  '特设（21天）': 'layer-block--special',
};
const TIER_DESC = {
  '总执行': '统筹全局·导演',
  '主执行': '核心对手戏·运动',
  '日常渗透': '生活常规·复盘',
  '特设（21天）': '9.16-10.6 密集窗口',
};

// ---------- P05 角色总览 ----------
function P05() {
  const fam = db().family;
  const tiers = fam.pyramidTiers || [];
  const members = fam.members || [];
  const blocks = tiers.map(tier => {
    const list = members.filter(m => m.tier === tier);
    const avatars = list.map(m => `
      <a href="#/role?id=${esc(m.id)}" style="text-align:center;text-decoration:none;color:inherit;flex:1 1 96px;min-width:0;">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--color-primary-soft);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 6px;">${esc(m.icon)}</div>
        <div style="font-size:var(--fs-tag);font-weight:600;">${esc(m.name)}</div>
        <div style="font-size:12px;color:var(--text-3);">${esc(m.role)}</div>
      </a>`).join('');
    return `
    <div class="layer-block ${TIER_STYLE[tier] || ''}">
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:10px;">
        <span style="font-weight:700;font-size:var(--fs-h2);">${esc(tier)}</span>
        <span class="tiny">${esc(TIER_DESC[tier] || '')}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;">${avatars || '<span class="tiny">暂无成员</span>'}</div>
    </div>`;
  }).join('');

  const principles = (fam.principles || []).map(p => `<li>${esc(p)}</li>`).join('');
  const quota = (fam.attentionQuota || []).map(q => `<li>${esc(q)}</li>`).join('');

  return `
  <h1 class="page-title">家庭角色分工</h1>
  ${blocks}
  <section class="section-card">
    <h2 class="sec-title" style="margin-top:0;">分配原则</h2>
    <ul>${principles}</ul>
  </section>
  <section class="section-card">
    <h2 class="sec-title" style="margin-top:0;">注意力配额（7大人1孩子防过关注）</h2>
    <ul>${quota}</ul>
    <p class="muted">姥姥姥爷 21 天专项见 <a href="#/grandparents">姥姥姥爷 21 天专项</a>。</p>
  </section>`;
}

// ---------- P06 成员详情 ----------
function P06(args) {
  const id = (args && args.id) || 'mom';
  const fam = db().family;
  const m = fam.members.find(x => x.id === id);
  if (!m) return `<div class="empty">未找到成员 ${esc(id)}。</div>`;

  const scripts = db().scripts;
  const playScripts = (m.scriptIds || []).map(sid => {
    const s = scripts.find(x => x.id === sid);
    return s ? `<a class="script-card" href="#/script?id=${esc(s.id)}" style="border-left-color:${moduleColor(s.moduleId)};margin-bottom:8px;">
      <span class="script-card__badge">${esc(s.id)}</span>
      <span class="script-card__body"><span class="script-card__title">${esc(s.name)}</span>
      <span class="script-card__tags">${priorityTags(s.priority)}</span></span>
      <span class="script-card__arrow">›</span></a>` : '';
  }).join('');

  const tasks = (m.coreTasks || []).map(t => `<li>${esc(t)}</li>`).join('');
  const notPlay = (m.notPlay || []).map(t => `<li>${esc(t)}</li>`).join('');

  return `
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:var(--sp-4);">
    <div style="width:64px;height:64px;border-radius:50%;background:var(--color-primary-soft);display:flex;align-items:center;justify-content:center;font-size:32px;">${esc(m.icon)}</div>
    <div>
      <h1 class="page-title" style="margin:0;">${esc(m.name)}</h1>
      <div style="margin-top:6px;"><span class="tag tag--plain">${esc(m.tier)}</span> <span class="tag tag--mode">${esc(m.role)}</span></div>
    </div>
  </div>
  <section class="section-card"><h2 class="sec-title" style="margin-top:0;">核心任务</h2><ul>${tasks}</ul>
    <p class="muted">出场频次：${esc(m.frequency)}</p></section>
  ${notPlay ? `<section class="section-card"><h2 class="sec-title" style="margin-top:0;">不参演</h2><ul>${notPlay}</ul></section>` : ''}
  ${playScripts ? `<section><h2 class="sec-title">常参演剧本</h2>${playScripts}</section>` : ''}
  <a class="btn btn--outline" href="#/roles">← 返回角色总览</a>`;
}

// ---------- P07 姥姥姥爷 21 天专项 ----------
function P07() {
  const fam = db().family;
  const gp = fam.grandparents;
  if (!gp) return '<div class="empty">暂无 21 天专项数据。</div>';

  const stages = (gp.stages || []).map(st => `
    <div class="ms-card">
      <div class="ms-card__head"><span class="ms-card__no">${esc(st.name)}</span><span class="tag tag--stage">${esc(st.range)}</span></div>
      <ul style="margin-top:4px;">${(st.tasks || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>`).join('');

  const scaleRows = (gp.scaleTable || []).map(r => `<tr><td>${esc(r.range)}</td><td><b>${esc(r.level)}</b></td><td>${esc(r.action)}</td></tr>`).join('');
  const handovers = (gp.handovers || []).map(h => `<li>${esc(h)}</li>`).join('');
  const sub = Object.entries(gp.substitute || {}).map(([k, v]) => `<li><b>${esc(k)}</b>：${esc(v)}</li>`).join('');
  const farewell = (gp.farewell4 || []).map(f => `<li>${esc(f)}</li>`).join('');

  return `
  <h1 class="page-title">姥姥姥爷 21 天专项</h1>
  <section class="section-card" style="background:var(--color-accent-soft);">
    <p><b>窗口：${esc(gp.window.from.slice(5).replace('-', '.'))} — ${esc(gp.window.to.slice(5).replace('-', '.'))}（${esc(gp.window.days)} 天）</b></p>
    <p class="muted">两位老人的真实价值是"21 天密集资源"而非长期岗位；恰逢在家模拟园所周，白天观察与刻度训练时间充裕。</p>
  </section>
  <h2 class="sec-title">三阶段</h2>
  ${stages}
  <section class="section-card">
    <h2 class="sec-title" style="margin-top:0;">姥爷"陌生大人"15 天刻度表</h2>
    <div class="data-table--scroll"><table class="data-table"><thead><tr><th>日期</th><th>档位</th><th>动作</th></tr></thead><tbody>${scaleRows}</tbody></table></div>
    <p class="tiny">每天 1 次 × 2 分钟；每档成功 3 次再升级；全天在场须变装＋换场景维持陌生感。</p>
  </section>
  <section class="section-card"><h2 class="sec-title" style="margin-top:0;">观察记录三个交接物</h2><ol>${handovers}</ol></section>
  <section class="section-card"><h2 class="sec-title" style="margin-top:0;">离京后角色替补（10.7 起）</h2><ul>${sub}</ul></section>
  <section class="section-card" style="background:var(--color-accent-soft);"><h2 class="sec-title" style="margin-top:0;">告别仪式四要素（10.6 晨）</h2><ul>${farewell}</ul></section>
  <a class="btn btn--outline" href="#/roles">← 返回角色总览</a>`;
}

export default { P05, P06, P07 };
export { TAB };
