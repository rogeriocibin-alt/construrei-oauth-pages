const BUILD='CR-PM-V1.2-AGENT-HUB-V1-OFFICIAL-20261005';
const CACHE='cr-project-manager-'+BUILD;
const CORE=['./','./index.html','./styles.css','./executive-dashboard.css','./app.js','./executive-dashboard.js','./agent-hub-panel.css','./agent-hub-panel.js','./agents.json','./project-data.json','./infra-data.json','./manifest.webmanifest','./pwa-icon.svg','./pwa-icon-192.svg','./pwa-icon-512.svg'];
const VERSION='./version.json';

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const requests=[...CORE,VERSION].map(url=>new Request(url,{cache:'reload'}));
    await cache.addAll(requests);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('cr-project-manager-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  if(url.pathname.endsWith('/version.json')){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(event.request,{cache:'no-store'});
        if(fresh?.ok) return fresh;
      }catch(_){}
      return (await caches.open(CACHE)).match(VERSION,{ignoreSearch:true}) ||
        new Response('{}',{headers:{'content-type':'application/json'}});
    })());
    return;
  }

  const coreHit=event.request.mode==='navigate' || CORE.some(p=>p!=='./' && url.pathname.endsWith(p.replace('./','/')));
  if(coreHit){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const key=event.request.mode==='navigate'?'./index.html':event.request;
      try{
        const fresh=await fetch(event.request,{cache:'no-store'});
        if(fresh?.ok){
          cache.put(key,fresh.clone()).catch(()=>{});
          return fresh;
        }
      }catch(_){}
      const cached=await cache.match(key,{ignoreSearch:true});
      if(cached) return cached;
      if(event.request.mode==='navigate') return cache.match('./index.html',{ignoreSearch:true});
      return new Response('Offline',{status:503,statusText:'Offline'});
    })());
    return;
  }

  event.respondWith((async()=>{
    try{return await fetch(event.request,{cache:'no-store'});}
    catch(err){
      const cached=await caches.match(event.request,{ignoreSearch:true});
      if(cached) return cached;
      throw err;
    }
  })());
});
