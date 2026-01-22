import api from "@/lib/api";
import {
  AnnouncementsResponse,
  AnnouncementResponse,
  IGrade,
} from "@/types/admin/announcement.types";
export const announcementService = {
  getAnnouncements: async (gradeId?: string) => {
    const queryParams = gradeId ? `?gradeId=${gradeId}` : "";
    const response = await api.get<AnnouncementsResponse>(
      `/announcements${queryParams}`
    );
    return response.data.data || [];
  },
  getGrades: async () => {
    const response = await api.get<{ success: boolean; data: IGrade[] }>(
      "/grades"
    );
    return response.data.data || [];
  },
  createAnnouncement: async (formData: FormData) => {
    const response = await api.post<AnnouncementResponse>(
      "/announcements",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  updateAnnouncement: async (id: string, formData: FormData) => {
    const response = await api.put<AnnouncementResponse>(
      `/announcements/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
  deleteAnnouncement: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/announcements/${id}`
    );
    return response.data;
  },
  togglePin: async (id: string, isPinned: boolean) => {
    const response = await api.patch<AnnouncementResponse>(
      `/announcements/${id}/pin`,
      { isPinned }
    );
    return response.data;
  },
};