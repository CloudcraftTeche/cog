import { IAssignment } from "@/types/student/assignment.types";

export function getAssignmentStatus(assignment: IAssignment) {
  const now = new Date();
  const startDate = new Date(assignment.startDate);
  const endDate = new Date(assignment.endDate);
  const isUpcoming = now < startDate;
  const isActive =
    now >= startDate && now <= endDate && assignment.status === "active";
  const isEnded = now > endDate || assignment.status === "ended";
  const isLocked = assignment.status === "locked";
  return { isUpcoming, isActive, isEnded, isLocked };
}
export function getTimeRemaining(assignment: IAssignment) {
  const { isEnded, isUpcoming } = getAssignmentStatus(assignment);
  const now = new Date();
  const startDate = new Date(assignment.startDate);
  const endDate = new Date(assignment.endDate);
  if (isEnded) return "Ended";
  if (isUpcoming) return `Starts ${formatDate(startDate)}`;
  const diff = endDate.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return "Due soon!";
}
export function getTimeProgress(assignment: IAssignment) {
  const { isUpcoming, isEnded } = getAssignmentStatus(assignment);
  const now = new Date();
  const startDate = new Date(assignment.startDate);
  const endDate = new Date(assignment.endDate);
  if (isUpcoming) return 0;
  if (isEnded) return 100;
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function formatFullDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function getGradeName(gradeId: IAssignment["gradeId"]): string {
  return typeof gradeId === "object" ? gradeId.grade : "";
}
export function extractSubmittedAssignmentIds(
  submissions: Array<{ assignmentId: string | { _id: string } }>,
): string[] {
  return submissions.map((s) =>
    typeof s.assignmentId === "object" ? s.assignmentId._id : s.assignmentId,
  );
}
