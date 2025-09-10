// Service Worker para interceptar llamadas AJAX
console.log('🔧 Service Worker cargado para interceptar AJAX');

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  // Interceptar llamadas a ManagerfrmMandatos.ashx
  if (url.pathname.includes('ManagerfrmMandatos.ashx')) {
    const methodName = url.searchParams.get('MethodName');
    if (methodName) {
      const proxyUrl = `http://localhost:3001/api/mandatos-ajax/${methodName}`;
      console.log('🔄 Service Worker redirigiendo:', event.request.url, '->', proxyUrl);

      event.respondWith(
        fetch(proxyUrl, {
          method: event.request.method,
          headers: event.request.headers,
          body: event.request.body
        }).catch(error => {
          console.error('❌ Error en Service Worker:', error);
          return fetch(event.request);
        })
      );
    }
  }
});
