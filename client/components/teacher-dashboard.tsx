import React, { useState, useEffect } from "react";
import { BarChart3, FileText, MessageSquare, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { LoadingSpinner } from "./teacher/dashboard/LoadingSpinner";
import { ErrorMessage } from "./teacher/dashboard/ErrorMessage";
import { OverviewStats } from "./teacher/dashboard/OverviewStats";
import { AttendanceChart } from "./teacher/dashboard/AttendanceChart";
import { ChapterProgressChart } from "./teacher/dashboard/ChapterProgressChart";
import { RecentQueriesTable } from "./teacher/dashboard/RecentQueriesTable";
import { UpcomingAssignmentsCard } from "./teacher/dashboard/UpcomingAssignmentsCard";
import { StudentPerformanceChart } from "./teacher/dashboard/StudentPerformanceChart";
import { AssignmentSubmissionsTable } from "./teacher/dashboard/AssignmentSubmissionsTable";
import { QueryStatusChart } from "./teacher/dashboard/QueryStatusChart";
export interface OverviewStats {
  totalStudents: number;
  totalChapters: number;
  totalAssignments: number;
  pendingQueries: number;
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
export interface Query {
  _id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  from: {
    _id: string;
    name: string;
    email: string;
    profilePictureUrl?: string;
  };
}
export interface UpcomingAssignment {
  title: string;
  endDate: string;
  grade: string;
  totalMarks: number;
}
export interface DashboardCharts {
  studentPerformanceByGrade: StudentPerformanceByGrade[];
  attendanceByDay: AttendanceByDay[];
  assignmentSubmissions: AssignmentSubmission[];
  queryStatusDistribution: QueryStatusDistribution[];
  chapterProgress: ChapterProgress[];
}
export interface RecentActivity {
  recentQueries: Query[];
  upcomingAssignments: UpcomingAssignment[];
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
interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
const TeacherDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<DashboardResponse>("/dashboard/teacher");
      setDashboardData(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }
  if (!dashboardData) {
    return (
      <ErrorMessage message="No data available" onRetry={fetchDashboardData} />
    );
  }
  const tabs: Tab[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "queries", label: "Queries", icon: MessageSquare },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your classes, track student progress, and handle assignments
          </p>
        </div>
      </div>
      {}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <OverviewStats overview={dashboardData.overview} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceChart data={dashboardData.charts.attendanceByDay} />
              <ChapterProgressChart
                data={dashboardData.charts.chapterProgress}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentQueriesTable
                  queries={dashboardData.recentActivity.recentQueries}
                />
              </div>
              <UpcomingAssignmentsCard
                assignments={dashboardData.recentActivity.upcomingAssignments}
              />
            </div>
          </div>
        )}
        {activeTab === "performance" && (
          <div className="space-y-6">
            <StudentPerformanceChart
              data={dashboardData.charts.studentPerformanceByGrade}
            />
            <ChapterProgressChart data={dashboardData.charts.chapterProgress} />
            <AttendanceChart data={dashboardData.charts.attendanceByDay} />
          </div>
        )}
        {activeTab === "assignments" && (
          <div className="space-y-6">
            <AssignmentSubmissionsTable
              data={dashboardData.charts.assignmentSubmissions}
            />
            <UpcomingAssignmentsCard
              assignments={dashboardData.recentActivity.upcomingAssignments}
            />
          </div>
        )}
        {activeTab === "queries" && (
          <div className="space-y-6">
            <QueryStatusChart
              data={dashboardData.charts.queryStatusDistribution}
            />
            <RecentQueriesTable
              queries={dashboardData.recentActivity.recentQueries}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default TeacherDashboard;
