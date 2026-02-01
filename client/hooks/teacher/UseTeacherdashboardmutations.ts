import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import api from '@/lib/api';
import { dashboardKeys } from './useTeacherDashboard';
interface GradeSubmissionParams {
  submissionId: string;
  score: number;
  feedback?: string;
}
interface UpdateQueryStatusParams {
  queryId: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
}
interface MarkAttendanceParams {
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}
interface GradeSubmissionResponse {
  success: boolean;
  message: string;
  data?: {
    submissionId: string;
    score: number;
    gradedAt: string;
  };
}
export const useGradeSubmission = (): UseMutationResult<
  GradeSubmissionResponse,
  Error,
  GradeSubmissionParams
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: GradeSubmissionParams) => {
      const response = await api.post<GradeSubmissionResponse>(
        '/submissions/grade',
        params
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.pendingGradings() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.teacher() });
    },
    onError: (error: Error) => {
      console.error('Failed to grade submission:', error);
    },
  });
};
export const useUpdateQueryStatus = (): UseMutationResult<
  { success: boolean; message: string },
  Error,
  UpdateQueryStatusParams
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: UpdateQueryStatusParams) => {
      const response = await api.patch(`/queries/${params.queryId}`, {
        status: params.status,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.teacher() });
    },
  });
};
export const useMarkAttendance = (): UseMutationResult<
  { success: boolean; message: string },
  Error,
  MarkAttendanceParams
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: MarkAttendanceParams) => {
      const response = await api.post('/attendance/mark', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.teacher() });
    },
  });
};
export const useBulkGradeSubmissions = (): UseMutationResult<
  { success: boolean; gradedCount: number },
  Error,
  GradeSubmissionParams[]
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submissions: GradeSubmissionParams[]) => {
      const response = await api.post('/submissions/bulk-grade', {
        submissions,
      });
      return response.data;
    },
    onMutate: async (submissions) => {
      await queryClient.cancelQueries({ queryKey: dashboardKeys.pendingGradings() });
      const previousData = queryClient.getQueryData(dashboardKeys.pendingGradings());
      return { previousData };
    },
    onError: (err, submissions, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          dashboardKeys.pendingGradings(),
          context.previousData
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.pendingGradings() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.teacher() });
    },
  });
};
