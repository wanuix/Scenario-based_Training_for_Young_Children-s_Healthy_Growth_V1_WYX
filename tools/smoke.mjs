// 冒烟测试：seed 数据后渲染全部 19 个页面，验证无异常 + 关键内容存在
// 运行：node tools/smoke.mjs   （零依赖，仅用 Node 内置 fs）
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { __seed, db } from '../assets/js/data.js';
import { getTodayModel, currentPhase, localISO } from '../assets/js/today.js';
import todayView from '../assets/js/views/today.js';
import scriptsView from '../assets/js/views/scripts.js';
import rolesView from '../assets/js/views/roles.js';
import planView from '../assets/js/views/plan.js';
import benefitView from '../assets/js/views/benefit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data');
const data = {};
for (const f of ['meta', 'modules', 'scripts', 'family', 'plan', 'benefit', 'safety']) {
  data[f] = JSON.parse(fs.readFileSync(path.join(DATA, `${f}.json`), 'utf-8'));
}
__seed(data);

const registry = Object.assign({}, todayView, scriptsView, rolesView, planView, benefitView);
const allPages = ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'P11', 'P12', 'P13', 'P14', 'P15', 'P16', 'P17', 'P18', 'P19'];
const argsFor = {
  P03: { id: 'B01' }, P04: { id: 'B01' }, P06: { id: 'mom' },
  P02: { m: 'B', p: 'P1' },
};
const expectIn = {
  P01: ['今日重点', '第0周'],
  P02: ['全部剧本', 'B01'],
  P03: ['三步应对·基础篇', '对孩子的好处', '停！不许掐我'],
  P04: ['停！不许掐我', '打印上墙'],
  P05: ['家庭角色分工', '妈妈'],
  P06: ['核心任务', '妈妈'],
  P07: ['21 天专项', '刻度表'],
  P08: ['整体计划', '支撑逻辑链'],
  P09: ['六层优先级', 'P0'],
  P10: ['三阶段推进', '近期'],
  P11: ['里程碑', '#16'],
  P12: ['日历时间轴', '最后到园日'],
  P13: ['节段安排', '在家模拟园所周'],
  P14: ['健康与安全', '流感疫苗'],
  P15: ['家园沟通', '请假报备'],
  P16: ['为什么这样训练', '神经通路'],
  P17: ['分层收益', '按优先级'],
  P18: ['安全话术底座', '九大铁律'],
  P19: ['关于本手册', '零采集'],
};

let pass = 0, fail = 0;
for (const p of allPages) {
  try {
    const html = registry[p](argsFor[p] || {});
    if (typeof html !== 'string' || !html.trim()) { console.log(`✗ ${p}: 输出为空`); fail++; continue; }
    const missing = (expectIn[p] || []).filter(k => !html.includes(k));
    if (missing.length) { console.log(`✗ ${p}: 缺少关键内容 ${missing.join(' / ')}`); fail++; continue; }
    console.log(`✓ ${p}（${(html.length / 1000).toFixed(1)}k）`);
    pass++;
  } catch (e) { console.log(`✗ ${p}: ${e.message}`); fail++; }
}

// P01 今日逻辑专项
const today = localISO();
const phase = currentPhase(db().plan, '2026-09-04');
const m = getTodayModel(db().plan, db().scripts);
console.log(`\n· 今天=${today}  节段=${phase.id}（${phase.name}）  节段剧本=${m.scriptIds.length}个`);
console.log(`· 防御类红线：当日仅保留 ${m.scriptIds.filter(id => ['B','C','A'].includes(db().scripts.find(s=>s.id===id).moduleId)).length} 个防御剧本，顺延 ${m.restDef.length} 个`);

console.log(`\n结果：${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
