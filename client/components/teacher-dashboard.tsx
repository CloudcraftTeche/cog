"use client";
import React, { useState } from "react";
import {
  BarChart3,
  FileText,
  MessageSquare,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
import { WeeklyActiveStudents } from "./teacher/dashboard/WeeklyActive";
import { SyllabusCoverage } from "./teacher/dashboard/SyllabusCoverage";
import { StrugglingStudents } from "./teacher/dashboard/StrugglingStudents";
import { PendingGradings } from "./teacher/dashboard/PendingGradings";
import {
  DashboardTab,
  TabConfig,
} from "@/types/teacher/teacherDashboard.types";
import {
  dashboardKeys,
  useDashboardData,
} from "@/hooks/teacher/useTeacherDashboard";

const TABS: TabConfig[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "assignments", label: "Assignments", icon: FileText },
  { id: "queries", label: "Queries", icon: MessageSquare },
];

const TeacherDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error.message || "Failed to fetch dashboard data"}
        onRetry={() => refetch()}
      />
    );
  }

  if (!dashboardData) {
    return (
      <ErrorMessage message="No data available" onRetry={() => refetch()} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your classes, track student progress, and handle
                assignments
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  type="button"
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
            <WeeklyActiveStudents />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceChart
                data={dashboardData.charts.attendanceByDay ?? []}
              />
              <ChapterProgressChart
                data={dashboardData.charts.chapterProgress ?? []}
              />
            </div>
            <SyllabusCoverage />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentQueriesTable
                  queries={dashboardData.recentActivity.recentQueries ?? []}
                />
              </div>
              <UpcomingAssignmentsCard
                assignments={
                  dashboardData.recentActivity.upcomingAssignments ?? []
                }
              />
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            <StudentPerformanceChart
              data={dashboardData.charts.studentPerformanceByGrade ?? []}
            />
            <ChapterProgressChart
              data={dashboardData.charts.chapterProgress ?? []}
            />
            <AttendanceChart
              data={dashboardData.charts.attendanceByDay ?? []}
            />
            <StrugglingStudents />
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="space-y-6">
            <AssignmentSubmissionsTable
              data={dashboardData.charts.assignmentSubmissions ?? []}
            />
            <UpcomingAssignmentsCard
              assignments={
                dashboardData.recentActivity.upcomingAssignments ?? []
              }
            />
            <PendingGradings />
          </div>
        )}

        {activeTab === "queries" && (
          <div className="space-y-6">
            <QueryStatusChart
              data={dashboardData.charts.queryStatusDistribution ?? []}
            />
            <RecentQueriesTable
              queries={dashboardData.recentActivity.recentQueries ?? []}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
