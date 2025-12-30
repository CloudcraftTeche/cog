"use client";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { IStudent } from "@/utils/attendanceStudent.service";
import {
  AttendanceStatus,
  IAttendance,
} from "@/utils/teacherAttendance.service";
import StudentAttendanceCard from "./StudentAttendanceCard";

interface MarkAttendanceViewProps {
  students: IStudent[];
  attendanceRecords: IAttendance[];
  onMarkAttendance: (
    studentId: string,
    status: AttendanceStatus,
    date: Date
  ) => Promise<void>;
  isLoading?: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function MarkAttendanceView({
  students,
  attendanceRecords,
  onMarkAttendance,
  isLoading,
  selectedDate,
  onDateChange,
}: MarkAttendanceViewProps) {
  const getAttendanceStatus = (studentId: string): AttendanceStatus | null => {
    const attendance = attendanceRecords.find(
      (a) =>
        a.studentId._id === studentId &&
        format(new Date(a.date), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
    );
    return attendance ? attendance.status : null;
  };

  const handleMarkAttendance = async (
    studentId: string,
    status: AttendanceStatus
  ) => {
    await onMarkAttendance(studentId, status, selectedDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onDateChange(newDate);
  };

  const maxDate = format(new Date(), "yyyy-MM-dd");

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
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Mark Attendance
        </h2>
        <div className="flex items-center gap-4 bg-white rounded-lg shadow-md p-4 border border-gray-200 max-w-md">
          <Calendar className="text-emerald-600" size={24} />
          <div className="flex-1">
            <label
              htmlFor="attendance-date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Date
            </label>
            <input
              id="attendance-date"
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={handleDateChange}
              max={maxDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
        <p className="text-gray-600 mt-4">
          Marking attendance for:{" "}
          <span className="font-semibold">
            {format(selectedDate, "EEEE, dd MMMM yyyy")}
          </span>
        </p>
        {format(selectedDate, "yyyy-MM-dd") !== maxDate && (
          <p className="text-amber-600 mt-2 text-sm font-medium">
            ⚠️ You are marking attendance for a past date
          </p>
        )}
      </div>
      <div className="grid gap-4">
        {students?.map((student) => (
          <StudentAttendanceCard
            key={student._id}
            student={student}
            currentStatus={getAttendanceStatus(student._id)}
            onMarkAttendance={handleMarkAttendance}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}