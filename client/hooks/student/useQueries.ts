// hooks/useQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  Query,
  Recipients,
  ApiResponse,
  QueryListParams,
  CreateQueryData,
} from '@/types/student/query.types';

// Query Keys
export const queryKeys = {
  all: ['queries'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (params: QueryListParams) => [...queryKeys.lists(), params] as const,
  recipients: () => [...queryKeys.all, 'recipients'] as const,
};

// Fetch queries list
export const useQueriesList = (params: QueryListParams) => {
  return useQuery({
    queryKey: queryKeys.list(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...(params.status && { status: params.status }),
        ...(params.queryType && { queryType: params.queryType }),
        ...(params.priority && { priority: params.priority }),
      });

      const { data } = await api.get<ApiResponse<Query[]>>(
        `/queries/my-queries?${queryParams}`
      );

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch queries');
      }

      return {
        queries: data.data ?? [],
        totalPages: data.totalPages ?? 1,
      };
    },
    staleTime: 30000, // 30 seconds
  });
};

// Fetch recipients
export const useRecipients = () => {
  return useQuery({
    queryKey: queryKeys.recipients(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Recipients>>('/queries/recipients');
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch recipients');
      }

      return data.data ?? { teachers: [], admins: [], superAdmins: [] };
    },
    staleTime: 300000, // 5 minutes - recipients don't change often
  });
};

// Create query mutation
export const useCreateQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateQueryData) => {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof CreateQueryData];
        
        if (key === 'attachments' && Array.isArray(value)) {
          value.forEach((file) => {
            if (file instanceof File) {
              formDataToSend.append('attachments', file);
            }
          });
        } else if (key === 'tags' && Array.isArray(value)) {
          value.forEach((tag) => {
            formDataToSend.append('tags[]', tag);
          });
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      const { data } = await api.post<ApiResponse<Query>>('/queries', formDataToSend);

      if (!data.success) {
        throw new Error(data.message || 'Failed to create query');
      }

      return data.data;
    },
    onSuccess: () => {
      // Invalidate all query lists to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};

// Add rating mutation
export const useAddRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ queryId, rating }: { queryId: string; rating: number }) => {
      const { data } = await api.post<ApiResponse<Query>>(
        `/queries/${queryId}/rating`,
        { rating }
      );

      if (!data.success) {
        throw new Error(data.message || 'Failed to add rating');
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};