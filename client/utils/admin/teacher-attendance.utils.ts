

import { ITeacherAttendance } from "@/types/admin/teacher-attendance.types";


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
  if (formatStr === "MM/dd/yyyy") {
    return `${month}/${day}/${year}`;
  }
  return date.toDateString();
};


export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


export const formatDateTime = (date: Date): string => {
  return `${formatDate(date, "dd-MM-yyyy")} ${formatTime(date)}`;
};


export const convertTeacherAttendanceToCSV = (
  data: ITeacherAttendance[]
): string => {
  if (data.length === 0) {
    return "No data to export";
  }

  const headers = [
    "Teacher Name",
    "Email",
    "Grade",
    "Status",
    "Date",
    "Time",
    "Remarks",
  ];

  const csvRows = [
    headers.join(","),
    ...data.map((item) => {
      const date = formatDate(new Date(item.date), "dd-MM-yyyy");
      const time = formatTime(new Date(item.createdAt));
      const gradeName = item.gradeId ? item.gradeId.grade : "N/A";
      const remarks = item.remarks || "-";

      return [
        `"${item.studentId.name}"`,
        `"${item.studentId.email}"`,
        `"${gradeName}"`,
        `"${item.status}"`,
        `"${date}"`,
        `"${time}"`,
        `"${remarks}"`,
      ].join(",");
    }),
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


export const generateTeacherAttendanceFilename = (
  status?: string,
  startDate?: Date,
  endDate?: Date
): string => {
  const today = formatDate(new Date(), "yyyy-MM-dd");
  
  if (startDate && endDate) {
    const start = formatDate(startDate, "yyyy-MM-dd");
    const end = formatDate(endDate, "yyyy-MM-dd");
    return `teacher-attendance-${start}-to-${end}.csv`;
  }
  
  if (status && status !== "all") {
    return `teacher-attendance-${status}-${today}.csv`;
  }
  
  return `teacher-attendance-${today}.csv`;
};


export const calculateAttendanceRate = (
  present: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100 * 10) / 10; 
};


export const getStatusColorClass = (
  status: string
): { bg: string; text: string } => {
  const statusColors: Record<
    string,
    { bg: string; text: string }
  > = {
    present: { bg: "bg-green-100", text: "text-green-800" },
    absent: { bg: "bg-red-100", text: "text-red-800" },
    late: { bg: "bg-yellow-100", text: "text-yellow-800" },
    excused: { bg: "bg-blue-100", text: "text-blue-800" },
  };

  return (
    statusColors[status.toLowerCase()] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
    }
  );
};


export const getStatusGradient = (status: string): string => {
  const gradients: Record<string, string> = {
    present: "from-green-500 to-green-700",
    absent: "from-red-500 to-red-700",
    late: "from-yellow-500 to-orange-500",
    excused: "from-blue-500 to-blue-700",
  };

  return gradients[status.toLowerCase()] || "from-gray-500 to-gray-700";
};


export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};


export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};


export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
};


export const getDateRange = (
  period: "today" | "week" | "month" | "year"
): { startDate: Date; endDate: Date } => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);

  let startDate = new Date(today);
  startDate.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      
      break;
    case "week":
      startDate.setDate(today.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(today.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(today.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
};


export const groupByDate = (
  records: ITeacherAttendance[]
): Record<string, ITeacherAttendance[]> => {
  return records.reduce(
    (acc, record) => {
      const dateKey = formatDate(new Date(record.date), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(record);
      return acc;
    },
    {} as Record<string, ITeacherAttendance[]>
  );
};


export const groupByTeacher = (
  records: ITeacherAttendance[]
): Record<string, ITeacherAttendance[]> => {
  return records.reduce(
    (acc, record) => {
      const teacherId = record.studentId._id;
      if (!acc[teacherId]) {
        acc[teacherId] = [];
      }
      acc[teacherId].push(record);
      return acc;
    },
    {} as Record<string, ITeacherAttendance[]>
  );
};


export const calculateStats = (
  records: ITeacherAttendance[]
): {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
} => {
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const attendanceRate = calculateAttendanceRate(present + late, total);

  return {
    total,
    present,
    absent,
    late,
    excused,
    attendanceRate,
  };
};


export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};


export const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};


export const getMonthName = (date: Date, format: "short" | "long" = "long"): string => {
  return date.toLocaleString("en-US", { month: format });
};


export const getDayName = (date: Date, format: "short" | "long" = "long"): string => {
  return date.toLocaleString("en-US", { weekday: format });
};


export const parseDate = (dateString: string): Date | null => {
  if (!isValidDateString(dateString)) {
    return null;
  }
  return new Date(dateString);
};


export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};