"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { TrendingUp, AlertTriangle, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { OverviewStats } from "./admin/dashboard/OverviewStats";
import { ChartsSection } from "./admin/dashboard/ChartsSection";
import { HeatmapView } from "./admin/dashboard/HeatmapView";
import { ReportsView } from "./admin/dashboard/ReportsView";
import { SyllabusCoverage } from "./admin/dashboard/SyllabusCoverage";
import { WeeklyActiveStudents } from "./admin/dashboard/WeeklyActiveStudents";
export default function AdminDashboard() {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-4 animate-pulse">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-bold text-red-600 mb-2">
            Error Loading Dashboard
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="relative overflow-hidden">
      <DashboardNav
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        refreshing={refreshing}
        handleRefresh={handleRefresh}
      />
      <div className="relative max-w-7xl mx-auto p-6">
        {selectedView === "dashboard" && (
          <>
            <OverviewStats overview={dashboardData?.overview} />
            <div className="my-3">
              <WeeklyActiveStudents/>
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
    <nav className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-8">
            <div className="flex space-x-1 bg-gray-100/80 p-1 rounded-2xl backdrop-blur-sm">
              <button
                onClick={() => setSelectedView("dashboard")}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedView === "dashboard"
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-lg shadow-purple-200/50 scale-105"
                    : "text-gray-600 hover:bg-white/80 hover:text-purple-600 hover:scale-105"
                }`}
              >
                <span>Overview</span>
              </button>
              <button
                onClick={() => setSelectedView("heatmap")}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedView === "heatmap"
                    ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg shadow-orange-200/50 scale-105"
                    : "text-gray-600 hover:bg-white/80 hover:text-orange-600 hover:scale-105"
                }`}
              >
                <span>Heatmap</span>
              </button>
              <button
                onClick={() => setSelectedView("reports")}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedView === "reports"
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-200/50 scale-105"
                    : "text-gray-600 hover:bg-white/80 hover:text-emerald-600 hover:scale-105"
                }`}
              >
                <span>Reports</span>
              </button>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
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
    <div className="space-y-10">
      {}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/50 to-orange-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-yellow-100/50">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Top Performing Students
              </h3>
              <p className="text-gray-500 font-medium">
                Based on chapter completion and scores
              </p>
            </div>
          </div>
          {topPerformers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Roll Number
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Completed Chapters
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Average Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topPerformers.map((student: any, index: number) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-yellow-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {student.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.rollNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        {student.completedChapters}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                        {student.averageScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No top performers data available
            </p>
          )}
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-blue-100/50">
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              Recent Announcements
            </h3>
            {recentAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement: any) => (
                  <div
                    key={announcement._id}
                    className="p-4 bg-blue-50 rounded-xl border border-blue-200"
                  >
                    <h4 className="font-bold text-gray-900">
                      {announcement.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No recent announcements
              </p>
            )}
          </div>
        </div>
        {}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-purple-100/50">
            <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Recent Queries
            </h3>
            {recentQueries.length > 0 ? (
              <div className="space-y-4">
                {recentQueries.map((query: any) => (
                  <div
                    key={query._id}
                    className="p-4 bg-purple-50 rounded-xl border border-purple-200"
                  >
                    <h4 className="font-bold text-gray-900">{query.subject}</h4>
                    <p className="text-sm text-gray-600">
                      From: {query.from?.name || "Unknown"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          query.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : query.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {query.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No recent queries
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
