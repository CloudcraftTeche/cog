"use client";
import { useState } from "react";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import {
  useAttendanceStats,
  useAttendanceHeatmap,
  useAttendanceRecords,
  useExportAttendance,
  useRefreshAttendance,
} from "@/hooks/admin/useAttendance";
import {
  validateAttendanceStatus,
  validateDateRange,
} from "@/lib/admin/validators/attendance.validators";
import {
  convertAttendanceToCSV,
  downloadCSV,
  generateExportFilename,
} from "@/utils/admin/export.utils";
import { LoadingState } from "@/components/shared/LoadingComponent";
import ErrorState from "@/components/teacher/mychapter/ErrorState";
import {
  AttendanceHeatmap,
  AttendancePieChart,
  AttendanceTable,
  AttendanceTrendChart,
  ExportSection,
  Navigation,
  StatsSection,
} from "@/components/admin/attendance/AttendanceComponents";
export default function SuperAdminAttendancePage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAttendanceStats();
  const {
    data: heatmapData = [],
    isLoading: heatmapLoading,
    error: heatmapError,
  } = useAttendanceHeatmap();
  const {
    data: recentRecords = [],
    isLoading: recordsLoading,
    error: recordsError,
  } = useAttendanceRecords(50);
  const exportMutation = useExportAttendance();
  const refreshMutation = useRefreshAttendance();
  const [selectedView, setSelectedView] = useState("overview");
  const isLoading = statsLoading && heatmapLoading && recordsLoading;
  const error =
    statsError?.message || heatmapError?.message || recordsError?.message;
  const handleExport = async (
    status: string,
    startDate?: string,
    endDate?: string,
  ) => {
    const statusError = validateAttendanceStatus(status);
    if (statusError) {
      toast.error(statusError.message);
      return;
    }
    if (startDate && endDate) {
      const dateError = validateDateRange(startDate, endDate);
      if (dateError) {
        toast.error(dateError.message);
        return;
      }
    }
    try {
      const data = await exportMutation.mutateAsync({
        status,
        startDate,
        endDate,
      });
      if (!data || data.length === 0) {
        toast.error("No data available for export");
        return;
      }
      const csvData = convertAttendanceToCSV(data);
      const filename = generateExportFilename(status);
      downloadCSV(csvData, filename);
      toast.success(`Exported ${data.length} records successfully`);
    } catch (error: any) {
      console.error("Export error:", error);
    }
  };
  const handleRefresh = () => {
    refreshMutation.mutate();
  };
  if (isLoading) {
    return <LoadingState text="Attendance" />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Toaster position="top-right" />
      <Navigation selectedView={selectedView} onViewChange={setSelectedView} />
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {selectedView === "overview" && (
          <>
            <div className="flex justify-end">
              <button
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={refreshMutation.isPending ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
            <StatsSection stats={stats ?? null} isLoading={statsLoading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AttendancePieChart
                data={
                  stats?.todayAttendance || {
                    present: 0,
                    absent: 0,
                    late: 0,
                    excused: 0,
                  }
                }
              />
              <AttendanceTrendChart data={heatmapData} />
            </div>
            <ExportSection onExport={handleExport} />
          </>
        )}
        {selectedView === "heatmap" && (
          <>
            <AttendanceHeatmap data={heatmapData} />
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Legend
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700">Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                  <span className="text-sm text-gray-700">Excused</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-700">Absent</span>
                </div>
              </div>
            </div>
          </>
        )}
        {selectedView === "records" && (
          <AttendanceTable records={recentRecords} />
        )}
      </div>
    </div>
  );
}
