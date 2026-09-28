const CACHE_NAME = "al-bayan-pwa-v5";
const BASE = "/my-website/";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // نحمل الملفات واحد واحد عشان لو واحد فشل الباقي يكمل
      const files = [
        BASE,
        BASE + "index.html",
        BASE + "manifest.json"
      ];
      for (const file of files) {
        try { await cache.add(file); } catch (err) { console.warn("فشل تحميل", file); }
      }
      // الأيقونة نحاول نضيفها لوحدها
      try { await cache.add(BASE + "file_000000004b1c822f832d57514330ad17.png"); } catch(e){}
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k.startsWith("al-bayan-pwa-") && k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin || !u.pathname.startsWith(BASE)) return;

  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match(BASE + "index.html")));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});