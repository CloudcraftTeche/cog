import api from "@/lib/api";
import { Grade, TeacherResponse } from "./teacherProfileValidation";

export const teacherService = {
  /**
   * Fetch teacher data by ID
   */
  async getTeacherById(id: string): Promise<TeacherResponse> {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  /**
   * Update teacher data
   */
  async updateTeacher(id: string, formData: FormData): Promise<TeacherResponse> {
    const response = await api.put(`/teachers/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Fetch all grades
   */
  async getGrades(): Promise<{ success: boolean; data: Grade[] }> {
    const response = await api.get("/grades");
    return response.data;
  },
};