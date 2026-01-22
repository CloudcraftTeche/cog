// hooks/queries/useQueries.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Query, Statistics, User, Filters } from "@/types/admin/query.types";
import { toast } from "sonner";

// ===== QUERY KEYS =====
export const queryKeys = {
  all: ["queries"] as const,
  lists: () => [...queryKeys.all, "list"] as const,
  list: (filters: Filters, page: number) =>
    [...queryKeys.lists(), filters, page] as const,
  details: () => [...queryKeys.all, "detail"] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
  statistics: () => [...queryKeys.all, "statistics"] as const,
  teachers: () => ["teachers"] as const,
  superAdmins: () => ["superadmins"] as const,
};

// ===== QUERIES LIST =====
export const useQueries = (filters: Filters, page: number, limit = 10) => {
  return useQuery({
    queryKey: queryKeys.list(filters, page),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.queryType && { queryType: filters.queryType }),
      });

      const { data } = await api.get(`/queries/received?${params}`);
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// ===== QUERY STATISTICS =====
export const useQueryStatistics = () => {
  return useQuery({
    queryKey: queryKeys.statistics(),
    queryFn: async (): Promise<Statistics> => {
      const { data } = await api.get("/queries/statistics/overview");
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// ===== QUERY DETAIL =====
export const useQueryDetail = (queryId: string | null) => {
  return useQuery({
    queryKey: queryKeys.detail(queryId || ""),
    queryFn: async (): Promise<Query> => {
      if (!queryId) throw new Error("Query ID is required");
      const { data } = await api.get(`/queries/${queryId}`);
      return data.data;
    },
    enabled: !!queryId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// ===== TEACHERS LIST =====
export const useTeachers = () => {
  return useQuery({
    queryKey: queryKeys.teachers(),
    queryFn: async (): Promise<User[]> => {
      const { data } = await api.get("/teachers");
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - teachers don't change often
  });
};

// ===== SUPER ADMINS LIST =====
export const useSuperAdmins = () => {
  return useQuery({
    queryKey: queryKeys.superAdmins(),
    queryFn: async (): Promise<User[]> => {
      const { data } = await api.get("/superadmins");
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// ===== ADD RESPONSE MUTATION =====
export const useAddResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      queryId,
      content,
    }: {
      queryId: string;
      content: string;
    }) => {
      const { data } = await api.post(`/queries/${queryId}/response`, {
        content,
      });
      return data;
    },
    onSuccess: (_, { queryId }) => {
      // Invalidate both the detail and list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(queryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success("Response added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add response");
    },
  });
};

// ===== UPDATE STATUS MUTATION =====
export const useUpdateQueryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      queryId,
      status,
    }: {
      queryId: string;
      status: string;
    }) => {
      const { data } = await api.patch(`/queries/${queryId}/status`, {
        status,
      });
      return data;
    },
    onSuccess: (_, { queryId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(queryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics() });
      toast.success("Status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
};

// ===== ASSIGN QUERY MUTATION =====
export const useAssignQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      queryId,
      userId,
    }: {
      queryId: string;
      userId: string;
    }) => {
      const { data } = await api.patch(`/queries/${queryId}/assign`, {
        assignedTo: userId,
      });
      return data;
    },
    onSuccess: (_, { queryId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(queryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success("Query assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign query");
    },
  });
};

// ===== ESCALATE QUERY MUTATION =====
export const useEscalateQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      queryId,
      to,
      reason,
    }: {
      queryId: string;
      to: string;
      reason: string;
    }) => {
      const { data } = await api.post(`/queries/${queryId}/escalate`, {
        to,
        reason,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics() });
      toast.success("Query escalated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to escalate query");
    },
  });
};