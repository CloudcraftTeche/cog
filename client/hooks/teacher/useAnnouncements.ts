// lib/hooks/useAnnouncements.ts
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import api from "@/lib/api";
import { Announcement, AnnouncementsResponse } from "@/types/teacher/announcement";

const ANNOUNCEMENTS_QUERY_KEY = ["announcements"] as const;

export const useAnnouncements = (): UseQueryResult<Announcement[], Error> => {
  return useQuery<Announcement[], Error>({
    queryKey: ANNOUNCEMENTS_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await api.get<AnnouncementsResponse>("/announcements");
        return response.data?.data ?? [];
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(
            error.message || "Failed to fetch announcements"
          );
        }
        throw new Error("Failed to fetch announcements");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};