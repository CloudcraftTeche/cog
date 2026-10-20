import { randomUUID } from "node:crypto";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Files outside the build output that the service worker precaches. They get a fresh revision on
// every build so an update always replaces them.
const revision = randomUUID();
const precachePublicFiles = [
  "/~offline",
  "/logo.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Only production builds get a service worker: `npm run dev` uses Turbopack, which cannot build it.
  disable: process.env.NODE_ENV !== "production",
  // components/pwa/PwaProvider registers the worker so it can show the "update available" prompt.
  register: false,
  cacheOnNavigation: false,
  reloadOnOnline: false,
  additionalPrecacheEntries: precachePublicFiles.map((url) => ({ url, revision })),
});

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withSerwist(nextConfig);
