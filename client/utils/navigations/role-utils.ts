// lib/utils/role-utils.ts
import { UserRole } from "@/types/auth/auth";

const roleColorMap: Record<UserRole, string> = {
  admin: "bg-gradient-to-r from-red-500 to-red-600 text-white",
  superAdmin: "bg-gradient-to-r from-red-500 to-red-600 text-white",
  teacher: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
  student: "bg-gradient-to-r from-green-500 to-green-600 text-white",
};

export const getRoleColor = (role: string | null | undefined): string => {
  if (!role) return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
  return roleColorMap[role as UserRole] || "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
};

export const getRoleLabel = (role: string | null | undefined): string => {
  if (!role) return "User";
  return role === "superAdmin"
    ? "Super Admin"
    : role.charAt(0).toUpperCase() + role.slice(1);
};