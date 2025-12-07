import { IAssignment } from "@/types/assignment.types";
export const getGradeId = (assignment: IAssignment): string => {
  return typeof assignment.gradeId === 'object' 
    ? assignment.gradeId._id 
    : assignment.gradeId;
};
export const getGradeName = (assignment: IAssignment): string => {
  return typeof assignment.gradeId === 'object' 
    ? assignment.gradeId.grade 
    : '';
};
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const getTimeRemaining = (startDate: Date, endDate: Date, status: string): string => {
  const now = new Date();
  const isEnded = now > endDate || status === "ended";
  const isUpcoming = now < startDate;
  if (isEnded) return "Ended";
  if (isUpcoming) return `Starts ${formatDate(startDate)}`;
  const diff = endDate.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return "Due soon";
};
export const getTimeProgress = (startDate: Date, endDate: Date): number => {
  const now = new Date();
  if (now < startDate) return 0;
  if (now > endDate) return 100;
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};
export const getAssignmentStatus = (assignment: IAssignment) => {
  const now = new Date();
  const startDate = new Date(assignment.startDate);
  const endDate = new Date(assignment.endDate);
  return {
    isUpcoming: now < startDate,
    isActive: now >= startDate && now <= endDate && assignment.status === "active",
    isEnded: now > endDate || assignment.status === "ended",
    isLocked: assignment.status === "locked"
  };
};