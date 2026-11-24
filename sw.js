const C = 'diamantebot-voz-v1';
const BASE = ['./', 'index.html', 'manifest.json', 'tts-worker.js', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(BASE)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const cdn = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com'].includes(u.hostname);

  if (u.origin === location.origin) {
    // arquivos do app: tenta a rede (pega atualizações) e cai no cache se estiver offline
    e.respondWith(
      fetch(r).then(res => {
        if (res.ok) { const c = res.clone(); caches.open(C).then(x => x.put(r, c)); }
        return res;
      }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('./index.html') : undefined)))
    );
  } else if (cdn) {
    // bibliotecas (transformers.js, motor wasm, lamejs): cache primeiro
    e.respondWith(
      caches.match(r).then(m => m || fetch(r).then(res => {
        if (res.ok) { const c = res.clone(); caches.open(C).then(x => x.put(r, c)); }
        return res;
      }))
    );
  }
});
