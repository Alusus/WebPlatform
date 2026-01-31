/*
 * Copyright (C) 2026 Sarmad Abdullah
 *
 * This file is part of Alusus WebPlatform library.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, see <https://www.gnu.org/licenses/>.
 */

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

