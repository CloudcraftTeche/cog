import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  AssignmentsResponse,
  SubmissionsResponse,
  AssignmentResponse,
  SubmissionResponse,
  ISubmission,
} from "@/types/student/assignment.types";
export const assignmentKeys = {
  all: ["assignments"] as const,
  lists: () => [...assignmentKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...assignmentKeys.lists(), { filters }] as const,
  details: () => [...assignmentKeys.all, "detail"] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
  submissions: () => [...assignmentKeys.all, "submissions"] as const,
  mySubmissions: () => [...assignmentKeys.submissions(), "my"] as const,
};
export function useAssignments() {
  return useQuery({
    queryKey: assignmentKeys.lists(),
    queryFn: async () => {
      const response = await api.get<AssignmentsResponse>("/assignments");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
export function useAssignment(id: string) {
  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<AssignmentResponse>(`/assignments/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
export function useMySubmissions() {
  return useQuery({
    queryKey: assignmentKeys.mySubmissions(),
    queryFn: async () => {
      const response = await api.get<SubmissionsResponse>(
        "/assignments/my/submissions/all",
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post<SubmissionResponse>(
        "/submissions",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.mySubmissions(),
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}
export function useUpdateSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const response = await api.put<SubmissionResponse>(
        `/submissions/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.mySubmissions(),
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}
export function useAssignmentSubmission(assignmentId: string) {
  const { data: submissions, isLoading } = useMySubmissions();
  const submission =
    submissions?.data?.find((s: ISubmission) => {
      const subAssignmentId =
        typeof s.assignmentId === "object"
          ? s.assignmentId._id
          : s.assignmentId;
      return subAssignmentId === assignmentId;
    }) ?? null;
  return {
    submission,
    isLoading,
  };
}
