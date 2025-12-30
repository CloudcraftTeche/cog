import api from "@/lib/api";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export interface IAttendance {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
    gradeId?:
      | {
          _id: string;
          grade: string;
        }
      | string;
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
export const attendanceService = {
  createOrUpdateAttendance: async (data: {
    studentId: string;
    status: AttendanceStatus;
    gradeId?: string;
    remarks?: string;
    date?: Date;
  }): Promise<IAttendance> => {
    try {
      const response = await api.post("/attendance", {
        ...data,
        date: data.date ? data.date.toISOString() : undefined,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to mark attendance"
      );
    }
  },
  getTodayAttendance: async (): Promise<IAttendance[]> => {
    try {
      const response = await api.get("/attendance/today");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch today's attendance"
      );
    }
  },

  getAttendanceByGrade: async (
    gradeId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<IAttendance[]> => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();
      const response = await api.get(`/attendance/grade/${gradeId}`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch grade attendance"
      );
    }
  },
  getAttendanceStats: async (): Promise<{
    totalStudents: number;
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
      const response = await api.get("/attendance/stats");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch attendance stats"
      );
    }
  },
  getTeacherStats: async (
    teacherId: string
  ): Promise<{
    totalStudents: number;
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
      const response = await api.get(`/attendance/stats/teacher/${teacherId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch teacher stats"
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
      const response = await api.get("/attendance/heatmap");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch attendance heatmap"
      );
    }
  },
  getTeacherHeatmap: async (
    teacherId: string
  ): Promise<
    Array<{
      _id: string;
      present: number;
      absent: number;
      late: number;
      excused: number;
    }>
  > => {
    try {
      const response = await api.get(
        `/attendance/heatmap/teacher/${teacherId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch teacher heatmap"
      );
    }
  },
  getAttendanceByDate: async (date: Date): Promise<IAttendance[]> => {
    try {
      const response = await api.get("/attendance/by-date", {
        params: { date: date.toISOString() },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch attendance"
      );
    }
  },
exportAttendance: async (
  status?: string,
  startDate?: Date,
  endDate?: Date
): Promise<IAttendance[]> => {
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

    const response = await api.get("/attendance/export", { params });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || "Failed to export attendance"
    );
  }
},
  getStudentAttendance: async (
    studentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    records: IAttendance[];
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
      const response = await api.get(`/attendance/student/${studentId}`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to fetch student attendance"
      );
    }
  },
  deleteAttendance: async (attendanceId: string): Promise<void> => {
    try {
      await api.delete(`/attendance/${attendanceId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to delete attendance"
      );
    }
  },
};
