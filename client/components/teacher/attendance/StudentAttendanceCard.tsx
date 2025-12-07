"use client";
import { IStudent } from "@/utils/attendanceStudent.service";
import { AttendanceStatus } from "@/utils/teacherAttendance.service";
interface StudentAttendanceCardProps {
  student: IStudent;
  currentStatus: AttendanceStatus | null;
  onMarkAttendance: (studentId: string, status: AttendanceStatus) => void;
  isLoading?: boolean;
}
export default function StudentAttendanceCard({
  student,
  currentStatus,
  onMarkAttendance,
  isLoading,
}: StudentAttendanceCardProps) {
  const statusButtons: { status: AttendanceStatus; label: string; icon: string; colors: string }[] = [
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
  const gradeName = typeof student.gradeId === 'object' && student.gradeId 
    ? student.gradeId.grade 
    : null;
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
            <p className="text-gray-600 text-sm">
              {student.email}
              {student.rollNumber && ` • Roll: ${student.rollNumber}`}
              {gradeName && ` • Grade: ${gradeName}`}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {statusButtons.map(({ status, label, icon, colors }) => (
            <button
              key={status}
              onClick={() => onMarkAttendance(student._id, status)}
              disabled={isLoading}
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
}