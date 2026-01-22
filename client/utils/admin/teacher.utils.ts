// lib/utils/teacher.utils.ts

import { ITeacher, Grade } from "@/types/admin/teacher.types";

/**
 * Get initials from teacher name
 */
export const getInitials = (name: string): string => {
  if (!name) return "T";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get card gradient color by index
 */
export const getCardGradient = (index: number): string => {
  const cardColors = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-green-500 to-emerald-400",
    "from-orange-500 to-red-400",
    "from-indigo-500 to-purple-400",
    "from-teal-500 to-blue-400",
  ];
  return cardColors[index % cardColors.length];
};

/**
 * Get grade name from gradeId
 */
export const getGradeName = (
  gradeId: string | Grade | undefined,
  grades: Grade[]
): string => {
  if (!gradeId) return "Not assigned";

  // If gradeId is an object with grade property
  if (typeof gradeId === "object" && "grade" in gradeId) {
    return gradeId.grade;
  }

  // If gradeId is a string, find the grade
  const grade = grades.find((g) => g._id === gradeId);
  return grade?.grade || "Not assigned";
};

/**
 * Prepare form data for API submission
 */
export const prepareTeacherFormData = (
  formData: any,
  profilePicture: File | null
): FormData => {
  const formDataObj = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    if (key === "address") {
      Object.entries(value as Record<string, string>).forEach(([k, v]) => {
        formDataObj.append(`address[${k}]`, String(v));
      });
    } else {
      formDataObj.append(key, value as string);
    }
  });

  if (profilePicture) {
    formDataObj.append("profilePicture", profilePicture);
  }

  return formDataObj;
};

/**
 * Parse teacher data for form
 */
export const parseTeacherForForm = (teacher: ITeacher): any => {
  return {
    name: teacher.name || "",
    email: teacher.email || "",
    phone: teacher.phone || "",
    gender: teacher.gender || "",
    dateOfBirth: teacher.dateOfBirth
      ? new Date(teacher.dateOfBirth).toISOString().split("T")[0]
      : "",
    gradeId:
      typeof teacher.gradeId === "object" ? teacher.gradeId._id : teacher.gradeId || "",
    qualifications: teacher.qualifications || "",
    specializations: teacher.specializations?.join(", ") || "",
    address: {
      street: teacher.address?.street || "",
      city: teacher.address?.city || "",
      state: teacher.address?.state || "",
      country: teacher.address?.country || "India",
      postalCode: teacher.address?.postalCode || "",
    },
  };
};

/**
 * Format teacher display info
 */
export const getTeacherDisplayInfo = (teacher: ITeacher): {
  name: string;
  email: string;
  phone: string;
  grade: string;
} => {
  return {
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone || "Not provided",
    grade:
      typeof teacher.gradeId === "object"
        ? teacher.gradeId.grade
        : "Not assigned",
  };
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