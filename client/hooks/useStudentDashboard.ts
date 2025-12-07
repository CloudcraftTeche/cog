"use client"
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface Overview {
  totalChapters: number;
  completedChapters: number;
  inProgressChapters: number;
  lockedChapters: number;
  completionRate: number;
  attendanceRate: number;
}

export interface ChapterProgressByUnit {
  unitName: string;
  total: number;
  completed: number;
  inProgress: number;
  locked: number;
  completionRate: number;
}

export interface PerformanceData {
  chapterName: string;
  chapterNumber: number;
  score: number;
  completedAt: string;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface AssignmentStats {
  total: number;
  submitted: number;
  pending: number;
  graded: number;
}

export interface QueryStatus {
  status: string;
  count: number;
}

export interface Charts {
  chapterProgressByUnit: ChapterProgressByUnit[];
  performanceData: PerformanceData[];
  attendanceRecords: AttendanceRecord[];
  assignmentStats: AssignmentStats;
  myQueries: QueryStatus[];
}

export interface Deadline {
  title: string;
  endDate: string;
  totalMarks: number;
}

export interface Announcement {
  title: string;
  content: string;
  type: 'important' | 'urgent' | 'general';
  createdAt: string;
}

export interface RecentActivity {
  upcomingDeadlines: Deadline[];
  recentAnnouncements: Announcement[];
}

export interface DashboardData {
  overview: Overview;
  charts: Charts;
  recentActivity: RecentActivity;
}

export interface ApiResponse {
  success: boolean;
  data: DashboardData;
}
export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ApiResponse>('/dashboard/student');
      setDashboardData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return { dashboardData, loading, error, retry: loadDashboard };
};