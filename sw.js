const CACHE_NAME = 'diih-cache-v24.27';
const ASSETS = [
  './index.html',
  './familie.js',
  './andreea.html',
  './manifest.json',
  './manifest-andreea.json',
  './icons/icon-heart-ekg.png',
  './icons/icon-monograma-hristos-brancoveneasca.svg',
  './icons/icon-sigiliu-monograma-hristos.svg',
  './icons/icon-sigiliu-gravura-monograma.svg',
  './icons/icon-orthodox-cross.svg',
  './icons/icon-heart-cross.svg',
  './icons/icon-family-home.svg',
  './icons/icon-family-vine.svg',
  './icons/icon-family-anchor.svg',
  './icons/icon-monogram-diih.svg',
  './icons/icon-psaltire-candle.svg'
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
  if (url.includes('script.google.com') || url.includes('doxologia.ro') || url.includes('.mp4')) {
    return;
  }

  // Fișierele proprii (același domeniu): mereu verificate la server (cache: 'no-cache' → 304 rapid dacă nu s-au schimbat),
  // ca un deploy nou să ajungă fără să aștepte expirarea cache-ului HTTP. Restul (CDN-uri): ca înainte.
  const sameOrigin = url.startsWith(self.location.origin);
  const req = sameOrigin && e.request.method === 'GET' ? fetch(url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(e.request);
  e.respondWith(
    req
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});
