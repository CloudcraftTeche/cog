"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { format } from "date-fns";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [selectedView, setSelectedView] = useState("attendance");

  useEffect(() => {
    fetchStudents();
    fetchTodayAttendance();
  }, [user]);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get("/attendance/today");
      setTodayAttendance(response.data);
    } catch (error) {
      console.error("Error fetching today attendance:", error);
    }
  };

  const markAttendance = async (studentId: any, status: any) => {
    try {
      await api.post("/attendance", {
        studentId,
        status,
        class: "KG",
      });
      fetchTodayAttendance();
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  };

  const getAttendanceStatus = (studentId: any) => {
    const attendance: any = todayAttendance.find(
      (a: any) => a?.studentId?._id === studentId
    );
    return attendance ? attendance?.status : null;
  };

  const exportTodayAttendance = () => {
    const csvData = convertAttendanceToCSV(todayAttendance);
    downloadCSV(
      csvData,
      `attendance-${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const convertAttendanceToCSV = (data: any) => {
    const header = "Student Name,Email,Class,Status,Date\n";
    const rows = data
      .map((item: any) => {
        return `"${item.studentId.name}","${item.studentId.email}","${
          item.studentId.class
        }","${item.status}","${format(new Date(item.date), "dd-MM-yyyy")}"`;
      })
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

  const presentCount = todayAttendance.filter(
    (a: any) => a?.status === "present"
  ).length;
  const absentCount = todayAttendance.filter(
    (a: any) => a?.status === "absent"
  ).length;
  const lateCount = todayAttendance.filter(
    (a: any) => a?.status === "late"
  ).length;

  return (
    <div className="">
      <nav className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Attendance
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedView("attendance")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedView === "attendance"
                      ? "bg-emerald-100 text-emerald-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Mark Attendance
                </button>
                <button
                  onClick={() => setSelectedView("today")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedView === "today"
                      ? "bg-emerald-100 text-emerald-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Today's Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {selectedView === "attendance" && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Mark Attendance
              </h2>
              <p className="text-gray-600">
                
                Date: {format(new Date(), "dd-MM-yyyy")}
              </p>
            </div>

            <div className="grid gap-4">
              {students.map((student: any) => {
                const currentStatus = getAttendanceStatus(student?._id);
                return (
                  <div
                    key={student._id}
                    className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {student.name}
                          </h3>
                          <p className="text-gray-600">
                            {student.email} • Class: {student.class}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAttendance(student._id, "present")}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            currentStatus === "present"
                              ? "bg-green-500 text-white shadow-lg scale-105"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => markAttendance(student._id, "late")}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            currentStatus === "late"
                              ? "bg-yellow-500 text-white shadow-lg scale-105"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          }`}
                        >
                          ⏰ Late
                        </button>
                        <button
                          onClick={() => markAttendance(student._id, "absent")}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            currentStatus === "absent"
                              ? "bg-red-500 text-white shadow-lg scale-105"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          ✗ Absent
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {selectedView === "today" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Total Students</h3>
                <p className="text-3xl font-bold">{students.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Present</h3>
                <p className="text-3xl font-bold">{presentCount}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Late</h3>
                <p className="text-3xl font-bold">{lateCount}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 text-white p-6 rounded-3xl shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Absent</h3>
                <p className="text-3xl font-bold">{absentCount}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={exportTodayAttendance}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                📊 Export Today's Attendance
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                Today's Attendance Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Student
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Class
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
                    {todayAttendance.map((record: any, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{record.studentId.name}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {record.studentId.email}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {record.studentId.class}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
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
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(record.createdAt).toLocaleTimeString()}
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
