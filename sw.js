/* Trivia Bíblica · service worker. Cambia VER en cada versión nueva. */
const VER="trivia-biblica-v3.8.0";
const CORE=["./","./index.html","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-192.png","./icons/maskable-512.png","./icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==="navigate"){
    /* páginas: primero la red (para tener siempre la última versión); si tarda o no hay internet, la copia guardada */
    e.respondWith(new Promise(res=>{
      let done=false;const fallback=()=>caches.match("./index.html").then(c=>{if(!done&&c){done=true;res(c)}});
      const t=setTimeout(fallback,4000);
      fetch(r).then(n=>{clearTimeout(t);if(n.ok){const cp=n.clone();caches.open(VER).then(c=>c.put("./index.html",cp))}if(!done){done=true;res(n)}}).catch(()=>{clearTimeout(t);fallback().then(()=>{if(!done){done=true;res(Response.error())}})})}));
    return}
  /* resto de archivos: copia guardada al instante y se actualiza en segundo plano */
  e.respondWith(caches.match(r).then(c=>{const net=fetch(r).then(n=>{if(n.ok){const cp=n.clone();caches.open(VER).then(x=>x.put(r,cp))}return n}).catch(()=>c);return c||net}))});
