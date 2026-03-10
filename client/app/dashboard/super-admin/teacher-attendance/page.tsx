"use client";
import { useState, useCallback } from "react";
import { Loader2, Search, X } from "lucide-react";
import {
  useTeachers,
  useTeacherAttendanceStats,
  useTeacherAttendanceHeatmap,
  useTodayTeacherAttendance,
  useTeacherAttendanceByDate,
  useMarkTeacherAttendance,
  useExportTeacherAttendance,
} from "@/hooks/admin/useTeacherAttendance";
import { AttendanceStatus } from "@/types/admin/teacher-attendance.types";
import {
  formatDate,
  convertTeacherAttendanceToCSV,
  downloadCSV,
} from "@/utils/admin/teacher-attendance.utils";
import { toast } from "sonner";
import TeacherPagination from "@/components/admin/teacher-attendance/TeacherPagination";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
type ViewType = "attendance" | "today" | "stats" | "history";

const STATUS_BUTTONS: {
  status: AttendanceStatus;
  label: string;
  icon: string;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    status: "present",
    label: "Present",
    icon: "✓",
    activeClass: "bg-green-500 text-white shadow-lg scale-105",
    idleClass: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  {
    status: "late",
    label: "Late",
    icon: "⏰",
    activeClass: "bg-yellow-500 text-white shadow-lg scale-105",
    idleClass: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  },
  {
    status: "absent",
    label: "Absent",
    icon: "✗",
    activeClass: "bg-red-500 text-white shadow-lg scale-105",
    idleClass: "bg-red-100 text-red-700 hover:bg-red-200",
  },
  {
    status: "excused",
    label: "Excused",
    icon: "📝",
    activeClass: "bg-blue-500 text-white shadow-lg scale-105",
    idleClass: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
];

export default function AdminTeacherAttendanceDashboard() {
  const [selectedView, setSelectedView] = useState<ViewType>("attendance");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [searchInput, setSearchInput] = useState<string>("");

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size: PageSize) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const {
    data: teachersPage,
    isLoading: teachersLoading,
    isFetching: teachersFetching,
  } = useTeachers({
    page: currentPage,
    limit: pageSize,
    search: searchInput,
  });

  const teachers = teachersPage?.data ?? [];
  const paginationMeta = teachersPage?.meta;

  const { data: stats, isLoading: statsLoading } = useTeacherAttendanceStats();
  const { data: heatmapData = [], isLoading: heatmapLoading } =
    useTeacherAttendanceHeatmap();
  const { data: todayRecords = [], isLoading: todayLoading } =
    useTodayTeacherAttendance();
  const { data: dateRecords = [], isLoading: dateLoading } =
    useTeacherAttendanceByDate(selectedDate);

  const markAttendanceMutation = useMarkTeacherAttendance();
  const exportMutation = useExportTeacherAttendance();

  const attendanceRecords =
    selectedView === "today" ? todayRecords : dateRecords;

  const isShellLoading = statsLoading || heatmapLoading;

  const markAttendance = async (
    teacherId: string,
    status: AttendanceStatus,
  ) => {
    const teacher = teachers.find((t: any) => t._id === teacherId);
    const gradeId =
      teacher && typeof teacher.gradeId === "object" && teacher.gradeId
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
    const record = attendanceRecords.find(
      (a) =>
        a.studentId._id === teacherId &&
        formatDate(new Date(a.date), "yyyy-MM-dd") ===
          formatDate(selectedDate, "yyyy-MM-dd"),
    );
    return record?.status ?? null;
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
      const csv = convertTeacherAttendanceToCSV(data);
      downloadCSV(
        csv,
        `teacher-attendance-${formatDate(new Date(), "yyyy-MM-dd")}.csv`,
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to export attendance");
    }
  };

  if (isShellLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading teacher attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Teacher Attendance Management
              </h1>
              <div className="flex space-x-4">
                {(
                  [
                    { id: "attendance", label: "Mark Attendance" },
                    { id: "today", label: "Today's Summary" },
                    { id: "stats", label: "Statistics" },
                    { id: "history", label: "History" },
                  ] as { id: ViewType; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedView(item.id)}
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
        {selectedView === "attendance" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-3xl font-bold text-gray-800">
                Mark Teacher Attendance
              </h2>
              <div className="flex items-center gap-4 bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <label
                  htmlFor="attendance-date"
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
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

            <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-3">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
                {searchInput && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="whitespace-nowrap">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) =>
                    handlePageSizeChange(Number(e.target.value) as PageSize)
                  }
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {teachersLoading ? (
              <div className="text-center py-16">
                <Loader2 className="inline-block h-12 w-12 animate-spin text-blue-600" />
                <p className="mt-4 text-gray-600">Loading teachers…</p>
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg font-medium mb-1">No teachers found</p>
                {searchInput && (
                  <p className="text-sm">
                    Try a different search term or{" "}
                    <button
                      className="text-blue-600 underline"
                      onClick={() => handleSearchChange("")}
                    >
                      clear the filter
                    </button>
                    .
                  </p>
                )}
              </div>
            ) : (
              <div
                className={`grid gap-4 transition-opacity ${teachersFetching ? "opacity-60" : "opacity-100"}`}
              >
                {teachers.map((teacher: any) => {
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
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
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

                        <div className="flex flex-wrap gap-2">
                          {STATUS_BUTTONS.map(
                            ({
                              status,
                              label,
                              icon,
                              activeClass,
                              idleClass,
                            }) => (
                              <button
                                key={status}
                                onClick={() =>
                                  markAttendance(teacher._id, status)
                                }
                                disabled={markAttendanceMutation.isPending}
                                className={`px-5 py-2.5 rounded-xl font-semibold transition-all text-sm
                                  ${currentStatus === status ? activeClass : idleClass}
                                  disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {icon} {label}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {paginationMeta && paginationMeta.totalPages > 1 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 px-5 py-3">
                <TeacherPagination
                  meta={paginationMeta}
                  onPageChange={setCurrentPage}
                  isFetching={teachersFetching}
                />
              </div>
            )}
          </div>
        )}

        {selectedView === "today" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {(
                [
                  {
                    label: "Total Teachers",
                    value: stats?.totalTeachers ?? 0,
                    gradient: "from-blue-500 to-blue-700",
                  },
                  {
                    label: "Present",
                    value: stats?.todayAttendance.present ?? 0,
                    gradient: "from-green-500 to-green-700",
                  },
                  {
                    label: "Late",
                    value: stats?.todayAttendance.late ?? 0,
                    gradient: "from-yellow-500 to-orange-500",
                  },
                  {
                    label: "Absent",
                    value: stats?.todayAttendance.absent ?? 0,
                    gradient: "from-red-500 to-red-700",
                  },
                  {
                    label: "Excused",
                    value: stats?.todayAttendance.excused ?? 0,
                    gradient: "from-indigo-500 to-indigo-700",
                  },
                ] as const
              ).map(({ label, value, gradient }) => (
                <div
                  key={label}
                  className={`bg-gradient-to-br ${gradient} text-white p-6 rounded-3xl shadow-lg`}
                >
                  <h3 className="text-lg font-semibold mb-2">{label}</h3>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                Today's Attendance Records
              </h3>
              <button
                onClick={exportTodayAttendance}
                disabled={exportMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportMutation.isPending
                  ? "Exporting…"
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
                      {["Teacher", "Email", "Grade", "Status", "Time"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left py-3 px-4 font-semibold text-gray-700"
                          >
                            {h}
                          </th>
                        ),
                      )}
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
                          {record.gradeId?.grade ?? "N/A"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-8 rounded-3xl shadow-lg flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Total Teachers</h3>
                  <p className="text-4xl font-bold">
                    {stats?.totalTeachers ?? 0}
                  </p>
                </div>
                <span className="text-5xl opacity-80">👥</span>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-8 rounded-3xl shadow-lg flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Today's Attendance
                  </h3>
                  <p className="text-4xl font-bold">
                    {stats?.todayAttendance.total ?? 0}
                  </p>
                </div>
                <span className="text-5xl opacity-80">📋</span>
              </div>
            </div>

            {heatmapData.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  Last 7 Days Attendance Heatmap
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Visual representation of teacher attendance patterns
                </p>
                <div className="space-y-2">
                  {heatmapData.map((day) => {
                    const total =
                      day.present + day.absent + day.late + day.excused;
                    const pct = (n: number) =>
                      total > 0 ? (n / total) * 100 : 0;

                    return (
                      <div key={day._id} className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-28 font-medium">
                          {day._id}
                        </span>
                        <div className="flex-1 flex gap-0.5 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          {(
                            [
                              {
                                pct: pct(day.present),
                                count: day.present,
                                color: "bg-green-500",
                              },
                              {
                                pct: pct(day.late),
                                count: day.late,
                                color: "bg-yellow-500",
                              },
                              {
                                pct: pct(day.absent),
                                count: day.absent,
                                color: "bg-red-500",
                              },
                              {
                                pct: pct(day.excused),
                                count: day.excused,
                                color: "bg-blue-500",
                              },
                            ] as const
                          ).map(
                            ({ pct: p, count, color }) =>
                              p > 0 && (
                                <div
                                  key={color}
                                  className={`${color} flex items-center justify-center text-white text-xs font-semibold`}
                                  style={{ width: `${p}%` }}
                                >
                                  {p > 10 ? count : ""}
                                </div>
                              ),
                          )}
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right font-semibold">
                          {total} total
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm flex-wrap">
                  {[
                    { color: "bg-green-500", label: "Present" },
                    { color: "bg-yellow-500", label: "Late" },
                    { color: "bg-red-500", label: "Absent" },
                    { color: "bg-blue-500", label: "Excused" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 ${color} rounded`} />
                      <span className="text-gray-600">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

   
        {selectedView === "history" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Attendance History
            </h2>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg text-center py-12">
              <p className="text-gray-600 font-medium mb-2">
                History feature coming soon
              </p>
              <p className="text-gray-500 text-sm">
                Advanced filtering and search for historical attendance records
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
