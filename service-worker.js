const CACHE_NAME="al-bayan-pwa-v3";
const BASE="/my-website/";
const FILES_TO_CACHE=[BASE,BASE+"index.html",BASE+"manifest.json",BASE+"file_000000004b1c822f832d57514330ad17.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES_TO_CACHE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("al-bayan-pwa-")&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
if(e.request.method!=="GET")return;
const u=new URL(e.request.url);
if(u.origin!==self.location.origin||!u.pathname.startsWith(BASE))return;
e.respondWith(caches.match(e.request).then(cached=>{
if(cached)return cached;
return fetch(e.request).then(res=>{
if(res&&res.status===200&&res.type==="basic"){
const copy=res.clone();
caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));
}
return res;
}).catch(()=>e.request.mode==="navigate"?caches.match(BASE+"index.html"):Response.error());
}));
});