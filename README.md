# 家庭情景演练 HTML 应用

> 把《情景演练训练方案 v3.2》从"文档"转成家人手机里看得懂的**只读速查手册**。
> 纯静态 · 零后端 · 零账号 · 零采集 · 可离线（PWA）· 可打印上墙。

## 这是什么

面向 3 岁多女宝入园适应的家庭情景演练速查应用。打开即见"今天/本周演什么"，包含：

- **今天**：当前节段 → 今日重点 → 本节段剧本（自动按"防御类当日≤1"红线排序）
- **剧本**：52 个剧本库（四维筛选），剧本详情（台词/角色/五步流程/原则/红线/收益/里程碑），大字卡（老人友好、可打印）
- **角色**：家庭 7 大人分工金字塔，姥姥姥爷 21 天专项（刻度表/交接物/替补表）
- **计划**：整体逻辑链、六层优先级、三阶段、16 里程碑（双标尺）、日历、节段、健康、家园沟通
- **收益**：为什么这样训练、分层收益、安全话术底座（孩子主权/三档分级/三层圈/话术卡/禁语对照/九大铁律）

## 目录结构

```
app/
├── index.html                  # SPA 外壳
├── manifest.webmanifest        # PWA 清单
├── sw.js                       # Service Worker（离线）
├── assets/
│   ├── css/  tokens.css · base.css · components.css
│   ├── js/   app.js · router.js · data.js · ui.js · today.js · views/{today,scripts,roles,plan,benefit}.js
│   └── icons/ icon.svg
├── data/                       # 7 个静态 JSON（唯一内容源，只读）
│   ├── meta.json  modules.json  scripts.json  family.json
│   └── plan.json  benefit.json  safety.json
├── tools/
│   ├── build_data.py           # 数据构建（Python 标准库，零依赖）
│   ├── validate-data.mjs       # 数据校验（7 条规则）
│   └── smoke.mjs               # 19 页渲染冒烟测试
├── docs/                       # 8 份设计文档（HTML应用_00~07）归档
└── .github/workflows/validate.yml  # CI：改数据自动校验
```

## 数据流转

```
情景演练训练方案_v3.2修订版.md  （唯一权威）
        │  python tools/build_data.py
        ▼
app/data/*.json  ──校验──▶  node tools/validate-data.mjs（7 条规则）
        │                          │
        ▼                          ▼
    前端渲染  ◀── 冒烟 ──  node tools/smoke.mjs（19 页）
```

## 本地运行（不安装任何东西）

```bash
cd app
python -m http.server 8123        # 打开 http://127.0.0.1:8123
```

> 必须通过 HTTP 服务访问（fetch 静态 JSON 需要），直接双击 index.html 会因 file:// 限制无法加载数据。

## 数据校验与测试

```bash
node tools/validate-data.mjs      # 52 剧本 / 引用完整 / 收益必填 / 禁语 0 命中 / 里程碑 1-16 / 日期合法 / 优先级合法
node tools/smoke.mjs              # 渲染全部 19 页 + 今日节段/防御红线断言
python tools/build_data.py        # 改内容后重建 JSON（改 tools/build_data.py 即可，勿手改 JSON）
```

## 部署（GitHub Pages）

1. 把 `app/` 作为仓库根推送到 GitHub，分支 `main`；
2. Settings → Pages → Deploy from branch → `main` / root；
3. 访问 `https://<user>.github.io/<repo>/`。

CI 会自动执行数据校验 + 冒烟测试，失败会阻断合并。

## 内容红线（务必遵守）

- **只读工具**：不做打卡、不做记录、不做惩罚、不采集任何数据
- **孩子主权**：T 字暂停手势随时生效，退出即成功
- **禁语**：全站文案不得命中 `safety.json#forbidden`（禁语对照表本身除外）
- **单一权威**：内容只改 `tools/build_data.py` → 重建 → 校验 → 测试

## 当前版本

- 计划：V3.2（2026-09-04 定稿）
- 应用：v1.0.0
