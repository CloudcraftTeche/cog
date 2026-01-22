
import api from "@/lib/api";
import {
  AssignmentsResponse,
  AssignmentResponse,
  IGrade,
  SubmissionsResponse,
  GradeSubmissionDTO,
} from "@/types/admin/assignment.types";

export const assignmentService = {
  // Get all assignments with filters
  getAssignments: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get<AssignmentsResponse>("/assignments", {
      params: {
        search: params?.search,
        page: params?.page || 1,
        limit: params?.limit || 10,
        status: params?.status !== "all" ? params?.status : undefined,
      },
    });
    return response.data;
  },

  // Get single assignment
  getAssignment: async (id: string) => {
    const response = await api.get<AssignmentResponse>(`/assignments/${id}`);
    return response.data.data || response.data;
  },

  // Get all grades
  getGrades: async () => {
    const response = await api.get<{ success: boolean; data: IGrade[] }>(
      "/grades/all"
    );
    return response.data.data || [];
  },

  // Create assignment for single grade
  createAssignmentForGrade: async (gradeId: string, formData: FormData) => {
    const response = await api.post<AssignmentResponse>(
      `/assignments/grade/${gradeId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Create assignment for multiple grades
  createAssignmentForMultipleGrades: async (formData: FormData) => {
    const response = await api.post<AssignmentResponse>(
      "/assignments/multiple",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Update assignment
  updateAssignment: async (id: string, formData: FormData) => {
    const response = await api.put<AssignmentResponse>(
      `/assignments/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Delete assignment
  deleteAssignment: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/assignments/${id}`
    );
    return response.data;
  },

  // Get submissions for assignment
  getSubmissions: async (
    assignmentId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
    }
  ) => {
    const response = await api.get<SubmissionsResponse>(
      `/assignments/${assignmentId}/submissions`,
      {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          search: params?.search?.trim() || undefined,
        },
      }
    );
    return response.data;
  },

  // Grade submission
  gradeSubmission: async (
    submissionId: string,
    gradeData: GradeSubmissionDTO
  ) => {
    const response = await api.put(
      `/submissions/${submissionId}/grade`,
      gradeData
    );
    return response.data;
  },
};