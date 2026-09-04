# HTML应用_04 · 数据模型与 JSON Schema

> **产出角色**：数据内容工程师
> **上游依据**：V3.2 全案 · `HTML应用_03_内容规格与收益红线.md`（成品文案）· `HTML应用_01`（P01-P19）
> **交付内容**：数据文件清单 → 实体关系图 → 核心 Schema（TS 接口）→ 样例 JSON → 校验规则 → ID 命名约定
> **原则**：内容与代码分离——所有 V3.2 内容抽成静态 JSON，前端只读加载渲染，**零后端、零写入**。

---

## 一、数据文件清单（`/data` 目录，按 5 板块对齐）

| 文件 | 对应板块 | 内容 | 记录数 | 来源 |
|------|---------|------|:-----:|------|
| `meta.json` | 全局 | 孩子/家庭/幼儿园/版本/数据源声明 | 1 | §1.1 |
| `modules.json` | 剧本 | 12 模块（A-L） | 12 | §6.1 |
| `scripts.json` | 剧本 | 52 剧本全字段 | 52 | §6.2/§7 |
| `family.json` | 角色 | 成员分工 + 姥姥姥爷21天专项 + 刻度表 | 6+ | §8 |
| `plan.json` | 计划 | 优先级/三阶段/里程碑/日历/节段/四周滚动/健康/家园 | — | §3/§4/§9/§10/§12/§13/§16 |
| `benefit.json` | 收益 | 收益总纲 + 分层收益 + 分模块收益 | — | §2.2/§3.3/§4 |
| `safety.json` | 收益 | 话术白名单 + 禁语黑名单 + 预警/降级/主权 | — | §5/§7.6/§14 |

> 7 个静态 JSON。前端 `fetch('./data/xxx.json')` 或构建时内联，均可离线。

---

## 二、实体关系图（ER）

```
meta(1) ── 全局配置
modules(12) ──< scripts(52)          剧本 belongsTo 模块
priorities(7) ──< scripts            剧本 tagged 优先级(P0-P5/L)
scripts >── milestones(16)           剧本 关联 里程碑(milestoneRefs)
phases(节段) ──< scripts             节段 排入 剧本(通过 stage + weeklyPlan)
calendar(events) ── 时间轴            首页"今天"按 date 匹配 phase
roles/members(6+) ──< scripts        成员 参演 剧本(participants)
benefit ── 总纲/分层/分模块           收益 挂到 priority 与 module 与 script
safety ── phrases/forbidden/warnings  独立参考内容
```

---

## 三、核心 Schema（TypeScript 接口 = 数据契约）

```typescript
// ---------- meta.json ----------
interface Meta {
  child: { name: string; birth: string; /* 已脱敏，公开仓库不填真实出生日期 */ gender: "女"; entryAge: string };
  kindergarten: { name: string; district: string; class: string; classSize: number };
  family: { permanent: string[]; /* 爸妈爷奶 */ temporary: { members: string[]; from: string; to: string } };
  version: { plan: "v3.2"; app: string; dataSource: string; updatedAt: string };
  today: { anchorDate: string }; // 可选：默认用 new Date()，此字段仅供调试覆盖
}

// ---------- modules.json ----------
type ModuleId = "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L";
type Layer = "治标层"|"防御层"|"发展层"|"基础层";
interface Module {
  id: ModuleId;
  name: string;            // "身体盾牌"
  layer: Layer;
  icon: string;            // "🛡️"
  scriptCount: number;     // 3
  coreProblem: string;     // "矮小、气场弱、被忽视"
  benefit: string;         // 收益文案(来自 03 文档 三、分模块)
}

// ---------- scripts.json ----------
type Priority = "P0"|"P1"|"P2"|"P3"|"P4"|"P5"|"L";
type Stage = "近期"|"中期"|"长期";
type ExecMode = "正式演练"|"日常渗透"|"户外实战"|"每日仪式";
interface DialogLine { role: string; content: string }
interface Script {
  id: string;              // "B01"
  name: string;            // "三步应对·基础篇（成功体验）"
  moduleId: ModuleId;      // "B"
  priority: Priority[];    // ["P1"]（可多标，首项为"首要优先级"）
  stage: Stage;            // "近期"
  execMode: ExecMode;      // "正式演练"
  participants: string[];  // ["妈妈","爸爸","孩子"]
  roles: Record<string,string>; // { "妈妈":"导演/扮老师", "爸爸":"对手戏(夸张搞笑)" }
  lines: DialogLine[];     // 台词
  steps: string[];         // 5步流程
  principles: string[];    // 关键原则
  redlines: string[];      // 操作红线(§6.4)
  benefit: string;         // 对孩子的好处(必填, ≤40字, 正向)
  milestoneRefs: string[]; // ["1"] 关联里程碑#
  props?: string;          // 道具
  largeCard?: { lines: string[]; action?: string }; // 大字卡精简台词(≤2句)
  source: string;          // "§6.2/§7.3"
}

// ---------- plan.json ----------
interface Priority_ {
  id: Priority; name: string; positioning: string; problem: string;
  mainModules: ModuleId[]; auxModules: ModuleId[]; benefit: string; // 分层收益
}
interface Stage_ { id: Stage; time: string; coreTask: string; reason: string }
interface Milestone {
  no: number;              // 1..16
  priority: Priority; name: string;
  drill: string;           // 演练达标(家中)
  real: string;            // 实战泛化(园内/户外)
  phase: Stage;            // 近期/中期/长期
  note?: string;           // 如 #6 "10.8返园周首测+10月底复测"
}
interface CalendarEvent { date: string; title: string; type: "关键日"|"节段"|"接种"|"返园"; desc?: string }
interface Phase {          // 节段(驱动首页"今天")
  id: string;              // "week0"|"home-week"|"golden-week"|"restart-week"
  name: string;            // "第0周·安全底座"
  from: string; to: string;// "2026-09-03","2026-09-06"
  focus: string[];         // 训练重点
  scriptIds: string[];     // 本节段剧本
  specials?: string[];     // 特殊事项
}
interface WeeklyPlan { week: string; dateRange: string; focus: string; specials: string[] } // §16
interface HealthItem { id: string; name: string; content: string[]; action?: string[] }     // §10 六项
interface HomeSchool { understand: string[]; sync: string[]; redlines: string[]; leaveScript: string } // §9

interface Plan {
  priorities: Priority_[]; stages: Stage_[]; milestones: Milestone[];
  calendar: CalendarEvent[]; phases: Phase[]; weeklyPlan: WeeklyPlan[];
  supportChain: string;    // §3.4 支撑逻辑链(文本/图)
  health: HealthItem[]; homeSchool: HomeSchool;
}

// ---------- family.json ----------
interface Member {
  id: string;              // "mom"|"dad"|"grandpa"|"grandma"|"waigong"|"waipo"
  name: string; tier: string; // "总执行"|"主执行"|"日常渗透"|"特设(21天)"
  role: string; coreTasks: string[]; frequency: string;
  scriptIds?: string[];    // 常参演剧本
  notPlay?: string[];      // 不参演(如安全依恋者不演坏人)
}
interface GrandparentsPlan {   // §8.4
  window: { from: string; to: string; days: number };
  stages: { name: string; range: string; tasks: string[] }[]; // 淡入/突击/交接
  scaleTable: { range: string; level: string; action: string }[]; // 15天刻度表
  handovers: string[];     // 三个交接物
  substitute: Record<string,string>; // 离京后替补表
}
interface Family { members: Member[]; grandparents: GrandparentsPlan; pyramidTiers: string[]; principles: string[] }

// ---------- benefit.json ----------
interface Benefit {
  essence: string;         // 本质问题(新神经通路 §2.2)
  formula: string;         // 核心公式 §4.3
  conclusion: string;      // 治本结论 §4.2
  neuralPath: string[];    // ["被伤害","喊停","表达","求助","走开"]
  byPriority: Record<Priority,string>; // 分层收益(来自 03 文档 二)
  byModule: Record<ModuleId,string>;   // 分模块收益(来自 03 文档 三)
}

// ---------- safety.json ----------
interface Phrase { id: string; name: string; content: string; source: string }
interface Forbidden { forbidden: string; replacement: string }
interface Safety {
  sovereignty: string[];        // 孩子主权四条 §5.1
  reviewQuestions: string[];    // 复盘三问 §5.2
  threeGrades: { grade:"红档"|"黄档"|"绿档"; situation:string; action:string }[]; // §7.6
  threeCircles: { circle:string; who:string; rule:string }[]; // §5.3
  responseModel: { step:"接"|"稳"|"赋"|"界"; action:string; duration:string }[]; // §14.3
  phrases: Phrase[];            // 话术卡集合
  forbidden: Forbidden[];       // 禁语黑名单 §5.4
  warnings: { scene:"演练中"|"生活里"; signals:string[] }; // §14.1
  downgradeFlow: string[];      // §14.2
  ironRules: string[];          // 九大铁律 §12.1
}
```

---

## 四、样例 JSON（开发可直接用作 mock）

### `modules.json`（片段）
```json
[
  { "id":"A","name":"身体盾牌","layer":"防御层","icon":"🛡️","scriptCount":3,
    "coreProblem":"矮小、气场弱、被忽视","benefit":"建立\"我的身体属于我\"的边界感，遇冲突能推开/后退/躲开，抬头挺胸有气场。" },
  { "id":"B","name":"三步应对","layer":"治标层","icon":"🚦","scriptCount":4,
    "coreProblem":"被掐/被推/玩具被抢时呆住","benefit":"把\"停→说→走\"练成脱口而出的本能，被掐被推时不再僵住沉默。" }
]
```

### `scripts.json`（B01 完整记录，与 03 文档 YAML 样例一致）
```json
{
  "id":"B01","name":"三步应对·基础篇（成功体验）","moduleId":"B",
  "priority":["P1"],"stage":"近期","execMode":"正式演练",
  "participants":["妈妈","爸爸","孩子"],
  "roles":{"妈妈":"导演，示范老师口吻（延迟1-2分钟回应，孩子需说两遍）","爸爸":"演淘气者，夸张搞笑表情，不用痛苦表情","孩子":"主角，练喊停"},
  "lines":[{"role":"孩子","content":"停！不许掐我！（1米外能听清）"},{"role":"爸爸","content":"哎呀，我松开啦，我听到你喊停了！"}],
  "steps":["状态检查(给选择权)","看情景卡","正式演练(先单练喊停,成功5次)","角色互换(可选)","庆祝+复盘一句话"],
  "principles":["先单练喊停，成功5次后再连停→说→走","音量标尺：1米外能听清(门框距离)","成功结局多样化：对方不听但走开找老师也算成功"],
  "redlines":["爸爸用夸张搞笑而非痛苦表情","禁说\"你就是掐人的那个\"","允许孩子只当观众"],
  "benefit":"练这个，孩子能把\"停！\"变成脱口而出的本能，被掐时不再沉默承受。",
  "milestoneRefs":["1"],"props":"无（或玩偶）",
  "largeCard":{"lines":["停！不许掐我！"],"action":"站直、大声、手向前推"},
  "source":"§6.2/§7.3/§6.4-1"
}
```

### `plan.json`（里程碑 + 节段 片段）
```json
{
  "milestones":[
    {"no":1,"priority":"P1","name":"三步应对","drill":"家中演练100%喊停(音量1米外可闻)","real":"园内偶发1次即算达标；常规使用放宽至12月底","phase":"近期"},
    {"no":6,"priority":"P0","name":"道别适应","drill":"道别三步曲≤2分钟完成","real":"早晨道别不哭闹","phase":"近期","note":"10.8返园周首测+10月底复测"}
  ],
  "phases":[
    {"id":"week0","name":"第0周·安全底座","from":"2026-09-03","to":"2026-09-06",
     "focus":["安全底座8项落地","话术卡上墙","生长评估启动","G03道别仪式开始每日执行"],
     "scriptIds":["G03"],"specials":["先于一切训练"]},
    {"id":"home-week","name":"在家模拟园所周","from":"2026-09-21","to":"2026-09-30",
     "focus":["B01成功×5+急版求助","E01/E02穿插→E04真人场","B02+E03+L02插入","9.29-9.30降强度"],
     "scriptIds":["B01","B02","C01","E01","E02","E03","E04","L02"],
     "specials":["作息复刻园所","下午放学后约同班同学每周≥2场","10.3起告别倒数"]}
  ]
}
```

### `safety.json`（三档 + 禁语 片段）
```json
{
  "threeGrades":[
    {"grade":"红档","situation":"掐/打/咬/推倒(会疼的)","action":"立刻喊停+找老师，永远不用自己扛"},
    {"grade":"黄档","situation":"被拿、被插队(东西的事)","action":"先自己说\"还给我/我还没玩完\"，不听再找老师"},
    {"grade":"绿档","situation":"轻碰、口角","action":"自己消化或忽略"}
  ],
  "forbidden":[
    {"forbidden":"今天有人欺负你吗","replacement":"今天最开心的事是什么？有没有哪件事有点难？"},
    {"forbidden":"打回去！","replacement":"大声说\"停\"，然后找老师"}
  ]
}
```

---

## 五、数据校验规则（构建/提交时自动跑）

| # | 校验 | 规则 | 失败处理 |
|---|------|------|---------|
| 1 | 剧本计数 | `scripts.length === 52`；近期20+中期19+长期13 | 报错，阻断构建 |
| 2 | 引用完整性 | 每个 `script.moduleId` ∈ modules；`milestoneRefs` ∈ milestones.no | 报错 |
| 3 | 收益必填 | 每个 module/script/priority 的 `benefit` 非空且 ≤ 60 字 | 报错 |
| 4 | 禁语扫描 | 全站文案字段不命中 `safety.forbidden[].forbidden` | 报错 |
| 5 | 里程碑权威 | milestones 16 条与 §12.2 一致，no 连续 1-16 | 报错 |
| 6 | 日期合法 | phases/calendar 日期格式 `YYYY-MM-DD` 且 from ≤ to | 报错 |
| 7 | 优先级色映射 | 每个 priority 值 ∈ {P0..P5,L} | 报错 |

> 建议提供 `tools/validate-data.mjs`（Node 脚本，纯本地跑，不涉后端）执行以上校验；数据工程师交付时附带。

---

## 六、ID 与命名约定

- **剧本 ID**：模块字母 + 两位序号，如 `B01`、`L04`（与 V3.2 完全一致，不改写）。
- **模块 ID**：单大写字母 `A`-`L`。
- **优先级**：`P0`-`P5` + `L`。
- **阶段**：`近期`/`中期`/`长期`（中文枚举，直接展示）。
- **成员 ID**：拼音 `mom/dad/grandpa/grandma/waigong/waipo`。
- **节段 ID**：英文短横 `week0/week1-2/vaccine/home-week/golden-week/farewell/restart-week/recovery`。
- **里程碑**：数字 `no` 1-16（对应 §12.2 编号）。
- **文件编码**：UTF-8；JSON 键用 camelCase，值中的中文原样保留。

---

**数据文档结束。下一份：技术架构与开发框架（前端架构师据此定义静态站结构、日期视图算法与 GitHub Pages 部署）。**
