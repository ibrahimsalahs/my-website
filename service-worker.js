const CACHE_NAME = "bayan-v10";
const ASSETS = ["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", e=>{
  if(e.request.url.includes("script.google.com")) return;
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      if(resp.ok && e.request.method==="GET"){
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
      }
      return resp;
    }).catch(()=> caches.match("./index.html")))
  );
});
