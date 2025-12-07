
export const getSubmissionTypeColor = (type: string): string => {
  switch (type) {
    case "video":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "pdf":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
};

export const getScoreColor = (score?: number): string => {
  if (score === undefined || score === null) return "text-gray-400";
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-blue-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
};

export const getScoreBadgeColor = (score?: number): string => {
  if (score === undefined || score === null) return "bg-gray-100 text-gray-600";
  if (score >= 90) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 80) return "bg-blue-100 text-blue-800 border-blue-200";
  if (score >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
};

export const getScoreLabel = (score?: number): string => {
  if (score === undefined || score === null) return "Not Graded";
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Fair";
  return "Needs Improvement";
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};