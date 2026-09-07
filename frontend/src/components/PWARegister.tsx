"use client";

// Registers the service worker once on the client.
export default function PWARegister() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW is a progressive enhancement; ignore failures silently.
      });
    });
  }
  return null;
}
