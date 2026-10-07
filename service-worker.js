const CACHE_NAME='pwa-cache-v2';
const ASSETS_TO_CACHE=['/my-website/','/my-website/index.html','/my-website/css/style.css','/my-website/js/main.js','/my-website/manifest.json'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS_TO_CACHE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{event.respondWith(caches.match(event.request).then(response=>response||fetch(event.request)))});