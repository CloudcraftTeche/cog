"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Trophy,
  Flame,
  Star,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
interface Assignment {
  _id: string;
  title: string;
  description?: string;
  endDate: string;
  startDate: string;
  isPastDue: boolean;
  daysLeft: number;
  isSubmitted?: boolean;
  score?: number | null;
}
interface Chapter {
  _id: string;
  title: string;
  unit: string;
  chapterNumber: number;
  description?: string;
  contentType?: string;
}
interface Activity {
  _id: string;
  createdAt: string;
  score: number | null;
  assignment?: string;
}
interface CalendarDay {
  date: string;
  count: number;
  hasActivity: boolean;
}
interface Stats {
  totalChapters: number;
  completedChapters: number;
  completionPercentage: number;
  pendingAssignments: number;
  totalAssignments: number;
  submittedAssignments: number;
}
interface TodoData {
  streak: number;
  stats: Stats;
  dueAssignments: Assignment[];
  todayChapters: Chapter[];
  recentActivity: Activity[];
}
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  calendar: CalendarDay[];
  streakMessage: string;
}
const fetchTodoOverview = async (): Promise<{
  success: boolean;
  data: TodoData;
}> => {
  const response = await api.get(`/todo-list/overview`);
  return response.data;
};
const fetchStreak = async (): Promise<{
  success: boolean;
  data: StreakData;
}> => {
  const response = await api.get(`/todo-list/streak`);
  return response.data;
};
const getStreakColor = (streak: number): string => {
  if (streak === 0) return "from-gray-400 to-gray-500";
  if (streak < 3) return "from-blue-400 to-blue-500";
  if (streak < 7) return "from-purple-400 to-purple-500";
  if (streak < 14) return "from-orange-400 to-orange-500";
  return "from-red-400 to-red-500";
};
const getDaysLeftColor = (days: number): string => {
  if (days < 0) return "bg-red-100 text-red-700 border-red-300";
  if (days <= 1) return "bg-orange-100 text-orange-700 border-orange-300";
  if (days <= 3) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-green-100 text-green-700 border-green-300";
};
const getActivityColor = (count: number): string => {
  if (count === 0) return "bg-gray-100";
  if (count === 1) return "bg-green-200";
  if (count === 2) return "bg-green-400";
  return "bg-green-600";
};
const getScoreColor = (score: number): string => {
  if (score >= 90) return "bg-green-100 text-green-700";
  if (score >= 70) return "bg-blue-100 text-blue-700";
  if (score >= 50) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
};
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
const formatTime = (date: string): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.toDateString() === date2.toDateString();
};
const StudentTodoPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TodoData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const fetchData = async () => {
    try {
      setError(null);
      const [overviewResponse, streakResponse] = await Promise.all([
        fetchTodoOverview(),
        fetchStreak(),
      ]);
      if (overviewResponse.success) {
        setData(overviewResponse.data);
      }
      if (streakResponse.success) {
        setStreakData(streakResponse.data);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push("/login");
        return;
      }
      setError(err.response?.data?.message || err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  const navigateToChapter = (chapterId: string) => {
    router.push(`/dashboard/student/chapters/${chapterId}`);
  };
  const navigateToAssignment = (assignmentId: string) => {
    router.push(`/dashboard/student/assignments/${assignmentId}`);
  };
  const getTodayActivityCount = (): number => {
    if (!data?.recentActivity) return 0;
    const today = new Date();
    return data.recentActivity.filter((a) =>
      isSameDay(new Date(a.createdAt), today)
    ).length;
  };
  const getDailyProgress = (): number => {
    return Math.min(getTodayActivityCount() * 100, 100);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  if (!data || !streakData) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
              Welcome Back! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Let's make today productive!
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            aria-label="Refresh data"
          >
            <RefreshCw
              className={`w-6 h-6 text-purple-600 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
        <div
          className={`bg-gradient-to-r ${getStreakColor(
            data.streak
          )} rounded-3xl shadow-2xl p-6 md:p-8 mb-8 text-white transform hover:scale-105 transition-all duration-300`}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4">
                <Flame className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-5xl font-bold mb-1">{data.streak} Days</h2>
                <p className="text-white/90 text-lg">Current Streak</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold mb-1">🔥 Keep it going!</p>
              <p className="text-white/90">{streakData.streakMessage}</p>
            </div>
          </div>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-xl p-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">
                {data.stats.completionPercentage}%
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Course Progress</h3>
            <p className="text-sm text-gray-500 mt-1">
              {data.stats.completedChapters} of {data.stats.totalChapters}{" "}
              chapters
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 rounded-xl p-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-orange-600">
                {data.stats.pendingAssignments}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Pending Tasks</h3>
            <p className="text-sm text-gray-500 mt-1">Due assignments</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-xl p-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">
                {data.stats.submittedAssignments}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Completed</h3>
            <p className="text-sm text-gray-500 mt-1">Submitted assignments</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-xl p-3">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-purple-600">
                {streakData.longestStreak}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Best Streak</h3>
            <p className="text-sm text-gray-500 mt-1">Longest study streak</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Target className="text-purple-600" />
                  Due Assignments
                </h2>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {data.dueAssignments.length} tasks
                </span>
              </div>
              {data.dueAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-600">
                    No pending assignments at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.dueAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      onClick={() => navigateToAssignment(assignment._id)}
                      className={`border-2 rounded-xl p-4 transition-all hover:shadow-md cursor-pointer ${
                        assignment.isPastDue
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">
                            {assignment.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(assignment.endDate)}</span>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-lg border-2 text-sm font-semibold whitespace-nowrap ${getDaysLeftColor(
                            assignment.daysLeft
                          )}`}
                        >
                          {assignment.isPastDue
                            ? "Overdue!"
                            : `${assignment.daysLeft} day${
                                assignment.daysLeft !== 1 ? "s" : ""
                              }`}
                        </div>
                      </div>
                      {assignment.isPastDue && (
                        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>
                            This assignment is past due. Submit as soon as
                            possible!
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star className="text-yellow-500" />
                Today's Learning
              </h2>
              {data.todayChapters.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No new chapters available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.todayChapters.map((chapter) => (
                    <div
                      key={chapter._id}
                      onClick={() => navigateToChapter(chapter._id)}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-3 mb-3">
                        <BookOpen className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {chapter.unit} • Ch {chapter.chapterNumber}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="text-green-600" />
                Activity
              </h2>
              <div className="mb-6">
                <div className="grid grid-cols-7 gap-2">
                  {streakData.calendar.slice(-28).map((day, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square rounded-lg ${getActivityColor(
                        day.count
                      )} transition-all hover:scale-110 cursor-pointer`}
                      title={`${day.date}: ${day.count} ${
                        day.count === 1 ? "activity" : "activities"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                  <span>Less</span>
                  <span>More</span>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Completions</span>
                  <span className="font-bold text-gray-800">
                    {streakData.totalCompletions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-bold text-purple-600 flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {streakData.currentStreak} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Longest Streak</span>
                  <span className="font-bold text-orange-600 flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {streakData.longestStreak} days
                  </span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <p className="text-center text-sm font-semibold text-purple-700">
                  💡 {streakData.streakMessage}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl shadow-lg p-6 mt-6 text-white">
              <h3 className="text-xl font-bold mb-2">🎯 Daily Goal</h3>
              <p className="text-white/90 mb-4">
                Complete at least one chapter today to maintain your streak!
              </p>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Today's Progress</span>
                  <span className="text-sm font-bold">
                    {getTodayActivityCount()}/1
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getDailyProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/dashboard/student/chapters")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl py-3 font-semibold hover:shadow-lg transition-all"
                >
                  📚 Continue Learning
                </button>
                <button
                  onClick={() => router.push("/dashboard/student/assignments")}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl py-3 font-semibold hover:shadow-lg transition-all"
                >
                  📝 View All Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
        {data.recentActivity.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="text-blue-600" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all"
                >
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-3 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      Assignment Submitted
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(activity.createdAt)} at{" "}
                      {formatTime(activity.createdAt)}
                    </p>
                  </div>
                  {activity.score !== null && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`px-4 py-2 rounded-lg font-bold ${getScoreColor(
                          activity.score
                        )}`}
                      >
                        {activity.score}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mt-6 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">✨ Inspiration of the Day</h2>
          <p className="text-xl italic mb-4">
            "The expert in anything was once a beginner."
          </p>
          <p className="text-white/80">- Helen Hayes</p>
        </div>
      </div>
    </div>
  );
};
export default StudentTodoPage;