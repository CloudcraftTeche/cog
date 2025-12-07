import api from "@/lib/api";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export interface IAttendance {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
    gradeId?: string | {
      _id: string;
      grade: string;
    };
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
export interface IAttendanceStats {
  totalStudents: number;
  totalTeachers: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
}
export interface IHeatmapData {
  _id: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}
export const attendanceService = {
  createOrUpdateAttendance: async (data: {
    studentId: string;
    status: "present" | "absent" | "late" | "excused";
    gradeId?: string;
    remarks?: string;
  }) => {
    const response = await api.post("/attendance", data);
    return response.data;
  },
  getTodayAttendance: async () => {
    const response = await api.get("/attendance/today");
    return response.data;
  },
  getAttendanceStats: async () => {
    const response = await api.get("/attendance/stats");
    return response.data;
  },
  getTeacherStats: async (teacherId: string): Promise<IAttendanceStats> => {
    const response = await api.get(`/attendance/stats/teacher/${teacherId}`);
    return response.data;
  },
  getAttendanceHeatmap: async () => {
    const response = await api.get("/attendance/heatmap");
    return response.data;
  },
  getTeacherHeatmap: async (teacherId: string) => {
    const response = await api.get(`/attendance/heatmap/teacher/${teacherId}`);
    return response.data;
  },
  exportAttendance: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    teacherId?: string;
  }) => {
    const response = await api.get("/attendance/export", { params });
    return response.data;
  },
  getStudentAttendance: async (
    studentId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await api.get(`/attendance/student/${studentId}`, { params });
    return response.data;
  },
  getAttendanceByGrade: async (
    gradeId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await api.get(`/attendance/grade/${gradeId}`, { params });
    return response.data;
  },
  deleteAttendance: async (attendanceId: string) => {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  },
};