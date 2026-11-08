// Bump VERSION whenever you change any file so phones pick up the new copy.
const VERSION = 'pandq-test-3';
const CORE = ['./', './index.html', './prove.html', './diagrams.html', './learn.html', './diagrams.css', './diagrams.js', './workbench.css', './fitch.css', './learn.css', './core.js', './workbench.js', './fitch-core.js', './fitch.js', './learn.js', './learn-content.js', './theme.css', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(res => {
      const url = new URL(e.request.url);
      if (url.origin === location.origin || url.host.endsWith('fonts.googleapis.com') || url.host.endsWith('fonts.gstatic.com')) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
