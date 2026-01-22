// ===== TYPES =====
// lib/types/student.types.ts

export interface StudentAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CompletedChapter {
  chapterId: string;
  chapterTitle: string;
  chapterNumber: number;
  completedAt: string;
  score?: number;
}

export interface StudentProgress {
  totalChapters: number;
  completedCount: number;
  notCompletedChapters: number;
  completionPercentage: number;
  completedChapters: CompletedChapter[];
}



export interface Grade {
  _id: string;
  grade: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  rollNumber: string;
  gradeId: string;
  gender: string;
  dateOfBirth: string;
  parentContact: string;
  address: StudentAddress;
}


export interface StudentListParams {
  query?: string;
  page: number;
  limit: number;
  grade?: string;
}

export interface StudentListResponse {
  data: Student[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ExcelExportData {
  Name: string;
  "Roll Number": string;
  Email: string;
  Grade: string;
  Gender: string;
  "Date of Birth": string;
  "Parent Contact": string;
  Address: string;
  "Total Chapters": number;
  "Completed Chapters": number;
  "Remaining Chapters": number;
  "Completion Percentage": string;
}

export interface DetailedExcelData {
  "Student Name": string;
  "Roll Number": string;
  "Chapter Number": number;
  "Chapter Title": string;
  "Completed Date": string;
  Score: string;
}

// types/admin/student.types.ts

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  rollNumber: string;
  gradeId: string;
  gender: string;
  dateOfBirth: string;
  parentContact: string;
  address: StudentAddress;
}

export interface Student extends StudentFormData {
  _id: string;
  role: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  _id: string;
  grade: string;
  description?: string;
}

export interface StudentProgress {
  studentId: string;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  lastActivity: string;
}

export interface StudentListParams {
  page: number;
  limit: number;
  search?: string;
  gradeId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentListResponse {
  data: Student[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FormErrors {
  [key: string]: string;
}

export interface StudentFormProps {
  mode: 'create' | 'edit';
  studentId?: string;
}

export interface ProfileCardData {
  name: string;
  email: string;
  rollNumber: string;
  gradeId: string;
  gradeName?: string;
  parentContact: string;
  dateOfBirth: string;
  city: string;
  state: string;
  previewUrl: string;
  currentProfileUrl?: string;
}