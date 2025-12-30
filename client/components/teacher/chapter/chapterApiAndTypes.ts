import api from "@/lib/api";

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: "teacher";
  gradeId?: {
    _id: string;
    grade: string;
  };
  subject?: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherGrade {
  _id: string;
  grade: string;
  units: Array<{
    _id: string;
    name: string;
    description?: string;
    orderIndex: number;
  }>;
}

export interface TeacherUnit {
  _id: string;
  name: string;
  description?: string;
  orderIndex: number;
}

export interface ContentItem {
  type: "video" | "text" | "pdf" | "mixed";
  order: number;
  title?: string;
  textContent?: string;
  videoUrl?: string;
  url?: string;
  publicId?: string | null;
}

export interface StudentSubmission {
  type: "text" | "video" | "pdf";
  content?: string;
  fileUrl?: string;
  filePublicId?: string;
  submittedAt: Date;
}

export interface StudentProgress {
  studentId: any;
  status: "locked" | "accessible" | "in_progress" | "completed";
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
  submissions?: StudentSubmission[];
}

export interface TeacherChapter {
  _id: string;
  title: string;
  description: string;
  chapterNumber: number;
  contentType?: "video" | "text"; // Legacy field
  contentItems?: ContentItem[]; // New multi-content field
  videoUrl?: string; // Legacy field
  textContent?: string; // Legacy field
  gradeId: {
    _id: string;
    grade: string;
  };
  unitId: string;
  unitName?: string;
  createdAt: Date;
  questions?: Array<{
    questionText: string;
    options: string[];
    correctAnswer: string;
  }>;
  studentProgress?: StudentProgress[];
  updatedAt: Date;
}

export interface TeacherStudent {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  profilePictureUrl?: string;
  gradeId: {
    _id: string;
    grade: string;
  };
}

export interface ChapterFormData {
  title: string;
  description: string;
  contentType?: "video" | "text"; // Legacy field
  unitId: string;
  chapterNumber: number;
  videoUrl?: string; // Legacy field
  textContent?: string; // Legacy field
  questions: Array<{
    questionText: string;
    options: string[];
    correctAnswer: string;
  }>;
}

export interface ValidationErrors {
  title?: string;
  description?: string;
  unitId?: string;
  chapterNumber?: string;
  videoUrl?: string;
  textContent?: string;
  contentItems?: string;
  questions?: string;
}

let cachedTeacher: any = null;
let teacherCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export class TeacherChapterService {
  private static async getTeacher(): Promise<Teacher> {
    const now = Date.now();
    if (cachedTeacher && (now - teacherCacheTime) < CACHE_DURATION) {
      return cachedTeacher;
    }
    const { data } = await api.get(`/auth/me`);
    cachedTeacher = data.data;
    teacherCacheTime = now;
    return cachedTeacher;
  }

  static clearCache(): void {
    cachedTeacher = null;
    teacherCacheTime = 0;
  }

  static async getTeacherGrade(teacherId: string): Promise<TeacherGrade> {
    const teacher = await this.getTeacher();
    if (!teacher.gradeId) {
      throw new Error("No grade assigned to teacher");
    }
    const gradeResponse = await api.get(`/grades/${teacher.gradeId._id}`);
    return gradeResponse.data.data;
  }

  static async getChapters(params?: {
    search?: string;
    unitId?: string;
    chapterNumber?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    chapters: TeacherChapter[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const teacher = await this.getTeacher();
    if (!teacher.gradeId) {
      throw new Error("No grade assigned to teacher");
    }
    const response = await api.get(
      `/chapters/${teacher.gradeId._id}/chapters`,
      { params }
    );
    return {
      chapters: response.data.data || [],
      total: response.data.total || 0,
      page: response.data.page || 1,
      totalPages: response.data.totalPages || 1,
    };
  }

  static async getChapterById(chapterId: string): Promise<TeacherChapter> {
    const { data } = await api.get(`/chapters/${chapterId}`);
    return data.data;
  }

  static async createChapter(formData: FormData | ChapterFormData): Promise<void> {
    const teacher = await this.getTeacher();
    if (!teacher.gradeId) {
      throw new Error("No grade assigned to teacher");
    }
    
    const headers = formData instanceof FormData 
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" };

    await api.post(
      `/chapters/${teacher.gradeId._id}/chapters`,
      formData,
      { headers }
    );
  }

  static async updateChapter(
    chapterId: string,
    formData: FormData | Partial<ChapterFormData>
  ): Promise<void> {
    const teacher = await this.getTeacher();
    if (!teacher.gradeId) {
      throw new Error("No grade assigned to teacher");
    }
    
    const headers = formData instanceof FormData 
      ? { "Content-Type": "multipart/form-data" }
      : { "Content-Type": "application/json" };

    await api.put(
      `/chapters/${teacher.gradeId._id}/chapters/${chapterId}`,
      formData,
      { headers }
    );
  }

  static async deleteChapter(chapterId: string): Promise<void> {
    const teacher = await this.getTeacher();
    if (!teacher.gradeId) {
      throw new Error("No grade assigned to teacher");
    }
    await api.delete(
      `/chapters/${teacher.gradeId._id}/chapters/${chapterId}`
    );
  }

  static async getCompletedStudents(
    chapterId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: string;
    }
  ) {
    const { data } = await api.get(
      `/chapters/${chapterId}/completed-students`,
      { params }
    );
    return data;
  }

  static async getPendingStudents(
    chapterId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ) {
    const { data } = await api.get(
      `/chapters/${chapterId}/pending-students`,
      { params }
    );
    return data;
  }

  static async sendReminder(
    chapterId: string,
    studentId: string
  ): Promise<void> {
    await api.post(`/chapters/${chapterId}/remind/${studentId}`);
  }

  static async sendBulkReminders(chapterId: string): Promise<void> {
    await api.post(`/chapters/${chapterId}/remind-all`);
  }

  static async sendInProgressReminders(chapterId: string): Promise<void> {
    await api.post(`/chapters/${chapterId}/remind-in-progress`);
  }

  static async getCompletionStats(chapterId: string) {
    const teacher = await this.getTeacher();
    if (!teacher.gradeId) {
      throw new Error("No grade assigned to teacher");
    }
    const response = await api.get(
      `/chapters/${teacher.gradeId._id}/chapters/${chapterId}/completion-stats`
    );
    return response.data;
  }
}