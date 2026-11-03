// Offline support: answer from the cache right away, then refresh the cache from the network.
// A new deploy shows up on the second open after it goes live.
const CACHE = 'habit-run-v2';

const SHELL = [
  './',
  'index.html',
  'styles.css',
  'manifest.json',
  'js/dom.js',
  'js/dates.js',
  'js/storage.js',
  'js/plan.js',
  'js/state.js',
  'js/today.js',
  'js/settings.js',
  'js/app.js',
  'icons/icon.svg',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;

  event.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(request, { ignoreSearch: true });
    const fresh = fetch(request)
      .then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
      .catch(() => cached);
    event.waitUntil(fresh);
    return cached || fresh;
  }));
});
