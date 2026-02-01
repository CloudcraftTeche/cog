import { useQuery, UseQueryResult } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  DashboardApiResponse,
  DashboardData,
} from "@/types/admin/admindashboard.types";
export const dashboardKeys = {
  all: ["dashboard"] as const,
  admin: () => [...dashboardKeys.all, "admin"] as const,
};
const fetchAdminDashboard = async (): Promise<DashboardData> => {
  const response = await api.get<DashboardApiResponse>("/dashboard/admin");
  if (!response.data?.success) {
    throw new Error(response.data?.error || "Failed to fetch dashboard data");
  }
  return response.data.data;
};
export const useAdminDashboard = (): UseQueryResult<DashboardData, Error> => {
  return useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: fetchAdminDashboard,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
