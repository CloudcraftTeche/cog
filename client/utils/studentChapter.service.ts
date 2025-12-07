import api from "@/lib/api";
export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}
export interface StudentProgress {
  studentId: string;
  status: "locked" | "accessible" | "in_progress" | "completed";
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
}
export interface Chapter {
  _id: string;
  title: string;
  description: string;
  chapterNumber: number;
  contentType: "video" | "text";
  videoUrl?: string;
  textContent?: string;
  gradeId: {
    _id: string;
    grade: string;
  };
  unitId: string;
  unitName?: string;
  unitDescription?: string;
  questions: Question[];
  studentProgress?: StudentProgress[];
  isCompleted?: boolean;
  isAccessible?: boolean;
  isInProgress?: boolean;
  isLocked?: boolean;
  status?: "locked" | "accessible" | "in_progress" | "completed";
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface Unit {
  _id: string;
  name: string;
  description?: string;
  orderIndex: number;
}
export interface Grade {
  _id: string;
  grade: string;
  units?: Unit[];
}
export interface GroupedChapterData {
  grade: Grade;
  unitGroups: {
    unit: Unit;
    chapters: Chapter[];
  }[];
  totalChapters: number;
}
export interface ChapterDetailResponse {
  success: boolean;
  data: Chapter & {
    chapterIndex: number;
    totalChapters: number;
    quizScore: number;
  };
}
export interface ChaptersListResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: Chapter[];
}
export const chapterService = {
  async getChapters(params?: {
    page?: number;
    limit?: number;
    search?: string;
    unitId?: string;
  }): Promise<ChaptersListResponse> {
    const studentGrade=await api.get("/auth/me")
    const grade=await studentGrade.data.data.gradeId
    const { data } = await api.get(`/chapters/${grade._id}/chapters`, { params });
    return data;
  },
  async getChapterById(chapterId: string, studentId: string): Promise<ChapterDetailResponse> {
    const { data } = await api.get(`/chapters/${chapterId}`);
    return data;
  },
  async startChapter(gradeId: string, chapterId: string): Promise<any> {
    const { data } = await api.post(`/chapters/${gradeId}/chapters/${chapterId}/start`);
    return data;
  },
  async submitChapter(
    gradeId: string,
    chapterId: string,
    answers: { questionText: string; selectedAnswer: string }[]
  ): Promise<any> {
    const { data } = await api.post(`/chapters/${gradeId}/chapters/${chapterId}/submit`, {
      answers,
    });
    return data;
  },
  async completeChapter(studentId: string, chapterId: string, quizScore: number): Promise<any> {
    const { data } = await api.post(`/students/${studentId}/complete-chapter`, {
      chapterId,
      quizScore,
    });
    return data;
  },
  async getGrade(gradeId: string): Promise<any> {
    const { data } = await api.get(`/grades/${gradeId}`);
    return data;
  },
};