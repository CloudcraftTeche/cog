"use client";
import { useEffect, useRef } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Shown at the top of every dashboard page while the device is offline. The app is online-first,
// so this explains why loading and submitting have stopped working.
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      toast.success("You're back online", { id: "connection-status" });
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      <p>
        <span className="font-semibold">You&apos;re offline.</span> You can keep reading this page, but
        loading and submitting need an internet connection.
      </p>
    </div>
  );
}
