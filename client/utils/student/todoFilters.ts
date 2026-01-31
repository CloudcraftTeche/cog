// utils/todoFilters.ts
import type { Assignment, AssignmentFilterStatus } from '@/types/student/todo.types';

export const filterAssignments = (
  assignments: Assignment[],
  filter: AssignmentFilterStatus
): Assignment[] => {
  if (!assignments || assignments.length === 0) return [];

  switch (filter) {
    case 'pending':
      return assignments.filter((a) => !a.isSubmitted);
    case 'submitted':
      return assignments.filter((a) => a.isSubmitted);
    case 'overdue':
      return assignments.filter((a) => a.isPastDue && !a.isSubmitted);
    case 'all':
    default:
      return assignments;
  }
};

export const getIntensityColor = (count: number): string => {
  if (count === 0) return 'bg-gray-200';
  if (count === 1) return 'bg-green-300';
  if (count === 2) return 'bg-green-400';
  if (count >= 3) return 'bg-green-600';
  return 'bg-green-500';
};