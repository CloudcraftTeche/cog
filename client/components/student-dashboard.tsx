"use client"
import React from 'react';
import { LoadingSpinner } from './student/dashboard/LoadingSpinner';
import { ErrorAlert } from './student/dashboard/ErrorAlert';
import { DashboardHeader } from './student/dashboard/DashboardHeader';
import { OverviewSection } from './student/dashboard/OverviewSection';
import { ProgressSection } from './student/dashboard/ProgressSection';
import { AssignmentsSection } from './student/dashboard/AssignmentsSection';
import { PerformanceSection } from './student/dashboard/PerformanceSection';
import { AttendanceSection } from './student/dashboard/AttendanceSection';
import { QueriesSection } from './student/dashboard/QueriesSection';
import { DeadlinesSection } from './student/dashboard/DeadlinesSection';
import { AnnouncementsSection } from './student/dashboard/AnnouncementsSection';
import { useDashboard } from '@/hooks/useStudentDashboard';
export default function StudentDashboard() {
  const { dashboardData, loading, error, retry } = useDashboard();
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error || !dashboardData) {
    return <ErrorAlert message={error} onRetry={retry} />;
  }
  const { overview, charts, recentActivity } = dashboardData;
  console.log(recentActivity);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        <OverviewSection overview={overview} />
        
        <ProgressSection overview={overview} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <QueriesSection queries={charts.myQueries} />
          </div>
          <div>
            <AssignmentsSection stats={charts.assignmentStats} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PerformanceSection data={charts.performanceData} />
          <AttendanceSection records={charts.attendanceRecords} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnnouncementsSection announcements={recentActivity.recentAnnouncements} />
        </div>
      </div>
    </div>
  );
}