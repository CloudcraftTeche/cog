import { AttendanceRecord } from "@/types/admin/attendance.types";


export const convertAttendanceToCSV = (data: AttendanceRecord[]): string => {
  if (data.length === 0) return "No data to export";

  const headers = [
    "Student Name",
    "Student Email",
    "Grade",
    "Teacher Name",
    "Teacher Email",
    "Date",
    "Status",
    "Remarks",
  ];

  const csvRows = [
    headers.join(","),
    ...data.map((record) =>
      [
        `"${record.studentId?.name || "N/A"}"`,
        `"${record.studentId?.email || "N/A"}"`,
        `"${record.gradeId?.grade || "N/A"}"`,
        `"${record.teacherId?.name || "N/A"}"`,
        `"${record.teacherId?.email || "N/A"}"`,
        `"${new Date(record.date).toLocaleDateString()}"`,
        `"${record.status}"`,
        `"${record.remarks || "-"}"`,
      ].join(",")
    ),
  ];

  return csvRows.join("\n");
};

export const downloadCSV = (csvData: string, filename: string): void => {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateExportFilename = (status: string): string => {
  const date = new Date().toISOString().split("T")[0];
  return `attendance-${status}-${date}.csv`;
};