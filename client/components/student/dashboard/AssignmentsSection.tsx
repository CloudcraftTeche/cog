import { AssignmentStats } from '@/hooks/useStudentDashboard';
import React from 'react';
interface AssignmentsSectionProps {
  stats: AssignmentStats;
}
export const AssignmentsSection: React.FC<AssignmentsSectionProps> = ({ stats }) => {
  const items = [
    { 
      label: 'Total', 
      value: stats.total, 
      icon: '📋', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Submitted', 
      value: stats.submitted, 
      icon: '✅', 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Pending', 
      value: stats.pending, 
      icon: '⏱️', 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
    { 
      label: 'Graded', 
      value: stats.graded, 
      icon: '⭐', 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    }
  ];
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-all">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>✏️</span> Assignments
      </h2>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className={`${item.bg} rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{item.icon}</span>
              <div className="text-right">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-gray-600 font-medium">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};