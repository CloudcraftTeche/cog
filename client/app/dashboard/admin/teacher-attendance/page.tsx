"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useTeachers,
  useTeacherAttendanceStats,
  useTeacherAttendanceHeatmap,
  useTodayTeacherAttendance,
  useTeacherAttendanceByDate,
  useMarkTeacherAttendance,
  useExportTeacherAttendance,
} from "@/hooks/admin/useTeacherAttendance";
import {
  AttendanceStatus,
} from "@/types/admin/teacher-attendance.types";
import {
  formatDate,
  convertTeacherAttendanceToCSV,
  downloadCSV,
} from "@/utils/admin/teacher-attendance.utils";
import { toast } from "sonner";
type ViewType = "attendance" | "today" | "stats" | "history";
export default function AdminTeacherAttendanceDashboard() {
  const [selectedView, setSelectedView] = useState<ViewType>("attendance");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const {
    data: stats,
    isLoading: statsLoading,
  } = useTeacherAttendanceStats();
  const {
    data: heatmapData = [],
    isLoading: heatmapLoading,
  } = useTeacherAttendanceHeatmap();
  const {
    data: todayRecords = [],
    isLoading: todayLoading,
  } = useTodayTeacherAttendance();
  const {
    data: dateRecords = [],
    isLoading: dateLoading,
  } = useTeacherAttendanceByDate(selectedDate);
  const markAttendanceMutation = useMarkTeacherAttendance();
  const exportMutation = useExportTeacherAttendance();
  const attendanceRecords =
    selectedView === "today" ? todayRecords : dateRecords;
  const isLoading = teachersLoading || statsLoading || heatmapLoading;
  const markAttendance = async (
    teacherId: string,
    status: AttendanceStatus
  ) => {
    const teacher = teachers.find((t) => t._id === teacherId);
    const gradeId =
      teacher && typeof teacher.gradeId === "object"
        ? teacher.gradeId._id
        : undefined;
    await markAttendanceMutation.mutateAsync({
      teacherId,
      status,
      gradeId,
      date: selectedDate,
    });
  };
  const getAttendanceStatus = (teacherId: string): AttendanceStatus | null => {
    const attendance = attendanceRecords.find(
      (a) =>
        a.studentId._id === teacherId &&
        formatDate(new Date(a.date), "yyyy-MM-dd") ===
          formatDate(selectedDate, "yyyy-MM-dd")
    );
    return attendance ? attendance.status : null;
  };
  const exportTodayAttendance = async () => {
    try {
      const data = await exportMutation.mutateAsync({
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(new Date().setHours(23, 59, 59, 999)),
      });
      if (data.length === 0) {
        toast.error("No attendance records to export");
        return;
      }
      const csvData = convertTeacherAttendanceToCSV(data);
      downloadCSV(
        csvData,
        `teacher-attendance-${formatDate(new Date(), "yyyy-MM-dd")}.csv`
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to export attendance");
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading teacher attendance...</p>
        </div>
      </div>
    );
  }
  const statusButtons: {
    status: AttendanceStatus;
    label: string;
    icon: string;
    colors: string;
  }[] = [
    {
      status: "present",
      label: "Present",
      icon: "✓",
      colors: "bg-green-100 text-green-700 hover:bg-green-200",
    },
    {
      status: "late",
      label: "Late",
      icon: "⏰",
      colors: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    },
    {
      status: "absent",
      label: "Absent",
      icon: "✗",
      colors: "bg-red-100 text-red-700 hover:bg-red-200",
    },
    {
      status: "excused",
      label: "Excused",
      icon: "📝",
      colors: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Teacher Attendance Management
              </h1>
              <div className="flex space-x-4">
                {[
                  { id: "attendance", label: "Mark Attendance" },
                  { id: "today", label: "Today's Summary" },
                  { id: "stats", label: "Statistics" },
                  { id: "history", label: "History" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedView(item.id as ViewType)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedView === item.id
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto p-6">
        {}
        {selectedView === "attendance" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">
                Mark Teacher Attendance
              </h2>
              <div className="flex items-center gap-4 bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <label
                  htmlFor="attendance-date"
                  className="text-sm font-medium text-gray-700"
                >
                  Select Date:
                </label>
                <input
                  id="attendance-date"
                  type="date"
                  value={formatDate(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  max={formatDate(new Date(), "yyyy-MM-dd")}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {dateLoading ? (
              <div className="text-center py-12">
                <Loader2 className="inline-block h-12 w-12 animate-spin text-blue-600" />
                <p className="mt-4 text-gray-600">Loading teachers...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {teachers.map((teacher) => {
                  const currentStatus = getAttendanceStatus(teacher._id);
                  const gradeName =
                    typeof teacher.gradeId === "object" && teacher.gradeId
                      ? teacher.gradeId.grade
                      : null;
                  return (
                    <div
                      key={teacher._id}
                      className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {teacher.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {teacher.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {teacher.email}
                              {gradeName && ` • Grade: ${gradeName}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {statusButtons.map(({ status, label, icon, colors }) => (
                            <button
                              key={status}
                              onClick={() => markAttendance(teacher._id, status)}
                              disabled={markAttendanceMutation.isPending}
                              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                currentStatus === status
                                  ? `${status === "present" ? "bg-green-500" : status === "late" ? "bg-yellow-500" : status === "absent" ? "bg-red-500" : "bg-blue-500"} text-white shadow-lg scale-105`
                                  : colors
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {icon} {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {}
        {selectedView === "today" && (
          <div className="space-y-8">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Total Teachers</h3>
                <p className="text-3xl font-bold">{stats?.totalTeachers || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Present</h3>
                <p className="text-3xl font-bold">
                  {stats?.todayAttendance.present || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Late</h3>
                <p className="text-3xl font-bold">
                  {stats?.todayAttendance.late || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Absent</h3>
                <p className="text-3xl font-bold">
                  {stats?.todayAttendance.absent || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Excused</h3>
                <p className="text-3xl font-bold">
                  {stats?.todayAttendance.excused || 0}
                </p>
              </div>
            </div>
            {}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                Today's Attendance Records
              </h3>
              <button
                onClick={exportTodayAttendance}
                disabled={exportMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {exportMutation.isPending
                  ? "Exporting..."
                  : "Export Today's Attendance"}
              </button>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg overflow-x-auto">
              {todayLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="inline-block h-12 w-12 animate-spin text-blue-600" />
                </div>
              ) : todayRecords.length > 0 ? (
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Teacher
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Grade
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayRecords.map((record) => (
                      <tr
                        key={record._id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium">
                          {record.studentId.name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {record.studentId.email}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {record.gradeId ? record.gradeId.grade : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              record.status === "present"
                                ? "bg-green-100 text-green-800"
                                : record.status === "late"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : record.status === "absent"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {record.status.charAt(0).toUpperCase() +
                              record.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(record.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-medium mb-2">
                    No attendance records for today
                  </p>
                  <p className="text-sm">
                    Start marking attendance to see records here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {}
        {selectedView === "stats" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Teacher Attendance Statistics
            </h2>
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Total Teachers
                    </h3>
                    <p className="text-4xl font-bold">
                      {stats?.totalTeachers || 0}
                    </p>
                  </div>
                  <span className="text-5xl opacity-80">👥</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Today's Attendance
                    </h3>
                    <p className="text-4xl font-bold">
                      {stats?.todayAttendance.total || 0}
                    </p>
                  </div>
                  <span className="text-5xl opacity-80">📋</span>
                </div>
              </div>
            </div>
            {}
            {heatmapData.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">
                  Last 7 Days Attendance Heatmap
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Visual representation of teacher attendance patterns
                </p>
                <div className="space-y-2">
                  {heatmapData.map((day) => {
                    const total =
                      day.present + day.absent + day.late + day.excused;
                    const presentPercent =
                      total > 0 ? (day.present / total) * 100 : 0;
                    const latePercent =
                      total > 0 ? (day.late / total) * 100 : 0;
                    const absentPercent =
                      total > 0 ? (day.absent / total) * 100 : 0;
                    const excusedPercent =
                      total > 0 ? (day.excused / total) * 100 : 0;
                    return (
                      <div key={day._id} className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-28 font-medium">
                          {day._id}
                        </span>
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
          </div>
        )}
        {}
        {selectedView === "history" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Attendance History
            </h2>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-600 font-medium mb-2">
                  History feature coming soon
                </p>
                <p className="text-gray-500 text-sm">
                  Advanced filtering and search capabilities for historical
                  attendance records
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}