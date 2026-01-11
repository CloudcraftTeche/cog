"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  LayoutDashboard,
  Map,
  FileText,
  Award,
  Megaphone,
  MessageSquare,
} from "lucide-react";
import api from "@/lib/api";
import { ChartsSection } from "./admin/dashboard/ChartsSection";
import { HeatmapView } from "./admin/dashboard/HeatmapView";
import { ReportsView } from "./admin/dashboard/ReportsView";
import { SyllabusCoverage } from "./admin/dashboard/SyllabusCoverage";
import { SuperAdminOverviewStats } from "./admin/dashboard/OverviewStatsSuperAdmin";
import { WeeklyActiveStudents } from "./admin/dashboard/WeeklyActiveStudents";
export default function SuperAdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedView, setSelectedView] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fetchAllData = useCallback(async () => {
    if (!user || !isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const dashboardResponse = await api.get("/dashboard/admin");
      if (dashboardResponse.data?.success) {
        setDashboardData(dashboardResponse.data.data);
      } else {
        throw new Error(
          dashboardResponse.data?.error || "Failed to fetch dashboard data"
        );
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-xl">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <p className="text-2xl font-bold text-slate-800">
            Loading Dashboard...
          </p>
          <p className="text-slate-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-tr from-red-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl mx-auto">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mb-2">
            Unable to Load Dashboard
          </p>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DashboardNav
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        refreshing={refreshing}
        handleRefresh={handleRefresh}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === "dashboard" && (
          <>
            <SuperAdminOverviewStats overview={dashboardData?.overview} />
            <div className="my-3">
              <WeeklyActiveStudents />
            </div>
            <ChartsSection charts={dashboardData?.charts} />
            <SyllabusCoverage />
            <InsightsSection insights={dashboardData?.insights} />
          </>
        )}
        {selectedView === "heatmap" && (
          <HeatmapView
            attendanceTrend={dashboardData?.charts?.attendanceTrend}
          />
        )}
        {selectedView === "reports" && (
          <ReportsView
            recentAnnouncements={dashboardData?.insights?.recentAnnouncements}
            recentQueries={dashboardData?.insights?.recentQueries}
          />
        )}
      </div>
    </div>
  );
}
const DashboardNav = ({
  selectedView,
  setSelectedView,
  refreshing,
  handleRefresh,
}: any) => {
  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedView("dashboard")}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                selectedView === "dashboard"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setSelectedView("heatmap")}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                selectedView === "heatmap"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Heatmap</span>
            </button>
            <button
              onClick={() => setSelectedView("reports")}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                selectedView === "reports"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </button>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
const InsightsSection = ({ insights }: any) => {
  const {
    topPerformers = [],
    recentAnnouncements = [],
    recentQueries = [],
  } = insights || {};
  return (
    <div className="space-y-8 mt-8">
      {}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">
                Top Performing Students
              </h3>
              <p className="text-amber-100 text-sm">
                Ranked by completion and scores
              </p>
            </div>
          </div>
        </div>
        <div className="p-8">
          {topPerformers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Roll Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Chapters
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Avg Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topPerformers.map((student: any, index: number) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? "bg-amber-100 text-amber-700"
                              : index === 1
                                ? "bg-slate-100 text-slate-700"
                                : index === 2
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {student.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.rollNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {student.completedChapters} completed
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {student.averageScore}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No performance data available</p>
            </div>
          )}
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Recent Announcements
              </h3>
            </div>
          </div>
          <div className="p-6">
            {recentAnnouncements.length > 0 ? (
              <div className="space-y-3">
                {recentAnnouncements.map((announcement: any) => (
                  <div
                    key={announcement._id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {new Date(announcement.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No recent announcements</p>
              </div>
            )}
          </div>
        </div>
        {}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Recent Queries</h3>
            </div>
          </div>
          <div className="p-6">
            {recentQueries.length > 0 ? (
              <div className="space-y-3">
                {recentQueries.map((query: any) => (
                  <div
                    key={query._id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 flex-1">
                        {query.subject}
                      </h4>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${
                          query.status === "resolved"
                            ? "bg-emerald-100 text-emerald-700"
                            : query.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {query.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>From: {query.from?.name || "Unknown"}</span>
                      <span>
                        {new Date(query.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No recent queries</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
