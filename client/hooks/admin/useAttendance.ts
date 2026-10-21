"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import {
  AttendanceStats,
  HeatmapData,
  AttendanceRecord,
  StudentAttendanceReport,
  StudentAttendanceReportRow,
  StudentReportFilters,
} from "@/types/admin/attendance.types";
import { toast } from "sonner";

export const attendanceKeys = {
  all: ["attendance"] as const,
  stats: () => [...attendanceKeys.all, "stats"] as const,
  heatmap: () => [...attendanceKeys.all, "heatmap"] as const,
  records: () => [...attendanceKeys.all, "records"] as const,
  export: (filters: { status: string; startDate?: string; endDate?: string }) =>
    [...attendanceKeys.all, "export", filters] as const,
  report: (filters: StudentReportFilters & { page: number; limit: number }) =>
    [...attendanceKeys.all, "report", filters] as const,
};

const reportParams = ({ startDate, endDate, gradeId }: StudentReportFilters) => {
  const params: Record<string, string> = {};
  if (startDate && endDate) {
    params.startDate = startDate;
    params.endDate = endDate;
  }
  if (gradeId) params.gradeId = gradeId;
  return params;
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

export const useStudentAttendanceReport = (
  filters: StudentReportFilters & { page: number; limit?: number },
  enabled = true,
) => {
  const { startDate, endDate, gradeId, page, limit = 25 } = filters;
  return useQuery({
    enabled,
    queryKey: attendanceKeys.report({ startDate, endDate, gradeId, page, limit }),
    queryFn: async (): Promise<StudentAttendanceReport> => {
      const { data } = await api.get("/attendance/report", {
        params: { ...reportParams({ startDate, endDate, gradeId }), page, limit },
      });
      return data.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
};

// Fetches every row that matches the filters, for the CSV export.
export const useExportStudentAttendanceReport = () => {
  return useMutation({
    mutationFn: async (filters: StudentReportFilters): Promise<StudentAttendanceReportRow[]> => {
      const { data } = await api.get("/attendance/report", {
        params: { ...reportParams(filters), all: true },
      });
      return data.data.rows;
    },
    onError: (error: Error) => {
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || error.message || "Failed to export report");
    },
  });
};
