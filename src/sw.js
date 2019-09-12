/* globals self, caches, fetch */

// eslint-disable-next-line no-restricted-globals
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v2").then((cache) => {
      return cache.addAll([
        "/img/logo.blue.transparent.192.png",
        "/img/logo.blue.white.192.png",
        "/img/logo.wh.svg",
        "/img/Musikkforeningen-Nidarholm-dir-Trond-Madsen-1.jpg",
        "/javascript.js",
      ]);
    }),
  );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("fetch", (event) => {
  console.debug("E", event);
  event.respondWith(
    caches.match(event.request).then((result) => {
      return (
        result ||
        fetch(event.request).then((response) => {
          if (event.request.method !== "GET") {
            return response;
          }
          return caches.open("v1").then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    }),
  );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("activate", (event) => {
  const cacheKeeplist = ["v2"];

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
