const CACHE_NAME="al-bayan-pwa-v1";
const FILES_TO_CACHE=["./","./index.html","./manifest.json","./service-worker.js","./file_000000004b1c822f832d57514330ad17.png"];
self.addEventListener("install",e=>{
 e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES_TO_CACHE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("al-bayan-pwa-")&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
 const r=e.request;
 if(r.method!=="GET"||new URL(r.url).origin!==self.location.origin)return;
 e.respondWith(caches.match(r).then(cached=>{
  if(cached)return cached;
  return fetch(r).then(res=>{
   if(!res||res.status!==200||res.type!=="basic")return res;
   const copy=res.clone();
   caches.open(CACHE_NAME).then(c=>c.put(r,copy));
   return res;
  });
 }));
});