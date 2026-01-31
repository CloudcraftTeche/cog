"use client";
import { GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  onClose: () => void;
  hideOnDesktop?: boolean;
}

export function SidebarHeader({ onClose, hideOnDesktop = true }: SidebarHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 p-4 sm:p-6 flex-shrink-0">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-2 right-2 w-20 h-20 border border-white/20 rounded-full" />
      <div className="absolute bottom-2 left-2 w-12 h-12 border border-white/20 rounded-full" />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-white truncate">Scripture School</h1>
            <p className="text-white/80 text-xs sm:text-sm truncate">Learning Management</p>
          </div>
        </div>
        {hideOnDesktop && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden text-white hover:bg-white/20 p-2 flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}