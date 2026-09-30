const CACHE_NAME = 'diih-cache-v13';
const ASSETS = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (url.includes('script.google.com') || url.includes('doxologia.ro')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, res.clone());
          return res;
        });
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});