export interface Teacher {
  name: string;
  email: string;
}
export interface Student {
  studentId: string;
  name: string;
  email: string;
  rollNumber: string;
  profilePictureUrl?: string;
  attendanceRate: number;
  avgScore: number;
  missingSubmissions: number;
  issues: string[];
}
export interface QueryUser {
  _id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
}
export interface Query {
  _id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  from: QueryUser;
}
export interface OverviewStats {
  totalStudents: number;
  totalChapters: number;
  totalAssignments: number;
  pendingQueries: number;
  weeklyActiveStudents?: number;
}
export interface StudentPerformanceByGrade {
  grade: string;
  students: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
}
export interface AttendanceByDay {
  date: string;
  present: number;
  absent: number;
  late: number;
}
export interface AssignmentSubmission {
  title: string;
  status: string;
  totalStudents: number;
  submitted: number;
  graded: number;
  pending: number;
  pendingGrading: number;
}
export interface QueryStatusDistribution {
  status: string;
  count: number;
}
export interface ChapterProgress {
  status: string;
  count: number;
}
export interface UpcomingAssignment {
  title: string;
  endDate: string;
  grade: string;
  totalMarks: number;
}
export interface CoverageData {
  gradeId: string;
  grade: string;
  totalChapters: number;
  totalStudents: number;
  coveragePercentage: number;
  teachers: Teacher[];
  completedChapters: number;
}
export interface Submission {
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  submittedAt: Date;
}
export interface PendingAssignment {
  assignmentId: string;
  assignmentTitle: string;
  endDate: Date;
  totalMarks: number;
  pendingCount: number;
  submissions: Submission[];
}
export interface DashboardCharts {
  studentPerformanceByGrade: StudentPerformanceByGrade[];
  attendanceByDay: AttendanceByDay[];
  assignmentSubmissions: AssignmentSubmission[];
  queryStatusDistribution: QueryStatusDistribution[];
  chapterProgress: ChapterProgress[];
  syllabusCoverage?: CoverageData[];
}
export interface RecentActivity {
  recentQueries: Query[];
  upcomingAssignments: UpcomingAssignment[];
  strugglingStudents?: Student[];
  pendingGradings?: PendingAssignment[];
}
export interface DashboardData {
  overview: OverviewStats;
  charts: DashboardCharts;
  recentActivity: RecentActivity;
}
export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}
export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
export interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  gradient: string;
  bgGradient: string;
  borderColor: string;
  progressBar: string;
  shadow: string;
}
export interface PriorityConfig {
  gradient: string;
  text: string;
  icon: string;
}
export type DashboardTab =
  | "overview"
  | "performance"
  | "assignments"
  | "queries";
export interface ErrorState {
  message: string;
  code?: string;
}
