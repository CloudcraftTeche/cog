"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import type { Serwist } from "@serwist/window";

declare global {
  interface Window {
    // Created by @serwist/next in production builds only.
    serwist?: Serwist;
  }
}

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

// Registers the service worker and asks the user to reload when a new version has been deployed.
export function PwaProvider() {
  useEffect(() => {
    const serwist = window.serwist;
    if (!serwist) return;

    const promptUpdate = () => {
      toast("A new version of Logos is available", {
        id: "pwa-update",
        duration: Infinity,
        action: {
          label: "Update",
          onClick: () => {
            serwist.addEventListener("controlling", () => window.location.reload());
            serwist.messageSkipWaiting();
          },
        },
      });
    };

    serwist.addEventListener("waiting", promptUpdate);
    void serwist.register();
    // The app can stay open for hours, so look for a new deployment periodically too.
    const interval = window.setInterval(() => void serwist.update(), UPDATE_CHECK_INTERVAL_MS);

    return () => {
      serwist.removeEventListener("waiting", promptUpdate);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
