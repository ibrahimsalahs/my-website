const CACHE_NAME = 'portfolio-v1';
const URLS_TO_CACHE = [
  '/my-website/',
  '/my-website/index.html',
  '/my-website/style.css',
  '/my-website/icons/icon-192.png',
  '/my-website/icons/icon-512.png'
];

// التثبيت وحفظ الملفات في الكاش
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

// تجيب من الكاش الاول
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});