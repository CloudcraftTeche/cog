import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formattedData = data.map(item => ({
    ...item,
    displayDate: formatDate(item.date)
  }));

  const totalPresent = data.reduce((sum, item) => sum + item.present, 0);
  const totalAbsent = data.reduce((sum, item) => sum + item.absent, 0);
  const totalLate = data.reduce((sum, item) => sum + item.late, 0);
  const total = totalPresent + totalAbsent + totalLate;
  const attendanceRate = total > 0 ? ((totalPresent / total) * 100).toFixed(1) : 0;

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100 p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            Attendance Overview
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-12">Last 7 Days Performance</p>
        </div>
        <div className="text-right bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-white mb-1">
            <TrendingUp className="w-5 h-5" />
            <div className="text-3xl font-black">{attendanceRate}%</div>
          </div>
          <div className="text-xs text-green-100 font-semibold uppercase tracking-wide">Overall Rate</div>
        </div>
      </div>

      <div className="h-64 bg-white/50 rounded-xl p-4 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <defs>
              <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                padding: '12px'
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontWeight: 600 }} />
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Present"
              dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#10b981' }}
            />
            <Line 
              type="monotone" 
              dataKey="absent" 
              stroke="#ef4444" 
              strokeWidth={3}
              name="Absent"
              dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#ef4444' }}
            />
            <Line 
              type="monotone" 
              dataKey="late" 
              stroke="#f59e0b" 
              strokeWidth={3}
              name="Late"
              dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#f59e0b' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="text-3xl font-black text-white">{totalPresent}</div>
          <div className="text-sm text-green-100 mt-1 font-semibold">Present</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="text-3xl font-black text-white">{totalAbsent}</div>
          <div className="text-sm text-red-100 mt-1 font-semibold">Absent</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="text-3xl font-black text-white">{totalLate}</div>
          <div className="text-sm text-orange-100 mt-1 font-semibold">Late</div>
        </div>
      </div>
    </div>
  );
};