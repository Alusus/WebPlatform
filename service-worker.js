const preCache = %s;
const dynamicCachePaths = %s;
const cacheName = %s;

async function clearOldCache() {
    const keys = await caches.keys();
    await keys.map(async (cache) => {
        if(cache !== cacheName) {
            console.log('Service Worker: Removing old cache: ' + cache);
            return await caches.delete(cache);
        }
    })
}

self.addEventListener('install', function(event) {
    event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(preCache)));
});

self.addEventListener('activate', function(event) {
    event.waitUntil(clearOldCache());
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.open(cacheName).then((cache) => {
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
                                    console.log(`Adding to cache ${cacheName}: ${requestPath}`);
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

