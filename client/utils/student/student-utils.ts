// lib/student-utils.ts

import { IStudent, StudentFormData } from "@/types/student/student.types";


export function formatStudentData(studentData: IStudent): StudentFormData {
  return {
    name: studentData.name || "",
    email: studentData.email || "",
    phone: studentData.phone || "",
    rollNumber: studentData.rollNumber || "",
    gradeId: studentData.gradeId || "",
    gender: studentData.gender,
    dateOfBirth: studentData.dateOfBirth
      ? studentData.dateOfBirth.split("T")[0]
      : "",
    parentContact: studentData.parentContact || "",
    address: {
      street: studentData.address?.street || "",
      city: studentData.address?.city || "",
      state: studentData.address?.state || "",
      country: studentData.address?.country || "India",
      postalCode: studentData.address?.postalCode || "",
    },
    profilePictureUrl: studentData.profilePictureUrl || "",
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "Image size should be less than 5MB" };
  }

  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Please select a valid image file" };
  }

  return { valid: true };
}

export function createFormDataFromStudent(
  student: StudentFormData,
  profileImage?: File | null
): FormData {
  const formData = new FormData();

  Object.entries(student).forEach(([key, value]) => {
    if (key === "address") {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value.toString());
    }
  });

  if (profileImage) {
    formData.append("profilePicture", profileImage);
  }

  return formData;
}