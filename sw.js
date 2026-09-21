/* সার্ভিস ওয়ার্কার: অফলাইনে চালানোর জন্য। ফাইল বদলালে CACHE-এর সংখ্যা বাড়িয়ে দিন। */
const CACHE = 'bangla-typing-v1';
const ASSETS = [
  './', 'index.html', 'style.css', 'layout.js', 'texts.js', 'core.js', 'app.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// আগে ক্যাশ থেকে দেখায়, পাশাপাশি নতুন সংস্করণ এনে ক্যাশ হালনাগাদ করে
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(hit => {
        const net = fetch(e.request).then(res => {
          if (res && res.ok && new URL(e.request.url).origin === location.origin) cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit || cache.match('./'));
        return hit || net;
      })
    )
  );
});
