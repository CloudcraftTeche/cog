// hooks/use-student.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  StudentResponse,
  StudentUpdateResponse,
  StudentUpdatePayload,
} from "@/types/student/student.types";
import { createFormDataFromStudent } from "@/utils/student/student-utils";
// Query Keys
export const studentKeys = {
  all: ["students"] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};

// Fetch student by ID
export function useStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: studentKeys.detail(studentId ?? ""),
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      const response = await api.get<StudentResponse>(`/students/${studentId}`);
      return response.data;
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Update student
export function useUpdateStudent(studentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StudentUpdatePayload & { profileImage?: File }) => {
      if (!studentId) throw new Error("Student ID is required");

      const formData = createFormDataFromStudent(
        {
          name: payload.name ?? "",
          email: payload.email ?? "",
          phone: payload.phone,
          rollNumber: payload.rollNumber,
          gradeId: payload.gradeId,
          gender: payload.gender,
          dateOfBirth: payload.dateOfBirth,
          parentContact: payload.parentContact,
          address: payload.address ?? {
            street: "",
            city: "",
            state: "",
            country: "India",
            postalCode: "",
          },
          profilePictureUrl: payload.profilePictureUrl,
        },
        payload.profileImage
      );

      const response = await api.put<StudentUpdateResponse>(
        `/students/${studentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(studentId ?? "") });
      queryClient.setQueryData(studentKeys.detail(studentId ?? ""), data);
    },
  });
}