// hooks/queries/useTeachers.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  ITeacher,
  Grade,
  TeacherListParams,
  TeacherListResponse,
} from "@/types/admin/teacher.types";
import {
  prepareTeacherFormData,
  parseTeacherForForm,
} from "@/utils/admin/teacher.utils";
import { toast } from "sonner";

// ===== QUERY KEYS =====
export const teacherKeys = {
  all: ["teachers"] as const,
  lists: () => [...teacherKeys.all, "list"] as const,
  list: (params: TeacherListParams) =>
    [...teacherKeys.lists(), params] as const,
  details: () => [...teacherKeys.all, "detail"] as const,
  detail: (id: string) => [...teacherKeys.details(), id] as const,
  grades: () => ["grades", "all"] as const,
};

// ===== TEACHERS LIST QUERY =====
export const useTeachers = (params: TeacherListParams) => {
  return useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: async (): Promise<TeacherListResponse> => {
      const { data } = await api.get<TeacherListResponse>("/teachers", {
        params,
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// ===== TEACHER DETAIL QUERY =====
export const useTeacher = (id: string | null) => {
  return useQuery({
    queryKey: teacherKeys.detail(id || ""),
    queryFn: async (): Promise<ITeacher> => {
      if (!id) throw new Error("Teacher ID is required");
      const { data } = await api.get<{ success: boolean; data: ITeacher }>(
        `/teachers/${id}`
      );
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// ===== GRADES QUERY =====
export const useGrades = () => {
  return useQuery({
    queryKey: teacherKeys.grades(),
    queryFn: async (): Promise<Grade[]> => {
      const { data } = await api.get<{ success: boolean; data: Grade[] }>(
        "/grades/all"
      );
      return data.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ===== CREATE TEACHER MUTATION =====
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      profilePicture,
    }: {
      formData: any;
      profilePicture: File | null;
    }) => {
      const formDataObj = prepareTeacherFormData(formData, profilePicture);
      const { data } = await api.post("/teachers", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      toast.success("Teacher created successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to create teacher";
      toast.error(errorMessage);
    },
  });
};

// ===== UPDATE TEACHER MUTATION =====
export const useUpdateTeacher = () => {
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
      const formDataObj = prepareTeacherFormData(formData, profilePicture);
      const { data } = await api.put(`/teachers/${id}`, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(id) });
      toast.success("Teacher updated successfully");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update teacher";
      toast.error(errorMessage);
    },
  });
};

// ===== DELETE TEACHER MUTATION =====
export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/teachers/${id}`, {
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      toast.success("Teacher deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete teacher. Please try again.");
    },
  });
};

// ===== HELPER HOOK: Use Teacher for Edit =====
export const useTeacherForEdit = (id: string | null) => {
  const { data: teacher, isLoading } = useTeacher(id);
  const { data: grades = [] } = useGrades();

  const formData = teacher ? parseTeacherForForm(teacher) : null;
  const previewUrl = teacher?.profilePictureUrl || "";

  return {
    teacher,
    formData,
    previewUrl,
    grades,
    isLoading,
  };
};