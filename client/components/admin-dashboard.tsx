"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Calendar,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  PieChartIcon,
  Activity,
  Star,
  Award,
  Target,
  BookOpen,
  FileText,
  CheckCircle,
  Layers,
  BookMarked,
  RefreshCw,
  UserCheck,
  UserX,
  Clock,
  Download,
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedView, setSelectedView] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [attendanceOverview, setAttendanceOverview] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchAllData();
    }
  }, [user, isAuthenticated]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardResponse, heatmapResponse, attendanceResponse] =
        await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/heatmap"),
          api.get("/admin/attendance/overview"),
        ]);

      if (dashboardResponse.data?.success) {
        setDashboardData(dashboardResponse.data.data);
      } else {
        throw new Error(
          dashboardResponse.data?.error || "Failed to fetch dashboard data"
        );
      }

      if (heatmapResponse.data) {
        setHeatmapData(heatmapResponse.data || []);
      }

      if (attendanceResponse.data) {
        setAttendanceOverview(attendanceResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const exportData = async (status = "all") => {
    try {
      const response = await api.get(`/export/attendance?status=${status}`);

      const csvData = convertToCSV(response.data);
      downloadCSV(
        csvData,
        `attendance-${status}-${new Date().toISOString().split("T")[0]}.csv`
      );
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const convertToCSV = (data: any) => {
    const header = "Student Name,Email,Class,Teacher,Date,Status\n";
    const rows = data
      .map(
        (item: any) =>
          `"${item.studentId?.name}","${item.studentId?.email}","${
            item.studentId?.class
          }","${item.teacherId?.name}","${format(
            new Date(item.date),
            "dd-MM-yyyy"
          )}","${item.status}"`
      )
      .join("\n");
    return header + rows;
  };

  const downloadCSV = (csvData: any, filename: any) => {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = [
    "#8b5cf6",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#f97316",
    "#84cc16",
  ];

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
    <div className=" relative overflow-hidden">
      <nav className="realtive">
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
                  <BarChart3 className="h-4 w-4" />
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
                  <Activity className="h-4 w-4" />
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
                  <ClipboardList className="h-4 w-4" />
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

      <div className="relative max-w-7xl mx-auto p-6">
        {selectedView === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              <div className="group relative">
                <div className="relative bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-105 hover:-rotate-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ring-4 ring-white/10">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-purple-100 text-sm font-semibold uppercase tracking-wider">
                        Total
                      </p>
                      <h3 className="text-xl font-bold">Students</h3>
                    </div>
                  </div>
                  <p className="text-5xl font-black mb-4">
                    {dashboardData?.totals.students || 0}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/20 rounded-full h-3">
                      <div className="bg-gradient-to-r from-white to-purple-100 rounded-full h-3 w-3/4 shadow-sm"></div>
                    </div>
                    <Star className="h-4 w-4 text-yellow-300" />
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 hover:rotate-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ring-4 ring-white/10">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">
                        Total
                      </p>
                      <h3 className="text-xl font-bold">Teachers</h3>
                    </div>
                  </div>
                  <p className="text-5xl font-black mb-4">
                    {dashboardData?.totals.teachers || 0}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/20 rounded-full h-3">
                      <div className="bg-gradient-to-r from-white to-blue-100 rounded-full h-3 w-4/5 shadow-sm"></div>
                    </div>
                    <Award className="h-4 w-4 text-yellow-300" />
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:scale-105 hover:-rotate-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ring-4 ring-white/10">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-green-100 text-sm font-semibold uppercase tracking-wider">
                        Total
                      </p>
                      <h3 className="text-xl font-bold">Chapters</h3>
                    </div>
                  </div>
                  <p className="text-5xl font-black mb-4">
                    {dashboardData?.totals?.chapters || 0}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/20 rounded-full h-3">
                      <div className="bg-gradient-to-r from-white to-green-100 rounded-full h-3 w-5/6 shadow-sm"></div>
                    </div>
                    <Target className="h-4 w-4 text-yellow-300" />
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-orange-500 via-red-600 to-pink-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 hover:scale-105 hover:rotate-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ring-4 ring-white/10">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider">
                        Total
                      </p>
                      <h3 className="text-xl font-bold">Assignments</h3>
                    </div>
                  </div>
                  <p className="text-5xl font-black mb-4">
                    {dashboardData?.totals.assignments || 0}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white/20 rounded-full h-3">
                      <div className="bg-gradient-to-r from-white to-orange-100 rounded-full h-3 w-4/5 shadow-sm"></div>
                    </div>
                    <ClipboardList className="h-4 w-4 text-yellow-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-indigo-500/25 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ring-4 ring-white/10">
                      <Layers className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider">
                        Total
                      </p>
                      <h3 className="text-xl font-bold">Units</h3>
                    </div>
                  </div>
                  <p className="text-5xl font-black mb-4">
                    {dashboardData?.totals?.units || 0}
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-pink-500 via-rose-600 to-red-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ring-4 ring-white/10">
                      <BookMarked className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-pink-100 text-sm font-semibold uppercase tracking-wider">
                        Total
                      </p>
                      <h3 className="text-xl font-bold">Grades</h3>
                    </div>
                  </div>
                  <p className="text-5xl font-black mb-4">
                    {dashboardData?.totals?.grades || 0}
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ring-4 ring-white/10">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-100 text-sm font-semibold uppercase tracking-wider">
                        Total
                      </p>
                      <h3 className="text-xl font-bold">Submissions</h3>
                    </div>
                  </div>
                  <p className="text-5xl font-black mb-4">
                    {dashboardData?.totals?.submissions || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
              {/* Students by Grade Chart */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-purple-100/50 hover:shadow-purple-500/10 transition-all duration-500">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg">
                      <PieChartIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Students by Grade
                      </h3>
                      <p className="text-gray-500 font-medium">
                        Distribution across all grades
                      </p>
                    </div>
                  </div>
                  {dashboardData?.studentsByGrade &&
                  Array.isArray(dashboardData.studentsByGrade) &&
                  dashboardData.studentsByGrade.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={dashboardData.studentsByGrade.slice(0, 8)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ grade, percent }: any) =>
                            `${grade || "N/A"} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                          strokeWidth={4}
                          stroke="#fff"
                        >
                          {dashboardData.studentsByGrade
                            .slice(0, 8)
                            .map((entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "none",
                            borderRadius: "20px",
                            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                            backdropFilter: "blur(20px)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <PieChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">
                          No grade distribution data available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Status Chart */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-blue-100/50 hover:shadow-blue-500/10 transition-all duration-500">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Submission Status
                      </h3>
                      <p className="text-gray-500 font-medium">
                        Assignment completion overview
                      </p>
                    </div>
                  </div>
                  {dashboardData?.submissionStats &&
                  Array.isArray(dashboardData.submissionStats) &&
                  dashboardData.submissionStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={dashboardData.submissionStats}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e0e7ff"
                          strokeWidth={1}
                        />
                        <XAxis
                          dataKey="status"
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "none",
                            borderRadius: "20px",
                            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                            backdropFilter: "blur(20px)",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#3b82f6"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">
                          No submission data available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trends Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
              {/* Content Creation Trends */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/50 to-teal-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-emerald-100/50 hover:shadow-emerald-500/10 transition-all duration-500">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Content Creation Trends
                      </h3>
                      <p className="text-gray-500 font-medium">
                        Monthly content development
                      </p>
                    </div>
                  </div>
                  {dashboardData?.assignmentTrend &&
                  Array.isArray(dashboardData.assignmentTrend) &&
                  dashboardData.assignmentTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={dashboardData.assignmentTrend}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e0f2fe"
                          strokeWidth={1}
                        />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "none",
                            borderRadius: "20px",
                            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                            backdropFilter: "blur(20px)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          fill="url(#colorGradient)"
                          stroke="#10b981"
                          strokeWidth={3}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#059669"
                          strokeWidth={4}
                          dot={{ fill: "#059669", strokeWidth: 3, r: 6 }}
                          activeDot={{
                            r: 8,
                            stroke: "#059669",
                            strokeWidth: 3,
                          }}
                        />
                        <defs>
                          <linearGradient
                            id="colorGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">
                          No trend data available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submission Activity */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 to-red-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-orange-100/50 hover:shadow-orange-500/10 transition-all duration-500">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-lg">
                      <Activity className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Submission Activity
                      </h3>
                      <p className="text-gray-500 font-medium">
                        Student engagement metrics
                      </p>
                    </div>
                  </div>
                  {dashboardData?.submissionTrend &&
                  Array.isArray(dashboardData.submissionTrend) &&
                  dashboardData.submissionTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={dashboardData.submissionTrend}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#fef3c7"
                          strokeWidth={1}
                        />
                        <XAxis dataKey="month" stroke="#92400e" fontSize={12} />
                        <YAxis stroke="#92400e" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.98)",
                            border: "none",
                            borderRadius: "20px",
                            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                            backdropFilter: "blur(20px)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#f59e0b"
                          strokeWidth={4}
                          fill="url(#colorOrange)"
                        />
                        <defs>
                          <linearGradient
                            id="colorOrange"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#f59e0b"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#f59e0b"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">
                          No activity data available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Students Section */}
            <div className="relative group mb-10">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-200/50 to-purple-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-violet-100/50">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      Recently Registered Students
                    </h3>
                    <p className="text-gray-500 font-medium">
                      Latest student enrollments
                    </p>
                  </div>
                </div>
                {dashboardData?.recentStudents &&
                Array.isArray(dashboardData.recentStudents) &&
                dashboardData.recentStudents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {dashboardData.recentStudents
                      .slice(0, 10)
                      .map((student: any, index: number) => (
                        <div
                          key={student?.id || index}
                          className="group relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                              <Users className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2 truncate">
                              {student?.name || "N/A"}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1 truncate">
                              {student?.email || "N/A"}
                            </p>
                            <p className="text-sm font-semibold text-purple-600">
                              {student?.class || "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold text-gray-500">
                      No recent students available
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200/50 to-purple-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-indigo-100/50">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <Download className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Export Attendance Data
                    </h3>
                    <p className="text-gray-500 font-medium">
                      Download comprehensive reports
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <button
                    onClick={() => exportData("all")}
                    className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 text-white px-8 py-6 rounded-2xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-105 flex items-center space-x-3"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Download className="h-6 w-6 relative z-10" />
                    <span className="font-bold text-lg relative z-10">
                      Export All
                    </span>
                  </button>
                  <button
                    onClick={() => exportData("present")}
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white px-8 py-6 rounded-2xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:scale-105 flex items-center space-x-3"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <UserCheck className="h-6 w-6 relative z-10" />
                    <span className="font-bold text-lg relative z-10">
                      Export Present
                    </span>
                  </button>
                  <button
                    onClick={() => exportData("absent")}
                    className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-600 to-rose-600 text-white px-8 py-6 rounded-2xl hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-500 hover:scale-105 flex items-center space-x-3"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <UserX className="h-6 w-6 relative z-10" />
                    <span className="font-bold text-lg relative z-10">
                      Export Absent
                    </span>
                  </button>
                  <button
                    onClick={() => exportData("late")}
                    className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white px-8 py-6 rounded-2xl hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-500 hover:scale-105 flex items-center space-x-3"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Clock className="h-6 w-6 relative z-10" />
                    <span className="font-bold text-lg relative z-10">
                      Export Late
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedView === "heatmap" && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 to-red-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-orange-100/50">
              <div className="flex items-center space-x-4 mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Attendance Heatmap - Last 30 Days
                  </h3>
                  <p className="text-gray-500 font-medium text-lg">
                    Visual attendance pattern analysis
                  </p>
                </div>
              </div>
              {heatmapData &&
              Array.isArray(heatmapData) &&
              heatmapData.length > 0 ? (
                <ResponsiveContainer width="100%" height={550}>
                  <BarChart data={heatmapData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#fef3c7"
                      strokeWidth={1}
                    />
                    <XAxis dataKey="_id" stroke="#92400e" fontSize={12} />
                    <YAxis stroke="#92400e" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                        border: "none",
                        borderRadius: "20px",
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                        backdropFilter: "blur(20px)",
                      }}
                    />
                    <Bar
                      dataKey="present"
                      stackId="a"
                      fill="#10b981"
                      radius={[0, 0, 6, 6]}
                    />
                    <Bar
                      dataKey="late"
                      stackId="a"
                      fill="#f59e0b"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="absent"
                      stackId="a"
                      fill="#ef4444"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[550px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold">
                      No heatmap data available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedView === "reports" && (
          <div className="space-y-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-200/50 to-pink-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-red-100/50">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      Exception Reports
                    </h3>
                    <p className="text-gray-500 font-medium text-lg">
                      Critical attendance alerts and notifications
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-2xl blur-lg"></div>
                    <div className="relative bg-gradient-to-br from-red-50 to-pink-50 border-l-8 border-red-500 p-8 rounded-2xl shadow-xl hover:shadow-red-500/10 transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-black text-red-800 text-2xl">
                          Low Attendance Alert
                        </h4>
                      </div>
                      <p className="text-red-700 font-semibold text-lg">
                        Classes with less than 70% attendance rate
                      </p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-2xl blur-lg"></div>
                    <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 border-l-8 border-orange-500 p-8 rounded-2xl shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <ClipboardList className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-black text-orange-800 text-2xl">
                          Teacher No-Show
                        </h4>
                      </div>
                      <p className="text-orange-700 font-semibold text-lg">
                        Classes where no attendance was recorded
                      </p>
                    </div>
                  </div>
                </div>

                {attendanceOverview &&
                Array.isArray(attendanceOverview) &&
                attendanceOverview.length > 0 ? (
                  <div className="overflow-hidden rounded-3xl shadow-2xl border border-gray-200/50">
                    <table className="min-w-full bg-white/95 backdrop-blur-sm">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                            Teacher
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/95 divide-y divide-gray-200/50">
                        {attendanceOverview
                          .slice(0, 10)
                          .map((record: any, index) => (
                            <tr
                              key={record?.id || index}
                              className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-300"
                            >
                              <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900">
                                {record?.studentId?.name ||
                                  record?.student?.name ||
                                  "N/A"}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                {record?.studentId?.class ||
                                  record?.student?.class ||
                                  "N/A"}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                {record?.teacherId?.name ||
                                  record?.teacher?.name ||
                                  "N/A"}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                {record?.date
                                  ? new Date(record.date).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td className="px-8 py-6 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-4 py-2 text-sm font-bold rounded-2xl shadow-lg ${
                                    record?.status === "present"
                                      ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200"
                                      : record?.status === "late"
                                      ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-200"
                                      : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-200"
                                  }`}
                                >
                                  {record?.status || "N/A"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold text-gray-500">
                      No attendance records available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
