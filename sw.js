// Offline support: always try the network first so new deploys show up right away,
// and fall back to the cached copy when offline or the network is too slow.
const CACHE = 'habit-run-v3';
const NETWORK_TIMEOUT_MS = 4000;

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
  // cache: 'reload' skips the browser's HTTP cache (GitHub Pages allows 10 minutes),
  // so a new version never gets cached with old files.
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
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
  event.respondWith(networkFirst(request));
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    // 'no-cache' revalidates with the server instead of trusting the HTTP cache.
    const response = await withTimeout(fetch(request, { cache: 'no-cache' }), NETWORK_TIMEOUT_MS);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) || Response.error();
  }
}
