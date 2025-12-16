"use client";
import api from "@/lib/api";
import React, { useState, useEffect } from "react";
interface Stats {
  totalChapters: number;
  completedChapters: number;
  completionPercentage: number;
  pendingAssignments: number;
  totalAssignments: number;
  submittedAssignments: number;
}
interface Assignment {
  _id: string;
  title: string;
  description: string;
  endDate: string;
  isPastDue: boolean;
  daysLeft: number;
  isSubmitted?: boolean;
  score?: number | null;
  submittedAt?: string;
  feedback?: string;
}
interface Chapter {
  _id: string;
  title: string;
  description: string;
  status: string;
  isCompleted: boolean;
  score?: number;
}
interface Activity {
  _id: string;
  assignment: string;
  createdAt: string;
  score?: number;
  status: string;
}
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  last30DaysCompletions: number;
  calendar: { date: string; count: number; hasActivity: boolean }[];
  streakMessage: string;
}
interface OverviewData {
  streak: number;
  stats: Stats;
  dueAssignments: Assignment[];
  todayChapters: Chapter[];
  recentActivity: Activity[];
}
interface AssignmentsData {
  data: Assignment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
      <p className="mt-4 text-gray-600 font-medium text-lg">
        Loading your dashboard...
      </p>
    </div>
  </div>
);
const ErrorDisplay: React.FC<{ error: string; onRetry: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors shadow-md hover:shadow-lg"
      >
        Try Again
      </button>
    </div>
  </div>
);
const StreakSection: React.FC<{
  overview: OverviewData;
  streakData: StreakData | null;
}> = ({ overview, streakData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
    <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium opacity-90">Current Streak</p>
          <h2 className="text-5xl font-bold mt-2">{overview.streak}</h2>
          <p className="text-sm mt-1 opacity-90">days</p>
        </div>
        <div className="text-6xl animate-pulse">🔥</div>
      </div>
      <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
        <p className="text-xs font-medium">
          {streakData?.streakMessage || "Keep going!"}
        </p>
      </div>
    </div>
    {streakData && (
      <>
        <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🏆</span>
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl font-bold">
                {streakData.longestStreak}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium opacity-90">Longest Streak</p>
          <p className="text-2xl font-bold mt-1">
            {streakData.longestStreak} days
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📈</span>
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl font-bold">
                {streakData.last30DaysCompletions}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium opacity-90">Last 30 Days</p>
          <p className="text-2xl font-bold mt-1">
            {streakData.last30DaysCompletions} completions
          </p>
        </div>
      </>
    )}
  </div>
);
const ActivityCalendar: React.FC<{
  calendar: { date: string; count: number; hasActivity: boolean }[];
}> = ({ calendar }) => {
  const getIntensityColor = (count: number) => {
    if (count === 0) return "bg-gray-200";
    if (count === 1) return "bg-green-300";
    if (count === 2) return "bg-green-400";
    if (count >= 3) return "bg-green-600";
    return "bg-green-500";
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📅</span> Activity Calendar (Last 30 Days)
      </h3>
      <div className="grid grid-cols-15 gap-2">
        {calendar.map((day, idx) => (
          <div key={idx} className="group relative">
            <div
              className={`w-8 h-8 rounded ${getIntensityColor(day.count)} transition-all hover:scale-110 cursor-pointer`}
              title={`${new Date(day.date).toLocaleDateString()}: ${day.count} completions`}
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {new Date(day.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              : {day.count}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-4 h-4 bg-green-300 rounded"></div>
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <div className="w-4 h-4 bg-green-600 rounded"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
const StatsGrid: React.FC<{ stats: Stats }> = ({ stats }) => {
  const statItems = [
    {
      label: "Completion Rate",
      value: `${stats.completionPercentage}%`,
      icon: "📊",
      color: "from-blue-400 to-cyan-500",
    },
    {
      label: "Completed Chapters",
      value: `${stats.completedChapters}/${stats.totalChapters}`,
      icon: "📚",
      color: "from-green-400 to-emerald-500",
    },
    {
      label: "Pending Assignments",
      value: stats.pendingAssignments,
      icon: "📝",
      color: "from-purple-400 to-indigo-500",
    },
    {
      label: "Submitted",
      value: `${stats.submittedAssignments}/${stats.totalAssignments}`,
      icon: "✅",
      color: "from-yellow-400 to-orange-500",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${item.color} rounded-xl p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{item.icon}</span>
            <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl font-bold">
                {typeof item.value === "number"
                  ? item.value
                  : item.value.split("/")[0]}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium opacity-90">{item.label}</p>
          <p className="text-2xl font-bold mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
};
const AssignmentsSection: React.FC<{
  assignments: Assignment[];
  filterStatus: string;
  onFilterChange: (status: string) => void;
}> = ({ assignments, filterStatus, onFilterChange }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>📋</span> All Assignments
      </h3>
      <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
        {assignments.length} assignments
      </span>
    </div>
    <div className="flex flex-wrap gap-3 mb-6">
      {["all", "pending", "submitted", "overdue"].map((status) => (
        <button
          key={status}
          onClick={() => onFilterChange(status)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filterStatus === status
              ? "bg-purple-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {assignments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🎯</p>
          <p className="text-lg font-semibold">No assignments found</p>
          <p className="text-sm mt-1">Try changing the filter</p>
        </div>
      ) : (
        assignments.map((assignment) => (
          <div
            key={assignment._id}
            className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md cursor-pointer ${
              assignment.isPastDue
                ? "border-red-300 bg-red-50 hover:bg-red-100"
                : assignment.isSubmitted
                  ? "border-green-300 bg-green-50 hover:bg-green-100"
                  : assignment.daysLeft <= 2
                    ? "border-orange-300 bg-orange-50 hover:bg-orange-100"
                    : "border-blue-300 bg-blue-50 hover:bg-blue-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-800 text-lg">
                    {assignment.title}
                  </h4>
                  {assignment.isSubmitted && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                      Submitted
                    </span>
                  )}
                  {assignment.isPastDue && !assignment.isSubmitted && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {assignment.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>
                    📅 Due: {new Date(assignment.endDate).toLocaleDateString()}
                  </span>
                  {!assignment.isSubmitted && (
                    <span>⏰ {assignment.daysLeft} days left</span>
                  )}
                  {assignment.isSubmitted && assignment.submittedAt && (
                    <span>
                      ✅ Submitted:{" "}
                      {new Date(assignment.submittedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              {assignment.score !== null && assignment.score !== undefined && (
                <div className="ml-4 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-xl p-3 text-center flex-shrink-0">
                  <div className="text-2xl font-bold">{assignment.score}</div>
                  <div className="text-xs">Score</div>
                </div>
              )}
            </div>
            {assignment.feedback && (
              <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                <p className="text-xs text-gray-700">
                  <strong>Feedback:</strong> {assignment.feedback}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);
const ChaptersSection: React.FC<{ chapters: Chapter[] }> = ({ chapters }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <span>📖</span> Today's Learning
    </h3>
    <div className="space-y-3">
      {chapters.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">✨</p>
          <p className="text-lg font-semibold">All chapters completed!</p>
          <p className="text-sm mt-1">Great job!</p>
        </div>
      ) : (
        chapters.map((chapter) => (
          <div
            key={chapter._id}
            className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-md hover:border-purple-300 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {chapter.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {chapter.description}
                </p>
              </div>
              <div className="ml-4 bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                <span className="text-xl">▶️</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
const RecentActivitySection: React.FC<{ activities: Activity[] }> = ({
  activities,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <span>⚡</span> Recent Activity
    </h3>
    <div className="space-y-3">
      {activities.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-lg font-semibold">No recent activity</p>
          <p className="text-sm mt-1">Start learning to see your progress</p>
        </div>
      ) : (
        activities.map((activity) => (
          <div
            key={activity._id}
            className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">
                  {activity.assignment}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Submitted{" "}
                  {new Date(activity.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              {activity.score !== undefined && activity.score !== null && (
                <div className="bg-green-500 text-white rounded-full px-4 py-2 font-bold ml-4 flex-shrink-0">
                  {activity.score}%
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
const StudentDashboard: React.FC = () => {
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, assignmentsRes, streakRes] = await Promise.all([
        api.get("/todo/overview"),
        api.get("/todo/assignments?status=all&page=1&limit=100"),
        api.get("/todo/streak"),
      ]);
      if (overviewRes.data.success) setOverviewData(overviewRes.data.data);
      if (assignmentsRes.data.success)
        setAllAssignments(assignmentsRes.data.data);
      if (streakRes.data.success) setStreakData(streakRes.data.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllData();
  }, []);
  const filteredAssignments = React.useMemo(() => {
    if (!allAssignments) return [];
    switch (assignmentFilter) {
      case "pending":
        return allAssignments.filter((a) => !a.isSubmitted);
      case "submitted":
        return allAssignments.filter((a) => a.isSubmitted);
      case "overdue":
        return allAssignments.filter((a) => a.isPastDue && !a.isSubmitted);
      default:
        return allAssignments;
    }
  }, [allAssignments, assignmentFilter]);
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchAllData} />;
  if (!overviewData) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your complete learning dashboard
          </p>
        </div>
        {}
        <StreakSection overview={overviewData} streakData={streakData} />
        {}
        {streakData && <ActivityCalendar calendar={streakData.calendar} />}
        {}
        <StatsGrid stats={overviewData.stats} />
        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {}
          <ChaptersSection chapters={overviewData.todayChapters} />
          {}
          <RecentActivitySection activities={overviewData.recentActivity} />
        </div>
        {}
        <AssignmentsSection
          assignments={filteredAssignments}
          filterStatus={assignmentFilter}
          onFilterChange={setAssignmentFilter}
        />
      </div>
    </div>
  );
};
export default StudentDashboard;
