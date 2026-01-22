
export interface IQuestion {
  _id?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer?: string;
}

export interface IGradeSection {
  _id: string;
  grade: string;
}

export interface IGrade {
  _id: string;
  grade: string;
  description?: string;
  isActive: boolean;
  assignments?: IAssignment[];
}

export interface IAssignment {
  _id: string;
  title: string;
  description: string;
  contentType: "video" | "text" | "pdf";
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  questions: IQuestion[];
  startDate: string;
  endDate: string;
  status: "active" | "locked" | "ended";
  totalMarks?: number;
  passingMarks?: number;
  gradeId: IGradeSection;
  gradeName: string;
  createdAt: string;
  updatedAt: string;
  submittedStudents?: string[];
}

export interface IAssignmentForm {
  title: string;
  description: string;
  contentType: "video" | "text" | "pdf";
  gradeIds: string[];
  videoFile?: File | null;
  pdfFile?: File | null;
  textContent?: string;
  startDate: string;
  endDate: string;
  totalMarks?: number;
  passingMarks?: number;
  questions: IQuestion[];
}

export interface IAnswer {
  question: IQuestion;
  answer: string;
  isCorrect?: boolean;
  questionId?: string;
}

export interface IStudent {
  _id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
}

export interface ISubmission {
  _id: string;
  assignment: IAssignment;
  assignmentId?: string;
  student: IStudent;
  studentId?: string;
  submissionType: "text" | "video" | "pdf";
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  answers: IAnswer[];
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IValidationError {
  field: string;
  message: string;
}

export interface AssignmentsResponse {
  success: boolean;
  data: IAssignment[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AssignmentResponse {
  success: boolean;
  data: IAssignment;
  message?: string;
}

export interface SubmissionsResponse {
  success: boolean;
  data: ISubmission[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters?: {
    gradeStatus?: string;
    search?: string;
  };
}

export interface GradeSubmissionDTO {
  score: number;
  feedback: string;
}

export interface UseAssignmentsParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UseSubmissionsParams {
  assignmentId: string;
  limit?: number;
}

export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;