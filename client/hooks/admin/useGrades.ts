"use client";
import api from "@/lib/api";
import { Grade, GradeFormData, GradePagination } from "@/types/admin/grade.types";
import { formatGradePayload } from "@/utils/admin/grade.utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export const gradeKeys = {
  all: ["grades"] as const,
  lists: () => [...gradeKeys.all, "list"] as const,
  list: (params: { q?: string; page: number; limit: number }) =>
    [...gradeKeys.lists(), params] as const,
  details: () => [...gradeKeys.all, "detail"] as const,
  detail: (id: string) => [...gradeKeys.details(), id] as const,
};
export const useGrades = (searchQuery: string, page: number, limit = 8) => {
  return useQuery({
    queryKey: gradeKeys.list({ q: searchQuery, page, limit }),
    queryFn: async () => {
      const { data } = await api.get("/grades", {
        params: { q: searchQuery, page, limit },
      });
      return {
        data: data.data as Grade[],
        meta: data.meta as GradePagination,
      };
    },
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
};
export const useGrade = (id: string | null) => {
  return useQuery({
    queryKey: gradeKeys.detail(id || ""),
    queryFn: async (): Promise<Grade> => {
      if (!id) throw new Error("Grade ID is required");
      const { data } = await api.get(`/grades/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
export const useCreateGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: GradeFormData) => {
      const payload = formatGradePayload(formData, false);
      const { data } = await api.post("/grades", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
      toast.success("Grade added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add grade");
    },
  });
};
export const useUpdateGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: GradeFormData;
    }) => {
      const payload = formatGradePayload(formData, true);
      const { data } = await api.put(`/grades/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: gradeKeys.detail(id) });
      toast.success("Grade updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update grade");
    },
  });
};
export const useDeleteGrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/grades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeKeys.lists() });
      toast.success("Grade deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete grade");
    },
  });
};
