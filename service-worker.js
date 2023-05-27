const preCache = %s;
const dynamicCachePaths = %s;

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('WebPlatform').then(function(cache) {
      return cache.addAll(preCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open('WebPlatform').then((cache) => {
      return cache
        .match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(event.request.clone()).then((response) => {
            // Cache the request if needed.
            if (response.status >= 200 && response.status < 300) {
              for (const index in dynamicCachePaths) {
                const path = dynamicCachePaths[index];
                const requestPath = decodeURIComponent(new URL(response.url).pathname);
                if (new RegExp(path).exec(requestPath)) {
                  console.log(`Adding to cache: ${requestPath}`);
                  cache.put(event.request, response.clone());
                  break;
                }
              }
            }

            return response;
          });
        })
        .catch((error) => {
          console.error("Error in fetch handler:", error);
          throw error;
        });
    })
  );
});
