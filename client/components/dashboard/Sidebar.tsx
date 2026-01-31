"use client";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getNavigationByRole } from "@/utils/navigations/navigation";
import { NavButton } from "./NavButton";
import { UserRole } from "@/types/auth/auth";
import { SidebarHeader } from "./SidebarHeader";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole | null | undefined;
}

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems = useMemo(() => getNavigationByRole(userRole), [userRole]);

  const handleNavigation = (href: string) => {
    if (pathname !== href) {
      router.push(href);
    }
    onClose();
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:w-80"
        )}
      >
        <SidebarHeader onClose={onClose} />
        <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavButton
              key={item.name}
              item={item}
              isActive={pathname === item.href}
              onClick={() => handleNavigation(item.href)}
            />
          ))}
        </nav>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm cursor-pointer"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}
    </>
  );
}