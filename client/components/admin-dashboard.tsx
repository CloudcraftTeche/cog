"use client";
import { useState } from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { DashboardView } from "@/types/admin/admindashboard.types";
import { DashboardNav } from "./admin/dashboard/DashboardNav";
import { OverviewStats } from "./admin/dashboard/OverviewStats";
import { WeeklyActiveStudents } from "./admin/dashboard/WeeklyActiveStudents";
import { ChartsSection } from "./admin/dashboard/ChartsSection";
import { SyllabusCoverage } from "./admin/dashboard/SyllabusCoverage";
import { InsightsSection } from "./admin/dashboard/TopPerformersTable";
import { HeatmapView } from "./admin/dashboard/HeatmapView";
import { ReportsView } from "./admin/dashboard/ReportsView";
import { useAdminDashboard } from "@/hooks/admin/Useadmindashboard";
const LoadingState = () => (
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
const ErrorState = ({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-white" />
      </div>
      <p className="text-xl font-bold text-red-600 mb-2">
        Error Loading Dashboard
      </p>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
      >
        Retry
      </button>
    </div>
  </div>
);
export default function AdminDashboard() {
  const [selectedView, setSelectedView] = useState<DashboardView>("dashboard");
  const { data, isLoading, error, refetch, isRefetching } = useAdminDashboard();
  const handleRefresh = () => {
    refetch();
  };
  if (isLoading) {
    return <LoadingState />;
  }
  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />;
  }
  return (
    <div className="relative overflow-hidden">
      <DashboardNav
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        refreshing={isRefetching}
        handleRefresh={handleRefresh}
      />
      <div className="relative max-w-7xl mx-auto p-6">
        {selectedView === "dashboard" && (
          <>
            <OverviewStats overview={data?.overview} />
            <div className="my-3">
              <WeeklyActiveStudents />
            </div>
            <ChartsSection charts={data?.charts} />
            <SyllabusCoverage />
            <InsightsSection insights={data?.insights} />
          </>
        )}
        {selectedView === "heatmap" && (
          <HeatmapView attendanceTrend={data?.charts?.attendanceTrend} />
        )}
        {selectedView === "reports" && (
          <ReportsView
            recentAnnouncements={data?.insights?.recentAnnouncements}
            recentQueries={data?.insights?.recentQueries}
          />
        )}
      </div>
    </div>
  );
}
