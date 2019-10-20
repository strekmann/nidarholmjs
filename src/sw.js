/* globals self, caches, fetch */

const activeCacheName = "v7";

// eslint-disable-next-line no-restricted-globals
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(activeCacheName).then((cache) => {
      return cache.addAll([
        "/img/logo.blue.transparent.192.png",
        "/img/logo.blue.white.192.png",
        "/img/logo.wh.svg",
        "/img/musikkforeningen-nidarholm.jpg",
      ]);
    }),
  );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("fetch", (event) => {
  event.respondWith(
    new Promise((fulfill, reject) => {
      const timeoutId = setTimeout(reject, 400);
      fetch(event.request).then((response) => {
        clearTimeout(timeoutId);
        fulfill(response);
      }, reject);
    }).catch(() => {
      return caches.open(activeCacheName).then((cache) => {
        return cache.match(event.request).then((result) => {
          // cache.put(event.request, response.clone());
          return result || Promise.reject(new Error("no-match"));
        });
      });
    }),
  );
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
