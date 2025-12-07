import React from 'react';
import { Users, BookOpen, FileText, MessageSquare } from 'lucide-react';

interface OverviewStatsProps {
  overview: {
    totalStudents: number;
    totalChapters: number;
    totalAssignments: number;
    pendingQueries: number;
  };
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ overview }) => {
  
  const stats = [
    {
      name: 'Total Students',
      value: overview.totalStudents,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconColor: 'text-blue-600',
      shadow: 'shadow-blue-100'
    },
    {
      name: 'Total Chapters',
      value: overview.totalChapters,
      icon: BookOpen,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconColor: 'text-green-600',
      shadow: 'shadow-green-100'
    },
    {
      name: 'Total Assignments',
      value: overview.totalAssignments,
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      iconColor: 'text-purple-600',
      shadow: 'shadow-purple-100'
    },
    {
      name: 'Pending Queries',
      value: overview.pendingQueries,
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      iconColor: 'text-orange-600',
      shadow: 'shadow-orange-100'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.name} 
            className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg ${stat.shadow} p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/50`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.name}</p>
                <p className={`mt-3 text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className={`mt-4 h-1 bg-gradient-to-r ${stat.gradient} rounded-full`}></div>
          </div>
        );
      })}
    </div>
  );
};