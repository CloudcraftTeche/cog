import { useState, useEffect } from "react";
import api from "@/lib/api";
import { AnnouncementResponse, AnnouncementsResponse, IAnnouncement, IGrade } from "@/utils/announcement.utils";
interface UseAnnouncementsParams {
  gradeId?: string;
}
export const useAnnouncements = (params?: UseAnnouncementsParams) => {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [grades, setGrades] = useState<IGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = params?.gradeId ? `?gradeId=${params.gradeId}` : "";
      const response = await api.get<AnnouncementsResponse>(
        `/announcements${queryParams}`
      );
      setAnnouncements(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
      setError(err.message || "Failed to fetch announcements");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchGrades = async () => {
    try {
      const response = await api.get<{ success: boolean; data: IGrade[] }>(
        "/grades"
      );
      setGrades(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching grades:", err);
    }
  };
  const createAnnouncement = async (formData: FormData) => {
    try {
      console.log("Creating announcement with FormData");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      const response = await api.post<AnnouncementResponse>(
        "/announcements",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        await fetchAnnouncements();
      }
    } catch (err: any) {
      console.error("Error creating announcement:", err);
      console.error("Error response:", err.response?.data);
      throw err;
    }
  };
  const updateAnnouncement = async (id: string, formData: FormData) => {
    try {
      console.log("Updating announcement with FormData");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      const response = await api.put<AnnouncementResponse>(
        `/announcements/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        await fetchAnnouncements();
      }
    } catch (err: any) {
      console.error("Error updating announcement:", err);
      console.error("Error response:", err.response?.data);
      throw err;
    }
  };
  const deleteAnnouncement = async (id: string) => {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(
        `/announcements/${id}`
      );
      if (response.data.success) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err: any) {
      console.error("Error deleting announcement:", err);
      throw err;
    }
  };
  const togglePin = async (id: string, isPinned: boolean) => {
    try {
      const response = await api.patch<AnnouncementResponse>(
        `/announcements/${id}/pin`,
        { isPinned }
      );
      if (response.data.success) {
        setAnnouncements((prev) =>
          prev.map((a) => (a._id === id ? { ...a, isPinned } : a))
        );
        await fetchAnnouncements();
      }
    } catch (err: any) {
      console.error("Error toggling pin:", err);
      throw err;
    }
  };
  useEffect(() => {
    fetchAnnouncements();
    fetchGrades();
  }, [params?.gradeId]);
  return {
    announcements,
    grades,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    togglePin,
    refetch: fetchAnnouncements,
  };
};