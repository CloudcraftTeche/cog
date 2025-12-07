"use client";
import { IAttendance } from "@/utils/teacherAttendance.service";
import StatsCard from "./StatsCard";
import AttendanceTable from "./AttendanceTable";
interface TodaySummaryViewProps {
  todayAttendance: IAttendance[];
  totalStudents: number;
  onExport: () => void;
}
export default function TodaySummaryView({
  todayAttendance,
  totalStudents,
  onExport,
}: TodaySummaryViewProps) {
  const presentCount = todayAttendance.filter((a) => a.status === "present").length;
  const absentCount = todayAttendance.filter((a) => a.status === "absent").length;
  const lateCount = todayAttendance.filter((a) => a.status === "late").length;
  const excusedCount = todayAttendance.filter((a) => a.status === "excused").length;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Students"
          value={totalStudents}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          icon="👥"
        />
        <StatsCard
          title="Present"
          value={presentCount}
          gradient="bg-gradient-to-br from-green-500 to-green-700"
          icon="✓"
        />
        <StatsCard
          title="Late"
          value={lateCount}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
          icon="⏰"
        />
        <StatsCard
          title="Absent"
          value={absentCount}
          gradient="bg-gradient-to-br from-red-500 to-red-700"
          icon="✗"
        />
        <StatsCard
          title="Excused"
          value={excusedCount}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          icon="📝"
        />
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">
          Today's Attendance Records
        </h3>
        <button
          onClick={onExport}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
        >
          📊 Export Today's Attendance
        </button>
      </div>
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg">
        <AttendanceTable attendanceRecords={todayAttendance} />
      </div>
    </div>
  );
}