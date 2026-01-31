"use client";
import React, { useState, useMemo } from "react";
import {
  useOverview,
  useStreak,
  useAssignments,
} from "@/hooks/student/useTodo";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "@/components/shared/LoadingSpinner";
import { StreakSection } from "@/components/student/todo/StreakSection";
import { ActivityCalendar } from "@/components/student/todo/ActivityCalendar";
import { StatsGrid } from "@/components/student/todo/StatsGrid";
import { AssignmentsSection } from "@/components/student/todo/AssignmentsSection";
import { ChaptersSection } from "@/components/student/todo/ChaptersSection";
import { RecentActivitySection } from "@/components/student/todo/RecentActivitySection";
import { filterAssignments } from "@/utils/student/todoFilters";
import type { AssignmentFilterStatus } from "@/types/student/todo.types";
const StudentTodoPage: React.FC = () => {
  const [assignmentFilter, setAssignmentFilter] =
    useState<AssignmentFilterStatus>("all");
  const {
    data: overviewData,
    isLoading: isLoadingOverview,
    isError: isOverviewError,
    error: overviewError,
    refetch: refetchOverview,
  } = useOverview();
  const { data: streakData, isLoading: isLoadingStreak } = useStreak();
  const { data: allAssignments, isLoading: isLoadingAssignments } =
    useAssignments({
      status: "all",
      page: 1,
      limit: 100,
    });
  const isLoading =
    isLoadingOverview || isLoadingStreak || isLoadingAssignments;
  if (isOverviewError) {
    const errorMessage =
      overviewError instanceof Error
        ? overviewError.message
        : "Failed to load dashboard data";
    return (
      <ErrorDisplay error={errorMessage} onRetry={() => refetchOverview()} />
    );
  }
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!overviewData) {
    return null;
  }
  const filteredAssignments = useMemo(
    () => filterAssignments(allAssignments ?? [], assignmentFilter),
    [allAssignments, assignmentFilter],
  );
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
        <StreakSection
          currentStreak={overviewData.streak}
          streakData={streakData ?? null}
        />
        {}
        {streakData && <ActivityCalendar calendar={streakData.calendar} />}
        {}
        <StatsGrid stats={overviewData.stats} />
        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChaptersSection chapters={overviewData.todayChapters} />
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
export default StudentTodoPage;
