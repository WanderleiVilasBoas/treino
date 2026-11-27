/* Service worker: deixa os apps abrirem sem internet. Páginas: rede primeiro (atualizações chegam na hora), cópia salva se estiver offline. */
const V='treino-v1',PAGES=['./','./index.html','./treinador.html'],STATIC=['./manifest-aluno.webmanifest','./manifest-treinador.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-adm-192.png','./icons/apple-touch-icon.png','./icons/apple-touch-icon-adm.png','./icons/favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(PAGES.concat(STATIC)).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return;            // Supabase e outros sites: sempre direto
 if(/\/midia\//.test(u.pathname)||/treinos\.json$/.test(u.pathname))return; // vídeos e dados: direto
 if(r.mode==='navigate'||/\.html$/.test(u.pathname)||u.pathname.endsWith('/')){
  e.respondWith((async()=>{const c=await caches.open(V);try{const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),6000);const n=await fetch(r,{signal:ctl.signal,cache:'no-store'});clearTimeout(t);if(n.ok)c.put(u.pathname.endsWith('/')?'./':r,n.clone());return n}catch(err){return(await c.match(r,{ignoreSearch:true}))||(await c.match(u.pathname.endsWith('/')?'./':'./index.html'))||Response.error()}})());return}
 e.respondWith(caches.match(r).then(h=>h||fetch(r).then(n=>{if(n.ok){const cl=n.clone();caches.open(V).then(c=>c.put(r,cl))}return n})))});
