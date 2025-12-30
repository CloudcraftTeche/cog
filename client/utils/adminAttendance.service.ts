import api from "@/lib/api";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface ITeacherAttendance {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  gradeId?: {
    _id: string;
    grade: string;
  };
  date: Date;
  status: AttendanceStatus;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacher {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gradeId?: {
    _id: string;
    grade: string;
  } | string;
  qualifications?: string;
  specializations?: string[];
}

export const adminTeacherAttendanceService = {
  createOrUpdateAttendance: async (data: {
    teacherId: string;
    status: AttendanceStatus;
    gradeId?: string;
    remarks?: string;
    date?: Date;
  }): Promise<ITeacherAttendance> => {
    try {
      const response = await api.post("/teacher-attendance", {
        ...data,
        date: data.date ? data.date.toISOString() : undefined,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to mark teacher attendance"
      );
    }
  },

  getTodayAttendance: async (): Promise<ITeacherAttendance[]> => {
    try {
      const response = await api.get("/teacher-attendance/today");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch today's teacher attendance"
      );
    }
  },

  getAttendanceByDate: async (date: Date): Promise<ITeacherAttendance[]> => {
    try {
      const response = await api.get("/teacher-attendance/by-date", {
        params: { date: date.toISOString() },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch teacher attendance"
      );
    }
  },

  getAttendanceByGrade: async (
    gradeId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ITeacherAttendance[]> => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      const response = await api.get(`/teacher-attendance/grade/${gradeId}`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch grade teacher attendance"
      );
    }
  },

  getAttendanceStats: async (): Promise<{
    totalTeachers: number;
    todayAttendance: {
      present: number;
      absent: number;
      late: number;
      excused: number;
      total: number;
    };
  }> => {
    try {
      const response = await api.get("/teacher-attendance/stats");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch teacher attendance stats"
      );
    }
  },

  getAttendanceHeatmap: async (): Promise<
    Array<{
      _id: string;
      present: number;
      absent: number;
      late: number;
      excused: number;
    }>
  > => {
    try {
      const response = await api.get("/teacher-attendance/heatmap");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch teacher attendance heatmap"
      );
    }
  },

  exportAttendance: async (
    status?: string,
    startDate?: Date,
    endDate?: Date,
    gradeId?: string
  ): Promise<ITeacherAttendance[]> => {
    try {
      const params: any = {};

      if (status && status !== "all") {
        params.status = status;
      }

      if (startDate) {
        params.startDate = startDate.toISOString();
      }

      if (endDate) {
        params.endDate = endDate.toISOString();
      }

      if (gradeId) {
        params.gradeId = gradeId;
      }

      const response = await api.get("/teacher-attendance/export", { params });

      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to export teacher attendance"
      );
    }
  },

  getSpecificTeacherAttendance: async (
    teacherId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    records: ITeacherAttendance[];
    stats: {
      total: number;
      present: number;
      absent: number;
      late: number;
      excused: number;
      attendanceRate: number;
    };
  }> => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      const response = await api.get(`/teacher-attendance/teacher/${teacherId}`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch teacher attendance"
      );
    }
  },

  deleteAttendance: async (attendanceId: string): Promise<void> => {
    try {
      await api.delete(`/teacher-attendance/${attendanceId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to delete teacher attendance"
      );
    }
  },

  getAllTeachers: async (): Promise<ITeacher[]> => {
    try {
      const response = await api.get("/teachers");
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch teachers"
      );
    }
  },
};