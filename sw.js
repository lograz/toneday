// Toneday offline support: pages are fetched fresh when online, everything works offline after the first visit.
const CACHE = 'toneday-v3';
const CORE = [
  '/', '/it', '/privacy', '/it/privacy',
  '/assets/app.css?v=3', '/assets/app.js?v=3', '/assets/vendor/motion-13.4.6.js',
  '/assets/fonts/cormorant-garamond-latin-300-italic.woff2',
  '/assets/fonts/cormorant-garamond-latin-400-italic.woff2',
  '/assets/fonts/figtree-latin-400-normal.woff2',
  '/assets/fonts/figtree-latin-500-normal.woff2',
  '/assets/fonts/figtree-latin-600-normal.woff2',
  '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/_vercel/')) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match(url.pathname.startsWith('/it') ? '/it' : '/')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
