"use client";
import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./UserAvatar";
import { User } from "@/types/auth/auth";
import { getRoleLabel } from "@/utils/navigations/role-utils";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: User | null;
  onLogout: () => void;
  variant?: "desktop" | "mobile";
}

export function UserMenu({ user, onLogout, variant = "desktop" }: UserMenuProps) {
  const isDesktop = variant === "desktop";

  return (
    <div className={cn(isDesktop ? "hidden md:flex" : "md:hidden", "items-center gap-2 sm:gap-3 text-right")}>
      {isDesktop && (
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
          <p className="text-xs text-gray-500">{getRoleLabel(user?.role)}</p>
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative rounded-full p-0"
            aria-label="User menu"
          >
            <UserAvatar user={user} size={isDesktop ? "md" : "sm"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn(isDesktop ? "w-48 sm:w-56" : "w-48")}
          align="end"
          forceMount
        >
          <DropdownMenuItem
            onClick={onLogout}
            className={cn("cursor-pointer", isDesktop ? "text-xs sm:text-sm" : "text-xs")}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}