"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  ITeacher,
  ITeacherAttendance,
  AttendanceStatus,
  TeacherAttendanceStats,
  TeacherAttendanceHeatmapData,
} from "@/types/admin/teacher-attendance.types";
import { toast } from "sonner";
export const teacherAttendanceKeys = {
  all: ["teacherAttendance"] as const,
  teachers: () => ["teachers"] as const,
  stats: () => [...teacherAttendanceKeys.all, "stats"] as const,
  heatmap: () => [...teacherAttendanceKeys.all, "heatmap"] as const,
  today: () => [...teacherAttendanceKeys.all, "today"] as const,
  byDate: (date: Date) => [
    ...teacherAttendanceKeys.all,
    "byDate",
    date.toISOString(),
  ] as const,
  byGrade: (gradeId: string, startDate?: Date, endDate?: Date) =>
    [
      ...teacherAttendanceKeys.all,
      "byGrade",
      gradeId,
      startDate?.toISOString(),
      endDate?.toISOString(),
    ] as const,
  export: (filters: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    gradeId?: string;
  }) => [...teacherAttendanceKeys.all, "export", filters] as const,
};
export const useTeachers = () => {
  return useQuery({
    queryKey: teacherAttendanceKeys.teachers(),
    queryFn: async (): Promise<ITeacher[]> => {
      const { data } = await api.get("/teachers");
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};
export const useTeacherAttendanceStats = () => {
  return useQuery({
    queryKey: teacherAttendanceKeys.stats(),
    queryFn: async (): Promise<TeacherAttendanceStats> => {
      const { data } = await api.get("/teacher-attendance/stats");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
export const useTeacherAttendanceHeatmap = () => {
  return useQuery({
    queryKey: teacherAttendanceKeys.heatmap(),
    queryFn: async (): Promise<TeacherAttendanceHeatmapData[]> => {
      const { data } = await api.get("/teacher-attendance/heatmap");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
export const useTodayTeacherAttendance = () => {
  return useQuery({
    queryKey: teacherAttendanceKeys.today(),
    queryFn: async (): Promise<ITeacherAttendance[]> => {
      const { data } = await api.get("/teacher-attendance/today");
      return data;
    },
    staleTime: 1 * 60 * 1000,
    retry: 2,
  });
};
export const useTeacherAttendanceByDate = (date: Date) => {
  return useQuery({
    queryKey: teacherAttendanceKeys.byDate(date),
    queryFn: async (): Promise<ITeacherAttendance[]> => {
      const { data } = await api.get("/teacher-attendance/by-date", {
        params: { date: date.toISOString() },
      });
      return data;
    },
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
};
export const useMarkTeacherAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teacherId,
      status,
      gradeId,
      remarks,
      date,
    }: {
      teacherId: string;
      status: AttendanceStatus;
      gradeId?: string;
      remarks?: string;
      date?: Date;
    }) => {
      const { data } = await api.post("/teacher-attendance", {
        teacherId,
        status,
        gradeId,
        remarks,
        date: date ? date.toISOString() : undefined,
      });
      return data;
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: teacherAttendanceKeys.stats() });
      queryClient.invalidateQueries({ queryKey: teacherAttendanceKeys.today() });
      if (date) {
        queryClient.invalidateQueries({
          queryKey: teacherAttendanceKeys.byDate(date),
        });
      }
      toast.success("Attendance marked successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Failed to mark teacher attendance"
      );
    },
  });
};
export const useExportTeacherAttendance = () => {
  return useMutation({
    mutationFn: async ({
      status,
      startDate,
      endDate,
      gradeId,
    }: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      gradeId?: string;
    }): Promise<ITeacherAttendance[]> => {
      const params: any = {};
      if (status && status !== "all") {
        params.status = status;
      }
      if (startDate) {
        params.startDate = startDate.toISOString();
      }
      if (endDate) {
        params.endDate = endDate.toISOString();
      }
      if (gradeId) {
        params.gradeId = gradeId;
      }
      const { data } = await api.get("/teacher-attendance/export", { params });
      return data;
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Failed to export teacher attendance"
      );
    },
  });
};
export const useDeleteTeacherAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attendanceId: string) => {
      await api.delete(`/teacher-attendance/${attendanceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherAttendanceKeys.all });
      toast.success("Attendance record deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error || "Failed to delete teacher attendance"
      );
    },
  });
};
export const formatDate = (date: Date, formatStr: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (formatStr === "yyyy-MM-dd") {
    return `${year}-${month}-${day}`;
  }
  if (formatStr === "dd-MM-yyyy") {
    return `${day}-${month}-${year}`;
  }
  return date.toDateString();
};
export const convertTeacherAttendanceToCSV = (
  data: ITeacherAttendance[]
): string => {
  const header = "Teacher Name,Email,Grade,Status,Date,Time\n";
  const rows = data
    .map((item) => {
      const date = formatDate(new Date(item.date), "dd-MM-yyyy");
      const time = new Date(item.createdAt).toLocaleTimeString();
      const gradeName = item.gradeId ? item.gradeId.grade : "N/A";
      return `"${item.studentId.name}","${item.studentId.email}","${gradeName}","${item.status}","${date}","${time}"`;
    })
    .join("\n");
  return header + rows;
};
export const downloadCSV = (csvData: string, filename: string): void => {
  const blob = new Blob([csvData], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};