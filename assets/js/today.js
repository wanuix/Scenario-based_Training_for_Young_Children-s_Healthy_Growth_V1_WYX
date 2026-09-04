// ★ 日期视图算法：无后端实现"今天/本周"
// 依据：HTML应用_05_技术架构与开发框架.md 4.3
// 原则：用【本地日期】而非 UTC；只读匹配静态日历，绝不写入任何存储。

function pad(n) { return String(n).padStart(2, '0'); }
export function localISO(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 找当前节段：今天落在哪个 phase 的 [from,to]
export function currentPhase(plan, today = localISO()) {
  const hit = plan.phases.find(p => p.from <= today && today <= p.to);
  if (hit) return hit;
  // 落在节段之间空档 → 取"最近的下一个"
  const next = plan.phases.filter(p => p.from > today).sort((a, b) => a.from.localeCompare(b.from))[0];
  if (next) return next;
  // 超出全部日历 → 回落长期·巩固期通用视图
  return fallbackLongTerm(plan);
}

function fallbackLongTerm(plan) {
  return {
    id: 'long-term', name: '长期·巩固期', from: '', to: '',
    focus: ['进入长期巩固期：内化迁移、自主解冲突', '里程碑以双标尺持续观察（§12.2 #13-16）'],
    scriptIds: (plan.milestones.filter(m => m.phase === '长期').length ? [] : []),
    specials: ['数据源：V3.2 · 长期阶段从 2 月起持续'],
  };
}

// 本周（周一~周日）对应的四周滚动计划（§16）
export function currentWeek(plan, today = localISO()) {
  const list = plan.weeklyPlan || [];
  // dateRange 形如 "9.3-9.6"，转为可比较区间
  const norm = today.split('-').slice(1).map(n => parseInt(n, 10)); // [月, 日]
  for (const w of list) {
    const [a, b] = w.dateRange.split('-');
    const pa = a.split('.').map(n => parseInt(n, 10));
    const pb = (b || a).split('.').map(n => parseInt(n, 10));
    // 处理跨月（如 9.26-9.27 同月；10.19-11.1 跨月）
    const start = pa[0] * 100 + pa[1];
    const end = pb[0] * 100 + pb[1];
    const cur = norm[0] * 100 + norm[1];
    if (cur >= Math.min(start, end) && cur <= Math.max(start, end)) return w;
  }
  return null;
}

// 今日推荐排序：红线——防御类(B/C/A)当日≤1、以发展类收尾（§11.1）
function sortByRedline(scripts, ids) {
  const byId = Object.fromEntries(scripts.map(s => [s.id, s]));
  const list = ids.map(id => byId[id]).filter(Boolean);
  const defensive = list.filter(s => ['B', 'C', 'A'].includes(s.moduleId));
  const others = list.filter(s => !['B', 'C', 'A'].includes(s.moduleId));
  // 防御类最多取 1 个放前面，其余按模块推进；发展/基础类放后面（收尾）
  const takeDef = defensive.slice(0, 1);
  const restDef = defensive.slice(1);
  return { shown: [...takeDef, ...others], restDef };
}

// 首页数据模型：当前节段 + 本周清单 + 今日重点剧本
export function getTodayModel(plan, scripts) {
  const today = localISO();
  const phase = currentPhase(plan, today);
  const week = currentWeek(plan, today);
  const { shown, restDef } = sortByRedline(scripts, phase.scriptIds || []);
  return {
    today, phase, week,
    scriptIds: shown.map(s => s.id),
    focus: phase.focus || [],
    specials: phase.specials || [],
    restDef,
    scripts: shown,
  };
}

// 日期展示格式化：'2026-09-04' -> '9月4日 周五'
const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];
export function prettyDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${m}月${d}日 周${WEEK_CN[dt.getDay()]}`;
}
