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
export interface TeacherChapter {
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
  createdAt: Date;
  questions?: Array<{
    questionText: string;
    options: string[];
    correctAnswer: string;
  }>;
  studentProgress?: Array<{
    studentId: string;
    status: string;
  }>;
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
  contentType: "video" | "text";
  unitId: string;
  chapterNumber: number;
  videoUrl?: string;
  textContent?: string;
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
  static async createChapter(formData: ChapterFormData): Promise<void> {
    const teacher = await this.getTeacher();
    if (!teacher.gradeId) {
      throw new Error("No grade assigned to teacher");
    }
    await api.post(
      `/chapters/${teacher.gradeId._id}/chapters`,
      formData,
      { headers: { "Content-Type": "application/json" } }
    );
  }
  static async updateChapter(
    chapterId: string,
    formData: Partial<ChapterFormData>
  ): Promise<void> {
    const teacher = await this.getTeacher();
    if (!teacher.gradeId) {
      throw new Error("No grade assigned to teacher");
    }
    await api.put(
      `/chapters/${teacher.gradeId._id}/chapters/${chapterId}`,
      formData,
      { headers: { "Content-Type": "application/json" } }
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