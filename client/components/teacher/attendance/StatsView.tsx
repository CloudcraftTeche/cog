"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "./StatsCard";
import { attendanceService, IAttendanceStats, IHeatmapData } from "@/utils/teacherAttendance.service";
export default function StatsView() {
  const { user } = useAuth();
  const [stats, setStats] = useState<IAttendanceStats | null>(null);
  const [heatmapData, setHeatmapData] = useState<IHeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      fetchStatsData();
    }
  }, [user]);
  const fetchStatsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, heatmap] = await Promise.all([
        attendanceService.getTeacherStats(user?.id as string),
        attendanceService.getTeacherHeatmap(user?.id as string),
      ]);
      setStats(statsData);
      setHeatmapData(heatmap);
    } catch (err: any) {
      setError(err.message || "Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-semibold mb-2">Error Loading Statistics</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchStatsData}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!stats) return null;
  const attendanceRate = stats.totalStudents > 0
    ? ((stats.todayAttendance.present + stats.todayAttendance.late) / stats.totalStudents) * 100
    : 0;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">My Statistics & Analytics</h2>
        <div className="text-sm text-gray-500">
          Showing data for your assigned students only
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="My Students"
          value={stats.totalStudents}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          icon="👥"
        />
        <StatsCard
          title="Today's Attendance"
          value={stats.todayAttendance.total}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          icon="📋"
        />
        <StatsCard
          title="Attendance Rate"
          value={Math.round(attendanceRate)}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          icon="📊"
        />
      </div>
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">
          Today's Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <p className="text-green-700 font-semibold text-sm mb-1">Present</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.todayAttendance.present}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {stats.totalStudents > 0 
                ? `${Math.round((stats.todayAttendance.present / stats.totalStudents) * 100)}%`
                : '0%'}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <p className="text-yellow-700 font-semibold text-sm mb-1">Late</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.todayAttendance.late}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              {stats.totalStudents > 0 
                ? `${Math.round((stats.todayAttendance.late / stats.totalStudents) * 100)}%`
                : '0%'}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-700 font-semibold text-sm mb-1">Absent</p>
            <p className="text-3xl font-bold text-red-600">
              {stats.todayAttendance.absent}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {stats.totalStudents > 0 
                ? `${Math.round((stats.todayAttendance.absent / stats.totalStudents) * 100)}%`
                : '0%'}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-blue-700 font-semibold text-sm mb-1">Excused</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.todayAttendance.excused}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {stats.totalStudents > 0 
                ? `${Math.round((stats.todayAttendance.excused / stats.totalStudents) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>
      </div>
      {heatmapData.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            Last 30 Days Attendance Heatmap
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Visual representation of attendance patterns for your students
          </p>
          <div className="space-y-2">
            {heatmapData.map((day) => {
              const total = day.present + day.absent + day.late + day.excused;
              const presentPercent = total > 0 ? (day.present / total) * 100 : 0;
              const latePercent = total > 0 ? (day.late / total) * 100 : 0;
              const absentPercent = total > 0 ? (day.absent / total) * 100 : 0;
              const excusedPercent = total > 0 ? (day.excused / total) * 100 : 0;
              return (
                <div key={day._id} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-28 font-medium">{day._id}</span>
                  <div className="flex-1 flex gap-1 h-10 bg-gray-100 rounded-lg overflow-hidden">
                    {presentPercent > 0 && (
                      <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{ width: `${presentPercent}%` }}
                        title={`Present: ${day.present}`}
                      >
                        {presentPercent > 10 && day.present}
                      </div>
                    )}
                    {latePercent > 0 && (
                      <div
                        className="bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{ width: `${latePercent}%` }}
                        title={`Late: ${day.late}`}
                      >
                        {latePercent > 10 && day.late}
                      </div>
                    )}
                    {absentPercent > 0 && (
                      <div
                        className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{ width: `${absentPercent}%` }}
                        title={`Absent: ${day.absent}`}
                      >
                        {absentPercent > 10 && day.absent}
                      </div>
                    )}
                    {excusedPercent > 0 && (
                      <div
                        className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                        style={{ width: `${excusedPercent}%` }}
                        title={`Excused: ${day.excused}`}
                      >
                        {excusedPercent > 10 && day.excused}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right font-semibold">
                    {total} total
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Excused</span>
            </div>
          </div>
        </div>
      )}
      {heatmapData.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700">No attendance data available for the last 30 days</p>
        </div>
      )}
    </div>
  );
}