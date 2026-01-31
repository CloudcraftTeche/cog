// hooks/use-announcements.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { AnnouncementsResponse } from "@/types/student/announcement.types";

// Query Keys
export const announcementKeys = {
  all: ["announcements"] as const,
  lists: () => [...announcementKeys.all, "list"] as const,
};

// Fetch all announcements
export function useAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.lists(),
    queryFn: async () => {
      const response = await api.get<AnnouncementsResponse>("/announcements");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Manual refetch helper
export function useRefreshAnnouncements() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
  };
}