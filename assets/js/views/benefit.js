// 💡 收益与安全板块：P16 收益 / P17 分层收益 / P18 安全话术底座 / P19 关于
import { db } from '../data.js';
import { esc, priorityTags } from '../ui.js';

const TAB = 'benefit';

// ---------- P16 收益·整体 ----------
function P16() {
  const b = db().benefit;
  const path = (b.neuralPath || []).map((n, i, arr) => {
    const arrow = i < arr.length - 1 ? '<span class="np-arrow">→</span>' : '';
    return `<span class="np-node">${esc(n)}</span>${arrow}`;
  }).join('');

  return `
  <h1 class="page-title">为什么这样训练</h1>
  <section class="section-card section-card--accent">
    <h2 class="sec-title" style="margin-top:0;">本质问题</h2>
    <p>${esc(b.essence)}</p>
  </section>
  <section class="section-card section-card--primary">
    <h2 class="sec-title" style="margin-top:0;">核心公式</h2>
    <div class="formula">
      <span class="f-item">孩子演练</span><span class="f-op">＋</span>
      <span class="f-item">成功体验</span><span class="f-op">＋</span>
      <span class="f-item">庆祝强化</span><span class="f-op">＝</span>
      <span class="f-item">新的条件反射</span>
    </div>
  </section>
  <section class="section-card">
    <h2 class="sec-title" style="margin-top:0;">治本结论</h2>
    <p>${esc(b.conclusion)}</p>
  </section>
  <section class="section-card">
    <h2 class="sec-title" style="margin-top:0;">目标神经通路</h2>
    <div class="neural-path">${path}</div>
    <p class="tiny">从"被伤害→沉默"，改为"被伤害→喊停→表达→求助→走开"。</p>
  </section>
  <section class="quick-grid">
    <a class="quick-card" href="#/benefit-layers"><span class="q-icon">📊</span>分层收益</a>
    <a class="quick-card" href="#/priorities"><span class="q-icon">🎯</span>优先级</a>
    <a class="quick-card" href="#/safety"><span class="q-icon">🛡️</span>安全底座</a>
  </section>`;
}

// ---------- P17 分层收益 ----------
function P17() {
  const b = db().benefit;
  const prios = db().plan.priorities || [];
  const mods = db().modules || [];

  const byP = prios.map(p => {
    const cls = p.id === 'L' ? 'tag--pl' : `tag--p${p.id.slice(1)}`;
    return `
    <div class="ms-card">
      <div class="ms-card__head"><span class="tag ${cls}">${esc(p.id)}</span><span class="ms-card__name">${esc(p.name)}</span></div>
      <p class="muted" style="margin-bottom:8px;">${esc(p.positioning)}</p>
      <p style="background:var(--color-primary-soft);border-radius:var(--r-btn);padding:10px 12px;">${esc(b.byPriority[p.id] || '')}</p>
    </div>`;
  }).join('');

  const byM = mods.map(m => `
    <div class="ms-card" style="display:flex;gap:12px;">
      <div style="font-size:26px;">${esc(m.icon)}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:baseline;gap:8px;"><b>${esc(m.id)} ${esc(m.name)}</b><span class="tiny">${esc(m.layer)}</span></div>
        <p class="muted" style="margin:6px 0;">${esc(m.coreProblem)}</p>
        <p class="tiny" style="margin:0;">${esc(b.byModule[m.id] || '')}</p>
      </div>
    </div>`).join('');

  return `
  <div class="anchor-chips no-print">
    <a class="chip" href="#by-priority">按优先级</a>
    <a class="chip" href="#by-module">按模块</a>
  </div>
  <h1 class="page-title">分层收益</h1>
  <h2 class="sec-title" id="by-priority">按优先级</h2>
  ${byP}
  <h2 class="sec-title" id="by-module">按模块</h2>
  ${byM}`;
}

// ---------- P18 安全话术底座 ----------
function P18() {
  const s = db().safety;
  const li = (arr, icon = '•') => (arr || []).map(x => `<li>${esc(typeof x === 'string' ? x : JSON.stringify(x))}</li>`).join('');

  const grades = (s.threeGrades || []).map(g => `
    <div class="alert-card ${g.grade.includes('红') ? 'alert-card--danger' : g.grade.includes('黄') ? '' : 'alert-card--info'}">
      <div class="alert-card__title"><span class="tag ${g.grade.includes('红') ? 'tag--grade-red' : g.grade.includes('黄') ? 'tag--grade-yellow' : 'tag--grade-green'}">${esc(g.grade)}</span> <span style="margin-left:6px;">${esc(g.situation)}</span></div>
      <p style="margin-top:6px;">${esc(g.action)}</p>
    </div>`).join('');

  const circles = (s.threeCircles || []).map((c, i) => `
    <div class="ms-card">
      <div style="display:flex;align-items:baseline;gap:8px;"><b style="color:var(--color-primary-dark);">${esc(c.circle)}</b><span class="tiny">${esc(c.who || '')}</span></div>
      <p class="muted" style="margin:6px 0 0;">${esc(c.rule)}</p>
    </div>`).join('');

  const model = (s.responseModel || []).map(m => `
    <div class="step-item">
      <span class="step-item__no">${esc(m.step)}</span>
      <span class="step-item__body">
        <div class="step-item__title">${esc(m.action)}</div>
        <div class="tiny">约 ${esc(m.duration)}</div>
      </span>
    </div>`).join('');

  const phrases = (s.phrases || []).map(p => `
    <div class="phrase-card">
      <div class="phrase-card__name">${esc(p.name)}<span class="tiny" style="margin-left:8px;font-weight:400;">${esc(p.source)}</span></div>
      <div class="phrase-card__content">${esc(p.content)}</div>
    </div>`).join('');

  const forbidden = (s.forbidden || []).map(f => `
    <tr>
      <td style="text-decoration:line-through;color:var(--grade-red);"><s>${esc(f.forbidden)}</s></td>
      <td style="color:var(--grade-green);">${esc(f.replacement)}</td>
    </tr>`).join('');

  const warn = (list) => (list || []).map(w => `<li>${esc(w)}</li>`).join('');
  const flow = (s.downgradeFlow || []).map((d, i) => `
    <div class="step-item"><span class="step-item__no">${i + 1}</span><span class="step-item__body">${esc(d)}</span></div>`).join('');
  const iron = (s.ironRules || []).map((r, i) => `
    <div class="step-item"><span class="step-item__no">${i + 1}</span><span class="step-item__body"><span class="step-item__title">${esc(r)}</span></span></div>`).join('');

  return `
  <h1 class="page-title">安全话术底座</h1>
  <div class="anchor-chips no-print">
    <a class="chip" href="#s-sovereignty">孩子主权</a><a class="chip" href="#s-3q">复盘三问</a>
    <a class="chip" href="#s-3g">三档分级</a><a class="chip" href="#s-3c">三层圈</a>
    <a class="chip" href="#s-4s">接稳赋界</a><a class="chip" href="#s-phrases">话术卡</a>
    <a class="chip" href="#s-forbidden">禁语对照</a><a class="chip" href="#s-warn">预警</a><a class="chip" href="#s-iron">铁律</a>
  </div>

  <section class="section-card section-card--accent" id="s-sovereignty">
    <h2 class="sec-title" style="margin-top:0;">孩子主权（最高优先）</h2>
    <ul>${li(s.sovereignty)}</ul>
  </section>

  <section class="section-card" id="s-3q"><h2 class="sec-title" style="margin-top:0;">复盘三问（接园/晚餐）</h2><ul>${li(s.reviewQuestions)}</ul></section>

  <section id="s-3g"><h2 class="sec-title">三档分级（不背"爱告状"标签）</h2>${grades}</section>

  <section id="s-3c"><h2 class="sec-title">大人分类·三层圈</h2>${circles}</section>

  <section class="section-card" id="s-4s"><h2 class="sec-title" style="margin-top:0;">"接稳赋界"回应四步</h2>${model}</section>

  <section id="s-phrases"><h2 class="sec-title">话术卡（白名单）</h2>${phrases}</section>

  <section class="section-card" id="s-forbidden">
    <h2 class="sec-title" style="margin-top:0;">禁语对照表（不说 ✗ → 改成 ✓）</h2>
    <div class="data-table--scroll"><table class="data-table"><thead><tr><th>✗ 不说</th><th>✓ 改成这样说</th></tr></thead><tbody>${forbidden}</tbody></table></div>
  </section>

  <section class="section-card alert-card alert-card--warn" id="s-warn" style="margin-top:var(--sp-5);">
    <h2 class="sec-title" style="margin-top:0;">🚨 预警信号（任一出现即降级）</h2>
    <h3 class="sub-title">演练中</h3><ul>${warn(s.warnings && s.warnings['演练中'])}</ul>
    <h3 class="sub-title">生活里</h3><ul>${warn(s.warnings && s.warnings['生活里'])}</ul>
    <p class="tiny">${esc(s.downgradeNote || '')}</p>
  </section>

  <section class="section-card">
    <h2 class="sec-title" style="margin-top:0;">降级流程</h2>${flow}
  </section>

  <section class="section-card section-card--primary">
    <h2 class="sec-title" style="margin-top:0;">九大铁律</h2>${iron}
  </section>`;
}

// ---------- P19 关于 ----------
function P19() {
  const meta = db().meta;
  return `
  <h1 class="page-title">关于本手册</h1>
  <section class="section-card">
    <p>本应用 = V3.2 家庭速查手册的只读化。</p>
    <ul>
      <li>纯静态 · 零后端 · 零账号 · 零采集</li>
      <li>全部数据来自本机静态 JSON，不上传任何内容</li>
      <li>孩子主权优先：只读工具，不做打卡、不做记录、不做惩罚</li>
    </ul>
  </section>
  <section class="section-card">
    <p class="muted">数据源：《情景演练训练方案 v3.2 修订版》（${esc(meta.version && meta.version.updatedAt)}）</p>
    <p class="muted">孩子：${esc(meta.child.name)} · ${esc(meta.child.gender)} · ${esc(meta.child.entryAge)}</p>
    <p class="muted">幼儿园：${esc(meta.kindergarten.name)} ${esc(meta.kindergarten.class)}（信息已脱敏）</p>
    <p class="muted">当前计划版本：${esc(meta.version && meta.version.plan)} · 应用 v${esc(meta.version && meta.version.app)}</p>
  </section>`;
}

export default { P16, P17, P18, P19 };
export { TAB };
