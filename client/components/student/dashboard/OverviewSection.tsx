import { Overview } from '@/hooks/useStudentDashboard';
import { useRouter } from 'next/navigation';
import React from 'react';
interface OverviewSectionProps {
  overview: Overview;
}
export const OverviewSection: React.FC<OverviewSectionProps> = ({ overview }) => {
  const router = useRouter();
  const cards = [
    { 
      label: 'Total Chapters', 
      value: overview.totalChapters, 
      icon: '📚', 
      gradient: 'from-blue-500 to-blue-600', 
      lightBg: 'bg-blue-50',
      link:'/dashboard/student/chapters'
    },
    { 
      label: 'Completed', 
      value: overview.completedChapters, 
      icon: '✅', 
      gradient: 'from-green-500 to-green-600', 
      lightBg: 'bg-green-50',
      link:'/dashboard/student/chapters?filter=completed'
    },
    { 
      label: 'In Progress', 
      value: overview.inProgressChapters, 
      icon: '⏳', 
      gradient: 'from-amber-500 to-amber-600', 
      lightBg: 'bg-amber-50' ,
      link:'/dashboard/student/chapters?filter=in-progress'
    },
    { 
      label: 'Locked', 
      value: overview.lockedChapters, 
      icon: '🔒', 
      gradient: 'from-slate-500 to-slate-600', 
      lightBg: 'bg-slate-50',
      link:'/dashboard/student/chapters?filter=locked'
    }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`${card.lightBg} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-white`}
          onClick={() => router.push(card.link)}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">{card.icon}</span>
            <div className={`bg-gradient-to-r ${card.gradient} text-white rounded-lg p-2`}>
              <span className="text-xs font-semibold">→</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1 font-medium">{card.label}</p>
          <p className="text-3xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
};