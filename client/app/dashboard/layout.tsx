"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  User,
  Upload,
  ChevronRight,
  LogOutIcon,
  SchoolIcon,
  MegaphoneIcon,
  MessageCircleMore,
  CalendarDaysIcon,
  BadgeHelpIcon,
  BookImage,
  BookMarked,
  Book,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  const navigationItems = useMemo(() => {
    const baseItems = [{ name: "Dashboard", href: "/dashboard", icon: Home }];

    if (user?.role === "admin" || user?.role === "superAdmin") {
      return [
        ...baseItems,
        { name: "Teachers", href: "/dashboard/admin/teachers", icon: Users },
        {
          name: "Students",
          href: "/dashboard/admin/students",
          icon: GraduationCap,
        },
        { name: "Chapters", href: "/dashboard/admin/chapters", icon: BookOpen },
        { name: "Grades", href: "/dashboard/admin/grades", icon: SchoolIcon },
        {
          name: "Assignments",
          href: "/dashboard/admin/assignments",
          icon: Upload,
        },
        {
          name: "Teacher-Chapters",
          href: "/dashboard/admin/teacher-chapters",
          icon: BookMarked,
        },
        {
          name: "Chat",
          href: "/dashboard/admin/chat",
          icon: MessageCircleMore,
        },
        {
          name: "Queries",
          href: "/dashboard/admin/query",
          icon: BadgeHelpIcon,
        },
        {
          name: "Attendance",
          href: "/dashboard/admin/attendance",
          icon: CalendarDaysIcon,
        },
        {
          name: "Announcements",
          href: "/dashboard/admin/announcements",
          icon: MegaphoneIcon,
        },
      ];
    }

    if (user?.role === "teacher") {
      return [
        ...baseItems,
        {
          name: "Students",
          href: "/dashboard/teacher/students",
          icon: GraduationCap,
        },
        { name: "Units", href: "/dashboard/teacher/units", icon: Book },

        {
          name: "Chapters",
          href: "/dashboard/teacher/chapters",
          icon: BookOpen,
        },
        {
          name: "My-Chapters",
          href: "/dashboard/teacher/my-chapters",
          icon: BookImage,
        },
        {
          name: "Assignments",
          href: "/dashboard/teacher/assignments",
          icon: Upload,
        },
        {
          name: "Chat",
          href: "/dashboard/teacher/chat",
          icon: MessageCircleMore,
        },
        {
          name: "Attendance",
          href: "/dashboard/teacher/attendance",
          icon: CalendarDaysIcon,
        },
        {
          name: "Queries",
          href: "/dashboard/teacher/query",
          icon: BadgeHelpIcon,
        },
        {
          name: "Announcements",
          href: "/dashboard/teacher/announcements",
          icon: MegaphoneIcon,
        },
        { name: "Profile", href: "/dashboard/teacher/profile", icon: User },
      ];
    }

    if (user?.role === "student") {
      return [
        ...baseItems,
        {
          name: "Chapters",
          href: "/dashboard/student/chapters",
          icon: BookOpen,
        },
        {
          name: "Assignments",
          href: "/dashboard/student/assignments",
          icon: Upload,
        },
        {
          name: "Chat",
          href: "/dashboard/student/chat",
          icon: MessageCircleMore,
        },
        {
          name: "Queries",
          href: "/dashboard/student/query",
          icon: BadgeHelpIcon,
        },
        {
          name: "Announcements",
          href: "/dashboard/student/announcements",
          icon: MegaphoneIcon,
        },
        { name: "Profile", href: "/dashboard/student/profile", icon: User },
      ];
    }

    return baseItems;
  }, [user?.role]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
      case "superAdmin":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white";
      case "teacher":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "student":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getRoleLabel = (role: string) => {
    return role === "superAdmin"
      ? "Super Admin"
      : role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-bold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static lg:w-80"
        )}
      >
        {}
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
                <h1 className="text-base sm:text-lg font-bold text-white truncate">
                  Scripture School
                </h1>
                <p className="text-white/80 text-xs sm:text-sm truncate">
                  Learning Management
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-2 flex-shrink-0"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {}
        <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 sm:h-12 rounded-xl transition-all duration-200 group cursor-pointer text-sm sm:text-base",
                  isActive
                    ? "bg-gradient-to-r from-orange-400 to-red-500 text-white"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600"
                )}
                onClick={() => {
                  if (!isActive) router.push(item.href);
                  setSidebarOpen(false);
                }}
              >
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-2 sm:mr-3 transition-all duration-200 flex-shrink-0",
                    isActive
                      ? "bg-white/20"
                      : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-500"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200",
                      isActive
                        ? "text-white"
                        : "text-gray-600 group-hover:text-white"
                    )}
                  />
                </div>
                <span className="font-medium flex-1 text-left truncate">
                  {item.name}
                </span>
                {!isActive && (
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors duration-200 flex-shrink-0" />
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      {}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm cursor-pointer"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {}
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 flex-shrink-0"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden sm:block min-w-0">
                <h2 className="text-sm sm:text-base font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent truncate">
                  {user?.role ? getRoleLabel(user.role) : "U"} Dashboard
                </h2>
                <p className="text-xs text-gray-500 font-medium truncate">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2 sm:gap-3 text-right">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role ? getRoleLabel(user.role) : "U"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0"
                      aria-label="User menu"
                    >
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-orange-200">
                        <AvatarImage
                          src={
                            user?.avatar ||
                            "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
                          }
                          alt={user?.name}
                        />
                        <AvatarFallback
                          className={cn(
                            "text-white font-semibold text-sm",
                            getRoleColor(user?.role || "")
                          )}
                        >
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 sm:w-56"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-xs sm:text-sm"
                    >
                      <LogOutIcon className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full p-0"
                      aria-label="User menu"
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-orange-200">
                        <AvatarImage
                          src={
                            user?.avatar ||
                            "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
                          }
                          alt={user?.name}
                        />
                        <AvatarFallback
                          className={cn(
                            "text-white font-semibold text-xs leading-tight",
                            getRoleColor(user?.role || "")
                          )}
                        >
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48" align="end" forceMount>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-xs"
                    >
                      <LogOutIcon className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-full break-words">{children}</div>
        </main>
      </div>
    </div>
  );
}
