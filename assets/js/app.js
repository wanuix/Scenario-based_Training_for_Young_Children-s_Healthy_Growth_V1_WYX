// 应用启动：加载数据 → 构建 AppBar/TabBar → 启动 Hash 路由
import { loadData, db } from './data.js';
import { esc, toggleLarge } from './ui.js';
import { startRouter } from './router.js';
import todayView from './views/today.js';
import scriptsView from './views/scripts.js';
import rolesView from './views/roles.js';
import planView from './views/plan.js';
import benefitView from './views/benefit.js';

// ---- 底部 TabBar（5 项） ----
const TABS = [
  { id: 'today', label: '今天', icon: '🏠', hash: '#/today' },
  { id: 'scripts', label: '剧本', icon: '🎭', hash: '#/scripts' },
  { id: 'roles', label: '角色', icon: '👨‍👩‍👧', hash: '#/roles' },
  { id: 'plan', label: '计划', icon: '🗺️', hash: '#/plan' },
  { id: 'benefit', label: '收益', icon: '💡', hash: '#/benefit' },
];

// ---- 页面元数据：标题 / 所属 Tab / 返回目标 / 是否隐藏大字开关 ----
const nameOfScript = (id) => {
  const s = db().scripts.find(x => x.id === id);
  return s ? s.name : (id || '');
};
const PAGES = {
  P01: { title: () => '家庭情景演练', tab: 'today' },
  P02: { title: () => '剧本库', tab: 'scripts' },
  P03: { title: (a) => nameOfScript(a && a.id), tab: 'scripts', back: '#/scripts' },
  P04: { title: (a) => `大字卡 · ${a && a.id}`, tab: '', back: (a) => `#/script?id=${esc(a && a.id)}`, noLarge: true },
  P05: { title: () => '家庭角色分工', tab: 'roles' },
  P06: { title: (a) => { const m = db().family.members.find(x => x.id === (a && a.id)); return m ? m.name : '成员'; }, tab: 'roles', back: '#/roles' },
  P07: { title: () => '姥姥姥爷 21 天专项', tab: 'roles', back: '#/roles' },
  P08: { title: () => '整体计划', tab: 'plan' },
  P09: { title: () => '六层优先级', tab: 'plan', back: '#/plan' },
  P10: { title: () => '三阶段推进', tab: 'plan', back: '#/plan' },
  P11: { title: () => '里程碑', tab: 'plan', back: '#/plan' },
  P12: { title: () => '日历时间轴', tab: 'plan', back: '#/plan' },
  P13: { title: () => '节段安排', tab: 'plan', back: '#/plan' },
  P14: { title: () => '健康与安全', tab: 'plan', back: '#/plan' },
  P15: { title: () => '家园沟通', tab: 'plan', back: '#/plan' },
  P16: { title: () => '为什么这样训练', tab: 'benefit' },
  P17: { title: () => '分层收益', tab: 'benefit', back: '#/benefit' },
  P18: { title: () => '安全话术底座', tab: 'benefit', back: '#/benefit' },
  P19: { title: () => '关于本手册', tab: 'benefit', back: '#/benefit' },
};

const registry = Object.assign({}, todayView, scriptsView, rolesView, planView, benefitView);
const appbar = document.getElementById('appbar');
const tabbar = document.getElementById('tabbar');
const view = document.getElementById('view');

function renderAppbar(pageId, args) {
  const meta = PAGES[pageId];
  const back = meta.back ? `<button class="appbar__back" data-action="back" aria-label="返回">‹</button>`
    : `<button class="appbar__back" data-action="home" aria-label="首页">⌂</button>`;
  const large = meta.noLarge ? '' : `<button class="appbar__action" data-action="large">${document.documentElement.dataset.large === 'on' ? '标准' : '大字'}</button>`;
  appbar.innerHTML = `${back}<div class="appbar__title">${esc(meta.title(args) || '家庭情景演练')}</div>${large}`;
}

function renderTabbar(pageId) {
  const active = PAGES[pageId] ? PAGES[pageId].tab : '';
  tabbar.innerHTML = TABS.map(t => `
    <button class="tabbar__item ${t.id === active ? 'on' : ''}" data-tab="${t.id}">
      <span class="tab-icon">${t.icon}</span><span>${t.label}</span>
    </button>`).join('');
}

function render(html, pageId, args) {
  view.innerHTML = html;
  renderAppbar(pageId, args);
  renderTabbar(pageId);
  window.scrollTo(0, 0);
}

// ---- 事件委托：AppBar 返回/首页/大字 + TabBar 切换 ----
appbar.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const pageId = currentPage();
  if (btn.dataset.action === 'back') {
    const target = PAGES[pageId].back;
    location.hash = typeof target === 'function' ? target(lastArgs()) : target;
  } else if (btn.dataset.action === 'home') {
    location.hash = '#/today';
  } else if (btn.dataset.action === 'large') {
    toggleLarge();
  }
});
tabbar.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tab]');
  if (!btn) return;
  const t = TABS.find(x => x.id === btn.dataset.tab);
  if (t) location.hash = t.hash;
});

let _last = {};
function currentPage() {
  const path = (location.hash.slice(1) || '/today').split('?')[0];
  const map = { '/today': 'P01', '/scripts': 'P02', '/script': 'P03', '/large': 'P04', '/roles': 'P05',
    '/role': 'P06', '/grandparents': 'P07', '/plan': 'P08', '/priorities': 'P09', '/stages': 'P10',
    '/milestones': 'P11', '/calendar': 'P12', '/phases': 'P13', '/health': 'P14', '/home-school': 'P15',
    '/benefit': 'P16', '/benefit-layers': 'P17', '/safety': 'P18', '/about': 'P19' };
  return map[path] || 'P01';
}
function lastArgs() {
  const raw = (location.hash.slice(1) || '').split('?')[1] || '';
  const out = {};
  raw.split('&').forEach(pair => { const [k, v] = pair.split('='); if (k) out[k] = decodeURIComponent(v || ''); });
  return out;
}
// 记录最近一次 args（供 AppBar 返回大字卡用）
const origHash = window.addEventListener;
window.addEventListener('hashchange', () => { _last = lastArgs(); });

// ---- 启动 ----
(async function boot() {
  try {
    await loadData();
    // 注入元信息到文档
    const meta = db().meta;
    document.title = meta ? `${meta.child.name || ''} · 家庭情景演练` : '家庭情景演练';
    startRouter(registry, render);
  } catch (e) {
    console.error(e);
    view.innerHTML = `<div class="error-box"><h2>加载失败</h2><p class="muted">${esc(e.message)}</p>
      <button class="btn btn--primary" onclick="location.reload()">重试</button></div>`;
  }
})();
