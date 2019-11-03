/* globals self, caches, fetch */

const activeCacheName = "v11";

/**
 * Cache static elements
 */
function precache() {
  return caches.open(activeCacheName).then((cache) => {
    return cache.addAll([
      "/manifest.json",
      "/robots.txt",
      "/favicon.ico",
      "/img/logo.blue.transparent.192.png",
      "/img/logo.blue.white.192.png",
      "/img/logo.wh.svg",
      "/img/musikkforeningen-nidarholm.jpg",
      "/fonts/Roboto-Italic.ttf",
      "/fonts/Montserrat-Regular.ttf",
      "/fonts/Roboto-Regular.ttf",
      "/fonts/Montserrat-Bold.ttf",
      "/fonts/Montserrat-Italic.ttf",
      "/fonts/Roboto-Bold.ttf",
    ]);
  });
}

/**
 * Fetch from network and update cache
 */
function update(request) {
  return caches.open(activeCacheName).then((cache) => {
    return fetch(request).then((response) => {
      return cache.put(request, response);
    });
  });
}

/**
 * Return data from cache
 */
function fromCacheOrFetch(request) {
  return caches.open(activeCacheName).then((cache) => {
    return cache.match(request).then((response) => {
      // return response or fetch over network
      return response || fetch(request);
    });
  });
}

// eslint-disable-next-line no-restricted-globals
self.addEventListener("install", (event) => {
  event.waitUntil(precache());
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("fetch", (event) => {
  event.respondWith(fromCacheOrFetch(event.request));
  // event.waitUntil(update(event.request));
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
