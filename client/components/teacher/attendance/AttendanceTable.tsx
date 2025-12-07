"use client";
import { IAttendance } from "@/utils/teacherAttendance.service";
interface AttendanceTableProps {
  attendanceRecords: IAttendance[];
  onDelete?: (attendanceId: string) => void;
  showActions?: boolean;
}
export default function AttendanceTable({
  attendanceRecords,
  onDelete,
  showActions = false,
}: AttendanceTableProps) {
  if (attendanceRecords.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No attendance records found
      </div>
    );
  }
  const getStatusBadge = (status: string) => {
    const styles = {
      present: "bg-green-100 text-green-800",
      late: "bg-yellow-100 text-yellow-800",
      absent: "bg-red-100 text-red-800",
      excused: "bg-blue-100 text-blue-800",
    };
    return (
      <span
        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  const getGradeName = (record: IAttendance): string => {
    if (record.gradeId) {
      return record.gradeId.grade;
    }
    if (record.studentId.gradeId) {
      return typeof record.studentId.gradeId === 'object' 
        ? record.studentId.gradeId.grade 
        : 'N/A';
    }
    return 'N/A';
  };
  return (
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
              Roll Number
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Grade
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Status
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Time
            </th>
            {showActions && (
              <th className="text-left py-3 px-4 font-semibold text-gray-700">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {attendanceRecords.map((record) => (
            <tr
              key={record._id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4 font-medium">
                {record.studentId.name}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {record.studentId.email}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {record.studentId.rollNumber || "N/A"}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {getGradeName(record)}
              </td>
              <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
              <td className="py-3 px-4 text-gray-600">
                {new Date(record.createdAt).toLocaleTimeString()}
              </td>
              {showActions && onDelete && (
                <td className="py-3 px-4">
                  <button
                    onClick={() => onDelete(record._id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}