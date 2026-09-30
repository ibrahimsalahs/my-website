const CACHE_NAME = "al-bayan-final-v2";
const FILES = ["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()).catch(err=>{console.log(err); self.skipWaiting();})
  );
});
self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});
self.addEventListener("fetch", e=>{
  const url = e.request.url;
  if(url.includes("script.google.com") || url.includes("googleapis.com") || url.includes("chrome-extension")) return;
  if(e.request.mode==="navigate"){
    e.respondWith(
      fetch(e.request).then(r=>{ 
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
        return r;
      }).catch(()=>caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=> cached || fetch(e.request).then(r=>{
      if(r.ok && e.request.method==="GET" && url.startsWith(self.location.origin)){
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
      }
      return r;
    }).catch(()=>cached))
  );
});
