// SW v18.06
const CACHE = 'lycee-v18.06';

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
  // مكتبات ثابتة بإصدار محدد (Chart.js / xlsx / exceljs / Firebase) — من الكاش أولاً،
  // عشان التطبيق يفتح ويرسم ويصدّر حتى من غير نت بعد أول تحميل
  if(url.startsWith('https://cdnjs.cloudflare.com/') || url.startsWith('https://www.gstatic.com/firebasejs/')){
    e.respondWith(
      caches.match(e.request).then(function(hit){
        return hit || fetch(e.request).then(function(res){
          if(res && (res.ok || res.type === 'opaque')){
            var copy = res.clone();
            caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
          }
          return res;
        });
      })
    );
    return;
  }
  // index.html دائماً من الشبكة
  if(url.endsWith('/') || url.includes('index.html')){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'})
        .catch(function(){ return caches.match(e.request); })
    );
  }
});
