// ===== TYPES =====
// lib/types/teacher.types.ts

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Grade {
  _id: string;
  grade: string;
  section?: string;
}

export interface ITeacher {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date | string;
  profilePictureUrl?: string;
  profilePicturePublicId?: string;
  address?: IAddress;
  qualifications?: string;
  specializations?: string[];
  gradeId: Grade | string;
  createdBy: string;
  role: "teacher";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  gradeId: string;
  qualifications: string;
  specializations: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

export interface FormErrors {
  [key: string]: string;
}

export interface TeacherListParams {
  page: number;
  limit: number;
  query?: string;
}

export interface TeacherListResponse {
  success: boolean;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  data: ITeacher[];
}
