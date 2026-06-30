// SW v17.87
const CACHE = 'lycee-v17.96';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(function(keys){
        return Promise.all(
          keys.filter(function(k){ return k !== CACHE; })
              .map(function(k){ return caches.delete(k); })
        );
      })
      .then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = e.request.url;
  if(url.includes('anthropic.com')) return;
  // index.html دائماً من الشبكة
  if(url.endsWith('/') || url.includes('index.html')){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'})
        .catch(function(){ return caches.match(e.request); })
    );
  }
});
