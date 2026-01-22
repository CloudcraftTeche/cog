"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { GradeWithStats } from "@/types/admin/grade.types";
import { toast } from "sonner";
import * as XLSX from "xlsx";
export const gradeReportKeys = {
  all: ["gradeReports"] as const,
  completion: (params: { page: number; limit: number; query?: string }) =>
    [...gradeReportKeys.all, "completion", params] as const,
};
export const useGradeCompletionReport = (
  page: number,
  limit = 10,
  searchQuery = ""
) => {
  return useQuery({
    queryKey: gradeReportKeys.completion({ page, limit, query: searchQuery }),
    queryFn: async () => {
      const { data } = await api.get("/grades/completion-report", {
        params: { page, limit, query: searchQuery },
      });
      return {
        data: data.data as GradeWithStats[],
        pagination: data.pagination as {
          total: number;
          totalPages: number;
          currentPage: number;
          limit: number;
        },
      };
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};
export const useExportGradeReport = () => {
  return useMutation({
    mutationFn: async (singleGrade?: GradeWithStats) => {
      let gradesToExport: GradeWithStats[] = [];
      if (singleGrade) {
        gradesToExport = [singleGrade];
      } else {
        const { data } = await api.get("/grades/completion-report", {
          params: { limit: 100 },
        });
        gradesToExport = data.data;
      }
      if (gradesToExport.length === 0) {
        throw new Error("No data to export");
      }
      const excelData = gradesToExport.map((grade) => ({
        Grade: grade.grade,
        "Academic Year": grade.academicYear || "N/A",
        "Teacher(s)":
          (grade.teachers ?? []).length > 0
            ? grade.teachers!.join(", ")
            : "No teachers assigned",
        "Total Students": grade.totalStudents,
        "Total Chapters": grade.totalChapters,
        "Average Chapter Completion %": `${grade.averageChapterCompletion}%`,
        "Fully Completed Chapters": grade.completedChapters,
        "Partially Completed Chapters": grade.partiallyCompletedChapters,
        "Not Started Chapters": grade.notStartedChapters,
        "Total Assignments": grade.totalAssignments,
        "Active Assignments": grade.activeAssignments,
        "Total Submissions": grade.totalSubmissions,
        "Graded Submissions": grade.gradedSubmissions,
        "Pending Submissions": grade.pendingSubmissions,
        "Average Assignment Score": `${grade.averageAssignmentScore}`,
        "Attendance Records": grade.totalAttendanceRecords,
        "Attendance Rate %": `${grade.attendanceRate}%`,
        Present: grade.presentCount,
        Absent: grade.absentCount,
        Late: grade.lateCount,
        Excused: grade.excusedCount,
        Status: grade.isActive ? "Active" : "Inactive",
      }));
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws["!cols"] = [
        { wch: 10 },
        { wch: 15 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 28 },
        { wch: 25 },
        { wch: 28 },
        { wch: 22 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
        { wch: 25 },
        { wch: 20 },
        { wch: 18 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Grade Completion Report");
      const fileName = singleGrade
        ? `Grade_${singleGrade.grade}_Complete_Report_${new Date().toISOString().split("T")[0]}.xlsx`
        : `All_Grades_Complete_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      return { fileName, count: gradesToExport.length };
    },
    onSuccess: ({ fileName, count }) => {
      toast.success(`Report exported successfully: ${fileName} (${count} grades)`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to export report");
    },
  });
};