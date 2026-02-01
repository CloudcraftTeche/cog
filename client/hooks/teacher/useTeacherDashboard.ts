import { useQuery, UseQueryResult } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  DashboardData,
  DashboardResponse,
  CoverageData,
  Student,
  PendingAssignment,
} from "@/types/teacher/teacherDashboard.types";
export const dashboardKeys = {
  all: ["dashboard"] as const,
  teacher: () => [...dashboardKeys.all, "teacher"] as const,
  coverage: () => [...dashboardKeys.teacher(), "coverage"] as const,
  strugglingStudents: () => [...dashboardKeys.teacher(), "struggling"] as const,
  pendingGradings: () =>
    [...dashboardKeys.teacher(), "pending-gradings"] as const,
  weeklyActive: () => [...dashboardKeys.teacher(), "weekly-active"] as const,
};
export const useDashboardData = (): UseQueryResult<DashboardData, Error> => {
  return useQuery({
    queryKey: dashboardKeys.teacher(),
    queryFn: async () => {
      const response = await api.get<DashboardResponse>("/dashboard/teacher");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};
export const useSyllabusCoverage = (): UseQueryResult<
  CoverageData[],
  Error
> => {
  return useQuery({
    queryKey: dashboardKeys.coverage(),
    queryFn: async () => {
      const response = await api.get<DashboardResponse>("/dashboard/teacher");
      return response.data.data.charts?.syllabusCoverage ?? [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};
export const useStrugglingStudents = (): UseQueryResult<Student[], Error> => {
  return useQuery({
    queryKey: dashboardKeys.strugglingStudents(),
    queryFn: async () => {
      const response = await api.get<DashboardResponse>("/dashboard/teacher");
      return response.data.data.recentActivity?.strugglingStudents ?? [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
export const usePendingGradings = (): UseQueryResult<
  PendingAssignment[],
  Error
> => {
  return useQuery({
    queryKey: dashboardKeys.pendingGradings(),
    queryFn: async () => {
      const response = await api.get<DashboardResponse>("/dashboard/teacher");
      return response.data.data.recentActivity?.pendingGradings ?? [];
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
export const useWeeklyActiveStudents = (): UseQueryResult<number, Error> => {
  return useQuery({
    queryKey: dashboardKeys.weeklyActive(),
    queryFn: async () => {
      const response = await api.get<DashboardResponse>("/dashboard/teacher");
      return response.data.data.overview?.weeklyActiveStudents ?? 0;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
export const invalidateDashboardQueries = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
};
