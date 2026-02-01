export interface Teacher {
  name: string;
  email: string;
}
export interface User {
  name?: string;
  _id?: string;
}
export interface Announcement {
  _id: string;
  title: string;
  createdAt: string;
}
export interface Query {
  _id: string;
  subject: string;
  status: string;
  createdAt: string;
  from?: User;
}
export interface TopPerformer {
  studentId: string;
  name?: string;
  rollNumber?: string;
  completedChapters: number;
  averageScore: number;
}
export interface GradeDistribution {
  grade: string;
  studentCount: number;
}
export interface AssignmentStat {
  status: string;
  count: number;
}
export interface GrowthData {
  month: string;
  students?: number;
  teachers?: number;
}
export interface AttendanceTrendItem {
  date: string;
  present: number;
  absent: number;
  late: number;
  total?: number;
  attendanceRate?: number;
  _id?: string;
}
export interface SyllabusCoverageData {
  gradeId: string;
  grade: string;
  totalChapters: number;
  totalStudents: number;
  coveragePercentage: number;
  teachers: Teacher[];
  completedChapters: number;
}
export interface OverviewData {
  totalStudents?: number;
  totalTeachers?: number;
  totalGrades?: number;
  totalChapters?: number;
  totalAnnouncements?: number;
  totalQueries?: number;
  completionRate?: number;
  weeklyActiveStudents?: number;
}
export interface ChartsData {
  gradeDistribution?: GradeDistribution[];
  assignmentStats?: AssignmentStat[];
  studentGrowth?: GrowthData[];
  teacherGrowth?: GrowthData[];
  attendanceTrend?: AttendanceTrendItem[];
  syllabusCoverage?: SyllabusCoverageData[];
}
export interface InsightsData {
  topPerformers?: TopPerformer[];
  recentAnnouncements?: Announcement[];
  recentQueries?: Query[];
}
export interface DashboardData {
  overview?: OverviewData;
  charts?: ChartsData;
  insights?: InsightsData;
}
export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  error?: string;
}
export type DashboardView = "dashboard" | "heatmap" | "reports";
export interface OverviewStatsProps {
  overview?: OverviewData;
}
export interface ChartsSectionProps {
  charts?: ChartsData;
}
export interface HeatmapViewProps {
  heatmapData?: AttendanceTrendItem[];
  attendanceTrend?: AttendanceTrendItem[];
}
export interface ReportsViewProps {
  recentAnnouncements?: Announcement[];
  recentQueries?: Query[];
}
export interface InsightsSectionProps {
  insights?: InsightsData;
}
export interface DashboardNavProps {
  selectedView: DashboardView;
  setSelectedView: (view: DashboardView) => void;
  refreshing: boolean;
  handleRefresh: () => void;
}
export type QueryStatus =
  | "resolved"
  | "pending"
  | "in_progress"
  | "cancelled"
  | "rejected";
