export type UserRole = "student" | "teacher" | "admin";
export type AssignmentStatus = "active" | "ended" | "locked" | "upcoming";
export type ContentType = "video" | "text" | "pdf";
export type SubmissionType = "video" | "text" | "pdf";
export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}
export interface IGrade {
  _id: string;
  grade: string;
}
export interface IUser {
  _id: string;
  name: string;
}
export interface IAssignment {
  _id: string;
  title: string;
  description: string;
  contentType: ContentType;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
  questions: IQuestion[];
  gradeId: IGrade | string;
  status: AssignmentStatus;
  startDate: string;
  endDate: string;
  totalMarks?: number;
  passingMarks?: number;
  submittedStudents?: string[];
  createdBy?: IUser;
  createdAt: string;
  updatedAt: string;
}
export interface IAnswer {
  question: IQuestion;
  answer: string;
}
export interface ISubmission {
  _id: string;
  assignmentId: IAssignment | string;
  gradeId: IGrade | string;
  studentId: IUser | string;
  submissionType: SubmissionType;
  textContent?: string;
  videoUrl?: string;
  pdfUrl?: string;
  answers: IAnswer[];
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
}
export interface SubmissionContent {
  type: SubmissionType;
  textContent?: string;
  videoFile?: File;
  pdfFile?: File;
}
export interface AssignmentFilters {
  search: string;
  status: string;
  contentType: string;
}
export interface AssignmentsResponse {
  success: boolean;
  data: IAssignment[];
  message?: string;
}
export interface SubmissionsResponse {
  success: boolean;
  data: ISubmission[];
  message?: string;
}
export interface AssignmentResponse {
  success: boolean;
  data: IAssignment;
  message?: string;
}
export interface SubmissionResponse {
  success: boolean;
  data: ISubmission;
  message?: string;
}
