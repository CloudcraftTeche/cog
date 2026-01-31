// types/navigation.ts
import { LucideIcon } from "lucide-react";
import { UserRole } from "./auth/auth";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export type NavConfig = Record<UserRole, NavItem[]>;

