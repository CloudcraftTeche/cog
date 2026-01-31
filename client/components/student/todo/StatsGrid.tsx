// components/dashboard/StatsGrid.tsx
import React from 'react';
import type { Stats } from '@/types/student/todo.types';

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface StatsGridProps {
  stats: Stats;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const statItems: StatItem[] = [
    {
      label: 'Completion Rate',
      value: `${stats.completionPercentage}%`,
      icon: '📊',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      label: 'Completed Chapters',
      value: `${stats.completedChapters}/${stats.totalChapters}`,
      icon: '📚',
      color: 'from-green-400 to-emerald-500',
    },
    {
      label: 'Pending Assignments',
      value: stats.pendingAssignments,
      icon: '📝',
      color: 'from-purple-400 to-indigo-500',
    },
    {
      label: 'Submitted',
      value: `${stats.submittedAssignments}/${stats.totalAssignments}`,
      icon: '✅',
      color: 'from-yellow-400 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${item.color} rounded-xl p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{item.icon}</span>
            <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl font-bold">
                {typeof item.value === 'number'
                  ? item.value
                  : item.value.split('/')[0]}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium opacity-90">{item.label}</p>
          <p className="text-2xl font-bold mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
};