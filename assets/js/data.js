// 数据加载：一次性 fetch 全部静态 JSON 到内存（只读，无写入）
const FILES = ['meta', 'modules', 'scripts', 'family', 'plan', 'benefit', 'safety'];
const cache = {};

export async function loadData() {
  await Promise.all(FILES.map(async (f) => {
    const res = await fetch(`./data/${f}.json`);
    if (!res.ok) throw new Error(`数据加载失败: ${f}`);
    cache[f] = await res.json();
  }));
  return cache;
}

export const db = () => cache;

// 仅用于 Node 冒烟测试 / 离线调试：手动注入数据（浏览器正常路径走 loadData）
export function __seed(obj) { Object.assign(cache, obj); return cache; }
