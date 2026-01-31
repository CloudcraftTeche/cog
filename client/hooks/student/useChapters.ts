// hooks/useChapters.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  ChaptersListResponse,
  ChapterDetailResponse,
  ChapterQueryParams,
  SubmitChapterData,
  CompleteChapterResponse,
  Grade,
} from '@/types/student/chapter.types';

// Helper to get current user grade
const getCurrentUserGrade = async (): Promise<Grade> => {
  const { data } = await api.get('/auth/me');
  return data.data.gradeId;
};

// Query Keys
export const chapterKeys = {
  all: ['chapters'] as const,
  lists: () => [...chapterKeys.all, 'list'] as const,
  list: (params: ChapterQueryParams) => [...chapterKeys.lists(), params] as const,
  details: () => [...chapterKeys.all, 'detail'] as const,
  detail: (id: string) => [...chapterKeys.details(), id] as const,
  grade: () => [...chapterKeys.all, 'grade'] as const,
};

// Fetch chapters list
export const useChaptersList = (params: ChapterQueryParams) => {
  return useQuery({
    queryKey: chapterKeys.list(params),
    queryFn: async () => {
      const grade = await getCurrentUserGrade();
      const { data } = await api.get<ChaptersListResponse>(
        `/chapters/${grade._id}/chapters`,
        { params }
      );

      if (!data.success) {
        throw new Error('Failed to fetch chapters');
      }

      return {
        chapters: data.data ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        totalPages: data.totalPages ?? 1,
      };
    },
    staleTime: 60000, // 1 minute
  });
};

// Fetch single chapter
export const useChapter = (chapterId: string | null) => {
  return useQuery({
    queryKey: chapterKeys.detail(chapterId ?? ''),
    queryFn: async () => {
      if (!chapterId) throw new Error('Chapter ID is required');

      const { data } = await api.get<ChapterDetailResponse>(`/chapters/${chapterId}`);

      if (!data.success) {
        throw new Error('Failed to fetch chapter');
      }

      return data.data;
    },
    enabled: !!chapterId,
    staleTime: 30000, // 30 seconds
  });
};

// Start chapter mutation
export const useStartChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: string) => {
      const grade = await getCurrentUserGrade();
      const { data } = await api.post(
        `/chapters/${grade._id}/chapters/${chapterId}/start`
      );
      return data;
    },
    onSuccess: (_, chapterId) => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.detail(chapterId) });
      queryClient.invalidateQueries({ queryKey: chapterKeys.lists() });
    },
  });
};

// Submit chapter mutation
export const useSubmitChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterId,
      gradeId,
      answers,
      submissionType,
      submissionFile,
      submissionContent,
    }: SubmitChapterData) => {
      const formData = new FormData();
      
      formData.append('answers', JSON.stringify(answers));
      formData.append('submissionType', submissionType);

      if (submissionType === 'text' && submissionContent) {
        formData.append('submissionContent', submissionContent);
      } else if (submissionFile) {
        formData.append('submissionFile', submissionFile);
      }

      const { data } = await api.post(
        `/chapters/${gradeId}/chapters/${chapterId}/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!data.success) {
        throw new Error(data.message || 'Failed to submit chapter');
      }

      return data;
    },
    onSuccess: (_, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.detail(chapterId) });
      queryClient.invalidateQueries({ queryKey: chapterKeys.lists() });
    },
  });
};

// Complete chapter mutation
export const useCompleteChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chapterId,
      score,
      studentId,
    }: {
      chapterId: string;
      score: number;
      studentId?: string;
    }) => {
      const grade = await getCurrentUserGrade();
      const { data } = await api.post<CompleteChapterResponse>(
        `/chapters/${grade._id}/chapters/${chapterId}/complete`,
        { score, studentId }
      );

      if (!data.success) {
        throw new Error(data.message || 'Failed to complete chapter');
      }

      return data;
    },
    onSuccess: (_, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.detail(chapterId) });
      queryClient.invalidateQueries({ queryKey: chapterKeys.lists() });
    },
  });
};

// Get current user grade
export const useCurrentGrade = () => {
  return useQuery({
    queryKey: chapterKeys.grade(),
    queryFn: getCurrentUserGrade,
    staleTime: 300000, // 5 minutes
  });
};