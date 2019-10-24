/* globals self, caches, fetch */

const activeCacheName = "v8";

/**
 * Cache static elements
 */
function precache() {
  return caches.open(activeCacheName).then((cache) => {
    return cache.addAll([
      "/img/logo.blue.transparent.192.png",
      "/img/logo.blue.white.192.png",
      "/img/logo.wh.svg",
      "/img/musikkforeningen-nidarholm.jpg",
    ]);
  });
}

/**
 * Return data from cache
 */
function fromCache(request) {
  return caches.open(activeCacheName).then((cache) => {
    return cache.match(request).then((response) => {
      // cache.put(event.request, response.clone());
      return response || Promise.reject(new Error("no-match"));
    });
  });
}

function update(request) {
  return caches.open(activeCacheName).then((cache) => {
    return fetch(request).then((response) => {
      return cache.put(request, response);
    });
  });
}

// eslint-disable-next-line no-restricted-globals
self.addEventListener("install", (event) => {
  event.waitUntil(precache());
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("fetch", (event) => {
  event.respondWith(fromCache(event.request));
  event.waitUntil(update(event.request));
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("activate", (event) => {
  const cacheKeeplist = [activeCacheName];

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (cacheKeeplist.indexOf(key) === -1) {
            return caches.delete(key);
          }
          return caches[key];
        }),
      );
    }),
  );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("activate", (event) => {
  // eslint-disable-next-line no-restricted-globals
  event.waitUntil(self.clients.claim());
});
