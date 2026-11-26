'use strict';
const CACHE='kontur-mini-static-v12';
const home=new URL('./',self.registration.scope).href;
const index=new URL('index.html',home).href;
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.add(index)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('kontur-mini-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||event.request.mode!=='navigate')return;
 const url=new URL(event.request.url);
 if(url.origin!==new URL(home).origin||![new URL(home).pathname,new URL(index).pathname].includes(url.pathname))return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok){
   const snapshot=response.clone();
   event.waitUntil(caches.open(CACHE).then(cache=>cache.put(index,snapshot)).catch(()=>{}));
  }
  return response;
 }).catch(async()=>await caches.match(index)||Response.error()));
});
