/* globals self, caches, fetch */

// eslint-disable-next-line no-restricted-globals
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
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
  event.respondWith(
    caches.match(event.request).then((result) => {
      return (
        result ||
        fetch(event.request).then((response) => {
          return caches.open("v1").then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      );
    }),
  );
});
