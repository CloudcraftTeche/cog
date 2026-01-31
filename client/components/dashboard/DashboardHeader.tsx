"use client";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { User } from "@/types/auth/auth";
import { getRoleLabel } from "@/utils/navigations/role-utils";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: User | null;
  onMenuOpen: () => void;
  onLogout: () => void;
}

export function DashboardHeader({ user, onMenuOpen, onLogout }: DashboardHeaderProps) {
  const displayName = user?.name === "Pastor" ? "Pastor" : getRoleLabel(user?.role);

  return (
    <header className="flex-shrink-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14 sm:h-16">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuOpen}
            className="lg:hidden p-2 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 flex-shrink-0"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block min-w-0">
            <h2 className={cn(
              "text-sm sm:text-base font-black truncate",
              "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
            )}>
              {displayName} Dashboard
            </h2>
            <p className="text-xs text-gray-500 font-medium truncate">
              Welcome back, {user?.name || "User"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <UserMenu user={user} onLogout={onLogout} variant="desktop" />
          <UserMenu user={user} onLogout={onLogout} variant="mobile" />
        </div>
      </div>
    </header>
  );
}
