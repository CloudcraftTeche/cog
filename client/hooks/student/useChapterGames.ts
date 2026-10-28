import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { chapterKeys } from '@/hooks/student/useChapters';
import type { GameAnswers, PlayableGame, SubmitGameResponse } from '@/types/student/game.types';

export const gameKeys = {
  all: ['chapter-games'] as const,
  plays: () => [...gameKeys.all, 'play'] as const,
  play: (chapterId: string) => [...gameKeys.plays(), chapterId] as const,
};

export const useChapterGames = (chapterId: string) =>
  useQuery({
    queryKey: gameKeys.play(chapterId),
    queryFn: async () => {
      const { data } = await api.get<{ data: PlayableGame[] }>(`/chapter-games/chapter/${chapterId}/play`);
      return data.data;
    },
    enabled: !!chapterId,
  });

// Instant feedback on one word or pair; nothing is saved.
export const useCheckGameAnswer = () =>
  useMutation({
    mutationFn: async ({ gameId, itemId, answer }: { gameId: string; itemId: string; answer: string }) => {
      const { data } = await api.post<{ data: { correct: boolean } }>(`/chapter-games/${gameId}/check`, { itemId, answer });
      return data.data.correct;
    },
  });

export const useSubmitGame = (chapterId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ gameId, answers }: { gameId: string; answers: GameAnswers }) => {
      const { data } = await api.post<{ data: SubmitGameResponse }>(`/chapter-games/${gameId}/submit`, { answers });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.play(chapterId) });
      queryClient.invalidateQueries({ queryKey: chapterKeys.detail(chapterId) });
      queryClient.invalidateQueries({ queryKey: chapterKeys.lists() });
    },
  });
};
