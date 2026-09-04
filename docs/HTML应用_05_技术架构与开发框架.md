# HTML应用_05 · 技术架构与开发框架

> **产出角色**：前端架构师（技术负责人）
> **上游依据**：`HTML应用_00`（只读定位）· `HTML应用_01`（P01-P19 路由）· `HTML应用_04`（数据契约）
> **交付内容**：技术选型决策 → 整体架构 → 仓库目录 → 核心机制（数据加载/路由/日期视图算法/大字/打印/PWA）→ GitHub Pages 部署 → 代码骨架 → 性能离线 → 技术风险
> **铁律**：零后端、零数据库、零写入、零构建依赖优先，git push 即上线，可离线。

---

## 一、技术选型决策

| 维度 | 决策 | 理由 | 备选（未采用原因） |
|------|------|------|------------------|
| **形态** | 轻量 SPA（单 `index.html` + Hash 路由） | Tab 切换无刷新、类原生 App 体验；仍是纯静态 | 多页 MPA（Tab 切换整页刷新，体验割裂） |
| **技术栈** | 原生 HTML + CSS + Vanilla JS（ES Module） | **零构建、零依赖、零维护**，其他 AI 上手成本最低，GitHub Pages 直开 | Vite+Vue/React（需构建链，与"零维护"冲突；内容量不需要） |
| **数据** | 7 个静态 JSON（`HTML应用_04`） | 内容与代码分离，改内容只改 JSON | 内容硬编码进 JS（难维护） |
| **样式** | 手写 CSS + CSS 变量（设计令牌） | 换肤只改变量；无 UI 库依赖 | Tailwind/Bootstrap（增依赖、增构建） |
| **托管** | GitHub Pages（main / root） | 用户明确"基于 github + 手机能打开" | Vercel/Netlify（脱离 GitHub 原生） |
| **离线/加主屏** | PWA（manifest + Service Worker，缓存优先） | "添加到主屏"、地铁/无网也能看 | 不做（仅在线可用，体验降级） |
| **状态** | 无（纯只读，禁止 localStorage 写入） | 用户明确排除系统维护/数据采集 | — |

> **结论**：**原生三件套 + Hash SPA + 静态 JSON + GitHub Pages + 轻量 PWA**。若后续团队坚持组件化，可平移到 Vite+Vue，但须保留"构建产物纯静态、可 Pages 托管、无后端"三原则。

---

## 二、整体架构

```
┌──────────── 手机浏览器 (GitHub Pages URL) ────────────┐
│  index.html (SPA 外壳: AppBar + <main> + TabBar)        │
│     │                                                    │
│     ├── assets/js/app.js      应用启动、数据预加载         │
│     ├── assets/js/router.js   Hash 路由 → 渲染对应 view   │
│     ├── assets/js/data.js     fetch 7 个 JSON + 内存缓存  │
│     ├── assets/js/today.js    ★日期视图算法(今天/本周)     │
│     ├── assets/js/ui.js       大字模式、Tab 高亮、打印      │
│     └── assets/js/views/*.js  P01-P19 各页渲染函数         │
│            ▲ 读                                            │
│     data/*.json (只读内容)  ◄── tools/validate-data.mjs 校验│
│     sw.js + manifest (PWA 离线缓存)                        │
└──────────────────────────────────────────────────────────┘
        无任何服务端 / 数据库 / 网络写入
```

**数据流**：`app.js` 启动 → `data.js` 一次性 `fetch` 全部 JSON 到内存 → `router.js` 按 hash 调用 `views/*.js` → view 从内存数据渲染 DOM。**全程只读，无回传。**

---

## 三、仓库目录结构

```
repo-root/                      # GitHub Pages 源 = root, 分支 = main
├── index.html                  # SPA 外壳
├── manifest.webmanifest        # PWA 清单(名称/图标/主题色/启动URL)
├── sw.js                       # Service Worker(缓存优先)
├── assets/
│   ├── css/
│   │   ├── tokens.css          # 设计令牌(来自 02 文档 二)
│   │   ├── base.css            # 重置/排版/安全区
│   │   └── components.css      # 组件样式(ScriptCard/TabBar/…)
│   ├── js/
│   │   ├── app.js  router.js  data.js  today.js  ui.js
│   │   └── views/
│   │       ├── today.js        # P01
│   │       ├── scripts.js      # P02/P03/P04
│   │       ├── roles.js        # P05/P06/P07
│   │       ├── plan.js         # P08-P15
│   │       └── benefit.js      # P16/P17/P18
│   └── icons/                  # PWA 图标 192/512
├── data/                       # 7 个只读 JSON(见 04 文档)
│   ├── meta.json  modules.json  scripts.json  family.json
│   ├── plan.json  benefit.json  safety.json
├── tools/
│   └── validate-data.mjs       # 本地数据校验(不参与部署)
├── docs/                       # 本套设计文档 HTML应用_00..07(md)
├── .github/workflows/
│   └── validate.yml            # 可选: PR 时跑数据校验
└── README.md                   # 项目说明 + 本地运行 + 部署
```

> **路径铁律**：所有资源用**相对路径**（`./data/`、`./assets/`），因为 GitHub 项目页 URL 带 `/repo-name/` 前缀，绝对路径 `/assets` 会 404。

---

## 四、核心机制

### 4.1 数据加载（`data.js`）
```javascript
const FILES = ['meta','modules','scripts','family','plan','benefit','safety'];
const cache = {};
export async function loadData(){
  await Promise.all(FILES.map(async f=>{
    const res = await fetch(`./data/${f}.json`);
    if(!res.ok) throw new Error(`数据加载失败: ${f}`);
    cache[f] = await res.json();
  }));
  return cache;               // 内存缓存, 后续 view 直接读
}
export const db = () => cache;
```

### 4.2 Hash 路由（`router.js`）
```javascript
const routes = {
  '/today':'P01', '/scripts':'P02', '/script':'P03', '/large':'P04',
  '/roles':'P05', '/role':'P06', '/grandparents':'P07',
  '/plan':'P08', '/priorities':'P09', '/stages':'P10', '/milestones':'P11',
  '/calendar':'P12', '/phases':'P13', '/health':'P14', '/home-school':'P15',
  '/benefit':'P16', '/benefit-layers':'P17', '/safety':'P18', '/about':'P19'
};
export function startRouter(render){
  const go = () => {
    const [path, arg] = location.hash.slice(1).split('?id=');
    render(routes[path] || 'P01', arg);   // 未匹配回落首页
  };
  window.addEventListener('hashchange', go); go();
}
```

### 4.3 ★日期视图算法（`today.js`）— 无后端实现"今天/本周"

这是全应用唯一的"智能"，纯客户端根据当前日期匹配静态日历节段（§13/§16）。

```javascript
// 用【本地日期】而非 UTC，避免时区错位
function localISO(d = new Date()){
  const p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
// 找当前节段：今天落在哪个 phase 的 [from,to]
export function currentPhase(plan, today = localISO()){
  const hit = plan.phases.find(p => p.from <= today && today <= p.to);
  if(hit) return hit;
  // 落在节段之间的空档 → 取"最近的下一个"；若已超出全部日历 → 回落长期
  const next = plan.phases.filter(p=>p.from>today).sort((a,b)=>a.from.localeCompare(b.from))[0];
  return next || fallbackLongTerm(plan);
}
// 本周(周一~周日)对应的滚动计划(§16)
export function currentWeek(plan, today = localISO()){
  return plan.weeklyPlan.find(w => inRange(today, w.dateRange)) || null;
}
// 首页数据：当前节段 + 本周清单 + 今日重点剧本
export function getTodayModel(plan){
  const today = localISO();
  const phase = currentPhase(plan, today);
  return {
    today, phase,
    scriptIds: phase.scriptIds,          // 本节段剧本(近期)
    focus: phase.focus,                  // 今日/本节段重点
    week: currentWeek(plan, today),
    // 红线：防御类(B/C/A)当日≤1，以发展类收尾——排序时保证
    orderedScripts: sortByRedline(phase.scriptIds)
  };
}
// 防御≤1 + 发展收尾的排序(§11.1)
function sortByRedline(ids){ /* 依据 scripts.json 的 moduleId 分类排序 */ }
```

> **边界处理**：① 今天在所有节段之前 → 显示"第0周预备"；② 在所有节段之后（如 2027 年）→ 回落"长期·巩固期"通用视图；③ 空档日 → 取下一节段预告。**算法只读，绝不写入任何存储。**

### 4.4 大字模式（`ui.js`）
```javascript
export function toggleLarge(){
  const on = document.documentElement.dataset.large === 'on';
  document.documentElement.dataset.large = on ? 'off' : 'on'; // 纯CSS生效
}
```
> 注：这是**界面显示偏好**，非用户数据采集，符合只读红线（不落库、不上报）。

### 4.5 打印（大字卡上墙）
- 直接调用 `window.print()`，配合 `02 文档 七、@media print` 样式，只印台词+动作+编号。

### 4.6 PWA（离线 + 加主屏，推荐）
```javascript
// sw.js —— 缓存优先, 预缓存全部静态资源与 JSON
const ASSETS = ['./','./index.html','./manifest.webmanifest',
  './data/scripts.json','./data/plan.json', /* …全部7个… */
  './assets/css/tokens.css','./assets/js/app.js' /* … */];
self.addEventListener('install', e=>e.waitUntil(caches.open('v1').then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch', e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
```
`manifest.webmanifest`：`name/display:standalone/theme_color:#2E9E8F/start_url:./`。

---

## 五、GitHub Pages 部署方案

**主方案（最简，零配置）**：
1. 新建仓库，把 `repo-root/` 内容推到 `main`。
2. Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `/ (root)` → Save。
3. 访问 `https://<user>.github.io/<repo>/`，手机浏览器打开即用；PWA 可"添加到主屏"。

**可选增强（CI 校验）**：`.github/workflows/validate.yml` 在 PR 时跑 `node tools/validate-data.mjs`，命中禁语/计数错误则 fail（红线自动化，见 `04 文档 五`）。

**注意事项**：
- 项目页 URL 含 `/repo/` 前缀 → **全站相对路径**（已在三、路径铁律强调）。
- 若日后绑自定义域名，加 `CNAME` 文件。
- 仓库可设为 **Public**（Pages 免费版要求）；因**不含任何孩子隐私数据**（只读内容源=家庭已有的 V3.2），公开无隐私风险。

---

## 六、代码骨架（`index.html`）

```html
<!DOCTYPE html>
<html lang="zh-CN" data-large="off">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#2E9E8F">
  <link rel="manifest" href="./manifest.webmanifest">
  <link rel="stylesheet" href="./assets/css/tokens.css">
  <link rel="stylesheet" href="./assets/css/base.css">
  <link rel="stylesheet" href="./assets/css/components.css">
  <title>家庭情景演练</title>
</head>
<body>
  <header class="appbar" id="appbar"></header>
  <main id="view"></main>                 <!-- view 渲染到这里 -->
  <nav class="tabbar" id="tabbar"></nav>
  <script type="module" src="./assets/js/app.js"></script>
</body>
</html>
```
`app.js`：`loadData()` → 渲染 AppBar/TabBar → `startRouter(render)` → 注册 SW。

---

## 七、性能与离线

| 项 | 目标 |
|----|------|
| 首屏 | 数据 JSON 合计 < 200KB，一次并发 fetch，秒开 |
| 离线 | SW 预缓存后，无网可用（PWA） |
| 兼容 | iOS Safari 14+ / Android Chrome 90+；ES Module 原生支持 |
| 无网降级 | 若 fetch 失败，显示友好错误页 + 重试按钮（不白屏） |

---

## 八、技术风险与约束

| 风险 | 对策 |
|------|------|
| GitHub 项目页路径 404 | 全站相对路径；本地用 `http-server` 而非 `file://` 预览（fetch 需 http） |
| 时区导致"今天"错位 | 统一用**本地日期** `localISO()`，不用 UTC |
| 日期超出日历范围 | `fallbackLongTerm()` 回落长期视图，不报错 |
| 其他 AI 误引入后端/存储 | 架构层禁止：无 API 调用、无 localStorage 写入（大字模式仅改 DOM 属性） |
| 内容更新 | 只改 `data/*.json`，代码零改动；改完跑 `validate-data.mjs` |

**本地开发**：`npx http-server -p 8080`（或 VS Code Live Server）→ 手机同 Wi-Fi 访问 `http://<电脑IP>:8080` 真机预览。

---

**架构文档结束。下一份：开发计划与协作规范（PM 产出 WBS、排期、GitHub 工作流、验收标准）。**
