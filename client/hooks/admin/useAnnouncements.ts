import { announcementService } from "@/lib/admin/api/announcement.service";
import { UseAnnouncementsParams } from "@/types/admin/announcement.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export const QUERY_KEYS = {
  announcements: (gradeId?: string) =>
    gradeId ? ["announcements", gradeId] : ["announcements"],
  grades: ["grades"],
} as const;
export const useAnnouncements = (params?: UseAnnouncementsParams) => {
  const queryClient = useQueryClient();
  const {
    data: announcements = [],
    isLoading: isLoadingAnnouncements,
    error: announcementsError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.announcements(params?.gradeId),
    queryFn: () => announcementService.getAnnouncements(params?.gradeId),
  });
  const {
    data: grades = [],
    isLoading: isLoadingGrades,
  } = useQuery({
    queryKey: QUERY_KEYS.grades,
    queryFn: announcementService.getGrades,
  });
  const createMutation = useMutation({
    mutationFn: announcementService.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.announcements(params?.gradeId),
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      announcementService.updateAnnouncement(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.announcements(params?.gradeId),
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: announcementService.deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.announcements(params?.gradeId),
      });
    },
  });
  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      announcementService.togglePin(id, isPinned),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.announcements(params?.gradeId),
      });
    },
  });
  return {
    announcements,
    grades,
    loading: isLoadingAnnouncements || isLoadingGrades,
    error: announcementsError,
    createAnnouncement: createMutation.mutateAsync,
    updateAnnouncement: updateMutation.mutateAsync,
    deleteAnnouncement: deleteMutation.mutateAsync,
    togglePin: togglePinMutation.mutateAsync,
    refetch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingPin: togglePinMutation.isPending,
  };
};