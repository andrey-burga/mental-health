const CACHE_NAME = "tu-espacio-seguro-v1";
const STATIC_PRECACHE_URLS = [
  "/",
  "/index.html",
  "/ayuda",
  "/manifest.webmanifest",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    self.caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          STATIC_PRECACHE_URLS.map((url) =>
            cache.add(new Request(url, { cache: "reload" }))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((oldKey) => self.caches.delete(oldKey))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAssetPath(pathname) {
  return (
    pathname.startsWith("/assets/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/pwa-192x192.png" ||
    pathname === "/pwa-512x512.png" ||
    pathname === "/apple-touch-icon.png"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Nunca interceptar rutas de API ni flujos SSE en tiempo real
  if (url.pathname.startsWith("/api/")) return;
  const acceptHeader = request.headers.get("accept") || "";
  if (acceptHeader.includes("text/event-stream")) return;

  // Navegaciones: Network-first con respaldo offline para /ayuda y el shell SPA
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.ok &&
            networkResponse.type === "basic" &&
            (url.pathname === "/" || url.pathname === "/ayuda")
          ) {
            const copy = networkResponse.clone();
            self.caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const exactMatch = await self.caches.match(request);
          if (exactMatch) return exactMatch;
          if (url.pathname === "/ayuda") {
            const helpMatch = await self.caches.match("/ayuda");
            if (helpMatch) return helpMatch;
          }
          const shellMatch = await self.caches.match("/index.html");
          if (shellMatch) return shellMatch;
          return (await self.caches.match("/")) || Response.error();
        })
    );
    return;
  }

  // Assets estáticos compilados e iconos: Cache-first con actualización en segundo plano
  if (isStaticAssetPath(url.pathname)) {
    event.respondWith(
      self.caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.ok &&
              networkResponse.type === "basic"
            ) {
              const copy = networkResponse.clone();
              self.caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    );
  }
});
