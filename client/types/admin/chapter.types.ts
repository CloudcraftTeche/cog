// types/chapter.types.ts

export interface GradeReference {
  _id: string;
  grade: string;
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

export interface ContentItem {
  type: "video" | "text" | "pdf" | "mixed";
  order: number;
  title?: string;
  textContent?: string;
  videoUrl?: string;
  url?: string;
  publicId?: string | null;
  file?: File;
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

export interface StudentProgressItem {
  studentId: string;
  status: string;
}

export interface Chapter {
  _id: string;
  title: string;
  description: string;
  chapterNumber: number;
  contentType: "video" | "text";
  videoUrl?: string;
  textContent?: string;
  gradeId: GradeReference;
  unitId: string;
  unitName?: string;
  createdAt: Date;
  studentProgress?: StudentProgressItem[];
}

export interface ChapterData {
  questions: boolean;
  unitId: string;
  _id: string;
  title: string;
  description: string;
  contentItems?: ContentItem[];
  contentType?: string;
  chapterNumber: number;
  gradeId: GradeReference;
  questionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  type: "text" | "video" | "pdf";
  content?: string;
  fileUrl?: string;
  filePublicId?: string;
  submittedAt: Date;
  _id?: string;
}

export interface StudentInfo {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  profilePictureUrl?: string;
  gradeId?: GradeReference;
}

export interface StudentSubmission {
  studentId: StudentInfo;
  status: string;
  score?: number;
  completedAt?: Date;
  startedAt?: Date;
  submissions: Submission[];
}

export interface StudentScore {
  studentId: string;
  name: string;
  email: string;
  gradeId: GradeReference;
  rollNumber: string;
  profilePictureUrl?: string;
  completedAt: string | null;
  score: number;
}

export interface NotCompletedStudent {
  studentId: string;
  name: string;
  gradeId: GradeReference;
  email: string;
  rollNumber: string;
  profilePictureUrl?: string;
  status?: string;
  startedAt?: string | null;
}

export interface Statistics {
  totalCompleted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export interface ExtendedStatistics extends Statistics {
  totalCompletedStudents: number;
  passRate: number;
}

export interface ScoreData {
  chapter: ChapterData;
  completedStudents: StudentScore[];
  pendingStudents: NotCompletedStudent[];
  statistics: Statistics;
}

export interface ChapterFormData {
  title: string;
  description: string;
  selectedGrades: string[];
  selectedUnit: string;
  chapter: number;
  contentItems: ContentItem[];
  questions: Question[];
}

export interface ChapterUpdateData {
  title: string;
  description: string;
  selectedGradeId: string;
  selectedUnitId: string;
  chapterNumber: number;
  contentItems: ContentItem[];
  questions: EditQuestion[];
}

export interface UploadFormState {
  title: string;
  description: string;
  selectedGrades: string[];
  selectedUnit: string;
  chapter: number;
  contentItems: ContentItem[];
  questions: Question[];
}

export interface ContentItem {
  type: "video" | "text" | "pdf" | "mixed";
  order: number;
  title?: string;
  textContent?: string;
  videoUrl?: string;
  file?: File;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface FormErrors {
  [key: string]: string;
}

