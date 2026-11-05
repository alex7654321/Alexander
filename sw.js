/* Faceball helper (Copyright (c) 2026 FunPlayer. All rights reserved.)
   Keeps a copy of the game so it can open without internet. The network is tried first,
   so a new version of the game shows up as soon as you are online. */
const CACHE='faceball-v1.8';
const FILES=['Duel.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const mine=u.origin===location.origin;
  const lib=u.hostname==='unpkg.com'; // the connection library
  if(!mine&&!lib)return; // everything else (the connection service, Google) goes straight to the network
  e.respondWith(
    fetch(r).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{})}
      return res;
    }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('Duel.html'):Response.error())))
  );
});
