// lib/utils/student.utils.ts

import {
  Student,
  StudentProgress,
  Grade,
  ExcelExportData,
  DetailedExcelData,
} from "@/types/admin/student.types";
import * as XLSX from "xlsx";

/**
 * Get initials from full name
 */
export const getInitials = (name: string): string => {
  if (!name) return "S";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format date to localized string
 */
export const formatDate = (date?: string): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (birthDate: string): string => {
  if (!birthDate) return "";
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const actualAge =
    monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())
      ? age - 1
      : age;
  return `${actualAge} years old`;
};

/**
 * Get gradient class for student card
 */
export const getCardGradient = (index: number): string => {
  const gradients = [
    "from-rose-400 to-pink-500",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-purple-400 to-violet-500",
    "from-cyan-400 to-sky-500",
  ];
  return gradients[index % gradients.length];
};

/**
 * Format address to string
 */
export const formatAddress = (
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  } | null
): string => {
  if (!address) return "N/A";
  const parts = [
    address.street,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ").trim() : "N/A";
};

/**
 * Prepare Excel export data
 */
export const prepareExcelData = (
  students: Array<{ student: Student; progress: StudentProgress | null }>,
  grades: Grade[]
): { summary: ExcelExportData[]; detailed: DetailedExcelData[] } => {
  const summaryData: ExcelExportData[] = students.map(
    ({ student, progress }) => {
      const gradeName =
        grades.find((g) => g._id === student.gradeId)?.grade || "N/A";

      return {
        Name: student.name,
        "Roll Number": student.rollNumber || "N/A",
        Email: student.email,
        Grade: gradeName,
        Gender: student.gender || "N/A",
        "Date of Birth": student.dateOfBirth
          ? new Date(student.dateOfBirth).toLocaleDateString()
          : "N/A",
        "Parent Contact": student.parentContact || "N/A",
        Address: formatAddress(student.address),
        "Total Chapters": progress?.totalChapters || 0,
        "Completed Chapters": progress?.completedCount || 0,
        "Remaining Chapters": progress?.notCompletedChapters || 0,
        "Completion Percentage": progress?.completionPercentage
          ? `${progress.completionPercentage}%`
          : "0%",
      };
    }
  );

  const detailedData: DetailedExcelData[] = [];
  students.forEach(({ student, progress }) => {
    if (progress && progress.completedChapters.length > 0) {
      progress.completedChapters.forEach((chapter) => {
        detailedData.push({
          "Student Name": student.name,
          "Roll Number": student.rollNumber || "N/A",
          "Chapter Number": chapter.chapterNumber,
          "Chapter Title": chapter.chapterTitle,
          "Completed Date": new Date(chapter.completedAt).toLocaleDateString(),
          Score: chapter.score !== undefined ? `${chapter.score}%` : "N/A",
        });
      });
    }
  });

  return { summary: summaryData, detailed: detailedData };
};

/**
 * Export students data to Excel
 */
export const exportStudentsToExcel = (
  summaryData: ExcelExportData[],
  detailedData: DetailedExcelData[]
): void => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Students Summary");

  // Detailed progress sheet
  if (detailedData.length > 0) {
    const detailedWs = XLSX.utils.json_to_sheet(detailedData);
    XLSX.utils.book_append_sheet(wb, detailedWs, "Detailed Progress");
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `students_progress_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(wb, filename);
};




/**
 * Scroll to first error field
 */
export const scrollToError = (errors: Record<string, string>): void => {
  const firstErrorField = Object.keys(errors)[0];
  const element = document.getElementById(
    firstErrorField.replace("address.", "")
  );
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
};


import { StudentFormData, FormErrors } from "@/types/admin/student.types";

export const prepareFormData = (
  formData: StudentFormData,
  profilePicture: File | null
): FormData => {
  const formDataObj = new FormData();

  formDataObj.append("name", formData.name.trim());
  formDataObj.append("email", formData.email.trim().toLowerCase());
  formDataObj.append("gradeId", formData.gradeId);
  formDataObj.append("gender", formData.gender.toLowerCase());
  formDataObj.append("dateOfBirth", formData.dateOfBirth);
  formDataObj.append("parentContact", formData.parentContact.trim());

  if (formData.rollNumber?.trim()) {
    formDataObj.append("rollNumber", formData.rollNumber.trim());
  }

  Object.entries(formData.address).forEach(([key, value]) => {
    formDataObj.append(`address[${key}]`, value.trim());
  });

  if (profilePicture) {
    formDataObj.append("profilePicture", profilePicture);
  }

  return formDataObj;
};

export const parseBackendErrors = (errors: any[]): FormErrors => {
  const backendErrors: FormErrors = {};
  errors.forEach((err: any) => {
    if (err.field) {
      backendErrors[err.field] = err.message;
    }
  });
  return backendErrors;
};

export const scrollToFirstError = (errors: FormErrors): void => {
  const firstErrorField = Object.keys(errors)[0];
  if (!firstErrorField) return;
  
  const element = document.getElementById(
    firstErrorField.replace("address.", "")
  );
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
};