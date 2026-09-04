// Hash 路由：location.hash → 页面 ID + 参数（id）
const ROUTES = {
  '/today': 'P01',
  '/scripts': 'P02',
  '/script': 'P03',
  '/large': 'P04',
  '/roles': 'P05',
  '/role': 'P06',
  '/grandparents': 'P07',
  '/plan': 'P08',
  '/priorities': 'P09',
  '/stages': 'P10',
  '/milestones': 'P11',
  '/calendar': 'P12',
  '/phases': 'P13',
  '/health': 'P14',
  '/home-school': 'P15',
  '/benefit': 'P16',
  '/benefit-layers': 'P17',
  '/safety': 'P18',
  '/about': 'P19',
};

// 解析：'#/script?id=B01' -> { path:'/script', arg:'B01' }
function parseHash() {
  const raw = location.hash.slice(1) || '/today';
  const [pathPart, queryPart] = raw.split('?');
  const argMap = {};
  if (queryPart) {
    queryPart.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) argMap[k] = decodeURIComponent(v || '');
    });
  }
  return { path: pathPart, args: argMap };
}

export function startRouter(registry, render) {
  const go = () => {
    const { path, args } = parseHash();
    const pageId = ROUTES[path] || 'P01';
    const fn = registry[pageId];
    try {
      render(fn ? fn(args) : registry['P01'](args), pageId, args);
    } catch (e) {
      console.error(e);
      render(`<div class="empty">页面渲染出错，请返回重试。</div>`, pageId, args);
    }
  };
  window.addEventListener('hashchange', go);
  go();
}

// 跳转辅助
export function go(hash) { location.hash = hash; }
