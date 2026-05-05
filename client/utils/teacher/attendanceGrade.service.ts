import api from "@/lib/api";
export interface IGrade {
  _id: string;
  grade: string;
  description?: string;
  students: string[];
  teachers: string[];
  isActive: boolean;
  academicYear?: string;
  createdAt: Date;
  updatedAt: Date;
}
export const gradeService = {
  getAllGrades: async (): Promise<IGrade[]> => {
    const response = await api.get("/grades");
    return response.data.data;
  },
  getActiveGrades: async (): Promise<IGrade[]> => {
    const response = await api.get("/grades?isActive=true");
    return response.data.data;
  },
  getTeacherGrades: async (teacherId: string): Promise<IGrade[]> => {
    const response = await api.get(`/grades/teacher/${teacherId}`);
    return response.data.data;
  },
  getGradeById: async (gradeId: string): Promise<IGrade> => {
    const response = await api.get(`/grades/${gradeId}`);
    return response.data.data;
  },
  getGradeStudents: async (gradeId: string) => {
    const response = await api.get(`/grades/${gradeId}/students`);
    return response.data.data;
  },
};