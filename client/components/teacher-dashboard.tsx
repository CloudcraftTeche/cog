"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  RefreshCw,
  CheckCircle,
  Clock,
  BookMarked,
} from "lucide-react";
import api from "@/lib/api";

interface TeacherDashboardData {
  totals: {
    assignments: number;
    chapters: number;
  };
  submissionStats: Array<{
    status: string;
    count: number;
  }>;
  submissionTrend: Array<{
    month: string;
    count: number;
  }>;
  topStudents: Array<{
    studentId: string;
    name: string;
    avgScore: number;
    submissionsCount: number;
  }>;
  completionStats: Array<{
    _id: string;
    title: string;
    totalCompleted: number;
  }>;
  avgScores: Array<{
    chapterId: string;
    title: string;
    avgScore: number;
  }>;
  chapterTrend: Array<{
    month: string;
    count: number;
  }>;
}

export default function TeacherDashboard() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await api.get("/teacher/dashboard");
      if (response.data?.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data?.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching teacher dashboard:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
      setData({
        totals: { assignments: 0, chapters: 0 },
        submissionStats: [],
        submissionTrend: [],
        topStudents: [],
        completionStats: [],
        avgScores: [],
        chapterTrend: [],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl"
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const submissionColors = ["#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

  const submissionStatsWithColors =
    data?.submissionStats?.map((stat, index) => ({
      ...stat,
      color: submissionColors[index % submissionColors.length],
    })) || [];

  return (
    <div className=" p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
             Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor your assignments and student progress
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">⚠️ {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600"></div>
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Total Assignments
                  </p>
                  <p className="text-3xl font-bold">
                    {data?.totals?.assignments || 0}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600"></div>
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">
                    Total Chapters
                  </p>
                  <p className="text-3xl font-bold">
                    {data?.totals?.chapters || 0}
                  </p>
                </div>
                <BookMarked className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600"></div>
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Submissions
                  </p>
                  <p className="text-3xl font-bold">
                    {data?.submissionStats?.reduce(
                      (sum, stat) => sum + stat.count,
                      0
                    ) || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600"></div>
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Graded Submissions
                  </p>
                  <p className="text-3xl font-bold">
                    {data?.submissionStats?.find((s) => s.status === "graded")
                      ?.count || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-600 to-teal-600"></div>
            <CardContent className="relative p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Pending Reviews
                  </p>
                  <p className="text-3xl font-bold">
                    {data?.submissionStats?.find((s) => s.status === "pending")
                      ?.count || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-100 to-pink-100 p-1 rounded-2xl">
            <TabsTrigger
              value="overview"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
            >
              Trends
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
            >
              Top Students
            </TabsTrigger>
            <TabsTrigger
              value="chapters"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-300"
            >
              Chapters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Submission Status Chart */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                  <CardTitle className="text-white text-xl">
                    Submission Status
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Distribution of graded vs pending submissions
                  </CardDescription>
                </div>
                <CardContent className="p-6">
                  {submissionStatsWithColors.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={submissionStatsWithColors}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="count"
                          label={({ status, count }) => `${status}: ${count}`}
                        >
                          {submissionStatsWithColors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No submission data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                  <CardTitle className="text-white text-xl">
                    Quick Stats
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Key metrics at a glance
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <span className="font-medium text-gray-700">
                      Active Assignments
                    </span>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {data?.totals?.assignments || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                    <span className="font-medium text-gray-700">
                      Total Students
                    </span>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      {data?.topStudents?.length || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl">
                    <span className="font-medium text-gray-700">Avg Score</span>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      {data?.topStudents && data.topStudents.length > 0
                        ? Math.round(
                            data.topStudents.reduce(
                              (sum, s) => sum + s.avgScore,
                              0
                            ) / data.topStudents.length
                          )
                        : 0}
                      %
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6">
                <CardTitle className="text-white text-xl">
                  Submission Trends
                </CardTitle>
                <CardDescription className="text-green-100">
                  Monthly submission activity over the last 6 months
                </CardDescription>
              </div>
              <CardContent className="p-6">
                {data?.submissionTrend && data.submissionTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data.submissionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="url(#colorGradient)"
                        strokeWidth={3}
                        dot={{ fill: "#10B981", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, fill: "#059669" }}
                      />
                      <defs>
                        <linearGradient
                          id="colorGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#0D9488" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No trend data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                <CardTitle className="text-white text-xl">
                  Top Performing Students
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Students with highest average scores
                </CardDescription>
              </div>
              <CardContent className="p-6">
                {data?.topStudents && data.topStudents.length > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.topStudents}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          stroke="#666"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Bar
                          dataKey="avgScore"
                          fill="url(#barGradient)"
                          radius={[8, 8, 0, 0]}
                        />
                        <defs>
                          <linearGradient
                            id="barGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#EF4444" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="grid gap-4">
                      {data.topStudents.map((student, index) => (
                        <div
                          key={student.studentId}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {student.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {student.submissionsCount} submissions
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-3 py-1">
                            {student.avgScore}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No student data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chapters" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chapter Completion Stats */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                  <CardTitle className="text-white text-xl">
                    Chapter Completion
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    Student completion rates by chapter
                  </CardDescription>
                </div>
                <CardContent className="p-6">
                  {data?.completionStats && data.completionStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.completionStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="title"
                          stroke="#666"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Bar
                          dataKey="totalCompleted"
                          fill="url(#completionGradient)"
                          radius={[8, 8, 0, 0]}
                        />
                        <defs>
                          <linearGradient
                            id="completionGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#0D9488" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No chapter completion data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Average Chapter Scores */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-6">
                  <CardTitle className="text-white text-xl">
                    Average Chapter Scores
                  </CardTitle>
                  <CardDescription className="text-violet-100">
                    Quiz performance by chapter
                  </CardDescription>
                </div>
                <CardContent className="p-6">
                  {data?.avgScores && data.avgScores.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.avgScores}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="title"
                          stroke="#666"
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Bar
                          dataKey="avgScore"
                          fill="url(#scoreGradient)"
                          radius={[8, 8, 0, 0]}
                        />
                        <defs>
                          <linearGradient
                            id="scoreGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#7C3AED" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No chapter score data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chapter Creation Trend */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
                <CardTitle className="text-white text-xl">
                  Chapter Creation Trends
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Monthly chapter development activity
                </CardDescription>
              </div>
              <CardContent className="p-6">
                {data?.chapterTrend && data.chapterTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data.chapterTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="url(#chapterTrendGradient)"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, fill: "#1D4ED8" }}
                      />
                      <defs>
                        <linearGradient
                          id="chapterTrendGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#1D4ED8" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No chapter trend data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
