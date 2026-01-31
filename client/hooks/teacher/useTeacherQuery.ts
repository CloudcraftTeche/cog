import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Teacher, TeacherResponse } from "@/types/teacher/profile";
import { TEACHER_QUERY_KEYS } from "@/lib/teacher/profile";
import { teacherUtils } from "@/utils/teacher/profile-utils";

export function useTeacherQuery(teacherId: string | null | undefined) {
  const queryClient = useQueryClient();

  const fetchTeacher = useCallback(async (): Promise<Teacher> => {
    if (!teacherId) {
      throw new Error("Teacher ID is required");
    }
    const response = await api.get<TeacherResponse>(`/teachers/${teacherId}`);
    return teacherUtils.formatTeacherData(response.data.data);
  }, [teacherId]);

  // Fetch query
  const teacherQuery = useQuery({
    queryKey: TEACHER_QUERY_KEYS.detail(teacherId || ""),
    queryFn: fetchTeacher,
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!teacherId) {
        throw new Error("Teacher ID is required");
      }
      const response = await api.put<TeacherResponse>(
        `/teachers/${teacherId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return teacherUtils.formatTeacherData(response.data.data);
    },
    onSuccess: (updatedTeacher) => {
      queryClient.setQueryData(
        TEACHER_QUERY_KEYS.detail(teacherId || ""),
        updatedTeacher
      );
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Failed to update profile. Please try again.";
      toast.error(message);
    },
  });

  const updateTeacher = useCallback(
    async (formData: FormData) => {
      return updateMutation.mutateAsync(formData);
    },
    [updateMutation]
  );

  return {
    teacher: teacherQuery.data ?? null,
    isLoading: teacherQuery.isLoading,
    isError: teacherQuery.isError,
    error: teacherQuery.error,
    isUpdating: updateMutation.isPending,
    updateTeacher,
  };
}