import api from "@/lib/api";
import { IAttendance } from "./teacherAttendance.service";
export interface IStudentAttendanceResponse {
  records: IAttendance[];
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
}
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
  role: "student";
  rollNumber?: string;
  parentContact?: string;
  gradeId?: {
    _id: string;
    grade: string;
    description?: string;
  } | string;
  createdAt?: Date;
  updatedAt?: Date;
  __t?: string; 
}
export interface IStudentPopulated extends Omit<IStudent, 'gradeId'> {
  gradeId?: {
    _id: string;
    grade: string;
    description?: string;
  };
}
export const studentService = {
  getAllStudents: async (): Promise<IStudent[]> => {
    const response = await api.get("/students");
    return response.data.data;
  },
  getStudentById: async (studentId: string): Promise<IStudent> => {
    const response = await api.get(`/students/${studentId}`);
    return response.data.data;
  },
  getStudentsByGrade: async (gradeId: string): Promise<IStudent[]> => {
    const response = await api.get(`/students/grade/${gradeId}`);
    return response.data.data;
  },
}