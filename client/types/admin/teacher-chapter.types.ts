// types/teacher-chapter.types.ts

export interface Grade {
  _id: string;
  grade: string;
  units?: Unit[];
}

export interface Unit {
  _id: string;
  name: string;
  description?: string;
  orderIndex: number;
}

export interface TeacherProgress {
  teacherId: string;
  status: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface EditQuestion extends Question {
  _id?: string;
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
  isPublished: boolean;
  requiresPreviousChapter: boolean;
  hasQuestions: boolean;
  questionsCount: number;
  teacherProgress?: TeacherProgress[];
  questions?: Question[];
}

export interface CreateTeacherChapterPayload {
  title: string;
  description: string;
  contentType: "video" | "text";
  unitId: string;
  chapterNumber: number;
  gradeIds: string[];
  videoUrl?: string;
  textContent?: string;
  questions: {
    questionText: string;
    options: string[];
    correctAnswer: string;
  }[];
  isPublished: boolean;
  requiresPreviousChapter: boolean;
}

export interface UpdateTeacherChapterPayload {
  title: string;
  description: string;
  contentType: "video" | "text";
  unitId: string;
  chapterNumber: number;
  videoUrl?: string;
  textContent?: string;
  questions: {
    questionText: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export interface ValidationErrors {
  title?: string;
  description?: string;
  gradeIds?: string;
  gradeId?: string;
  unitId?: string;
  chapterNumber?: string;
  videoUrl?: string;
  textContent?: string;
  questions?: string;
}

export interface FetchChaptersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ChaptersResponse {
  data: TeacherChapter[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface GradesResponse {
  data: Grade[];
}

export interface ChapterResponse {
  data: TeacherChapter;
}