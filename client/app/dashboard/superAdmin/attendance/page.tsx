"use client";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any>([]);
  const [attendanceOverview, setAttendanceOverview] = useState([]);
  const [selectedView, setSelectedView] = useState("dashboard");

  useEffect(() => {
    fetchStats()
    fetchHeatmapData()
    fetchAttendanceOverview();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const response = await api.get("/admin/heatmap");
      setHeatmapData(response?.data);
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
    }
  };

  const fetchAttendanceOverview = async () => {
    try {
      const response = await api.get("/admin/attendance/overview");
      setAttendanceOverview(response.data);
    } catch (error) {
      console.error("Error fetching attendance overview:", error);
    }
  };

  const exportData = async (status = "all") => {
    try {
      const response = await api.get(`/export/attendance?status=${status}`);

      const csvData = convertToCSV(response.data);
      downloadCSV(
        csvData,
        `attendance-${status}-${new Date().toISOString().split("T")[0]}.csv`
      );
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const convertToCSV = (data: any) => {
    const header = "Student Name,Email,Class,Teacher,Subject,Date,Status\n";
    const rows = data
      .map(
        (item: any) =>
          `"${item.studentId?.name}","${item.studentId?.email}","${
            item.studentId?.class
          }","${item.teacherId?.name}","${format(new Date(item.date), "dd-MM-yyyy")}"`
      )
      .join("\n");
    return header + rows;
  };

  const downloadCSV = (csvData: any, filename: any) => {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };



  const pieData = [
    {
      name: "Present",
      value: stats?.todayAttendance.present,
      color: "#10b981",
    },
    { name: "Absent", value: stats?.todayAttendance.absent, color: "#ef4444" },
    { name: "Late", value: stats?.todayAttendance.late, color: "#f59e0b" },
  ];

  return (
    <div className="">
      <nav className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Attendance
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedView("dashboard")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedView === "dashboard"
                      ? "bg-purple-100 text-purple-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  OverView
                </button>
                <button
                  onClick={() => setSelectedView("heatmap")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedView === "heatmap"
                      ? "bg-purple-100 text-purple-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Heatmap
                </button>
                <button
                  onClick={() => setSelectedView("reports")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedView === "reports"
                      ? "bg-purple-100 text-purple-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Reports
                </button>
              </div>
            </div>
          
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {selectedView === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Total Students</h3>
                <p className="text-3xl font-bold">{stats?.totalStudents}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Total Teachers</h3>
                <p className="text-3xl font-bold">{stats?.totalTeachers}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Present Today</h3>
                <p className="text-3xl font-bold">
                  {stats?.todayAttendance.present}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Absent Today</h3>
                <p className="text-3xl font-bold">
                  {stats?.todayAttendance.absent}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  Today's Attendance
                </h3>
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
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                  30-Day Attendance Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="present"
                      stroke="#10b981"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="absent"
                      stroke="#ef4444"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="late"
                      stroke="#f59e0b"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Export Attendance Data
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => exportData("all")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Export All
                </button>
                <button
                  onClick={() => exportData("present")}
                  className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Export Present
                </button>
                <button
                  onClick={() => exportData("absent")}
                  className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Export Absent
                </button>
                <button
                  onClick={() => exportData("late")}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Export Late
                </button>
              </div>
            </div>
          </>
        )}

        {selectedView === "heatmap" && (
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Attendance Heatmap - Last 30 Days
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" stackId="a" fill="#10b981" />
                <Bar dataKey="late" stackId="a" fill="#f59e0b" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedView === "reports" && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                Exception Reports
              </h3>

              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">
                  ⚠️ Low Attendance Alert
                </h4>
                <p className="text-red-700">
                  Classes with less than 70% attendance rate
                </p>
              </div>

              <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">
                  📋 Teacher No-Show
                </h4>
                <p className="text-orange-700">
                  Classes where no attendance was recorded
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceOverview
                      .slice(0, 10)
                      .map((record: any, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record?.studentId?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record?.studentId?.class}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record?.teacherId?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                record.status === "present"
                                  ? "bg-green-100 text-green-800"
                                  : record.status === "late"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
