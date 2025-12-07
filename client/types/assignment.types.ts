export interface IQuestion {
  questionText: string
  options: string[]
  correctAnswer: string
  selectedAnswer?: string
}
export interface IGrade {
  _id: string
  grade: string
}
export interface IAssignment {
  _id: string
  title: string
  description: string
  contentType: "video" | "text" | "pdf"
  videoUrl?: string
  videoPublicId?: string
  pdfUrl?: string
  pdfPublicId?: string
  textContent?: string
  questions: IQuestion[]
  startDate: string
  endDate: string
  status: "active" | "locked" | "ended"
  createdBy: string
  gradeId: IGrade | string
  totalMarks?: number
  passingMarks?: number
  submittedStudents?: string[]
  createdAt?: string
  updatedAt?: string
}
export interface IAnswer {
  question: IQuestion
  answer: string
  isCorrect?: boolean
}
export interface IStudent {
  _id: string
  name: string
  email: string
  profilePictureUrl?: string
}
export interface ISubmission {
  _id: string
  assignmentId: string | IAssignment
  studentId: string | IStudent
  submissionType: "video" | "text" | "pdf"
  textContent?: string
  videoUrl?: string
  videoPublicId?: string
  pdfUrl?: string
  pdfPublicId?: string
  answers: IAnswer[]
  score?: number
  feedback?: string
  submittedAt?: string
  gradedAt?: string
  gradedBy?: string
  student?: IStudent
  assignment?: Partial<IAssignment>
  createdAt?: string
  updatedAt?: string
}
export type UserRole = "student" | "teacher" | "admin"
export interface IUser {
  _id: string
  name: string
  email: string
  role: UserRole
  profilePictureUrl?: string
  gradeId?: string
}
export interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}
export interface AssignmentsResponse {
  success: boolean
  data: IAssignment[]
  pagination: PaginationInfo
  filters: {
    search?: string
    status?: string
  }
}
export interface AssignmentDetailResponse {
  success: boolean
  data: IAssignment
}
export interface SubmissionResponse {
  success: boolean
  data: ISubmission
}
export interface SubmissionsResponse {
  success: boolean
  data: ISubmission[]
  pagination?: PaginationInfo
}
export interface SubmitAssignmentPayload {
  assignmentId: string
  submissionType: "video" | "text" | "pdf"
  videoUrl?: string
  pdfUrl?: string
  textContent?: string
  answers: {
    question: IQuestion
    answer: string
  }[]
}
