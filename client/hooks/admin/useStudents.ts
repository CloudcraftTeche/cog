// hooks/queries/useStudents.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Student,
  StudentProgress,
  Grade,
  StudentListParams,
  StudentListResponse,
} from "@/types/admin/student.types";
import { prepareFormData, parseBackendErrors } from "@/utils/admin/student.utils";
import { toast } from "sonner";

// ===== QUERY KEYS =====
export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (params: StudentListParams) =>
    [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  progress: (id: string) => [...studentKeys.all, "progress", id] as const,
  grades: () => ["grades", "all"] as const,
};

// ===== STUDENTS LIST QUERY =====
export const useStudents = (params: StudentListParams) => {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: async (): Promise<StudentListResponse> => {
      const { data } = await api.get("/students", { params });
      return {
        data: data.data,
        total: data.total,
        page: params.page,
        totalPages: Math.ceil(data.total / params.limit),
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// ===== STUDENT DETAIL QUERY =====
export const useStudent = (id: string | null) => {
  return useQuery({
    queryKey: studentKeys.detail(id || ""),
    queryFn: async (): Promise<Student> => {
      if (!id) throw new Error("Student ID is required");
      const { data } = await api.get(`/students/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// ===== STUDENT PROGRESS QUERY =====
export const useStudentProgress = (id: string | null) => {
  return useQuery({
    queryKey: studentKeys.progress(id || ""),
    queryFn: async (): Promise<StudentProgress> => {
      if (!id) throw new Error("Student ID is required");
      const { data } = await api.get(`/students/${id}/progress`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute - progress changes frequently
  });
};

// ===== GRADES QUERY =====
export const useGrades = () => {
  return useQuery({
    queryKey: studentKeys.grades(),
    queryFn: async (): Promise<Grade[]> => {
      const { data } = await api.get("/grades/all");
      return data.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - grades don't change often
  });
};

// ===== CREATE STUDENT MUTATION =====
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      profilePicture,
    }: {
      formData: any;
      profilePicture: File | null;
    }) => {
      const formDataObj = prepareFormData(formData, profilePicture);
      const { data } = await api.post("/students", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success("Student created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create student";
      toast.error(errorMessage);

      // Return backend errors for form handling
      if (error.response?.data?.errors) {
        return parseBackendErrors(error.response.data.errors);
      }
    },
  });
};

// ===== UPDATE STUDENT MUTATION =====
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
      profilePicture,
    }: {
      id: string;
      formData: any;
      profilePicture: File | null;
    }) => {
      const formDataObj = prepareFormData(formData, profilePicture);
      const { data } = await api.put(`/students/${id}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
      toast.success("Student updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update student";
      toast.error(errorMessage);

      if (error.response?.data?.errors) {
        return parseBackendErrors(error.response.data.errors);
      }
    },
  });
};

// ===== DELETE STUDENT MUTATION =====
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success("Student deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete student");
    },
  });
};

// ===== BULK FETCH STUDENTS WITH PROGRESS =====
export const useBulkStudentsWithProgress = (params: StudentListParams) => {
  return useQuery({
    queryKey: [...studentKeys.list(params), "withProgress"],
    queryFn: async () => {
      // Fetch students
      const studentsResponse = await api.get("/students", {
        params: { ...params, limit: 100 },
      });
      const students = studentsResponse.data.data;

      // Fetch progress for each student
      const studentsWithProgress = await Promise.all(
        students.map(async (student: Student) => {
          try {
            const progressResponse = await api.get(
              `/students/${student._id}/progress`
            );
            return {
              student,
              progress: progressResponse.data.data,
            };
          } catch (error) {
            return {
              student,
              progress: null,
            };
          }
        })
      );

      return studentsWithProgress;
    },
    enabled: false, // Only run when manually triggered
    staleTime: 0, // Don't cache - always fresh for export
  });
};