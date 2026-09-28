const CACHE_NAME = "al-bayan-v7";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      const toCache = ["./", "./index.html", "./manifest.json"];
      for (let url of toCache) {
        try { await cache.add(url); } catch(err){}
      }
      // حاول تخزن الأيقونة بس لو فشلت كمل عادي
      try { await cache.add("./file_000000004b1c822f832d57514330ad17.png"); } catch(err){}
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).catch(() => caches.match("./index.html"));
    })
  );
});