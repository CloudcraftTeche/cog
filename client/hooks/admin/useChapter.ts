// hooks/queries/useChapterQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Chapter,
  ChapterData,
  Grade,
  ScoreData,
  StudentSubmission,
} from "@/types/admin/chapter.types";

// Query Keys
export const chapterKeys = {
  all: ["chapters"] as const,
  lists: () => [...chapterKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...chapterKeys.lists(), filters] as const,
  details: () => [...chapterKeys.all, "detail"] as const,
  detail: (id: string) => [...chapterKeys.details(), id] as const,
  scores: (id: string) => [...chapterKeys.all, "scores", id] as const,
  submissions: (id: string) => [...chapterKeys.all, "submissions", id] as const,
};

export const gradeKeys = {
  all: ["grades"] as const,
  lists: () => [...gradeKeys.all, "list"] as const,
};

// Fetch Chapters
interface FetchChaptersParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
}

export const useChapters = (params: FetchChaptersParams) => {
  return useQuery({
    queryKey: chapterKeys.list(params),
    queryFn: async () => {
      const { data } = await api.get("/chapters/chapters", { params });
      return data.data as Chapter[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch Grades
export const useGrades = () => {
  return useQuery({
    queryKey: gradeKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get("/grades/all");
      const gradesData = data.data || [];
      return gradesData.sort((a: Grade, b: Grade) => {
        const gradeA = parseInt(a.grade.replace(/\D/g, "")) || 0;
        const gradeB = parseInt(b.grade.replace(/\D/g, "")) || 0;
        return gradeA - gradeB;
      }) as Grade[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Fetch Single Chapter
export const useChapter = (id: string) => {
  return useQuery({
    queryKey: chapterKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/chapters/${id}`);
      return data.data as ChapterData;
    },
    enabled: !!id,
  });
};

// Fetch Chapter Scores
export const useChapterScores = (id: string) => {
  return useQuery({
    queryKey: chapterKeys.scores(id),
    queryFn: async () => {
      const [chapterRes, completedRes, pendingRes] = await Promise.all([
        api.get(`/chapters/${id}`),
        api.get(`/chapters/${id}/completed-students`),
        api.get(`/chapters/${id}/pending-students`),
      ]);

      const chapterData = chapterRes.data.data;
      const completedData = completedRes.data;
      const pendingData = pendingRes.data;

      const scoreData: ScoreData = {
        chapter: {
          _id: chapterData._id,
          title: chapterData.title,
          description: chapterData.description,
          contentItems: chapterData.contentItems,
          contentType: chapterData.contentType,
          chapterNumber: chapterData.chapterNumber,
          gradeId: chapterData.gradeId,
          questionsCount: chapterData.questions?.length || 0,
          createdAt: chapterData.createdAt,
          updatedAt: chapterData.updatedAt,
          questions: false,
          unitId: ""
        },
        completedStudents: completedData.data || [],
        pendingStudents: pendingData.data || [],
        statistics: {
          totalCompleted: completedData.total || 0,
          averageScore: completedData.stats?.averageScore || 0,
          highestScore: completedData.stats?.highestScore || 0,
          lowestScore: completedData.stats?.lowestScore || 0,
        },
      };

      return scoreData;
    },
    enabled: !!id,
  });
};

// Fetch Chapter Submissions
export const useChapterSubmissions = (id: string) => {
  return useQuery({
    queryKey: chapterKeys.submissions(id),
    queryFn: async () => {
      const { data } = await api.get(`/chapters/${id}`);
      const chapterData = data.data;

      const studentSubmissions: StudentSubmission[] = [];
      if (chapterData.studentProgress?.length > 0) {
        for (const progress of chapterData.studentProgress) {
          if (progress.submissions?.length > 0) {
            studentSubmissions.push({
              studentId: progress.studentId,
              status: progress.status,
              score: progress.score,
              completedAt: progress.completedAt,
              startedAt: progress.startedAt,
              submissions: progress.submissions,
            });
          }
        }
      }

      return {
        chapter: chapterData,
        submissions: studentSubmissions,
      };
    },
    enabled: !!id,
  });
};

// Delete Chapter Mutation
export const useDeleteChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gradeId, chapterId }: { gradeId: string; chapterId: string }) => {
      await api.delete(`/chapters/${gradeId}/chapters/${chapterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.lists() });
      toast.success("Chapter deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error("Failed to delete chapter");
      console.error(error);
    },
  });
};

// Send Reminder Mutation
export const useSendReminder = (chapterId: string) => {
  return useMutation({
    mutationFn: async (studentId: string) => {
      await api.post(`/chapters/${chapterId}/remind/${studentId}`);
    },
    onSuccess: () => {
      toast.success("Reminder sent successfully");
    },
    onError: () => {
      toast.error("Failed to send reminder");
    },
  });
};

// Create Chapter Mutation
export const useCreateChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post("/chapters/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.lists() });
      toast.success("Content Uploaded!", {
        description: "Your educational content has been uploaded successfully.",
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "An error occurred during upload.";
      toast.error("Upload Failed", {
        description: errorMessage,
      });
    },
  });
};

// Update Chapter Mutation
export const useUpdateChapter = (gradeId: string, chapterId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.put(
        `/chapters/${gradeId}/chapters/${chapterId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.detail(chapterId) });
      queryClient.invalidateQueries({ queryKey: chapterKeys.lists() });
      toast.success("Chapter updated successfully", {
        description: "The chapter has been updated with your changes",
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Failed to update chapter";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    },
  });
};