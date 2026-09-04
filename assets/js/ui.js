// UI 助手：大字模式 / Tab 高亮 / 文本转义 / 工具函数

// 大字模式（纯 CSS 生效，属显示偏好，不落库不上报）
export function toggleLarge() {
  const on = document.documentElement.dataset.large === 'on';
  document.documentElement.dataset.large = on ? 'off' : 'on';
  const btn = document.querySelector('.appbar__action[data-action="large"]');
  if (btn) btn.textContent = on ? '大字' : '标准';
}
export function largeOn() { return document.documentElement.dataset.large === 'on'; }

// HTML 转义（防注入；数据虽为本地静态，仍统一转义）
export function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 优先级标签颜色映射
const PRI_CLASS = { P0: 'tag--p0', P1: 'tag--p1', P2: 'tag--p2', P3: 'tag--p3', P4: 'tag--p4', P5: 'tag--p5', L: 'tag--pl' };
export function priorityTags(prios) {
  return (prios || []).map(p => `<span class="tag ${PRI_CLASS[p] || 'tag--plain'}">${esc(p)}</span>`).join('');
}

export function stageTag(stage) { return `<span class="tag tag--stage">${esc(stage)}</span>`; }
export function modeTag(mode) { return `<span class="tag tag--mode">${esc(mode)}</span>`; }

// 模块色（卡片左边条用模块色）
const MODULE_COLOR = {
  A: 'var(--color-primary)', B: 'var(--color-accent)', C: 'var(--grade-red)',
  D: 'var(--p5)', E: 'var(--p3)', F: 'var(--p2)', G: 'var(--p0)', H: 'var(--p2)',
  I: 'var(--p4)', J: 'var(--p3)', K: 'var(--pl)', L: 'var(--grade-green)',
};
export function moduleColor(id) { return MODULE_COLOR[id] || 'var(--color-primary)'; }

// 四维筛选：module / priority / stage / execMode
export function filterScripts(scripts, { moduleId, priority, stage, mode }) {
  return scripts.filter(s => {
    if (moduleId && s.moduleId !== moduleId) return false;
    if (priority && !(s.priority || []).includes(priority)) return false;
    if (stage && s.stage !== stage) return false;
    if (mode && s.execMode !== mode) return false;
    return true;
  });
}

// 节段徽标：查找今天所在节段（由 today.js 提供，这里做纯文本安全）
export function phaseBadge(name, sub) {
  return `<div class="chip on" style="cursor:default;border-color:var(--color-primary);color:var(--color-primary-dark);background:var(--color-primary-soft);">📅 ${esc(name)}${sub ? ` · ${esc(sub)}` : ''}</div>`;
}
