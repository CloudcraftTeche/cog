"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { assignmentService } from "@/lib/admin/api/assignment.service";
import { IAssignmentReportRow } from "@/types/admin/assignment.types";

export const assignmentReportKeys = {
  all: ["assignmentReport"] as const,
  list: (params: {
    page: number;
    limit: number | "all";
    search: string;
    grade: string;
    status: string;
  }) => [...assignmentReportKeys.all, params] as const,
};

export const useAssignmentReport = (params: {
  search: string;
  grade: string;
  status: string;
  limit?: number | "all";
}) => {
  const limit = params.limit ?? 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [params.search, params.grade, params.status, limit]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: assignmentReportKeys.list({
      page,
      limit,
      search: params.search,
      grade: params.grade,
      status: params.status,
    }),
    queryFn: () =>
      assignmentService.getAssignmentReport({
        page,
        limit,
        search: params.search,
        grade: params.grade,
        status: params.status,
      }),
    staleTime: 60 * 1000,
  });

  return {
    rows: data?.data || [],
    pagination: data?.pagination,
    loading: isLoading,
    error,
    page,
    setPage,
    refetch,
  };
};

export const useExportAssignmentReport = () => {
  return useMutation({
    mutationFn: async (params: {
      search: string;
      grade: string;
      status: string;
    }) => {
      const { data } = await assignmentService.getAssignmentReport({
        ...params,
        limit: 2000,
      });
      if (!data || data.length === 0) {
        throw new Error("No data to export");
      }
      const rows = data as IAssignmentReportRow[];
      const excelRows = rows.map((r) => ({
        "Student Name": r.studentName,
        Grade: r.gradeName,
        "Assignment Name": r.assignmentName,
        Status: r.status === "completed" ? "Completed" : "Pending",
        Marks:
          r.marks !== null
            ? `${r.marks}${r.totalMarks ? ` / ${r.totalMarks}` : ""}`
            : "",
        "Review Suggestion": r.feedback || "",
        "Assignment Created Date": r.assignmentCreatedAt
          ? new Date(r.assignmentCreatedAt).toLocaleDateString()
          : "",
        "Submission Date": r.submittedAt
          ? new Date(r.submittedAt).toLocaleDateString()
          : "",
        Attachment: r.attachmentUrl || "",
      }));
      const ws = XLSX.utils.json_to_sheet(excelRows);
      ws["!cols"] = [
        { wch: 24 },
        { wch: 12 },
        { wch: 30 },
        { wch: 14 },
        { wch: 14 },
        { wch: 30 },
        { wch: 20 },
        { wch: 20 },
        { wch: 40 },
      ];
      const attachmentCol = 8;
      rows.forEach((r, idx) => {
        if (!r.attachmentUrl) return;
        const cellRef = XLSX.utils.encode_cell({ r: idx + 1, c: attachmentCol });
        ws[cellRef] = {
          t: "s",
          v: "Download",
          l: { Target: r.attachmentUrl, Tooltip: "Open attachment" },
        };
      });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Assignment Report");
      const fileName = `assignment-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      return { fileName, count: rows.length };
    },
    onSuccess: ({ fileName, count }) => {
      toast.success(`Report exported: ${fileName} (${count} rows)`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to export report");
    },
  });
};
