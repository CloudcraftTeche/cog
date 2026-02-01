"use client";
import { Users, Activity, TrendingUp } from "lucide-react";
import { useAdminDashboard } from "@/hooks/admin/Useadmindashboard";

const LoadingSkeleton = () => (
  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white animate-pulse">
    <div className="h-8 w-32 bg-white/20 rounded mb-4"></div>
    <div className="h-12 w-24 bg-white/20 rounded"></div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
    <div className="flex items-center gap-2 mb-2">
      <Activity className="w-6 h-6" />
      <h3 className="text-lg font-semibold">Error</h3>
    </div>
    <p className="text-sm text-white/80">{message}</p>
  </div>
);

export const WeeklyActiveStudents = () => {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error.message || "Failed to load data"} />;
  }

  const activeStudents = data?.overview?.weeklyActiveStudents ?? 0;

  return (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Weekly Active Students</h3>
        </div>
        <TrendingUp className="w-5 h-5 text-white/80" />
      </div>
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">{activeStudents}</span>
          <span className="text-lg text-white/80">students</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/90 bg-white/10 rounded-lg p-3">
          <Users className="w-4 h-4" />
          <span>Active in the last 7 days</span>
        </div>
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: activeStudents > 0 ? "100%" : "0%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};