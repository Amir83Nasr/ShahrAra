// Shahr Ara service worker — offline shell + cache-first static assets.
// Vanilla Workbox-free SW; version bump invalidates old caches.
const VERSION = "v2";
const SHELL_CACHE = `shahr-ara-shell-${VERSION}`;
const ASSET_CACHE = `shahr-ara-assets-${VERSION}`;
const SHELL_URL = "/";

// ─── INSTALL ─────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([SHELL_URL]))
      .then(() => self.skipWaiting()),
  );
});

// ─── ACTIVATE ────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.endsWith(`-${VERSION}`))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ─── FETCH ───────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API traffic or Next.js data — always network.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data")
  ) {
    return;
  }

  // Navigation: network-first, fall back to cached shell (offline).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(SHELL_URL, copy));
          return response;
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match(SHELL_URL)),
        ),
    );
    return;
  }

  // Static assets: cache-first, refresh in background.
  event.respondWith(
    caches.match(request).then((hit) => {
      const fetchAndCache = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => hit);
      return hit || fetchAndCache;
    }),
  );
});
