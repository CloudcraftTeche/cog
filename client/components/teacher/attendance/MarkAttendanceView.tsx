"use client";
import { IStudent } from "@/utils/attendanceStudent.service";
import { AttendanceStatus, IAttendance } from "@/utils/teacherAttendance.service";
import { format } from "date-fns";
import StudentAttendanceCard from "./StudentAttendanceCard";
interface MarkAttendanceViewProps {
  students: IStudent[];
  todayAttendance: IAttendance[];
  onMarkAttendance: (studentId: string, status: AttendanceStatus) => Promise<void>;
  isLoading?: boolean;
}
export default function MarkAttendanceView({
  students,
  todayAttendance,
  onMarkAttendance,
  isLoading,
}: MarkAttendanceViewProps) {
  const getAttendanceStatus = (studentId: string): AttendanceStatus | null => {
    const attendance = todayAttendance.find(
      (a) => a.studentId._id === studentId
    );
    return attendance ? attendance.status : null;
  };
  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No students found</p>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Mark Attendance
        </h2>
        <p className="text-gray-600">
          Date: {format(new Date(), "dd-MM-yyyy")}
        </p>
      </div>
      <div className="grid gap-4">
        {students?.map((student) => (
          <StudentAttendanceCard
            key={student._id}
            student={student}
            currentStatus={getAttendanceStatus(student._id)}
            onMarkAttendance={onMarkAttendance}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}