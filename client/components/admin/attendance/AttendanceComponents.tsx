"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Filter } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
interface StatsCardsProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    todayAttendance: {
      present: number;
      absent: number;
      late: number;
      excused: number;
      total: number;
    };
  } | null;
}
export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;
  const attendanceRate = stats.todayAttendance.total > 0
    ? ((stats.todayAttendance.present + stats.todayAttendance.late) / stats.todayAttendance.total * 100).toFixed(1)
    : 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-3xl shadow-lg">
        <h3 className="text-lg font-semibold mb-2 opacity-90">Total Students</h3>
        <p className="text-4xl font-bold">{stats.totalStudents}</p>
      </div>
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-3xl shadow-lg">
        <h3 className="text-lg font-semibold mb-2 opacity-90">Total Teachers</h3>
        <p className="text-4xl font-bold">{stats.totalTeachers}</p>
      </div>
      <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-3xl shadow-lg">
        <h3 className="text-lg font-semibold mb-2 opacity-90">Present Today</h3>
        <p className="text-4xl font-bold">{stats.todayAttendance.present}</p>
        <p className="text-sm opacity-90 mt-1">
          +{stats.todayAttendance.late} late
        </p>
      </div>
      <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-3xl shadow-lg">
        <h3 className="text-lg font-semibold mb-2 opacity-90">Attendance Rate</h3>
        <p className="text-4xl font-bold">{attendanceRate}%</p>
        <p className="text-sm opacity-90 mt-1">
          {stats.todayAttendance.absent} absent, {stats.todayAttendance.excused} excused
        </p>
      </div>
    </div>
  );
}
interface AttendancePieChartProps {
  data: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}
export function AttendancePieChart({ data }: AttendancePieChartProps) {
  const pieData = [
    { name: "Present", value: data.present, color: "#10b981" },
    { name: "Absent", value: data.absent, color: "#ef4444" },
    { name: "Late", value: data.late, color: "#f59e0b" },
    { name: "Excused", value: data.excused, color: "#6366f1" },
  ].filter(item => item.value > 0);
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Today's Attendance Distribution
      </h3>
      {pieData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          No attendance data for today
        </div>
      )}
    </div>
  );
}
interface HeatmapData {
  _id: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}
interface AttendanceTrendChartProps {
  data: HeatmapData[];
}
export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        30-Day Attendance Trend
      </h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="_id" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="present"
              stroke="#10b981"
              strokeWidth={2}
              name="Present"
            />
            <Line
              type="monotone"
              dataKey="absent"
              stroke="#ef4444"
              strokeWidth={2}
              name="Absent"
            />
            <Line
              type="monotone"
              dataKey="late"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Late"
            />
            <Line
              type="monotone"
              dataKey="excused"
              stroke="#6366f1"
              strokeWidth={2}
              name="Excused"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          No trend data available
        </div>
      )}
    </div>
  );
}
interface HeatmapData {
  _id: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}
interface AttendanceHeatmapProps {
  data: HeatmapData[];
}
export function AttendanceHeatmap({ data }: AttendanceHeatmapProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Attendance Heatmap - Last 30 Days
      </h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="_id"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Bar dataKey="present" stackId="a" fill="#10b981" name="Present" />
            <Bar dataKey="late" stackId="a" fill="#f59e0b" name="Late" />
            <Bar dataKey="excused" stackId="a" fill="#6366f1" name="Excused" />
            <Bar dataKey="absent" stackId="a" fill="#ef4444" name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          No heatmap data available
        </div>
      )}
    </div>
  );
}
interface ExportSectionProps {
  onExport: (status: string, startDate?: string, endDate?: string) => Promise<void>;
}
export function ExportSection({ onExport }: ExportSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const validateDates = () => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        setError("Start date must be before end date");
        return false;
      }
    }
    setError("");
    return true;
  };
  const handleExport = async (status: string) => {
    if (!validateDates()) return;
    setIsLoading(true);
    try {
      await onExport(status, startDate || undefined, endDate || undefined);
    } catch (err) {
      setError("Failed to export data");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Export Attendance Data
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Filter size={16} />
          {showFilters ? "Hide" : "Show"} Filters
        </button>
      </div>
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => handleExport("all")}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Export All
        </button>
        <button
          onClick={() => handleExport("present")}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Download size={18} />
          Export Present
        </button>
        <button
          onClick={() => handleExport("absent")}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Download size={18} />
          Export Absent
        </button>
        <button
          onClick={() => handleExport("late")}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Download size={18} />
          Export Late
        </button>
        <button
          onClick={() => handleExport("excused")}
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Download size={18} />
          Export Excused
        </button>
      </div>
    </div>
  );
}
interface AttendanceRecord {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  gradeId?: {
    _id: string;
    grade: string;
  };
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}
interface AttendanceTableProps {
  records: AttendanceRecord[];
  title?: string;
}
export function AttendanceTable({ records, title = "Recent Attendance Records" }: AttendanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const recordsPerPage = 10;
  const filteredRecords = records.filter(record =>
    record.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.studentId.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);
  const getStatusBadge = (status: string) => {
    const styles = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      excused: "bg-indigo-100 text-indigo-800"
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <span className="text-sm text-gray-600">
            {filteredRecords.length} records
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teacher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRecords.length > 0 ? (
              currentRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.studentId.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.studentId.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.gradeId?.grade || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.teacherId.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {record.remarks || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of{" "}
            {filteredRecords.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? "bg-purple-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}