// hooks/useAssignments.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentService } from "@/lib/admin/api/assignment.service";
import { UseAssignmentsParams } from "@/types/admin/assignment.types";

export const ASSIGNMENT_QUERY_KEYS = {
  assignments: (params?: UseAssignmentsParams) => 
    ["assignments", params].filter(Boolean),
  assignment: (id: string) => ["assignment", id],
  grades: ["grades"],
  submissions: (assignmentId: string, page?: number, search?: string) =>
    ["submissions", assignmentId, page, search].filter(Boolean),
} as const;

export const useAssignments = (params?: UseAssignmentsParams) => {
  const queryClient = useQueryClient();

  // Fetch assignments
  const {
    data: assignmentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ASSIGNMENT_QUERY_KEYS.assignments(params),
    queryFn: () => assignmentService.getAssignments(params),
  });

  // Fetch grades
  const {
    data: grades = [],
    isLoading: isLoadingGrades,
  } = useQuery({
    queryKey: ASSIGNMENT_QUERY_KEYS.grades,
    queryFn: assignmentService.getGrades,
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: assignmentService.deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_QUERY_KEYS.assignments(params),
      });
    },
  });

  return {
    assignments: assignmentsData?.data || [],
    pagination: assignmentsData?.pagination,
    grades,
    loading: isLoading,
    gradesLoading: isLoadingGrades,
    error,
    deleteAssignment: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    refetch,
  };
};

// Hook for single assignment
export const useAssignment = (id: string) => {
  const {
    data: assignment,
    isLoading,
    error,
  } = useQuery({
    queryKey: ASSIGNMENT_QUERY_KEYS.assignment(id),
    queryFn: () => assignmentService.getAssignment(id),
    enabled: !!id,
  });

  return {
    assignment,
    loading: isLoading,
    error,
  };
};

// Hook for creating assignment
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  const createSingleMutation = useMutation({
    mutationFn: ({ gradeId, formData }: { gradeId: string; formData: FormData }) =>
      assignmentService.createAssignmentForGrade(gradeId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
    },
  });

  const createMultipleMutation = useMutation({
    mutationFn: assignmentService.createAssignmentForMultipleGrades,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
    },
  });

  return {
    createForSingleGrade: createSingleMutation.mutateAsync,
    createForMultipleGrades: createMultipleMutation.mutateAsync,
    isCreating: createSingleMutation.isPending || createMultipleMutation.isPending,
  };
};

// Hook for updating assignment
export const useUpdateAssignment = (id: string) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) =>
      assignmentService.updateAssignment(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_QUERY_KEYS.assignment(id),
      });
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
    },
  });

  return {
    updateAssignment: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};