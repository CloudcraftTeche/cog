// hooks/useTodo.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  OverviewData,
  StreakData,
  AssignmentsApiResponse,
  AssignmentQueryParams,
} from '@/types/student/todo.types';

// Query Keys
export const todoKeys = {
  all: ['todo'] as const,
  overview: () => [...todoKeys.all, 'overview'] as const,
  streak: () => [...todoKeys.all, 'streak'] as const,
  assignments: () => [...todoKeys.all, 'assignments'] as const,
  assignmentsList: (params: AssignmentQueryParams) => 
    [...todoKeys.assignments(), params] as const,
};

// Fetch overview data
export const useOverview = () => {
  return useQuery({
    queryKey: todoKeys.overview(),
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: OverviewData }>(
        '/todo/overview'
      );

      if (!data.success) {
        throw new Error('Failed to fetch overview data');
      }

      return data.data;
    },
    staleTime: 60000, // 1 minute
  });
};

// Fetch streak data
export const useStreak = () => {
  return useQuery({
    queryKey: todoKeys.streak(),
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: StreakData }>(
        '/todo/streak'
      );

      if (!data.success) {
        throw new Error('Failed to fetch streak data');
      }

      return data.data;
    },
    staleTime: 60000, // 1 minute
  });
};

// Fetch all assignments
export const useAssignments = (params: AssignmentQueryParams) => {
  return useQuery({
    queryKey: todoKeys.assignmentsList(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        status: params.status,
        page: params.page.toString(),
        limit: params.limit.toString(),
      });

      const { data } = await api.get<AssignmentsApiResponse>(
        `/todo/assignments?${queryParams}`
      );

      if (!data.success) {
        throw new Error('Failed to fetch assignments');
      }

      return data.data ?? [];
    },
    staleTime: 60000, // 1 minute
  });
};