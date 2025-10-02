"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Target,
  Star,
  Loader2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Award,
  Bell,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import api from "@/lib/api";

interface StudentDashboardData {
  student: {
    id: string;
    name: string;
    class: string;
  };
  totals: {
    totalChapters: number;
    completedChapters: number;
    notCompletedChapters: number;
    completionPercentage: number;
    assignmentsAvailable: number;
  };
  submissionStatus: Array<{
    status: string;
    count: number;
  }>;
  submissionTrend: Array<{
    month: string;
    count: number;
  }>;
  chapterWiseProgress: Array<{
    chapterId: string;
    chapterTitle: string;
    quizScore: number;
    completedAt: string;
  }>;
  latestAnnouncements: Array<{
    _id: string;
    title: string;
    content: string;
    createdAt: string;
  }>;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setError("User not authenticated.");
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get("/student/dashboard");
      if (data.success) {
        setDashboardData(data.data);
        setError(null);
      } else {
        setError("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Unable to load your dashboard. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const progressData = useMemo(
    () =>
      dashboardData
        ? [
            {
              name: "Completed",
              value: dashboardData.totals.completedChapters,
              color: "#10b981",
            },
            {
              name: "Remaining",
              value: dashboardData.totals.notCompletedChapters,
              color: "#e5e7eb",
            },
          ]
        : [],
    [dashboardData]
  );

  

  const submissionStatusData = useMemo(
    () =>
      dashboardData?.submissionStatus?.map((item) => ({
        name: item?.status
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
          : "Unknown",
        value: item?.count ?? 0,
        color:
          item?.status === "graded"
            ? "#10b981"
            : item?.status === "pending"
            ? "#f59e0b"
            : "#3b82f6",
      })) || [],
    [dashboardData]
  );

  const chapterScoresData = useMemo(
    () =>
      dashboardData?.chapterWiseProgress?.slice(-8).map((chapter, i) => ({
        name: `Ch ${i + 1}`,
        score: chapter.quizScore ?? 0,
        title:
          chapter.chapterTitle.substring(0, 20) +
          (chapter.chapterTitle.length > 20 ? "..." : ""),
      })) || [],
    [dashboardData]
  );

  const averageScore = useMemo(() => {
    if (!dashboardData?.chapterWiseProgress?.length) return 0;
    const sum = dashboardData.chapterWiseProgress.reduce(
      (acc, ch) => acc + (ch.quizScore ?? 0),
      0
    );
    return Math.round(sum / dashboardData.chapterWiseProgress.length);
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl px-4 border border-blue-200">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
        <p className="text-xl text-slate-700 text-center font-medium">
          Loading your amazing dashboard...
        </p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col justify-center items-center h-[400px] bg-gradient-to-br from-red-50 to-pink-100 rounded-3xl shadow-2xl px-4 border border-red-200">
        <AlertCircle className="w-10 h-10 text-white bg-red-500 rounded-full p-2 mb-4" />
        <p className="text-xl text-slate-700 mb-6 text-center font-medium">
          {error}
        </p>
        <div className="flex gap-4">
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="secondary">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { totals } = dashboardData;
  return (
    <div className="relative space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white/20 rounded-full animate-pulse" />
        <div className="absolute bottom-4 left-4 w-20 h-20 border-2 border-white/20 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/10 rounded-full animate-float" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-6 backdrop-blur-sm shadow-lg">
                <Star className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                  {greeting}, {dashboardData.student.name}!
                </h2>
                <p className="text-xl opacity-90 font-medium">
                  Class: {dashboardData.student.class} ✨
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 transition-all"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
          <p className="text-white/90 max-w-2xl text-lg leading-relaxed">
            Continue your amazing learning journey. You've completed{" "}
            {totals.completionPercentage}% of your chapters! 🚀
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Chapters
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {totals.totalChapters}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {totals.completedChapters}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {averageScore}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-3xl font-bold text-orange-600">
                  {totals.assignmentsAvailable}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chapter Progress Chart */}
        <Card className="relative overflow-hidden border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="relative pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              Chapter Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {totals.completedChapters}
              </div>
              <p className="text-gray-600 text-lg">
                Out of {totals.totalChapters} chapters
              </p>
            </div>

            {progressData.length > 0 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-4 border border-blue-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 font-medium">
                  Overall Progress
                </span>
                <span className="font-bold text-blue-700">
                  {totals.completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-4 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full shadow-lg transition-all duration-1000 ease-out"
                  style={{ width: `${totals.completionPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Status Chart */}
        <Card className="relative overflow-hidden border-0 shadow-2xl group hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-teal-200/30 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="relative pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
              Submission Status
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-6">
            {submissionStatusData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={submissionStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${String(name)}: ${value}`}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No submissions yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submission Trend Chart */}
      {submissionStatusData.length > 0 && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              Submission Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={submissionStatusData}>
                  <defs>
                    <linearGradient
                      id="submissionGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#a855f7"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#a855f7"
                    strokeWidth={3}
                    fill="url(#submissionGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapter Scores Chart */}
      {chapterScoresData.length > 0 && (
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              Recent Chapter Quiz Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chapterScoresData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value,name, props) => [`${value}%`, "Score"]}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.title || label
                    }
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    <defs>
                      <linearGradient
                        id="scoreGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f97316"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ea580c"
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Announcements */}
      {dashboardData.latestAnnouncements &&
        dashboardData.latestAnnouncements.length > 0 && (
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-indigo-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                Latest Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.latestAnnouncements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="bg-white rounded-2xl p-4 shadow-md border border-indigo-100"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-indigo-600 font-medium">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      <Card className="border-0 shadow-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 via-purple-100/20 to-pink-100/20" />
        <CardContent className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Continue Your Learning Journey
              </h3>
              <p className="text-gray-600 text-lg">
                Discover new chapters and unlock your potential!
              </p>
            </div>
          </div>
          <Link href="/dashboard/student/chapters" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Explore Chapters
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
