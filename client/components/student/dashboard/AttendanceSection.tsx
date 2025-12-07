import { AttendanceRecord } from '@/hooks/useStudentDashboard';
import React from 'react';
interface AttendanceSectionProps {
  records: AttendanceRecord[];
}
export const AttendanceSection: React.FC<AttendanceSectionProps> = ({ records }) => {
  const stats = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    total: records.length,
  };
  const attendanceRate = stats.total > 0 
    ? Math.round((stats.present / stats.total) * 100) 
    : 0;
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-all">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>📊</span> Attendance (30 Days)
      </h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          <p className="text-xs text-green-600 font-semibold">Present</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-xs text-red-600 font-semibold">Absent</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
          <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
          <p className="text-xs text-amber-600 font-semibold">Late</p>
        </div>
      </div>
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
        <p className="text-3xl font-bold text-green-600 mb-3">{attendanceRate}%</p>
        <div className="w-full bg-white rounded-full h-2 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-500" 
            style={{ width: `${attendanceRate}%` }} 
          />
        </div>
      </div>
    </div>
  );
};