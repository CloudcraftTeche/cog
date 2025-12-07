"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { IStudent, studentService } from "@/utils/attendanceStudent.service";
import {
  attendanceService,
  AttendanceStatus,
  IAttendance,
} from "@/utils/teacherAttendance.service";
import AttendanceNav from "@/components/teacher/attendance/AttendanceNav";
import GradeFilter from "@/components/teacher/attendance/GradeFilter";
import MarkAttendanceView from "@/components/teacher/attendance/MarkAttendanceView";
import TodaySummaryView from "@/components/teacher/attendance/TodaySummaryView";
import StatsView from "@/components/teacher/attendance/StatsView";
import HistoryView from "@/components/teacher/attendance/HistoryView";
import api from "@/lib/api";
type ViewType = "attendance" | "today" | "stats" | "history";
export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<IStudent[]>([]);
  const [allStudents, setAllStudents] = useState<IStudent[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<IAttendance[]>([]);
  const [selectedView, setSelectedView] = useState<ViewType>("attendance");
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  useEffect(() => {
    if (user) {
      initializeDashboard();
    }
  }, [user]);
  useEffect(() => {
    if (selectedGradeId) {
      const filtered = allStudents.filter((student) => {
        if (typeof student.gradeId === "object" && student.gradeId) {
          return student.gradeId._id === selectedGradeId;
        }
        return student.gradeId === selectedGradeId;
      });
      setStudents(filtered);
    } else {
      setStudents(allStudents);
    }
  }, [selectedGradeId, allStudents]);
  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchTeacherStudents(), fetchTodayAttendance()]);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };
  const fetchTeacherStudents = async () => {
    try {
      const teacherData = await api.get("/auth/me");
      const gradeId = await teacherData.data.data.gradeId;
      const data = await studentService.getStudentsByGrade(gradeId?._id);
      setAllStudents(data);
      setStudents(data);
    } catch (err: any) {
      console.error("Error fetching teacher students:", err);
      throw err;
    }
  };
  const fetchTodayAttendance = async () => {
    try {
      const data = await attendanceService.getTodayAttendance();
      setTodayAttendance(data);
    } catch (err: any) {
      console.error("Error fetching today's attendance:", err);
      throw err;
    }
  };
  const markAttendance = async (
    studentId: string,
    status: AttendanceStatus
  ) => {
    try {
      setMarkingAttendance(true);
      const student = students.find((s) => s._id === studentId);
      const gradeId = student?.gradeId
        ? typeof student.gradeId === "object"
          ? student.gradeId._id
          : student.gradeId
        : undefined;
      await attendanceService.createOrUpdateAttendance({
        studentId,
        status,
        gradeId,
      });
      await fetchTodayAttendance();
    } catch (err: any) {
      alert(err.message || "Failed to mark attendance");
    } finally {
      setMarkingAttendance(false);
    }
  };
  const exportTodayAttendance = () => {
    if (todayAttendance.length === 0) {
      alert("No attendance records to export");
      return;
    }
    const filteredAttendance = selectedGradeId
      ? todayAttendance.filter((record) => {
          const gradeId =
            record.gradeId?._id ||
            (typeof record.studentId.gradeId === "object"
              ? record.studentId.gradeId?._id
              : record.studentId.gradeId);
          return gradeId === selectedGradeId;
        })
      : todayAttendance;
    if (filteredAttendance.length === 0) {
      alert("No attendance records to export for selected filter");
      return;
    }
    const csvData = convertAttendanceToCSV(filteredAttendance);
    downloadCSV(csvData, `attendance-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };
  const convertAttendanceToCSV = (data: IAttendance[]) => {
    const header = "Student Name,Email,Roll Number,Grade,Status,Date,Time\n";
    const rows = data
      .map((item) => {
        const date = format(new Date(item.date), "dd-MM-yyyy");
        const time = new Date(item.createdAt).toLocaleTimeString();
        let gradeName = "N/A";
        if (item.gradeId) {
          gradeName = item.gradeId.grade;
        } else if (item.studentId.gradeId) {
          gradeName =
            typeof item.studentId.gradeId === "object"
              ? item.studentId.gradeId.grade
              : "N/A";
        }
        return `"${item.studentId.name}","${item.studentId.email}","${
          item.studentId.rollNumber || "N/A"
        }","${gradeName}","${item.status}","=""${date}""","=""${time}"""`;
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
  const handleGradeChange = (gradeId: string | null) => {
    setSelectedGradeId(gradeId);
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={initializeDashboard}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <p className="text-gray-600 font-semibold">
            Please log in to continue
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <AttendanceNav
        selectedView={selectedView}
        onViewChange={setSelectedView}
      />
      <div className="max-w-7xl mx-auto p-6">
        {}
        {(selectedView === "attendance" || selectedView === "today") && (
          <div className="mb-6">
            <GradeFilter
              selectedGradeId={selectedGradeId}
              onGradeChange={handleGradeChange}
              teacherId={user.id}
            />
          </div>
        )}
        {selectedView === "attendance" && (
          <MarkAttendanceView
            students={students}
            todayAttendance={todayAttendance}
            onMarkAttendance={markAttendance}
            isLoading={markingAttendance}
          />
        )}
        {selectedView === "today" && (
          <TodaySummaryView
            todayAttendance={todayAttendance.filter((record) => {
              if (!selectedGradeId) return true;
              const gradeId =
                record.gradeId?._id ||
                (typeof record.studentId.gradeId === "object"
                  ? record.studentId.gradeId?._id
                  : record.studentId.gradeId);
              return gradeId === selectedGradeId;
            })}
            totalStudents={students.length}
            onExport={exportTodayAttendance}
          />
        )}
        {selectedView === "stats" && <StatsView />}
        {selectedView === "history" && <HistoryView />}
      </div>
    </div>
  );
}
