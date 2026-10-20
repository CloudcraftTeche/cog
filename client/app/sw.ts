import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Caching is deliberately narrow: the build's static assets and the offline page are precached,
// pages always come from the network, and API calls (a different origin) are never touched, so no
// user data is stored by the worker. Per-role offline data is added in later PWA stories.
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // A new version waits until the user accepts the "update available" prompt.
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkOnly(),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
