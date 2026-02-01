import { Query, QueryStatus } from "@/types/admin/admindashboard.types";
import { format } from "date-fns";
export const getStatusColor = (status?: string): string => {
  const normalizedStatus = status?.toLowerCase() as QueryStatus | undefined;
  switch (normalizedStatus) {
    case "resolved":
      return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200";
    case "pending":
    case "in_progress":
      return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-200";
    case "cancelled":
    case "rejected":
      return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-200";
    default:
      return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-2 border-gray-200";
  }
};
export const formatDate = (date?: string | Date): string => {
  if (!date) return "N/A";
  try {
    return format(new Date(date), "dd/MM/yyyy");
  } catch {
    return "N/A";
  }
};
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return "from-green-500 to-emerald-600";
  if (percentage >= 60) return "from-blue-500 to-cyan-600";
  if (percentage >= 40) return "from-yellow-500 to-orange-600";
  return "from-red-500 to-pink-600";
};
export const getPriorityStats = (queries: Query[] = []) => {
  const urgent = queries.filter(
    (q) =>
      q.subject?.toLowerCase().includes("urgent") ||
      q.subject?.toLowerCase().includes("emergency"),
  ).length;
  const pending = queries.filter(
    (q) => q.status?.toLowerCase() === "pending",
  ).length;
  const resolved = queries.filter(
    (q) => q.status?.toLowerCase() === "resolved",
  ).length;
  return { urgent, pending, resolved };
};
