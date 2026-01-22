
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentService } from "@/lib/admin/api/assignment.service";
import { UseSubmissionsParams } from "@/types/admin/assignment.types";
import { ASSIGNMENT_QUERY_KEYS } from "./useAssignments";

export const useSubmissions = ({ assignmentId, limit = 10 }: UseSubmissionsParams) => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Fetch submissions
  const {
    data: submissionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ASSIGNMENT_QUERY_KEYS.submissions(assignmentId, currentPage, searchTerm),
    queryFn: () =>
      assignmentService.getSubmissions(assignmentId, {
        page: currentPage,
        limit,
        search: searchTerm,
      }),
    enabled: !!assignmentId,
  });

  // Grade submission mutation
  const gradeMutation = useMutation({
    mutationFn: ({
      submissionId,
      score,
      feedback,
    }: {
      submissionId: string;
      score: number;
      feedback: string;
    }) => assignmentService.gradeSubmission(submissionId, { score, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_QUERY_KEYS.submissions(assignmentId, currentPage, searchTerm),
      });
    },
  });

  return {
    submissions: submissionsData?.data || [],
    pagination: submissionsData?.pagination,
    loading: isLoading,
    error,
    currentPage,
    totalPages: submissionsData?.pagination?.totalPages || 1,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
    gradeSubmission: async (submissionId: string, score: number, feedback: string) => {
      await gradeMutation.mutateAsync({ submissionId, score, feedback });
    },
    isGrading: gradeMutation.isPending,
    refetch,
  };
};