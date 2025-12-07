import { format } from "date-fns";
import { IAttendance } from "./teacherAttendance.service";
export const convertAttendanceToCSV = (data: IAttendance[]) => {
    const header =
      "Student Name,Email,Roll Number,Grade,Status,Date,Time\n";
    const rows = data
      .map((item) => {
        let date = "N/A";
        try {
          if (item.date) {
            const dateObj = new Date(item.date);
            if (!isNaN(dateObj.getTime())) {
              date = format(dateObj, "dd-MM-yyyy");
            }
          }
        } catch (e) {
          console.error("Error formatting date:", e);
        }
        let time = "N/A";
        try {
          if (item.createdAt) {
            const timeObj = new Date(item.createdAt);
            if (!isNaN(timeObj.getTime())) {
              time = timeObj.toLocaleTimeString();
            }
          }
        } catch (e) {
          console.error("Error formatting time:", e);
        }
        let gradeName = "N/A";
        if (item.gradeId) {
          gradeName = item.gradeId.grade;
        } else if (item.studentId.gradeId) {
          gradeName =
            typeof item.studentId.gradeId === "object"
              ? item.studentId.gradeId.grade
              : "N/A";
        }
        return `"${item.studentId.name}","${item.studentId.email}","${
          item.studentId.rollNumber || "N/A"
        }","${gradeName}","${item.status}","${date}","${time}"`;
      })
      .join("\n");
    return header + rows;
  };
export const downloadCSV = (csvData: string, filename: string): void => {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
export const exportAttendanceToCSV = (
  data: IAttendance[],
  filename?: string
): void => {
  const csvData = convertAttendanceToCSV(data);
  const defaultFilename = `attendance-${format(new Date(), "yyyy-MM-dd")}.csv`;
  downloadCSV(csvData, filename || defaultFilename);
};
