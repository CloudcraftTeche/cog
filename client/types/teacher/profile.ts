export type Gender = "male" | "female" | "other";

export interface Address {
  street: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postalCode: string | null;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  qualifications: string | null;
  specializations: string[];
  gradeId: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  address: Address;
  profilePictureUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherResponse {
  success: boolean;
  data: Teacher;
}

export interface TeacherUpdatePayload {
  name?: string;
  phone?: string | null;
  qualifications?: string | null;
  specializations?: string[];
  gradeId?: string | null;
  gender?: Gender | null;
  dateOfBirth?: string | null;
  address?: Partial<Address>;
  profilePicture?: File | null;
}
