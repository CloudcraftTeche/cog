"use client";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Reloads the page now, or automatically as soon as the connection comes back.
export function RetryButton() {
  useEffect(() => {
    const reload = () => window.location.reload();
    window.addEventListener("online", reload);
    return () => window.removeEventListener("online", reload);
  }, []);

  return (
    <Button onClick={() => window.location.reload()} className="bg-slate-900 text-white hover:bg-slate-800">
      <RefreshCw className="h-4 w-4" />
      Try again
    </Button>
  );
}
