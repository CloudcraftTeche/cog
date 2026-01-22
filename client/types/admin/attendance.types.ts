export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
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
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceStats {
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

export interface HeatmapData {
  _id: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface ValidationError {
  field: string;
  message: string;
}


export interface StatsCardsProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    todayAttendance: {
      present: number;
      absent: number;
      late: number;
      excused: number;
      total: number;
    };
  } | null;
}

export interface AttendancePieChartProps {
  data: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

export interface AttendanceTrendChartProps {
  data: HeatmapData[];
}

export interface AttendanceHeatmapProps {
  data: HeatmapData[];
}

export interface ExportSectionProps {
  onExport: (status: string, startDate?: string, endDate?: string) => Promise<void>;
}

export interface AttendanceTableProps {
  records: AttendanceRecord[];
  title?: string;
}

export interface NavigationProps {
  selectedView: string;
  onViewChange: (view: string) => void;
}

export interface StatsSectionProps {
  stats: AttendanceStats | null;
  isLoading: boolean;
}