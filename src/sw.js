/* globals self, caches, fetch */

const activeCacheName = "v15";

/**
 * Cache static elements
 */
function precache() {
  return caches.open(activeCacheName).then((cache) => {
    return cache.addAll([
      "/manifest.json",
      "/robots.txt",
      "/favicon.ico",
      "/img/nidarholm-kimen.jpg",
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
 * Return data from cache
 */
function fromCacheOrFetch(request) {
  return caches.open(activeCacheName).then((cache) => {
    return cache.match(request).then((response) => {
      // return response or fetch over network
      if (response) {
        return response;
      }
      return fetch(request, { credentials: "include" })
        .then((fetchResponse) => {
          return fetchResponse;
        })
        .catch((error) => {
          console.error(`${request}: ${error}`);
          throw error;
        });
    });
  });
}

// eslint-disable-next-line no-restricted-globals
self.addEventListener("install", (event) => {
  event.waitUntil(
    precache().then(() => {
      console.debug("Cache ready");
      self.skipWaiting();
    }),
  );
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("fetch", (event) => {
  if (
    !event.request.url.match(
      /^https:\/\/(localhost:\d+|nidarholm.no|www.nidarholm.no)\//,
    )
  ) {
    return event.respondWith(fetch(event.request));
  }
  event.respondWith(fromCacheOrFetch(event.request));
});

// eslint-disable-next-line no-restricted-globals
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== activeCacheName) {
              return caches.delete(key).then(() => {
                console.debug(`Cache ${key} deleted`);
              });
            }
          }),
        );
      })
      .then(() => {
        self.clients.claim();
      }),
  );
});
