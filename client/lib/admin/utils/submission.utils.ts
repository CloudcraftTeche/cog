// lib/utils/submission.utils.ts

export const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
};

export const getScoreBadgeColor = (score: number): string => {
  if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 70) return "bg-blue-100 text-blue-700 border-blue-200";
  if (score >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-red-100 text-red-700 border-red-200";
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Pass";
  return "Needs Improvement";
};

export const getSubmissionTypeColor = (type: string): string => {
  switch (type) {
    case "video":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "pdf":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
};

export const truncateText = (text: string, maxLength: number = 150): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};