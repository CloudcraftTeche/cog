import { useMemo, useState } from "react";
import {
  IAssignment,
  AssignmentFilters,
  UserRole,
} from "@/types/student/assignment.types";
import { getAssignmentStatus } from "./assignment-utils";
export function useAssignmentFilters(
  assignments: IAssignment[] | undefined,
  submittedIds: string[],
  userRole: UserRole,
) {
  const [filters, setFilters] = useState<AssignmentFilters>({
    search: "",
    status: "all",
    contentType: "all",
  });
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        assignment.description
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      const { isActive, isUpcoming, isEnded } = getAssignmentStatus(assignment);
      let matchesStatus = true;
      if (filters.status === "active") {
        matchesStatus = isActive;
      } else if (filters.status === "upcoming") {
        matchesStatus = isUpcoming;
      } else if (filters.status === "ended") {
        matchesStatus = isEnded;
      } else if (filters.status === "submitted" && userRole === "student") {
        matchesStatus = submittedIds.includes(assignment._id);
      } else if (filters.status === "pending" && userRole === "student") {
        matchesStatus = !submittedIds.includes(assignment._id) && isActive;
      }
      const matchesContent =
        filters.contentType === "all" ||
        assignment.contentType === filters.contentType;
      return matchesSearch && matchesStatus && matchesContent;
    });
  }, [assignments, filters, submittedIds, userRole]);
  return {
    filters,
    setFilters,
    filteredAssignments,
  };
}
