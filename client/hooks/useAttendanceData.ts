
"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface AttendanceStats {
  totalStudents: number;
  totalTeachers: number;
  todayAttendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
}

interface HeatmapData {
  _id: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export function useAttendanceData() {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/attendance/stats");
      setStats(response.data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      setError(err.response?.data?.error || "Failed to fetch statistics");
      toast.error("Failed to load statistics");
    }
  }, []);

  const fetchHeatmapData = useCallback(async () => {
    try {
      const response = await api.get("/attendance/heatmap");
      setHeatmapData(response.data || []);
    } catch (err: any) {
      console.error("Error fetching heatmap:", err);
      setError(err.response?.data?.error || "Failed to fetch heatmap data");
      toast.error("Failed to load heatmap");
    }
  }, []);

  const fetchRecentRecords = useCallback(async () => {
    try {
      const response = await api.get("/attendance/export?status=all");
      setRecentRecords(response.data?.slice(0, 50) || []);
    } catch (err: any) {
      console.error("Error fetching records:", err);
      setError(err.response?.data?.error || "Failed to fetch records");
      toast.error("Failed to load attendance records");
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchStats(),
        fetchHeatmapData(),
        fetchRecentRecords()
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats, fetchHeatmapData, fetchRecentRecords]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    stats,
    heatmapData,
    recentRecords,
    isLoading,
    error,
    refreshData
  };
}
