const CACHE_NAME = "al-bayan-v4";
const FILES = ["./index.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE_NAME).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.url.includes("script.google")) return;
  if (e.request.mode === "navigate") { e.respondWith(fetch(e.request).catch(() => caches.match("./index.html"))); return; }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});