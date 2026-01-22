// hooks/use-teacher-chapters.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  TeacherChapter,
  Grade,
  CreateTeacherChapterPayload,
  UpdateTeacherChapterPayload,
  FetchChaptersParams,
  ChaptersResponse,
  GradesResponse,
  ChapterResponse,
} from "@/types/admin/teacher-chapter.types";

// Query Keys
export const teacherChapterKeys = {
  all: ["teacher-chapters"] as const,
  lists: () => [...teacherChapterKeys.all, "list"] as const,
  list: (params: FetchChaptersParams) => [...teacherChapterKeys.lists(), params] as const,
  details: () => [...teacherChapterKeys.all, "detail"] as const,
  detail: (id: string) => [...teacherChapterKeys.details(), id] as const,
};

export const gradeKeys = {
  all: ["grades"] as const,
  lists: () => [...gradeKeys.all, "list"] as const,
};

// Fetch Grades
export function useGrades() {
  return useQuery({
    queryKey: gradeKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<GradesResponse>("/grades/all");
      const gradesData = data.data || [];
      
      return gradesData.sort((a: Grade, b: Grade) => {
        const gradeA = parseInt(a.grade.replace(/\D/g, "")) || 0;
        const gradeB = parseInt(b.grade.replace(/\D/g, "")) || 0;
        return gradeA - gradeB;
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch Teacher Chapters List
export function useTeacherChapters(params: FetchChaptersParams = {}) {
  return useQuery({
    queryKey: teacherChapterKeys.list(params),
    queryFn: async () => {
      const queryParams = {
        page: params.page || 1,
        limit: params.limit || 100,
        ...(params.search && { search: params.search }),
      };
      
      const { data } = await api.get<ChaptersResponse>("/teacher-chapters", {
        params: queryParams,
      });
      
      return data.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Fetch Single Teacher Chapter
export function useTeacherChapter(id: string) {
  return useQuery({
    queryKey: teacherChapterKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ChapterResponse>(`/teacher-chapters/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// Create Teacher Chapter
export function useCreateTeacherChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTeacherChapterPayload) => {
      const { data } = await api.post("/teacher-chapters", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherChapterKeys.lists() });
      toast.success("Teacher Chapter Created!", {
        description: `The chapter has been created for ${variables.gradeIds.length} grade(s).`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "An error occurred during upload.";
      toast.error("Upload Failed", {
        description: errorMessage,
      });
    },
  });
}

// Update Teacher Chapter
export function useUpdateTeacherChapter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateTeacherChapterPayload) => {
      const { data } = await api.put(`/teacher-chapters/${id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherChapterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teacherChapterKeys.detail(id) });
      toast.success("Chapter updated successfully", {
        description: "The chapter has been updated with your changes",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update chapter";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    },
  });
}

// Delete Teacher Chapter
export function useDeleteTeacherChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: string) => {
      const { data } = await api.delete(`/teacher-chapters/${chapterId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherChapterKeys.lists() });
      toast.success("Teacher chapter deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete chapter");
    },
  });
}