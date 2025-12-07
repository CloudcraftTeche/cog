import { Overview } from '@/hooks/useStudentDashboard';
import React from 'react';
interface ProgressSectionProps {
  overview: Overview;
}
export const ProgressSection: React.FC<ProgressSectionProps> = ({ overview }) => {
  const stats = [
    { 
      label: 'Completion Rate', 
      value: overview.completionRate, 
      icon: '🎯', 
      color: 'from-purple-500 to-pink-500', 
      lightColor: 'from-purple-50 to-pink-50' 
    },
    { 
      label: 'Attendance', 
      value: overview.attendanceRate, 
      icon: '📅', 
      color: 'from-green-500 to-emerald-500', 
      lightColor: 'from-green-50 to-emerald-50' 
    }
  ];
  const getMotivationText = (value: number) => {
    if (value >= 80) return '🌟 Great progress!';
    if (value >= 50) return '👍 Keep it up!';
    return '📈 Room to improve';
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`bg-gradient-to-br ${stat.lightColor} rounded-2xl p-8 border border-white shadow-sm hover:shadow-md transition-all`}
        >
          <div className="flex items-center justify-between mb-6">
            <span className="text-4xl">{stat.icon}</span>
            <h3 className="text-lg font-bold text-gray-800">{stat.label}</h3>
          </div>
          <div className="mb-4">
            <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}%
            </p>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500 rounded-full`} 
              style={{ width: `${stat.value}%` }} 
            />
          </div>
          <p className="text-xs text-gray-600 mt-3">
            {getMotivationText(stat.value)}
          </p>
        </div>
      ))}
    </div>
  );
};