"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AttendanceTable from "./AttendanceTable";
import { attendanceService, IAttendance } from "@/utils/teacherAttendance.service";

export default function HistoryView() {
  const { user } = useAuth();
  const [records, setRecords] = useState<IAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
  });

  const handleSearch = async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        teacherId: user.id, 
      };
      
      if (filters.status !== "all") params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await attendanceService.exportAttendance(params);
      setRecords(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch attendance history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attendanceId: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      await attendanceService.deleteAttendance(attendanceId);
      setRecords(records.filter((r) => r._id !== attendanceId));
    } catch (err: any) {
      alert(err.message || "Failed to delete attendance record");
    }
  };

  const handleExport = () => {
    if (records.length === 0) {
      alert("No records to export");
      return;
    }

    const csvData = convertToCSV(records);
    downloadCSV(csvData, `attendance-history-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const convertToCSV = (data: IAttendance[]) => {
    const header = "Date,Student Name,Email,Roll Number,Grade,Status,Time,Remarks\n";
    const rows = data
      .map((item) => {
        const date = new Date(item.date).toLocaleDateString();
        const time = new Date(item.createdAt).toLocaleTimeString();
        
        let gradeName = 'N/A';
        if (item.gradeId) {
          gradeName = item.gradeId.grade;
        } else if (item.studentId.gradeId) {
          gradeName = typeof item.studentId.gradeId === 'object' 
            ? item.studentId.gradeId.grade 
            : 'N/A';
        }
        
        return `"${date}","${item.studentId.name}","${item.studentId.email}","${
          item.studentId.rollNumber || "N/A"
        }","${gradeName}","${item.status}","${time}","${item.remarks || ""}"`;
      })
      .join("\n");
    return header + rows;
  };

  const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFilters({
      status: "all",
      startDate: "",
      endDate: "",
    });
    setRecords([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Attendance History</h2>
          <p className="text-sm text-gray-500 mt-1">
            Search and export attendance records for your students
          </p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Filter Records</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="excused">Excused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {records.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Found <span className="font-semibold text-gray-800">{records.length}</span> records
            </div>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Results
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Search Results
            </h3>
            <AttendanceTable
              attendanceRecords={records}
              onDelete={handleDelete}
              showActions={true}
            />
          </div>
        </>
      )}

      {!loading && records.length === 0 && !error && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 font-medium mb-2">No records found</p>
          <p className="text-gray-500 text-sm">
            Use the filters above to search for attendance records
          </p>
        </div>
      )}
    </div>
  );
}