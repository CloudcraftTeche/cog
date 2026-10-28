import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import api from "@/lib/api";
import type { ChapterLesson, ChapterSummary, GameInput, GameStatus, StaffChapterGame } from "@/types/admin/chapterGame.types";
import type { CheckResult, GameAnswers, PlayableGame } from "@/types/student/game.types";

// Game authoring and review for admins, super admins and teachers (own grade, enforced by the server).
export const staffGameKeys = {
  all: ["staff-chapter-games"] as const,
  list: (chapterId: string) => [...staffGameKeys.all, "list", chapterId] as const,
  preview: (gameId: string) => [...staffGameKeys.all, "preview", gameId] as const,
  chapter: (chapterId: string) => [...staffGameKeys.all, "chapter", chapterId] as const,
  lesson: (chapterId: string) => [...staffGameKeys.all, "lesson", chapterId] as const,
};

export const apiErrorMessage = (error: unknown, fallback: string) =>
  isAxiosError(error) ? (error.response?.data as { message?: string } | undefined)?.message ?? fallback : fallback;

export const useGameChapter = (chapterId: string) =>
  useQuery({
    queryKey: staffGameKeys.chapter(chapterId),
    queryFn: async () => {
      const { data } = await api.get<{ data: ChapterSummary }>(`/chapters/${chapterId}`);
      return data.data;
    },
    enabled: !!chapterId,
  });

export const useStaffChapterGames = (chapterId: string) =>
  useQuery({
    queryKey: staffGameKeys.list(chapterId),
    queryFn: async () => {
      const { data } = await api.get<{ data: StaffChapterGame[] }>("/chapter-games", { params: { chapterId } });
      return data.data;
    },
    enabled: !!chapterId,
  });

// Lesson text is copyrighted: never kept in the cache after the page closes.
export const useChapterLesson = (chapterId: string) =>
  useQuery({
    queryKey: staffGameKeys.lesson(chapterId),
    queryFn: async () => {
      try {
        const { data } = await api.get<{ data: ChapterLesson }>(`/lessons/chapter/${chapterId}`);
        return data.data;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!chapterId,
    gcTime: 0,
    retry: false,
  });

const useInvalidateGames = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: staffGameKeys.all });
};

export const useCreateGame = (chapterId: string) => {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: async (input: GameInput) => {
      const { data } = await api.post<{ data: StaffChapterGame }>("/chapter-games", { ...input, chapterId });
      return data.data;
    },
    onSuccess: invalidate,
  });
};

export const useUpdateGame = () => {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: async ({ gameId, input }: { gameId: string; input: GameInput }) => {
      const { title, instructions, config, answerKey } = input;
      const { data } = await api.put<{ data: StaffChapterGame }>(`/chapter-games/${gameId}`, {
        title,
        instructions,
        config,
        answerKey,
      });
      return data.data;
    },
    onSuccess: invalidate,
  });
};

export const useSetGameStatus = () => {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: async ({ gameId, status }: { gameId: string; status: GameStatus }) => {
      const { data } = await api.patch<{ data: StaffChapterGame }>(`/chapter-games/${gameId}/status`, { status });
      return data.data;
    },
    onSuccess: invalidate,
  });
};

export const useDeleteGame = () => {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: async (gameId: string) => {
      await api.delete(`/chapter-games/${gameId}`);
    },
    onSuccess: invalidate,
  });
};

export const useReorderGames = (chapterId: string) => {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await api.patch(`/chapter-games/chapter/${chapterId}/order`, { ids });
    },
    onSuccess: invalidate,
  });
};

export const useApproveAllDrafts = (chapterId: string) => {
  const invalidate = useInvalidateGames();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<{ data: { approved: number } }>(`/chapter-games/chapter/${chapterId}/approve-drafts`);
      return data.data.approved;
    },
    onSuccess: invalidate,
  });
};

export const useGamePreview = (gameId: string | null) =>
  useQuery({
    queryKey: staffGameKeys.preview(gameId ?? ""),
    queryFn: async () => {
      const { data } = await api.get<{ data: PlayableGame }>(`/chapter-games/${gameId}/preview`);
      return data.data;
    },
    enabled: !!gameId,
    gcTime: 0,
  });

// Preview checks and scores against the answer key on the server; nothing is saved.
export const previewCheck = async (gameId: string, itemId: string, answer: string): Promise<CheckResult> => {
  const { data } = await api.post<{ data: CheckResult }>(`/chapter-games/${gameId}/preview/check`, { itemId, answer });
  return { correct: data.data.correct, explanation: data.data.explanation ?? null };
};

export const previewSubmit = async (gameId: string, answers: GameAnswers) => {
  const { data } = await api.post<{ data: { score: number; total: number } }>(`/chapter-games/${gameId}/preview/submit`, {
    answers,
  });
  return data.data;
};
