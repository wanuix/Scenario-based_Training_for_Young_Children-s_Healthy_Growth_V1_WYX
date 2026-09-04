// Service Worker：离线优先（PWA）
// 纯静态资源预缓存；数据文件只读，不做任何写操作、不采集任何内容。
const CACHE = 'scenario-training-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/js/app.js',
  './assets/js/data.js',
  './assets/js/router.js',
  './assets/js/today.js',
  './assets/js/ui.js',
  './assets/js/views/today.js',
  './assets/js/views/scripts.js',
  './assets/js/views/roles.js',
  './assets/js/views/plan.js',
  './assets/js/views/benefit.js',
  './data/meta.json',
  './data/modules.json',
  './data/scripts.json',
  './data/family.json',
  './data/plan.json',
  './data/benefit.json',
  './data/safety.json',
  './assets/icons/icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // 只缓存同源 GET（静态站点）
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      // 只缓存成功响应的关键资源
      if (res && res.status === 200 && (req.url.includes('/data/') || req.url.includes('/assets/'))) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
