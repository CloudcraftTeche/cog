export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
export const formatDateTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );
    return `${diffInMinutes} min ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else {
    return formatDateShort(dateString);
  }
};
export const getDaysUntilInfo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return {
      text: "Overdue",
      gradient: "from-red-500 to-rose-600",
      textColor: "text-white",
      pulse: true,
    };
  }
  if (diffDays === 0) {
    return {
      text: "Due Today",
      gradient: "from-orange-500 to-red-500",
      textColor: "text-white",
      pulse: true,
    };
  }
  if (diffDays === 1) {
    return {
      text: "Tomorrow",
      gradient: "from-yellow-500 to-orange-500",
      textColor: "text-white",
      pulse: false,
    };
  }
  if (diffDays <= 3) {
    return {
      text: `${diffDays} days`,
      gradient: "from-amber-500 to-yellow-500",
      textColor: "text-white",
      pulse: false,
    };
  }
  return {
    text: `${diffDays} days`,
    gradient: "from-green-500 to-emerald-500",
    textColor: "text-white",
    pulse: false,
  };
};
export const getDaysOverdue = (dateString: string | Date): number => {
  const now = new Date();
  const end = new Date(dateString);
  const diffTime = now.getTime() - end.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
export const getPercentage = (value: number, total: number): number => {
  return total > 0 ? Math.round((value / total) * 100) : 0;
};
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 80) return "from-green-500 to-emerald-600";
  if (percentage >= 60) return "from-blue-500 to-cyan-600";
  if (percentage >= 40) return "from-yellow-500 to-orange-600";
  return "from-red-500 to-pink-600";
};
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current?.[key] === undefined || current?.[key] === null) {
      return defaultValue;
    }
    current = current[key];
  }
  return current as T;
};
export const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US");
};
