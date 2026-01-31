"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getRoleColor } from "@/utils/navigations/role-utils";
import { User } from "@/types/auth/auth";

const DEFAULT_AVATAR_URL =
  "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9 sm:h-10 sm:w-10",
  };

  const fallbackSizeClasses = {
    sm: "text-xs leading-tight",
    md: "text-sm",
  };

  const avatarUrl = user?.avatar || DEFAULT_AVATAR_URL;
  const initials = user?.name?.charAt(0).toUpperCase() || "U";
  const roleColor = getRoleColor(user?.role);

  return (
    <Avatar className={cn(sizeClasses[size], "ring-2 ring-orange-200")}>
      <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
      <AvatarFallback className={cn("text-white font-semibold", fallbackSizeClasses[size], roleColor)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}