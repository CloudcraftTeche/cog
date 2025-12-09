"use client";
import { useState } from "react";
import { Toaster } from "sonner";
import api from "@/lib/api";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import {
  validateAttendanceStatus,
  validateDateRange,
} from "@/lib/attendanceValidators";
import {
  convertAttendanceToCSV,
  downloadCSV,
  generateExportFilename,
} from "@/utils/exportUtils";
import { Navigation } from "@/components/admin/attendance/Navigation";
import {
  AttendanceHeatmap,
  AttendancePieChart,
  AttendanceTable,
  AttendanceTrendChart,
  ExportSection,
  StatsCards,
} from "@/components/admin/attendance/AttendanceComponents";
export default function SuperAdminAttendancePage() {
  const { stats, heatmapData, recentRecords, isLoading, error, refreshData } =
    useAttendanceData();
  const [selectedView, setSelectedView] = useState("overview");
  const handleExport = async (
    status: string,
    startDate?: string,
    endDate?: string
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
      let url = `/attendance/export?status=${status}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await api.get(url);
      if (!response.data || response.data.length === 0) {
        toast.error("No data available for export");
        return;
      }
      const csvData = convertAttendanceToCSV(response.data);
      const filename = generateExportFilename(status);
      downloadCSV(csvData, filename);
      toast.success(`Exported ${response.data.length} records successfully`);
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.response?.data?.error || "Failed to export data");
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw
              className="animate-spin mx-auto mb-4 text-purple-600"
              size={48}
            />
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center bg-white p-8 rounded-3xl shadow-lg">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
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
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
            <StatsCards stats={stats} />
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
