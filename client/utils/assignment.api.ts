import api from '@/lib/api';
import {
  IAssignment,
  ISubmission,
  CreateAssignmentData,
  CreateSubmissionData,
  GradeSubmissionData,
} from '../types/assignment.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const assignmentAPI = {
  createAssignment: async (data: CreateAssignmentData): Promise<ApiResponse<IAssignment>> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('contentType', data.contentType);
    formData.append('questions', data.questions);
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    formData.append('gradeId', data.gradeId);
    
    if (data.textContent) {
      formData.append('textContent', data.textContent);
    }
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await api.post('/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAssignments: async (params?: {
    gradeId?: string;
    status?: string;
  }): Promise<ApiResponse<IAssignment[]>> => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },

  getAssignmentById: async (id: string): Promise<ApiResponse<IAssignment>> => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  updateAssignment: async (
    id: string,
    data: Partial<CreateAssignmentData>
  ): Promise<ApiResponse<IAssignment>> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'file') {
        formData.append(key, value as string);
      }
    });
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await api.put(`/assignments/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAssignment: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  updateAssignmentStatus: async (
    id: string,
    status: 'active' | 'locked' | 'ended'
  ): Promise<ApiResponse<IAssignment>> => {
    const response = await api.patch(`/assignments/${id}/status`, { status });
    return response.data;
  },

  // Submission APIs
  createSubmission: async (data: CreateSubmissionData): Promise<ApiResponse<ISubmission>> => {
    const formData = new FormData();
    formData.append('assignmentId', data.assignmentId);
    formData.append('submissionType', data.submissionType);
    formData.append('answers', data.answers);
    
    if (data.textContent) {
      formData.append('textContent', data.textContent);
    }
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await api.post('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getSubmissions: async (params?: {
    assignmentId?: string;
    studentId?: string;
  }): Promise<ApiResponse<ISubmission[]>> => {
    const response = await api.get('/submissions', { params });
    return response.data;
  },

  getSubmissionById: async (id: string): Promise<ApiResponse<ISubmission>> => {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  getAssignmentSubmissions: async (assignmentId: string): Promise<ApiResponse<{
    submissions: ISubmission[];
    assignment: IAssignment;
    totalSubmissions: number;
    gradedSubmissions: number;
  }>> => {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  gradeSubmission: async (
    id: string,
    data: GradeSubmissionData
  ): Promise<ApiResponse<ISubmission>> => {
    const response = await api.post(`/submissions/${id}/grade`, data);
    return response.data;
  },

  updateSubmission: async (
    id: string,
    data: Partial<CreateSubmissionData>
  ): Promise<ApiResponse<ISubmission>> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'file') {
        formData.append(key, value as string);
      }
    });
    
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await api.put(`/submissions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteSubmission: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/submissions/${id}`);
    return response.data;
  },
};