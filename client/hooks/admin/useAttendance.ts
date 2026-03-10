"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { AttendanceStats, HeatmapData, AttendanceRecord } from "@/types/admin/attendance.types";
import { toast } from "sonner";

export const attendanceKeys = {
  all: ["attendance"] as const,
  stats: () => [...attendanceKeys.all, "stats"] as const,
  heatmap: () => [...attendanceKeys.all, "heatmap"] as const,
  records: () => [...attendanceKeys.all, "records"] as const,
  export: (filters: { status: string; startDate?: string; endDate?: string }) =>
    [...attendanceKeys.all, "export", filters] as const,
};

export const useAttendanceStats = () => {
  return useQuery({
    queryKey: attendanceKeys.stats(),
    queryFn: async (): Promise<AttendanceStats> => {
      const { data } = await api.get("/attendance/stats");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useAttendanceHeatmap = () => {
  return useQuery({
    queryKey: attendanceKeys.heatmap(),
    queryFn: async (): Promise<HeatmapData[]> => {
      const { data } = await api.get("/attendance/heatmap");
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useAttendanceRecords = (limit = 50) => {
  return useQuery({
    queryKey: [...attendanceKeys.records(), limit],
    queryFn: async (): Promise<AttendanceRecord[]> => {
      const { data } = await api.get("/attendance/export?status=all");
      return data?.slice(0, limit) || [];
    },
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
};

export const useExportAttendance = () => {
  return useMutation({
    mutationFn: async ({
      status,
      startDate,
      endDate,
    }: {
      status: string;
      startDate?: string;
      endDate?: string;
    }): Promise<AttendanceRecord[]> => {
      let url = `/attendance/export?status=${status}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const { data } = await api.get(url);
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to export data");
    },
  });
};

export const useRefreshAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: attendanceKeys.stats() }),
        queryClient.invalidateQueries({ queryKey: attendanceKeys.heatmap() }),
        queryClient.invalidateQueries({ queryKey: attendanceKeys.records() }),
      ]);
    },
    onSuccess: () => {
      toast.success("Data refreshed successfully");
    },
    onError: () => {
      toast.error("Failed to refresh data");
    },
  });
};