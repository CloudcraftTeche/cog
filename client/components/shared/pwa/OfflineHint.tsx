"use client";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Placed next to a submit button that is disabled while offline, to say why.
export function OfflineHint({ className = "" }: { className?: string }) {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <p role="status" className={`flex items-center gap-2 text-sm font-medium text-amber-700 ${className}`}>
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      Connect to the internet to submit.
    </p>
  );
}
