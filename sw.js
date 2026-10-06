/* সার্ভিস ওয়ার্কার: অফলাইনে চালানোর জন্য। ফাইল বদলালে CACHE-এর সংখ্যা বাড়িয়ে দিন। */
const CACHE = 'bangla-typing-v2'; // বাড়ানো হয়েছে, যাতে ফোনের পুরনো/অসম্পূর্ণ ক্যাশ মুছে নতুন করে জমা হয়
const ASSETS = [
  './', 'index.html', 'style.css', 'layout.js', 'texts.js', 'core.js', 'app.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      // প্রতিটা ফাইল আলাদাভাবে ক্যাশ করা হচ্ছে, যাতে একটা ফাইল আনতে
      // সমস্যা হলেও (ধীর নেট ইত্যাদি) বাকি ফাইলগুলো ঠিকই ক্যাশ হয়ে যায় —
      // cache.addAll() ব্যবহার করলে একটা ফাইল ব্যর্থ হলে পুরো install-ই
      // ব্যর্থ হয়ে যেত।
      await Promise.all(ASSETS.map(async (url) => {
        try{
          const res = await fetch(url, {cache:'reload'});
          if(res && res.ok) await cache.put(url, res);
        }catch(err){ /* এই একটা ফাইল ব্যর্থ হলো, বাকিগুলো তবুও ক্যাশ হবে */ }
      }));
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// আগে ক্যাশ থেকে দেখায়, পাশাপাশি নতুন সংস্করণ এনে ক্যাশ হালনাগাদ করে।
// প্রতিটা শাখা শেষে একটা আসল Response ফেরত দেয় — কখনো খালি হাতে ফেরে না,
// তাই ERR_FAILED আসার কোনো সুযোগ থাকে না।
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request);

    const netPromise = fetch(e.request).then(res => {
      if (res && res.ok && new URL(e.request.url).origin === location.origin){
        cache.put(e.request, res.clone());
      }
      return res;
    }).catch(() => null);

    if (hit){
      netPromise; // পেছনে পেছনে ক্যাশ হালনাগাদ হতে থাকুক, কিন্তু অপেক্ষা করার দরকার নেই
      return hit;
    }

    const net = await netPromise;
    if (net) return net;

    // অফলাইন, আর এই নির্দিষ্ট ফাইলটা আগে কখনো ক্যাশ হয়নি —
    // তাহলে অ্যাপ-শেল (index.html) ফেরত দাও, একদম খালি হাতে না ফিরে
    const shell = (await cache.match('./index.html')) || (await cache.match('./'));
    if (shell) return shell;
    return new Response('', {status:504, statusText:'Offline'});
  })());
});
