"use client";
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_AT_KEY = "pwaInstallDismissedAt";
const DISMISS_FOR_MS = 14 * 24 * 60 * 60 * 1000;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPadOS reports itself as a Mac, so also check for a touch screen.
const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const wasDismissedRecently = () => {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY));
    return Date.now() - dismissedAt < DISMISS_FOR_MS;
  } catch {
    return false;
  }
};

// Offers to install the app: the browser's install dialog where supported (Android, desktop Chrome),
// and "Add to Home Screen" instructions on iOS, which has no install dialog.
export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    setShowIosHint(isIos());

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    } catch {}
    setInstallEvent(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "dismissed") dismiss();
    setInstallEvent(null);
  };

  if (!installEvent && !showIosHint) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm rounded-xl border bg-white p-4 shadow-lg"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close"
        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3 pr-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl border" />
        <div>
          <p id="pwa-install-title" className="font-semibold text-slate-900">
            Install the Logos app
          </p>
          {installEvent ? (
            <p className="mt-1 text-sm text-slate-600">Open Logos straight from your home screen.</p>
          ) : (
            <p className="mt-1 text-sm text-slate-600">
              Tap <Share className="inline h-4 w-4 align-text-bottom" aria-label="Share" /> and then{" "}
              <span className="font-medium">Add to Home Screen</span>.
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={dismiss}>
          {installEvent ? "Not now" : "Got it"}
        </Button>
        {installEvent && (
          <Button size="sm" onClick={install}>
            <Download className="h-4 w-4" />
            Install
          </Button>
        )}
      </div>
    </div>
  );
}
