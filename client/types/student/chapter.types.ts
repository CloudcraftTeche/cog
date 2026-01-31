
export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface StudentProgress {
  studentId: string;
  status: 'locked' | 'accessible' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
}

export interface ContentItem {
  type: 'video' | 'text' | 'pdf' | 'mixed';
  url?: string;
  publicId?: string;
  textContent?: string;
  title?: string;
  order: number;
}

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

export interface Chapter {
  _id: string;
  title: string;
  description: string;
  chapterNumber: number;
  contentItems: ContentItem[];
  gradeId: Grade;
  unitId: string;
  unitName?: string;
  unitDescription?: string;
  questions: Question[];
  studentProgress?: StudentProgress[];
  isCompleted?: boolean;
  isAccessible?: boolean;
  isInProgress?: boolean;
  isLocked?: boolean;
  status?: 'locked' | 'accessible' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
  chapterIndex?: number;
  totalChapters?: number;
  quizScore?: number;
}

export interface ChapterDetailResponse {
  success: boolean;
  data: Chapter;
}

export interface ChaptersListResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: Chapter[];
}

export interface ChapterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  unitId?: string;
  chapterNumber?: number;
}

export interface SubmitChapterRequest {
  answers: Answer[];
  submissionType: SubmissionType;
  submissionContent?: string;
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

export interface Answer {
  questionText: string;
  selectedAnswer: string;
}

export type SubmissionType = 'text' | 'video' | 'pdf';

export interface UnitGroup {
  unitId: string;
  unitName: string;
  unitDescription?: string;
  grade: string;
  chapters: Chapter[];
}

export interface SubmitChapterData {
  chapterId: string;
  gradeId: string;
  answers: Answer[];
  submissionType: SubmissionType;
  submissionFile?: File;
  submissionContent?: string;
}