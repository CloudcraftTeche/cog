"use client";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types/navigation";

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

export function NavButton({ item, isActive, onClick }: NavButtonProps) {
  const IconComponent = item.icon;
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start h-10 sm:h-12 rounded-xl transition-all duration-200 group cursor-pointer text-sm sm:text-base",
        isActive
          ? "bg-gradient-to-r from-orange-400 to-red-500 text-white"
          : "text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-2 sm:mr-3 transition-all duration-200 flex-shrink-0",
          isActive
            ? "bg-white/20"
            : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-500"
        )}
      >
        <IconComponent
          className={cn(
            "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200",
            isActive ? "text-white" : "text-gray-600 group-hover:text-white"
          )}
        />
      </div>
      <span className="font-medium flex-1 text-left truncate">{item.name}</span>
      {!isActive && (
        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors duration-200 flex-shrink-0" />
      )}
    </Button>
  );
}
