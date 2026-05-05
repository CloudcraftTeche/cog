export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    open: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    in_progress: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    escalated: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    closed: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  };
  return colors[status] || colors.open;
};
export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: "bg-slate-500/10 text-slate-700 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    urgent: "bg-red-500/10 text-red-700 border-red-500/20",
  };
  return colors[priority] || colors.medium;
};
export const getStatusBadgeColor = (status: string): string => {
  const colors: Record<string, string> = {
    open: "bg-gradient-to-r from-blue-500 to-blue-600",
    in_progress: "bg-gradient-to-r from-amber-500 to-amber-600",
    resolved: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    escalated: "bg-gradient-to-r from-purple-500 to-purple-600",
    closed: "bg-gradient-to-r from-slate-500 to-slate-600",
  };
  return colors[status] || colors.open;
};
export const getPriorityBadgeColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: "bg-gradient-to-r from-slate-400 to-slate-500",
    medium: "bg-gradient-to-r from-blue-500 to-blue-600",
    high: "bg-gradient-to-r from-orange-500 to-orange-600",
    urgent: "bg-gradient-to-r from-red-500 to-red-600",
  };
  return colors[priority] || colors.medium;
};
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const formatStatusLabel = (status: string): string => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
