// lib/utils/navigation.ts
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  User,
  Upload,
  SchoolIcon,
  MegaphoneIcon,
  MessageCircleMore,
  CalendarDaysIcon,
  BadgeHelpIcon,
  BookImage,
  BookMarked,
  Book,
  School2Icon,
} from "lucide-react";
import { NavItem, NavConfig } from "@/types/navigation";

const baseNavItems: NavItem[] = [{ name: "Dashboard", href: "/dashboard", icon: Home }];

const adminNavItems: NavItem[] = [
  { name: "Teachers", href: "/dashboard/admin/teachers", icon: Users },
  { name: "Students", href: "/dashboard/admin/students", icon: GraduationCap },
  { name: "Chapters", href: "/dashboard/admin/chapters", icon: BookOpen },
  { name: "Grades", href: "/dashboard/admin/grades", icon: SchoolIcon },
  { name: "GradeReports", href: "/dashboard/admin/gradeReport", icon: School2Icon },
  { name: "Assignments", href: "/dashboard/admin/assignments", icon: Upload },
  { name: "Teacher-Chapters", href: "/dashboard/admin/teacher-chapters", icon: BookMarked },
  { name: "Chat", href: "/dashboard/admin/chat", icon: MessageCircleMore },
  { name: "Queries", href: "/dashboard/admin/queries", icon: BadgeHelpIcon },
  { name: "Attendance", href: "/dashboard/admin/attendance", icon: CalendarDaysIcon },
  { name: "TeacherAttendance", href: "/dashboard/admin/teacher-attendance", icon: CalendarDaysIcon },
  { name: "Announcements", href: "/dashboard/admin/announcements", icon: MegaphoneIcon },
];

const superAdminNavItems: NavItem[] = [
  { name: "Teachers", href: "/dashboard/super-admin/teachers", icon: Users },
  { name: "Students", href: "/dashboard/super-admin/students", icon: GraduationCap },
  { name: "Chapters", href: "/dashboard/super-admin/chapters", icon: BookOpen },
  { name: "Grades", href: "/dashboard/super-admin/grades", icon: SchoolIcon },
  { name: "GradeReports", href: "/dashboard/admin/gradeReport", icon: School2Icon },
  { name: "Assignments", href: "/dashboard/super-admin/assignments", icon: Upload },
  { name: "Teacher-Chapters", href: "/dashboard/super-admin/teacher-chapters", icon: BookMarked },
  { name: "Chat", href: "/dashboard/super-admin/chat", icon: MessageCircleMore },
  { name: "Queries", href: "/dashboard/super-admin/queries", icon: BadgeHelpIcon },
  { name: "Attendance", href: "/dashboard/super-admin/attendance", icon: CalendarDaysIcon },
  { name: "TeacherAttendance", href: "/dashboard/admin/teacher-attendance", icon: CalendarDaysIcon },
  { name: "Announcements", href: "/dashboard/super-admin/announcements", icon: MegaphoneIcon },
];

const teacherNavItems: NavItem[] = [
  { name: "Students", href: "/dashboard/teacher/students", icon: GraduationCap },
  { name: "Units", href: "/dashboard/teacher/units", icon: Book },
  { name: "Chapters", href: "/dashboard/teacher/chapters", icon: BookOpen },
  { name: "My-Chapters", href: "/dashboard/teacher/my-chapters", icon: BookImage },
  { name: "Assignments", href: "/dashboard/teacher/assignments", icon: Upload },
  { name: "Chat", href: "/dashboard/teacher/chat", icon: MessageCircleMore },
  { name: "Attendance", href: "/dashboard/teacher/attendance", icon: CalendarDaysIcon },
  { name: "Queries", href: "/dashboard/teacher/queries", icon: BadgeHelpIcon },
  { name: "Announcements", href: "/dashboard/teacher/announcements", icon: MegaphoneIcon },
  { name: "Profile", href: "/dashboard/teacher/profile", icon: User },
];

const studentNavItems: NavItem[] = [
  { name: "Todo List", href: "/dashboard/student/todo-list", icon: CalendarDaysIcon },
  { name: "Chapters", href: "/dashboard/student/chapters", icon: BookOpen },
  { name: "Assignments", href: "/dashboard/student/assignments", icon: Upload },
  { name: "Chat", href: "/dashboard/student/chat", icon: MessageCircleMore },
  { name: "Queries", href: "/dashboard/student/queries", icon: BadgeHelpIcon },
  { name: "Announcements", href: "/dashboard/student/announcements", icon: MegaphoneIcon },
  { name: "Profile", href: "/dashboard/student/profile", icon: User },
];

export const navigationConfig: NavConfig = {
  admin: [...baseNavItems, ...adminNavItems],
  superAdmin: [...baseNavItems, ...superAdminNavItems],
  teacher: [...baseNavItems, ...teacherNavItems],
  student: [...baseNavItems, ...studentNavItems],
};

export const getNavigationByRole = (role: string | undefined | null): NavItem[] => {
  if (!role) return baseNavItems;
  return navigationConfig[role as keyof NavConfig] || baseNavItems;
};