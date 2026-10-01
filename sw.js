const CACHE_NAME = 'diih-cache-v17';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (url.includes('script.google.com') || url.includes('doxologia.ro')) return;
  
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
