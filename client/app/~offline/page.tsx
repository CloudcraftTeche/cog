import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { RetryButton } from "@/components/shared/pwa/RetryButton";

export const metadata: Metadata = {
  title: "Offline | Logos",
};

// Served by the service worker (app/sw.ts) when a page is opened without a connection.
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      {/* A plain img so the precached /logo.png is used instead of the image optimizer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Logos – Smart scripture school" className="w-64 max-w-full" />
      <div className="flex flex-col items-center gap-2">
        <WifiOff className="h-8 w-8 text-slate-400" aria-hidden />
        <h1 className="text-2xl font-semibold text-slate-900">You&apos;re offline</h1>
        <p className="max-w-sm text-slate-600">
          Check your internet connection. This page will reload by itself when you&apos;re back online.
        </p>
      </div>
      <RetryButton />
    </main>
  );
}
