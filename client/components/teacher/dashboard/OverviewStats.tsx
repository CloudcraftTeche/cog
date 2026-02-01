"use client";
import React from 'react';
import { Users, BookOpen, FileText, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { OverviewStats as OverviewStatsType } from '@/types/teacher/teacherDashboard.types';

interface OverviewStatsProps {
  overview: OverviewStatsType;
}

interface StatConfig {
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgGradient: string;
  shadow: string;
  link: string;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ overview }) => {
  const router = useRouter();
  
  const stats: StatConfig[] = [
    {
      name: 'Total Students',
      value: overview.totalStudents ?? 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      shadow: 'shadow-blue-100',
      link: '/dashboard/teacher/students'
    },
    {
      name: 'Total Chapters',
      value: overview.totalChapters ?? 0,
      icon: BookOpen,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      shadow: 'shadow-green-100',
      link: '/dashboard/teacher/chapters'
    },
    {
      name: 'Total Assignments',
      value: overview.totalAssignments ?? 0,
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      shadow: 'shadow-purple-100',
      link: '/dashboard/teacher/assignments'
    },
    {
      name: 'Pending Queries',
      value: overview.pendingQueries ?? 0,
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      shadow: 'shadow-orange-100',
      link: '/dashboard/teacher/queries'
    },
  ];

  const handleStatClick = (link: string) => {
    router.push(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <button 
            key={stat.name} 
            className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg ${stat.shadow} p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-white/50 cursor-pointer text-left w-full`}
            onClick={() => handleStatClick(stat.link)}
            type="button"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {stat.name}
                </p>
                <p className={`mt-3 text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-2xl shadow-lg transform hover:rotate-12 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className={`mt-4 h-1 bg-gradient-to-r ${stat.gradient} rounded-full`}></div>
          </button>
        );
      })}
    </div>
  );
};