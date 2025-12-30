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
export interface ContentItem {
  type: "video" | "text" | "pdf" | "mixed";
  url?: string;
  publicId?: string;
  textContent?: string;
  title?: string;
  order: number;
}
export interface Chapter {
  _id: string;
  title: string;
  description: string;
  chapterNumber: number;
  contentItems: ContentItem[];
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
export interface ChapterDetailResponse {
  success: boolean;
  data: Chapter & {
    chapterIndex?: number;
    totalChapters?: number;
    quizScore?: number;
  };
}
export interface ChaptersListResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: Chapter[];
}
export interface CompleteChapterRequest {
  score?: number;
  studentId?: string;
}
export interface CompleteChapterResponse {
  success: boolean;
  message: string;
  data: {
    chapterId: string;
    studentId: string;
    status: string;
    completedAt: Date;
    score?: number;
  };
}
interface Answer {
  questionText: string;
  selectedAnswer: string;
}
export interface ChapterContent {
  chapter: Chapter;
  answers: Answer[];
}
export const chapterService = {
  async getCurrentUserGrade(): Promise<Grade> {
    const { data } = await api.get("/auth/me");
    return data.data.gradeId;
  },
  async getChapters(params?: {
    page?: number;
    limit?: number;
    search?: string;
    unitId?: string;
    chapterNumber?: number;
  }): Promise<ChaptersListResponse> {
    const grade = await this.getCurrentUserGrade();
    const { data } = await api.get(`/chapters/${grade._id}/chapters`, {
      params,
    });
    return data;
  },
  async getChapterById(chapterId: string): Promise<ChapterDetailResponse> {
    const { data } = await api.get(`/chapters/${chapterId}`);
    return data;
  },
  async startChapter(chapterId: string): Promise<any> {
    const grade = await this.getCurrentUserGrade();
    const { data } = await api.post(
      `/chapters/${grade._id}/chapters/${chapterId}/start`
    );
    return data;
  },
  async submitChapter(
    chapterId: string,
    answers: { questionText: string; selectedAnswer: string }[],
    submissionType: "text" | "video" | "pdf" = "text",
    submissionContent?: string
  ): Promise<any> {
    const grade = await this.getCurrentUserGrade();
    const { data } = await api.post(
      `/chapters/${grade._id}/chapters/${chapterId}/submit`,
      {
        answers,
        submissionType,
        submissionContent,
      }
    );
    return data;
  },
  async completeChapter(
    chapterId: string,
    score: number,
    studentId?: string
  ): Promise<CompleteChapterResponse> {
    const grade = await this.getCurrentUserGrade();
    const { data } = await api.post(
      `/chapters/${grade._id}/chapters/${chapterId}/complete`,
      {
        score,
        studentId,
      }
    );
    return data;
  },
  async getChapterStatus(chapterId: string): Promise<any> {
    const grade = await this.getCurrentUserGrade();
    const { data } = await api.get(
      `/chapters/${grade._id}/chapters/${chapterId}/status`
    );
    return data;
  },
  async getCompletedChapters(studentId: string): Promise<any> {
    const grade = await this.getCurrentUserGrade();
    const { data } = await api.get(
      `/chapters/${grade._id}/students/${studentId}/completed-chapters`
    );
    return data;
  },
  async getGrade(gradeId: string): Promise<any> {
    const { data } = await api.get(`/grades/${gradeId}`);
    return data;
  },
  async getChapterCount(gradeId: string): Promise<any> {
    const { data } = await api.get(`/chapters/${gradeId}/chapters/count`);
    return data;
  },
  async getChaptersByUnit(gradeId: string, unitId: string): Promise<any> {
    const { data } = await api.get(
      `/chapters/${gradeId}/units/${unitId}/chapters`
    );
    return data;
  },
};
