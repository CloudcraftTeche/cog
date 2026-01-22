// ===== TYPES =====
// lib/types/grade.types.ts

export interface Unit {
  _id?: string;
  name: string;
  description?: string;
  orderIndex?: number;
}

export interface Grade {
  _id: string;
  grade: string;
  description?: string;
  units?: Unit[];
  students?: string[];
  teachers?: string[];
  isActive?: boolean;
  academicYear?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeWithStats extends Grade {
  totalStudents: number;
  totalChapters: number;
  completedChapters: number;
  partiallyCompletedChapters: number;
  notStartedChapters: number;
  averageChapterCompletion: number;
  totalAssignments: number;
  activeAssignments: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  averageAssignmentScore: number;
  totalAttendanceRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
}

export type GradeData = Omit<Grade, 'teachers'> & {
  teachers: Teacher[];
};

export interface ValidationErrors {
  grade?: string;
  description?: string;
  academicYear?: string;
  units?: string;
}

export interface GradeFormData {
  grade: string;
  description: string;
  academicYear: string;
  isActive: boolean;
  units: Unit[];
}

export interface GradePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}



