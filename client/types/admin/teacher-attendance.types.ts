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
  gradeId?:
    | {
        _id: string;
        grade: string;
      }
    | string;
  qualifications?: string;
  specializations?: string[];
}

export interface TeacherAttendanceStats {
  totalTeachers: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
}

export interface TeacherAttendanceHeatmapData {
  _id: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}
