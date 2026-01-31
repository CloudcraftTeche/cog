// types/student.types.ts

export type Gender = "male" | "female" | "other";

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface IStudent {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  gradeId?: string;
  gender?: Gender;
  dateOfBirth?: string;
  parentContact?: string;
  address: IAddress;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  gradeId?: string;
  gender?: Gender;
  dateOfBirth?: string;
  parentContact?: string;
  address: IAddress;
  profilePictureUrl?: string;
}

export interface StudentUpdatePayload extends Partial<StudentFormData> {
  profilePicture?: File;
}

export interface StudentResponse {
  success: boolean;
  data: IStudent;
  message?: string;
}

export interface StudentUpdateResponse {
  success: boolean;
  data: IStudent;
  message?: string;
}