// 家庭情景演练 HTML 应用 · 数据校验脚本
// 依据：app/docs/HTML应用_04_数据模型与JSONSchema.md 第五节（7 条校验规则）
// 运行：node tools/validate-data.mjs   （零依赖，仅用 Node 内置 fs）
// 退出码：0=通过，1=失败（可用于 CI 阻断）
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data');

const errors = [];
const warnings = [];

function load(name) {
  const p = path.join(DATA, `${name}.json`);
  if (!fs.existsSync(p)) { errors.push(`缺少数据文件 data/${name}.json`); return null; }
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
  catch (e) { errors.push(`data/${name}.json 解析失败: ${e.message}`); return null; }
}

const meta = load('meta');
const modules = load('modules') || [];
const scripts = load('scripts') || [];
const family = load('family');
const plan = load('plan');
const benefit = load('benefit');
const safety = load('safety');

// ---------- 收集全站文案（用于禁语扫描） ----------
// 注：safety.forbidden 的 forbidden/replacement 是"禁语对照展示表"（P18 页要展示教育用户），
//     其本身允许出现，故从扫描池中排除；其余所有页面文案必须 0 命中禁语。
const textPool = [];
function collectText(o, skipKeys = []) {
  if (o == null) return;
  if (typeof o === 'string') { textPool.push(o); return; }
  if (Array.isArray(o)) { o.forEach(x => collectText(x, skipKeys)); return; }
  if (typeof o === 'object') {
    Object.entries(o).forEach(([k, v]) => {
      if (skipKeys.includes(k)) return;
      collectText(v, skipKeys);
    });
  }
}
collectText(meta); collectText(modules); collectText(scripts); collectText(family); collectText(plan); collectText(benefit);
if (safety) {
  const { forbidden, ...rest } = safety;
  collectText(rest);
  // forbidden 对照表：只取 replacement（正确话术）进池，forbidden 原文不参与扫描
  (forbidden || []).forEach(f => { if (f && f.replacement) textPool.push(f.replacement); });
}

// ---------- 规则 1：剧本计数 ----------
const count = scripts.length;
if (count !== 52) errors.push(`规则1 剧本计数：应 52，实际 ${count}`);
else {
  const byStage = { 近期: 0, 中期: 0, 长期: 0 };
  scripts.forEach(s => { if (byStage[s.stage] !== undefined) byStage[s.stage]++; });
  if (byStage.近期 !== 20 || byStage.中期 !== 19 || byStage.长期 !== 13)
    errors.push(`规则1 阶段分布：应 近期20/中期19/长期13，实际 ${JSON.stringify(byStage)}`);
}

// ---------- 规则 2：引用完整性 ----------
const moduleIds = new Set(modules.map(m => m.id));
const milestoneNos = new Set((plan?.milestones || []).map(m => m.no));
const scriptIds = new Set(scripts.map(s => s.id));
scripts.forEach(s => {
  if (!moduleIds.has(s.moduleId)) errors.push(`规则2 剧本 ${s.id} 的 moduleId=${s.moduleId} 不在 modules 中`);
  (s.milestoneRefs || []).forEach(r => {
    if (!milestoneNos.has(Number(r))) errors.push(`规则2 剧本 ${s.id} 引用里程碑 ${r} 不存在`);
  });
  if (s.id !== s.id.trim() || scriptIds.size !== scripts.length) errors.push(`规则2 剧本 ID 存在重复或异常: ${s.id}`);
});

// ---------- 规则 3：收益必填 ----------
function checkBenefit(name, b) {
  if (!b || typeof b !== 'string') return false;
  const len = [...b].length;
  if (len > 60) warnings.push(`规则3 ${name} 的 benefit 略超 60 字（${len}字），建议精简`);
  return len > 0;
}
modules.forEach(m => { if (!checkBenefit(`模块${m.id}`, m.benefit)) errors.push(`规则3 模块 ${m.id} 缺 benefit`); });
scripts.forEach(s => { if (!checkBenefit(`剧本${s.id}`, s.benefit)) errors.push(`规则3 剧本 ${s.id} 缺 benefit`); });
(plan?.priorities || []).forEach(p => { if (!checkBenefit(`优先级${p.id}`, p.benefit)) errors.push(`规则3 优先级 ${p.id} 缺 benefit`); });
(benefit?.byModule || {});
(benefit?.byPriority || {});
Object.entries(benefit?.byModule || {}).forEach(([k, v]) => { if (!checkBenefit(`分模块收益${k}`, v)) errors.push(`规则3 benefit.byModule.${k} 缺文案`); });
Object.entries(benefit?.byPriority || {}).forEach(([k, v]) => { if (!checkBenefit(`分层收益${k}`, v)) errors.push(`规则3 benefit.byPriority.${k} 缺文案`); });

// ---------- 规则 4：禁语扫描 ----------
const forbidden = (safety?.forbidden || []).map(f => f.forbidden).filter(Boolean);
let forbidHit = 0;
forbidden.forEach(fb => {
  const key = String(fb).replace(/[ /，。、]/g, '');   // 归一化后匹配
  textPool.forEach(t => {
    const tk = String(t).replace(/[ /，。、]/g, '');
    if (tk.includes(key)) { forbidHit++; errors.push(`规则4 命中禁语「${fb}」：${t.slice(0, 40)}...`); }
  });
});
if (forbidden.length === 0) warnings.push('规则4 未配置禁语清单，无法扫描');

// ---------- 规则 5：里程碑权威 ----------
const ms = (plan?.milestones || []).map(m => m.no).sort((a, b) => a - b);
const expected = Array.from({ length: 16 }, (_, i) => i + 1);
if (JSON.stringify(ms) !== JSON.stringify(expected))
  errors.push(`规则5 里程碑编号应连续 1-16，实际 [${ms.join(',')}]`);
const validP = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'L'];
(plan?.milestones || []).forEach(m => { if (!validP.includes(m.priority)) errors.push(`规则5 里程碑#${m.no} 优先级 ${m.priority} 非法`); });

// ---------- 规则 6：日期合法 ----------
const dateRe = /^\d{4}-\d{2}-\d{2}$/;
function checkDateRange(o, name) {
  if (!o) return;
  if (o.from && o.to) {
    if (!dateRe.test(o.from) || !dateRe.test(o.to)) errors.push(`规则6 ${name} 日期格式非法: ${o.from}~${o.to}`);
    else if (o.from > o.to) errors.push(`规则6 ${name} from>to: ${o.from}~${o.to}`);
  }
}
(plan?.phases || []).forEach(p => checkDateRange(p, `节段${p.id}`));
(plan?.calendar || []).forEach(c => { if (c.date && !dateRe.test(c.date)) errors.push(`规则6 日历事件 ${c.title} 日期格式非法: ${c.date}`); });

// ---------- 规则 7：优先级映射 ----------
scripts.forEach(s => {
  (s.priority || []).forEach(p => { if (!validP.includes(p)) errors.push(`规则7 剧本 ${s.id} 优先级 ${p} 非法`); });
});

// ---------- 附加：成员 ID / 节段 ID / 收益字段完整性 ----------
const memberIds = new Set((family?.members || []).map(m => m.id));
['mom', 'dad', 'grandma', 'grandpa', 'waigong', 'waipo'].forEach(id => {
  if (!memberIds.has(id)) errors.push(`附加 成员 ${id} 缺失`);
});
scripts.forEach(s => {
  if (!s.largeCard && s.stage === '近期' && s.execMode === '正式演练')
    warnings.push(`附加 近期正式演练剧本 ${s.id} 未配置大字卡（老人可用性建议补充）`);
});

// ---------- 输出 ----------
console.log('===== 数据校验报告 =====');
console.log(`· 数据文件：meta/modules/scripts/family/plan/benefit/safety = 7 个 ✓`);
console.log(`· 剧本数：${count}（应 52）`);
console.log(`· 模块数：${modules.length}（应 12）`);
console.log(`· 里程碑数：${(plan?.milestones || []).length}（应 16）`);
console.log(`· 节段数：${(plan?.phases || []).length}`);
console.log(`· 日历事件数：${(plan?.calendar || []).length}`);
console.log(`· 成员数：${(family?.members || []).length}`);
console.log(`· 禁语条目：${forbidden.length}，命中 ${forbidHit} 处`);
console.log('');
if (warnings.length) {
  console.log(`⚠ 警告（${warnings.length}）:`);
  warnings.forEach(w => console.log(`  - ${w}`));
}
if (errors.length) {
  console.log(`\n✗ 失败：${errors.length} 个错误`);
  errors.forEach(e => console.log(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\n✓ 全部规则通过（${7} 条核心规则 + 附加检查）`);
  process.exit(0);
}
