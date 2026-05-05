import api from "@/lib/api";
export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}
export interface TeacherProgress {
  teacherId: string;
  status: "locked" | "accessible" | "in_progress" | "completed";
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
}
export interface TeacherChapter {
  _id: string;
  title: string;
  gradeId: string;
  unitId: string;
  chapterNumber: number;
  description: string;
  contentType: "video" | "text";
  videoUrl?: string;
  videoPublicId?: string;
  textContent?: string;
  questions: Question[];
  createdBy: string;
  isCompleted?: boolean;
  isAccessible?: boolean;
  isInProgress?: boolean;
  isLocked?: boolean;
  isPublished: boolean;
  requiresPreviousChapter: boolean;
  status?: "locked" | "accessible" | "in_progress" | "completed";
  score?: number;
  teacherProgress?: {
    teacherId: string;
    status: "locked" | "accessible" | "in_progress" | "completed";
    startedAt?: Date;
    completedAt?: Date;
    score?: number;
  }[];
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
    chapters: TeacherChapter[];
  }[];
  totalChapters: number;
}
export interface ChapterDetailResponse {
  success: boolean;
  data: TeacherChapter & {
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
  data: TeacherChapter[];
}
export const chapterService = {
  async getChapters(params?: {
    page?: number;
    limit?: number;
    search?: string;
    unitId?: string;
  }): Promise<ChaptersListResponse> {
    const teacherGrade = await api.get("/auth/me");
    const grade = await teacherGrade.data.data.gradeId;
    const { data } = await api.get(`/teacher-chapters/teacher/${grade._id}`, {
      params,
    });
    return data;
  },
  async getChapterById(
    chapterId: string,
    teacherId: string
  ): Promise<ChapterDetailResponse> {
    const { data } = await api.get(`/teacher-chapters/${chapterId}`);
    return data;
  },
  async startChapter(gradeId: string, chapterId: string): Promise<any> {
    const { data } = await api.post(
      `/teacher-chapters/${gradeId}/chapters/${chapterId}/start`
    );
    return data;
  },
  async submitChapter(
    gradeId: string,
    chapterId: string,
    answers: { questionText: string; selectedAnswer: string }[]
  ): Promise<any> {
    const { data } = await api.post(
      `/teacher-chapters/${gradeId}/chapters/${chapterId}/submit`,
      {
        answers,
      }
    );
    return data;
  },
  async completeChapter(
    teacherId: string,
    chapterId: string,
    quizScore: number
  ): Promise<any> {
    const { data } = await api.post(`/teachers/${teacherId}/complete-chapter`, {
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
