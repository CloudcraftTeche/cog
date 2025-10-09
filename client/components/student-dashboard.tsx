"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Target,
  Loader2,
  AlertCircle,
  TrendingUp,
  Calendar,
  Award,
  Bell,
  RefreshCw,
} from "lucide-react";
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
  AreaChart,
  Area,
} from "recharts";
import api from "@/lib/api";

// ========================
// Chart Components
// ========================
const ProgressPieChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
        label={({ name, value }) => `${name}: ${value}`}
      >
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
));

const SubmissionStatusChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        paddingAngle={5}
        dataKey="value"
        label={({ name, value }) => `${String(name)}: ${value}`}
      >
        {data.map((d, i) => (
          <Cell key={i} fill={d.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
));

const ChapterScoresChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
      <Tooltip
        formatter={(value) => [`${value}%`, "Score"]}
        labelFormatter={(label, payload) =>
          payload?.[0]?.payload?.title || label
        }
      />
      <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="url(#scoreGradient)" />
      <defs>
        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
          <stop offset="95%" stopColor="#ea580c" stopOpacity={0.7} />
        </linearGradient>
      </defs>
    </BarChart>
  </ResponsiveContainer>
));

const SubmissionTrendChart = React.memo(({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="submissionGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
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
));

// ========================
// Main Component
// ========================
interface StudentDashboardData {
  student: { id: string; name: string; class: string };
  totals: {
    totalChapters: number;
    completedChapters: number;
    notCompletedChapters: number;
    completionPercentage: number;
    assignmentsAvailable: number;
  };
  submissionStatus: Array<{ status: string; count: number }>;
  submissionTrend: Array<{ month: string; count: number }>;
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // ========================
  // Fetch Data
  // ========================
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        const { data } = await api.get("/student/dashboard");
        if (data.success) {
          setDashboardData(data.data);
          setError(null);
        } else setError("Failed to load dashboard data");
      } catch (err) {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const { data } = await api.get("/student/dashboard");
      if (data.success) setDashboardData(data.data);
    } catch {
      setError("Unable to refresh dashboard.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-lg mt-3 text-gray-700 font-medium">
          Loading your dashboard...
        </p>
      </div>
    );

  if (error || !dashboardData)
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-lg text-gray-700 mb-4">{error}</p>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Try Again
        </Button>
      </div>
    );

  const { totals } = dashboardData;

  const progressData = [
    { name: "Completed", value: totals.completedChapters, color: "#10b981" },
    { name: "Remaining", value: totals.notCompletedChapters, color: "#e5e7eb" },
  ];

  const submissionStatusData =
    dashboardData.submissionStatus?.map((item) => ({
      name: item.status,
      value: item.count,
      color:
        item.status === "graded"
          ? "#10b981"
          : item.status === "pending"
          ? "#f59e0b"
          : "#3b82f6",
    })) || [];

  const chapterScoresData =
    dashboardData.chapterWiseProgress?.slice(-8).map((ch, i) => ({
      name: `Ch ${i + 1}`,
      score: ch.quizScore ?? 0,
      title: ch.chapterTitle,
    })) || [];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white rounded-3xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold">
              {greeting}, {dashboardData.student.name}!
            </h1>
            <p className="opacity-90 text-lg">
              Class: {dashboardData.student.class}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <p className="opacity-90">
          You’ve completed {totals.completionPercentage}% of your chapters! 🚀
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="text-orange-600" />
              Total Chapters
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-orange-700">
            {totals.totalChapters}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-green-200 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-green-700">
            {totals.completedChapters}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-100 to-red-200 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="text-red-600" />
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-red-700">
            {totals.notCompletedChapters}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="text-blue-600" />
              Assignments
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-blue-700">
            {totals.assignmentsAvailable}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="text-green-600" />
              Chapter Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ProgressPieChart data={progressData} />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-purple-600" />
              Submission Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <SubmissionStatusChart data={submissionStatusData} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-purple-600" />
            Submission Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <SubmissionTrendChart data={dashboardData.submissionTrend || []} />
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="text-orange-600" />
            Recent Chapter Quiz Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ChapterScoresChart data={chapterScoresData} />
        </CardContent>
      </Card>

      {/* Announcements */}
      {dashboardData.latestAnnouncements?.length > 0 && (
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="text-indigo-600" />
              Latest Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {dashboardData.latestAnnouncements.map((a) => (
                <li
                  key={a._id}
                  className="border-b pb-3 last:border-none last:pb-0"
                >
                  <p className="text-lg font-semibold">{a.title}</p>
                  <p className="text-gray-600 text-sm">{a.content}</p>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
