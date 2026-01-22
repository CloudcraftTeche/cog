// lib/utils/announcement.utils.ts

export const getTypeColor = (type: string): string => {
  switch (type) {
    case "video":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "image":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getTypeBadgeIcon = (type: string): string => {
  switch (type) {
    case "video":
      return "🎥";
    case "image":
      return "🖼️";
    default:
      return "📝";
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export const truncateContent = (
  content: string,
  maxLength: number = 100
): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};